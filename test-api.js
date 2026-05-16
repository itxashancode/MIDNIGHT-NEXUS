const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function testNexusStream() {
  const apiKey = process.env.NEXUS_API_KEY;
  if (!apiKey) {
    console.error("NEXUS_API_KEY missing");
    return;
  }

  const systemInstruction = "You are a helpful assistant.";
  const userMessage = `Respond to: "Hello"`;
  
  const payload = {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents: [
      { role: "user", parts: [{ text: userMessage }] }
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1024,
      candidateCount: 1
    }
  };

  console.log("Sending STREAM payload with ALT=SSE...");
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:streamGenerateContent?key=${apiKey}&alt=sse`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Raw failure" }));
        console.log("Status:", response.status);
        console.log("Error:", JSON.stringify(err, null, 2));
        return;
    }

    console.log("Status: 200 (Success)");
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

testNexusStream();
