import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Gem, Stage, Persona } from '../../types';
import StageNode from './StageNode';
import { PlusIcon, ChevronDownIcon } from '../icons/Icons';

interface GemGraphEditorProps {
    gem: Gem;
    setGem: (gem: Gem) => void;
    allPersonas: Persona[];
    onEditAgent: (stageIndex: number, agentIndex?: number) => void;
}

const GemGraphEditor: React.FC<GemGraphEditorProps> = ({ gem, setGem, allPersonas, onEditAgent }) => {
    
    const handleUpdateStage = (stageIndex: number, updatedStage: Stage) => {
        const newStages = [...gem.stages];
        newStages[stageIndex] = updatedStage;
        setGem({ ...gem, stages: newStages });
    };

    const handleAddStage = () => {
        const newStage: Stage = {
            stage_id: uuidv4(),
            name: `New Stage ${gem.stages.length + 1}`,
            parallel_agents: [],
        };
        setGem({ ...gem, stages: [...gem.stages, newStage] });
    };

    const handleDeleteStage = (stageIndex: number) => {
        if (window.confirm(`Are you sure you want to delete stage "${gem.stages[stageIndex].name}"?`)) {
            const newStages = gem.stages.filter((_, index) => index !== stageIndex);
            setGem({ ...gem, stages: newStages });
        }
    };

    return (
        <div className="space-y-4">
            {gem.stages.map((stage, index) => (
                <div key={stage.stage_id} className="flex flex-col items-center">
                    <StageNode
                        stage={stage}
                        stageIndex={index}
                        personas={allPersonas}
                        onUpdate={(updatedStage) => handleUpdateStage(index, updatedStage)}
                        onDelete={() => handleDeleteStage(index)}
                        onEditAgent={(agentIndex) => onEditAgent(index, agentIndex)}
                        isDefault={gem.isDefault || false}
                    />
                    {index < gem.stages.length - 1 && (
                         <div className="flex justify-center text-gem-mist my-2">
                            <ChevronDownIcon className="h-8 w-8" />
                        </div>
                    )}
                </div>
            ))}

             {!gem.isDefault && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={handleAddStage}
                        className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gem-mist text-gem-mist hover:bg-gem-slate hover:border-solid hover:text-gem-sky rounded-lg transition-all"
                    >
                        <PlusIcon className="h-5 w-5"/>
                        Add Stage
                    </button>
                </div>
            )}
            {gem.stages.length === 0 && !gem.isDefault && (
                 <div className="text-center text-gem-mist p-8">
                    <p>This workflow has no stages.</p>
                    <p>Click "Add Stage" to begin building your workflow.</p>
                </div>
            )}
        </div>
    );
};

export default GemGraphEditor;