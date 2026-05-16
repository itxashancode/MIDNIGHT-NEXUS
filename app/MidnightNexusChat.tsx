"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Paperclip,
  Send,
  MessageSquare,
  History,
  Lock,
  Settings,
  Activity,
  CheckCircle2,
} from "lucide-react";

/* =============================================================
   MIDNIGHT-NEXUS CHAT — Pure External CSS
   Zero inline styles. Zero inline CSS strings.
   ============================================================= */

const CipherText = ({
  text,
  onComplete,
}: {
  text: string;
  onComplete?: () => void }) => {
  const [display, setDisplay] = useState("");
  const chars =
    '!<>-_\\\\/[]{}—=+*^?#________ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((char: string, index: number) => {
            if (char === " ") return " ";
            if (index < iteration) return char;
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
        setDisplay(text);
        if (onComplete) onComplete();
      }
      iteration += 1 / 2;
    }, 20);
    return () => clearInterval(interval);
  }, [text]);

  return <span className="nx-body nx-cipher-active">{display}</span>;
};

const TypewriterText = ({
  text,
  onComplete,
}: {
  text: string;
  onComplete?: () => void }) => {
  const [display, setDisplay] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplay(text.slice(0, i));
      i++;
      if (i > text.length) {
        clearInterval(interval);
        setDone(true);
        if (onComplete) onComplete();
      }
    }, 20);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <>
      <span className="nx-label">{display}</span>
      {!done && <span className="nx-cursor-blink" />}
    </>
  );
};

const AiMessageBubble = ({
  text,
  onComplete,
}: {
  text: string;
  onComplete?: () => void }) => {
  const [done, setDone] = useState(false);
  return (
    <>
      <TypewriterText
        text={text}
        onComplete={() => {
          setDone(true);
          if (onComplete) onComplete();
        }}
      />
      {done && (
        <div className="nx-proof-badge">
          <CheckCircle2 size={10} strokeWidth={3} />
          ZK Verified
        </div>
      )}
    </>
  );
};

