import { BASELINE_TOKENS } from "./baseline-tokens";
import type { TokenState } from "./types";

// @theme tokens that are not user-tunable in the design system editor
// but must be preserved in the generated block so paste-replacing
// globals.css doesn't delete them. Order matches globals.css.
const PASS_THROUGH_LINES: readonly string[] = [
  `  --color-bg-nav: rgba(16, 16, 17, 0.8);`,
  `  --color-eyebrow-from: rgba(173, 145, 218, 0.8);`,
  `  --color-eyebrow-to: rgba(92, 77, 116, 0.8);`,
  `  --font-sans: var(--font-geist-sans), system-ui, sans-serif;`,
  `  --font-serif: "Times New Roman", Times, serif;`,
  `  --font-mono: var(--font-geist-mono), monospace;`,
];

export function assembleThemeBlock(state: TokenState): string {
  const tunable = BASELINE_TOKENS.map((t) => `  ${t.cssVar}: ${state[t.cssVar] ?? t.baseline};`);
  const lines = [...tunable, ...PASS_THROUGH_LINES];
  return `@theme {\n${lines.join("\n")}\n}\n`;
}

export function countChanged(state: TokenState): number {
  return BASELINE_TOKENS.reduce(
    (n, t) => (state[t.cssVar] !== undefined && state[t.cssVar] !== t.baseline ? n + 1 : n),
    0,
  );
}
