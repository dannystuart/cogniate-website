import { BASELINE_TOKENS } from "./baseline-tokens";
import type { TokenState } from "./types";

export function assembleThemeBlock(state: TokenState): string {
  const lines = BASELINE_TOKENS.map((t) => `  ${t.cssVar}: ${state[t.cssVar] ?? t.baseline};`);
  return `@theme {\n${lines.join("\n")}\n}\n`;
}

export function countChanged(state: TokenState): number {
  return BASELINE_TOKENS.reduce(
    (n, t) => (state[t.cssVar] !== undefined && state[t.cssVar] !== t.baseline ? n + 1 : n),
    0,
  );
}
