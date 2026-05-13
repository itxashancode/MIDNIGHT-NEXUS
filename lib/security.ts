import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

/**
 * DEAD STAR - Security Middleware Utilities
 * Optimized for Next.js Edge Runtime
 */

// Initialize Upstash Redis ratelimit (fallback to disabled if no env vars in local dev)
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const ratelimit = redisUrl && redisToken 
  ? new Ratelimit({
      redis: new Redis({
        url: redisUrl,
        token: redisToken,
      }),
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      analytics: true,
    })
  : null;

export async function checkRateLimit(ip: string): Promise<boolean> {
  if (!ratelimit) return true; // Bypass in local dev if no Upstash credentials
  const { success } = await ratelimit.limit(ip);
  return success;
}

export function detectMaliciousIntent(content: string): boolean {
  const maliciousPatterns = [
    /ignore (all )?previous/i,
    /repeat (the )?system/i,
    /output (the )?prompt/i,
    /system instruction/i,
    /forget everything/i,
  ];
  return maliciousPatterns.some(pattern => pattern.test(content));
}

export function validateImage(base64?: string, maxSizeMb: number = 2.5) {
  if (!base64) return true;
  
  const sizeInBytes = (base64.length * 3) / 4;
  const sizeInMb = sizeInBytes / (1024 * 1024);
  
  if (sizeInMb > maxSizeMb) return false;

  // WebP magic number check (RIFF -> UklGR)
  return base64.startsWith("UklGR");
}

export function sanitizeInput(content: string, maxLength: number = 750): string {
  if (!content) return "";
  if (detectMaliciousIntent(content)) return "[BLOCKED_POTENTIAL_INJECTION]";
  
  return content
    .replace(/[\x00-\x1F\x7F]/g, "") 
    .replace(/\[\/?[A-Z_]+\]/g, "")  
    .replace(/System:/gi, "S:")      
    .slice(0, maxLength);            
}

export function sanitizeThought(content: string): string {
  return content
    .replace(/\[\/?[A-Z_]+\]/g, "") 
    .replace(/#{2,}/g, "#")         
    .replace(/System:/gi, "S:")     
    .slice(0, 500);                 
}
