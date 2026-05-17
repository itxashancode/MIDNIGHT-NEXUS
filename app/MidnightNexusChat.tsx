"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Settings, History, MessageSquare } from "lucide-react";
import { useReasoningStore } from "@/store/useReasoningStore";
import ChatContainer from "@/components/chat/ChatContainer";
import ChatInput from "@/components/chat/ChatInput";
import NexusLogo from "@/components/NexusLogo";
import Timer from "@/components/Timer";

export default function MidnightNexusChat() {
  const { 
    appState, 
    handleSend, 
    setUserInput, 
    userInput, 
    currentImage, 
    setCurrentImage,
    currentThoughts,
    setCurrentThoughts,
    currentAnswer,
    setCurrentAnswer,
    entropyData,
    exchanges,
    currentMessage,
    isProcessing
  } = useReasoningStore();

  const [visibleCount, setVisibleCount] = useState(0);
  const [shieldFlash, setShieldFlash] = useState(false);
  const [zkProofs, setZkProofs] = useState(0);
  const chatAreaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleCount(1);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Update zkProofs from exchanges
  useEffect(() => {
    setZkProofs(exchanges.length);
  }, [exchanges]);

  const handleNewChat = () => {
    // In a real app, we'd probably clear the store here.
    // For now, just reset visible count for the effect.
    setVisibleCount(1);
  };

  const handleNavClick = () => {
    setShieldFlash(true);
    setTimeout(() => setShieldFlash(false), 300);
  };

  const navItems = [
    { icon: MessageSquare, label: "New Chat", action: handleNewChat },
    { icon: History, label: "History", action: handleNavClick },
    { icon: Lock, label: "Privacy Log", action: handleNavClick },
    { icon: Settings, label: "Settings", action: handleNavClick },
  ];

  return (
    <div className="nx-chat-container">
      {/* Background Layers */}
      <div className="nx-bg">
        <div className="nx-bg-void" />
        <div className="nx-bg-dots" />
        <div className="nx-bg-vignette" />
        <div className="nx-bg-noise" />
      </div>

      {/* Sidebar */}
      <aside className="nx-sidebar">
        <div className="nx-sidebar-brand">
          <NexusLogo />
        </div>

        <div className={`nx-shield ${shieldFlash ? "flash" : ""}`}>
          <div className="nx-shield-icon bg-violet-400" />
          <span className="text-[10px] font-medium tracking-wider text-muted-foreground">Secure Workspace</span>
        </div>

        <nav className="nx-sidebar-nav">
          {navItems.map((item, i) => (
            <div
              key={i}
              className="nx-nav-item"
              onClick={item.action}
              role="button"
              tabIndex={0}
            >
              <div className="nx-nav-icon">
                <item.icon size={16} />
              </div>
              {item.label}
            </div>
          ))}
        </nav>

        <div className="nx-sidebar-bottom">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground">Connected</span>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="nx-main">
        {/* Header */}
        <header className="nx-header border-b border-foreground/5 bg-background/50 backdrop-blur-sm">
          <div className="text-xs font-medium text-muted-foreground">
            Session: <span className="text-foreground">e8a42f</span>
          </div>
          <div className="nx-header-right">
            <div className="flex items-center gap-2 px-3 py-1 bg-foreground/5 rounded-full border border-foreground/5">
              <Lock size={11} className="text-violet-400" />
              <span className="text-[10px] font-medium text-foreground/70 uppercase tracking-wider">End-to-End Encrypted</span>
            </div>
            <div className="nx-connection-bars" role="status" aria-label="Connection strength">
              <div className="nx-conn-bar" />
              <div className="nx-conn-bar" />
              <div className="nx-conn-bar" />
            </div>
          </div>
        </header>

        {/* Chat Content */}
        <div className="nx-chat-viewport-wrapper">
          <ChatContainer 
            answerRef={chatAreaRef} 
            handleRetry={() => {}} 
          />
        </div>

        {/* Input Dock */}
        <div className="nx-input-dock">
          <ChatInput 
            onSend={(msg, img) => handleSend(msg, img)} 
            disabled={appState === 'streaming' || isProcessing} 
            value={userInput}
            onChange={setUserInput}
            isVisible={true}
          />
        </div>

        {/* Privacy Stats Footer */}
        <div className="flex items-center justify-center gap-6 py-4 border-t border-foreground/5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400/50" />
            <span>Data Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400/50" />
            <span>ZK Proofs: {zkProofs}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400/50" />
            <span>Latency: 43ms</span>
          </div>
        </div>
      </main>
    </div>
  );
}
