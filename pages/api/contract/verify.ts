import { NextApiRequest, NextApiResponse } from 'next';
import { verifyExecution } from "@/lib/midnight/contract";
import { analyzeVerifiedSession } from "@/lib/ai/ai-service";
import { sanitizeInput, checkRequestSize, rateLimiter, securityHeaders, getClientIP } from "@/lib/security";
import { z } from "zod";

const VerifySchema = z.object({
  executionAttestation: z.string().regex(/^[0-9a-fA-F]+$/, 'Must be hex string'),
  isCompliant: z.boolean(),
  aiExecutionLogHash: z.string().regex(/^[0-9a-fA-F]+$/, 'Must be hex string'),
  callerSecret: z.string().regex(/^[0-9a-fA-F]+$/, 'Must be hex string'),
});

type VerifyResponse = {
  success: boolean;
  txHash: string;
  sessionId: string;
  totalVerifications: number;
  aiAnalysis?: {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    summary: string;
    recommendation: string;
    confidence: string;
    isMocked: boolean;
  };
  network: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<VerifyResponse>) {
  // Set security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method !== "POST") {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      success: false, 
      txHash: "", 
      sessionId: "", 
      totalVerifications: 0, 
      network: "Midnight Preprod", 
      error: "Method not allowed" 
    });
  }

  try {
    // 1. Security checks (size, rate limit)
    if (!checkRequestSize(req)) {
      return res.status(413).json({ 
        success: false, 
        txHash: "", 
        sessionId: "", 
        totalVerifications: 0, 
        network: "Midnight Preprod", 
        error: "Request body too large" 
      });
    }

    const rate = rateLimiter(req);
    if (!rate.allowed) {
      return res.status(429).json({ 
        success: false, 
        txHash: "", 
        sessionId: "", 
        totalVerifications: 0, 
        network: "Midnight Preprod", 
        error: "Too many requests" 
      });
    }

    // 2. Validate body with Zod
    const body = await new Promise<any>((resolve, reject) => {
      let data = '';
      req.on('data', chunk => { data += chunk; });
      req.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
      req.on('error', reject);
    });

    const validated = VerifySchema.parse(body);

    // 3. Sanitize all string inputs
    const sanitized = {
      executionAttestation: sanitizeInput(validated.executionAttestation),
      isCompliant: validated.isCompliant,
      aiExecutionLogHash: sanitizeInput(validated.aiExecutionLogHash),
      callerSecret: sanitizeInput(validated.callerSecret),
    };

    // 4. Call verifyExecution()
    const txResult = await verifyExecution({
      executionAttestation: sanitized.executionAttestation,
      isCompliant: sanitized.isCompliant,
      aiExecutionLogHash: sanitized.aiExecutionLogHash,
      callerSecret: sanitized.callerSecret,
    });

    if (!txResult.success) {
      return res.status(500).json({ 
        success: false, 
        txHash: "", 
        sessionId: "", 
        totalVerifications: 0, 
        network: "Midnight Preprod", 
        error: txResult.error || "Verification failed" 
      });
    }

    // 5. If success: call analyzeVerifiedSession()
    const aiAnalysis = await analyzeVerifiedSession({
      sessionId: txResult.sessionId,
      isCompliant: sanitized.isCompliant,
      txHash: txResult.txHash,
      totalVerifications: txResult.totalVerifications,
      verifiedAt: new Date().toISOString(),
    });

    // 6. Return both results in one response
    return res.status(200).json({
      success: true,
      txHash: txResult.txHash,
      sessionId: txResult.sessionId,
      totalVerifications: txResult.totalVerifications,
      aiAnalysis: {
        riskLevel: aiAnalysis.riskLevel,
        summary: aiAnalysis.summary,
        recommendation: aiAnalysis.recommendation,
        confidence: aiAnalysis.confidence,
        isMocked: aiAnalysis.isMocked
      },
      network: "Midnight Preprod"
    });

  } catch (error: any) {
    // 7. On any error: return 500 with { error: message }
    return res.status(500).json({ 
      success: false, 
      txHash: "", 
      sessionId: "", 
      totalVerifications: 0, 
      network: "Midnight Preprod", 
      error: error instanceof z.ZodError ? "Invalid request format" : error.message 
    });
  }
}
