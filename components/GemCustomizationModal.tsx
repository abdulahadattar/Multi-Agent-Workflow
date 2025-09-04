import React, { useState, useCallback } from 'react';
import { Gem, Persona, AgentAssignment } from '../types';
import { XIcon } from './icons/Icons';
import AgentEditorModal from './gem-editor/AgentEditorModal';
import { useGemForge } from '../hooks/useGemForge.tsx';
import { GemListPanel } from './gem-editor/GemListPanel';
import { GemEditorPanel } from './gem-editor/GemEditorPanel';

// We now need to import use-immer and zod types, but as they are CDN based, 
// we will assume they are globally available or handled by the import map.
// If this were a standard project, we'd add:
// import 'use-immer';
// import 'zod';

interface GemCustomizationModalProps {
  gems: Gem[];
  setGems: React.Dispatch<React.SetStateAction<Gem[]>>;
  allPersonas: Persona[];
  setAllPersonas: React.Dispatch<React.SetStateAction<Persona[]>>;
  onClose: () => void;
}

type AgentModalState = 
    | { type: 'none' }
    | { type: 'agent'; stageIndex: number; agentIndex?: number; availableArtifacts: string[]; };

const GemCustomizationModal: React.FC<GemCustomizationModalProps> = ({ gems, setGems, allPersonas, setAllPersonas, onClose }) => {
  const {
    gems: forgeGems,
    draftGem,
    selectedGemId,
    isDirty,
    selectGem,
    updateDraft,
    setDraft,
    createNewGem,
    cloneSelectedGem,
    deleteSelectedGem,
    saveChanges,
    importGemFromFile,
  } = useGemForge(gems, setGems);

  const [agentModalState, setAgentModalState] = useState<AgentModalState>({ type: 'none' });

  const handleSelectGem = (gemId: string) => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        selectGem(gemId);
      }
    } else {
      selectGem(gemId);
    }
  };

  const handleCloseRequest = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleDeleteRequest = () => {
    if (window.confirm(`Are you sure you want to delete "${draftGem?.name}"?`)) {
      deleteSelectedGem();
    }
  };

  const handleExport = () => {
      const gemToExport = gems.find(g => g.gem_id === selectedGemId);
      if (!gemToExport) return;
      
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(gemToExport, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `${gemToExport.name.replace(/\s+/g, '_')}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    importGemFromFile(file, (error) => {
        if (error) {
            alert(`Import Failed: ${error.message}`);
        }
    });
    event.target.value = '';
  };

  const openAgentEditor = useCallback((stageIndex: number, agentIndex?: number) => {
    if (!draftGem) return;
    const availableArtifacts = ['INITIAL_PROMPT'];
    for (let i = 0; i < stageIndex; i++) {
        draftGem.stages[i].parallel_agents.forEach(agent => {
            availableArtifacts.push(agent.output_artifact_name);
        });
    }
    setAgentModalState({ type: 'agent', stageIndex, agentIndex, availableArtifacts: [...new Set(availableArtifacts)] });
  }, [draftGem]);

  const handleAgentSave = (stageIndex: number, agent: AgentAssignment, agentIndex?: number) => {
    if (!draftGem) return;
    const newGem = JSON.parse(JSON.stringify(draftGem));
    const stageAgents = newGem.stages[stageIndex].parallel_agents;

    if (agentIndex !== undefined) {
        stageAgents[agentIndex] = agent;
    } else {
        stageAgents.push(agent);
    }
    setDraft(newGem);
    setAgentModalState({ type: 'none' });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
        <div className="bg-gem-onyx border border-gem-slate rounded-2xl shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
          <header className="flex items-center justify-between p-4 border-b border-gem-slate">
            <h2 className="text-2xl font-bold">Gem Forge</h2>
            <button onClick={handleCloseRequest} className="p-2 rounded-full hover:bg-gem-slate transition-colors"><XIcon className="h-6 w-6" /></button>
          </header>

          <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
            <GemListPanel
              gems={forgeGems}
              selectedGemId={selectedGemId}
              isDirty={isDirty}
              onSelect={handleSelectGem}
              onCreate={createNewGem}
              onImport={handleFileImport}
            />
            
            {draftGem ? (
              <GemEditorPanel
                draftGem={draftGem}
                gems={forgeGems}
                isDirty={isDirty}
                onDraftChange={updateDraft}
                onFullDraftChange={setDraft}
                onSave={saveChanges}
                onClone={cloneSelectedGem}
                onDelete={handleDeleteRequest}
                onExport={handleExport}
                onEditAgent={openAgentEditor}
                allPersonas={allPersonas}
                setAllPersonas={setAllPersonas}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gem-mist">Select a Gem or create a new one.</div>
            )}
          </main>
        </div>
      </div>
      
      {agentModalState.type === 'agent' && draftGem && (
        <AgentEditorModal
          isOpen={true}
          agent={agentModalState.agentIndex !== undefined ? draftGem.stages[agentModalState.stageIndex].parallel_agents[agentModalState.agentIndex] : undefined}
          personas={allPersonas}
          availableArtifacts={agentModalState.availableArtifacts}
          onClose={() => setAgentModalState({ type: 'none' })}
          onSave={(agent) => handleAgentSave(agentModalState.stageIndex, agent, agentModalState.agentIndex)}
        />
      )}
    </>
  );
};

export default GemCustomizationModal;