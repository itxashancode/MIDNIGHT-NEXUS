import { fetchNexusStream } from "@/lib/nexus";
import { createSSETransform } from "@/lib/stream";
import { securityHeaders, sanitizeInput, checkRequestSize } from "@/lib/security";

export async function POST(req: Request) {
  try {
    // 1. Security headers
    const responseHeaders: Record<string, string> = {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    };
    Object.entries(securityHeaders).forEach(([k, v]) => {
      responseHeaders[k] = v;
    });

    // 2. Check request size
    if (!checkRequestSize(req as any)) {
      return new Response(JSON.stringify({ error: "Payload too large" }), { status: 413 });
    }

    const body = await req.json();
    const message = sanitizeInput(body.message || "");

    // 3. Mock mode if API key is missing
    if (!process.env.OPENAI_API_KEY) {
      const mockStream = new ReadableStream({
        start(controller) {
          const thoughts = [
            "Initializing reasoning engine...",
            "Analyzing request complexity...",
            "Synthesizing thought nodes...",
            "Generating response structure..."
          ];
          let i = 0;
          const interval = setInterval(() => {
            if (i < thoughts.length) {
               controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ thought: thoughts[i] })}\n\n`));
              i++;
            } else {
              clearInterval(interval);
              controller.close();
            }
          }, 800);
        }
      });
      return new Response(mockStream.pipeThrough(createSSETransform()), { headers: responseHeaders });
    }

    // 4. Fetch stream
    const stream = await fetchNexusStream(
      "You are a high-speed reasoning engine. Generate short, professional thought nodes in a JSON array.",
      message,
      400,
      undefined,
      undefined,
      req.signal,
      body.image ? { inlineData: { mimeType: body.image.mimeType, data: body.image.base64 } } : undefined,
      undefined,
      'cloud'
    );

    if (!stream) {
      return new Response(JSON.stringify({ error: "Failed to fetch stream" }), { status: 500 });
    }

    return new Response(stream, {
      headers: responseHeaders
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
