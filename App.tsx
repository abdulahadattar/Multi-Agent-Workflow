
import React, { useState, useEffect } from 'react';
import { Gem, Persona } from './types';
import { DEFAULT_GEMS, ALL_PERSONAS } from './constants';
import { useWorkflowRunner } from './hooks/useWorkflowRunner.tsx';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import ChatArea from './components/ChatArea';
import ProcessLog from './components/ProcessLog';
import GemCustomizationModal from './components/GemCustomizationModal';

const App: React.FC = () => {
  const [gems, setGems] = useState<Gem[]>([]);
  const [allPersonas, setAllPersonas] = useState<Persona[]>([]);
  const [activeGemId, setActiveGemId] = useState<string>('');
  const [isLogVisible, setIsLogVisible] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const activeGem = gems.find(g => g.gem_id === activeGemId);
  const { workflowRun, runWorkflow, stopWorkflow, isRunning } = useWorkflowRunner(activeGem, allPersonas);

  useEffect(() => {
    // Load gems and personas from local storage or use defaults.
    // This logic ensures default gems are always up-to-date with the code.
    const storedGemsRaw = localStorage.getItem('gems');
    if (storedGemsRaw) {
        const storedGems = JSON.parse(storedGemsRaw) as Gem[];
        // Filter out any gems that are marked as default, as we want to use the fresh ones from code.
        const customGems = storedGems.filter(g => !g.isDefault);
        // The final list is the fresh defaults from constants.ts plus any custom gems from storage.
        setGems([...DEFAULT_GEMS, ...customGems]);
    } else {
        setGems(DEFAULT_GEMS);
    }
    
    const storedPersonas = localStorage.getItem('personas');
    if (storedPersonas) {
        setAllPersonas(JSON.parse(storedPersonas));
    } else {
        setAllPersonas(ALL_PERSONAS);
    }
    
    setActiveGemId(DEFAULT_GEMS[0].gem_id);

    // On larger screens, the log is visible by default. On mobile, it's hidden.
    if (window.innerWidth < 768) {
      setIsLogVisible(false);
    }
  }, []);

  useEffect(() => {
    // Persist gems to local storage whenever they change
    if (gems.length > 0) {
      localStorage.setItem('gems', JSON.stringify(gems));
    }
  }, [gems]);

  useEffect(() => {
    // Persist personas to local storage whenever they change
    if (allPersonas.length > 0) {
      localStorage.setItem('personas', JSON.stringify(allPersonas));
    }
  }, [allPersonas]);


  // When a workflow starts, ensure the log is visible.
  useEffect(() => {
    if (isRunning) {
        setIsLogVisible(true);
    }
  }, [isRunning]);

  return (
    <div className="flex flex-col h-screen bg-gem-onyx font-sans">
      <Header
        gems={gems}
        activeGemId={activeGemId}
        onGemChange={setActiveGemId}
        onCustomizeClick={() => setIsModalOpen(true)}
      />
      <main className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex flex-col p-2 sm:p-4 gap-4">
          <ChatArea workflowRun={workflowRun} />
          <PromptInput
            onRunWorkflow={runWorkflow}
            onStopWorkflow={stopWorkflow}
            isRunning={isRunning}
          />
        </div>
        <ProcessLog
          workflowRun={workflowRun}
          isVisible={isLogVisible}
          onToggleVisibility={() => setIsLogVisible(!isLogVisible)}
        />
      </main>
      {isModalOpen && (
        <GemCustomizationModal
          gems={gems}
          setGems={setGems}
          allPersonas={allPersonas}
          setAllPersonas={setAllPersonas}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;