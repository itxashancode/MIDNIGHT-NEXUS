export interface NexusImagePart {
  inlineData: {
    mimeType: string;
    data: string; // base64
  };
}

export interface ConversationTurn {
  role: "user" | "model";
  parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
}

/**
 * Polyfill for AbortSignal.any since it's not available in all environments (Node < 20.3.0)
 */
function anySignal(signals: (AbortSignal | undefined)[]) {
  const controller = new AbortController();
  const validSignals = signals.filter((s): s is AbortSignal => !!s);
  
  for (const signal of validSignals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return signal;
    }
    signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
  }
  
  return controller.signal;
}

/**
 * Rotates through multiple API keys to prevent rate-limiting.
 * Uses a random selection from the pool for even distribution.
 */
export function getNexusApiKey(): string {
  const apiKeysRaw = process.env.NEXUS_API_KEY;
  if (!apiKeysRaw) {
    throw new Error("NEXUS_API_KEY is not set");
  }
  const keys = apiKeysRaw.split(",").map(k => k.trim()).filter(Boolean);
  if (keys.length === 0) {
    throw new Error("No API keys found in NEXUS_API_KEY");
  }
  return keys[Math.floor(Math.random() * keys.length)];
}

const LOCAL_OLLAMA_URL = "http://localhost:11434/api/generate";

/**
 * INSTRUCTIONS FOR LOCAL INFERENCE:
 * 1. Install Ollama: https://ollama.ai
 * 2. Run: ollama run nexus-local-core (or any local variant)
 * 3. Set protocol to 'local' in the UI.
 * 4. This bridge will attempt to proxy requests to your local instance.
 */

