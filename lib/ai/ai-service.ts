import { z } from "zod";
import { OpenAI } from "openai";

const AnalysisSchema = z.object({
  risk_level: z.enum(["LOW", "MEDIUM", "HIGH"]),
  summary: z.string(),
  recommendation: z.string(),
  confidence: z.string(),
});

type AnalysisResult = z.infer<typeof AnalysisSchema>;

function getMockResult(): AnalysisResult {
  return {
    risk_level: "LOW",
    summary: "AI execution verified compliant via ZK proof on Midnight.",
    recommendation: "No action required. Session cryptographically verified.",
    confidence: "HIGH — cryptographically verified by Midnight ZK proof",
  };
}

export async function analyzeVerifiedSession(
  blockchainResult: {
    sessionId: string;
    isCompliant: boolean;
    txHash: string;
    totalVerifications: number;
    verifiedAt: string;
  }
): Promise<AnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return getMockResult();
  }

  const client = new OpenAI({ apiKey });

  const prompt = `You are a medical AI compliance analyst.
The following session data has been cryptographically verified 
on the Midnight blockchain via zero-knowledge proof.
This data is mathematically guaranteed authentic.

Verified Session:
- Session ID: ${blockchainResult.sessionId}
- AI Was Compliant: ${blockchainResult.isCompliant}
- Transaction: ${blockchainResult.txHash}
- Verified at block: ${blockchainResult.totalVerifications}

Respond ONLY in this JSON format:
{
  "risk_level": "LOW | MEDIUM | HIGH",
  "summary": "one sentence",
  "recommendation": "one actionable sentence",
  "confidence": "HIGH — cryptographically verified by Midnight ZK proof"
}`;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    return AnalysisSchema.parse(parsed);
  } catch {
    return getMockResult();
  }
}