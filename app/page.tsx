"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import ChatInput from "@/components/ChatInput";
import ClickSpark from "@/components/ClickSpark";
import { useReasoningStore } from "@/store/useReasoningStore";

// UI Components (renamed/adapted for origin codebase)
import DashboardNav from "@/components/navigation/DashboardNav";
import ChatContainer from "@/components/chat/ChatContainer";
import ErrorBoundary from "@/components/chat/ErrorBoundary";
import Footer from "@/components/Footer";

export default function Home() {
  const {
    appState,
    currentMessage,
    userInput,
    setUserInput,
    currentImage,
    currentThoughts,
    handleSend,
    handleAnswer,
  } = useReasoningStore();

  const endRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  
  const isFooterInView = useInView(footerRef, {
    amount: 0.1,
  });

  const handleRetry = () => {
    if (appState === "error") {
      if (currentThoughts.length === 0) {
        handleSend(currentMessage, currentImage);
      } else {
        handleAnswer();
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-x-hidden">
      <ClickSpark
        sparkColor='#4f46e5'
        sparkSize={12}
        sparkRadius={20}
        sparkCount={10}
        duration={500}
      >
        <div className="star-mesh" />
        <div className="star-grid" />
        <DashboardNav />

        <main className="flex-1 flex flex-col pt-24 md:pt-32 pb-40 md:pb-48 min-h-screen">
            <ErrorBoundary>
              <ChatContainer 
                answerRef={answerRef}
                handleRetry={handleRetry}
              />
            </ErrorBoundary>
          <div ref={endRef} />
        </main>

        <ChatInput
          value={userInput}
          onChange={setUserInput}
          onSend={handleSend}
          disabled={appState === "streaming" || appState === "locked" || appState === "collapsed"}
          isVisible={!isFooterInView}
        />

        <Footer footerRef={footerRef} />
      </ClickSpark>
    </div>
  );
}
