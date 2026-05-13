/**
 * DEAD STAR - Security Middleware Utilities
 * Optimized for Next.js Edge Runtime
 */

// Simple in-memory cache for rate limiting (Note: This is per-instance in Edge)
// For production, use Upstash Redis or Vercel KV.
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export function rateLimit(ip: string, limit: number = 10, windowMs: number = 60000) {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, lastReset: now };

  if (now - record.lastReset > windowMs) {
    record.count = 0;
    record.lastReset = now;
  }

  record.count++;
  rateLimitMap.set(ip, record);

  return record.count <= limit;
}

export function validateImage(base64?: string, maxSizeMb: number = 5) {
  if (!base64) return true;
  
  // Base64 size estimation: (n * 3) / 4
  const sizeInBytes = (base64.length * 3) / 4;
  const sizeInMb = sizeInBytes / (1024 * 1024);
  
  return sizeInMb <= maxSizeMb;
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
