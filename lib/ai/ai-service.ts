import { z } from "zod";
import OpenAI from "openai";

const AnalysisSchema = z.object({
  risk_level: z.enum(["LOW", "MEDIUM", "HIGH"]),
  summary: z.string(),
  recommendation: z.string(),
  confidence: z.string(),
});

type AnalysisSchemaType = z.infer<typeof AnalysisSchema>;

export async function analyzeVerifiedSession(params: {
  sessionId: string
  isCompliant: boolean
  txHash: string
  totalVerifications: number
  verifiedAt: string
}): Promise<{
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  summary: string
  recommendation: string
  confidence: string
  isMocked: boolean
}> {
  const getMockResult = (): {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
    summary: string
    recommendation: string
    confidence: string
    isMocked: boolean
  } => ({
    riskLevel: 'LOW',
    summary: 'AI execution verified compliant on Midnight blockchain.',
    recommendation: 'Session cryptographically verified. No action required.',
    confidence: 'HIGH — cryptographically verified by Midnight ZK proof',
    isMocked: true
  });

  if (!process.env.OPENAI_API_KEY) {
    return getMockResult();
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `
You are a medical AI compliance analyst.
The following data is cryptographically verified on the
Midnight Network blockchain via zero-knowledge proof.
It is mathematically guaranteed authentic.

ZK-Verified Session:
- Session ID: ${params.sessionId}
- AI Execution Compliant: ${params.isCompliant}
- Verified At: ${params.verifiedAt}
- Verification #${params.totalVerifications} on Midnight Preprod
- Transaction: ${params.txHash}

Provide compliance analysis in this exact JSON:
{
  "risk_level": "LOW | MEDIUM | HIGH",
  "summary": "one sentence max",
  "recommendation": "one actionable sentence",
  "confidence": "HIGH — cryptographically verified by Midnight ZK proof"
}
Respond ONLY with JSON. No markdown. No explanation.
  `.trim();

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return getMockResult();

    const parsed = JSON.parse(content);
    const validated = AnalysisSchema.parse(parsed);

    return {
      riskLevel: validated.risk_level,
      summary: validated.summary,
      recommendation: validated.recommendation,
      confidence: validated.confidence,
      isMocked: false
    };
  } catch (error) {
    return getMockResult();
  }
}
