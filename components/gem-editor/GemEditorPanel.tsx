import React, { useState } from 'react';
import { Gem, Persona } from '../../types';
import { TrashIcon, CloneIcon, DownloadIcon } from '../icons/Icons';
import GemGraphEditor from './GemGraphEditor';
import PersonaManager from './PersonaManager';

interface GemEditorPanelProps {
  draftGem: Gem;
  gems: Gem[];
  isDirty: boolean;
  onDraftChange: (changes: Partial<Gem>) => void;
  onFullDraftChange: (gem: Gem) => void;
  onSave: () => void;
  onClone: () => void;
  onDelete: () => void;
  onExport: () => void;
  onEditAgent: (stageIndex: number, agentIndex?: number) => void;
  allPersonas: Persona[];
  setAllPersonas: React.Dispatch<React.SetStateAction<Persona[]>>;
}

export const GemEditorPanel: React.FC<GemEditorPanelProps> = ({
  draftGem, gems, isDirty, onDraftChange, onFullDraftChange, onSave, onClone, onDelete, onExport, onEditAgent,
  allPersonas, setAllPersonas
}) => {
  const [activeTab, setActiveTab] = useState<'workflow' | 'personas'>('workflow');
  const isDefault = draftGem.isDefault ?? false;

  return (
    <section className="w-full md:w-3/4 flex flex-col flex-1 overflow-y-hidden">
      <div className="p-4 border-b border-gem-slate">
        <div className="flex items-start justify-between">
          <div>
            <input
              type="text"
              value={draftGem.name}
              onChange={(e) => onDraftChange({ name: e.target.value })}
              className="text-xl font-semibold bg-transparent border-b-2 border-transparent focus:border-gem-sunstone focus:outline-none disabled:text-gem-mist"
              disabled={isDefault}
            />
            <textarea
              value={draftGem.description}
              onChange={(e) => onDraftChange({ description: e.target.value })}
              className="text-sm text-gem-mist bg-transparent w-full resize-none focus:outline-none mt-1 disabled:text-gem-mist"
              rows={1}
              disabled={isDefault}
            />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={onClone} title="Clone Gem" className="p-2 hover:bg-gem-slate rounded-md"><CloneIcon className="h-5 w-5"/></button>
            <button onClick={onExport} title="Export Gem" className="p-2 hover:bg-gem-slate rounded-md"><DownloadIcon className="h-5 w-5"/></button>
            {!isDefault && <button onClick={onDelete} title="Delete Gem" className="p-2 text-gem-ruby hover:bg-gem-ruby/20 rounded-md"><TrashIcon className="h-5 w-5"/></button>}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex border-b border-gem-slate">
            <button onClick={() => setActiveTab('workflow')} className={`px-4 py-2 text-sm ${activeTab === 'workflow' ? 'border-b-2 border-gem-sunstone text-gem-sunstone' : 'text-gem-mist'}`}>Workflow</button>
            <button onClick={() => setActiveTab('personas')} className={`px-4 py-2 text-sm ${activeTab === 'personas' ? 'border-b-2 border-gem-sunstone text-gem-sunstone' : 'text-gem-mist'}`}>Personas</button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {isDefault && activeTab === 'workflow' && <p className="text-xs text-gem-sunstone mb-4 p-2 bg-gem-sunstone/10 rounded-md">Default Gems cannot be edited. Clone it to make changes.</p>}
        
        {activeTab === 'workflow' && <GemGraphEditor gem={draftGem} setGem={onFullDraftChange} allPersonas={allPersonas} onEditAgent={onEditAgent} />}
        {activeTab === 'personas' && <PersonaManager personas={allPersonas} setPersonas={setAllPersonas} gems={gems} />}
      </div>

      <div className="p-4 border-t border-gem-slate flex justify-end items-center gap-4">
        {isDirty && <span className="text-sm text-gem-sunstone">Unsaved changes</span>}
        <button onClick={onSave} disabled={isDefault || !isDirty}
          className="px-6 py-2 bg-gem-emerald hover:bg-green-600 text-white rounded-lg disabled:bg-gem-mist disabled:cursor-not-allowed transition-colors">
          Save Changes
        </button>
      </div>
    </section>
  );
};
