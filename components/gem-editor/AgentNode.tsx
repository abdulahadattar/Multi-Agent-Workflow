import React from 'react';
import { AgentAssignment, Persona } from '../../types';
import { PencilIcon, TrashIcon } from '../icons/Icons';

interface AgentNodeProps {
    agent: AgentAssignment;
    persona: Persona | undefined;
    onEdit: () => void;
    onDelete: () => void;
    isDefault: boolean;
}

const getInitials = (name: string = '') => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const getColorForString = (str: string = '') => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
        'bg-red-500', 'bg-orange-500', 'bg-amber-500', 
        'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 
        'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 
        'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
    ];
    return colors[Math.abs(hash % colors.length)];
};


const AgentNode: React.FC<AgentNodeProps> = ({ agent, persona, onEdit, onDelete, isDefault }) => {
    const inputArtifacts = [...(agent.prompt_template || '').matchAll(/\{(.+?)\}/g)].map(m => m[1]);
    const initials = getInitials(persona?.name);
    const avatarColor = getColorForString(persona?.name);

    return (
        <div className="bg-gem-slate border border-gem-mist rounded-lg p-3 w-52 flex-shrink-0 text-left relative group flex flex-col justify-between min-h-36">
            <div>
                 <div className="flex items-center gap-2 mb-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${avatarColor}`}>
                        {initials}
                    </div>
                    <div>
                        <p className="font-bold text-sm leading-tight text-gem-sky" title={persona?.name || 'Unknown Persona'}>{persona?.name || 'Unknown Persona'}</p>
                        <p className="text-xs text-gem-mist">{agent.model}</p>
                    </div>
                </div>

                {inputArtifacts.length > 0 && (
                <p className="text-xs text-gem-mist mt-2 truncate" title={`Needs: {${inputArtifacts.join('}, {')}}`}>
                    Needs: <span className="font-mono text-sky-400">{`{${inputArtifacts[0]}}`}</span> {inputArtifacts.length > 1 ? `+${inputArtifacts.length -1}`: ''}
                </p>
                )}
            </div>

            <div className="mt-2">
                <div className="inline-block bg-gem-sunstone/20 text-gem-sunstone rounded-full px-2.5 py-1 text-sm font-medium" title={`-> ${agent.output_artifact_name}`}>
                    -&gt; {agent.output_artifact_name}
                </div>
            </div>

            {!isDefault && (
                 <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onEdit} className="p-1 hover:bg-gem-onyx rounded"><PencilIcon className="h-4 w-4 text-gem-mist hover:text-gem-sky"/></button>
                    <button onClick={onDelete} className="p-1 hover:bg-gem-onyx rounded"><TrashIcon className="h-4 w-4 text-gem-ruby hover:text-red-400"/></button>
                </div>
            )}
        </div>
    );
};

export default AgentNode;