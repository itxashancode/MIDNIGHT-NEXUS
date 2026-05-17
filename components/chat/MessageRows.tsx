"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import GemmaLogo from "@/components/GemmaLogo";
import { ImageAttachment } from "@/components/ChatInput";

interface UserRowProps {
  message?: string;
  image?: ImageAttachment;
}

export const UserRow = memo(({ message, image }: UserRowProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-4"
    >
      <Avatar className="w-10 h-10 border border-accent/20 shadow-[0_0_15px_rgba(0,255,224,0.15)] bg-accent/5 flex items-center justify-center">
        <User className="w-5 h-5 text-accent" />
      </Avatar>
      <div className="flex flex-col gap-3 flex-1 min-w-0">
        {image && (
          <div className="w-fit rounded-sm overflow-hidden border border-accent/20 shadow-lg">
            <Image
              src={image.previewUrl} 
              alt="User input"
              width={300}
              height={300}
              style={{ width: '100%', height: 'auto' }}
              className="max-w-[300px] object-cover"
              unoptimized 
            />
          </div>
        )}
        {message && (
          <div className="nx-body text-[17px] font-medium leading-relaxed break-words">
            {message}
          </div>
        )}
      </div>
    </motion.div>
  );
});

UserRow.displayName = "UserRow";

interface AIRowProps {
  children: React.ReactNode;
}

export const AIRow = memo(({ children }: AIRowProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-start gap-4"
    >
       <div className="mt-1">
         <GemmaLogo size={32} />
       </div>
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        {children}
      </div>
    </motion.div>
  );
});

AIRow.displayName = "AIRow";
