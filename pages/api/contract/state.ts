import { getPublicState } from "@/lib/midnight/contract";

export default async function handler(req: Request) {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const state = await getPublicState();
    return new Response(JSON.stringify(state), { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get state";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}