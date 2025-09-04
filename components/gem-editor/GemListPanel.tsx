import React from 'react';
import { Gem } from '../../types';
import { PlusIcon, UploadIcon } from '../icons/Icons';

interface GemListPanelProps {
  gems: Gem[];
  selectedGemId: string | null;
  isDirty: boolean;
  onSelect: (gemId: string) => void;
  onCreate: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const GemListPanel: React.FC<GemListPanelProps> = ({ gems, selectedGemId, isDirty, onSelect, onCreate, onImport }) => {
  return (
    <aside className="w-full md:w-1/4 border-b md:border-b-0 md:border-r border-gem-slate p-3 flex flex-col h-52 md:h-full">
      <div className="flex items-center gap-2 mb-3">
        <button onClick={onCreate} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gem-emerald hover:bg-green-600 text-white rounded-md text-sm transition-colors">
          <PlusIcon className="h-5 w-5"/> New Gem
        </button>
        <label className="cursor-pointer flex items-center justify-center p-2 bg-gem-slate hover:bg-gem-mist hover:text-gem-onyx rounded-md transition-colors" title="Import Gem from JSON">
          <UploadIcon className="h-5 w-5" />
          <input type="file" accept=".json" className="hidden" onChange={onImport} />
        </label>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {gems.map(gem => (
          <div key={gem.gem_id} onClick={() => onSelect(gem.gem_id)}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedGemId === gem.gem_id ? 'bg-gem-sunstone text-gem-onyx' : 'hover:bg-gem-slate'}`}>
            <p className="font-bold">
              {gem.name}
              {gem.isDefault && <span className="text-xs font-normal opacity-70 ml-1">(Default)</span>}
              {isDirty && selectedGemId === gem.gem_id && <span className="text-gem-onyx ml-1 font-bold">*</span>}
            </p>
            <p className="text-xs opacity-80">{gem.description}</p>
          </div>
        ))}
      </div>
    </aside>
  );
};
