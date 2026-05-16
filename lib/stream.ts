export function createSSETransform() {
  const decoder = new TextDecoder();
  let buffer = '';

  return new TransformStream({
    start(controller) {
      // Force Vercel to flush headers instantly by sending a safe whitespace character
      controller.enqueue(new TextEncoder().encode(" "));
    },
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep the last partial line in the buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        
        const dataStr = trimmed.slice(6);
        if (dataStr === '[DONE]') continue;
        
        try {
          const data = JSON.parse(dataStr);
          
          // Detect API errors within the stream
          if (data.error) {
            throw new Error(`Stream Error: ${data.error.message || "Unknown error"}`);
          }

          // Handle various response structures
          const candidates = data.candidates || [];
          for (const cand of candidates) {
            const parts = cand.content?.parts || [];
            for (const part of parts) {
              // Skip internal thinking tokens
              if (part.thought === true) continue;
              if (part.text) {
                controller.enqueue(new TextEncoder().encode(part.text));
              }
            }
          }
        } catch (e: unknown) {
          if (e instanceof Error && e.message.startsWith('Stream Error:')) {
            controller.error(e);
            return;
          }
          // Ignore incomplete/invalid JSON
        }
      }
    },
    flush(controller) {
      // Process any remaining data in the buffer
      if (buffer.trim().startsWith('data: ')) {
        try {
          const data = JSON.parse(buffer.trim().slice(6));
          const parts = data.candidates?.[0]?.content?.parts || [];
          for (const part of parts) {
            if (part.thought !== true && part.text) {
              controller.enqueue(new TextEncoder().encode(part.text));
            }
          }
        } catch {
          // Ignore
        }
      }
    }
  });
}