export async function fetchNexusStream(
  systemInstruction: string,
  userMessage: string,
  maxTokens: number = 1024,
  responseMimeType?: string,
  responseSchema?: unknown,
  signal?: AbortSignal,
  image?: NexusImagePart,
  history?: ConversationTurn[],
  protocol: 'cloud' | 'local' = 'cloud'
) {
  // ─── LOCAL OLLAMA BRIDGE ────────────────────────────────────────────────
  if (protocol === 'local') {
    try {
      console.log("Attempting Local Neural Link via Ollama...");
      const localResponse = await fetch(LOCAL_OLLAMA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemma:2b-instruct", // Default to 2B for local speed
          prompt: `<|turn>system\n${systemInstruction}<turn|>\n${userMessage}`,
          stream: true,
          options: {
            num_predict: maxTokens,
            temperature: 0.3,
          }
        }),
        signal
      });

      if (localResponse.ok) {
        return localResponse.body;
      }
      console.warn("Local Ollama bridge failed or not found. Falling back to Cloud Matrix...");
    } catch (e) {
      console.warn("Local Ollama connection refused. Ensure Ollama is running on port 11434.");
    }
  }

  // ─── CLOUD INFRASTRUCTURE ────────────────────────────────────────────────
  const generationConfig: Record<string, unknown> = {
    temperature: 0.3,
    maxOutputTokens: maxTokens,
    candidateCount: 1
  };
  if (responseMimeType) {
    generationConfig.responseMimeType = responseMimeType;
  }
  if (responseSchema) {
    generationConfig.responseSchema = responseSchema;
  }

  // VERIFIED Gemini Models for v1beta REST API
 const models = [
    "gemma-4-26b-a4b-it",  // High-Throughput MoE (FASTER ✅)
    "gemma-4-31b-it",      // Dense Reasoning (POWERFUL ✅)
  ];
  // Official Nexus 4 Prompt Formatting
  const formattedSystem = `<|turn>system\n<|think|>${systemInstruction}<turn|>`;
  
  // Format history and current message into official turns
  let promptText = "";
  if (history) {
    history.forEach(turn => {
      const turnText = turn.parts.map(p => p.text).filter(Boolean).join("\n");
      promptText += `<|turn>${turn.role}\n${turnText}<turn|>\n`;
    });
  }

  const currentUserText = userMessage;
  promptText += `<|turn>user\n${currentUserText}${image ? " <|image|>" : ""}<turn|>\n<|turn>model`;

  let lastError: Error | null = null;

  const keys = process.env.NEXUS_API_KEY?.split(",").map(k => k.trim()).filter(k => k && k !== "undefined" && k !== "null") || [];
  if (keys.length === 0) {
    throw new Error("NEXUS_API_KEY is not set or contains no valid keys.");
  }

  // Try each model
  for (const model of models) {
    let skipModel = false;

    for (const apiKey of keys) {
      if (skipModel) break;

      try {
        // Add a 10s timeout for initial models to prevent hangs
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: formattedSystem }] },
              contents: [{ role: "user", parts: [{ text: promptText }, ...(image ? [{ inlineData: image.inlineData }] : [])] }],
              generationConfig,
              safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
              ]
            }),
            signal: anySignal([signal, controller.signal]),
          }
        );

        clearTimeout(timeoutId);

          if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            const message = errorBody.error?.message || response.statusText;
            console.warn(`API Error (${model}, status ${response.status}): ${message}`, errorBody);

            // If internal error, retry once after a short delay
            if (message.includes("internal error") || response.status === 500) {
              console.warn(`Model ${model} had internal error, retrying...`);
              await new Promise(r => setTimeout(r, 800));
              continue; // Try same key/model again
            }

            if (message.includes("not found")) {
              console.warn(`Model ${model} not found, skipping...`);
              skipModel = true;
              break;
            }

            throw new Error(`Nexus API error (${model}): ${message}`);
          }


        return response.body;
      } catch (e: unknown) {
        if (e instanceof Error) {
          lastError = e;
          if (e.name === 'AbortError') {
             console.warn(`Model ${model} timed out after 10s, skipping...`);
             skipModel = true;
             break;
          }
          console.warn(`Attempt with ${model} failed:`, e.message);
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  throw lastError || new Error("All model/key combinations failed");
}

export async function fetchNexusFunctionCalls(
  systemInstruction: string,
  userMessage: string,
  tools: unknown[],
  signal?: AbortSignal,
  image?: NexusImagePart,
  history?: ConversationTurn[]
) {
  const keys = process.env.NEXUS_API_KEY?.split(",").map(k => k.trim()).filter(k => k && k !== "undefined" && k !== "null") || [];
  if (keys.length === 0) {
    throw new Error("NEXUS_API_KEY is not set or contains no valid keys.");
  }


  // VERIFIED Gemini Models for v1beta REST API
  const models = [
    "gemma-4-26b-a4b-it",  // High-Throughput MoE (FASTER ✅)
    "gemma-4-31b-it",      // Dense Reasoning (POWERFUL ✅)
  ];


  // STRATEGY: For tool detection, we use a lean instruction to minimize CPU/latency.
  const toolInstruction = "Decide if tools are needed for real-time, financial, or web data. Otherwise, return no tools.";
  
  const formattedSystem = toolInstruction;
  let promptText = "";
  if (history) {
    history.forEach(turn => {
      const turnText = turn.parts.map(p => p.text).filter(Boolean).join("\n");
      promptText += `<|turn>${turn.role}\n${turnText}<turn|>\n`;
    });
  }
  const currentUserText = userMessage;
  promptText += `<|turn>user\n${currentUserText}${image ? " <|image|>" : ""}<turn|>\n<|turn>model`;

  for (const model of models) {
    let skipModel = false;
    for (const apiKey of keys) {
      if (skipModel) break;

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: formattedSystem }] },
              contents: [{ role: "user", parts: [{ text: promptText }, ...(image ? [{ inlineData: image.inlineData }] : [])] }],
              tools: [{ function_declarations: tools }],
              generationConfig: {
                temperature: 0,
                maxOutputTokens: 128,
              }
            }),
            signal,
          }
        );

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          const message = errorBody.error?.message || response.statusText;
          console.warn(`API Error (${model}, status ${response.status}): ${message}`, errorBody);

          if (message.includes("internal error") || message.includes("not found") || response.status === 500) {
            console.warn(`Function call model ${model} is unstable (${message}), skipping...`);
            skipModel = true;
            break;
          }

          throw new Error(`Nexus API error (${model}): ${message}`);
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];
        const calls = candidate?.content?.parts
          ?.filter((p: { functionCall?: unknown }) => p.functionCall)
          .map((p: { functionCall: any }) => p.functionCall) || [];

        return calls;
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.name === 'AbortError') throw e;
          console.warn(`Function call attempt with ${model} failed:`, e.message);
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
  return [];
}
