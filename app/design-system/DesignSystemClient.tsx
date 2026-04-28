"use client";

import { useState, useEffect, type CSSProperties } from "react";
import { baselineState, BASELINE_TOKENS } from "../lib/design-system/baseline-tokens";
import type { TokenGroup, TokenState } from "../lib/design-system/types";
import ControlGroup from "./ControlGroup";
import TokenInput from "./TokenInput";
import ColorGrid from "./preview/ColorGrid";

const GROUPS: { id: TokenGroup; title: string }[] = [
  { id: "colors", title: "Colors" },
  { id: "typography", title: "Typography" },
  { id: "gradients", title: "Gradients" },
];

export default function DesignSystemClient() {
  const [state, setState] = useState<TokenState>(() => baselineState());
  const [hydrated, setHydrated] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional hydration gate
  useEffect(() => setHydrated(true), []);
  if (!hydrated) return null;

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
      </aside>
      <main className="flex-1 overflow-y-auto p-10" style={overrides}>
        <section className="space-y-10">
          <div>
            <h2 className="text-h2-mobile lg:text-h2-desktop font-[var(--font-weight-h2)] mb-6">Colors</h2>
            <ColorGrid />
          </div>
        </section>
      </main>
    </div>
  );
}
