"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Copy, Check, Share2, FileText, BarChart3, Settings } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "@/components/ui/sidebar";
import { CodeTabs } from "@/components/animate-ui/components/animate/code-tabs";
import ChartRenderer from "@/components/ChartRenderer";

interface AnswerPanelProps {
  answer: string;
  isStreaming: boolean;
}

const AnswerPanel = ({ answer, isStreaming }: AnswerPanelProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-full w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-sidebar-foreground" />
              <h3 className="text-sm font-semibold">Analysis Tools</h3>
            </div>
            <SidebarInput placeholder="Search insights..." className="mt-2" />
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="px-2">Navigation</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <BarChart3 className="h-4 w-4" />
                    <span>Metrics</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter className="border-t border-sidebar-border/50 px-4 py-3">
            <div className="text-xs text-sidebar-foreground/60">
              Intelligence Panel v1.0
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 overflow-hidden">
          <div className="relative group p-6 md:p-8 nx-glass-card rounded-sm shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/5 pointer-events-none rounded-sm" />
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-accent rounded-sm shadow-[0_0_15px_rgba(0,255,224,0.5)]" />
                <div>
                  <h4 className="nx-label text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Intelligence Output</h4>
                  <div className="nx-meta text-[9px] uppercase tracking-widest mt-0.5">Neural Synthesis Complete</div>
                </div>
              </div>
              
              {answer && !isStreaming && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 nx-glass-card text-[10px] font-bold uppercase tracking-widest text-muted hover:text-accent shadow-lg"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy Dossier"}
                </motion.button>
              )}
            </div>
            
            <div className="max-h-[400px] overflow-y-auto pr-2 rounded-sm">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prose prose-invert prose-lg max-w-none nx-body prose-p:leading-relaxed prose-p:text-foreground prose-li:text-foreground prose-headings:text-foreground prose-strong:text-accent prose-strong:font-black prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-marker:text-accent"
              >
                <ReactMarkdown
                  components={{
                    a: ({ ...props }) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mx-0.5 rounded-sm bg-accent/5 border border-accent/20 text-accent font-bold text-xs no-underline hover:bg-accent/10 transition-all group"
                      >
                        <Share2 className="w-3 h-3 group-hover:rotate-12 transition-transform" />
                        {props.children}
                      </a>
                    ),
                    code({ node, className, children, ...props }) {
                      const matchResult = /language-([a-zA-Z0-9_-]+)/.exec(className || "");
                      const isInline = !matchResult && !className;
                      
                      if (isInline) {
                        return (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      }

                      const language = matchResult ? matchResult[1] : "text";
                      const codeString = String(children).replace(/\n$/, "");

                      if (language === "chart-json" || language === "chart") {
                        if (isStreaming) {
                          return (
                            <div className="p-6 nx-glass-card flex flex-col gap-4 animate-pulse">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-accent" />
                                <span className="nx-label text-xs font-bold uppercase tracking-widest text-muted">
                                  Intercepting Data Stream...
                                </span>
                              </div>
                              <div className="space-y-2">
                                <div className="h-2 w-full bg-muted/50 rounded" />
                                <div className="h-2 w-3/4 bg-muted/50 rounded" />
                              </div>
                              <pre className="text-[10px] font-mono text-muted/30 overflow-hidden max-h-20 select-none">
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
                          return (
                            <div className="p-6 bg-red-500/5 border border-red-500/20 text-red-400">
                              <div className="text-xs nx-label font-bold uppercase tracking-widest mb-2">Data Corruption Detected</div>
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
                        <div className="my-4">
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
                    <span className="w-1.5 h-4 bg-accent animate-[pulse_0.8s_infinite] rounded-sm" />
                  </span>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AnswerPanel;