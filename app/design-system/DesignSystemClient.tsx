"use client";

import { useState, useEffect, type CSSProperties } from "react";
import { baselineState } from "../lib/design-system/baseline-tokens";
import type { TokenState } from "../lib/design-system/types";
import ControlGroup from "./ControlGroup";

export default function DesignSystemClient() {
  const [state, setState] = useState<TokenState>(() => baselineState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);
  if (!hydrated) return null;

  const overrides = state as unknown as CSSProperties;

  return (
    <div className="flex min-h-screen bg-bg-primary text-text-primary">
      <aside className="w-[360px] shrink-0 border-r border-white/10 sticky top-0 h-screen overflow-y-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Design System</h1>
        <ControlGroup title="Colors">
          <p className="text-xs text-text-secondary">Color inputs coming next</p>
        </ControlGroup>
        <ControlGroup title="Typography">
          <p className="text-xs text-text-secondary">Typography inputs coming next</p>
        </ControlGroup>
        <ControlGroup title="Gradients">
          <p className="text-xs text-text-secondary">Gradient inputs coming next</p>
        </ControlGroup>
      </aside>
      <main className="flex-1 overflow-y-auto p-10" style={overrides}>
        <p className="text-sm text-text-secondary">Preview goes here.</p>
      </main>
    </div>
  );
}
