
import React, { useState, useRef } from 'react';
import { SendIcon, StopIcon, PaperclipIcon, XCircleIcon, DocumentIcon } from './icons/Icons';

interface PromptInputProps {
  onRunWorkflow: (prompt: string, attachment: { data: string; mimeType: string } | null) => void;
  onStopWorkflow: () => void;
  isRunning: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onRunWorkflow, onStopWorkflow, isRunning }) => {
  const [prompt, setPrompt] = useState('');
  const [attachment, setAttachment] = useState<{ dataUrl: string; data: string; mimeType: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            setAttachment({
                dataUrl,
                data: dataUrl.split(',')[1], // Base64 data
                mimeType: file.type,
                name: file.name,
            });
        };
        reader.readAsDataURL(file);
    }
    // Reset file input to allow re-selecting the same file
    if (e.target) e.target.value = '';
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
  };

  const handleSend = () => {
    if ((prompt.trim() || attachment) && !isRunning) {
      onRunWorkflow(prompt, attachment ? { data: attachment.data, mimeType: attachment.mimeType } : null);
      setPrompt('');
      setAttachment(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const canSend = (prompt.trim() !== '' || attachment !== null) && !isRunning;

  return (
    <div className="bg-gem-onyx p-2">
      {attachment && (
        <div className="mx-2 mb-2 p-2 bg-gem-slate rounded-lg flex items-center justify-between animate-pulse-fast animation-once">
            <div className="flex items-center gap-3 overflow-hidden">
                 {attachment.mimeType.startsWith('image/') ? (
                    <img src={attachment.dataUrl} alt="Attachment preview" className="h-10 w-10 rounded object-cover" />
                ) : (
                    <div className="flex-shrink-0 h-10 w-10 bg-gem-ruby/80 rounded flex items-center justify-center">
                        <DocumentIcon className="h-6 w-6 text-gem-sky" />
                    </div>
                )}
                <span className="text-sm text-gem-mist truncate">{attachment.name}</span>
            </div>
            <button onClick={handleRemoveAttachment} disabled={isRunning} className="p-1">
                <XCircleIcon className="h-6 w-6 text-gem-mist hover:text-gem-sky transition-colors"/>
            </button>
        </div>
      )}
      <div className="relative flex items-center bg-gem-slate rounded-xl shadow-inner">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,application/pdf" className="hidden" />
        <button 
            onClick={() => fileInputRef.current?.click()} 
            className="p-3 text-gem-mist hover:text-gem-sky transition-colors disabled:text-gem-mist/50 disabled:cursor-not-allowed"
            disabled={isRunning || !!attachment}
            title={attachment ? "Remove the current attachment to add a new one" : "Attach an image or PDF"}
        >
          <PaperclipIcon className="h-6 w-6" />
        </button>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your prompt here, or attach an image or PDF..."
          rows={1}
          className="flex-1 bg-transparent p-3 text-gem-sky placeholder-gem-mist resize-none focus:outline-none max-h-48"
          disabled={isRunning}
        />
        <button
          onClick={isRunning ? onStopWorkflow : handleSend}
          className={`m-2 p-3 rounded-lg transition-all duration-200 ${
            isRunning 
              ? 'bg-gem-ruby text-white hover:bg-red-700' 
              : 'bg-gem-emerald text-white hover:bg-green-700 disabled:bg-gem-slate disabled:hover:bg-gem-slate'
          }`}
          disabled={!canSend}
        >
          {isRunning ? <StopIcon className="h-6 w-6" /> : <SendIcon className="h-6 w-6" />}
        </button>
      </div>
    </div>
  );
};

export default PromptInput;