/**
 * DEAD STAR — Firecrawl Integration
 * 
 * Used for deep scraping of specific URLs that Tavily search can't fully extract.
 * The model calls this when a user asks about content at a known URL, or when
 * search results need to be expanded with the full page content.
 *
 * Free plan limits: ~500 credits/month — use sparingly.
 * Scrape = 1 credit, Search = 2 credits, Interact = 5 credits.
 */

const FIRECRAWL_BASE = "https://api.firecrawl.dev/v2";

/** Scrape a single URL and return clean markdown. Uses 1 credit. */
export async function firecrawlScrape(
  url: string,
  signal?: AbortSignal
): Promise<string> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY is not set");

  // 7-second internal timeout — edge runtime safe
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    const res = await fetch(`${FIRECRAWL_BASE}/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,   // strips nav, footer, ads
        maxLength: 3000,          // keep token cost low
      }),
      signal: signal || controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Firecrawl scrape error: ${err?.message || res.statusText}`);
    }

    const data = await res.json();

    if (!data.success || !data.data?.markdown) {
      return "Scrape returned no content for that URL.";
    }

    const meta    = data.data?.metadata;
    const title   = meta?.title   ? `## ${meta.title}\n` : "";
    const srcUrl  = meta?.sourceURL ? `Source: ${meta.sourceURL}\n\n` : "";
    const content = data.data.markdown.slice(0, 3000);

    return `${title}${srcUrl}${content}`;
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

/** Search the web via Firecrawl and return clean results. Uses 2 credits. */
export async function firecrawlSearch(
  query: string,
  signal?: AbortSignal
): Promise<string> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY is not set");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    const res = await fetch(`${FIRECRAWL_BASE}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query,
        limit: 3,               // 3 results — free plan safe
        scrapeOptions: {
          formats: ["markdown"],
          onlyMainContent: true,
          maxLength: 1000,
        },
      }),
      signal: signal || controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Firecrawl search error: ${err?.message || res.statusText}`);
    }

    const data = await res.json();

    if (!data.success || !data.data?.length) {
      return "No results found.";
    }

    return data.data
      .slice(0, 3)
      .map((r: { title?: string; url?: string; markdown?: string }) =>
        `**[${r.title || "Untitled"}](${r.url})**\n${(r.markdown || "").slice(0, 500)}`
      )
      .join("\n\n---\n\n");
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}
