export interface FinanceArticle {
  title: string;
  url: string;
  description: string;
  source: string;
  tickers: string[];
  published_at: string;
}

/**
 * Fetches real-time financial news using the Finance News API (apilayer).
 * Designed for AI agents to get structured market intelligence.
 */
export async function fetchFinanceNews(params: {
  keywords?: string;
  tickers?: string;
  sources?: string;
  date?: string;
}, signal?: AbortSignal): Promise<string> {
  const apiKey = process.env.FINANCELAYER_API_KEY;
  
  const url = new URL("https://api.apilayer.com/financelayer/news");
  if (params.keywords) url.searchParams.append("keywords", params.keywords);
  if (params.tickers) url.searchParams.append("tickers", params.tickers);
  if (params.sources) url.searchParams.append("sources", params.sources);
  if (params.date) url.searchParams.append("date", params.date);

  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { "apikey": apiKey || "" },
      signal,
    });

    if (!res.ok) {
      throw new Error(`Finance API error: ${res.statusText}`);
    }

    const data = await res.json();
    const articles: FinanceArticle[] = data.data || [];

    if (articles.length === 0) {
      return "No recent financial news found for these parameters.";
    }

    // Format for AI consumption (highly dense, markdown friendly)
    const formatted = articles.slice(0, 5).map(a => {
      const tickerList = a.tickers.length > 0 ? ` [${a.tickers.join(", ")}]` : "";
      return `### ${a.title}${tickerList}
Source: ${a.source} | Date: ${new Date(a.published_at).toLocaleDateString()}
${a.description}
Read more: ${a.url}
---`;
    }).join("\n\n");

    return `[REAL_TIME_FINANCE_DATA]:\n\n${formatted}`;
  } catch (error) {
    console.error("Finance News Fetch Failed:", error);
    return "Error fetching real-time financial data.";
  }
}

/**
 * Converts currency or fetches latest exchange rates using ExchangeRates API.
 */
export async function fetchExchangeRates(params: {
  from?: string;
  to?: string;
  amount?: number;
  base?: string;
  symbols?: string;
}, signal?: AbortSignal): Promise<string> {
  const apiKey = process.env.FINANCELAYER_API_KEY;
  
  try {
    // Optimized: Use currency_data for faster response times
    const endpoint = params.from && params.to && params.amount !== undefined ? "convert" : "live";
    const url = new URL(`https://api.apilayer.com/currency_data/${endpoint}`);
    
    if (endpoint === "convert") {
      url.searchParams.append("to", params.to!);
      url.searchParams.append("from", params.from!);
      url.searchParams.append("amount", params.amount!.toString());
    } else {
      url.searchParams.append("source", params.base || "USD");
      url.searchParams.append("currencies", params.symbols || "EUR,GBP,JPY,CAD,AUD");
    }

    const res = await fetch(url.toString(), { 
      headers: { "apikey": apiKey || "" },
      signal,
    });

    if (!res.ok) throw new Error(`Currency API error: ${res.statusText}`);
    const data = await res.json();
    
    if (endpoint === "convert") {
      return `[CURRENCY_CONVERSION]: ${params.amount} ${params.from} is equal to ${data.result.toFixed(2)} ${params.to} (Rate: ${data.info.quote.toFixed(4)} as of ${new Date(data.info.timestamp * 1000).toLocaleDateString()}).`;
    }

    const quotes = Object.entries(data.quotes || {})
      .map(([sym, val]) => `${sym.replace(data.source || "USD", "")}: ${(val as number).toFixed(4)}`)
      .join(" | ");

    return `[LATEST_EXCHANGE_RATES] Source: ${data.source || "USD"} | Date: ${new Date(data.timestamp * 1000).toLocaleDateString()}\nQuotes: ${quotes}`;
  } catch (error) {
    console.error("Exchange Rate Fetch Failed:", error);
    return "Error fetching real-time currency data.";
  }
}
