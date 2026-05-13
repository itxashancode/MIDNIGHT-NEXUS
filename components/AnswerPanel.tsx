"use client";

import { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Copy, Check, Share2 } from "lucide-react";

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
    <div className="relative group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
          <h4 className="text-xs font-subheading font-bold uppercase tracking-[0.2em] text-muted">Final Intelligence</h4>
        </div>
        
        {answer && !isStreaming && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-all text-[11px] font-subheading font-bold uppercase tracking-wider text-muted hover:text-primary"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy Intelligence"}
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
