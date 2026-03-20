// ─── Tool Registry ───────────────────────────────────────────────
// Central metadata for all supported CLI tools.
// Tools with `hasCustomPage: true` link to /curl, /docker, /ffmpeg.
// All others use the generic config-driven builder at /tools/[slug].

export interface ToolMeta {
  slug: string;
  name: string;
  icon: string;           // SVG path data (24×24 viewBox)
  color: string;          // tailwind color name: blue, cyan, red, etc.
  category: Category;
  description: string;
  features: string[];
  hasCustomPage?: boolean; // true → links to /<slug> instead of /tools/<slug>
}

export type Category =
  | "HTTP & API"
  | "Containers & K8s"
  | "Git & Code"
  | "Cloud & Deploy"
  | "Media"
  | "System & Files"
  | "Data & Transform"
  | "Networking"
  | "Security & Certs"
  | "Database";

export const CATEGORY_ORDER: Category[] = [
  "HTTP & API",
  "Git & Code",
  "Containers & K8s",
  "Cloud & Deploy",
  "Database",
  "Networking",
  "Security & Certs",
  "Media",
  "System & Files",
  "Data & Transform",
];

export const CATEGORY_ICONS: Record<Category, string> = {
  "HTTP & API": "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 003 12c0-1.605.42-3.113 1.157-4.418",
  "Git & Code": "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
  "Containers & K8s": "M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9",
  "Cloud & Deploy": "M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z",
  "Networking": "M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z",
  "Security & Certs": "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z",
  "Media": "M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5c0 .621-.504 1.125-1.125 1.125m1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M6 12h1.5",
  "System & Files": "M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z",
  "Data & Transform": "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
  "Database": "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125",
};

// ─── Tool-specific SVG icon paths (heroicons-style, 24x24 viewBox) ──

const ICONS = {
  curl: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244",
  wget: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3",
  ssh: "M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z",
  docker: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25-2.25M12 13.875V7.5M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z",
  kubectl: "M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9",
  ffmpeg: "M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z",
  git: "M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z",
  gh: "M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z",
  vercel: "M12 3l9.5 16.5H2.5L12 3z",
  aws: "M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z",
  terraform: "M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 00-8.862 12.872M12.75 3.031a9 9 0 016.69 14.036m0 0l-.177-.529A2.25 2.25 0 0017.128 15H16.5l-.324-.324a1.453 1.453 0 00-2.328.377l-.036.073a1.586 1.586 0 01-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643m5.276-3.67a9.012 9.012 0 01-5.276 3.67",
  npm: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125",
  pip: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125",
  tar: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z",
  rsync: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5",
  chmod: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  find: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
  scp: "M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m-6 3.75l3 3m0 0l3-3m-3 3V1.5",
  jq: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
  claude: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z",
  // ── New tool icons ──
  sed: "M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z",
  grep: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
  awk: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12",
  crontab: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
  systemctl: "M5.636 5.636a9 9 0 1012.728 0M12 3v9",
  openssl: "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z",
  netcat: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5",
  dig: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 003 12c0-1.605.42-3.113 1.157-4.418",
  ping: "M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z",
  traceroute: "M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z",
  iptables: "M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285zM12 15.75h.007v.008H12v-.008z",
  du: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125",
  ps: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6",
  kill: "M6 18L18 6M6 6l12 12",
  xargs: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
  gpg: "M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z",
  certbot: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  nginx: "M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 110 6m-16.5-3H3.75m16.5 0H20.25M6.75 9.75h.008v.008H6.75V9.75zM6.75 14.25h.008v.008H6.75v-.008zM6.75 17.25h.008v.008H6.75v-.008z",
  pm2: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m5.25-12v3.75m-3-3.75h.008v.008H9V8.25zm6 0h.008v.008H15V8.25z",
  zip: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z",
  // ── New tool icons (batch 2) ──
  mysql: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125",
  psql: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125",
  "redis-cli": "M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 110 6m-16.5-3H3.75m16.5 0H20.25M6.75 9.75h.008v.008H6.75V9.75zM6.75 14.25h.008v.008H6.75v-.008zM6.75 17.25h.008v.008H6.75v-.008z",
  sqlite3: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125",
  helm: "M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9",
  gcloud: "M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z",
  cargo: "M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437",
  yarn: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125",
  pnpm: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125",
  make: "M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437",
  nmap: "M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z",
  mtr: "M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z",
  whois: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 003 12c0-1.605.42-3.113 1.157-4.418",
  "ansible-playbook": "M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 110 6m-16.5-3H3.75m16.5 0H20.25M6.75 9.75h.008v.008H6.75V9.75zM6.75 14.25h.008v.008H6.75v-.008zM6.75 17.25h.008v.008H6.75v-.008z",
  packer: "M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9",
  vagrant: "M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z",
  pandoc: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  rclone: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5",
  ffprobe: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6",
  magick: "M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42",
};

