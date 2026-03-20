import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CmdForge — Visual Command Builder for curl, docker & ffmpeg",
  description:
    "Build terminal commands visually. No memorizing flags. Free, open-source command builder for curl, docker, and ffmpeg.",
  keywords: ["command builder", "curl builder", "docker builder", "ffmpeg builder", "CLI", "terminal"],
  openGraph: {
    title: "CmdForge",
    description: "Build terminal commands visually. No memorizing flags.",
    type: "website",
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
