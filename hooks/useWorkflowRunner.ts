import * as React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Gem, WorkflowRun, AgentResult, RunStatus, AgentAssignment, Persona } from '../types';
import { executeAgent } from '../services/geminiService';
import Logger from '../services/loggingService';

const FINAL_OUTPUT_ARTIFACT_NAME = 'Final_Answer';
const INITIAL_PROMPT_ARTIFACT_NAME = 'INITIAL_PROMPT';

export const useWorkflowRunner = (activeGem: Gem | undefined, allPersonas: Persona[]) => {
  const [workflowRun, setWorkflowRun] = React.useState<WorkflowRun | null>(null);
  const isRunningRef = React.useRef(false);

  const stopWorkflow = React.useCallback(() => {
    isRunningRef.current = false; // Signal to stop execution loop
    setWorkflowRun(prev => {
        if (prev && prev.status === RunStatus.RUNNING) {
            Logger.warn('workflow-cancelled', 'User cancelled the workflow.', { workflowRunId: prev.run_id });
            return { ...prev, status: RunStatus.CANCELLED, end_time: new Date() };
        }
        return prev;
    });
  }, []);
  
  const runWorkflow = React.useCallback(async (prompt: string, attachment: { data: string; mimeType: string } | null) => {
    if (!activeGem) return;
    isRunningRef.current = true;

    const runId = uuidv4();
    Logger.info('workflow-started', `Workflow started with Gem: "${activeGem.name}"`, { 
        workflowRunId: runId,
        gemId: activeGem.gem_id,
        promptLength: prompt.length,
        hasAttachment: !!attachment,
        attachmentMimeType: attachment?.mimeType,
    });

    const initialWorkflowRun: WorkflowRun = {
      run_id: runId,
      gem_id_ref: activeGem.gem_id,
      status: RunStatus.RUNNING,
      start_time: new Date(),
      stage_results: [],
      final_output: '',
      initial_prompt: { text: prompt },
      artifacts: {
        [INITIAL_PROMPT_ARTIFACT_NAME]: prompt,
      },
    };
    setWorkflowRun(initialWorkflowRun);

    // Use a ref to the current run state to avoid stale closures in the loop
    const workflowRunRef = { current: initialWorkflowRun };
    
    for (const stage of activeGem.stages) {
      if (!isRunningRef.current) break;

      const stageStartTime = new Date();
       Logger.info('stage-started', `Stage "${stage.name}" started.`, { workflowRunId: runId, stageId: stage.stage_id, stageName: stage.name });
      setWorkflowRun(() => {
        const currentRun = workflowRunRef.current;
        const newRun = {
          ...currentRun,
          stage_results: [...currentRun.stage_results, {
            stage_id: stage.stage_id,
            name: stage.name,
            status: RunStatus.RUNNING,
            start_time: stageStartTime,
            agent_results: [],
          }]
        };
        workflowRunRef.current = newRun;
        return newRun;
      });

      try {
        const agentPromises = stage.parallel_agents.map(async (assignment: AgentAssignment) => {
          if (!isRunningRef.current) return null;

          const basePersona = allPersonas.find(p => p.persona_id === assignment.persona_ref);
          if (!basePersona) throw new Error(`Persona not found: ${assignment.persona_ref}`);
          
          const effectivePersona: Persona = {
              ...basePersona,
              system_prompt: assignment.system_prompt_override || basePersona.system_prompt,
          };
          
          const currentArtifacts = workflowRunRef.current.artifacts;
          
          const usesInitialPrompt = assignment.prompt_template.includes(`{${INITIAL_PROMPT_ARTIFACT_NAME}}`);
          const imagePartForAgent = (usesInitialPrompt && attachment)
            ? { data: attachment.data, mimeType: attachment.mimeType }
            : null;

          const agentPrompt = assignment.prompt_template.replace(/\{(.+?)\}/g, (match, artifactNameKey) => {
              const trimmedKey = artifactNameKey.trim();
              if (currentArtifacts.hasOwnProperty(trimmedKey)) {
                  return currentArtifacts[trimmedKey];
              }
               Logger.error('artifact-not-found', `Required artifact not found for agent.`, {
                  workflowRunId: runId,
                  stageId: stage.stage_id,
                  agentAssignmentId: assignment.assignment_id,
                  personaName: basePersona.name,
                  missingArtifact: trimmedKey,
                  availableArtifacts: Object.keys(currentArtifacts),
              });
              throw new Error(`Required artifact "${trimmedKey}" not found for agent "${basePersona.name}"`);
          });

          const output = await executeAgent(effectivePersona, assignment.model, agentPrompt, imagePartForAgent);
          
          if (!isRunningRef.current) return null;

          return {
            assignment_id: assignment.assignment_id,
            persona_name: basePersona.name,
            model: assignment.model,
            output,
            timestamp: new Date(),
            output_artifact_name: assignment.output_artifact_name,
          };
        });

        const settledResults = await Promise.all(agentPromises);
        const agentResults: AgentResult[] = settledResults.filter((r): r is AgentResult => r !== null);

        if (!isRunningRef.current) break;

        const newArtifacts = agentResults.reduce((acc, result) => {
            acc[result.output_artifact_name] = result.output;
            return acc;
        }, {} as Record<string, string>);
        
        Logger.info('stage-completed', `Stage "${stage.name}" completed successfully.`, {
            workflowRunId: runId,
            stageId: stage.stage_id,
            durationMs: new Date().getTime() - stageStartTime.getTime(),
            agentsExecuted: agentResults.length,
            newArtifacts: Object.keys(newArtifacts),
        });

        setWorkflowRun(() => {
            const currentRun = workflowRunRef.current;
            const updatedRun = {
                ...currentRun,
                artifacts: { ...currentRun.artifacts, ...newArtifacts },
                stage_results: currentRun.stage_results.map(sr => 
                    sr.stage_id === stage.stage_id 
                    ? { ...sr, status: RunStatus.COMPLETED, agent_results: agentResults, end_time: new Date() } 
                    : sr
                ),
            };
            workflowRunRef.current = updatedRun;
            return updatedRun;
        });

      } catch (error) {
        isRunningRef.current = false;
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        Logger.error('stage-failed', `Error in stage "${stage.name}"`, {
            workflowRunId: runId,
            stageId: stage.stage_id,
            stageName: stage.name,
            error: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
        });

        setWorkflowRun(prev => prev ? { 
            ...prev, 
            status: RunStatus.FAILED, 
            end_time: new Date(),
            stage_results: prev.stage_results.map(sr => 
                sr.stage_id === stage.stage_id ? { ...sr, status: RunStatus.FAILED, end_time: new Date() } : sr
            )
        } : null);
        break; 
      }
    }

    setWorkflowRun(prev => {
        if (!prev) return null;
        if (prev.status === RunStatus.CANCELLED || prev.status === RunStatus.FAILED) return prev;

        const finalOutput = prev.artifacts[FINAL_OUTPUT_ARTIFACT_NAME] || 'Workflow completed, but no final output was generated.';
        Logger.info('workflow-completed', `Workflow completed successfully.`, {
            workflowRunId: prev.run_id,
            finalStatus: RunStatus.COMPLETED,
            totalDurationMs: new Date().getTime() - prev.start_time.getTime(),
        });
        return {
            ...prev,
            status: RunStatus.COMPLETED,
            end_time: new Date(),
            final_output: finalOutput,
        };
    });
    isRunningRef.current = false;
  }, [activeGem, allPersonas]);

  const isRunning = workflowRun?.status === RunStatus.RUNNING;

  return { workflowRun, runWorkflow, stopWorkflow, isRunning };
};