import * as React from 'react';
import { useImmerReducer } from 'use-immer';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { Gem, Stage, AgentAssignment } from '../types';
import { ImportedGemSchema } from '../schemas/gemSchema';

// --- STATE & ACTIONS ---
interface GemForgeState {
  originalGems: Gem[];
  draftGem: Gem | null;
  selectedGemId: string | null;
}

type Action =
  | { type: 'SELECT_GEM'; payload: string }
  | { type: 'UPDATE_DRAFT_PARTIAL'; payload: Partial<Gem> }
  | { type: 'UPDATE_DRAFT_FULL'; payload: Gem }
  | { type: 'CREATE_NEW' }
  | { type: 'CLONE_SELECTED' }
  | { type: 'DELETE_SELECTED' }
  | { type: 'SAVE_DRAFT' }
  | { type: 'IMPORT_GEM'; payload: Gem };

// --- REDUCER LOGIC with IMMER ---
const gemForgeReducer = (draft: GemForgeState, action: Action) => {
  const findSelectedOriginal = () => draft.originalGems.find(g => g.gem_id === draft.selectedGemId);

  switch (action.type) {
    case 'SELECT_GEM': {
      draft.selectedGemId = action.payload;
      const selected = draft.originalGems.find(g => g.gem_id === action.payload);
      draft.draftGem = selected ? JSON.parse(JSON.stringify(selected)) : null;
      break;
    }
    case 'UPDATE_DRAFT_PARTIAL': {
      if (draft.draftGem) {
        Object.assign(draft.draftGem, action.payload);
      }
      break;
    }
    case 'UPDATE_DRAFT_FULL': {
        draft.draftGem = action.payload;
        break;
    }
    case 'CREATE_NEW': {
      const newGem: Gem = {
        gem_id: uuidv4(),
        name: 'New Custom Gem',
        description: 'A new workflow.',
        stages: [],
        isDefault: false,
      };
      draft.originalGems.push(newGem);
      draft.selectedGemId = newGem.gem_id;
      draft.draftGem = newGem;
      break;
    }
    case 'SAVE_DRAFT': {
      if (!draft.draftGem) return;
      const index = draft.originalGems.findIndex(g => g.gem_id === draft.draftGem!.gem_id);
      if (index !== -1) {
        draft.originalGems[index] = draft.draftGem;
      }
      break;
    }
    case 'CLONE_SELECTED': {
      const originalToClone = findSelectedOriginal();
      if (!originalToClone) return;
      const clonedGem: Gem = {
        ...JSON.parse(JSON.stringify(originalToClone)),
        gem_id: uuidv4(),
        name: `${originalToClone.name} (Copy)`,
        isDefault: false,
      };
      draft.originalGems.push(clonedGem);
      draft.selectedGemId = clonedGem.gem_id;
      draft.draftGem = clonedGem;
      break;
    }
    case 'DELETE_SELECTED': {
        const gemToDelete = findSelectedOriginal();
        if (!gemToDelete || gemToDelete.isDefault) return;

        draft.originalGems = draft.originalGems.filter(g => g.gem_id !== draft.selectedGemId);
        const newSelectedId = draft.originalGems.length > 0 ? draft.originalGems[0].gem_id : null;
        draft.selectedGemId = newSelectedId;
        draft.draftGem = newSelectedId ? JSON.parse(JSON.stringify(draft.originalGems.find(g => g.gem_id === newSelectedId))) : null;
        break;
    }
    case 'IMPORT_GEM': {
        draft.originalGems.push(action.payload);
        draft.selectedGemId = action.payload.gem_id;
        draft.draftGem = action.payload;
        break;
    }
  }
};

// --- THE HOOK ---
export const useGemForge = (initialGems: Gem[], onGemsChange: (gems: Gem[]) => void) => {
  const initialState: GemForgeState = {
    originalGems: initialGems,
    selectedGemId: initialGems[0]?.gem_id || null,
    draftGem: initialGems[0] ? JSON.parse(JSON.stringify(initialGems[0])) : null,
  };

  const [state, dispatch] = useImmerReducer(gemForgeReducer, initialState);

  const selectedOriginalGem = React.useMemo(() => {
    return state.originalGems.find(g => g.gem_id === state.selectedGemId);
  }, [state.originalGems, state.selectedGemId]);

  const isDirty = React.useMemo(() => {
    if (!selectedOriginalGem || !state.draftGem) return false;
    return JSON.stringify(selectedOriginalGem) !== JSON.stringify(state.draftGem);
  }, [selectedOriginalGem, state.draftGem]);

  const handleSaveChanges = () => {
    if (!state.draftGem) return;
    dispatch({ type: 'SAVE_DRAFT' });
    const updatedGems = state.originalGems.map(g =>
        g.gem_id === state.draftGem?.gem_id ? state.draftGem : g
    );
    onGemsChange(updatedGems);
  };

  const handleFileImport = (file: File, callback: (error: Error | null) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target?.result as string);
            const validatedData = ImportedGemSchema.parse(data);

            const newGem: Gem = {
                ...(validatedData as Omit<Gem, 'gem_id' | 'isDefault' | 'stages'>),
                gem_id: uuidv4(),
                isDefault: false,
                stages: validatedData.stages.map((stage: Omit<Stage, 'stage_id' | 'parallel_agents'> & { parallel_agents: Omit<AgentAssignment, 'assignment_id'>[] }) => ({
                    ...stage,
                    stage_id: uuidv4(),
                    parallel_agents: stage.parallel_agents.map(agent => ({
                        ...agent,
                        assignment_id: uuidv4()
                    }))
                }))
            };
            dispatch({ type: 'IMPORT_GEM', payload: newGem });
            callback(null);
        } catch (err) {
            if (err instanceof z.ZodError) {
                // FIX: Changed from .errors to .issues to access validation error details. The .issues property is the canonical way to get error details from a ZodError instance.
                const firstError = err.issues[0];
                callback(new Error(`Validation failed on '${firstError.path.join('.')}': ${firstError.message}`));
            } else {
                callback(err instanceof Error ? err : new Error('An unknown error occurred during import.'));
            }
        }
    };
    reader.readAsText(file);
  };

  return {
    gems: state.originalGems,
    draftGem: state.draftGem,
    selectedGemId: state.selectedGemId,
    isDirty,
    selectGem: (id: string) => dispatch({ type: 'SELECT_GEM', payload: id }),
    updateDraft: (changes: Partial<Gem>) => dispatch({ type: 'UPDATE_DRAFT_PARTIAL', payload: changes }),
    setDraft: (gem: Gem) => dispatch({ type: 'UPDATE_DRAFT_FULL', payload: gem }),
    createNewGem: () => dispatch({ type: 'CREATE_NEW' }),
    cloneSelectedGem: () => dispatch({ type: 'CLONE_SELECTED' }),
    deleteSelectedGem: () => dispatch({ type: 'DELETE_SELECTED' }),
    saveChanges: handleSaveChanges,
    importGemFromFile: handleFileImport,
  };
};