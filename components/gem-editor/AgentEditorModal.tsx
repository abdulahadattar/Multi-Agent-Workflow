import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AgentAssignment, Persona } from '../../types';
import { AVAILABLE_MODELS } from '../../constants';
import { XIcon } from '../icons/Icons';

interface AgentEditorModalProps {
    isOpen: boolean;
    agent?: AgentAssignment;
    personas: Persona[];
    availableArtifacts: string[];
    onClose: () => void;
    onSave: (agent: AgentAssignment) => void;
}

const AgentEditorModal: React.FC<AgentEditorModalProps> = ({ isOpen, agent, personas, availableArtifacts, onClose, onSave }) => {
    const [currentAgent, setCurrentAgent] = useState<Partial<AgentAssignment>>({});
    const [systemPrompt, setSystemPrompt] = useState('');
    const [baseSystemPrompt, setBaseSystemPrompt] = useState('');
    const promptTextareaRef = useRef<HTMLTextAreaElement>(null);
    
    useEffect(() => {
        const initialAgent = agent ? { ...agent } : {
            assignment_id: uuidv4(),
            persona_ref: personas[0]?.persona_id || '',
            model: AVAILABLE_MODELS[0],
            prompt_template: '',
            output_artifact_name: 'Output',
        };
        setCurrentAgent(initialAgent);

        const persona = personas.find(p => p.persona_id === initialAgent.persona_ref);
        if (persona) {
            const basePrompt = persona.system_prompt;
            setBaseSystemPrompt(basePrompt);
            setSystemPrompt(initialAgent.system_prompt_override || basePrompt);
        }

    }, [agent, personas]);

    const handlePersonaChange = (personaId: string) => {
        setCurrentAgent({ ...currentAgent, persona_ref: personaId });
        const persona = personas.find(p => p.persona_id === personaId);
        if (persona) {
            setBaseSystemPrompt(persona.system_prompt);
            // Reset the prompt to the new persona's default
            setSystemPrompt(persona.system_prompt);
        }
    };

    const handleArtifactClick = (artifactName: string) => {
        const textarea = promptTextareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const newText = `${text.substring(0, start)}{${artifactName}}${text.substring(end)}`;
        
        setCurrentAgent({ ...currentAgent, prompt_template: newText });

        // Focus and move cursor after the inserted text
        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = start + artifactName.length + 2;
        }, 0);
    };

    const handleSave = () => {
        const trimmedOutputName = currentAgent.output_artifact_name?.trim();
        // Basic validation for required fields
        if (!currentAgent.persona_ref || !currentAgent.model || !trimmedOutputName) {
            alert("Please fill all required fields: Persona, Model, and Output Artifact Name.");
            return;
        }
        
        // --- ARTIFACT DEPENDENCY VALIDATION ---
        if (currentAgent.prompt_template) {
            const requiredArtifacts = [...currentAgent.prompt_template.matchAll(/\{(.+?)\}/g)].map(match => match[1].trim());
            const unavailableArtifacts = requiredArtifacts.filter(req => !availableArtifacts.includes(req));

            if (unavailableArtifacts.length > 0) {
                alert(`Error: The prompt template requires artifacts that are not available at this stage: \n\n- ${unavailableArtifacts.join('\n- ')}\n\nPlease remove or replace these artifacts before saving.`);
                return;
            }
        }
        
        const agentToSave = { ...currentAgent };
        // Sanitize the output artifact name
        agentToSave.output_artifact_name = trimmedOutputName.replace(/\s+/g, '_');

        // Only save the override if it's different from the base prompt
        if (systemPrompt !== baseSystemPrompt) {
            agentToSave.system_prompt_override = systemPrompt;
        } else {
            delete agentToSave.system_prompt_override;
        }
        
        // FIX: Corrected typo from 'agentTosave' to 'agentToSave'.
        onSave(agentToSave as AgentAssignment);
    };

    if (!isOpen) return null;

    const sanitizedOutputName = (currentAgent.output_artifact_name || '').trim().replace(/\s+/g, '_');

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[60]">
            <div className="bg-gem-slate border border-gem-mist rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <header className="flex items-center justify-between p-4 border-b border-gem-onyx">
                    <h3 className="text-lg font-bold">{agent ? 'Edit Agent' : 'Add New Agent'}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gem-onyx"><XIcon className="h-5 w-5"/></button>
                </header>
                <main className="p-6 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gem-mist mb-1">Persona</label>
                            <select
                                value={currentAgent.persona_ref}
                                onChange={(e) => handlePersonaChange(e.target.value)}
                                className="w-full bg-gem-onyx border border-gem-mist text-gem-sky rounded-md p-2 focus:ring-gem-sunstone focus:border-gem-sunstone"
                            >
                                {personas.map(p => <option key={p.persona_id} value={p.persona_id}>{p.name}</option>)}
                            </select>
                            {personas.length === 0 && <p className="text-xs text-gem-sunstone mt-1">No personas found. Create personas in the 'Personas' tab.</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gem-mist mb-1">Model</label>
                            <select
                                value={currentAgent.model}
                                onChange={(e) => setCurrentAgent({ ...currentAgent, model: e.target.value })}
                                className="w-full bg-gem-onyx border border-gem-mist text-gem-sky rounded-md p-2 focus:ring-gem-sunstone focus:border-gem-sunstone"
                            >
                                {AVAILABLE_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>
                     <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gem-mist">System Prompt (Behavior)</label>
                            <button onClick={() => setSystemPrompt(baseSystemPrompt)} className="text-xs text-gem-sunstone hover:underline">Reset to Default</button>
                        </div>
                        <textarea
                            rows={3}
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            className="w-full bg-gem-onyx border border-gem-mist text-gem-sky rounded-md p-2 text-xs focus:ring-gem-sunstone focus:border-gem-sunstone"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gem-mist mb-1">Prompt Template</label>
                        <textarea
                            ref={promptTextareaRef}
                            rows={8}
                            placeholder="e.g., Analyze the following document: {INITIAL_PROMPT}"
                            value={currentAgent.prompt_template}
                            onChange={(e) => setCurrentAgent({ ...currentAgent, prompt_template: e.target.value })}
                            className="w-full bg-gem-onyx border border-gem-mist text-gem-sky rounded-md p-2 font-mono text-xs focus:ring-gem-sunstone focus:border-gem-sunstone"
                        />
                        <div className="mt-1 text-xs text-gem-mist">
                            <span className="font-bold">Click to insert artifact:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {availableArtifacts.map(art => (
                                    <button 
                                        key={art} 
                                        onClick={() => handleArtifactClick(art)}
                                        className="bg-gem-onyx px-2 py-1 rounded text-gem-sunstone hover:bg-gem-sunstone hover:text-gem-onyx transition-colors font-mono text-xs"
                                    >
                                        {`{${art}}`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gem-mist mb-1">Output Artifact Name</label>
                        <input
                            type="text"
                            placeholder="e.g., Analysis Report"
                            value={currentAgent.output_artifact_name}
                            onChange={(e) => setCurrentAgent({ ...currentAgent, output_artifact_name: e.target.value })}
                            className="w-full bg-gem-onyx border border-gem-mist text-gem-sky rounded-md p-2 focus:ring-gem-sunstone focus:border-gem-sunstone"
                        />
                         <p className="text-xs text-gem-mist mt-1">
                            This name is used to reference this agent's output. Spaces will be converted to underscores.
                            <br/>
                            <span className="font-mono text-gem-sunstone bg-gem-onyx px-1 py-0.5 rounded-sm">
                                Final name: {sanitizedOutputName}
                            </span>
                         </p>
                    </div>
                </main>
                <footer className="p-4 border-t border-gem-onyx flex justify-end gap-3 flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 bg-gem-mist/20 hover:bg-gem-mist/40 text-gem-sky rounded-md">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-gem-emerald hover:bg-green-600 text-white rounded-md">Save Agent</button>
                </footer>
            </div>
        </div>
    );
};

export default AgentEditorModal;