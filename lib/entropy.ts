/**
 * Information-theoretic calculation of text entropy.
 * Used to measure the "uncertainty" or complexity of the model's output in real-time.
 */
export function calculateShannonEntropy(text: string): number {
  if (!text || text.length === 0) return 0;

  const freq: Record<string, number> = {};
  for (const char of text) {
    freq[char] = (freq[char] ?? 0) + 1;
  }

  const len = text.length;
  let entropy = 0;

  for (const char in freq) {
    const p = freq[char] / len;
    entropy -= p * Math.log2(p);
  }

  // Scale entropy to a 0-100 range for the UI graph
  // Max entropy for 256 chars (ASCII) is 8 bits. We'll normalize roughly.
  const normalized = Math.min(100, (entropy / 8) * 100);
  
  // Add a tiny bit of jitter to make the graph look "live" but keep the trend real
  return normalized + (Math.random() * 2);
}
