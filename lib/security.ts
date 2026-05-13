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

export function validateImage(base64?: string, maxSizeMb: number = 5) {
  if (!base64) return true;
  
  // Base64 size estimation: (n * 3) / 4
  const sizeInBytes = (base64.length * 3) / 4;
  const sizeInMb = sizeInBytes / (1024 * 1024);
  
  if (sizeInMb > maxSizeMb) return false;

  // Verify magic number for WebP (WebP starts with RIFF -> UklGR in base64)
  if (!base64.startsWith("UklGR")) {
    return false;
  }
  
  return true;
}

/**
 * Sanitize user-provided message input
 */
export function sanitizeInput(content: string, maxLength: number = 1000): string {
  if (!content) return "";
  return content
    .replace(/[\x00-\x1F\x7F]/g, "") // Strip control characters
    .replace(/\[\/?[A-Z_]+\]/g, "")  // Remove [TAGS]
    .replace(/System:/gi, "S:")      // Prevent fake system instructions
    .slice(0, maxLength);            // Strict length limit
}

/**
 * Sanitize user-provided thoughts to prevent prompt injection escape sequences
 */
export function sanitizeThought(content: string): string {
  // Remove common escape patterns used to break out of system prompts
  return content
    .replace(/\[\/?[A-Z_]+\]/g, "") // Remove [TAGS]
    .replace(/#{2,}/g, "#")         // Reduce multiple hashtags
    .replace(/System:/gi, "S:")     // Prevent fake system instructions
    .slice(0, 500);                 // Strict length limit
}
