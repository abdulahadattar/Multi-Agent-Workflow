
import React from 'react';
import { WorkflowRun } from '../types';
import { EyeIcon, EyeOffIcon } from './icons/Icons';
import StageView from './log/StageView';

interface ProcessLogProps {
  workflowRun: WorkflowRun | null;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

const ProcessLog: React.FC<ProcessLogProps> = ({ workflowRun, isVisible, onToggleVisibility }) => {
  if (!isVisible) {
    return (
      <div className="fixed top-1/2 -translate-y-1/2 right-0 z-10 md:static md:top-auto md:translate-y-0 md:h-full flex items-center justify-center bg-gem-onyx md:border-l md:border-gem-slate">
        <button onClick={onToggleVisibility} className="p-3 m-2 rounded-lg bg-gem-slate hover:bg-gem-mist hover:text-gem-onyx transition-colors" title="Show Process Log">
          <EyeIcon className="h-6 w-6" />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-30 md:hidden"
        onClick={onToggleVisibility}
        aria-hidden="true"
      ></div>
      
      <aside className={`fixed top-0 right-0 h-full w-11/12 max-w-md z-40 flex flex-col bg-gem-slate p-3 border-l border-gem-onyx shadow-lg transition-transform duration-300 ease-in-out md:static md:w-full md:max-w-md lg:max-w-lg md:h-auto md:transform-none md:transition-none ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold">Process Log</h3>
          <button onClick={onToggleVisibility} className="p-2 rounded-lg hover:bg-gem-onyx transition-colors" title="Hide Process Log">
              <EyeOffIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {workflowRun ? (
            workflowRun.stage_results.map((stageResult) => (
              <StageView key={stageResult.stage_id} result={stageResult} />
            ))
          ) : (
            <div className="text-center text-gem-mist p-8">
              <p>Run a workflow to see the process here.</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default ProcessLog;
