import type { Paragraph, Segment } from "./bio-content";

export type WordToken = {
  word: string;
  href?: string;
};

export type DiffResult = {
  type: "keep" | "remove" | "add";
  word: string;
  href?: string;
};

/**
 * Flatten a paragraph into an array of word tokens with optional href
 */
export function flattenParagraph(para: Paragraph): WordToken[] {
  const tokens: WordToken[] = [];
  for (const seg of para) {
    const words = seg.text.split(/\s+/).filter(Boolean);
    for (const word of words) {
      tokens.push({ word, href: seg.href });
    }
  }
  return tokens;
}

/**
 * Flatten multiple paragraphs into a single array of word tokens,
 * inserting paragraph break markers
 */
export function flattenParagraphs(paras: Paragraph[]): WordToken[] {
  const tokens: WordToken[] = [];
  for (let i = 0; i < paras.length; i++) {
    if (i > 0) {
      tokens.push({ word: "\n\n" }); // Paragraph break marker
    }
    tokens.push(...flattenParagraph(paras[i]));
  }
  return tokens;
}

/**
 * Compare two word token arrays and produce a diff
 * Uses a simple LCS-based algorithm
 */
export function diffWords(from: WordToken[], to: WordToken[]): DiffResult[] {
  const n = from.length;
  const m = to.length;

  // Build LCS matrix
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (tokensEqual(from[i - 1], to[j - 1])) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build diff
  const result: DiffResult[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && tokensEqual(from[i - 1], to[j - 1])) {
      result.unshift({ type: "keep", word: from[i - 1].word, href: from[i - 1].href });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: "add", word: to[j - 1].word, href: to[j - 1].href });
      j--;
    } else {
      result.unshift({ type: "remove", word: from[i - 1].word, href: from[i - 1].href });
      i--;
    }
  }

  return result;
}

function tokensEqual(a: WordToken, b: WordToken): boolean {
  return a.word === b.word && a.href === b.href;
}

/**
 * Compute animation phases from a diff result
 * Returns { removes: indices[], adds: indices[] }
 */
export function computeAnimationPhases(diff: DiffResult[]): {
  removes: number[];
  adds: number[];
} {
  const removes: number[] = [];
  const adds: number[] = [];

  diff.forEach((item, idx) => {
    if (item.type === "remove") {
      removes.push(idx);
    } else if (item.type === "add") {
      adds.push(idx);
    }
  });

  // Reverse removes so they animate out in reverse order
  removes.reverse();

  return { removes, adds };
}

/**
 * Convert diff result back to a flat display format for rendering
 * (after animation is complete)
 */
export function diffToFinalTokens(diff: DiffResult[]): WordToken[] {
  return diff
    .filter((item) => item.type !== "remove")
    .map((item) => ({ word: item.word, href: item.href }));
}
