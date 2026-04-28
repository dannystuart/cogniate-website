"use client";

import { useState, useEffect, type CSSProperties } from "react";
import { baselineState, BASELINE_TOKENS } from "../lib/design-system/baseline-tokens";
import { loadTweaks, saveTweaks, clearTweaks } from "../lib/design-system/persistence";
import type { TokenGroup, TokenState } from "../lib/design-system/types";
import ControlGroup from "./ControlGroup";
import TokenInput from "./TokenInput";
import ColorGrid from "./preview/ColorGrid";
import TypeScale from "./preview/TypeScale";
import GradientSamples from "./preview/GradientSamples";
import ComponentExcerpts from "./preview/ComponentExcerpts";
import PreviewSection from "./preview/PreviewSection";

const GROUPS: { id: TokenGroup; title: string }[] = [
  { id: "colors", title: "Colors" },
  { id: "typography", title: "Typography" },
  { id: "gradients", title: "Gradients" },
];

export default function DesignSystemClient() {
  const [state, setState] = useState<TokenState>(() => baselineState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional hydration gate, load persisted tweaks client-side
    setState(loadTweaks());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const id = setTimeout(() => saveTweaks(state), 200);
    return () => clearTimeout(id);
  }, [state, hydrated]);

  if (!hydrated) return null;

  const reset = () => {
    clearTweaks();
    setState(baselineState());
  };

  const overrides: CSSProperties = state;

  return (
    <div className="flex min-h-screen bg-bg-primary text-text-primary">
      <aside className="w-[360px] shrink-0 border-r border-white/10 sticky top-0 h-screen overflow-y-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Design System</h1>
        {GROUPS.map((g) => (
          <ControlGroup key={g.id} title={g.title}>
            {BASELINE_TOKENS.filter((t) => t.group === g.id).map((t) => (
              <TokenInput
                key={t.cssVar}
                def={t}
                value={state[t.cssVar] ?? t.baseline}
                onChange={(v) => setState((s) => ({ ...s, [t.cssVar]: v }))}
              />
            ))}
          </ControlGroup>
        ))}
        <button
          type="button"
          onClick={reset}
          className="mt-6 w-full text-sm border border-white/10 rounded px-3 py-2 hover:border-white/30"
        >
          Reset to baseline
        </button>
      </aside>
      <main className="flex-1 overflow-y-auto p-10" style={overrides}>
        <section className="space-y-10">
          <PreviewSection title="Colors">
            <ColorGrid />
          </PreviewSection>
          <PreviewSection title="Typography">
            <TypeScale />
          </PreviewSection>
          <PreviewSection title="Gradients">
            <GradientSamples />
          </PreviewSection>
          <PreviewSection title="Components">
            <ComponentExcerpts />
          </PreviewSection>
        </section>
      </main>
    </div>
  );
}
