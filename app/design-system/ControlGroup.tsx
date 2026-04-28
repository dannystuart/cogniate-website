"use client";

import { useState, type ReactNode } from "react";

export default function ControlGroup({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-white/10 py-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left text-sm font-semibold uppercase tracking-wide text-text-secondary"
      >
        <span>{title}</span>
        <span className="text-xs">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="mt-3 flex flex-col gap-3">{children}</div>}
    </section>
  );
}
