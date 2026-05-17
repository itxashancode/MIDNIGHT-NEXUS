import { NextApiRequest, NextApiResponse } from 'next';
import { deployNexusZero } from "@/lib/midnight/contract";
import { rateLimiter, securityHeaders } from "@/lib/security";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method !== "POST") {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Rate limiting (max 3/min per IP)
    const rate = rateLimiter(req);
    if (!rate.allowed) {
      return res.status(429).json({ error: "Too many deployment attempts" });
    }

    const { contractAddress, txHash } = await deployNexusZero();

    return res.status(200).json({
      contractAddress,
      txHash,
      network: "Midnight Preprod"
    });
  } catch (error: any) {
    return res.status(500).json({ 
      error: error.message || "Deployment failed" 
    });
  }
}
