export default function handler(req: Request) {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const contractDeployed = !!process.env.CONTRACT_ADDRESS;

    return new Response(
      JSON.stringify({
        status: "ok",
        network: process.env.MIDNIGHT_NETWORK ?? "TestNet",
        contractDeployed,
        contractAddress: process.env.CONTRACT_ADDRESS ?? null,
        timestamp: new Date().toISOString(),
      }),
      { status: 200 }
    );
  } catch {
    return new Response(
      JSON.stringify({ status: "ok", note: "partial" }),
      { status: 200 }
    );
  }
}