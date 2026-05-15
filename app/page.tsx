"use client";

import { useRef, useEffect } from "react";
import { AnimatePresence, useInView } from "framer-motion";
import ChatInput from "@/components/ChatInput";
import ClickSpark from "@/components/ClickSpark";
import { useReasoningStore } from "@/store/useReasoningStore";

// Local Components
import DashboardNav from "@/components/navigation/DashboardNav";
import Hero from "@/components/landing/Hero";
import ChatContainer from "@/components/chat/ChatContainer";
import ErrorBoundary from "@/components/chat/ErrorBoundary";
import Footer from "@/components/Footer";

export default function Home() {
  const {
    appState,
    exchanges,
    currentMessage,
    userInput,
    setUserInput,
    currentImage,
    currentThoughts,
    setCurrentThoughts,
    currentAnswer,
    handleSend,
    handleAnswer,
    clearHistory,
    entropyData,
    protocol,
    setProtocol
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

  // Scroll to answer when it starts appearing
  useEffect(() => {
    if (appState === "collapsed") {
      setTimeout(() => {
        answerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [appState]);

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-x-hidden">
      <ClickSpark
        sparkColor='#fff'
        sparkSize={10}
        sparkRadius={15}
        sparkCount={8}
        duration={400}
      >
        <div className="star-mesh" />
        <div className="star-grid" />
        <DashboardNav />



        <main className="flex-1 flex flex-col pt-24 md:pt-32 pb-40 md:pb-48 min-h-screen">
          <AnimatePresence mode="wait">
            {appState === "idle" ? (
              <Hero setUserInput={setUserInput} onSend={handleSend} protocol={protocol} />
            ) : (


              <ErrorBoundary>
                <ChatContainer 
                  answerRef={answerRef}
                  handleRetry={handleRetry}
                />
              </ErrorBoundary>

            )}
          </AnimatePresence>
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
