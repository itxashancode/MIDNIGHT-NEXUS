"use client";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Sparkles } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in ChatContainer:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-[760px] mx-auto w-full px-4 py-12">
          <div className="p-12 rounded-[2rem] bg-destructive/5 border border-destructive/20 flex flex-col items-center gap-6 text-center backdrop-blur-xl">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive animate-pulse">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-subheading font-bold text-foreground">Critical Neural Failure</h2>
              <p className="text-muted font-body mt-2 max-w-md">
                The reasoning stream encountered an unrecoverable parse error. 
                This can happen with highly complex multimodal inputs.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-foreground text-background rounded-full font-bold hover:scale-105 transition-all shadow-xl"
            >
              Restart Intelligence Matrix
            </button>
          </div>
        </div>
      );
    }

    return this.children;
  }
}

export default ErrorBoundary;
