import { NextApiRequest, NextApiResponse } from 'next';
import { getPublicState } from "@/lib/midnight/contract";
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
    const state = await getPublicState();
    return res.status(200).json({
      ...state,
      network: "Midnight Preprod"
    });
  } catch (error) {
    return res.status(200).json({
      totalVerifications: 0,
      verifiedSessionCount: 0,
      network: "Midnight Preprod"
    });
  }
}
