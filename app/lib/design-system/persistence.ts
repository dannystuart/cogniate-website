import { BASELINE_TOKENS, baselineState } from "./baseline-tokens";
import type { TokenState } from "./types";

const KEY = "design-system-tweaks";

export function saveTweaks(state: TokenState) {
  const baseline = Object.fromEntries(BASELINE_TOKENS.map((t) => [t.cssVar, t.baseline]));
  const diffs: TokenState = {};
  for (const [k, v] of Object.entries(state)) {
    if (baseline[k] !== v) diffs[k] = v;
  }
  localStorage.setItem(KEY, JSON.stringify(diffs));
}

export function loadTweaks(): TokenState {
  const raw = localStorage.getItem(KEY);
  if (!raw) return baselineState();
  try {
    const diffs = JSON.parse(raw) as TokenState;
    return { ...baselineState(), ...diffs };
  } catch {
    return baselineState();
  }
}

export function clearTweaks() {
  localStorage.removeItem(KEY);
}
