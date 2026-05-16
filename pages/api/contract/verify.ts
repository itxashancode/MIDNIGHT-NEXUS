import { verifyExecution } from "@/lib/midnight/contract";
import { analyzeVerifiedSession } from "@/lib/ai/ai-service";
import { z } from "zod";

const VerifySchema = z.object({
  executionAttestation: z.string().min(1),
  isCompliant: z.boolean(),
  aiExecutionLogHash: z.string().min(1),
  callerSecret: z.string().min(1),
});

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  let validated;
  try {
    const body = await req.json();
    validated = VerifySchema.parse(body);
  } catch (err) {
    const details = err instanceof z.ZodError ? err.errors : "Invalid request";
    return new Response(JSON.stringify({ error: "Invalid request", details }), { status: 400 });
  }

  try {

    const txResult = await verifyExecution({
      executionAttestation: validated.executionAttestation,
      isCompliant: validated.isCompliant,
      aiExecutionLogHash: validated.aiExecutionLogHash,
      callerSecret: validated.callerSecret,
    });

    if (!txResult.success) {
      return new Response(JSON.stringify({ error: txResult.error }), { status: 500 });
    }

    const aiAnalysis = await analyzeVerifiedSession({
      sessionId: txResult.sessionId,
      isCompliant: validated.isCompliant,
      txHash: txResult.txHash,
      totalVerifications: txResult.totalVerifications,
      verifiedAt: new Date().toISOString(),
    });

    return new Response(JSON.stringify({
      success: true,
      txHash: txResult.txHash,
      sessionId: txResult.sessionId,
      aiAnalysis: {
        riskLevel: aiAnalysis.risk_level,
        summary: aiAnalysis.summary,
        recommendation: aiAnalysis.recommendation,
        confidence: aiAnalysis.confidence
      },
      message: "ZK proof verified on Midnight blockchain"
    }), { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}