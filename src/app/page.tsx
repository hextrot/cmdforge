"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { TOOLS, CATEGORY_ORDER, TOOL_COLORS, getToolHref, getToolsByCategory } from "@/lib/tool-registry";

export default function Home() {
  const grouped = getToolsByCategory();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent-dim)] border border-[var(--color-accent)]/20 text-[var(--color-accent)] text-xs font-medium mb-6">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {TOOLS.length} CLI tools &middot; Free &amp; Open Source
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Stop memorizing
            <br />
            <span className="bg-gradient-to-r from-[var(--color-accent)] to-purple-400 bg-clip-text text-transparent">
              CLI flags.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto mb-10">
            Build terminal commands visually. Pick your tool, configure options,
            copy the command. No execution, no risk — just the command you need.
          </p>

          <div className="flex items-center justify-center gap-3 mb-16">
            <Link
              href="/curl"
              className="px-6 py-2.5 rounded-lg bg-[var(--color-accent)] text-white font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              Get Started
            </Link>
            <a
              href="https://github.com/hextrot"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] font-medium hover:bg-[var(--color-surface-2)] transition-colors"
            >
              GitHub
            </a>
          </div>

          {/* Terminal Preview */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)]">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="text-xs text-[var(--color-text-muted)] ml-2 font-mono">terminal</span>
              </div>
              <div className="p-5 text-left">
                <code className="command-output">
                  <span className="text-[var(--color-text-muted)]">$ </span>
                  <span className="text-[var(--color-success)]">ffmpeg</span>
                  <span className="text-[var(--color-text)]"> -i </span>
                  <span className="text-yellow-400">{'input.mov'}</span>
                  <span className="text-[var(--color-text)]"> \{"\n"}</span>
                  <span className="text-[var(--color-text)]">{"  "}-c:v </span>
                  <span className="text-cyan-400">libx264</span>
                  <span className="text-[var(--color-text)]"> -crf </span>
                  <span className="text-cyan-400">23</span>
                  <span className="text-[var(--color-text)]"> -preset </span>
                  <span className="text-cyan-400">medium</span>
                  <span className="text-[var(--color-text)]"> \{"\n"}</span>
                  <span className="text-[var(--color-text)]">{"  "}-c:a </span>
                  <span className="text-cyan-400">aac</span>
                  <span className="text-[var(--color-text)]"> -b:a </span>
                  <span className="text-cyan-400">128k</span>
                  <span className="text-[var(--color-text)]"> \{"\n"}</span>
                  <span className="text-[var(--color-text)]">{"  "}-vf </span>
                  <span className="text-yellow-400">{`'scale=1920:-1'`}</span>
                  <span className="text-[var(--color-text)]"> </span>
                  <span className="text-yellow-400">{'output.mp4'}</span>
                </code>
              </div>
            </div>
          </div>
        </section>

        {/* Tool Grid by Category */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          {CATEGORY_ORDER.map((category) => {
            const tools = grouped[category];
            if (!tools?.length) return null;
            return (
              <div key={category} className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                    {category}
                  </h2>
                  <div className="flex-1 h-px bg-[var(--color-border)]" />
                  <span className="text-xs text-[var(--color-text-muted)]">{tools.length} tools</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {tools.map((tool) => {
                    const c = TOOL_COLORS[tool.color] ?? TOOL_COLORS.blue;
                    return (
                      <Link
                        key={tool.slug}
                        href={getToolHref(tool)}
                        className="group flex items-start gap-3 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all hover:shadow-lg"
                      >
                        <div
                          className={`w-10 h-10 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center ${c.text} flex-shrink-0`}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={tool.icon} />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold group-hover:text-[var(--color-accent-hover)] transition-colors">
                            {tool.name}
                          </h3>
                          <p className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-2">
                            {tool.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>

        {/* Features */}
        <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
            <h2 className="text-2xl font-bold text-center mb-10">Why CmdForge?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "No Execution",
                  desc: "Commands are built, not run. Copy safely without side effects.",
                  icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
                },
                {
                  title: "AI Assisted",
                  desc: "Describe what you want in plain English. Claude Haiku generates the command.",
                  icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
                },
                {
                  title: "Real-time Preview",
                  desc: "See the exact command update live as you toggle options.",
                  icon: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
                },
                {
                  title: `${TOOLS.length} Tools`,
                  desc: "From curl to kubectl — all the CLIs you use daily, in one place.",
                  icon: "M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z",
                },
              ].map((f) => (
                <div key={f.title} className="text-center">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-dim)] flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[var(--color-border)] py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[var(--color-accent)] flex items-center justify-center text-white text-xs font-bold">
                ⌘
              </div>
              <span className="text-sm text-[var(--color-text-muted)]">
                CmdForge by{" "}
                <a href="https://hextrot.dev" className="text-[var(--color-accent)] hover:underline">
                  hextrot
                </a>
              </span>
            </div>
            <span className="text-xs text-[var(--color-text-muted)]">
              Free forever. No account needed.
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
