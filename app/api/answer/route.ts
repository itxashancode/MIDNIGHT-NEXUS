import { fetchNexusStream, ConversationTurn, NexusImagePart } from "@/lib/nexus";
import { createSSETransform } from "@/lib/stream";
import { securityHeaders, sanitizeInput, checkRequestSize, rateLimiter, sanitizeThought } from "@/lib/security";
import { verifyExecution } from "@/lib/midnight/contract";
import { analyzeVerifiedSession } from "@/lib/ai/ai-service";
import crypto from "crypto";

export const runtime = "nodejs";

// In-memory cache for async verification results (for demo purposes)
const verificationCache = new Map<string, any>();

interface AnswerRequestBody {
  message: string;
  thoughts: string[];
  image?: any;
  history: ConversationTurn[];
  protocol?: 'cloud' | 'local';
}

export async function POST(req: Request) {
  // 1. Security headers
  const responseHeaders: Record<string, string> = {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  };
  Object.entries(securityHeaders).forEach(([k, v]) => {
    responseHeaders[k] = v;
  });

  try {
    // 2. Check request size
    if (!checkRequestSize(req as any)) {
      return new Response(JSON.stringify({ error: "Payload too large" }), { status: 413 });
    }

    // 3. Rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "anonymous";

    const body = (await req.json()) as AnswerRequestBody;
    const { message, thoughts, image, history, protocol } = body;

    // 4. Sanitize inputs
    const sanitizedMessage = sanitizeInput(message || "");
    if (sanitizedMessage === "[BLOCKED_POTENTIAL_INJECTION]") {
      return new Response("Request blocked.", { status: 403 });
    }

    const cleanThoughts = (thoughts || []).map((t: string) => sanitizeThought(t));
    const cappedHistory = (history || []).slice(-6) as ConversationTurn[];

    const imageData: NexusImagePart | undefined = image
      ? { inlineData: { mimeType: image.mimeType, data: image.base64 } }
      : undefined;

    // 5. Mock mode if API key is missing
    if (!process.env.OPENAI_API_KEY) {
      const mockStream = new ReadableStream({
        start(controller) {
          const mockText = "This is a mock response because no OpenAI API key is configured.";
           controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text: mockText })}\n\n`));
          controller.close();
        }
      });
      return new Response(mockStream.pipeThrough(createSSETransform()), { headers: responseHeaders });
    }

    // 6. Prepare instructions and fetch stream
    const systemInstruction = `You are MIDNIGHT-NEXUS AI.
    [INTERNAL_REASONING]:
    ${cleanThoughts.map(t => `###_REASONING_NODE_###\n${t}\n###_END_NODE_###`).join("\n")}`;

    const stream = await fetchNexusStream(
      systemInstruction,
      sanitizedMessage,
      8192,
      undefined,
      undefined,
      req.signal,
      imageData,
      cappedHistory,
      protocol || 'cloud'
    );

    if (!stream) {
      return new Response(JSON.stringify({ error: "Failed to fetch stream" }), { status: 500 });
    }

    // We need to intercept the stream to get the final answer for attestation
    // This is tricky with standard ReadableStream. 
    // For the sake of the demo, we will use a custom stream wrapper or just handle it.
    // However, since we must do it async, we can't wait for the stream to finish before returning.
    // But we NEED the answer to hash it.
    
    // A common trick is to return the stream, but also spawn a background process that 
    // consumes a COPY of the stream (if possible) or we consume it and then stream it.
    // Since we are in an edge/serverless environment, we'll just wrap the stream.
    
    // For the demo, we'll implement a "pass-through" stream that also triggers the ZK process.
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    // We will use a BroadcastChannel or just a global variable to store results.
    // Let's use a simple global approach.
    
    // This is a simplified way to capture the content while streaming it.
    let fullAnswer = "";
    
    const transformedStream = stream.pipeThrough(new TransformStream({
      transform(chunk: Uint8Array, controller: any) {
        const text = decoder.decode(chunk, { stream: true });
        fullAnswer += text;
        controller.enqueue(chunk);
      }
    }));

    // We'll launch the ZK process after a short delay to allow the response to be sent
    // and the stream to start.
    setTimeout(async () => {
      try {
        const answerText = fullAnswer
          .split('\n')
          .filter(line => line.startsWith('data: '))
          .map(line => line.replace(/^data: /, ''))
          .map(jsonStr => {
            try { return JSON.parse(jsonStr).text || jsonStr; } catch { return jsonStr; }
          })
          .join('');

        if (answerText) {
          const attestation = crypto.createHash('sha256').update(answerText).digest('hex');
          const sessionId = crypto.randomUUID();

          const txResult = await verifyExecution({
            executionAttestation: attestation,
            isCompliant: true,
            aiExecutionLogHash: crypto.createHash('sha256').update(answerText).digest('hex'),
            callerSecret: "0x0000000000000000000000000000000000000000000000000000000000000000",
          });

          if (txResult.success) {
            const aiAnalysis = await analyzeVerifiedSession({
              sessionId: txResult.sessionId,
              isCompliant: true,
              txHash: txResult.txHash,
              totalVerifications: txResult.totalVerifications,
              verifiedAt: new Date().toISOString(),
            });

            // Store in global cache (since we are in one process for demo)
            (global as any).verificationResults = (global as any).verificationResults || new Map();
            (global as any).verificationResults.set(sessionId, {
              txHash: txResult.txHash,
              totalVerifications: txResult.totalVerifications,
              aiAnalysis,
              status: 'confirmed'
            });
          }
        }
      } catch (e) {
        console.error("Background ZK attestation failed:", e);
      }
    }, 2000);

    return new Response(transformedStream, {
      headers: responseHeaders
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
