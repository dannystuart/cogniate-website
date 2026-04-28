import type { ReactNode } from "react";

type Props = {
  label: string;
  children: ReactNode;
  fullWidth?: boolean;
};

export default function VariantTile({ label, children, fullWidth }: Props) {
  return (
    <div
      className={`border border-white/10 rounded-md p-6 flex flex-col items-center justify-center gap-3 bg-bg-primary ${fullWidth ? "md:col-span-2" : ""}`}
    >
      <div>{children}</div>
      <code className="text-[10px] font-mono text-text-secondary mt-2">{label}</code>
    </div>
  );
}
