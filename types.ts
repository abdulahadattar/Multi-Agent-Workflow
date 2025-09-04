export enum RunStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface Persona {
  persona_id: string;
  name: string;
  system_prompt: string;
}

export interface AgentAssignment {
  assignment_id: string;
  persona_ref: string;
  model: string;
  prompt_template: string; // e.g., "Analyze the following PRD: {PRD}"
  output_artifact_name: string; // e.g., "Analysis Report"
  system_prompt_override?: string; // Local override for the persona's system prompt
}

export interface Stage {
  stage_id: string;
  name: string;
  parallel_agents: AgentAssignment[];
}

export interface Gem {
  gem_id: string;
  name:string;
  description: string;
  stages: Stage[];
  isDefault?: boolean;
}

// Internal State Model for a Workflow Run
export interface AgentResult {
  assignment_id: string;
  persona_name: string;
  model: string;
  output: string;
  timestamp: Date;
  output_artifact_name: string;
}

export interface StageResult {
  stage_id: string;
  name: string;
  status: RunStatus;
  start_time: Date;
  end_time?: Date;
  agent_results: AgentResult[];
}

export interface WorkflowRun {
  run_id: string;
  gem_id_ref: string;
  status: RunStatus;
  start_time: Date;
  end_time?: Date;
  stage_results: StageResult[];
  final_output: string;
  initial_prompt: {
    text: string;
  };
  artifacts: Record<string, string>;
}

// For rich content rendering
export interface ContentBlock {
    type: 'markdown' | 'code' | 'latex';
    content: string;
    lang?: string; // for code
    inline?: boolean; // for latex
}