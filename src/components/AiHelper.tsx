"use client";

import { useState } from "react";

interface AiHelperProps {
  tool: string;
  onCommandGenerated: (command: string) => void;
}

export default function AiHelper({ tool, onCommandGenerated }: AiHelperProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool, prompt: prompt.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate command");
      }

      const data = await res.json();
      onCommandGenerated(data.command);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded bg-gradient-to-br from-[var(--color-accent)] to-purple-500 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-[var(--color-text)]">AI Command Helper</span>
        <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-2)] px-2 py-0.5 rounded-full">
          Powered by Claude Haiku
        </span>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={`Describe what you want to do with ${tool}...`}
          className="flex-1 px-3 py-2 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] transition-field focus:outline-none"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !prompt.trim()}
          className="px-4 py-2 rounded-md text-sm font-medium bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {loading ? (
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating...
            </span>
          ) : (
            "Generate"
          )}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-[var(--color-danger)]">{error}</p>
      )}
    </div>
  );
}
