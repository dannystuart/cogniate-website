import type { ReactNode } from "react";

type Props = {
  title: string;
  importPath: string;
  children: ReactNode;
};

export default function LibraryCard({ title, importPath, children }: Props) {
  return (
    <div className="border border-white/10 rounded-lg p-6 bg-bg-secondary">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <code className="block text-xs font-mono text-text-secondary mt-1">{importPath}</code>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}
