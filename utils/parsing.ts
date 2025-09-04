
import { ContentBlock } from '../types';

// Regex to match code blocks (```), block katex ($$), and inline katex ($)
const PARSING_REGEX = /(```(\w+)?\n([\s\S]*?)```)|(\$\$[\s\S]*?\$\$)|(\$[^$\n`]+\$)/g;

export const parseOutput = (text: string): ContentBlock[] => {
    const blocks: ContentBlock[] = [];
    let lastIndex = 0;
    let match;

    while ((match = PARSING_REGEX.exec(text)) !== null) {
        // Add preceding markdown content
        if (match.index > lastIndex) {
            blocks.push({ type: 'markdown', content: text.substring(lastIndex, match.index) });
        }
        
        if (match[1]) { // Code block
            blocks.push({ type: 'code', content: match[3].trim(), lang: match[2] || '' });
        } else if (match[4]) { // Block LaTeX
            blocks.push({ type: 'latex', content: match[4].slice(2, -2).trim(), inline: false });
        } else if (match[5]) { // Inline LaTeX
            blocks.push({ type: 'latex', content: match[5].slice(1, -1).trim(), inline: true });
        }
        lastIndex = PARSING_REGEX.lastIndex;
    }

    // Add any remaining markdown content
    if (lastIndex < text.length) {
        blocks.push({ type: 'markdown', content: text.substring(lastIndex) });
    }
    
    return blocks.filter(block => block.content.trim() !== '');
};
