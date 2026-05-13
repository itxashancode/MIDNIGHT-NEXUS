import { fetchGemmaStream, GemmaImagePart } from "@/lib/gemma";
import { createSSETransform } from "@/lib/stream";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { message, image } = await req.json();
    const ip = req.headers.get("x-forwarded-for") || "anonymous";

    // 1. Rate Limiting (10 requests per minute)
    const { rateLimit, validateImage } = await import("@/lib/security");
    if (!rateLimit(ip, 10)) {
      return new Response("Too many requests. Please wait a minute.", { status: 429 });
    }

    // 2. Image Validation (Max 5MB)
    if (image && !validateImage(image.base64)) {
      return new Response("Image too large. Maximum size is 5MB.", { status: 400 });
    }

    const imageData: GemmaImagePart | undefined = image
      ? { inlineData: { mimeType: image.mimeType, data: image.base64 } }
      : undefined;

    const systemInstruction = "You are a private thinking engine. Output thoughts as a JSON array of strings.";

    const userMessage = `Generate exactly 6 private pre-response thoughts for: "${message || "this image"}". 
    Even for simple inputs, generate 6 distinct thoughts exploring different angles, doubts, or follow-up considerations. 
    Each thought must be one sentence under 20 words. 
    If an image is provided, at least 3 thoughts must directly reference what you observe in the image. 
    Output raw JSON array of strings only.`;

    const responseSchema = {
      type: "ARRAY",
      items: { type: "STRING" },
    };

    const stream = await fetchGemmaStream(
      systemInstruction,
      userMessage,
      400,
      "application/json",
      responseSchema,
      req.signal,
      imageData,
      undefined // No history for thinking phase to improve stability
    );

    if (!stream) {
      return new Response("Failed to fetch stream", { status: 500 });
    }

    return new Response(stream.pipeThrough(createSSETransform()), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: unknown) {
    console.error("API /think error:", error);
    return new Response(error instanceof Error ? error.message : "Error", { status: 500 });
  }
}
