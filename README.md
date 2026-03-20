# CmdForge

**Build terminal commands visually. No memorizing flags.**

CmdForge is a free, open-source web app that lets you construct CLI commands through an interactive UI. Pick a tool, configure options with form fields, and copy the generated command. Nothing is executed — you just get the exact command you need.

**Live at [cmdforge.hextrot.dev](https://cmdforge.hextrot.dev)** | Part of the [hextrot.dev](https://hextrot.dev) ecosystem

---

## 60 CLI Tools, 10 Categories

| Category | Tools |
|---|---|
| **HTTP & API** | curl, wget, ssh, scp |
| **Git & Code** | git, gh, claude, cargo |
| **Containers & K8s** | docker, kubectl, helm |
| **Cloud & Deploy** | vercel, aws, terraform, gcloud, nginx, pm2, ansible-playbook, packer, vagrant |
| **Database** | mysql, psql, redis-cli, sqlite3 |
| **Media** | ffmpeg, ffprobe, magick |
| **System & Files** | tar, rsync, chmod, find, crontab, systemctl, du, ps, kill, zip, make, rclone |
| **Data & Transform** | jq, npm, pip, yarn, pnpm, sed, grep, awk, xargs, pandoc |
| **Networking** | netcat, dig, ping, traceroute, iptables, nmap, mtr, whois |
| **Security & Certs** | openssl, gpg, certbot |

## Features

- **No execution** — Commands are built, never run. Safe to use anywhere.
- **Real-time preview** — See the command update live as you toggle options.
- **AI command helper** — Describe what you want in plain English and Claude Haiku generates the command.
- **One-click copy** — Copy the full command to your clipboard instantly.
- **Config-driven architecture** — Adding a new tool requires zero new page files (see below).

## Getting Started

```bash
git clone https://github.com/hextrot/cmdforge.git
cd cmdforge
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### AI Helper (optional)

To enable the AI command helper, create a `.env.local` file:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Get a key at [console.anthropic.com](https://console.anthropic.com). The app works fully without it — AI is an optional enhancement.

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fhextrot%2Fcmdforge&env=ANTHROPIC_API_KEY&envDescription=Optional%20API%20key%20for%20AI%20command%20helper&project-name=cmdforge)

Or manually:

```bash
npm run build
vercel --prod
```

Set `ANTHROPIC_API_KEY` in Vercel environment variables if you want AI features.

## Adding a New Tool

CmdForge uses a config-driven builder. To add a tool, you only touch two files:

### 1. `src/lib/tool-registry.ts` — Tool metadata

Add an icon path to `ICONS` and a `ToolMeta` entry to `TOOLS`:

```ts
{
  slug: "mytool",
  name: "mytool",
  icon: ICONS.mytool,
  color: "blue",
  category: "System & Files",
  description: "Short description of what mytool does.",
  features: ["feature 1", "feature 2", "feature 3"],
}
```

### 2. `src/lib/tool-configs.ts` — Builder config

Add a `ToolConfig` entry to `TOOL_CONFIGS`:

```ts
mytool: {
  binary: "mytool",
  subcommands: [          // or use `sections` directly for tools without subcommands
    {
      name: "run",
      sections: [{
        title: "Options",
        defaultOpen: true,
        fields: [
          { id: "file", type: "text", label: "File", flag: "-f", placeholder: "input.txt" },
          { id: "verbose", type: "checkbox", label: "Verbose (-v)", flag: "-v" },
          { id: "format", type: "select", label: "Format", flag: "--format", options: [
            { value: "", label: "Default" },
            { value: "json", label: "JSON" },
          ]},
        ],
      }],
    },
  ],
}
```

That's it — the dynamic route at `/tools/[tool]` picks it up automatically.

### Field types

| Type | Renders as | Command output |
|---|---|---|
| `text` | Text input | `-flag value` or just `value` if `positional: true` |
| `number` | Number input | `-flag value` |
| `select` | Dropdown | `-flag value` |
| `checkbox` | Checkbox | `-flag` when checked |
| `textarea` | Multi-line input | `-flag value` |
| `keyvalue` | Key=value pairs with add/remove | `-flag key=value` per item |
| `repeatable` | List with add/remove | `-flag item` per item |

## Tech Stack

- **Next.js 15** (App Router)
- **Tailwind CSS 4**
- **TypeScript**
- **Anthropic Claude Haiku** (optional AI helper)

## License

MIT

---

Built by [hextrot](https://hextrot.dev)
