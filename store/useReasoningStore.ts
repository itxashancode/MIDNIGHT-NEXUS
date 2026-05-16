import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Thought } from '@/components/ThoughtStream';
import { ConversationTurn } from '@/lib/nexus';
import { ImageAttachment } from '@/components/ChatInput';
import { calculateShannonEntropy } from '@/lib/entropy';
import { calculateInfluence } from '@/lib/diff';

export type AppState = 'idle' | 'streaming' | 'locked' | 'collapsed' | 'answered' | 'error';

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

interface ReasoningState {
  appState: AppState;
  exchanges: Exchange[];
  currentMessage: string;
  userInput: string;
  currentImage: ImageAttachment | undefined;
  currentThoughts: Thought[];
  currentAnswer: string;
  entropyData: number[];
  protocol: 'cloud' | 'local';
  isProcessing: boolean;
  isPrivacyEnabled: boolean;
  isProving: boolean;

  // Actions
  setAppState: (state: AppState) => void;
  setUserInput: (input: string) => void;
  setCurrentMessage: (message: string) => void;
  setCurrentImage: (image: ImageAttachment | undefined) => void;
  setCurrentThoughts: (thoughts: Thought[] | ((prev: Thought[]) => Thought[])) => void;
  setCurrentAnswer: (answer: string) => void;
  setProtocol: (protocol: 'cloud' | 'local') => void;
  setPrivacyEnabled: (enabled: boolean) => void;
  setIsProving: (proving: boolean) => void;
  clearHistory: () => void;

  // Complex Actions
  handleSend: (message: string, image?: ImageAttachment) => Promise<void>;
  handleAnswer: () => Promise<void>;
}

export const useReasoningStore = create<ReasoningState>()(
  persist(
    (set, get) => ({
      appState: 'idle',
      exchanges: [],
      currentMessage: '',
      userInput: '',
      currentImage: undefined,
      currentThoughts: [],
      currentAnswer: '',
       entropyData: [],
       protocol: 'cloud',
       isProcessing: false,
       isPrivacyEnabled: false,
       isProving: false,

       // Actions
       setAppState: (appState) => set({ appState }),
       setUserInput: (userInput) => set({ userInput }),
       setCurrentMessage: (currentMessage) => set({ currentMessage }),
       setCurrentImage: (currentImage) => set({ currentImage }),
       setCurrentThoughts: (thoughts) => {
         if (typeof thoughts === 'function') {
           set((state) => ({ currentThoughts: thoughts(state.currentThoughts) }));
         } else {
           set({ currentThoughts: thoughts });
         }
       },
       setCurrentAnswer: (currentAnswer) => set({ currentAnswer }),
       setProtocol: (protocol) => set({ protocol }),
       setPrivacyEnabled: (isPrivacyEnabled) => set({ isPrivacyEnabled }),
       setIsProving: (isProving) => set({ isProving }),
       clearHistory: () => {

        if (confirm('Clear all intelligence history?')) {
          set({ exchanges: [] });
        }
      },

      handleSend: async (message: string, image?: ImageAttachment) => {
        const { isProcessing, exchanges, appState, currentThoughts, currentMessage, currentAnswer, currentImage, protocol } = get();
        if (isProcessing) return;

        // Cache resolution
        const cached = exchanges.find(ex => ex.userMessage.trim().toLowerCase() === message.trim().toLowerCase());
        if (cached) {
          set({
            exchanges: [cached, ...exchanges.filter(ex => ex.id !== cached.id)],
            currentMessage: cached.userMessage,
            currentImage: cached.image,
            currentThoughts: cached.thoughts,
            currentAnswer: cached.answer,
            userInput: '',
            appState: 'answered',
            isProcessing: false
          });
          return;
        }

        set({ isProcessing: true });

        let updatedExchanges = exchanges;
        if (appState === 'answered') {
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
          set({ exchanges: updatedExchanges });
        }

        set({
          appState: 'streaming',
          currentMessage: message,
          userInput: '',
          currentImage: image,
          currentThoughts: [],
          currentAnswer: '',
        });

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
          const timeoutId = setTimeout(() => controller.abort(), 25000);
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
            
            set((state) => ({
              entropyData: [...state.entropyData.slice(-19), calculateShannonEntropy(rawText)],
              currentThoughts: cappedExtracted.map((text, i) => ({
                id: `thought-${i}`,
                content: text,
                originalContent: null,
                isStreaming: i === cappedExtracted.length - 1 && isStreamingThought && extracted.length <= 6,
              }))
            }));
          }
          
          set((state) => ({
            currentThoughts: state.currentThoughts.map(t => ({ ...t, isStreaming: false })),
            appState: 'locked'
          }));
        } catch (err) {
          console.error(err);
          set({ appState: 'error' });
        } finally {
          set({ isProcessing: false });
        }
      },

      handleAnswer: async () => {
        const { isProcessing, exchanges, currentMessage, currentThoughts, currentImage, protocol } = get();
        if (isProcessing) return;
        
        set({ isProcessing: true, appState: 'collapsed' });

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
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
          set({ currentAnswer: "" });
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
              set({ currentAnswer: pendingAnswer });
              lastUpdateTime = now;
            }
          }
          set({ currentAnswer: pendingAnswer, appState: 'answered' });
        } catch (err) {
          console.error(err);
          set({ appState: 'error' });
        } finally {
          set({ isProcessing: false });
        }
      }
    }),
    {
      name: 'dead_star_history',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ exchanges: state.exchanges }), // Only persist history
    }
  )
);
