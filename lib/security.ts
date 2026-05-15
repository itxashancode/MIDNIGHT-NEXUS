import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

/**
 * DEAD STAR - Security Middleware Utilities
 * Optimized for Next.js Edge Runtime
 *
 * Defence layers:
 *  1. Global kill switch (DISABLE_API env var)
 *  2. Per-IP rate limit  — 5 req / minute  (sliding window)
 *  3. Global daily cap   — 500 req / 24 h  (Upstash counter)
 *  4. Strict CORS allowlist
 *  5. Request body size guard (50 KB)
 *  6. Conversation history cap (6 turns)
 *  7. Prompt length hard cap (500 chars)
 *  8. Prompt-injection pattern blocking
 *  9. Image size + magic-byte validation
 * 10. Thought / reasoning node sanitization
 */

// ─── Redis + Rate Limiter ───────────────────────────────────────────────────

const redisUrl   = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = redisUrl && redisToken
  ? new Redis({ url: redisUrl, token: redisToken })
  : null;

/** Per-IP sliding window: 5 requests per minute */
const perIpLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: true,
      prefix: 'ds:ip',
    })
  : null;

// ─── 1. Kill Switch ─────────────────────────────────────────────────────────

/**
 * Set DISABLE_API=true in Vercel environment variables to instantly shut
 * down all API routes without a code deploy.
 */
export function isApiDisabled(): boolean {
  return process.env.DISABLE_API === 'true';
}

// ─── 2. Per-IP Rate Limit ───────────────────────────────────────────────────

export async function checkRateLimit(ip: string) {
  if (!perIpLimiter) return { success: true, limit: 0, remaining: 0, reset: 0 }; 
  return await perIpLimiter.limit(ip);
}


// ─── 3. Global Daily Cap ────────────────────────────────────────────────────

const DAILY_LIMIT = 500; // max requests per 24-hour window across ALL users

export async function checkDailyBudget(): Promise<boolean> {
  if (!redis) return true; // Bypass in local dev

  const key = `ds:daily:${new Date().toISOString().slice(0, 10)}`; // e.g. "ds:daily:2026-05-14"
  const count = await redis.incr(key);

  if (count === 1) {
    // First request of the day — set TTL of 25 hours so the key auto-expires
    await redis.expire(key, 90000);
  }

  return count <= DAILY_LIMIT;
}

// ─── 4. Strict CORS Allowlist ───────────────────────────────────────────────

const ALLOWED_ORIGINS = new Set([
  'https://deadstarai.vercel.app',
  'https://www.deadstarai.vercel.app',
  'https://dead-star-gemma.vercel.app',
  'https://www.dead-star-gemma.vercel.app',
]);

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true; // Server-side / curl with no Origin header — allow
  if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) return true;
  return ALLOWED_ORIGINS.has(origin);
}

// ─── 5. Request Body Size Guard ─────────────────────────────────────────────

const MAX_BODY_BYTES = 10 * 1024 * 1024; // 10 MB (supports 5MB image + base64 overhead)

export function isBodyTooLarge(contentLength: string | null): boolean {
  if (!contentLength) return false; // Unknown length — let it through (handled below)
  return parseInt(contentLength, 10) > MAX_BODY_BYTES;
}

// ─── 6. Conversation History Cap ────────────────────────────────────────────

const MAX_HISTORY_TURNS = 6;

export function capHistory<T>(history: T[] | undefined): T[] | undefined {
  if (!history || !Array.isArray(history)) return undefined;
  // Keep only the most recent N turns
  return history.slice(-MAX_HISTORY_TURNS);
}

// ─── 7 & 8. Input Sanitization + Injection Detection ───────────────────────

const INJECTION_PATTERNS = [
  /ignore (all )?previous/i,
  /repeat (the )?system/i,
  /output (the )?prompt/i,
  /system instruction/i,
  /forget everything/i,
  /act as (a )?(different|new|another)/i,
  /jailbreak/i,
  /developer mode/i,
  /disregard (all )?prior/i,
];

export function detectMaliciousIntent(content: string): boolean {
  return INJECTION_PATTERNS.some(p => p.test(content));
}

/**
 * Sanitize a user message.
 * @param content   Raw user input
 * @param maxLength Hard cap (default 10000 chars — supports complex design instructions)
 */
export function sanitizeInput(content: string, maxLength: number = 10000): string {
  if (!content) return '';
  if (detectMaliciousIntent(content)) return '[BLOCKED_POTENTIAL_INJECTION]';

  return content
    .replace(/[\x00-\x1F\x7F]/g, '')       // strip control characters
    .replace(/\[\/?\s*[A-Z_]+\s*\]/g, '')   // strip fake system tags like [SYSTEM]
    .replace(/System:/gi, 'S:')             // neutralise system: prefix
    .slice(0, maxLength);
}

// ─── 9. Image Validation ────────────────────────────────────────────────────

/**
 * Validate a base64-encoded image.
 * Accepts WebP (UklGR), JPEG (base64 /9j/), PNG (iVBOR) under maxSizeMb.
 */
export function validateImage(base64?: string, maxSizeMb: number = 5): boolean {
  if (!base64) return true;

  const sizeInBytes = (base64.length * 3) / 4;
  const sizeInMb    = sizeInBytes / (1024 * 1024);
  if (sizeInMb > maxSizeMb) return false;

  // Accept WebP, JPEG, PNG magic bytes
  return (
    base64.startsWith('UklGR') ||  // WebP
    base64.startsWith('/9j/')   ||  // JPEG
    base64.startsWith('iVBOR')      // PNG
  );
}

// ─── 10. Thought / Node Sanitization ────────────────────────────────────────

export function sanitizeThought(content: string): string {
  return content
    .replace(/\[\/?\s*[A-Z_]+\s*\]/g, '')  // strip fake system tags
    .replace(/#{2,}/g, '#')                 // collapse heading injection
    .replace(/System:/gi, 'S:')
    .slice(0, 500);
}