export default function MidnightNexusChat() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [shieldFlash, setShieldFlash] = useState(false);
  const [zkProofs, setZkProofs] = useState(0);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  const initialMessages = [
    {
      id: 0,
      role: "ai" as const,
      text: "NEXUS Core initialized. Zero-knowledge environment active. Secure session ready.",
    },
    {
      id: 1,
      role: "user" as const,
      text: "Can you analyze my health records and tell me if I qualify for the clinical trial?",
    },
    {
      id: 2,
      role: "ai" as const,
      text: "Analyzing your encrypted data using zero-knowledge proofs... Your records have been processed without any raw data leaving your device. Result: You meet 4 of 5 eligibility criteria. Criterion 3 (age bracket) requires manual verification. No personal information was exposed during this analysis.",
    },
    {
      id: 3,
      role: "user" as const,
      text: "What data did you actually see?",
    },
    {
      id: 4,
      role: "ai" as const,
      text: "Zero. I processed cryptographic proofs of your data — mathematical attestations that specific conditions are true — without ever accessing the underlying values. Think of it as proving you're over 18 without showing your ID. Your privacy is the protocol, not a promise.",
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleCount(1);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleComplete = (index: number) => {
    if (index === visibleCount - 1) {
      if (initialMessages[index].role === "ai") setZkProofs((p) => p + 1);

      if (visibleCount < initialMessages.length) {
        setTimeout(() => setVisibleCount((c) => c + 1), 600);
      }
    }
  };

  const handleScroll = () => {
    if (chatAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatAreaRef.current;
      setIsScrolledToBottom(scrollHeight - scrollTop - clientHeight < 20);
    }
  };

  useEffect(() => {
    if (chatAreaRef.current && isScrolledToBottom) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [visibleCount, inputValue, isScrolledToBottom]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setShieldFlash(true);
    setTimeout(() => setShieldFlash(false), 300);
    setInputValue("");
  };

  const handleNewChat = () => {
    setVisibleCount(0);
    setZkProofs(0);
    setTimeout(() => setVisibleCount(1), 800);
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
        <div className="nx-sidebar-brand">MIDNIGHT-NEXUS</div>

        <div className={`nx-shield ${shieldFlash ? "flash" : ""}`}>
          <div className="nx-shield-icon" />
          <span className="nx-shield-label">SHIELD ACTIVE</span>
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
          <Activity size={14} />
          <span>Powered by Midnight</span>
        </div>
      </aside>

      {/* Main Area */}
      <main className="nx-main">
        {/* Header */}
        <header className="nx-header">
          <div className="nx-session-id">
            PRIVATE AI SESSION #<span className="nx-session-highlight">E8A42F</span>
          </div>
          <div className="nx-header-right">
            <div className="nx-e2e-badge">
              <Lock size={11} />
              <span>END-TO-END ENCRYPTED</span>
            </div>
            <div className="nx-connection-bars" role="status" aria-label="Connection strength">
              <div className="nx-conn-bar" />
              <div className="nx-conn-bar" />
              <div className="nx-conn-bar" />
            </div>
          </div>
        </header>

        {/* Chat Scroll Area */}
        <div className="nx-chat-viewport-wrapper">
          <div className="nx-chat-viewport" ref={chatAreaRef} onScroll={handleScroll}>
            <div className="nx-msg-group">
              {initialMessages.slice(0, visibleCount).map((msg, idx) => (
                <div key={msg.id} className={`nx-msg-row ${msg.role === "user" ? "nx-msg-row-user" : ""}`}>
                  <div className="nx-msg-timestamp">
                    <span className="nx-msg-timestamp-label">
                      {msg.role === "user" ? "JUST NOW" : "SYSTEM"}
                    </span>
                  </div>
                  <div className={`nx-avatar ${msg.role === "user" ? "nx-avatar-user" : "nx-avatar-ai"}`}>
                    {msg.role === "user" ? "U" : "M"}
                  </div>
                  <div className={`nx-bubble ${msg.role === "user" ? "nx-bubble-user" : "nx-bubble-ai"}`}>
                    {msg.role === "user" ? (
                      <CipherText text={msg.text} onComplete={() => handleComplete(idx)} />
                    ) : (
                      <AiMessageBubble text={msg.text} onComplete={() => handleComplete(idx)} />
                    )}
                  </div>
                </div>
              ))}

              {/* Thinking / Loading State */}
              {visibleCount > 0 &&
                initialMessages[visibleCount - 1].role === "user" &&
                visibleCount < initialMessages.length && (
                  <div className="nx-msg-row nx-msg-row-ai">
                    <div className="nx-avatar nx-avatar-ai">M</div>
                    <div className="nx-bubble nx-bubble-ai">
                      <div className="nx-typing-indicator">
                        <div className="nx-typing-dot" />
                        <div className="nx-typing-dot" />
                        <div className="nx-typing-dot" />
                      </div>
                    </div>
                    <div className="nx-msg-timestamp">
                      <span className="nx-msg-timestamp-label">COMPUTING PROOF...</span>
                    </div>
                  </div>
                )}
            </div>
          </div>
          {!isScrolledToBottom && <div className="nx-scroll-fade" />}
        </div>

        {/* Input Area */}
        <div className="nx-input-dock">
          <div className="nx-input-wrapper">
            <div className="nx-input-underline" />
            <label htmlFor="nexus-input" className="nx-input-label">
              NEXUS_PROMPT
            </label>
            <Paperclip size={18} className="nx-input-icon" />
            <input
              id="nexus-input"
              type="text"
              className="nx-input-field"
              placeholder="Send an encrypted message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              className="nx-send-btn"
              onClick={handleSend}
              aria-label="Send encrypted message"
            >
              <div className="nx-send-btn-glow" />
              <div className="nx-send-btn-inner">
                <Send size={18} />
              </div>
            </button>
          </div>
          <div className="nx-input-meta">
            Messages encrypted via Midnight ZK Protocol · Zero data exposure
          </div>
        </div>

        {/* Privacy Stats Footer */}
        <div className="nx-privacy-stats">
          <div className="nx-stat">
            <div className="nx-stat-dot" />
            <span>0 BYTES EXPOSED</span>
          </div>
          <div className="nx-stat">
            <div className="nx-stat-dot" />
            <span>ZK PROOFS: {Math.max(4, zkProofs)}</span>
          </div>
          <div className="nx-stat">
            <div className="nx-stat-dot" />
            <span>LATENCY: 43ms</span>
          </div>
        </div>
      </main>
    </div>
  );
}