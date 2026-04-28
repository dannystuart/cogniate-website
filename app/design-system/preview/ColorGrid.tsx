import { BASELINE_TOKENS } from "../../lib/design-system/baseline-tokens";

export default function ColorGrid() {
  const colors = BASELINE_TOKENS.filter((t) => t.group === "colors");
  return (
    <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {colors.map((t) => (
        <div key={t.cssVar} className="rounded-lg border border-white/10 overflow-hidden">
          <div className="h-20" style={{ backgroundColor: `var(${t.cssVar})` }} />
          <div className="p-3 text-xs">
            <div className="text-text-primary">{t.name}</div>
            <div className="text-text-secondary font-mono mt-1">{t.cssVar}</div>
          </div>
        </div>
      ))}
    </section>
  );
}
