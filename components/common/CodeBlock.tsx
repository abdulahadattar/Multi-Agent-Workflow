
import React, { useState, useEffect, useRef } from 'react';
import { CopyIcon, CheckIcon } from '../icons/Icons';

// Add declaration for CDN library
declare const hljs: any;

interface CodeBlockProps {
    language: string;
    code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
    const [copied, setCopied] = useState(false);
    const codeRef = useRef<HTMLElement>(null);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        if (codeRef.current && typeof hljs !== 'undefined') {
            hljs.highlightElement(codeRef.current);
        }
    }, [code, language]);

    return (
        <div className="bg-gem-onyx rounded-lg my-4 relative prose-pre:bg-transparent prose-pre:p-0">
            <div className="flex items-center justify-between px-4 py-2 bg-gem-slate/50 rounded-t-lg text-xs not-prose">
                <span className="text-gem-mist font-sans">{language || 'code'}</span>
                <button onClick={handleCopy} className="flex items-center gap-1.5 text-gem-mist hover:text-gem-sky transition-colors font-sans">
                    {copied ? <CheckIcon className="h-4 w-4 text-gem-emerald" /> : <CopyIcon className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy code'}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm">
                <code ref={codeRef} className={`language-${language}`}>
                    {code}
                </code>
            </pre>
        </div>
    );
};

export default CodeBlock;
