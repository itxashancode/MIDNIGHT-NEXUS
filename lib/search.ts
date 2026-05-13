export interface SearchResult {
  title: string;
  url: string;
  content: string;
}

export async function tavilySearch(query: string, signal?: AbortSignal): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("TAVILY_API_KEY is not set");

  // Add a 5s internal timeout for search to prevent hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "advanced",
        max_results: 5,
        include_answer: true,
      }),
      signal: signal || controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`Tavily error: ${res.statusText}`);
    const data = await res.json();

    const lines: string[] = [];
    if (data.answer) lines.push(`Summary: ${data.answer}`);

    const results: SearchResult[] = data.results ?? [];
    results.slice(0, 2).forEach((r) => {
      lines.push(`Source: [${r.title}](${r.url}) — ${r.content.slice(0, 150)}...`);
    });

    return lines.join("\n");
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

/** Heuristic: does this message need a live web search? */
export function needsSearch(message: string): boolean {
  // Don't search for very short messages
  if (message.length < 5) return false;

  const triggers = [
    /weather/i,
    /news/i,
    /today/i,
    /latest/i,
    /current/i,
    /right now/i,
    /stock/i,
    /price/i,
    /score/i,
    /match/i,
    /trending/i,
    /ticker/i,
    /nasdaq/i,
    /dow jones/i,
    /equity/i,
    /dividend/i,
    /currency/i,
    /exchange rate/i,
    /convert (usd|eur|gbp|pkr)/i,
    /bitcoin|btc|ethereum|eth|solana|crypto|token|market cap/i,
    /202[456789]/,      // Specific upcoming/current years
    /who (is|was|won)/i,
    /what happened/i,
    /live/i,
    /real-time/i,
  ];
  return triggers.some((re) => re.test(message));
}
