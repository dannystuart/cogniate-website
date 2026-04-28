const SAMPLES: { name: string; cls: string }[] = [
  { name: "heading-gradient", cls: "heading-gradient" },
  { name: "landscape-heading-gradient", cls: "landscape-heading-gradient" },
  { name: "benefits-italic-gradient", cls: "benefits-italic-gradient" },
  { name: "footer-heading-gradient", cls: "footer-heading-gradient" },
];

export default function GradientSamples() {
  return (
    <div className="space-y-4">
      {SAMPLES.map((s) => (
        <div key={s.name} className="border-l-2 border-white/10 pl-4">
          <div className="text-xs text-text-secondary mb-1">.{s.name}</div>
          <div className={`${s.cls} text-h2-tablet font-[var(--font-weight-h2)] leading-[var(--leading-h2)] tracking-[var(--tracking-h2)]`}>
            The future of learning.
          </div>
        </div>
      ))}
    </div>
  );
}
