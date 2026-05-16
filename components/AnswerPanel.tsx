"use client";

import { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Copy, Check, Share2 } from "lucide-react";
import { CodeTabs } from "@/components/animate-ui/components/animate/code-tabs";
import { ChartRenderer } from "@/components/ChartRenderer";

interface AnswerPanelProps {
  answer: string;
  isStreaming: boolean;
}

const AnswerPanel = memo(({ answer, isStreaming }: AnswerPanelProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group p-6 md:p-8 rounded-[32px] bg-muted/5 border border-border/50 backdrop-blur-sm shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none rounded-[32px]" />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_15px_rgba(48,145,255,0.5)]" />
          <div>
            <h4 className="text-[10px] md:text-[11px] font-subheading font-bold uppercase tracking-[0.2em] text-primary">Intelligence Output</h4>
            <div className="text-[9px] text-muted font-mono uppercase tracking-widest mt-0.5">Neural Synthesis Complete</div>
          </div>
        </div>
        
        {answer && !isStreaming && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-primary/20 hover:border-primary transition-all text-[10px] font-subheading font-bold uppercase tracking-widest text-muted hover:text-primary shadow-lg"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy Dossier"}
          </motion.button>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="prose prose-slate dark:prose-invert prose-lg max-w-none font-body prose-p:leading-relaxed prose-p:text-foreground prose-li:text-foreground prose-headings:text-foreground prose-strong:text-primary prose-strong:font-black prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-marker:text-primary"
      >
        <ReactMarkdown
          components={{
            a: ({ ...props }) => (
              <a
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mx-0.5 rounded-lg bg-primary/5 border border-primary/20 text-primary font-subheading font-bold text-xs no-underline hover:bg-primary/10 transition-all group"
              >
                <Share2 className="w-3 h-3 group-hover:rotate-12 transition-transform" />
                {props.children}
              </a>
            ),
            code({ node, className, children, ...props }) {
              const match = /language-([a-zA-Z0-9_-]+)/.exec(className || "");
              const isInline = !match && !className;
              
              if (isInline) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }

              const language = match ? match[1] : "text";
              const codeString = String(children).replace(/\n$/, "");

              // Handle Chart Blocks
              if (language === "chart-json" || language === "chart") {
                if (isStreaming) {
                  return (
                    <div className="p-6 rounded-2xl bg-muted/30 border border-border/50 flex flex-col gap-4 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-xs font-subheading font-bold uppercase tracking-widest text-muted">
                          Intercepting Data Stream...
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 w-full bg-muted/50 rounded" />
                        <div className="h-2 w-3/4 bg-muted/50 rounded" />
                      </div>
                      <pre className="text-[10px] font-mono text-muted-foreground/30 overflow-hidden max-h-20 mask-gradient-b select-none">
                        {codeString}
                      </pre>
                    </div>
                  );
                }

                try {
                  const chartData = JSON.parse(codeString);
                  return (
                    <div className="my-6">
                      <ChartRenderer 
                        type={chartData.type || 'bar'} 
                        data={chartData.data} 
                        title={chartData.title} 
                      />
                    </div>
                  );
                } catch (e) {
                  // If it's the final block but JSON is invalid, show a specialized error
                  return (
                    <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-400">
                      <div className="text-xs font-subheading font-bold uppercase tracking-widest mb-2">Data Corruption Detected</div>
                      <div className="text-[11px] font-mono opacity-80 mb-4">{String(e)}</div>
                      <CodeTabs
                        codes={{ [language]: codeString }}
                        lang="json"
                        isStreaming={false}
                      />
                    </div>
                  );
                }
              }

              return (
                <div className="not-prose my-4">
                  <CodeTabs
                    codes={{
                      [language]: codeString,
                    }}
                    lang={language}
                    isStreaming={isStreaming}
                  />
                </div>
              );
            },
            pre({ children }) {
              return <>{children}</>;
            }
          }}
        >
          {answer}
        </ReactMarkdown>
        {isStreaming && (
          <span className="inline-flex ml-1 items-center">
            <span className="w-1.5 h-4 bg-primary animate-[pulse_0.8s_infinite] rounded-sm" />
          </span>
        )}
      </motion.div>
    </div>
  );
});

AnswerPanel.displayName = "AnswerPanel";

export default AnswerPanel;
