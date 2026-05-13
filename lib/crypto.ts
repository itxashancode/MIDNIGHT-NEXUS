/**
 * High-speed CoinGecko API client for real-time crypto intelligence.
 */

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const API_KEY = process.env.COINGECKO_API_KEY || "CG-PUBZQYn6eyBEuhi4NU6Zsyxa";

export async function fetchCryptoPrices(args: { ids: string; vs_currencies?: string }, signal?: AbortSignal) {
  try {
    const ids = args.ids.toLowerCase().replace(/\s+/g, "");
    const vs = (args.vs_currencies || "usd").toLowerCase();
    
    const url = `${COINGECKO_BASE}/simple/price?ids=${ids}&vs_currencies=${vs}&x_cg_demo_api_key=${API_KEY}`;
    
    console.log(`[Crypto API] Fetching: ${ids} in ${vs}`);
    
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);
    
    const data = await res.json();
    
    // Format for AI context
    let context = "### CRYPTO_MARKET_DATA ###\n";
    for (const [id, prices] of Object.entries(data)) {
      context += `${id.toUpperCase()}: `;
      for (const [currency, price] of Object.entries(prices as any)) {
        context += `${price} ${currency.toUpperCase()} | `;
      }
      context += "\n";
    }
    
    return context;
  } catch (error) {
    console.error("fetchCryptoPrices error:", error);
    return "Error fetching crypto prices.";
  }
}

/**
 * Fetch trending coins from CoinGecko
 */
export async function fetchTrendingCrypto(signal?: AbortSignal) {
  try {
    const url = `${COINGECKO_BASE}/search/trending?x_cg_demo_api_key=${API_KEY}`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);
    
    const data = await res.json();
    const trending = data.coins.slice(0, 5).map((c: any) => `${c.item.name} (${c.item.symbol})`).join(", ");
    
    return `### TRENDING_CRYPTO ###\nTop 5: ${trending}\n`;
  } catch (error) {
    console.error("fetchTrendingCrypto error:", error);
    return "Error fetching trending crypto.";
  }
}
