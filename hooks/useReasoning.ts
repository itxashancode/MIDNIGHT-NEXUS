"use client";

import { useState, useEffect, useRef } from "react";
import { Thought } from "@/components/ThoughtStream";
import { calculateInfluence } from "@/lib/diff";
import { ConversationTurn } from "@/lib/nexus";
import { ImageAttachment } from "@/components/ChatInput";
import { calculateShannonEntropy } from "@/lib/entropy";


export type AppState = "idle" | "streaming" | "locked" | "collapsed" | "answered" | "error";

export type Exchange = {
  id: string;
  userMessage: string;
  image?: ImageAttachment;
  thoughts: Thought[];
  answer: string;
  influenceScore: number;
  totalThoughts: number;
  changedThoughts: number;
};

export function useReasoning() {
  const [appState, setAppState] = useState<AppState>("idle");
  const isProcessing = useRef(false);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [userInput, setUserInput] = useState("");
  const [currentImage, setCurrentImage] = useState<ImageAttachment | undefined>();
  const [currentThoughts, setCurrentThoughts] = useState<Thought[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [entropyData, setEntropyData] = useState<number[]>([]);
  const [protocol, setProtocol] = useState<"cloud" | "local">("cloud");

  // Entropy Calculation helper
  const calculateEntropy = (text: string) => {
    return calculateShannonEntropy(text);
  };

  // Persistence
  useEffect(() => {
    const loadHistory = () => {
      const saved = localStorage.getItem("dead_star_history");
      if (saved) {
        try {
          setExchanges(JSON.parse(saved));
        } catch (e) {
          console.warn("Failed to load history cache", e);
        }
      }
    };

    if (typeof window !== "undefined") {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(loadHistory);
      } else {
        setTimeout(loadHistory, 200);
      }
    }
  }, []);

  useEffect(() => {
    if (exchanges.length > 0) {
      localStorage.setItem("dead_star_history", JSON.stringify(exchanges));
    }
  }, [exchanges]);

  const handleSend = async (message: string, image?: ImageAttachment) => {
    if (isProcessing.current) return;

    // Instant resolution for repeated queries (Caching)
    const saved = localStorage.getItem("dead_star_history");
    if (saved) {
      try {
        const parsed: Exchange[] = JSON.parse(saved);
        const cached = parsed.find(ex => ex.userMessage.trim().toLowerCase() === message.trim().toLowerCase());
        if (cached) {
          setExchanges(prev => [cached, ...prev.filter(ex => ex.id !== cached.id)]);
          setCurrentMessage(cached.userMessage);
          setCurrentImage(cached.image);
          setCurrentThoughts(cached.thoughts);
          setCurrentAnswer(cached.answer);
          setUserInput("");
          setAppState("answered");
          isProcessing.current = false;
          return;
        }
      } catch (e) {
        console.warn("Cache resolution failed", e);
      }
    }

    isProcessing.current = true;

    let updatedExchanges = exchanges;
    if (appState === "answered") {
      const changed =
        currentThoughts.filter(t => t.originalContent !== null && t.originalContent !== t.content).length +
        currentThoughts.filter(t => t.originalContent === "..." && t.content !== "...").length;
      const archived: Exchange = {
        id: Math.random().toString(),
        userMessage: currentMessage,
        image: currentImage,
        thoughts: currentThoughts,
        answer: currentAnswer,
        influenceScore: calculateInfluence(
          currentThoughts.map(t => t.originalContent ?? t.content),
          currentThoughts.map(t => t.content)
        ),
        totalThoughts: currentThoughts.length,
        changedThoughts: changed,
      };
      updatedExchanges = [...exchanges, archived];
      setExchanges(updatedExchanges);
    }

    setAppState("streaming");
    setCurrentMessage(message);
    setUserInput("");
    setCurrentImage(image);
    setCurrentThoughts([]);
    setCurrentAnswer("");

    const history: ConversationTurn[] = [];
    for (const ex of updatedExchanges) {
      const userParts: ConversationTurn["parts"] = [];
      if (ex.image) {
        userParts.push({ inlineData: { mimeType: ex.image.mimeType, data: ex.image.base64 } });
      }
      userParts.push({ text: ex.userMessage });
      history.push({ role: "user", parts: userParts });
      history.push({ role: "model", parts: [{ text: ex.answer }] });
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for reasoning phase
      const res = await fetch("/api/think", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, image, history, protocol }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Server error: ${res.status}`);
      }

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let rawText = "";

      const parseStreamingThoughts = (raw: string) => {
        const extracted: string[] = [];
        let inString = false;
        let currentThought = "";
        let escapeNext = false;
        for (let i = 0; i < raw.length; i++) {
          const char = raw[i];
          if (escapeNext) { currentThought += char; escapeNext = false; continue; }
          if (char === "\\") { escapeNext = true; continue; }
          if (char === '"') {
            if (inString) { extracted.push(currentThought); currentThought = ""; inString = false; }
            else { inString = true; }
          } else if (inString) { currentThought += char; }
        }
        if (inString) extracted.push(currentThought);
        return { extracted, isStreamingThought: inString };
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        rawText += decoder.decode(value, { stream: true });
        const { extracted, isStreamingThought } = parseStreamingThoughts(rawText);
        const cappedExtracted = extracted.slice(0, 6);
        
        // Update Entropy Graph
        setEntropyData(prev => [...prev.slice(-19), calculateEntropy(rawText)]);

        setCurrentThoughts(cappedExtracted.map((text, i) => ({

          id: `thought-${i}`,
          content: text,
          originalContent: null,
          isStreaming: i === cappedExtracted.length - 1 && isStreamingThought && extracted.length <= 6,
        })));
      }
      setCurrentThoughts(prev => prev.map(t => ({ ...t, isStreaming: false })));
      setAppState("locked");
    } catch (err) {
      console.error(err);
      setAppState("error");
    } finally {
      isProcessing.current = false;
    }
  };

  const handleAnswer = async () => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    setAppState("collapsed");

    const history: ConversationTurn[] = [];
    const relevantExchanges = exchanges.slice(-4);
    for (const ex of relevantExchanges) {
      const userParts: ConversationTurn["parts"] = [];
      if (ex.image) {
        userParts.push({ inlineData: { mimeType: ex.image.mimeType, data: ex.image.base64 } });
      }
      userParts.push({ text: ex.userMessage });
      history.push({ role: "user", parts: userParts });
      history.push({ role: "model", parts: [{ text: ex.answer }] });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s timeout for deep answer generation

    try {
      setCurrentAnswer("");
      const res = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentMessage,
          thoughts: currentThoughts.map(t => t.content),
          image: currentImage,
          history,
          protocol,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);


      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Server error: ${res.status}`);
      }

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let pendingAnswer = "";
      let lastUpdateTime = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        pendingAnswer += decoder.decode(value, { stream: true });

        const now = Date.now();
        if (now - lastUpdateTime > 20) {
          setCurrentAnswer(pendingAnswer);
          lastUpdateTime = now;
        }
      }
      setCurrentAnswer(pendingAnswer);
      setAppState("answered");
    } catch (err) {
      console.error(err);
      setAppState("error");
    } finally {
      isProcessing.current = false;
    }
  };

  const clearHistory = () => {
    if (confirm("Clear all intelligence history?")) {
      setExchanges([]);
      localStorage.removeItem("dead_star_history");
    }
  };

  return {
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
    setExchanges,
    entropyData,
    protocol,
    setProtocol,
  };
}

