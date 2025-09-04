import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Gem, Persona } from '../../types';
import { ALL_PERSONAS } from '../../constants';
import { PlusIcon, TrashIcon, CheckIcon } from '../icons/Icons';

interface PersonaManagerProps {
    personas: Persona[];
    setPersonas: (personas: Persona[]) => void;
    gems: Gem[];
}

const PersonaManager: React.FC<PersonaManagerProps> = ({ personas, setPersonas, gems }) => {
    const [editingPersonaId, setEditingPersonaId] = useState<string | null>(null);
    const [currentPersona, setCurrentPersona] = useState<Partial<Persona>>({});

    const isPersonaInUse = (personaId: string) => {
        return gems.some(gem => 
            gem.stages.some(stage => 
                stage.parallel_agents.some(agent => agent.persona_ref === personaId)
            )
        );
    };

    const handleEditClick = (persona: Persona) => {
        setEditingPersonaId(persona.persona_id);
        setCurrentPersona({ ...persona });
    };

    const handleCancel = () => {
        setEditingPersonaId(null);
        setCurrentPersona({});
    };

    const handleSave = () => {
        if (!currentPersona.name?.trim()) {
            alert("Persona name cannot be empty.");
            return;
        }
        const newPersonas = personas.map(p => p.persona_id === editingPersonaId ? currentPersona as Persona : p);
        setPersonas(newPersonas);
        setEditingPersonaId(null);
        setCurrentPersona({});
    };
    
    const handleAddNew = () => {
        const newPersona: Persona = {
            persona_id: uuidv4(),
            name: "New Persona",
            system_prompt: "You are a helpful assistant."
        };
        setPersonas([...personas, newPersona]);
        handleEditClick(newPersona); // Immediately open for editing
    };

    const handleDelete = (personaId: string) => {
        if (isPersonaInUse(personaId)) {
            alert("This persona is currently in use by an agent and cannot be deleted.");
            return;
        }
        if (window.confirm("Are you sure you want to delete this persona? This cannot be undone.")) {
            setPersonas(personas.filter(p => p.persona_id !== personaId));
        }
    };

    const handleRestoreDefaults = () => {
        if (window.confirm("This will add any missing default personas to your library. It will not overwrite existing ones. Continue?")) {
            const existingPersonaNames = new Set(personas.map(p => p.name.toLowerCase()));
            const personasToAdd = ALL_PERSONAS.filter(dp => !existingPersonaNames.has(dp.name.toLowerCase()));
            if (personasToAdd.length > 0) {
                 setPersonas([...personas, ...personasToAdd]);
                 alert(`Added ${personasToAdd.length} default persona(s).`);
            } else {
                 alert("All default personas are already in your library.");
            }
        }
    };


    return (
        <div className="max-w-4xl mx-auto">
            <div className="p-4 bg-gem-slate/30 rounded-lg mb-6 text-sm text-gem-mist">
                <h3 className="font-bold text-gem-sky mb-2">Global Persona Library</h3>
                <p>These personas are available to all Gems. Editing a persona here will update its base behavior everywhere it's used, unless an agent has a local prompt override.</p>
            </div>
             <div className="mb-6 flex flex-wrap gap-2">
                 <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-gem-emerald hover:bg-green-600 text-white rounded-lg transition-colors">
                    <PlusIcon className="h-5 w-5"/> Create New Persona
                </button>
                <button onClick={handleRestoreDefaults} className="flex items-center gap-2 px-4 py-2 bg-gem-slate hover:bg-gem-mist hover:text-gem-onyx text-gem-sky rounded-lg transition-colors">
                    <CheckIcon className="h-5 w-5"/> Restore Defaults
                </button>
             </div>

            <div className="space-y-4">
                {personas.map(persona => (
                    editingPersonaId === persona.persona_id ? (
                        <div key={persona.persona_id} className="p-4 bg-gem-slate/80 rounded-lg border border-gem-sunstone">
                            <input
                                type="text"
                                value={currentPersona.name}
                                onChange={(e) => setCurrentPersona({ ...currentPersona, name: e.target.value })}
                                className="w-full bg-gem-onyx p-2 rounded-md mb-2 font-bold text-lg"
                            />
                            <textarea
                                value={currentPersona.system_prompt}
                                onChange={(e) => setCurrentPersona({ ...currentPersona, system_prompt: e.target.value })}
                                className="w-full bg-gem-onyx p-2 rounded-md font-mono text-sm"
                                rows={4}
                            />
                            <div className="mt-3 flex gap-2 justify-end">
                                <button onClick={handleCancel} className="px-3 py-1 bg-gem-mist/20 rounded-md text-sm">Cancel</button>
                                <button onClick={handleSave} className="px-3 py-1 bg-gem-emerald rounded-md text-white text-sm">Save</button>
                            </div>
                        </div>
                    ) : (
                        <div key={persona.persona_id} className="p-4 bg-gem-slate/50 rounded-lg group">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-lg text-gem-sky">{persona.name}</h4>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEditClick(persona)} className="text-sm px-3 py-1 bg-gem-onyx rounded-md hover:bg-gem-mist hover:text-gem-onyx">Edit</button>
                                    <button onClick={() => handleDelete(persona.persona_id)} title="Delete Persona" className="p-2 text-gem-ruby hover:bg-gem-ruby/20 rounded-md disabled:text-gem-mist disabled:hover:bg-transparent disabled:cursor-not-allowed" disabled={isPersonaInUse(persona.persona_id)}>
                                        <TrashIcon className="h-5 w-5"/>
                                    </button>
                                </div>
                            </div>
                             <p className="text-sm text-gem-mist mt-1">{persona.system_prompt}</p>
                             {isPersonaInUse(persona.persona_id) && <p className="text-xs text-gem-sunstone mt-2">In use by one or more Gems</p>}
                        </div>
                    )
                ))}
            </div>
             {personas.length === 0 && (
                <div className="text-center text-gem-mist p-8">
                    <p>Your persona library is empty.</p>
                    <p>Create a new persona or restore the defaults to begin.</p>
                </div>
             )}
        </div>
    );
};

export default PersonaManager;