
import React, { useState } from 'react';
import { StageResult, RunStatus } from '../../types';
import { ChevronRightIcon, ChevronDownIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '../icons/Icons';
import AgentResponseView from './AgentResponseView';

interface StageViewProps {
  result: StageResult;
}

const StageView: React.FC<StageViewProps> = ({ result }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getStatusIcon = () => {
    switch (result.status) {
      case RunStatus.COMPLETED:
        return <CheckCircleIcon className="h-5 w-5 text-gem-emerald" />;
      case RunStatus.FAILED:
        return <XCircleIcon className="h-5 w-5 text-gem-ruby" />;
      case RunStatus.RUNNING:
        return <div className="animate-pulse-fast h-4 w-4 bg-gem-sunstone rounded-full"></div>;
      default:
        return <ClockIcon className="h-5 w-5 text-gem-mist" />;
    }
  };
  
  const elapsedTime = result.end_time && result.start_time ? `${((new Date(result.end_time).getTime() - new Date(result.start_time).getTime()) / 1000).toFixed(1)}s` : '';

  return (
    <div className="p-3 bg-gem-slate/50 rounded-lg">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDownIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
          {getStatusIcon()}
          <h4 className="font-bold">{result.name}</h4>
        </div>
        <span className="text-sm text-gem-mist">{elapsedTime}</span>
      </div>
      {isExpanded && (
        <div className="mt-3 space-y-2">
          {result.agent_results.map((agentResult) => (
            <AgentResponseView key={agentResult.assignment_id} result={agentResult} />
          ))}
           {result.status === RunStatus.RUNNING && result.agent_results.length === 0 && (
             <div className="flex items-center justify-center gap-2 p-2 text-sm text-gem-mist">
                 <div className="animate-spinner rounded-full h-4 w-4 border-b-2 border-gem-sunstone"></div>
                 <span>Agents working...</span>
             </div>
           )}
        </div>
      )}
    </div>
  );
}

export default StageView;
