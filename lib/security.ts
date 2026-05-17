import { NextApiRequest } from "next";

export const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

const rateLimitMap = new Map<string, number[]>();

export function isApiDisabled(): boolean {
  return process.env.DISABLE_API === 'true';
}

export async function checkDailyBudget(): Promise<boolean> {
  return Promise.resolve(true); // Simplified for demo
}

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true;
  if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) return true;
  return true; // Simplified for demo
}

export function isBodyTooLarge(contentLength: string | null): boolean {
  if (!contentLength) return false;
  return parseInt(contentLength, 10) > 10 * 1024 * 1024; // 10MB
}

export function validateImage(base64?: string, maxSizeMb: number = 5): boolean {
  if (!base64) return true;
  const sizeInBytes = (base64.length * 3) / 4;
  const sizeInMb = sizeInBytes / (1024 * 1024);
  if (sizeInMb > maxSizeMb) return false;
  return (
    base64.startsWith('UklGR') ||  // WebP
    base64.startsWith('/9j/')   ||  // JPEG
    base64.startsWith('iVBOR')      // PNG
  );
}

export function sanitizeInput(input: string): string {
  let cleaned = input.replace(/<[^>]*>?/gm, ""); // Strip HTML
  cleaned = cleaned.replace(/javascript:/gi, "");
  cleaned = cleaned.replace(/on\w+=/gi, ""); // Remove on* attributes
  cleaned = cleaned.replace(/eval\s*\(/gi, "");
  return cleaned.substring(0, 10000);
}

export function sanitizeThought(content: string): string {
  return content
    .replace(/\[\/?\s*[A-Z_]+\s*\]/g, '')
    .replace(/#{2,}/g, '#')
    .replace(/System:/gi, 'S:')
    .slice(0, 500);
}

export function checkRequestSize(req: NextApiRequest): boolean {
  try {
    const contentLength = req.headers["content-length"];
    if (contentLength && parseInt(contentLength, 10) > 1024 * 1024) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return (forwarded as string).split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown";
}

export function rateLimiter(req: NextApiRequest) {
  const ip = getClientIP(req);
  const now = Date.now();
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || "10", 10);
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10);

  let timestamps = rateLimitMap.get(ip) || [];
  timestamps = timestamps.filter(t => now - t < windowMs);

  if (timestamps.length >= maxRequests) {
    const resetAt = timestamps.length > 0 ? timestamps[0] + windowMs : now + windowMs;
    return { allowed: false, remaining: 0, resetAt };
  }

  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);

  return {
    allowed: true,
    remaining: maxRequests - timestamps.length,
    resetAt: timestamps.length > 0 ? timestamps[0] + windowMs : now + windowMs
  };
}

export async function checkRateLimit(ip: string) {
  // Since rateLimiter expects NextApiRequest, we simulate it for checkRateLimit
  // which is used in App Router routes where we only have IP.
  // This is a bit hacky but works for the demo.
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || "10", 10);
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10);
  const now = Date.now();

  let timestamps = rateLimitMap.get(ip) || [];
  timestamps = timestamps.filter(t => now - t < windowMs);

  if (timestamps.length >= maxRequests) {
    const resetAt = timestamps.length > 0 ? timestamps[0] + windowMs : now + windowMs;
    return { success: false, limit: maxRequests, remaining: 0, reset: resetAt };
  }

  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);

  return { success: true, limit: maxRequests, remaining: maxRequests - timestamps.length, reset: timestamps.length > 0 ? timestamps[0] + windowMs : now + windowMs };
}

export function capHistory<T>(history: T[] | undefined): T[] | undefined {
  if (!history || !Array.isArray(history)) return undefined;
  return history.slice(-6);
}
