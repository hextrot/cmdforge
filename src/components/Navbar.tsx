"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { TOOLS, CATEGORY_ORDER, TOOL_COLORS, getToolHref, getToolsByCategory } from "@/lib/tool-registry";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close dropdown on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const grouped = getToolsByCategory();

  // Find active tool for display
  const activeTool = TOOLS.find(
    (t) => pathname === `/${t.slug}` || pathname === `/tools/${t.slug}`,
  );

  return (
    <nav className="border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-md bg-[var(--color-accent)] flex items-center justify-center text-white text-sm font-bold">
              ⌘
            </div>
            <span className="font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent-hover)] transition-colors">
              CmdForge
            </span>
          </Link>

          {/* Tools dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                open
                  ? "bg-[var(--color-accent-dim)] text-[var(--color-accent-hover)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
              }`}
            >
              {activeTool ? (
                <>
                  <ToolIcon icon={activeTool.icon} color={activeTool.color} size={16} />
                  <span>{activeTool.name}</span>
                </>
              ) : (
                <span>Tools</span>
              )}
              <svg
                className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {open && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden"
                   style={{ width: "min(90vw, 720px)" }}>
                <div className="p-4 columns-3 gap-4" style={{ columnFill: "balance" }}>
                  {CATEGORY_ORDER.map((category) => {
                    const tools = grouped[category];
                    if (!tools?.length) return null;
                    return (
                      <div key={category} className="break-inside-avoid mb-3">
                        <div className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-2 py-1 mb-0.5">
                          {category}
                        </div>
                        {tools.map((tool) => {
                          const href = getToolHref(tool);
                          const isActive = pathname === href;
                          return (
                            <Link
                              key={tool.slug}
                              href={href}
                              className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                                isActive
                                  ? "bg-[var(--color-accent-dim)] text-[var(--color-accent-hover)]"
                                  : "text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
                              }`}
                            >
                              <ToolIcon icon={tool.icon} color={tool.color} size={16} />
                              <span className="font-medium">{tool.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <a
            href="https://hextrot.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent-hover)] transition-colors hidden sm:block"
          >
            by hextrot
          </a>
        </div>
      </div>
    </nav>
  );
}

function ToolIcon({ icon, color, size }: { icon: string; color: string; size: number }) {
  const c = TOOL_COLORS[color] ?? TOOL_COLORS.blue;
  return (
    <div
      className={`rounded ${c.bg} ${c.text} flex items-center justify-center flex-shrink-0`}
      style={{ width: size + 6, height: size + 6 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
    </div>
  );
}
