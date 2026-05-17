import { NextApiRequest, NextApiResponse } from 'next';
import { securityHeaders } from "@/lib/security";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method !== "GET") {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    return res.status(200).json({
      status: 'ok',
      network: 'Midnight Preprod',
      contractDeployed: !!process.env.CONTRACT_ADDRESS,
      contractAddress: process.env.CONTRACT_ADDRESS ?? null,
      proofServer: process.env.MIDNIGHT_PROVING_SERVER_URL,
      timestamp: new Date().toISOString()
    });
  } catch {
    return res.status(200).json({ status: 'ok' });
  }
}
