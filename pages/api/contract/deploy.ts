import { deployContract } from "@/lib/midnight/contract";
import { z } from "zod";

const DeploySchema = z.object({
  action: z.literal("deploy"),
});

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { contractAddress, txHash } = await deployContract();
    return new Response(JSON.stringify({ contractAddress, txHash }), { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Deployment failed";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}