// ─── Tool color map for tailwind classes ─────────────────────────

export const TOOL_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  blue:    { bg: "bg-blue-500/10",    border: "border-blue-500/20",    text: "text-blue-400" },
  cyan:    { bg: "bg-cyan-500/10",    border: "border-cyan-500/20",    text: "text-cyan-400" },
  red:     { bg: "bg-red-500/10",     border: "border-red-500/20",     text: "text-red-400" },
  orange:  { bg: "bg-orange-500/10",  border: "border-orange-500/20",  text: "text-orange-400" },
  purple:  { bg: "bg-purple-500/10",  border: "border-purple-500/20",  text: "text-purple-400" },
  green:   { bg: "bg-green-500/10",   border: "border-green-500/20",   text: "text-green-400" },
  amber:   { bg: "bg-amber-500/10",   border: "border-amber-500/20",   text: "text-amber-400" },
  pink:    { bg: "bg-pink-500/10",    border: "border-pink-500/20",    text: "text-pink-400" },
  teal:    { bg: "bg-teal-500/10",    border: "border-teal-500/20",    text: "text-teal-400" },
  indigo:  { bg: "bg-indigo-500/10",  border: "border-indigo-500/20",  text: "text-indigo-400" },
  white:   { bg: "bg-white/5",        border: "border-white/10",       text: "text-white" },
};

// ─── Full tool list ──────────────────────────────────────────────

