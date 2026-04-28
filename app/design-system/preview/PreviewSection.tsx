import type { ReactNode } from "react";

export default function PreviewSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h2 className="text-h2-mobile lg:text-h2-desktop font-[var(--font-weight-h2)] mb-6">{title}</h2>
      {children}
    </div>
  );
}
