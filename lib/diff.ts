export function calculateInfluence(originalThoughts: string[], editedThoughts: string[]): number {
  if (originalThoughts.length === 0) return 0;
  
  const originalSet = new Set(originalThoughts);
  const editedSet = new Set(editedThoughts);
  let diff = 0;
  
  originalThoughts.forEach(t => { if (!editedSet.has(t)) diff++; });
  editedThoughts.forEach(t => { if (!originalSet.has(t)) diff++; });
  
  return Math.min(Math.round((diff / originalThoughts.length) * 100), 100);
}