export const TOOLS: ToolMeta[] = [
  // ── HTTP & API ──
  {
    slug: "curl",
    name: "curl",
    icon: ICONS.curl,
    color: "blue",
    category: "HTTP & API",
    description: "Build HTTP requests visually. Configure methods, headers, auth, body, and dozens of options.",
    features: ["GET / POST / PUT / DELETE", "Headers & Auth", "Body & Form Data", "Proxy & Timeouts"],
    hasCustomPage: true,
  },
  {
    slug: "wget",
    name: "wget",
    icon: ICONS.wget,
    color: "blue",
    category: "HTTP & API",
    description: "Download files, mirror websites, and manage recursive downloads with resumable transfers.",
    features: ["File Downloads", "Recursive Mirror", "Resume Support", "Rate Limiting"],
  },
  {
    slug: "ssh",
    name: "ssh",
    icon: ICONS.ssh,
    color: "green",
    category: "HTTP & API",
    description: "Build SSH connections, port tunnels, and jump host chains. Configure keys and ciphers.",
    features: ["Remote Connect", "Port Forwarding", "Jump Hosts", "Key Auth"],
  },
  {
    slug: "scp",
    name: "scp",
    icon: ICONS.scp,
    color: "green",
    category: "HTTP & API",
    description: "Securely copy files between hosts over SSH with compression and bandwidth control.",
    features: ["Local → Remote", "Remote → Local", "Recursive Copy", "Compression"],
  },

  // ── Git & Code ──
  {
    slug: "git",
    name: "git",
    icon: ICONS.git,
    color: "orange",
    category: "Git & Code",
    description: "Version control operations. Clone, commit, branch, merge, rebase, and manage remotes.",
    features: ["clone / commit / push", "branch / merge", "rebase / stash", "log / diff"],
  },
  {
    slug: "gh",
    name: "gh",
    icon: ICONS.gh,
    color: "white",
    category: "Git & Code",
    description: "GitHub from the terminal. Create PRs, manage issues, browse repos, and trigger workflows.",
    features: ["PR Create / List", "Issue Management", "Repo Operations", "Actions & Releases"],
  },
  {
    slug: "claude",
    name: "claude",
    icon: ICONS.claude,
    color: "orange",
    category: "Git & Code",
    description: "Claude Code CLI for AI-assisted development. Run prompts, manage sessions, and configure tools.",
    features: ["Interactive Chat", "Code Generation", "Session Resume", "Tool Configuration"],
  },

  // ── Containers & K8s ──
  {
    slug: "docker",
    name: "docker",
    icon: ICONS.docker,
    color: "cyan",
    category: "Containers & K8s",
    description: "Compose container commands. Supports run, build, exec, and compose with full option coverage.",
    features: ["run / build / exec", "compose", "Port & Volume Mapping", "Resource Limits"],
    hasCustomPage: true,
  },
  {
    slug: "kubectl",
    name: "kubectl",
    icon: ICONS.kubectl,
    color: "purple",
    category: "Containers & K8s",
    description: "Kubernetes cluster management. Get resources, apply manifests, debug pods, and scale deployments.",
    features: ["get / describe / logs", "apply / delete", "exec / port-forward", "scale / rollout"],
  },

  // ── Cloud & Deploy ──
  {
    slug: "vercel",
    name: "vercel",
    icon: ICONS.vercel,
    color: "white",
    category: "Cloud & Deploy",
    description: "Deploy to Vercel from the command line. Manage environments, domains, and deployment logs.",
    features: ["deploy / dev", "env / domains", "logs / inspect", "Project Config"],
  },
  {
    slug: "aws",
    name: "aws",
    icon: ICONS.aws,
    color: "amber",
    category: "Cloud & Deploy",
    description: "AWS CLI for S3, EC2, Lambda, and more. Build complex cloud operations visually.",
    features: ["s3 cp / sync / ls", "ec2 describe", "lambda invoke", "iam / sts"],
  },
  {
    slug: "terraform",
    name: "terraform",
    icon: ICONS.terraform,
    color: "purple",
    category: "Cloud & Deploy",
    description: "Infrastructure as code commands. Plan, apply, and destroy with variable and state management.",
    features: ["init / plan / apply", "destroy / import", "state management", "Variables & Backends"],
  },

  // ── Media ──
  {
    slug: "ffmpeg",
    name: "ffmpeg",
    icon: ICONS.ffmpeg,
    color: "red",
    category: "Media",
    description: "Build media processing pipelines. Convert, trim, create GIFs, extract audio, and more.",
    features: ["Convert & Transcode", "Trim & GIF", "Audio Extraction", "Video Filters"],
    hasCustomPage: true,
  },

  // ── System & Files ──
  {
    slug: "tar",
    name: "tar",
    icon: ICONS.tar,
    color: "amber",
    category: "System & Files",
    description: "Create and extract archives. Support for gzip, bzip2, xz, and zstd compression.",
    features: ["Create / Extract / List", "gzip / bzip2 / xz", "Exclude Patterns", "Preserve Perms"],
  },
  {
    slug: "rsync",
    name: "rsync",
    icon: ICONS.rsync,
    color: "teal",
    category: "System & Files",
    description: "Fast, versatile file synchronization. Local and remote transfers with delta encoding.",
    features: ["Local & Remote Sync", "Dry Run", "Exclude / Include", "Bandwidth Limit"],
  },
  {
    slug: "chmod",
    name: "chmod",
    icon: ICONS.chmod,
    color: "amber",
    category: "System & Files",
    description: "Change file permissions using symbolic or octal notation. Recursive support included.",
    features: ["Octal Mode", "Symbolic Mode", "Recursive", "Reference File"],
  },
  {
    slug: "find",
    name: "find",
    icon: ICONS.find,
    color: "teal",
    category: "System & Files",
    description: "Search files by name, type, size, date, and permissions. Execute commands on results.",
    features: ["Name & Pattern", "Type & Size", "Date Filters", "-exec Actions"],
  },

  // ── Data & Transform ──
  {
    slug: "jq",
    name: "jq",
    icon: ICONS.jq,
    color: "green",
    category: "Data & Transform",
    description: "JSON processor. Filter, transform, and extract data from JSON with powerful expressions.",
    features: ["Select & Filter", "Map & Reduce", "String Interpolation", "Multiple Outputs"],
  },
  {
    slug: "npm",
    name: "npm",
    icon: ICONS.npm,
    color: "red",
    category: "Data & Transform",
    description: "Node package manager. Install, publish, audit, and manage project dependencies.",
    features: ["install / uninstall", "run / exec", "publish / pack", "audit / outdated"],
  },
  {
    slug: "pip",
    name: "pip",
    icon: ICONS.pip,
    color: "indigo",
    category: "Data & Transform",
    description: "Python package installer. Install from PyPI, requirements files, and manage virtual environments.",
    features: ["install / uninstall", "freeze / list", "Requirements File", "Index Options"],
  },

  // ── Data & Transform (continued) ──
  {
    slug: "sed",
    name: "sed",
    icon: ICONS.sed,
    color: "green",
    category: "Data & Transform",
    description: "Stream editor for filtering and transforming text. Find-and-replace, delete lines, and more.",
    features: ["Find & Replace", "Delete Lines", "In-place Edit", "Regex Patterns"],
  },
  {
    slug: "grep",
    name: "grep",
    icon: ICONS.grep,
    color: "teal",
    category: "Data & Transform",
    description: "Search text using patterns. Filter files and streams with regular expressions and fixed strings.",
    features: ["Regex Search", "Recursive File Search", "Context Lines", "Count & List Files"],
  },
  {
    slug: "awk",
    name: "awk",
    icon: ICONS.awk,
    color: "amber",
    category: "Data & Transform",
    description: "Pattern scanning and text processing language. Extract columns, compute stats, and transform data.",
    features: ["Column Extraction", "Pattern Matching", "Field Separator", "Built-in Variables"],
  },
  {
    slug: "xargs",
    name: "xargs",
    icon: ICONS.xargs,
    color: "teal",
    category: "Data & Transform",
    description: "Build and execute commands from standard input. Parallelize work and batch process arguments.",
    features: ["Pipe to Commands", "Parallel Execution", "Batch Size", "Null Delimiter"],
  },

  // ── System & Files (continued) ──
  {
    slug: "crontab",
    name: "crontab",
    icon: ICONS.crontab,
    color: "purple",
    category: "System & Files",
    description: "Schedule recurring tasks with cron expressions. List, edit, and manage cron jobs.",
    features: ["List Jobs", "Edit Schedule", "Cron Expressions", "User Crontabs"],
  },
  {
    slug: "systemctl",
    name: "systemctl",
    icon: ICONS.systemctl,
    color: "red",
    category: "System & Files",
    description: "Control systemd services and the system manager. Start, stop, enable, and inspect services.",
    features: ["start / stop / restart", "enable / disable", "status / logs", "daemon-reload"],
  },
  {
    slug: "du",
    name: "du",
    icon: ICONS.du,
    color: "amber",
    category: "System & Files",
    description: "Estimate file and directory space usage. Find large files and summarize disk consumption.",
    features: ["Human-readable Sizes", "Summary Mode", "Max Depth", "Sort by Size"],
  },
  {
    slug: "ps",
    name: "ps",
    icon: ICONS.ps,
    color: "indigo",
    category: "System & Files",
    description: "Report a snapshot of current processes. Filter by user, PID, and display resource usage.",
    features: ["All Processes", "Custom Format", "Tree View", "Sort by CPU/Memory"],
  },
  {
    slug: "kill",
    name: "kill",
    icon: ICONS.kill,
    color: "red",
    category: "System & Files",
    description: "Send signals to processes. Terminate, interrupt, or send custom signals by PID or name.",
    features: ["SIGTERM / SIGKILL", "Signal by Name", "Kill by PID", "killall by Name"],
  },
  {
    slug: "zip",
    name: "zip",
    icon: ICONS.zip,
    color: "amber",
    category: "System & Files",
    description: "Package and compress files into ZIP archives. Create, extract, and list archive contents.",
    features: ["Create / Extract", "Password Protect", "Compression Level", "Exclude Patterns"],
  },

  // ── Networking ──
  {
    slug: "netcat",
    name: "netcat",
    icon: ICONS.netcat,
    color: "cyan",
    category: "Networking",
    description: "TCP/UDP networking utility. Port scanning, file transfer, and simple client-server connections.",
    features: ["Port Scanning", "Listen Mode", "File Transfer", "TCP & UDP"],
  },
  {
    slug: "dig",
    name: "dig",
    icon: ICONS.dig,
    color: "blue",
    category: "Networking",
    description: "DNS lookup utility. Query DNS records, trace resolution paths, and debug name servers.",
    features: ["A / AAAA / MX / CNAME", "Reverse Lookup", "Trace Mode", "Custom DNS Server"],
  },
  {
    slug: "ping",
    name: "ping",
    icon: ICONS.ping,
    color: "green",
    category: "Networking",
    description: "Test network connectivity to a host. Measure round-trip time and detect packet loss.",
    features: ["ICMP Echo", "Count Limit", "Interval Control", "TTL & Packet Size"],
  },
  {
    slug: "traceroute",
    name: "traceroute",
    icon: ICONS.traceroute,
    color: "purple",
    category: "Networking",
    description: "Trace the route packets take to a network host. Identify hops, latency, and routing paths.",
    features: ["Hop-by-hop Trace", "Max Hops", "ICMP / UDP / TCP", "DNS Resolution"],
  },
  {
    slug: "iptables",
    name: "iptables",
    icon: ICONS.iptables,
    color: "red",
    category: "Networking",
    description: "Linux firewall administration. Manage packet filtering rules for INPUT, OUTPUT, and FORWARD chains.",
    features: ["ACCEPT / DROP / REJECT", "Port Filtering", "Chain Management", "NAT & Masquerade"],
  },

  // ── Security & Certs ──
  {
    slug: "openssl",
    name: "openssl",
    icon: ICONS.openssl,
    color: "orange",
    category: "Security & Certs",
    description: "Cryptography and SSL/TLS toolkit. Generate keys, create CSRs, inspect certificates, and encrypt data.",
    features: ["Generate Keys", "Create CSR", "Self-signed Certs", "Inspect Certs"],
  },
  {
    slug: "gpg",
    name: "gpg",
    icon: ICONS.gpg,
    color: "green",
    category: "Security & Certs",
    description: "GNU Privacy Guard for encryption and signing. Manage keyrings, encrypt files, and verify signatures.",
    features: ["Encrypt / Decrypt", "Sign / Verify", "Key Management", "Armor Output"],
  },
  {
    slug: "certbot",
    name: "certbot",
    icon: ICONS.certbot,
    color: "blue",
    category: "Security & Certs",
    description: "Obtain and renew Let's Encrypt SSL certificates. Automate HTTPS setup for web servers.",
    features: ["certonly / renew", "Webroot / Standalone", "Nginx / Apache Plugin", "Dry Run"],
  },

  // ── Cloud & Deploy (continued) ──
  {
    slug: "nginx",
    name: "nginx",
    icon: ICONS.nginx,
    color: "green",
    category: "Cloud & Deploy",
    description: "Nginx web server control. Test configuration, reload, and manage the server process.",
    features: ["Config Test", "Reload / Restart", "Signal Control", "Custom Config Path"],
  },
  {
    slug: "pm2",
    name: "pm2",
    icon: ICONS.pm2,
    color: "purple",
    category: "Cloud & Deploy",
    description: "Node.js process manager. Start, monitor, and manage application processes with clustering.",
    features: ["start / stop / restart", "logs / monit", "Cluster Mode", "Ecosystem File"],
  },

  // ── Database ──
  {
    slug: "mysql",
    name: "mysql",
    icon: ICONS.mysql,
    color: "blue",
    category: "Database",
    description: "MySQL command-line client. Connect, query, import, and manage databases from the terminal.",
    features: ["Connect & Query", "Import / Export", "Database Selection", "Output Formats"],
  },
  {
    slug: "psql",
    name: "psql",
    icon: ICONS.psql,
    color: "indigo",
    category: "Database",
    description: "PostgreSQL interactive terminal. Run queries, manage schemas, and import/export data.",
    features: ["Connect & Query", "Execute Commands", "CSV / HTML Output", "Variable Binding"],
  },
  {
    slug: "redis-cli",
    name: "redis-cli",
    icon: ICONS["redis-cli"],
    color: "red",
    category: "Database",
    description: "Redis command-line interface. Connect to Redis instances, run commands, and monitor activity.",
    features: ["Connect & Auth", "Run Commands", "Pub/Sub Monitor", "Cluster Support"],
  },
  {
    slug: "sqlite3",
    name: "sqlite3",
    icon: ICONS.sqlite3,
    color: "cyan",
    category: "Database",
    description: "SQLite database command-line tool. Query, import CSV, export data, and inspect schemas.",
    features: ["Query & Execute", "CSV Import/Export", "Schema Inspect", "Output Modes"],
  },

  // ── Containers & K8s (continued) ──
  {
    slug: "helm",
    name: "helm",
    icon: ICONS.helm,
    color: "blue",
    category: "Containers & K8s",
    description: "Kubernetes package manager. Install, upgrade, and manage Helm charts and releases.",
    features: ["install / upgrade", "rollback / uninstall", "repo add / update", "values override"],
  },

  // ── Cloud & Deploy (continued) ──
  {
    slug: "gcloud",
    name: "gcloud",
    icon: ICONS.gcloud,
    color: "blue",
    category: "Cloud & Deploy",
    description: "Google Cloud CLI. Manage compute instances, storage, projects, and cloud configurations.",
    features: ["compute instances", "config set", "auth login", "project management"],
  },
  {
    slug: "ansible-playbook",
    name: "ansible-playbook",
    icon: ICONS["ansible-playbook"],
    color: "red",
    category: "Cloud & Deploy",
    description: "Run Ansible playbooks for configuration management and application deployment.",
    features: ["Playbook Execution", "Inventory & Limits", "Extra Variables", "Check Mode"],
  },
  {
    slug: "packer",
    name: "packer",
    icon: ICONS.packer,
    color: "cyan",
    category: "Cloud & Deploy",
    description: "Build automated machine images. Create identical images for multiple platforms from one config.",
    features: ["build / validate", "init / fmt", "Variable Files", "Force Rebuild"],
  },
  {
    slug: "vagrant",
    name: "vagrant",
    icon: ICONS.vagrant,
    color: "blue",
    category: "Cloud & Deploy",
    description: "Development environment manager. Create, provision, and manage virtual machines easily.",
    features: ["up / halt / destroy", "ssh / provision", "box manage", "snapshot"],
  },

  // ── Git & Code (continued) ──
  {
    slug: "cargo",
    name: "cargo",
    icon: ICONS.cargo,
    color: "orange",
    category: "Git & Code",
    description: "Rust package manager and build system. Build, test, run, and publish Rust projects.",
    features: ["build / run / test", "new / init", "add / remove", "clippy / fmt"],
  },

  // ── Data & Transform (continued) ──
  {
    slug: "yarn",
    name: "yarn",
    icon: ICONS.yarn,
    color: "blue",
    category: "Data & Transform",
    description: "Fast, reliable JavaScript package manager. Install, run scripts, and manage workspaces.",
    features: ["add / remove", "run / dlx", "workspaces", "cache clean"],
  },
  {
    slug: "pnpm",
    name: "pnpm",
    icon: ICONS.pnpm,
    color: "amber",
    category: "Data & Transform",
    description: "Efficient Node.js package manager with content-addressable storage and strict isolation.",
    features: ["add / remove", "run / dlx", "workspaces", "store prune"],
  },
  {
    slug: "pandoc",
    name: "pandoc",
    icon: ICONS.pandoc,
    color: "teal",
    category: "Data & Transform",
    description: "Universal document converter. Transform between Markdown, HTML, PDF, DOCX, and many more formats.",
    features: ["Format Conversion", "PDF Generation", "Templates", "Filters & Metadata"],
  },

  // ── System & Files (continued) ──
  {
    slug: "make",
    name: "make",
    icon: ICONS.make,
    color: "green",
    category: "System & Files",
    description: "Build automation tool. Execute targets from Makefiles with dependency tracking and parallel jobs.",
    features: ["Target Execution", "Parallel Jobs", "Variable Override", "Dry Run"],
  },
  {
    slug: "rclone",
    name: "rclone",
    icon: ICONS.rclone,
    color: "teal",
    category: "System & Files",
    description: "Cloud storage sync tool. Copy, sync, and mount files across S3, GCS, Dropbox, and 40+ providers.",
    features: ["copy / sync / move", "mount / serve", "Bandwidth Limit", "Dry Run"],
  },

  // ── Networking (continued) ──
  {
    slug: "nmap",
    name: "nmap",
    icon: ICONS.nmap,
    color: "red",
    category: "Networking",
    description: "Network scanner and security auditing tool. Discover hosts, ports, services, and vulnerabilities.",
    features: ["Port Scanning", "OS Detection", "Service Versions", "Script Engine"],
  },
  {
    slug: "mtr",
    name: "mtr",
    icon: ICONS.mtr,
    color: "cyan",
    category: "Networking",
    description: "Network diagnostic tool combining ping and traceroute. Real-time path analysis with packet stats.",
    features: ["Live Trace", "Packet Loss Stats", "Report Mode", "TCP / UDP / ICMP"],
  },
  {
    slug: "whois",
    name: "whois",
    icon: ICONS.whois,
    color: "indigo",
    category: "Networking",
    description: "Query domain registration and IP address information from WHOIS databases.",
    features: ["Domain Lookup", "IP Lookup", "Registrar Info", "Custom Server"],
  },

  // ── Media (continued) ──
  {
    slug: "ffprobe",
    name: "ffprobe",
    icon: ICONS.ffprobe,
    color: "orange",
    category: "Media",
    description: "Media file inspector. Analyze streams, codecs, bitrates, and metadata from audio/video files.",
    features: ["Stream Info", "Format Details", "JSON Output", "Frame Analysis"],
  },
  {
    slug: "magick",
    name: "magick",
    icon: ICONS.magick,
    color: "pink",
    category: "Media",
    description: "ImageMagick image processing. Resize, convert, composite, and apply effects to images.",
    features: ["Resize & Crop", "Format Convert", "Quality Control", "Filters & Effects"],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────

export function getToolBySlug(slug: string): ToolMeta | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export function getToolsByCategory(): Record<Category, ToolMeta[]> {
  const grouped: Record<string, ToolMeta[]> = {};
  for (const tool of TOOLS) {
    if (!grouped[tool.category]) grouped[tool.category] = [];
    grouped[tool.category].push(tool);
  }
  return grouped as Record<Category, ToolMeta[]>;
}

export function getToolHref(tool: ToolMeta): string {
  return tool.hasCustomPage ? `/${tool.slug}` : `/tools/${tool.slug}`;
}
