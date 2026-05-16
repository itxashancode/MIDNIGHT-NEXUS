"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import NexusLogo from "@/components/NexusLogo";
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
      <Avatar className="w-10 h-10 border border-primary/20 shadow-[0_0_15px_rgba(48,145,255,0.15)] bg-primary/5 flex items-center justify-center">
        <User className="w-5 h-5 text-primary" />
      </Avatar>
      <div className="flex flex-col gap-3 flex-1 min-w-0">
        {image && (
          <div className="w-fit rounded-2xl overflow-hidden border border-border shadow-lg">
            <Image
              src={image.previewUrl}
              alt="User input"
              width={300}
              height={300}
              style={{ width: '100%', height: 'auto' }}
              className="max-w-[300px] rounded-2xl object-cover"
              unoptimized
            />
          </div>
        )}
        {message && (
          <div className="text-[17px] font-body font-medium text-foreground leading-relaxed break-words">
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
        <NexusLogo size={32} />
      </div>
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        {children}
      </div>
    </motion.div>
  );
});

AIRow.displayName = "AIRow";
