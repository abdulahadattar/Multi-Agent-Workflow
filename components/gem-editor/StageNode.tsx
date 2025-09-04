import React from 'react';
import { Stage, Persona, AgentAssignment } from '../../types';
import AgentNode from './AgentNode';
import { PlusIcon, TrashIcon } from '../icons/Icons';

interface StageNodeProps {
    stage: Stage;
    stageIndex: number;
    personas: Persona[];
    onUpdate: (stage: Stage) => void;
    onDelete: () => void;
    onEditAgent: (agentIndex?: number) => void;
    isDefault: boolean;
}

const StageNode: React.FC<StageNodeProps> = ({ stage, stageIndex, personas, onUpdate, onDelete, onEditAgent, isDefault }) => {
    
    const handleDeleteAgent = (agentIndex: number) => {
        if (window.confirm("Are you sure you want to delete this agent?")) {
            const newAgents = stage.parallel_agents.filter((_, index) => index !== agentIndex);
            onUpdate({ ...stage, parallel_agents: newAgents });
        }
    };
    
    return (
        <div className="bg-gem-slate/50 rounded-xl p-4 w-full max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gem-mist whitespace-nowrap">Stage {stageIndex + 1}:</span>
                    <input
                        type="text"
                        value={stage.name}
                        onChange={(e) => onUpdate({ ...stage, name: e.target.value })}
                        className="font-bold text-lg bg-transparent border-b-2 border-transparent focus:border-gem-sunstone focus:outline-none w-full"
                        disabled={isDefault}
                    />
                </div>
                 {!isDefault && (
                    <button onClick={onDelete} className="p-2 text-gem-mist hover:text-gem-ruby transition-colors">
                        <TrashIcon className="h-5 w-5"/>
                    </button>
                 )}
            </div>
            
            <div className="flex items-center gap-4 overflow-x-auto pb-3 -mx-4 px-4">
                {stage.parallel_agents.map((agent, index) => (
                    <AgentNode
                        key={agent.assignment_id}
                        agent={agent}
                        persona={personas.find(p => p.persona_id === agent.persona_ref)}
                        onEdit={() => onEditAgent(index)}
                        onDelete={() => handleDeleteAgent(index)}
                        isDefault={isDefault}
                    />
                ))}
                {!isDefault && (
                     <button
                        onClick={() => onEditAgent()}
                        className="flex-shrink-0 flex flex-col items-center justify-center w-32 h-36 border-2 border-dashed border-gem-mist text-gem-mist hover:bg-gem-slate hover:border-solid hover:text-gem-sky rounded-lg transition-all"
                     >
                        <PlusIcon className="h-6 w-6"/>
                        <span className="text-sm mt-1">Add Agent</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default StageNode;