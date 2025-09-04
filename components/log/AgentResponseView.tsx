
import React, { useState } from 'react';
import { AgentResult } from '../../types';
import { ChevronRightIcon, ChevronDownIcon, CopyIcon, CheckIcon } from '../icons/Icons';

interface AgentResponseViewProps {
  result: AgentResult;
}

const AgentResponseView: React.FC<AgentResponseViewProps> = ({ result }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="ml-4 pl-4 border-l border-gem-slate">
      <div className="flex items-center justify-between text-sm cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
          <span className="font-semibold">{result.persona_name}</span>
          <span className="text-xs text-gem-mist">({result.model})</span>
        </div>
        <span className="text-xs text-gem-mist">{new Date(result.timestamp).toLocaleTimeString()}</span>
      </div>
      {isExpanded && (
        <div className="mt-2 p-3 bg-gem-onyx rounded-md relative text-sm text-gem-mist font-mono">
           <button onClick={handleCopy} className="absolute top-2 right-2 p-1 text-gem-mist hover:text-gem-sky transition-colors">
                {copied ? <CheckIcon className="h-4 w-4 text-gem-emerald" /> : <CopyIcon className="h-4 w-4" />}
            </button>
          <pre className="whitespace-pre-wrap">{result.output}</pre>
        </div>
      )}
    </div>
  );
}

export default AgentResponseView;
