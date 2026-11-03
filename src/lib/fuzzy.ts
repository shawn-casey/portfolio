export type FuzzyMatch = { score: number; indices: number[] };

/**
 * Subsequence fuzzy match with the scoring Obsidian's quick switcher
 * roughly gives you: consecutive runs and word boundaries win.
 */
export function fuzzy(needle: string, haystack: string): FuzzyMatch | null {
  const q = needle.toLowerCase();
  if (!q) return { score: 0, indices: [] };
  const h = haystack.toLowerCase();
  const indices: number[] = [];
  let score = 0;
  let hi = 0;
  let run = 0;

  for (let qi = 0; qi < q.length; qi++) {
    const c = q[qi];
    if (c === ' ') {
      run = 0;
      continue;
    }
    let found = -1;
    for (let i = hi; i < h.length; i++) {
      if (h[i] === c) {
        found = i;
        break;
      }
    }
    if (found === -1) return null;
    const prev = found > 0 ? haystack[found - 1] : '';
    const boundary = found === 0 || /[\s/\-_.(]/.test(prev);
    const consecutive = indices.length > 0 && found === indices[indices.length - 1] + 1;
    run = consecutive ? run + 1 : 0;
    score += 10 + run * 12 + (boundary ? 14 : 0) + (found === 0 ? 12 : 0);
    score -= Math.min(found - hi, 8); // penalise gaps, but bounded
    indices.push(found);
    hi = found + 1;
  }
  // shorter haystacks are better matches for the same query
  score += Math.max(0, 24 - haystack.length / 3);
  return { score, indices };
}

/** Split a string into matched / unmatched runs for highlighting. */
export function highlight(text: string, indices: number[]): { text: string; hit: boolean }[] {
  if (!indices.length) return [{ text, hit: false }];
  const set = new Set(indices);
  const out: { text: string; hit: boolean }[] = [];
  let buf = '';
  let cur = set.has(0);
  for (let i = 0; i < text.length; i++) {
    const hit = set.has(i);
    if (hit !== cur) {
      out.push({ text: buf, hit: cur });
      buf = '';
      cur = hit;
    }
    buf += text[i];
  }
  out.push({ text: buf, hit: cur });
  return out.filter((s) => s.text);
}
