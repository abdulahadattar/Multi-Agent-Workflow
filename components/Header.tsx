
import React from 'react';
import { Gem } from '../types';
import { SettingsIcon, DiamondIcon } from './icons/Icons';

interface HeaderProps {
  gems: Gem[];
  activeGemId: string;
  onGemChange: (gemId: string) => void;
  onCustomizeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ gems, activeGemId, onGemChange, onCustomizeClick }) => {
  const activeGem = gems.find(g => g.gem_id === activeGemId);

  return (
    <header className="flex items-center justify-between p-3 bg-gem-onyx border-b border-gem-slate shadow-md">
      <div className="flex items-center gap-3">
        <DiamondIcon className="h-8 w-8 text-gem-sunstone" />
        <h1 className="text-2xl font-bold text-gem-sky tracking-wider">Gems</h1>
      </div>
      <div className="flex-1 flex justify-center items-center gap-4 min-w-0 px-2">
        <select
          value={activeGemId}
          onChange={(e) => onGemChange(e.target.value)}
          className="bg-gem-slate border border-gem-mist text-gem-sky text-sm rounded-lg focus:ring-gem-sunstone focus:border-gem-sunstone block w-full max-w-[150px] sm:max-w-xs p-2.5"
        >
          {gems.map((gem) => (
            <option key={gem.gem_id} value={gem.gem_id}>
              {gem.name}
            </option>
          ))}
        </select>
        {activeGem && <p className="text-sm text-gem-mist hidden lg:block">{activeGem.description}</p>}
      </div>
      <button
        onClick={onCustomizeClick}
        className="flex items-center gap-2 px-4 py-2 bg-gem-slate hover:bg-gem-mist hover:text-gem-onyx rounded-lg transition-colors duration-200"
      >
        <SettingsIcon className="h-5 w-5" />
        <span className="hidden sm:inline">Customize</span>
      </button>
    </header>
  );
};

export default Header;
