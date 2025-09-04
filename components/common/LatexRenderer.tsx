
import React, { useEffect, useRef } from 'react';

// Add declaration for CDN library
declare const katex: any;

interface LatexRendererProps {
    content: string;
    inline?: boolean;
}

const LatexRenderer: React.FC<LatexRendererProps> = ({ content, inline }) => {
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (ref.current && typeof katex !== 'undefined') {
            try {
                katex.render(content, ref.current, {
                    throwOnError: false,
                    displayMode: !inline,
                });
            } catch (e) {
                console.error("Katex error:", e);
                if (ref.current) {
                    ref.current.textContent = content;
                }
            }
        }
    }, [content, inline]);

    if (inline) {
        return <span ref={ref} />;
    }
    
    return <span ref={ref} className="my-2 block overflow-x-auto" />;
};

export default LatexRenderer;
