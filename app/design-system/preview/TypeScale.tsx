const ROWS: { label: string; classes: string }[] = [
  { label: "h1", classes: "text-h1-mobile sm:text-h1-tablet lg:text-h1-desktop font-[var(--font-weight-h1)] leading-[var(--leading-h1)] tracking-[var(--tracking-h1)]" },
  { label: "h1 italic", classes: "font-serif italic text-h1-italic-mobile sm:text-h1-italic-tablet lg:text-h1-italic-desktop tracking-[var(--tracking-h1)]" },
  { label: "h2", classes: "text-h2-mobile sm:text-h2-tablet lg:text-h2-desktop font-[var(--font-weight-h2)] leading-[var(--leading-h2)] tracking-[var(--tracking-h2)]" },
  { label: "Body", classes: "text-body" },
  { label: "Body — large", classes: "text-body-lg" },
];

export default function TypeScale() {
  return (
    <div className="space-y-6">
      {ROWS.map((row) => (
        <div key={row.label} className="border-l-2 border-white/10 pl-4">
          <div className="text-xs text-text-secondary mb-1">{row.label}</div>
          <div className={row.classes}>The future of learning, authored in minutes.</div>
        </div>
      ))}
    </div>
  );
}
