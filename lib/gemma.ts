export interface GemmaImagePart {
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

export async function fetchGemmaStream(
  systemInstruction: string,
  userMessage: string,
  maxTokens: number = 1024,
  responseMimeType?: string,
  responseSchema?: unknown,
  signal?: AbortSignal,
  image?: GemmaImagePart,
  history?: ConversationTurn[]
) {
  const apiKeysRaw = process.env.GEMMA_API_KEY;
  if (!apiKeysRaw) {
    throw new Error("GEMMA_API_KEY is not set");
  }

  const apiKeys = apiKeysRaw.split(",").map(k => k.trim());
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

  // VERIFIED Gemma 4 Models for v1beta REST API
  const models = [
    "gemma-4-26b-a4b-it",  // High-Throughput MoE (FASTER ✅)
    "gemma-4-31b-it",      // Dense Reasoning (POWERFUL ✅)
  ];

  // Official Gemma 4 Prompt Formatting
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

  // Try each model
  for (const model of models) {
    // Smart Failover: If a model fails with Internal Error, skip all keys for it
    let skipModel = false;

    for (const apiKey of apiKeys) {
      if (skipModel) break;

      try {
        // Add an 8s timeout for initial models to prevent hangs
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

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

          // If internal error or model not found, skip THIS model and try the next one
          if (message.includes("internal error") || message.includes("not found") || response.status === 500) {
            console.warn(`Model ${model} is currently unstable (${message}), skipping entire node...`);
            skipModel = true;
            break;
          }

          throw new Error(`Gemma API error (${model}): ${message}`);
        }

        return response.body;
      } catch (e: unknown) {
        if (e instanceof Error) {
          lastError = e;
          if (e.name === 'AbortError') {
             console.warn(`Model ${model} timed out after 8s, skipping...`);
             skipModel = true;
             break;
          }
          console.warn(`Attempt with ${model} failed:`, e.message);
        }
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
  }

  throw lastError || new Error("All model/key combinations failed");
}

export async function fetchGemmaFunctionCalls(
  systemInstruction: string,
  userMessage: string,
  tools: unknown[],
  signal?: AbortSignal,
  image?: GemmaImagePart,
  history?: ConversationTurn[]
) {
  const apiKeysRaw = process.env.GEMMA_API_KEY;
  if (!apiKeysRaw) {
    throw new Error("GEMMA_API_KEY is not set");
  }

  const apiKeys = apiKeysRaw.split(",").map(k => k.trim());

  const models = [
    "gemma-4-26b-a4b-it",  // High-Throughput MoE (Best for fast tool detection)
    "gemma-4-31b-it",      // Dense Reasoning Fallback
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
    for (const apiKey of apiKeys) {
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

          if (message.includes("internal error") || message.includes("not found") || response.status === 500) {
            console.warn(`Function call model ${model} is unstable (${message}), skipping...`);
            skipModel = true;
            break;
          }

          throw new Error(`Gemma API error (${model}): ${message}`);
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
