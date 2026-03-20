"use client";

import { useState, ReactNode } from "react";

interface SectionProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export default function Section({ title, defaultOpen = true, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] transition-colors text-left"
      >
        <span className="text-sm font-semibold text-[var(--color-text)]">{title}</span>
        <svg
          className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="p-4 space-y-4 bg-[var(--color-surface)]">{children}</div>
      )}
    </div>
  );
}
