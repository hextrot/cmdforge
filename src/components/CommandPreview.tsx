"use client";

import { useState } from "react";

interface CommandPreviewProps {
  command: string;
}

export default function CommandPreview({ command }: CommandPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sticky bottom-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] glow-accent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            Command Output
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
        <div className="bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)] p-4 overflow-x-auto">
          <code className="command-output text-[var(--color-success)]">
            <span className="text-[var(--color-text-muted)] select-none">$ </span>
            {command || <span className="text-[var(--color-text-muted)] italic">Configure options above to build your command...</span>}
          </code>
        </div>
      </div>
    </div>
  );
}
