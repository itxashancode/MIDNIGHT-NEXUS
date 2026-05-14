import { fetchGemmaStream, GemmaImagePart } from "@/lib/gemma";
import { createSSETransform } from "@/lib/stream";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const {
      isApiDisabled,
      checkRateLimit,
      checkDailyBudget,
      isOriginAllowed,
      isBodyTooLarge,
      validateImage,
      sanitizeInput,
    } = await import("@/lib/security");

    // ── 1. Global Kill Switch ──────────────────────────────────────────────
    if (isApiDisabled()) {
      return new Response("Service temporarily disabled.", { status: 503 });
    }

    // ── 2. Strict CORS ────────────────────────────────────────────────────
    const origin = req.headers.get("origin");
    if (!isOriginAllowed(origin)) {
      return new Response("Forbidden: Invalid Origin", { status: 403 });
    }

    // ── 3. Request Body Size Guard ────────────────────────────────────────
    if (isBodyTooLarge(req.headers.get("content-length"))) {
      return new Response("Payload Too Large", { status: 413 });
    }

    // ── 4. Per-IP Rate Limit ──────────────────────────────────────────────
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "anonymous";
    if (!(await checkRateLimit(ip))) {
      return new Response("Too many requests — please wait a minute.", { status: 429 });
    }

    // ── 5. Global Daily Budget ────────────────────────────────────────────
    if (!(await checkDailyBudget())) {
      return new Response("Daily request limit reached. Try again tomorrow.", { status: 429 });
    }

    const { message, image } = await req.json();

    // ── 6. Image Validation (Max 2MB) ─────────────────────────────────────
    if (image && !validateImage(image.base64, 2)) {
      return new Response("Invalid image. Max 2MB; supported: WebP, JPEG, PNG.", { status: 400 });
    }

    const sanitizedMessage = sanitizeInput(message, 500);
    if (sanitizedMessage === "[BLOCKED_POTENTIAL_INJECTION]") {
      return new Response("Request blocked.", { status: 403 });
    }

    const imageData: GemmaImagePart | undefined = image
      ? { inlineData: { mimeType: image.mimeType, data: image.base64 } }
      : undefined;

    const systemInstruction =
      "You are a private thinking engine. Output thoughts as a JSON array of strings.";

    const userMessage = `Analyze the complexity of this request: "${sanitizedMessage || "this image"}". 
    Generate a dynamic set of private pre-response thoughts (between 3 and 6) based on logic required.
    Simple queries should have 3 thoughts. Complex ones should have 6.
    Each thought must be one sentence under 15 words. 
    Output raw JSON array of strings only.`;

    const stream = await fetchGemmaStream(
      systemInstruction,
      userMessage,
      400, // thinking phase is cheap — keep it small
      undefined,
      undefined,
      req.signal,
      imageData,
      undefined // No history for thinking phase
    );

    if (!stream) {
      return new Response("Failed to fetch stream", { status: 500 });
    }

    return new Response(stream.pipeThrough(createSSETransform()), {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: unknown) {
    console.error("API /think error:", error);
    return new Response(error instanceof Error ? error.message : "Error", { status: 500 });
  }
}
