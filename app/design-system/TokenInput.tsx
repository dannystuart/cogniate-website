"use client";

import type { TokenDef } from "../lib/design-system/types";

export default function TokenInput({
  def,
  value,
  onChange,
}: {
  def: TokenDef;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="text-text-secondary">{def.name}</span>
      <div className="flex gap-2 items-center">
        {def.kind === "color" && def.baseline.startsWith("#") && (
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-8 rounded bg-transparent border border-white/10"
          />
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-bg-card border border-white/10 rounded px-2 py-1 text-text-primary"
        />
      </div>
    </label>
  );
}
