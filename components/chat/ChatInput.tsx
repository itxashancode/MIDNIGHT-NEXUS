"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, X, Paperclip, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImageAttachment {
  base64: string;
  mimeType: string;
  previewUrl: string;
}

interface ChatInputProps {
  onSend: (message: string, image?: ImageAttachment) => void;
  disabled: boolean;
  value?: string;
  onChange?: (val: string) => void;
  isVisible?: boolean;
}

const MAX_PX = 1024;
const WEBP_QUALITY = 0.82;

function resizeToWebP(file: File): Promise<ImageAttachment> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_PX / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL("image/webp", WEBP_QUALITY);
      const base64 = dataUrl.split(",")[1];
      resolve({ base64, mimeType: "image/webp", previewUrl: dataUrl });
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function ChatInput({ onSend, disabled, value = "", onChange, isVisible = true }: ChatInputProps) {
  const [internalInput, setInternalInput] = useState("");
  const input = onChange ? value : internalInput;
  const setInput = onChange ? onChange : setInternalInput;
  const [isFocused, setIsFocused] = useState(false);
  const [image, setImage] = useState<ImageAttachment | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const ghostRef = useRef<HTMLSpanElement>(null);
  const [cursorOffset, setCursorOffset] = useState(0);

  useEffect(() => {
    if (ghostRef.current) {
      setCursorOffset(ghostRef.current.offsetWidth);
    }
  }, [input]);

  const handleFile = async (file: File) => {
    setFileError(null);
    if (!file.type.startsWith("image/")) {
      setFileError("Please upload an image file.");
      return;
    }
    try {
      const attachment = await resizeToWebP(file);
      setImage(attachment);
    } catch {
      setFileError("Failed to process image.");
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          handleFile(file);
          e.preventDefault();
          break;
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || image) && !disabled) {
      onSend(input.trim(), image ?? undefined);
      setInput("");
      setImage(null);
    }
  };

  return (
    <motion.div 
      initial={false}
      animate={{ 
        y: isVisible ? 0 : 100,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none"
      }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      className="fixed bottom-0 left-0 w-full pb-6 pt-2 px-3 md:px-6 md:pb-8 z-[200] pointer-events-none" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="max-w-[760px] mx-auto pointer-events-auto">
        <AnimatePresence>
          {image && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="flex items-center gap-3 p-2 mb-4 nx-glass rounded-sm w-fit"
            >
              <div className="relative group">
                <img 
                  src={image.previewUrl} 
                  alt="attachment" 
                  className="w-12 h-12 rounded-sm object-cover border border-accent/20"
                />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center shadow-lg"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="pr-4">
                <p className="text-[10px] font-medium uppercase tracking-wider text-violet-400">Image Loaded</p>
                <p className="nx-body text-xs font-medium text-foreground">Ready for analysis</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="relative group">
          <motion.div
            animate={{
              borderColor: isFocused ? "var(--border)" : "transparent",
              boxShadow: isFocused ? "0 0 0 1px var(--border)" : "none"
            }}
            className="flex items-center gap-2 bg-background/30 backdrop-blur-md border border-white/[0.04] rounded-2xl p-2 pl-4 md:pl-6 pr-3 md:pr-4 transition-all shadow-sm"
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            <div className="flex-1 relative flex items-center overflow-hidden">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onPaste={handlePaste}
                disabled={disabled}
                placeholder="Message Midnight Nexus..."
                className="w-full bg-transparent border-none outline-none py-2.5 md:py-3 text-[15px] md:text-[17px] text-foreground/90 placeholder:text-muted/50 min-w-0 font-light"
              />
            </div>
            
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="p-2.5 text-muted/60 hover:text-foreground/80 transition-all"
              >
                <Paperclip className="w-4.5 h-4.5" />
              </button>
            </div>

            {input.trim() || image ? (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                type="submit"
                disabled={disabled}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-foreground/10 text-foreground hover:bg-foreground/20 transition-colors disabled:opacity-50 border border-white/[0.06]"
              >
                <Send className="w-4.5 h-4.5" />
              </motion.button>
            ) : null}
          </motion.div>
          
          {fileError && (
            <p className="absolute -top-6 left-6 text-[10px] text-red-400 font-medium uppercase tracking-widest">{fileError}</p>
          )}
        </form>
        
        <p className="text-center text-[10px] md:text-[11px] nx-meta mt-3 md:mt-4 px-2 text-muted/50">
          MIDNIGHT-NEXUS may display inaccurate info. <span className="hidden sm:inline">Double-check its responses.</span> <a href="#" className="nx-link underline">Your privacy</a>
        </p>
      </div>
    </motion.div>
  );
}
