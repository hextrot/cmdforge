import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CmdForge — Visual Command Builder for 60+ CLI Tools",
  description:
    "Build terminal commands visually. No memorizing flags. Free, open-source command builder for curl, docker, ffmpeg, kubectl, git, and 55+ more CLI tools.",
  keywords: ["command builder", "curl builder", "docker builder", "ffmpeg builder", "kubectl builder", "CLI", "terminal", "devtools"],
  metadataBase: new URL("https://cmdforge.hextrot.dev"),
  openGraph: {
    title: "CmdForge — Visual Command Builder",
    description: "Build terminal commands visually. 60+ CLI tools. No memorizing flags.",
    type: "website",
    url: "https://cmdforge.hextrot.dev",
    siteName: "CmdForge",
  },
  twitter: {
    card: "summary_large_image",
    title: "CmdForge — Visual Command Builder",
    description: "Build terminal commands visually. 60+ CLI tools. No memorizing flags.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
