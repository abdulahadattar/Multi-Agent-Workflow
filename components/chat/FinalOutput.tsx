import React, { useState, useEffect } from "react";
import { parseOutput } from "../../utils/parsing";
import { ContentBlock } from "../../types";
import CodeBlock from "../common/CodeBlock";
import LatexRenderer from "../common/LatexRenderer";

// Add declarations for CDN libraries (globally available in window)
declare const marked: any;
declare const katex: any;

interface FinalOutputProps {
  output: string;
}

const FinalOutput: React.FC<FinalOutputProps> = ({ output }) => {
  const [parsedContent, setParsedContent] = useState<ContentBlock[]>([]);

  const isImage = output?.startsWith("data:image/");

  useEffect(() => {
    if (output && !isImage && typeof marked !== "undefined") {
      setParsedContent(parseOutput(output));
    }
  }, [output, isImage]);

  return (
    <div className="bg-gem-slate border-2 border-gem-emerald rounded-xl p-4 sm:p-6 shadow-2xl relative">
      {/* Header Badge */}
      <div className="absolute -top-4 left-4 bg-gem-emerald text-gem-onyx px-3 py-1 text-sm font-bold rounded-full uppercase tracking-wider">
        Final Output
      </div>

      {isImage ? (
        <div className="mt-4">
          <img
            src={output}
            alt="Generated output"
            className="rounded-lg max-w-full h-auto mx-auto"
          />
        </div>
      ) : (
        <div className="prose prose-invert max-w-none text-gem-sky">
          {parsedContent.map((block, index) => {
            switch (block.type) {
              case "code":
                return (
                  <CodeBlock
                    key={index}
                    language={block.lang ?? "plaintext"}
                    code={block.content}
                  />
                );

              case "latex":
                if (!block.inline) {
                  return (
                    <LatexRenderer
                      key={index}
                      content={block.content}
                      inline={false}
                    />
                  );
                }
                return null;

              case "markdown": {
                // Replace inline LaTeX with KaTeX-rendered HTML before parsing markdown
                const markdownWithMath = block.content.replace(
                  /(\$[^$\n`]+\$)/g,
                  (match: string) =>
                    katex.renderToString(match.slice(1, -1), {
                      throwOnError: false,
                      displayMode: false,
                    })
                );

                const markdownHtml = marked.parse(markdownWithMath, {
                  gfm: true,
                  breaks: true,
                });

                return (
                  <div
                    key={index}
                    dangerouslySetInnerHTML={{ __html: markdownHtml }}
                  />
                );
              }

              default:
                return null;
            }
          })}
        </div>
      )}
    </div>
  );
};

export default FinalOutput;
