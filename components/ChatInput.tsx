"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NextImage from "next/image";
import { Image as ImageIcon, X, Send } from "lucide-react";

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
      className="fixed bottom-0 left-0 w-full pb-8 px-6 z-[200] pointer-events-none"
    >
      <div className="max-w-[760px] mx-auto pointer-events-auto">
        <AnimatePresence>
          {image && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="flex items-center gap-3 p-2 mb-4 bg-background border border-border rounded-2xl shadow-xl w-fit"
            >
              <div className="relative group">
                <NextImage src={image.previewUrl} alt="attachment" width={48} height={48} className="h-12 w-12 rounded-xl object-cover border border-border" unoptimized />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center shadow-lg"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="pr-4">
                <p className="text-[11px] font-subheading font-bold uppercase tracking-widest text-muted">Image Loaded</p>
                <p className="text-xs font-body font-medium text-foreground">Ready for analysis</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="relative group">
          <motion.div
            animate={{
              borderColor: isFocused ? "hsl(var(--primary))" : "hsl(var(--border))",
            }}
            className="flex items-center gap-2 rounded-[28px] bg-background/95 backdrop-blur-xl border-2 p-2 pl-6 pr-4 transition-all shadow-sm"
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={disabled}
              placeholder="Enter a prompt here"
              className="flex-1 bg-transparent border-none outline-none py-3 text-[17px] font-body text-foreground placeholder:text-muted/60"
            />
            
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="p-3 text-muted hover:text-primary hover:bg-background rounded-full transition-all"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
            </div>

            {input.trim() || image ? (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                type="submit"
                disabled={disabled}
                className="p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            ) : null}
          </motion.div>
          
          {fileError && (
            <p className="absolute -top-6 left-6 text-[10px] text-destructive font-bold uppercase tracking-widest">{fileError}</p>
          )}
        </form>
        
        <p className="text-center text-[11px] text-muted mt-4 font-body font-medium">
          Dead Star may display inaccurate info, including about people, so double-check its responses. <a href="#" className="underline">Your privacy & Gemini Apps</a>
        </p>
      </div>
    </motion.div>
  );
}
