// ─── Config-driven CLI builder definitions ──────────────────────
// Each tool config defines subcommands → sections → fields.
// The GenericBuilder component renders these into interactive forms
// and assembles the final CLI command from field values.

export type FieldType = "text" | "select" | "checkbox" | "number" | "textarea" | "keyvalue" | "repeatable";

export interface BaseField {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  halfWidth?: boolean;      // render in 2-col grid
}

export interface TextField extends BaseField {
  type: "text";
  flag: string;
  placeholder?: string;
  positional?: boolean;     // no flag, just the value
  quoted?: boolean;         // wrap value in single quotes
}

export interface SelectField extends BaseField {
  type: "select";
  flag: string;
  options: { value: string; label: string }[];
}

export interface CheckboxField extends BaseField {
  type: "checkbox";
  flag: string;
}

export interface NumberField extends BaseField {
  type: "number";
  flag: string;
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface TextareaField extends BaseField {
  type: "textarea";
  flag: string;
  placeholder?: string;
  rows?: number;
  quoted?: boolean;
}

export interface KeyValueField extends BaseField {
  type: "keyvalue";
  flag: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  separator?: string;       // default "="
  addLabel?: string;
}

export interface RepeatableField extends BaseField {
  type: "repeatable";
  flag: string;
  placeholder?: string;
  addLabel?: string;
}

export type Field =
  | TextField
  | SelectField
  | CheckboxField
  | NumberField
  | TextareaField
  | KeyValueField
  | RepeatableField;

export interface Section {
  title: string;
  defaultOpen?: boolean;
  fields: Field[];
}

export interface Subcommand {
  name: string;
  label?: string;
  sections: Section[];
}

export interface ToolConfig {
  binary: string;
  subcommands?: Subcommand[];
  sections?: Section[];     // for tools without subcommands
}

// ─── Build command from config + values ──────────────────────────

export function buildCommand(
  config: ToolConfig,
  activeSubcommand: string | null,
  values: Record<string, unknown>,
): string {
  const parts: string[] = [config.binary];

  const sections = activeSubcommand
    ? config.subcommands?.find((s) => s.name === activeSubcommand)?.sections
    : config.sections;

  if (activeSubcommand) parts.push(activeSubcommand);
  if (!sections) return parts.join(" ");

  for (const section of sections) {
    for (const field of section.fields) {
      const val = values[field.id];

      switch (field.type) {
        case "checkbox":
          if (val === true) parts.push(field.flag);
          break;

        case "text":
        case "number":
          if (val !== undefined && val !== "") {
            if (field.type === "text" && field.positional) {
              parts.push(field.quoted ? `'${val}'` : String(val));
            } else {
              parts.push(`${field.flag} ${field.type === "text" && field.quoted ? `'${val}'` : val}`);
            }
          }
          break;

        case "textarea":
          if (val !== undefined && val !== "") {
            parts.push(`${field.flag} ${field.quoted ? `'${val}'` : val}`);
          }
          break;

        case "select":
          if (val !== undefined && val !== "") {
            if (field.flag) {
              parts.push(`${field.flag} ${val}`);
            } else {
              parts.push(String(val));
            }
          }
          break;

        case "keyvalue": {
          const items = val as { key: string; value: string }[] | undefined;
          const sep = field.separator ?? "=";
          items?.forEach((item) => {
            if (item.key) {
              parts.push(`${field.flag} ${item.key}${item.value ? `${sep}${item.value}` : ""}`);
            }
          });
          break;
        }

        case "repeatable": {
          const list = val as string[] | undefined;
          list?.forEach((item) => {
            if (item) parts.push(`${field.flag} ${item}`);
          });
          break;
        }
      }
    }
  }

  return parts.join(" \\\n  ");
}

// ═══════════════════════════════════════════════════════════════════
// TOOL CONFIGS
// ═══════════════════════════════════════════════════════════════════

export const TOOL_CONFIGS: Record<string, ToolConfig> = {

  // ── wget ──────────────────────────────────────────────────────
  wget: {
    binary: "wget",
    sections: [
      {
        title: "Target",
        defaultOpen: true,
        fields: [
          { id: "url", type: "text", label: "URL", flag: "", positional: true, placeholder: "https://example.com/file.zip", required: true, quoted: true },
        ],
      },
      {
        title: "Output",
        defaultOpen: true,
        fields: [
          { id: "output", type: "text", label: "Output File (-O)", flag: "-O", placeholder: "filename.zip", halfWidth: true },
          { id: "directory", type: "text", label: "Directory Prefix (-P)", flag: "-P", placeholder: "./downloads", halfWidth: true },
          { id: "quiet", type: "checkbox", label: "Quiet (-q)", flag: "-q" },
          { id: "verbose", type: "checkbox", label: "Verbose", flag: "-v" },
        ],
      },
      {
        title: "Download Options",
        fields: [
          { id: "continue", type: "checkbox", label: "Continue partial download (-c)", flag: "-c" },
          { id: "recursive", type: "checkbox", label: "Recursive (-r)", flag: "-r" },
          { id: "level", type: "number", label: "Recursion Depth (-l)", flag: "-l", placeholder: "5", halfWidth: true },
          { id: "mirror", type: "checkbox", label: "Mirror (--mirror)", flag: "--mirror" },
          { id: "tries", type: "number", label: "Retries (-t)", flag: "-t", placeholder: "3", halfWidth: true },
          { id: "waitretry", type: "number", label: "Retry Wait (s)", flag: "--waitretry", placeholder: "10", halfWidth: true },
          { id: "timeout", type: "number", label: "Timeout (s)", flag: "-T", placeholder: "30", halfWidth: true },
          { id: "limitrate", type: "text", label: "Rate Limit", flag: "--limit-rate", placeholder: "200k", halfWidth: true },
        ],
      },
      {
        title: "Advanced",
        defaultOpen: false,
        fields: [
          { id: "useragent", type: "text", label: "User-Agent (-U)", flag: "-U", placeholder: "Mozilla/5.0...", quoted: true },
          { id: "header", type: "repeatable", label: "Headers (--header)", flag: "--header", placeholder: "Accept: text/html", addLabel: "+ Add Header" },
          { id: "nocheckcert", type: "checkbox", label: "Skip TLS verify (--no-check-certificate)", flag: "--no-check-certificate" },
          { id: "user", type: "text", label: "HTTP User (--user)", flag: "--user", placeholder: "username", halfWidth: true },
          { id: "password", type: "text", label: "HTTP Password (--password)", flag: "--password", placeholder: "password", halfWidth: true },
          { id: "noproxy", type: "checkbox", label: "No proxy (--no-proxy)", flag: "--no-proxy" },
        ],
      },
    ],
  },

  // ── ssh ───────────────────────────────────────────────────────
  ssh: {
    binary: "ssh",
    sections: [
      {
        title: "Connection",
        defaultOpen: true,
        fields: [
          { id: "user", type: "text", label: "User", flag: "-l", placeholder: "root", halfWidth: true },
          { id: "host", type: "text", label: "Host", flag: "", positional: true, placeholder: "192.168.1.100", required: true, halfWidth: true },
          { id: "port", type: "number", label: "Port (-p)", flag: "-p", placeholder: "22", halfWidth: true },
          { id: "identity", type: "text", label: "Identity File (-i)", flag: "-i", placeholder: "~/.ssh/id_ed25519", halfWidth: true },
        ],
      },
      {
        title: "Tunneling",
        defaultOpen: false,
        fields: [
          { id: "localfwd", type: "repeatable", label: "Local Forward (-L)", flag: "-L", placeholder: "8080:localhost:80", addLabel: "+ Add Tunnel" },
          { id: "remotefwd", type: "repeatable", label: "Remote Forward (-R)", flag: "-R", placeholder: "9090:localhost:3000", addLabel: "+ Add Tunnel" },
          { id: "dynamicfwd", type: "text", label: "Dynamic / SOCKS (-D)", flag: "-D", placeholder: "1080", halfWidth: true },
        ],
      },
      {
        title: "Options",
        defaultOpen: false,
        fields: [
          { id: "verbose", type: "checkbox", label: "Verbose (-v)", flag: "-v" },
          { id: "compress", type: "checkbox", label: "Compression (-C)", flag: "-C" },
          { id: "nopseudotty", type: "checkbox", label: "Force TTY (-t)", flag: "-t" },
          { id: "nohostcheck", type: "checkbox", label: "Skip host key check (-o StrictHostKeyChecking=no)", flag: "-o StrictHostKeyChecking=no" },
          { id: "jump", type: "text", label: "Jump Host (-J)", flag: "-J", placeholder: "bastion.example.com", halfWidth: true },
          { id: "cipher", type: "select", label: "Cipher (-c)", flag: "-c", options: [
            { value: "", label: "Default" },
            { value: "aes256-gcm@openssh.com", label: "AES-256-GCM" },
            { value: "chacha20-poly1305@openssh.com", label: "ChaCha20" },
            { value: "aes128-ctr", label: "AES-128-CTR" },
          ], halfWidth: true },
          { id: "command", type: "text", label: "Remote Command", flag: "", positional: true, placeholder: "ls -la /var/log", quoted: true },
        ],
      },
    ],
  },

  // ── scp ───────────────────────────────────────────────────────
  scp: {
    binary: "scp",
    sections: [
      {
        title: "Transfer",
        defaultOpen: true,
        fields: [
          { id: "source", type: "text", label: "Source", flag: "", positional: true, placeholder: "user@host:/path/to/file", required: true },
          { id: "dest", type: "text", label: "Destination", flag: "", positional: true, placeholder: "./local/path", required: true },
        ],
      },
      {
        title: "Options",
        defaultOpen: true,
        fields: [
          { id: "recursive", type: "checkbox", label: "Recursive (-r)", flag: "-r" },
          { id: "compress", type: "checkbox", label: "Compression (-C)", flag: "-C" },
          { id: "preserve", type: "checkbox", label: "Preserve attributes (-p)", flag: "-p" },
          { id: "port", type: "number", label: "Port (-P)", flag: "-P", placeholder: "22", halfWidth: true },
          { id: "identity", type: "text", label: "Identity File (-i)", flag: "-i", placeholder: "~/.ssh/id_rsa", halfWidth: true },
          { id: "limit", type: "text", label: "Bandwidth Limit (-l)", flag: "-l", placeholder: "1000 (Kbit/s)", halfWidth: true },
          { id: "cipher", type: "text", label: "Cipher (-c)", flag: "-c", placeholder: "aes256-gcm@openssh.com", halfWidth: true },
        ],
      },
    ],
  },

  // ── git ───────────────────────────────────────────────────────
  git: {
    binary: "git",
    subcommands: [
      {
        name: "clone",
        sections: [{
          title: "Clone",
          defaultOpen: true,
          fields: [
            { id: "repo", type: "text", label: "Repository URL", flag: "", positional: true, placeholder: "https://github.com/user/repo.git", required: true },
            { id: "dir", type: "text", label: "Directory", flag: "", positional: true, placeholder: "my-project" },
            { id: "branch", type: "text", label: "Branch (-b)", flag: "-b", placeholder: "main", halfWidth: true },
            { id: "depth", type: "number", label: "Depth (--depth)", flag: "--depth", placeholder: "1", halfWidth: true },
            { id: "recursive", type: "checkbox", label: "Recursive submodules (--recurse-submodules)", flag: "--recurse-submodules" },
            { id: "bare", type: "checkbox", label: "Bare (--bare)", flag: "--bare" },
            { id: "shallow", type: "checkbox", label: "Single branch (--single-branch)", flag: "--single-branch" },
          ],
        }],
      },
      {
        name: "commit",
        sections: [{
          title: "Commit",
          defaultOpen: true,
          fields: [
            { id: "message", type: "text", label: "Message (-m)", flag: "-m", placeholder: "feat: add new feature", required: true, quoted: true },
            { id: "all", type: "checkbox", label: "Stage all modified (-a)", flag: "-a" },
            { id: "amend", type: "checkbox", label: "Amend last commit (--amend)", flag: "--amend" },
            { id: "noedit", type: "checkbox", label: "No edit (--no-edit)", flag: "--no-edit" },
            { id: "signoff", type: "checkbox", label: "Sign-off (-s)", flag: "-s" },
            { id: "gpgsign", type: "checkbox", label: "GPG sign (-S)", flag: "-S" },
            { id: "author", type: "text", label: "Author (--author)", flag: "--author", placeholder: "Name <email>", quoted: true },
          ],
        }],
      },
      {
        name: "push",
        sections: [{
          title: "Push",
          defaultOpen: true,
          fields: [
            { id: "remote", type: "text", label: "Remote", flag: "", positional: true, placeholder: "origin", halfWidth: true },
            { id: "branch", type: "text", label: "Branch", flag: "", positional: true, placeholder: "main", halfWidth: true },
            { id: "upstream", type: "checkbox", label: "Set upstream (-u)", flag: "-u" },
            { id: "force", type: "checkbox", label: "Force (--force)", flag: "--force" },
            { id: "forcewlease", type: "checkbox", label: "Force with lease (--force-with-lease)", flag: "--force-with-lease" },
            { id: "tags", type: "checkbox", label: "Push tags (--tags)", flag: "--tags" },
            { id: "dryrun", type: "checkbox", label: "Dry run (-n)", flag: "-n" },
          ],
        }],
      },
      {
        name: "log",
        sections: [{
          title: "Log",
          defaultOpen: true,
          fields: [
            { id: "oneline", type: "checkbox", label: "One line (--oneline)", flag: "--oneline" },
            { id: "graph", type: "checkbox", label: "Graph (--graph)", flag: "--graph" },
            { id: "all", type: "checkbox", label: "All branches (--all)", flag: "--all" },
            { id: "limit", type: "number", label: "Limit (-n)", flag: "-n", placeholder: "10", halfWidth: true },
            { id: "author", type: "text", label: "Author (--author)", flag: "--author", placeholder: "name", halfWidth: true },
            { id: "since", type: "text", label: "Since (--since)", flag: "--since", placeholder: "2024-01-01", halfWidth: true },
            { id: "until", type: "text", label: "Until (--until)", flag: "--until", placeholder: "2024-12-31", halfWidth: true },
            { id: "format", type: "select", label: "Pretty Format (--pretty)", flag: "--pretty", options: [
              { value: "", label: "Default" },
              { value: "oneline", label: "One Line" },
              { value: "short", label: "Short" },
              { value: "full", label: "Full" },
              { value: "format:'%h %s (%an)'", label: "Hash + Subject + Author" },
            ] },
            { id: "grep", type: "text", label: "Search messages (--grep)", flag: "--grep", placeholder: "fix:" },
          ],
        }],
      },
      {
        name: "rebase",
        sections: [{
          title: "Rebase",
          defaultOpen: true,
          fields: [
            { id: "onto", type: "text", label: "Onto (branch/commit)", flag: "", positional: true, placeholder: "main" },
            { id: "interactive", type: "checkbox", label: "Interactive (-i)", flag: "-i" },
            { id: "autosquash", type: "checkbox", label: "Auto-squash (--autosquash)", flag: "--autosquash" },
            { id: "abort", type: "checkbox", label: "Abort (--abort)", flag: "--abort" },
            { id: "continue_", type: "checkbox", label: "Continue (--continue)", flag: "--continue" },
          ],
        }],
      },
    ],
  },

  // ── gh (GitHub CLI) ───────────────────────────────────────────
  gh: {
    binary: "gh",
    subcommands: [
      {
        name: "pr create",
        label: "pr create",
        sections: [{
          title: "Pull Request",
          defaultOpen: true,
          fields: [
            { id: "title", type: "text", label: "Title (--title)", flag: "--title", placeholder: "feat: add dark mode", required: true, quoted: true },
            { id: "body", type: "textarea", label: "Body (--body)", flag: "--body", placeholder: "## Summary\n...", rows: 4, quoted: true },
            { id: "base", type: "text", label: "Base Branch (--base)", flag: "--base", placeholder: "main", halfWidth: true },
            { id: "head", type: "text", label: "Head Branch (--head)", flag: "--head", placeholder: "feature-branch", halfWidth: true },
            { id: "draft", type: "checkbox", label: "Draft (--draft)", flag: "--draft" },
            { id: "web", type: "checkbox", label: "Open in browser (--web)", flag: "--web" },
            { id: "labels", type: "repeatable", label: "Labels (--label)", flag: "--label", placeholder: "bug", addLabel: "+ Add Label" },
            { id: "reviewers", type: "repeatable", label: "Reviewers (--reviewer)", flag: "--reviewer", placeholder: "username", addLabel: "+ Add Reviewer" },
            { id: "assignees", type: "repeatable", label: "Assignees (--assignee)", flag: "--assignee", placeholder: "username", addLabel: "+ Add Assignee" },
          ],
        }],
      },
      {
        name: "pr list",
        label: "pr list",
        sections: [{
          title: "List PRs",
          defaultOpen: true,
          fields: [
            { id: "state", type: "select", label: "State (--state)", flag: "--state", options: [
              { value: "", label: "Default (open)" },
              { value: "open", label: "Open" },
              { value: "closed", label: "Closed" },
              { value: "merged", label: "Merged" },
              { value: "all", label: "All" },
            ] },
            { id: "limit", type: "number", label: "Limit (--limit)", flag: "--limit", placeholder: "30", halfWidth: true },
            { id: "author", type: "text", label: "Author (--author)", flag: "--author", placeholder: "@me", halfWidth: true },
            { id: "label", type: "repeatable", label: "Labels (--label)", flag: "--label", placeholder: "bug", addLabel: "+ Add Label" },
            { id: "json", type: "text", label: "JSON fields (--json)", flag: "--json", placeholder: "number,title,state" },
          ],
        }],
      },
      {
        name: "issue create",
        label: "issue create",
        sections: [{
          title: "Issue",
          defaultOpen: true,
          fields: [
            { id: "title", type: "text", label: "Title (--title)", flag: "--title", placeholder: "Bug: login fails on Safari", required: true, quoted: true },
            { id: "body", type: "textarea", label: "Body (--body)", flag: "--body", placeholder: "## Steps to reproduce\n...", rows: 4, quoted: true },
            { id: "labels", type: "repeatable", label: "Labels (--label)", flag: "--label", placeholder: "bug", addLabel: "+ Add Label" },
            { id: "assignees", type: "repeatable", label: "Assignees (--assignee)", flag: "--assignee", placeholder: "username", addLabel: "+ Add Assignee" },
            { id: "web", type: "checkbox", label: "Open in browser (--web)", flag: "--web" },
          ],
        }],
      },
      {
        name: "repo clone",
        label: "repo clone",
        sections: [{
          title: "Clone Repository",
          defaultOpen: true,
          fields: [
            { id: "repo", type: "text", label: "Repository", flag: "", positional: true, placeholder: "owner/repo", required: true },
            { id: "dir", type: "text", label: "Directory", flag: "", positional: true, placeholder: "./my-repo" },
          ],
        }],
      },
      {
        name: "release create",
        label: "release create",
        sections: [{
          title: "Release",
          defaultOpen: true,
          fields: [
            { id: "tag", type: "text", label: "Tag", flag: "", positional: true, placeholder: "v1.0.0", required: true },
            { id: "title", type: "text", label: "Title (--title)", flag: "--title", placeholder: "Release v1.0.0", quoted: true },
            { id: "notes", type: "textarea", label: "Notes (--notes)", flag: "--notes", placeholder: "Changelog...", rows: 4, quoted: true },
            { id: "draft", type: "checkbox", label: "Draft (--draft)", flag: "--draft" },
            { id: "prerelease", type: "checkbox", label: "Pre-release (--prerelease)", flag: "--prerelease" },
            { id: "generatenotes", type: "checkbox", label: "Auto-generate notes (--generate-notes)", flag: "--generate-notes" },
          ],
        }],
      },
    ],
  },

  // ── claude ────────────────────────────────────────────────────
  claude: {
    binary: "claude",
    sections: [
      {
        title: "Prompt",
        defaultOpen: true,
        fields: [
          { id: "prompt", type: "text", label: "Prompt (-p)", flag: "-p", placeholder: "Explain this codebase", quoted: true },
        ],
      },
      {
        title: "Options",
        defaultOpen: true,
        fields: [
          { id: "model", type: "select", label: "Model (--model)", flag: "--model", options: [
            { value: "", label: "Default" },
            { value: "claude-opus-4-6", label: "Claude Opus 4.6" },
            { value: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
            { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
          ] },
          { id: "output", type: "select", label: "Output Format (--output-format)", flag: "--output-format", options: [
            { value: "", label: "Default (text)" },
            { value: "json", label: "JSON" },
            { value: "stream-json", label: "Stream JSON" },
          ] },
          { id: "continue_", type: "checkbox", label: "Continue last session (--continue)", flag: "--continue" },
          { id: "resume", type: "text", label: "Resume session (--resume)", flag: "--resume", placeholder: "session-id" },
          { id: "verbose", type: "checkbox", label: "Verbose (--verbose)", flag: "--verbose" },
          { id: "maxturns", type: "number", label: "Max Turns (--max-turns)", flag: "--max-turns", placeholder: "10", halfWidth: true },
          { id: "systemPrompt", type: "textarea", label: "System Prompt (--system-prompt)", flag: "--system-prompt", placeholder: "You are a helpful assistant...", rows: 3, quoted: true },
        ],
      },
      {
        title: "Permissions",
        defaultOpen: false,
        fields: [
          { id: "dangerously", type: "checkbox", label: "Allow all permissions (--dangerously-skip-permissions)", flag: "--dangerously-skip-permissions" },
          { id: "allowedTools", type: "repeatable", label: "Allowed Tools (--allowedTools)", flag: "--allowedTools", placeholder: "Bash(npm test)", addLabel: "+ Add Tool" },
          { id: "disallowedTools", type: "repeatable", label: "Disallowed Tools (--disallowedTools)", flag: "--disallowedTools", placeholder: "WebFetch", addLabel: "+ Add Tool" },
        ],
      },
    ],
  },

  // ── kubectl ───────────────────────────────────────────────────
  kubectl: {
    binary: "kubectl",
    subcommands: [
      {
        name: "get",
        sections: [{
          title: "Get Resources",
          defaultOpen: true,
          fields: [
            { id: "resource", type: "select", label: "Resource", flag: "", required: true, options: [
              { value: "pods", label: "Pods" },
              { value: "services", label: "Services" },
              { value: "deployments", label: "Deployments" },
              { value: "nodes", label: "Nodes" },
              { value: "namespaces", label: "Namespaces" },
              { value: "configmaps", label: "ConfigMaps" },
              { value: "secrets", label: "Secrets" },
              { value: "ingress", label: "Ingress" },
              { value: "pvc", label: "PersistentVolumeClaims" },
              { value: "events", label: "Events" },
              { value: "all", label: "All" },
            ] },
            { id: "name", type: "text", label: "Resource Name", flag: "", positional: true, placeholder: "my-pod" },
            { id: "namespace", type: "text", label: "Namespace (-n)", flag: "-n", placeholder: "default", halfWidth: true },
            { id: "output", type: "select", label: "Output (-o)", flag: "-o", options: [
              { value: "", label: "Default" },
              { value: "wide", label: "Wide" },
              { value: "json", label: "JSON" },
              { value: "yaml", label: "YAML" },
              { value: "name", label: "Name Only" },
            ], halfWidth: true },
            { id: "selector", type: "text", label: "Label Selector (-l)", flag: "-l", placeholder: "app=nginx" },
            { id: "allns", type: "checkbox", label: "All namespaces (-A)", flag: "-A" },
            { id: "watch", type: "checkbox", label: "Watch (-w)", flag: "-w" },
          ],
        }],
      },
      {
        name: "apply",
        sections: [{
          title: "Apply",
          defaultOpen: true,
          fields: [
            { id: "filename", type: "text", label: "File (-f)", flag: "-f", placeholder: "deployment.yaml", required: true },
            { id: "namespace", type: "text", label: "Namespace (-n)", flag: "-n", placeholder: "default", halfWidth: true },
            { id: "dryrun", type: "select", label: "Dry Run (--dry-run)", flag: "--dry-run", options: [
              { value: "", label: "None" },
              { value: "client", label: "Client" },
              { value: "server", label: "Server" },
            ], halfWidth: true },
            { id: "recursive", type: "checkbox", label: "Recursive (-R)", flag: "-R" },
            { id: "force", type: "checkbox", label: "Force (--force)", flag: "--force" },
          ],
        }],
      },
      {
        name: "logs",
        sections: [{
          title: "Logs",
          defaultOpen: true,
          fields: [
            { id: "pod", type: "text", label: "Pod Name", flag: "", positional: true, placeholder: "my-pod", required: true },
            { id: "container", type: "text", label: "Container (-c)", flag: "-c", placeholder: "my-container", halfWidth: true },
            { id: "namespace", type: "text", label: "Namespace (-n)", flag: "-n", placeholder: "default", halfWidth: true },
            { id: "follow", type: "checkbox", label: "Follow (-f)", flag: "-f" },
            { id: "previous", type: "checkbox", label: "Previous (--previous)", flag: "--previous" },
            { id: "tail", type: "number", label: "Tail Lines (--tail)", flag: "--tail", placeholder: "100", halfWidth: true },
            { id: "since", type: "text", label: "Since (--since)", flag: "--since", placeholder: "1h", halfWidth: true },
            { id: "timestamps", type: "checkbox", label: "Timestamps (--timestamps)", flag: "--timestamps" },
          ],
        }],
      },
      {
        name: "exec",
        sections: [{
          title: "Exec",
          defaultOpen: true,
          fields: [
            { id: "pod", type: "text", label: "Pod Name", flag: "", positional: true, placeholder: "my-pod", required: true },
            { id: "namespace", type: "text", label: "Namespace (-n)", flag: "-n", placeholder: "default", halfWidth: true },
            { id: "container", type: "text", label: "Container (-c)", flag: "-c", placeholder: "my-container", halfWidth: true },
            { id: "it", type: "checkbox", label: "Interactive TTY (-it)", flag: "-it" },
            { id: "separator", type: "text", label: "Command (after --)", flag: "--", positional: true, placeholder: "/bin/bash", required: true },
          ],
        }],
      },
      {
        name: "scale",
        sections: [{
          title: "Scale",
          defaultOpen: true,
          fields: [
            { id: "resource", type: "text", label: "Resource", flag: "", positional: true, placeholder: "deployment/my-app", required: true },
            { id: "replicas", type: "number", label: "Replicas (--replicas)", flag: "--replicas", placeholder: "3", required: true },
            { id: "namespace", type: "text", label: "Namespace (-n)", flag: "-n", placeholder: "default", halfWidth: true },
          ],
        }],
      },
      {
        name: "port-forward",
        label: "port-forward",
        sections: [{
          title: "Port Forward",
          defaultOpen: true,
          fields: [
            { id: "resource", type: "text", label: "Pod / Service", flag: "", positional: true, placeholder: "pod/my-pod", required: true },
            { id: "ports", type: "text", label: "Ports", flag: "", positional: true, placeholder: "8080:80", required: true },
            { id: "namespace", type: "text", label: "Namespace (-n)", flag: "-n", placeholder: "default", halfWidth: true },
            { id: "address", type: "text", label: "Address (--address)", flag: "--address", placeholder: "0.0.0.0", halfWidth: true },
          ],
        }],
      },
    ],
  },

  // ── vercel ────────────────────────────────────────────────────
  vercel: {
    binary: "vercel",
    subcommands: [
      {
        name: "deploy",
        sections: [{
          title: "Deploy",
          defaultOpen: true,
          fields: [
            { id: "dir", type: "text", label: "Directory", flag: "", positional: true, placeholder: "." },
            { id: "prod", type: "checkbox", label: "Production (--prod)", flag: "--prod" },
            { id: "prebuilt", type: "checkbox", label: "Prebuilt (--prebuilt)", flag: "--prebuilt" },
            { id: "force", type: "checkbox", label: "Force (--force)", flag: "--force" },
            { id: "noWait", type: "checkbox", label: "No wait (--no-wait)", flag: "--no-wait" },
            { id: "archive", type: "select", label: "Archive (--archive)", flag: "--archive", options: [
              { value: "", label: "Default" },
              { value: "tgz", label: "tgz" },
            ] },
            { id: "env", type: "keyvalue", label: "Environment (-e)", flag: "-e", keyPlaceholder: "KEY", valuePlaceholder: "value", addLabel: "+ Add Env" },
            { id: "buildenv", type: "keyvalue", label: "Build Env (-b)", flag: "-b", keyPlaceholder: "KEY", valuePlaceholder: "value", addLabel: "+ Add Build Env" },
          ],
        }],
      },
      {
        name: "dev",
        sections: [{
          title: "Dev Server",
          defaultOpen: true,
          fields: [
            { id: "dir", type: "text", label: "Directory", flag: "", positional: true, placeholder: "." },
            { id: "listen", type: "text", label: "Listen (--listen)", flag: "--listen", placeholder: "0.0.0.0:3000", halfWidth: true },
          ],
        }],
      },
      {
        name: "env pull",
        label: "env pull",
        sections: [{
          title: "Pull Environment",
          defaultOpen: true,
          fields: [
            { id: "file", type: "text", label: "Output File", flag: "", positional: true, placeholder: ".env.local" },
            { id: "environment", type: "select", label: "Environment (--environment)", flag: "--environment", options: [
              { value: "", label: "Default" },
              { value: "production", label: "Production" },
              { value: "preview", label: "Preview" },
              { value: "development", label: "Development" },
            ] },
          ],
        }],
      },
      {
        name: "logs",
        sections: [{
          title: "Logs",
          defaultOpen: true,
          fields: [
            { id: "url", type: "text", label: "Deployment URL", flag: "", positional: true, placeholder: "my-app.vercel.app" },
            { id: "follow", type: "checkbox", label: "Follow (-f)", flag: "-f" },
            { id: "limit", type: "number", label: "Limit (-n)", flag: "-n", placeholder: "20", halfWidth: true },
          ],
        }],
      },
    ],
  },

  // ── aws ───────────────────────────────────────────────────────
  aws: {
    binary: "aws",
    subcommands: [
      {
        name: "s3 cp",
        label: "s3 cp",
        sections: [{
          title: "S3 Copy",
          defaultOpen: true,
          fields: [
            { id: "source", type: "text", label: "Source", flag: "", positional: true, placeholder: "s3://bucket/key", required: true },
            { id: "dest", type: "text", label: "Destination", flag: "", positional: true, placeholder: "./local-file", required: true },
            { id: "recursive", type: "checkbox", label: "Recursive (--recursive)", flag: "--recursive" },
            { id: "dryrun", type: "checkbox", label: "Dry Run (--dryrun)", flag: "--dryrun" },
            { id: "exclude", type: "repeatable", label: "Exclude (--exclude)", flag: "--exclude", placeholder: "*.log", addLabel: "+ Add Exclude" },
            { id: "include", type: "repeatable", label: "Include (--include)", flag: "--include", placeholder: "*.json", addLabel: "+ Add Include" },
            { id: "region", type: "text", label: "Region (--region)", flag: "--region", placeholder: "us-east-1", halfWidth: true },
            { id: "profile", type: "text", label: "Profile (--profile)", flag: "--profile", placeholder: "default", halfWidth: true },
          ],
        }],
      },
      {
        name: "s3 sync",
        label: "s3 sync",
        sections: [{
          title: "S3 Sync",
          defaultOpen: true,
          fields: [
            { id: "source", type: "text", label: "Source", flag: "", positional: true, placeholder: "./build", required: true },
            { id: "dest", type: "text", label: "Destination", flag: "", positional: true, placeholder: "s3://my-bucket", required: true },
            { id: "delete", type: "checkbox", label: "Delete removed files (--delete)", flag: "--delete" },
            { id: "dryrun", type: "checkbox", label: "Dry Run (--dryrun)", flag: "--dryrun" },
            { id: "exclude", type: "repeatable", label: "Exclude (--exclude)", flag: "--exclude", placeholder: ".git/*", addLabel: "+ Add Exclude" },
            { id: "region", type: "text", label: "Region (--region)", flag: "--region", placeholder: "us-east-1", halfWidth: true },
            { id: "profile", type: "text", label: "Profile (--profile)", flag: "--profile", placeholder: "default", halfWidth: true },
          ],
        }],
      },
      {
        name: "s3 ls",
        label: "s3 ls",
        sections: [{
          title: "S3 List",
          defaultOpen: true,
          fields: [
            { id: "path", type: "text", label: "S3 Path", flag: "", positional: true, placeholder: "s3://my-bucket/prefix/" },
            { id: "recursive", type: "checkbox", label: "Recursive (--recursive)", flag: "--recursive" },
            { id: "human", type: "checkbox", label: "Human-readable (--human-readable)", flag: "--human-readable" },
            { id: "summarize", type: "checkbox", label: "Summarize (--summarize)", flag: "--summarize" },
            { id: "region", type: "text", label: "Region (--region)", flag: "--region", placeholder: "us-east-1", halfWidth: true },
            { id: "profile", type: "text", label: "Profile (--profile)", flag: "--profile", placeholder: "default", halfWidth: true },
          ],
        }],
      },
      {
        name: "ec2 describe-instances",
        label: "ec2 describe-instances",
        sections: [{
          title: "EC2 Instances",
          defaultOpen: true,
          fields: [
            { id: "ids", type: "repeatable", label: "Instance IDs (--instance-ids)", flag: "--instance-ids", placeholder: "i-1234567890abcdef0", addLabel: "+ Add ID" },
            { id: "filters", type: "keyvalue", label: "Filters (--filters Name=X,Values=Y)", flag: "--filters", keyPlaceholder: "Name=tag:env", valuePlaceholder: "Values=prod", separator: ",", addLabel: "+ Add Filter" },
            { id: "output", type: "select", label: "Output (--output)", flag: "--output", options: [
              { value: "", label: "Default" },
              { value: "json", label: "JSON" },
              { value: "yaml", label: "YAML" },
              { value: "table", label: "Table" },
              { value: "text", label: "Text" },
            ] },
            { id: "region", type: "text", label: "Region (--region)", flag: "--region", placeholder: "us-east-1", halfWidth: true },
            { id: "profile", type: "text", label: "Profile (--profile)", flag: "--profile", placeholder: "default", halfWidth: true },
          ],
        }],
      },
    ],
  },

  // ── terraform ─────────────────────────────────────────────────
  terraform: {
    binary: "terraform",
    subcommands: [
      {
        name: "init",
        sections: [{
          title: "Init",
          defaultOpen: true,
          fields: [
            { id: "backend", type: "checkbox", label: "Configure backend (default: true)", flag: "-backend=true" },
            { id: "reconfigure", type: "checkbox", label: "Reconfigure (-reconfigure)", flag: "-reconfigure" },
            { id: "migrate", type: "checkbox", label: "Migrate state (-migrate-state)", flag: "-migrate-state" },
            { id: "upgrade", type: "checkbox", label: "Upgrade providers (-upgrade)", flag: "-upgrade" },
          ],
        }],
      },
      {
        name: "plan",
        sections: [{
          title: "Plan",
          defaultOpen: true,
          fields: [
            { id: "out", type: "text", label: "Output Plan File (-out)", flag: "-out", placeholder: "tfplan", halfWidth: true },
            { id: "target", type: "repeatable", label: "Target (-target)", flag: "-target", placeholder: "aws_instance.web", addLabel: "+ Add Target" },
            { id: "vars", type: "keyvalue", label: "Variables (-var)", flag: "-var", keyPlaceholder: "name", valuePlaceholder: "value", separator: "=", addLabel: "+ Add Variable" },
            { id: "varfile", type: "text", label: "Var File (-var-file)", flag: "-var-file", placeholder: "terraform.tfvars" },
            { id: "destroy", type: "checkbox", label: "Destroy plan (-destroy)", flag: "-destroy" },
            { id: "refresh", type: "checkbox", label: "Refresh only (-refresh-only)", flag: "-refresh-only" },
          ],
        }],
      },
      {
        name: "apply",
        sections: [{
          title: "Apply",
          defaultOpen: true,
          fields: [
            { id: "planfile", type: "text", label: "Plan File", flag: "", positional: true, placeholder: "tfplan" },
            { id: "autoapprove", type: "checkbox", label: "Auto-approve (-auto-approve)", flag: "-auto-approve" },
            { id: "target", type: "repeatable", label: "Target (-target)", flag: "-target", placeholder: "aws_instance.web", addLabel: "+ Add Target" },
            { id: "vars", type: "keyvalue", label: "Variables (-var)", flag: "-var", keyPlaceholder: "name", valuePlaceholder: "value", separator: "=", addLabel: "+ Add Variable" },
            { id: "varfile", type: "text", label: "Var File (-var-file)", flag: "-var-file", placeholder: "terraform.tfvars" },
          ],
        }],
      },
      {
        name: "destroy",
        sections: [{
          title: "Destroy",
          defaultOpen: true,
          fields: [
            { id: "autoapprove", type: "checkbox", label: "Auto-approve (-auto-approve)", flag: "-auto-approve" },
            { id: "target", type: "repeatable", label: "Target (-target)", flag: "-target", placeholder: "aws_instance.web", addLabel: "+ Add Target" },
            { id: "vars", type: "keyvalue", label: "Variables (-var)", flag: "-var", keyPlaceholder: "name", valuePlaceholder: "value", separator: "=", addLabel: "+ Add Variable" },
          ],
        }],
      },
    ],
  },

  // ── tar ───────────────────────────────────────────────────────
  tar: {
    binary: "tar",
    subcommands: [
      {
        name: "-czf",
        label: "Create (gzip)",
        sections: [{
          title: "Create Archive",
          defaultOpen: true,
          fields: [
            { id: "archive", type: "text", label: "Archive Name", flag: "", positional: true, placeholder: "archive.tar.gz", required: true },
            { id: "files", type: "repeatable", label: "Files / Directories", flag: "", placeholder: "src/ README.md", addLabel: "+ Add Path" },
            { id: "exclude", type: "repeatable", label: "Exclude (--exclude)", flag: "--exclude", placeholder: "*.log", addLabel: "+ Add Exclude" },
            { id: "verbose", type: "checkbox", label: "Verbose (-v)", flag: "-v" },
          ],
        }],
      },
      {
        name: "-xzf",
        label: "Extract (gzip)",
        sections: [{
          title: "Extract Archive",
          defaultOpen: true,
          fields: [
            { id: "archive", type: "text", label: "Archive", flag: "", positional: true, placeholder: "archive.tar.gz", required: true },
            { id: "directory", type: "text", label: "Extract To (-C)", flag: "-C", placeholder: "./output" },
            { id: "strip", type: "number", label: "Strip Components (--strip-components)", flag: "--strip-components", placeholder: "1" },
            { id: "verbose", type: "checkbox", label: "Verbose (-v)", flag: "-v" },
          ],
        }],
      },
      {
        name: "-tzf",
        label: "List",
        sections: [{
          title: "List Archive Contents",
          defaultOpen: true,
          fields: [
            { id: "archive", type: "text", label: "Archive", flag: "", positional: true, placeholder: "archive.tar.gz", required: true },
            { id: "verbose", type: "checkbox", label: "Verbose (-v)", flag: "-v" },
          ],
        }],
      },
    ],
  },

  // ── rsync ─────────────────────────────────────────────────────
  rsync: {
    binary: "rsync",
    sections: [
      {
        title: "Source & Destination",
        defaultOpen: true,
        fields: [
          { id: "source", type: "text", label: "Source", flag: "", positional: true, placeholder: "/path/to/source/", required: true },
          { id: "dest", type: "text", label: "Destination", flag: "", positional: true, placeholder: "user@host:/path/to/dest/", required: true },
        ],
      },
      {
        title: "Common Options",
        defaultOpen: true,
        fields: [
          { id: "archive", type: "checkbox", label: "Archive mode (-a)", flag: "-a" },
          { id: "verbose", type: "checkbox", label: "Verbose (-v)", flag: "-v" },
          { id: "compress", type: "checkbox", label: "Compress (-z)", flag: "-z" },
          { id: "progress", type: "checkbox", label: "Show progress (--progress)", flag: "--progress" },
          { id: "human", type: "checkbox", label: "Human-readable (-h)", flag: "-h" },
          { id: "dryrun", type: "checkbox", label: "Dry Run (-n)", flag: "-n" },
          { id: "delete", type: "checkbox", label: "Delete extraneous (--delete)", flag: "--delete" },
          { id: "partial", type: "checkbox", label: "Keep partial transfers (--partial)", flag: "--partial" },
        ],
      },
      {
        title: "Filters",
        defaultOpen: false,
        fields: [
          { id: "exclude", type: "repeatable", label: "Exclude (--exclude)", flag: "--exclude", placeholder: ".git/", addLabel: "+ Add Exclude" },
          { id: "include", type: "repeatable", label: "Include (--include)", flag: "--include", placeholder: "*.py", addLabel: "+ Add Include" },
          { id: "excludefrom", type: "text", label: "Exclude From File (--exclude-from)", flag: "--exclude-from", placeholder: ".rsyncignore" },
        ],
      },
      {
        title: "Advanced",
        defaultOpen: false,
        fields: [
          { id: "ssh", type: "text", label: "SSH Command (-e)", flag: "-e", placeholder: "ssh -p 2222", quoted: true },
          { id: "bwlimit", type: "text", label: "Bandwidth Limit (--bwlimit)", flag: "--bwlimit", placeholder: "1000 (KBytes/s)", halfWidth: true },
          { id: "checksum", type: "checkbox", label: "Checksum (-c)", flag: "-c" },
          { id: "update", type: "checkbox", label: "Skip newer files (-u)", flag: "-u" },
        ],
      },
    ],
  },

  // ── chmod ─────────────────────────────────────────────────────
  chmod: {
    binary: "chmod",
    sections: [
      {
        title: "Permissions",
        defaultOpen: true,
        fields: [
          { id: "mode", type: "text", label: "Mode", flag: "", positional: true, placeholder: "755 or u+rwx,g+rx", required: true, hint: "Octal (755) or symbolic (u+rwx,g+rx,o+rx)" },
          { id: "file", type: "text", label: "File / Directory", flag: "", positional: true, placeholder: "./script.sh", required: true },
        ],
      },
      {
        title: "Options",
        defaultOpen: true,
        fields: [
          { id: "recursive", type: "checkbox", label: "Recursive (-R)", flag: "-R" },
          { id: "verbose", type: "checkbox", label: "Verbose (-v)", flag: "-v" },
          { id: "changes", type: "checkbox", label: "Report changes (-c)", flag: "-c" },
          { id: "reference", type: "text", label: "Reference file (--reference)", flag: "--reference", placeholder: "reference-file" },
        ],
      },
    ],
  },

  // ── find ──────────────────────────────────────────────────────
  find: {
    binary: "find",
    sections: [
      {
        title: "Search Path",
        defaultOpen: true,
        fields: [
          { id: "path", type: "text", label: "Path", flag: "", positional: true, placeholder: ".", required: true },
        ],
      },
      {
        title: "Name & Type",
        defaultOpen: true,
        fields: [
          { id: "name", type: "text", label: "Name (-name)", flag: "-name", placeholder: "*.js", quoted: true, halfWidth: true },
          { id: "iname", type: "text", label: "Name case-insensitive (-iname)", flag: "-iname", placeholder: "*.txt", quoted: true, halfWidth: true },
          { id: "type", type: "select", label: "Type (-type)", flag: "-type", options: [
            { value: "", label: "Any" },
            { value: "f", label: "File (f)" },
            { value: "d", label: "Directory (d)" },
            { value: "l", label: "Symlink (l)" },
          ], halfWidth: true },
          { id: "maxdepth", type: "number", label: "Max Depth (-maxdepth)", flag: "-maxdepth", placeholder: "3", halfWidth: true },
        ],
      },
      {
        title: "Size & Date",
        defaultOpen: false,
        fields: [
          { id: "size", type: "text", label: "Size (-size)", flag: "-size", placeholder: "+100M", hint: "+10k, -1G, 100M", halfWidth: true },
          { id: "mtime", type: "text", label: "Modified Days (-mtime)", flag: "-mtime", placeholder: "-7", hint: "-7 = last 7 days, +30 = older than 30 days", halfWidth: true },
          { id: "newer", type: "text", label: "Newer Than (-newer)", flag: "-newer", placeholder: "reference.txt", halfWidth: true },
          { id: "empty", type: "checkbox", label: "Empty files/dirs (-empty)", flag: "-empty" },
        ],
      },
      {
        title: "Actions",
        defaultOpen: false,
        fields: [
          { id: "print", type: "checkbox", label: "Print (-print)", flag: "-print" },
          { id: "delete", type: "checkbox", label: "Delete (-delete)", flag: "-delete" },
          { id: "exec", type: "text", label: "Execute (-exec ... \\;)", flag: "-exec", placeholder: "rm {} \\;", hint: "Use {} for filename placeholder" },
        ],
      },
    ],
  },

  // ── jq ────────────────────────────────────────────────────────
  jq: {
    binary: "jq",
    sections: [
      {
        title: "Expression",
        defaultOpen: true,
        fields: [
          { id: "filter", type: "text", label: "Filter Expression", flag: "", positional: true, placeholder: ".data[] | {name: .name, id: .id}", required: true, quoted: true },
          { id: "file", type: "text", label: "Input File", flag: "", positional: true, placeholder: "data.json" },
        ],
      },
      {
        title: "Options",
        defaultOpen: true,
        fields: [
          { id: "raw", type: "checkbox", label: "Raw output (-r)", flag: "-r" },
          { id: "compact", type: "checkbox", label: "Compact output (-c)", flag: "-c" },
          { id: "slurp", type: "checkbox", label: "Slurp into array (-s)", flag: "-s" },
          { id: "rawInput", type: "checkbox", label: "Raw input (-R)", flag: "-R" },
          { id: "null", type: "checkbox", label: "Null input (-n)", flag: "-n" },
          { id: "exit", type: "checkbox", label: "Exit status (-e)", flag: "-e" },
          { id: "sort", type: "checkbox", label: "Sort keys (-S)", flag: "-S" },
          { id: "tab", type: "checkbox", label: "Tab indent (--tab)", flag: "--tab" },
          { id: "arg", type: "keyvalue", label: "Arguments (--arg)", flag: "--arg", keyPlaceholder: "name", valuePlaceholder: "value", separator: " ", addLabel: "+ Add Arg" },
        ],
      },
    ],
  },

  // ── npm ───────────────────────────────────────────────────────
  npm: {
    binary: "npm",
    subcommands: [
      {
        name: "install",
        sections: [{
          title: "Install Packages",
          defaultOpen: true,
          fields: [
            { id: "packages", type: "repeatable", label: "Packages", flag: "", placeholder: "express", addLabel: "+ Add Package" },
            { id: "save", type: "checkbox", label: "Save to dependencies (default)", flag: "--save" },
            { id: "savedev", type: "checkbox", label: "Save as devDependency (-D)", flag: "-D" },
            { id: "global", type: "checkbox", label: "Global (-g)", flag: "-g" },
            { id: "savexact", type: "checkbox", label: "Exact version (-E)", flag: "-E" },
            { id: "legacy", type: "checkbox", label: "Legacy peer deps (--legacy-peer-deps)", flag: "--legacy-peer-deps" },
            { id: "force", type: "checkbox", label: "Force (--force)", flag: "--force" },
            { id: "dryrun", type: "checkbox", label: "Dry Run (--dry-run)", flag: "--dry-run" },
          ],
        }],
      },
      {
        name: "run",
        sections: [{
          title: "Run Script",
          defaultOpen: true,
          fields: [
            { id: "script", type: "text", label: "Script Name", flag: "", positional: true, placeholder: "build", required: true },
            { id: "args", type: "text", label: "Arguments (-- args)", flag: "--", positional: true, placeholder: "--watch --verbose" },
          ],
        }],
      },
      {
        name: "publish",
        sections: [{
          title: "Publish",
          defaultOpen: true,
          fields: [
            { id: "tag", type: "text", label: "Tag (--tag)", flag: "--tag", placeholder: "latest", halfWidth: true },
            { id: "access", type: "select", label: "Access (--access)", flag: "--access", options: [
              { value: "", label: "Default" },
              { value: "public", label: "Public" },
              { value: "restricted", label: "Restricted" },
            ], halfWidth: true },
            { id: "dryrun", type: "checkbox", label: "Dry Run (--dry-run)", flag: "--dry-run" },
            { id: "otp", type: "text", label: "OTP (--otp)", flag: "--otp", placeholder: "123456", halfWidth: true },
          ],
        }],
      },
      {
        name: "audit",
        sections: [{
          title: "Audit",
          defaultOpen: true,
          fields: [
            { id: "fix", type: "checkbox", label: "Auto-fix (fix)", flag: "fix" },
            { id: "force", type: "checkbox", label: "Force (--force)", flag: "--force" },
            { id: "level", type: "select", label: "Level (--audit-level)", flag: "--audit-level", options: [
              { value: "", label: "Default" },
              { value: "low", label: "Low" },
              { value: "moderate", label: "Moderate" },
              { value: "high", label: "High" },
              { value: "critical", label: "Critical" },
            ] },
            { id: "json", type: "checkbox", label: "JSON output (--json)", flag: "--json" },
          ],
        }],
      },
    ],
  },

  // ── pip ───────────────────────────────────────────────────────
  pip: {
    binary: "pip",
    subcommands: [
      {
        name: "install",
        sections: [{
          title: "Install",
          defaultOpen: true,
          fields: [
            { id: "packages", type: "repeatable", label: "Packages", flag: "", placeholder: "flask>=2.0", addLabel: "+ Add Package" },
            { id: "requirements", type: "text", label: "Requirements File (-r)", flag: "-r", placeholder: "requirements.txt" },
            { id: "upgrade", type: "checkbox", label: "Upgrade (-U)", flag: "-U" },
            { id: "user", type: "checkbox", label: "User install (--user)", flag: "--user" },
            { id: "editable", type: "text", label: "Editable install (-e)", flag: "-e", placeholder: "./my-package" },
            { id: "index", type: "text", label: "Index URL (-i)", flag: "-i", placeholder: "https://pypi.org/simple/" },
            { id: "noCache", type: "checkbox", label: "No cache (--no-cache-dir)", flag: "--no-cache-dir" },
            { id: "noDeps", type: "checkbox", label: "No dependencies (--no-deps)", flag: "--no-deps" },
          ],
        }],
      },
      {
        name: "freeze",
        sections: [{
          title: "Freeze",
          defaultOpen: true,
          fields: [
            { id: "local", type: "checkbox", label: "Local only (-l)", flag: "-l" },
            { id: "exclude", type: "repeatable", label: "Exclude (--exclude)", flag: "--exclude", placeholder: "pip", addLabel: "+ Add Exclude" },
          ],
        }],
      },
      {
        name: "uninstall",
        sections: [{
          title: "Uninstall",
          defaultOpen: true,
          fields: [
            { id: "packages", type: "repeatable", label: "Packages", flag: "", placeholder: "flask", addLabel: "+ Add Package" },
            { id: "yes", type: "checkbox", label: "Skip confirmation (-y)", flag: "-y" },
            { id: "requirements", type: "text", label: "Requirements File (-r)", flag: "-r", placeholder: "requirements.txt" },
          ],
        }],
      },
      {
        name: "list",
        sections: [{
          title: "List",
          defaultOpen: true,
          fields: [
            { id: "outdated", type: "checkbox", label: "Outdated only (-o)", flag: "-o" },
            { id: "uptodate", type: "checkbox", label: "Up-to-date only (-u)", flag: "-u" },
            { id: "format", type: "select", label: "Format (--format)", flag: "--format", options: [
              { value: "", label: "Default" },
              { value: "columns", label: "Columns" },
              { value: "json", label: "JSON" },
              { value: "freeze", label: "Freeze" },
            ] },
          ],
        }],
      },
    ],
  },

  // ── sed ────────────────────────────────────────────────────────
  sed: {
    binary: "sed",
    sections: [
      {
        title: "Expression",
        defaultOpen: true,
        fields: [
          { id: "expression", type: "text", label: "Expression (-e)", flag: "-e", placeholder: "s/old/new/g", required: true, quoted: true },
          { id: "file", type: "text", label: "Input File", flag: "", positional: true, placeholder: "input.txt" },
        ],
      },
      {
        title: "Options",
        defaultOpen: true,
        fields: [
          { id: "inplace", type: "checkbox", label: "In-place edit (-i)", flag: "-i" },
          { id: "backup", type: "text", label: "Backup Suffix (-i suffix)", flag: "-i", placeholder: ".bak", hint: "Creates backup before in-place edit", halfWidth: true },
          { id: "extended", type: "checkbox", label: "Extended regex (-E)", flag: "-E" },
          { id: "silent", type: "checkbox", label: "Silent / suppress (-n)", flag: "-n" },
          { id: "scriptfile", type: "text", label: "Script File (-f)", flag: "-f", placeholder: "script.sed", halfWidth: true },
        ],
      },
    ],
  },

  // ── grep ───────────────────────────────────────────────────────
  grep: {
    binary: "grep",
    sections: [
      {
        title: "Search",
        defaultOpen: true,
        fields: [
          { id: "pattern", type: "text", label: "Pattern", flag: "", positional: true, placeholder: "error|warning", required: true, quoted: true },
          { id: "path", type: "text", label: "File / Directory", flag: "", positional: true, placeholder: "./src/" },
        ],
      },
      {
        title: "Match Options",
        defaultOpen: true,
        fields: [
          { id: "recursive", type: "checkbox", label: "Recursive (-r)", flag: "-r" },
          { id: "ignorecase", type: "checkbox", label: "Ignore case (-i)", flag: "-i" },
          { id: "invert", type: "checkbox", label: "Invert match (-v)", flag: "-v" },
          { id: "word", type: "checkbox", label: "Whole word (-w)", flag: "-w" },
          { id: "extended", type: "checkbox", label: "Extended regex (-E)", flag: "-E" },
          { id: "fixed", type: "checkbox", label: "Fixed string (-F)", flag: "-F" },
          { id: "perl", type: "checkbox", label: "Perl regex (-P)", flag: "-P" },
        ],
      },
      {
        title: "Output Options",
        defaultOpen: false,
        fields: [
          { id: "linenum", type: "checkbox", label: "Line numbers (-n)", flag: "-n" },
          { id: "count", type: "checkbox", label: "Count only (-c)", flag: "-c" },
          { id: "filesonly", type: "checkbox", label: "Files with matches (-l)", flag: "-l" },
          { id: "onlymatching", type: "checkbox", label: "Only matching part (-o)", flag: "-o" },
          { id: "color", type: "checkbox", label: "Color output (--color=auto)", flag: "--color=auto" },
          { id: "before", type: "number", label: "Lines before (-B)", flag: "-B", placeholder: "3", halfWidth: true },
          { id: "after", type: "number", label: "Lines after (-A)", flag: "-A", placeholder: "3", halfWidth: true },
          { id: "context", type: "number", label: "Context lines (-C)", flag: "-C", placeholder: "3", halfWidth: true },
          { id: "maxcount", type: "number", label: "Max matches (-m)", flag: "-m", placeholder: "10", halfWidth: true },
          { id: "include", type: "text", label: "Include files (--include)", flag: "--include", placeholder: "*.js", halfWidth: true },
          { id: "exclude", type: "text", label: "Exclude files (--exclude)", flag: "--exclude", placeholder: "*.log", halfWidth: true },
        ],
      },
    ],
  },

  // ── awk ────────────────────────────────────────────────────────
  awk: {
    binary: "awk",
    sections: [
      {
        title: "Program",
        defaultOpen: true,
        fields: [
          { id: "program", type: "text", label: "AWK Program", flag: "", positional: true, placeholder: "{print $1, $3}", required: true, quoted: true },
          { id: "file", type: "text", label: "Input File", flag: "", positional: true, placeholder: "data.txt" },
        ],
      },
      {
        title: "Options",
        defaultOpen: true,
        fields: [
          { id: "fieldsep", type: "text", label: "Field Separator (-F)", flag: "-F", placeholder: ",", halfWidth: true, quoted: true },
          { id: "assign", type: "keyvalue", label: "Variables (-v)", flag: "-v", keyPlaceholder: "name", valuePlaceholder: "value", separator: "=", addLabel: "+ Add Variable" },
          { id: "progfile", type: "text", label: "Program File (-f)", flag: "-f", placeholder: "script.awk", halfWidth: true },
        ],
      },
    ],
  },

  // ── xargs ──────────────────────────────────────────────────────
  xargs: {
    binary: "xargs",
    sections: [
      {
        title: "Command",
        defaultOpen: true,
        fields: [
          { id: "command", type: "text", label: "Command to Execute", flag: "", positional: true, placeholder: "rm -f", required: true },
        ],
      },
      {
        title: "Options",
        defaultOpen: true,
        fields: [
          { id: "null", type: "checkbox", label: "Null delimiter (-0)", flag: "-0" },
          { id: "interactive", type: "checkbox", label: "Prompt before exec (-p)", flag: "-p" },
          { id: "verbose", type: "checkbox", label: "Verbose (-t)", flag: "-t" },
          { id: "norun", type: "checkbox", label: "No run if empty (-r)", flag: "-r" },
          { id: "maxargs", type: "number", label: "Max args per cmd (-n)", flag: "-n", placeholder: "1", halfWidth: true },
          { id: "maxprocs", type: "number", label: "Parallel processes (-P)", flag: "-P", placeholder: "4", halfWidth: true },
          { id: "replace", type: "text", label: "Replace string (-I)", flag: "-I", placeholder: "{}", halfWidth: true },
          { id: "delimiter", type: "text", label: "Delimiter (-d)", flag: "-d", placeholder: "\\n", halfWidth: true },
        ],
      },
    ],
  },

  // ── crontab ────────────────────────────────────────────────────
  crontab: {
    binary: "crontab",
    sections: [
      {
        title: "Action",
        defaultOpen: true,
        fields: [
          { id: "list", type: "checkbox", label: "List crontab (-l)", flag: "-l" },
          { id: "edit", type: "checkbox", label: "Edit crontab (-e)", flag: "-e" },
          { id: "remove", type: "checkbox", label: "Remove crontab (-r)", flag: "-r" },
          { id: "file", type: "text", label: "Install from file", flag: "", positional: true, placeholder: "crontab.txt" },
        ],
      },
      {
        title: "Options",
        defaultOpen: false,
        fields: [
          { id: "user", type: "text", label: "User (-u)", flag: "-u", placeholder: "www-data", halfWidth: true },
        ],
      },
    ],
  },

  // ── systemctl ──────────────────────────────────────────────────
  systemctl: {
    binary: "systemctl",
    subcommands: [
      {
        name: "start",
        sections: [{
          title: "Start Service",
          defaultOpen: true,
          fields: [
            { id: "unit", type: "text", label: "Unit Name", flag: "", positional: true, placeholder: "nginx.service", required: true },
          ],
        }],
      },
      {
        name: "stop",
        sections: [{
          title: "Stop Service",
          defaultOpen: true,
          fields: [
            { id: "unit", type: "text", label: "Unit Name", flag: "", positional: true, placeholder: "nginx.service", required: true },
          ],
        }],
      },
      {
        name: "restart",
        sections: [{
          title: "Restart Service",
          defaultOpen: true,
          fields: [
            { id: "unit", type: "text", label: "Unit Name", flag: "", positional: true, placeholder: "nginx.service", required: true },
          ],
        }],
      },
      {
        name: "status",
        sections: [{
          title: "Service Status",
          defaultOpen: true,
          fields: [
            { id: "unit", type: "text", label: "Unit Name", flag: "", positional: true, placeholder: "nginx.service", required: true },
            { id: "nopage", type: "checkbox", label: "No pager (--no-pager)", flag: "--no-pager" },
          ],
        }],
      },
      {
        name: "enable",
        sections: [{
          title: "Enable Service",
          defaultOpen: true,
          fields: [
            { id: "unit", type: "text", label: "Unit Name", flag: "", positional: true, placeholder: "nginx.service", required: true },
            { id: "now", type: "checkbox", label: "Start now (--now)", flag: "--now" },
          ],
        }],
      },
    ],
  },

  // ── du ─────────────────────────────────────────────────────────
  du: {
    binary: "du",
    sections: [
      {
        title: "Target",
        defaultOpen: true,
        fields: [
          { id: "path", type: "text", label: "Path", flag: "", positional: true, placeholder: "/var/log", required: true },
        ],
      },
      {
        title: "Options",
        defaultOpen: true,
        fields: [
          { id: "human", type: "checkbox", label: "Human-readable (-h)", flag: "-h" },
          { id: "summary", type: "checkbox", label: "Summary only (-s)", flag: "-s" },
          { id: "total", type: "checkbox", label: "Grand total (-c)", flag: "-c" },
          { id: "all", type: "checkbox", label: "All files (-a)", flag: "-a" },
          { id: "maxdepth", type: "number", label: "Max depth (--max-depth)", flag: "--max-depth", placeholder: "1", halfWidth: true },
          { id: "threshold", type: "text", label: "Threshold (-t)", flag: "-t", placeholder: "100M", hint: "Show entries larger than size", halfWidth: true },
          { id: "exclude", type: "repeatable", label: "Exclude (--exclude)", flag: "--exclude", placeholder: "*.log", addLabel: "+ Add Exclude" },
          { id: "apparent", type: "checkbox", label: "Apparent size (--apparent-size)", flag: "--apparent-size" },
        ],
      },
    ],
  },

  // ── ps ─────────────────────────────────────────────────────────
  ps: {
    binary: "ps",
    sections: [
      {
        title: "Selection",
        defaultOpen: true,
        fields: [
          { id: "all", type: "checkbox", label: "All processes (aux)", flag: "aux" },
          { id: "every", type: "checkbox", label: "Every process (-ef)", flag: "-ef" },
          { id: "user", type: "text", label: "By user (-u)", flag: "-u", placeholder: "www-data", halfWidth: true },
          { id: "pid", type: "text", label: "By PID (-p)", flag: "-p", placeholder: "1234", halfWidth: true },
        ],
      },
      {
        title: "Output",
        defaultOpen: false,
        fields: [
          { id: "format", type: "text", label: "Custom format (-o)", flag: "-o", placeholder: "pid,user,%cpu,%mem,cmd", hint: "Comma-separated column names" },
          { id: "forest", type: "checkbox", label: "Tree view (--forest)", flag: "--forest" },
          { id: "sort", type: "text", label: "Sort (--sort)", flag: "--sort", placeholder: "-%cpu", hint: "e.g. -%cpu, -%mem, pid", halfWidth: true },
          { id: "noheaders", type: "checkbox", label: "No headers (--no-headers)", flag: "--no-headers" },
        ],
      },
    ],
  },

  // ── kill ───────────────────────────────────────────────────────
  kill: {
    binary: "kill",
    sections: [
      {
        title: "Target",
        defaultOpen: true,
        fields: [
          { id: "pid", type: "text", label: "PID(s)", flag: "", positional: true, placeholder: "1234 5678", required: true, hint: "Space-separated PIDs" },
        ],
      },
      {
        title: "Signal",
        defaultOpen: true,
        fields: [
          { id: "signal", type: "select", label: "Signal (-s)", flag: "-s", options: [
            { value: "", label: "Default (TERM)" },
            { value: "SIGTERM", label: "SIGTERM (15) - Graceful" },
            { value: "SIGKILL", label: "SIGKILL (9) - Force" },
            { value: "SIGHUP", label: "SIGHUP (1) - Hangup" },
            { value: "SIGINT", label: "SIGINT (2) - Interrupt" },
            { value: "SIGSTOP", label: "SIGSTOP (19) - Pause" },
            { value: "SIGCONT", label: "SIGCONT (18) - Continue" },
            { value: "SIGUSR1", label: "SIGUSR1 (10)" },
            { value: "SIGUSR2", label: "SIGUSR2 (12)" },
          ] },
        ],
      },
    ],
  },

  // ── zip ────────────────────────────────────────────────────────
  zip: {
    binary: "zip",
    subcommands: [
      {
        name: "-r",
        label: "Create Archive",
        sections: [{
          title: "Create ZIP",
          defaultOpen: true,
          fields: [
            { id: "archive", type: "text", label: "Archive Name", flag: "", positional: true, placeholder: "archive.zip", required: true },
            { id: "files", type: "repeatable", label: "Files / Directories", flag: "", placeholder: "src/ README.md", addLabel: "+ Add Path" },
            { id: "level", type: "select", label: "Compression Level", flag: "", options: [
              { value: "", label: "Default (6)" },
              { value: "-0", label: "Store only (0)" },
              { value: "-1", label: "Fastest (1)" },
              { value: "-9", label: "Best (9)" },
            ] },
            { id: "exclude", type: "repeatable", label: "Exclude (-x)", flag: "-x", placeholder: "*.log", addLabel: "+ Add Exclude" },
            { id: "password", type: "text", label: "Password (-P)", flag: "-P", placeholder: "secret", halfWidth: true },
            { id: "encrypt", type: "checkbox", label: "Encrypt (-e)", flag: "-e" },
            { id: "quiet", type: "checkbox", label: "Quiet (-q)", flag: "-q" },
          ],
        }],
      },
      {
        name: "",
        label: "Extract (unzip)",
        sections: [{
          title: "Extract ZIP",
          defaultOpen: true,
          fields: [
            { id: "archive", type: "text", label: "Archive", flag: "", positional: true, placeholder: "archive.zip", required: true },
            { id: "dest", type: "text", label: "Destination (-d)", flag: "-d", placeholder: "./output" },
            { id: "overwrite", type: "checkbox", label: "Overwrite (-o)", flag: "-o" },
            { id: "list", type: "checkbox", label: "List only (-l)", flag: "-l" },
            { id: "quiet", type: "checkbox", label: "Quiet (-q)", flag: "-q" },
          ],
        }],
      },
    ],
  },

  // ── netcat ─────────────────────────────────────────────────────
  netcat: {
    binary: "nc",
    sections: [
      {
        title: "Connection",
        defaultOpen: true,
        fields: [
          { id: "host", type: "text", label: "Host", flag: "", positional: true, placeholder: "192.168.1.1", halfWidth: true },
          { id: "port", type: "text", label: "Port", flag: "", positional: true, placeholder: "8080", halfWidth: true },
        ],
      },
      {
        title: "Mode",
        defaultOpen: true,
        fields: [
          { id: "listen", type: "checkbox", label: "Listen mode (-l)", flag: "-l" },
          { id: "udp", type: "checkbox", label: "UDP mode (-u)", flag: "-u" },
          { id: "verbose", type: "checkbox", label: "Verbose (-v)", flag: "-v" },
          { id: "zero", type: "checkbox", label: "Zero-I/O / scan (-z)", flag: "-z" },
          { id: "wait", type: "number", label: "Timeout (-w)", flag: "-w", placeholder: "5", halfWidth: true, hint: "Seconds" },
          { id: "keepopen", type: "checkbox", label: "Keep open (-k)", flag: "-k" },
          { id: "portrange", type: "text", label: "Port Range (scan)", flag: "", positional: true, placeholder: "20-100", hint: "For port scanning e.g. 20-100" },
        ],
      },
    ],
  },

  // ── dig ────────────────────────────────────────────────────────
  dig: {
    binary: "dig",
    sections: [
      {
        title: "Query",
        defaultOpen: true,
        fields: [
          { id: "server", type: "text", label: "DNS Server (@)", flag: "", positional: true, placeholder: "@8.8.8.8", halfWidth: true },
          { id: "domain", type: "text", label: "Domain", flag: "", positional: true, placeholder: "example.com", required: true, halfWidth: true },
          { id: "type", type: "text", label: "Record Type", flag: "", positional: true, placeholder: "A", hint: "A, AAAA, MX, CNAME, TXT, NS, SOA, SRV, ANY" },
        ],
      },
      {
        title: "Options",
        defaultOpen: false,
        fields: [
          { id: "short", type: "checkbox", label: "Short answer (+short)", flag: "+short" },
          { id: "trace", type: "checkbox", label: "Trace resolution (+trace)", flag: "+trace" },
          { id: "reverse", type: "checkbox", label: "Reverse lookup (-x)", flag: "-x" },
          { id: "noall", type: "checkbox", label: "Suppress all (+noall)", flag: "+noall" },
          { id: "answer", type: "checkbox", label: "Show answer (+answer)", flag: "+answer" },
          { id: "stats", type: "checkbox", label: "Show stats (+stats)", flag: "+stats" },
        ],
      },
    ],
  },

  // ── ping ───────────────────────────────────────────────────────
  ping: {
    binary: "ping",
    sections: [
      {
        title: "Target",
        defaultOpen: true,
        fields: [
          { id: "host", type: "text", label: "Host", flag: "", positional: true, placeholder: "google.com", required: true },
        ],
      },
      {
        title: "Options",
        defaultOpen: true,
        fields: [
          { id: "count", type: "number", label: "Count (-c)", flag: "-c", placeholder: "4", halfWidth: true },
          { id: "interval", type: "number", label: "Interval secs (-i)", flag: "-i", placeholder: "1", halfWidth: true },
          { id: "ttl", type: "number", label: "TTL (-t)", flag: "-t", placeholder: "64", halfWidth: true },
          { id: "size", type: "number", label: "Packet size (-s)", flag: "-s", placeholder: "56", halfWidth: true },
          { id: "wait", type: "number", label: "Deadline secs (-W)", flag: "-W", placeholder: "5", halfWidth: true },
          { id: "flood", type: "checkbox", label: "Flood ping (-f)", flag: "-f" },
          { id: "quiet", type: "checkbox", label: "Quiet (-q)", flag: "-q" },
          { id: "ipv4", type: "checkbox", label: "IPv4 only (-4)", flag: "-4" },
          { id: "ipv6", type: "checkbox", label: "IPv6 only (-6)", flag: "-6" },
        ],
      },
    ],
  },

  // ── traceroute ─────────────────────────────────────────────────
  traceroute: {
    binary: "traceroute",
    sections: [
      {
        title: "Target",
        defaultOpen: true,
        fields: [
          { id: "host", type: "text", label: "Host", flag: "", positional: true, placeholder: "google.com", required: true },
        ],
      },
      {
        title: "Options",
        defaultOpen: true,
        fields: [
          { id: "maxhops", type: "number", label: "Max hops (-m)", flag: "-m", placeholder: "30", halfWidth: true },
          { id: "queries", type: "number", label: "Queries per hop (-q)", flag: "-q", placeholder: "3", halfWidth: true },
          { id: "wait", type: "number", label: "Wait time secs (-w)", flag: "-w", placeholder: "5", halfWidth: true },
          { id: "firstttl", type: "number", label: "First TTL (-f)", flag: "-f", placeholder: "1", halfWidth: true },
          { id: "icmp", type: "checkbox", label: "ICMP mode (-I)", flag: "-I" },
          { id: "tcp", type: "checkbox", label: "TCP mode (-T)", flag: "-T" },
          { id: "noresolve", type: "checkbox", label: "No DNS resolve (-n)", flag: "-n" },
          { id: "port", type: "number", label: "Port (-p)", flag: "-p", placeholder: "80", halfWidth: true },
        ],
      },
    ],
  },

  // ── iptables ───────────────────────────────────────────────────
  iptables: {
    binary: "iptables",
    subcommands: [
      {
        name: "-A",
        label: "Append Rule",
        sections: [{
          title: "Append Rule",
          defaultOpen: true,
          fields: [
            { id: "chain", type: "text", label: "Chain", flag: "", positional: true, required: true, placeholder: "INPUT", hint: "INPUT, OUTPUT, or FORWARD" },
            { id: "protocol", type: "select", label: "Protocol (-p)", flag: "-p", options: [
              { value: "", label: "Any" },
              { value: "tcp", label: "TCP" },
              { value: "udp", label: "UDP" },
              { value: "icmp", label: "ICMP" },
            ], halfWidth: true },
            { id: "dport", type: "text", label: "Dest Port (--dport)", flag: "--dport", placeholder: "80", halfWidth: true },
            { id: "sport", type: "text", label: "Source Port (--sport)", flag: "--sport", placeholder: "1024:65535", halfWidth: true },
            { id: "source", type: "text", label: "Source IP (-s)", flag: "-s", placeholder: "192.168.1.0/24", halfWidth: true },
            { id: "dest", type: "text", label: "Destination IP (-d)", flag: "-d", placeholder: "10.0.0.0/8", halfWidth: true },
            { id: "iface_in", type: "text", label: "In Interface (-i)", flag: "-i", placeholder: "eth0", halfWidth: true },
            { id: "iface_out", type: "text", label: "Out Interface (-o)", flag: "-o", placeholder: "eth1", halfWidth: true },
            { id: "jump", type: "select", label: "Target (-j)", flag: "-j", required: true, options: [
              { value: "ACCEPT", label: "ACCEPT" },
              { value: "DROP", label: "DROP" },
              { value: "REJECT", label: "REJECT" },
              { value: "LOG", label: "LOG" },
              { value: "MASQUERADE", label: "MASQUERADE" },
            ] },
          ],
        }],
      },
      {
        name: "-L",
        label: "List Rules",
        sections: [{
          title: "List Rules",
          defaultOpen: true,
          fields: [
            { id: "chain", type: "text", label: "Chain", flag: "", positional: true, placeholder: "INPUT", hint: "INPUT, OUTPUT, FORWARD, or leave empty for all" },
            { id: "verbose", type: "checkbox", label: "Verbose (-v)", flag: "-v" },
            { id: "numeric", type: "checkbox", label: "Numeric output (-n)", flag: "-n" },
            { id: "linenumbers", type: "checkbox", label: "Line numbers (--line-numbers)", flag: "--line-numbers" },
          ],
        }],
      },
      {
        name: "-D",
        label: "Delete Rule",
        sections: [{
          title: "Delete Rule",
          defaultOpen: true,
          fields: [
            { id: "chain", type: "text", label: "Chain", flag: "", positional: true, required: true, placeholder: "INPUT", hint: "INPUT, OUTPUT, or FORWARD" },
            { id: "rulenum", type: "text", label: "Rule Number", flag: "", positional: true, placeholder: "1", hint: "Use -L --line-numbers to find rule number" },
          ],
        }],
      },
      {
        name: "-F",
        label: "Flush Rules",
        sections: [{
          title: "Flush Rules",
          defaultOpen: true,
          fields: [
            { id: "chain", type: "text", label: "Chain", flag: "", positional: true, placeholder: "INPUT", hint: "INPUT, OUTPUT, FORWARD, or leave empty for all" },
          ],
        }],
      },
    ],
  },

  // ── openssl ────────────────────────────────────────────────────
  openssl: {
    binary: "openssl",
    subcommands: [
      {
        name: "req -new -x509",
        label: "Self-signed Cert",
        sections: [{
          title: "Generate Self-signed Certificate",
          defaultOpen: true,
          fields: [
            { id: "key", type: "text", label: "Key File (-key)", flag: "-key", placeholder: "server.key", halfWidth: true },
            { id: "out", type: "text", label: "Output Cert (-out)", flag: "-out", placeholder: "server.crt", required: true, halfWidth: true },
            { id: "days", type: "number", label: "Validity Days (-days)", flag: "-days", placeholder: "365", halfWidth: true },
            { id: "newkey", type: "text", label: "New Key (-newkey)", flag: "-newkey", placeholder: "rsa:2048", halfWidth: true },
            { id: "keyout", type: "text", label: "Key Output (-keyout)", flag: "-keyout", placeholder: "server.key", halfWidth: true },
            { id: "nodes", type: "checkbox", label: "No passphrase (-nodes)", flag: "-nodes" },
            { id: "subj", type: "text", label: "Subject (-subj)", flag: "-subj", placeholder: "/CN=example.com/O=MyOrg/C=US", quoted: true },
          ],
        }],
      },
      {
        name: "genrsa",
        label: "Generate RSA Key",
        sections: [{
          title: "Generate RSA Private Key",
          defaultOpen: true,
          fields: [
            { id: "out", type: "text", label: "Output File (-out)", flag: "-out", placeholder: "private.key", required: true, halfWidth: true },
            { id: "bits", type: "text", label: "Key Size (bits)", flag: "", positional: true, placeholder: "2048", hint: "2048 or 4096", halfWidth: true },
          ],
        }],
      },
      {
        name: "x509 -in",
        label: "Inspect Certificate",
        sections: [{
          title: "View Certificate Details",
          defaultOpen: true,
          fields: [
            { id: "in", type: "text", label: "Certificate File", flag: "", positional: true, placeholder: "server.crt", required: true },
            { id: "text", type: "checkbox", label: "Full text (-text)", flag: "-text" },
            { id: "noout", type: "checkbox", label: "No cert output (-noout)", flag: "-noout" },
            { id: "dates", type: "checkbox", label: "Show dates (-dates)", flag: "-dates" },
            { id: "subject", type: "checkbox", label: "Show subject (-subject)", flag: "-subject" },
            { id: "issuer", type: "checkbox", label: "Show issuer (-issuer)", flag: "-issuer" },
          ],
        }],
      },
      {
        name: "s_client -connect",
        label: "Test TLS Connection",
        sections: [{
          title: "TLS Client Connection",
          defaultOpen: true,
          fields: [
            { id: "connect", type: "text", label: "Host:Port", flag: "", positional: true, placeholder: "example.com:443", required: true },
            { id: "servername", type: "text", label: "SNI (-servername)", flag: "-servername", placeholder: "example.com", halfWidth: true },
            { id: "showcerts", type: "checkbox", label: "Show full chain (-showcerts)", flag: "-showcerts" },
            { id: "verify", type: "checkbox", label: "Verify (-verify)", flag: "-verify" },
          ],
        }],
      },
    ],
  },

  // ── gpg ────────────────────────────────────────────────────────
  gpg: {
    binary: "gpg",
    subcommands: [
      {
        name: "--encrypt",
        label: "Encrypt",
        sections: [{
          title: "Encrypt File",
          defaultOpen: true,
          fields: [
            { id: "recipient", type: "repeatable", label: "Recipient (-r)", flag: "-r", placeholder: "user@example.com", addLabel: "+ Add Recipient" },
            { id: "file", type: "text", label: "File", flag: "", positional: true, placeholder: "secret.txt", required: true },
            { id: "output", type: "text", label: "Output (-o)", flag: "-o", placeholder: "secret.txt.gpg", halfWidth: true },
            { id: "armor", type: "checkbox", label: "ASCII armor (-a)", flag: "-a" },
            { id: "symmetric", type: "checkbox", label: "Symmetric (-c)", flag: "-c", hint: "Password-based encryption" },
          ],
        }],
      },
      {
        name: "--decrypt",
        label: "Decrypt",
        sections: [{
          title: "Decrypt File",
          defaultOpen: true,
          fields: [
            { id: "file", type: "text", label: "Encrypted File", flag: "", positional: true, placeholder: "secret.txt.gpg", required: true },
            { id: "output", type: "text", label: "Output (-o)", flag: "-o", placeholder: "secret.txt", halfWidth: true },
          ],
        }],
      },
      {
        name: "--sign",
        label: "Sign",
        sections: [{
          title: "Sign File",
          defaultOpen: true,
          fields: [
            { id: "file", type: "text", label: "File", flag: "", positional: true, placeholder: "document.txt", required: true },
            { id: "output", type: "text", label: "Output (-o)", flag: "-o", placeholder: "document.txt.sig", halfWidth: true },
            { id: "armor", type: "checkbox", label: "ASCII armor (-a)", flag: "-a" },
            { id: "detach", type: "checkbox", label: "Detached signature (-b)", flag: "-b" },
            { id: "local_user", type: "text", label: "Key to sign with (-u)", flag: "-u", placeholder: "user@example.com", halfWidth: true },
          ],
        }],
      },
      {
        name: "--verify",
        label: "Verify",
        sections: [{
          title: "Verify Signature",
          defaultOpen: true,
          fields: [
            { id: "sigfile", type: "text", label: "Signature File", flag: "", positional: true, placeholder: "document.txt.sig", required: true },
            { id: "file", type: "text", label: "Original File", flag: "", positional: true, placeholder: "document.txt" },
          ],
        }],
      },
    ],
  },

  // ── certbot ────────────────────────────────────────────────────
  certbot: {
    binary: "certbot",
    subcommands: [
      {
        name: "certonly",
        sections: [{
          title: "Obtain Certificate",
          defaultOpen: true,
          fields: [
            { id: "domain", type: "repeatable", label: "Domains (-d)", flag: "-d", placeholder: "example.com", addLabel: "+ Add Domain" },
            { id: "email", type: "text", label: "Email (--email)", flag: "--email", placeholder: "admin@example.com", halfWidth: true },
            { id: "method", type: "select", label: "Verification Method", flag: "", options: [
              { value: "--webroot", label: "Webroot" },
              { value: "--standalone", label: "Standalone" },
              { value: "--nginx", label: "Nginx Plugin" },
              { value: "--apache", label: "Apache Plugin" },
              { value: "--manual", label: "Manual (DNS)" },
            ] },
            { id: "webroot", type: "text", label: "Webroot Path (-w)", flag: "-w", placeholder: "/var/www/html", halfWidth: true },
            { id: "agree", type: "checkbox", label: "Agree to TOS (--agree-tos)", flag: "--agree-tos" },
            { id: "dryrun", type: "checkbox", label: "Dry run (--dry-run)", flag: "--dry-run" },
            { id: "staging", type: "checkbox", label: "Staging server (--staging)", flag: "--staging" },
            { id: "force", type: "checkbox", label: "Force renewal (--force-renewal)", flag: "--force-renewal" },
          ],
        }],
      },
      {
        name: "renew",
        sections: [{
          title: "Renew Certificates",
          defaultOpen: true,
          fields: [
            { id: "dryrun", type: "checkbox", label: "Dry run (--dry-run)", flag: "--dry-run" },
            { id: "force", type: "checkbox", label: "Force renewal (--force-renewal)", flag: "--force-renewal" },
            { id: "quiet", type: "checkbox", label: "Quiet (--quiet)", flag: "--quiet" },
            { id: "hooks", type: "text", label: "Deploy hook (--deploy-hook)", flag: "--deploy-hook", placeholder: "systemctl reload nginx", quoted: true },
          ],
        }],
      },
      {
        name: "certificates",
        sections: [{
          title: "List Certificates",
          defaultOpen: true,
          fields: [
            { id: "domain", type: "text", label: "Filter Domain (-d)", flag: "-d", placeholder: "example.com" },
          ],
        }],
      },
      {
        name: "revoke",
        sections: [{
          title: "Revoke Certificate",
          defaultOpen: true,
          fields: [
            { id: "cert", type: "text", label: "Cert Path (--cert-path)", flag: "--cert-path", placeholder: "/etc/letsencrypt/live/example.com/cert.pem", required: true },
            { id: "reason", type: "select", label: "Reason (--reason)", flag: "--reason", options: [
              { value: "", label: "Default" },
              { value: "keycompromise", label: "Key Compromise" },
              { value: "affiliationchanged", label: "Affiliation Changed" },
              { value: "superseded", label: "Superseded" },
              { value: "cessationofoperation", label: "Cessation of Operation" },
            ] },
          ],
        }],
      },
    ],
  },

  // ── nginx ──────────────────────────────────────────────────────
  nginx: {
    binary: "nginx",
    sections: [
      {
        title: "Action",
        defaultOpen: true,
        fields: [
          { id: "test", type: "checkbox", label: "Test config (-t)", flag: "-t" },
          { id: "signal", type: "select", label: "Signal (-s)", flag: "-s", options: [
            { value: "", label: "None (start)" },
            { value: "reload", label: "Reload" },
            { value: "stop", label: "Stop (fast)" },
            { value: "quit", label: "Quit (graceful)" },
            { value: "reopen", label: "Reopen logs" },
          ] },
        ],
      },
      {
        title: "Options",
        defaultOpen: false,
        fields: [
          { id: "config", type: "text", label: "Config file (-c)", flag: "-c", placeholder: "/etc/nginx/nginx.conf" },
          { id: "prefix", type: "text", label: "Prefix path (-p)", flag: "-p", placeholder: "/etc/nginx" },
          { id: "globals", type: "text", label: "Global directives (-g)", flag: "-g", placeholder: "daemon off;", quoted: true },
          { id: "version", type: "checkbox", label: "Show version (-v)", flag: "-v" },
          { id: "versionfull", type: "checkbox", label: "Full version info (-V)", flag: "-V" },
        ],
      },
    ],
  },

  // ── pm2 ────────────────────────────────────────────────────────
  pm2: {
    binary: "pm2",
    subcommands: [
      {
        name: "start",
        sections: [{
          title: "Start Process",
          defaultOpen: true,
          fields: [
            { id: "script", type: "text", label: "Script / Config", flag: "", positional: true, placeholder: "app.js", required: true },
            { id: "name", type: "text", label: "Name (--name)", flag: "--name", placeholder: "my-app", halfWidth: true },
            { id: "instances", type: "text", label: "Instances (-i)", flag: "-i", placeholder: "max", halfWidth: true, hint: "Number or 'max' for cluster" },
            { id: "watch", type: "checkbox", label: "Watch (--watch)", flag: "--watch" },
            { id: "maxmemory", type: "text", label: "Max Memory (--max-memory-restart)", flag: "--max-memory-restart", placeholder: "200M", halfWidth: true },
            { id: "cron", type: "text", label: "Cron Restart (--cron-restart)", flag: "--cron-restart", placeholder: "0 0 * * *", quoted: true, halfWidth: true },
            { id: "env", type: "keyvalue", label: "Environment (--env)", flag: "--env", keyPlaceholder: "KEY", valuePlaceholder: "value", separator: " ", addLabel: "+ Add Env" },
          ],
        }],
      },
      {
        name: "stop",
        sections: [{
          title: "Stop Process",
          defaultOpen: true,
          fields: [
            { id: "target", type: "text", label: "App Name / ID / all", flag: "", positional: true, placeholder: "my-app", required: true },
          ],
        }],
      },
      {
        name: "restart",
        sections: [{
          title: "Restart Process",
          defaultOpen: true,
          fields: [
            { id: "target", type: "text", label: "App Name / ID / all", flag: "", positional: true, placeholder: "my-app", required: true },
            { id: "update_env", type: "checkbox", label: "Update env (--update-env)", flag: "--update-env" },
          ],
        }],
      },
      {
        name: "logs",
        sections: [{
          title: "View Logs",
          defaultOpen: true,
          fields: [
            { id: "target", type: "text", label: "App Name / ID", flag: "", positional: true, placeholder: "my-app" },
            { id: "lines", type: "number", label: "Lines (--lines)", flag: "--lines", placeholder: "50", halfWidth: true },
            { id: "raw", type: "checkbox", label: "Raw output (--raw)", flag: "--raw" },
            { id: "nostream", type: "checkbox", label: "No stream (--nostream)", flag: "--nostream" },
          ],
        }],
      },
      {
        name: "list",
        label: "list",
        sections: [{
          title: "List Processes",
          defaultOpen: true,
          fields: [
            { id: "sort", type: "select", label: "Sort (--sort)", flag: "--sort", options: [
              { value: "", label: "Default" },
              { value: "name", label: "Name" },
              { value: "id", label: "ID" },
              { value: "cpu", label: "CPU" },
              { value: "memory", label: "Memory" },
            ] },
          ],
        }],
      },
    ],
  },

  // ── mysql ──────────────────────────────────────────────────────
  mysql: {
    binary: "mysql",
    sections: [
      {
        title: "Connection",
        defaultOpen: true,
        fields: [
          { id: "host", type: "text", label: "Host (-h)", flag: "-h", placeholder: "localhost", halfWidth: true },
          { id: "port", type: "number", label: "Port (-P)", flag: "-P", placeholder: "3306", halfWidth: true },
          { id: "user", type: "text", label: "User (-u)", flag: "-u", placeholder: "root", halfWidth: true },
          { id: "password", type: "text", label: "Password (-p)", flag: "-p", placeholder: "password", halfWidth: true },
          { id: "database", type: "text", label: "Database (-D)", flag: "-D", placeholder: "mydb" },
        ],
      },
      {
        title: "Execution",
        defaultOpen: true,
        fields: [
          { id: "execute", type: "text", label: "Execute Query (-e)", flag: "-e", placeholder: "SELECT * FROM users LIMIT 10", quoted: true },
          { id: "source", type: "text", label: "Source File (<)", flag: "<", placeholder: "dump.sql", hint: "Pipe SQL file via stdin redirect" },
        ],
      },
      {
        title: "Options",
        defaultOpen: false,
        fields: [
          { id: "batch", type: "checkbox", label: "Batch mode (-B)", flag: "-B" },
          { id: "table", type: "checkbox", label: "Table output (-t)", flag: "-t" },
          { id: "verbose", type: "checkbox", label: "Verbose (-v)", flag: "-v" },
          { id: "ssl", type: "checkbox", label: "Require SSL (--ssl)", flag: "--ssl" },
          { id: "compress", type: "checkbox", label: "Compress (--compress)", flag: "--compress" },
          { id: "defaultCharset", type: "text", label: "Charset (--default-character-set)", flag: "--default-character-set", placeholder: "utf8mb4", halfWidth: true },
        ],
      },
    ],
  },

  // ── psql ───────────────────────────────────────────────────────
  psql: {
    binary: "psql",
    sections: [
      {
        title: "Connection",
        defaultOpen: true,
        fields: [
          { id: "host", type: "text", label: "Host (-h)", flag: "-h", placeholder: "localhost", halfWidth: true },
          { id: "port", type: "number", label: "Port (-p)", flag: "-p", placeholder: "5432", halfWidth: true },
          { id: "user", type: "text", label: "User (-U)", flag: "-U", placeholder: "postgres", halfWidth: true },
          { id: "dbname", type: "text", label: "Database (-d)", flag: "-d", placeholder: "mydb", halfWidth: true },
        ],
      },
      {
        title: "Execution",
        defaultOpen: true,
        fields: [
          { id: "command", type: "text", label: "Command (-c)", flag: "-c", placeholder: "SELECT * FROM users;", quoted: true },
          { id: "file", type: "text", label: "SQL File (-f)", flag: "-f", placeholder: "schema.sql" },
        ],
      },
      {
        title: "Options",
        defaultOpen: false,
        fields: [
          { id: "noPassword", type: "checkbox", label: "No password prompt (-w)", flag: "-w" },
          { id: "tuples", type: "checkbox", label: "Tuples only (-t)", flag: "-t" },
          { id: "html", type: "checkbox", label: "HTML output (-H)", flag: "-H" },
          { id: "csv", type: "checkbox", label: "CSV output (--csv)", flag: "--csv" },
          { id: "expanded", type: "checkbox", label: "Expanded output (-x)", flag: "-x" },
          { id: "variable", type: "keyvalue", label: "Variables (-v)", flag: "-v", keyPlaceholder: "name", valuePlaceholder: "value", separator: "=", addLabel: "+ Add Variable" },
        ],
      },
    ],
  },

  // ── redis-cli ──────────────────────────────────────────────────
  "redis-cli": {
    binary: "redis-cli",
    sections: [
      {
        title: "Connection",
        defaultOpen: true,
        fields: [
          { id: "host", type: "text", label: "Host (-h)", flag: "-h", placeholder: "127.0.0.1", halfWidth: true },
          { id: "port", type: "number", label: "Port (-p)", flag: "-p", placeholder: "6379", halfWidth: true },
          { id: "auth", type: "text", label: "Password (-a)", flag: "-a", placeholder: "password", halfWidth: true },
          { id: "db", type: "number", label: "Database (-n)", flag: "-n", placeholder: "0", halfWidth: true },
          { id: "url", type: "text", label: "URL (-u)", flag: "-u", placeholder: "redis://user:pass@host:6379/0" },
        ],
      },
      {
        title: "Execution",
        defaultOpen: true,
        fields: [
          { id: "command", type: "text", label: "Command", flag: "", positional: true, placeholder: "GET mykey", hint: "Redis command to execute" },
          { id: "pipe", type: "checkbox", label: "Pipe mode (--pipe)", flag: "--pipe" },
          { id: "scan", type: "checkbox", label: "Scan mode (--scan)", flag: "--scan" },
          { id: "pattern", type: "text", label: "Scan Pattern (--pattern)", flag: "--pattern", placeholder: "user:*", halfWidth: true },
        ],
      },
      {
        title: "Options",
        defaultOpen: false,
        fields: [
          { id: "tls", type: "checkbox", label: "TLS (--tls)", flag: "--tls" },
          { id: "cluster", type: "checkbox", label: "Cluster mode (-c)", flag: "-c" },
          { id: "repeat", type: "number", label: "Repeat (-r)", flag: "-r", placeholder: "1", halfWidth: true },
          { id: "interval", type: "number", label: "Interval secs (-i)", flag: "-i", placeholder: "1", halfWidth: true },
          { id: "bigkeys", type: "checkbox", label: "Find big keys (--bigkeys)", flag: "--bigkeys" },
          { id: "stat", type: "checkbox", label: "Stat mode (--stat)", flag: "--stat" },
        ],
      },
    ],
  },

  // ── sqlite3 ────────────────────────────────────────────────────
  sqlite3: {
    binary: "sqlite3",
    sections: [
      {
        title: "Database",
        defaultOpen: true,
        fields: [
          { id: "dbfile", type: "text", label: "Database File", flag: "", positional: true, placeholder: "data.db", required: true },
          { id: "command", type: "text", label: "SQL Command", flag: "", positional: true, placeholder: "SELECT * FROM users;", quoted: true },
        ],
      },
      {
        title: "Options",
        defaultOpen: true,
        fields: [
          { id: "header", type: "checkbox", label: "Show headers (-header)", flag: "-header" },
          { id: "mode", type: "select", label: "Output Mode", flag: "", options: [
            { value: "", label: "Default" },
            { value: "-csv", label: "CSV" },
            { value: "-json", label: "JSON" },
            { value: "-table", label: "Table" },
            { value: "-html", label: "HTML" },
            { value: "-column", label: "Column" },
            { value: "-line", label: "Line" },
          ] },
          { id: "separator", type: "text", label: "Separator (-separator)", flag: "-separator", placeholder: ",", halfWidth: true },
          { id: "readonly", type: "checkbox", label: "Read-only (-readonly)", flag: "-readonly" },
          { id: "init", type: "text", label: "Init File (-init)", flag: "-init", placeholder: "init.sql", halfWidth: true },
          { id: "cmd", type: "text", label: "Dot command (-cmd)", flag: "-cmd", placeholder: ".schema", halfWidth: true, quoted: true },
        ],
      },
    ],
  },

  // ── helm ───────────────────────────────────────────────────────
  helm: {
    binary: "helm",
    subcommands: [
      {
        name: "install",
        sections: [{
          title: "Install Chart",
          defaultOpen: true,
          fields: [
            { id: "name", type: "text", label: "Release Name", flag: "", positional: true, placeholder: "my-release", required: true },
            { id: "chart", type: "text", label: "Chart", flag: "", positional: true, placeholder: "bitnami/nginx", required: true },
            { id: "namespace", type: "text", label: "Namespace (-n)", flag: "-n", placeholder: "default", halfWidth: true },
            { id: "version", type: "text", label: "Chart Version (--version)", flag: "--version", placeholder: "1.2.3", halfWidth: true },
            { id: "values", type: "repeatable", label: "Values Files (-f)", flag: "-f", placeholder: "values.yaml", addLabel: "+ Add Values File" },
            { id: "set", type: "keyvalue", label: "Set Values (--set)", flag: "--set", keyPlaceholder: "key", valuePlaceholder: "value", separator: "=", addLabel: "+ Add Value" },
            { id: "createns", type: "checkbox", label: "Create namespace (--create-namespace)", flag: "--create-namespace" },
            { id: "dryrun", type: "checkbox", label: "Dry run (--dry-run)", flag: "--dry-run" },
            { id: "wait", type: "checkbox", label: "Wait (--wait)", flag: "--wait" },
          ],
        }],
      },
      {
        name: "upgrade",
        sections: [{
          title: "Upgrade Release",
          defaultOpen: true,
          fields: [
            { id: "name", type: "text", label: "Release Name", flag: "", positional: true, placeholder: "my-release", required: true },
            { id: "chart", type: "text", label: "Chart", flag: "", positional: true, placeholder: "bitnami/nginx", required: true },
            { id: "namespace", type: "text", label: "Namespace (-n)", flag: "-n", placeholder: "default", halfWidth: true },
            { id: "version", type: "text", label: "Chart Version (--version)", flag: "--version", placeholder: "1.2.3", halfWidth: true },
            { id: "values", type: "repeatable", label: "Values Files (-f)", flag: "-f", placeholder: "values.yaml", addLabel: "+ Add Values File" },
            { id: "set", type: "keyvalue", label: "Set Values (--set)", flag: "--set", keyPlaceholder: "key", valuePlaceholder: "value", separator: "=", addLabel: "+ Add Value" },
            { id: "install", type: "checkbox", label: "Install if absent (--install)", flag: "--install" },
            { id: "dryrun", type: "checkbox", label: "Dry run (--dry-run)", flag: "--dry-run" },
            { id: "wait", type: "checkbox", label: "Wait (--wait)", flag: "--wait" },
            { id: "atomic", type: "checkbox", label: "Atomic (--atomic)", flag: "--atomic" },
          ],
        }],
      },
      {
        name: "uninstall",
        sections: [{
          title: "Uninstall Release",
          defaultOpen: true,
          fields: [
            { id: "name", type: "text", label: "Release Name", flag: "", positional: true, placeholder: "my-release", required: true },
            { id: "namespace", type: "text", label: "Namespace (-n)", flag: "-n", placeholder: "default", halfWidth: true },
            { id: "dryrun", type: "checkbox", label: "Dry run (--dry-run)", flag: "--dry-run" },
            { id: "keephistory", type: "checkbox", label: "Keep history (--keep-history)", flag: "--keep-history" },
          ],
        }],
      },
      {
        name: "list",
        sections: [{
          title: "List Releases",
          defaultOpen: true,
          fields: [
            { id: "namespace", type: "text", label: "Namespace (-n)", flag: "-n", placeholder: "default", halfWidth: true },
            { id: "allns", type: "checkbox", label: "All namespaces (-A)", flag: "-A" },
            { id: "all", type: "checkbox", label: "All releases (-a)", flag: "-a" },
            { id: "output", type: "select", label: "Output (-o)", flag: "-o", options: [
              { value: "", label: "Default (table)" },
              { value: "json", label: "JSON" },
              { value: "yaml", label: "YAML" },
            ], halfWidth: true },
          ],
        }],
      },
    ],
  },

  // ── gcloud ─────────────────────────────────────────────────────
  gcloud: {
    binary: "gcloud",
    subcommands: [
      {
        name: "compute instances list",
        label: "compute instances list",
        sections: [{
          title: "List Instances",
          defaultOpen: true,
          fields: [
            { id: "project", type: "text", label: "Project (--project)", flag: "--project", placeholder: "my-project", halfWidth: true },
            { id: "zones", type: "text", label: "Zones (--zones)", flag: "--zones", placeholder: "us-central1-a", halfWidth: true },
            { id: "filter", type: "text", label: "Filter (--filter)", flag: "--filter", placeholder: "status=RUNNING", quoted: true },
            { id: "format", type: "select", label: "Format (--format)", flag: "--format", options: [
              { value: "", label: "Default" },
              { value: "json", label: "JSON" },
              { value: "yaml", label: "YAML" },
              { value: "table", label: "Table" },
              { value: "csv", label: "CSV" },
            ] },
          ],
        }],
      },
      {
        name: "compute instances create",
        label: "compute instances create",
        sections: [{
          title: "Create Instance",
          defaultOpen: true,
          fields: [
            { id: "name", type: "text", label: "Instance Name", flag: "", positional: true, placeholder: "my-vm", required: true },
            { id: "zone", type: "text", label: "Zone (--zone)", flag: "--zone", placeholder: "us-central1-a", halfWidth: true },
            { id: "machineType", type: "text", label: "Machine Type (--machine-type)", flag: "--machine-type", placeholder: "e2-medium", halfWidth: true },
            { id: "image", type: "text", label: "Image (--image)", flag: "--image", placeholder: "debian-11-bullseye-v20231010", halfWidth: true },
            { id: "imageProject", type: "text", label: "Image Project (--image-project)", flag: "--image-project", placeholder: "debian-cloud", halfWidth: true },
            { id: "bootDiskSize", type: "text", label: "Boot Disk Size (--boot-disk-size)", flag: "--boot-disk-size", placeholder: "50GB", halfWidth: true },
            { id: "project", type: "text", label: "Project (--project)", flag: "--project", placeholder: "my-project", halfWidth: true },
            { id: "tags", type: "text", label: "Tags (--tags)", flag: "--tags", placeholder: "http-server,https-server" },
          ],
        }],
      },
      {
        name: "auth login",
        label: "auth login",
        sections: [{
          title: "Authenticate",
          defaultOpen: true,
          fields: [
            { id: "noBrowser", type: "checkbox", label: "No browser (--no-launch-browser)", flag: "--no-launch-browser" },
            { id: "project", type: "text", label: "Set Project (--project)", flag: "--project", placeholder: "my-project" },
            { id: "activate", type: "checkbox", label: "Activate account (--activate)", flag: "--activate" },
          ],
        }],
      },
      {
        name: "config set",
        label: "config set",
        sections: [{
          title: "Set Configuration",
          defaultOpen: true,
          fields: [
            { id: "property", type: "text", label: "Property", flag: "", positional: true, placeholder: "project", required: true, hint: "e.g. project, compute/zone, compute/region" },
            { id: "value", type: "text", label: "Value", flag: "", positional: true, placeholder: "my-project", required: true },
          ],
        }],
      },
    ],
  },

  // ── ansible-playbook ───────────────────────────────────────────
  "ansible-playbook": {
    binary: "ansible-playbook",
    sections: [
      {
        title: "Playbook",
        defaultOpen: true,
        fields: [
          { id: "playbook", type: "text", label: "Playbook File", flag: "", positional: true, placeholder: "site.yml", required: true },
          { id: "inventory", type: "text", label: "Inventory (-i)", flag: "-i", placeholder: "hosts.ini", halfWidth: true },
          { id: "limit", type: "text", label: "Limit (--limit)", flag: "--limit", placeholder: "webservers", halfWidth: true },
        ],
      },
      {
        title: "Execution",
        defaultOpen: true,
        fields: [
          { id: "tags", type: "text", label: "Tags (--tags)", flag: "--tags", placeholder: "deploy,config", halfWidth: true },
          { id: "skipTags", type: "text", label: "Skip Tags (--skip-tags)", flag: "--skip-tags", placeholder: "slow", halfWidth: true },
          { id: "extraVars", type: "keyvalue", label: "Extra Vars (-e)", flag: "-e", keyPlaceholder: "var", valuePlaceholder: "value", separator: "=", addLabel: "+ Add Variable" },
          { id: "check", type: "checkbox", label: "Check mode / Dry run (--check)", flag: "--check" },
          { id: "diff", type: "checkbox", label: "Show diff (--diff)", flag: "--diff" },
          { id: "verbose", type: "select", label: "Verbosity", flag: "", options: [
            { value: "", label: "Normal" },
            { value: "-v", label: "Verbose (-v)" },
            { value: "-vv", label: "More Verbose (-vv)" },
            { value: "-vvv", label: "Debug (-vvv)" },
          ] },
        ],
      },
      {
        title: "Connection",
        defaultOpen: false,
        fields: [
          { id: "user", type: "text", label: "Remote User (-u)", flag: "-u", placeholder: "deploy", halfWidth: true },
          { id: "privateKey", type: "text", label: "Private Key (--private-key)", flag: "--private-key", placeholder: "~/.ssh/id_rsa", halfWidth: true },
          { id: "become", type: "checkbox", label: "Become / sudo (-b)", flag: "-b" },
          { id: "becomeUser", type: "text", label: "Become User (--become-user)", flag: "--become-user", placeholder: "root", halfWidth: true },
          { id: "askBecomePass", type: "checkbox", label: "Ask sudo password (-K)", flag: "-K" },
          { id: "forks", type: "number", label: "Forks (-f)", flag: "-f", placeholder: "5", halfWidth: true },
        ],
      },
    ],
  },

  // ── packer ─────────────────────────────────────────────────────
  packer: {
    binary: "packer",
    subcommands: [
      {
        name: "build",
        sections: [{
          title: "Build Image",
          defaultOpen: true,
          fields: [
            { id: "template", type: "text", label: "Template", flag: "", positional: true, placeholder: "template.pkr.hcl", required: true },
            { id: "varfile", type: "repeatable", label: "Var Files (-var-file)", flag: "-var-file", placeholder: "vars.pkrvars.hcl", addLabel: "+ Add Var File" },
            { id: "var", type: "keyvalue", label: "Variables (-var)", flag: "-var", keyPlaceholder: "name", valuePlaceholder: "value", separator: "=", addLabel: "+ Add Variable" },
            { id: "only", type: "text", label: "Only Sources (-only)", flag: "-only", placeholder: "amazon-ebs.web", halfWidth: true },
            { id: "except", type: "text", label: "Except Sources (-except)", flag: "-except", placeholder: "docker.local", halfWidth: true },
            { id: "force", type: "checkbox", label: "Force (-force)", flag: "-force" },
            { id: "parallel", type: "checkbox", label: "Parallel builds (default: true)", flag: "-parallel-builds=1", hint: "Set to disable parallel" },
            { id: "color", type: "checkbox", label: "Colored output (-color=true)", flag: "-color=true" },
          ],
        }],
      },
      {
        name: "validate",
        sections: [{
          title: "Validate Template",
          defaultOpen: true,
          fields: [
            { id: "template", type: "text", label: "Template", flag: "", positional: true, placeholder: "template.pkr.hcl", required: true },
            { id: "varfile", type: "repeatable", label: "Var Files (-var-file)", flag: "-var-file", placeholder: "vars.pkrvars.hcl", addLabel: "+ Add Var File" },
            { id: "var", type: "keyvalue", label: "Variables (-var)", flag: "-var", keyPlaceholder: "name", valuePlaceholder: "value", separator: "=", addLabel: "+ Add Variable" },
            { id: "syntaxOnly", type: "checkbox", label: "Syntax only (-syntax-only)", flag: "-syntax-only" },
          ],
        }],
      },
      {
        name: "init",
        sections: [{
          title: "Init Plugins",
          defaultOpen: true,
          fields: [
            { id: "template", type: "text", label: "Template", flag: "", positional: true, placeholder: "template.pkr.hcl", required: true },
            { id: "upgrade", type: "checkbox", label: "Upgrade plugins (-upgrade)", flag: "-upgrade" },
          ],
        }],
      },
    ],
  },

  // ── vagrant ────────────────────────────────────────────────────
  vagrant: {
    binary: "vagrant",
    subcommands: [
      {
        name: "up",
        sections: [{
          title: "Start VM",
          defaultOpen: true,
          fields: [
            { id: "machine", type: "text", label: "Machine Name", flag: "", positional: true, placeholder: "default" },
            { id: "provider", type: "select", label: "Provider (--provider)", flag: "--provider", options: [
              { value: "", label: "Default" },
              { value: "virtualbox", label: "VirtualBox" },
              { value: "vmware_desktop", label: "VMware" },
              { value: "docker", label: "Docker" },
              { value: "libvirt", label: "Libvirt" },
            ], halfWidth: true },
            { id: "provision", type: "checkbox", label: "Run provisioners (--provision)", flag: "--provision" },
            { id: "noProvision", type: "checkbox", label: "Skip provisioners (--no-provision)", flag: "--no-provision" },
            { id: "destroy", type: "checkbox", label: "Destroy on error (--destroy-on-error)", flag: "--destroy-on-error" },
          ],
        }],
      },
      {
        name: "ssh",
        sections: [{
          title: "SSH into VM",
          defaultOpen: true,
          fields: [
            { id: "machine", type: "text", label: "Machine Name", flag: "", positional: true, placeholder: "default" },
            { id: "command", type: "text", label: "Command (-c)", flag: "-c", placeholder: "ls -la", quoted: true },
          ],
        }],
      },
      {
        name: "halt",
        sections: [{
          title: "Stop VM",
          defaultOpen: true,
          fields: [
            { id: "machine", type: "text", label: "Machine Name", flag: "", positional: true, placeholder: "default" },
            { id: "force", type: "checkbox", label: "Force (-f)", flag: "-f" },
          ],
        }],
      },
      {
        name: "destroy",
        sections: [{
          title: "Destroy VM",
          defaultOpen: true,
          fields: [
            { id: "machine", type: "text", label: "Machine Name", flag: "", positional: true, placeholder: "default" },
            { id: "force", type: "checkbox", label: "Force (-f)", flag: "-f" },
            { id: "graceful", type: "checkbox", label: "Graceful (--graceful)", flag: "--graceful" },
          ],
        }],
      },
    ],
  },

  // ── cargo ──────────────────────────────────────────────────────
  cargo: {
    binary: "cargo",
    subcommands: [
      {
        name: "build",
        sections: [{
          title: "Build",
          defaultOpen: true,
          fields: [
            { id: "release", type: "checkbox", label: "Release mode (--release)", flag: "--release" },
            { id: "target", type: "text", label: "Target (--target)", flag: "--target", placeholder: "x86_64-unknown-linux-gnu", halfWidth: true },
            { id: "features", type: "text", label: "Features (--features)", flag: "--features", placeholder: "serde,tokio", halfWidth: true },
            { id: "allFeatures", type: "checkbox", label: "All features (--all-features)", flag: "--all-features" },
            { id: "noDefaultFeatures", type: "checkbox", label: "No default features (--no-default-features)", flag: "--no-default-features" },
            { id: "jobs", type: "number", label: "Jobs (-j)", flag: "-j", placeholder: "4", halfWidth: true },
            { id: "verbose", type: "checkbox", label: "Verbose (-v)", flag: "-v" },
          ],
        }],
      },
      {
        name: "run",
        sections: [{
          title: "Run",
          defaultOpen: true,
          fields: [
            { id: "release", type: "checkbox", label: "Release mode (--release)", flag: "--release" },
            { id: "bin", type: "text", label: "Binary (--bin)", flag: "--bin", placeholder: "my-binary", halfWidth: true },
            { id: "example", type: "text", label: "Example (--example)", flag: "--example", placeholder: "basic", halfWidth: true },
            { id: "features", type: "text", label: "Features (--features)", flag: "--features", placeholder: "serde", halfWidth: true },
          ],
        }],
      },
      {
        name: "test",
        sections: [{
          title: "Test",
          defaultOpen: true,
          fields: [
            { id: "testname", type: "text", label: "Test Name Filter", flag: "", positional: true, placeholder: "test_login" },
            { id: "release", type: "checkbox", label: "Release mode (--release)", flag: "--release" },
            { id: "nocapture", type: "checkbox", label: "Show output (-- --nocapture)", flag: "-- --nocapture" },
            { id: "doc", type: "checkbox", label: "Doc tests only (--doc)", flag: "--doc" },
            { id: "lib", type: "checkbox", label: "Lib only (--lib)", flag: "--lib" },
            { id: "jobs", type: "number", label: "Jobs (-j)", flag: "-j", placeholder: "4", halfWidth: true },
          ],
        }],
      },
      {
        name: "add",
        sections: [{
          title: "Add Dependency",
          defaultOpen: true,
          fields: [
            { id: "crate", type: "text", label: "Crate", flag: "", positional: true, placeholder: "serde", required: true },
            { id: "features", type: "text", label: "Features (-F)", flag: "-F", placeholder: "derive,json", halfWidth: true },
            { id: "dev", type: "checkbox", label: "Dev dependency (--dev)", flag: "--dev" },
            { id: "build", type: "checkbox", label: "Build dependency (--build)", flag: "--build" },
            { id: "optional", type: "checkbox", label: "Optional (--optional)", flag: "--optional" },
            { id: "rename", type: "text", label: "Rename (--rename)", flag: "--rename", placeholder: "my_serde", halfWidth: true },
          ],
        }],
      },
    ],
  },

  // ── yarn ───────────────────────────────────────────────────────
  yarn: {
    binary: "yarn",
    subcommands: [
      {
        name: "add",
        sections: [{
          title: "Add Packages",
          defaultOpen: true,
          fields: [
            { id: "packages", type: "repeatable", label: "Packages", flag: "", placeholder: "react", addLabel: "+ Add Package" },
            { id: "dev", type: "checkbox", label: "Dev dependency (-D)", flag: "-D" },
            { id: "peer", type: "checkbox", label: "Peer dependency (-P)", flag: "-P" },
            { id: "exact", type: "checkbox", label: "Exact version (-E)", flag: "-E" },
          ],
        }],
      },
      {
        name: "remove",
        sections: [{
          title: "Remove Packages",
          defaultOpen: true,
          fields: [
            { id: "packages", type: "repeatable", label: "Packages", flag: "", placeholder: "react", addLabel: "+ Add Package" },
          ],
        }],
      },
      {
        name: "run",
        sections: [{
          title: "Run Script",
          defaultOpen: true,
          fields: [
            { id: "script", type: "text", label: "Script Name", flag: "", positional: true, placeholder: "build", required: true },
          ],
        }],
      },
      {
        name: "dlx",
        sections: [{
          title: "Execute Package",
          defaultOpen: true,
          fields: [
            { id: "package", type: "text", label: "Package", flag: "", positional: true, placeholder: "create-react-app my-app", required: true },
            { id: "quiet", type: "checkbox", label: "Quiet (-q)", flag: "-q" },
          ],
        }],
      },
    ],
  },

  // ── pnpm ───────────────────────────────────────────────────────
  pnpm: {
    binary: "pnpm",
    subcommands: [
      {
        name: "add",
        sections: [{
          title: "Add Packages",
          defaultOpen: true,
          fields: [
            { id: "packages", type: "repeatable", label: "Packages", flag: "", placeholder: "express", addLabel: "+ Add Package" },
            { id: "saveDev", type: "checkbox", label: "Dev dependency (-D)", flag: "-D" },
            { id: "saveExact", type: "checkbox", label: "Exact version (-E)", flag: "-E" },
            { id: "global", type: "checkbox", label: "Global (-g)", flag: "-g" },
            { id: "workspace", type: "checkbox", label: "Workspace (-w)", flag: "-w" },
            { id: "filter", type: "text", label: "Filter (--filter)", flag: "--filter", placeholder: "my-package", halfWidth: true },
          ],
        }],
      },
      {
        name: "run",
        sections: [{
          title: "Run Script",
          defaultOpen: true,
          fields: [
            { id: "script", type: "text", label: "Script Name", flag: "", positional: true, placeholder: "build", required: true },
            { id: "filter", type: "text", label: "Filter (--filter)", flag: "--filter", placeholder: "my-package", halfWidth: true },
            { id: "recursive", type: "checkbox", label: "Recursive (-r)", flag: "-r" },
            { id: "parallel", type: "checkbox", label: "Parallel (--parallel)", flag: "--parallel" },
          ],
        }],
      },
      {
        name: "install",
        sections: [{
          title: "Install",
          defaultOpen: true,
          fields: [
            { id: "frozen", type: "checkbox", label: "Frozen lockfile (--frozen-lockfile)", flag: "--frozen-lockfile" },
            { id: "noDev", type: "checkbox", label: "Production only (-P)", flag: "-P" },
            { id: "shamefully", type: "checkbox", label: "Shamefully hoist (--shamefully-hoist)", flag: "--shamefully-hoist" },
            { id: "filter", type: "text", label: "Filter (--filter)", flag: "--filter", placeholder: "my-package" },
          ],
        }],
      },
    ],
  },

  // ── pandoc ─────────────────────────────────────────────────────
  pandoc: {
    binary: "pandoc",
    sections: [
      {
        title: "Input / Output",
        defaultOpen: true,
        fields: [
          { id: "input", type: "text", label: "Input File", flag: "", positional: true, placeholder: "document.md", required: true },
          { id: "output", type: "text", label: "Output File (-o)", flag: "-o", placeholder: "output.pdf", required: true, halfWidth: true },
          { id: "from", type: "select", label: "From Format (-f)", flag: "-f", options: [
            { value: "", label: "Auto-detect" },
            { value: "markdown", label: "Markdown" },
            { value: "html", label: "HTML" },
            { value: "latex", label: "LaTeX" },
            { value: "rst", label: "reStructuredText" },
            { value: "docx", label: "DOCX" },
            { value: "org", label: "Org-mode" },
            { value: "csv", label: "CSV" },
          ], halfWidth: true },
          { id: "to", type: "select", label: "To Format (-t)", flag: "-t", options: [
            { value: "", label: "Auto-detect from output" },
            { value: "html", label: "HTML" },
            { value: "pdf", label: "PDF" },
            { value: "latex", label: "LaTeX" },
            { value: "docx", label: "DOCX" },
            { value: "epub", label: "EPUB" },
            { value: "rst", label: "reStructuredText" },
            { value: "plain", label: "Plain Text" },
            { value: "revealjs", label: "Reveal.js Slides" },
          ] },
        ],
      },
      {
        title: "Options",
        defaultOpen: true,
        fields: [
          { id: "standalone", type: "checkbox", label: "Standalone (-s)", flag: "-s" },
          { id: "toc", type: "checkbox", label: "Table of contents (--toc)", flag: "--toc" },
          { id: "template", type: "text", label: "Template (--template)", flag: "--template", placeholder: "my-template.html", halfWidth: true },
          { id: "css", type: "text", label: "CSS (--css)", flag: "--css", placeholder: "style.css", halfWidth: true },
          { id: "metadata", type: "keyvalue", label: "Metadata (-M)", flag: "-M", keyPlaceholder: "key", valuePlaceholder: "value", separator: "=", addLabel: "+ Add Metadata" },
          { id: "variable", type: "keyvalue", label: "Variables (-V)", flag: "-V", keyPlaceholder: "key", valuePlaceholder: "value", separator: "=", addLabel: "+ Add Variable" },
        ],
      },
      {
        title: "Advanced",
        defaultOpen: false,
        fields: [
          { id: "numberSections", type: "checkbox", label: "Number sections (--number-sections)", flag: "--number-sections" },
          { id: "highlight", type: "select", label: "Highlight Style (--highlight-style)", flag: "--highlight-style", options: [
            { value: "", label: "Default" },
            { value: "pygments", label: "Pygments" },
            { value: "kate", label: "Kate" },
            { value: "monochrome", label: "Monochrome" },
            { value: "breezeDark", label: "Breeze Dark" },
            { value: "espresso", label: "Espresso" },
            { value: "zenburn", label: "Zenburn" },
            { value: "haddock", label: "Haddock" },
            { value: "tango", label: "Tango" },
          ], halfWidth: true },
          { id: "pdfEngine", type: "select", label: "PDF Engine (--pdf-engine)", flag: "--pdf-engine", options: [
            { value: "", label: "Default" },
            { value: "xelatex", label: "XeLaTeX" },
            { value: "lualatex", label: "LuaLaTeX" },
            { value: "pdflatex", label: "pdfLaTeX" },
            { value: "wkhtmltopdf", label: "wkhtmltopdf" },
            { value: "weasyprint", label: "WeasyPrint" },
          ], halfWidth: true },
          { id: "filter", type: "repeatable", label: "Filters (--filter)", flag: "--filter", placeholder: "pandoc-citeproc", addLabel: "+ Add Filter" },
        ],
      },
    ],
  },

  // ── make ───────────────────────────────────────────────────────
  make: {
    binary: "make",
    sections: [
      {
        title: "Target",
        defaultOpen: true,
        fields: [
          { id: "target", type: "text", label: "Target", flag: "", positional: true, placeholder: "build", hint: "Target name from Makefile" },
        ],
      },
      {
        title: "Options",
        defaultOpen: true,
        fields: [
          { id: "file", type: "text", label: "Makefile (-f)", flag: "-f", placeholder: "Makefile", halfWidth: true },
          { id: "jobs", type: "number", label: "Parallel Jobs (-j)", flag: "-j", placeholder: "4", halfWidth: true },
          { id: "directory", type: "text", label: "Directory (-C)", flag: "-C", placeholder: "./src", halfWidth: true },
          { id: "dryrun", type: "checkbox", label: "Dry run (-n)", flag: "-n" },
          { id: "keep", type: "checkbox", label: "Keep going (-k)", flag: "-k" },
          { id: "silent", type: "checkbox", label: "Silent (-s)", flag: "-s" },
          { id: "always", type: "checkbox", label: "Always make (-B)", flag: "-B" },
          { id: "vars", type: "keyvalue", label: "Variables", flag: "", keyPlaceholder: "VAR", valuePlaceholder: "value", separator: "=", addLabel: "+ Add Variable" },
        ],
      },
    ],
  },

  // ── rclone ─────────────────────────────────────────────────────
  rclone: {
    binary: "rclone",
    subcommands: [
      {
        name: "copy",
        sections: [{
          title: "Copy Files",
          defaultOpen: true,
          fields: [
            { id: "source", type: "text", label: "Source", flag: "", positional: true, placeholder: "remote:bucket/path", required: true },
            { id: "dest", type: "text", label: "Destination", flag: "", positional: true, placeholder: "./local/path", required: true },
            { id: "progress", type: "checkbox", label: "Show progress (-P)", flag: "-P" },
            { id: "dryrun", type: "checkbox", label: "Dry run (--dry-run)", flag: "--dry-run" },
            { id: "transfers", type: "number", label: "Transfers (--transfers)", flag: "--transfers", placeholder: "4", halfWidth: true },
            { id: "bwlimit", type: "text", label: "Bandwidth Limit (--bwlimit)", flag: "--bwlimit", placeholder: "10M", halfWidth: true },
            { id: "exclude", type: "repeatable", label: "Exclude (--exclude)", flag: "--exclude", placeholder: "*.tmp", addLabel: "+ Add Exclude" },
            { id: "include", type: "repeatable", label: "Include (--include)", flag: "--include", placeholder: "*.jpg", addLabel: "+ Add Include" },
          ],
        }],
      },
      {
        name: "sync",
        sections: [{
          title: "Sync Directories",
          defaultOpen: true,
          fields: [
            { id: "source", type: "text", label: "Source", flag: "", positional: true, placeholder: "./local/path", required: true },
            { id: "dest", type: "text", label: "Destination", flag: "", positional: true, placeholder: "remote:bucket/path", required: true },
            { id: "progress", type: "checkbox", label: "Show progress (-P)", flag: "-P" },
            { id: "dryrun", type: "checkbox", label: "Dry run (--dry-run)", flag: "--dry-run" },
            { id: "transfers", type: "number", label: "Transfers (--transfers)", flag: "--transfers", placeholder: "4", halfWidth: true },
            { id: "bwlimit", type: "text", label: "Bandwidth Limit (--bwlimit)", flag: "--bwlimit", placeholder: "10M", halfWidth: true },
            { id: "exclude", type: "repeatable", label: "Exclude (--exclude)", flag: "--exclude", placeholder: "*.tmp", addLabel: "+ Add Exclude" },
          ],
        }],
      },
      {
        name: "ls",
        sections: [{
          title: "List Files",
          defaultOpen: true,
          fields: [
            { id: "remote", type: "text", label: "Remote Path", flag: "", positional: true, placeholder: "remote:bucket/path", required: true },
            { id: "recursive", type: "checkbox", label: "Recursive (--recursive)", flag: "--recursive" },
            { id: "maxdepth", type: "number", label: "Max Depth (--max-depth)", flag: "--max-depth", placeholder: "1", halfWidth: true },
          ],
        }],
      },
    ],
  },

  // ── nmap ───────────────────────────────────────────────────────
  nmap: {
    binary: "nmap",
    sections: [
      {
        title: "Target",
        defaultOpen: true,
        fields: [
          { id: "target", type: "text", label: "Target Host(s)", flag: "", positional: true, placeholder: "192.168.1.0/24", required: true, hint: "IP, hostname, CIDR, or range" },
        ],
      },
      {
        title: "Scan Type",
        defaultOpen: true,
        fields: [
          { id: "scanType", type: "select", label: "Scan Type", flag: "", options: [
            { value: "", label: "Default (SYN)" },
            { value: "-sT", label: "TCP Connect (-sT)" },
            { value: "-sS", label: "SYN Stealth (-sS)" },
            { value: "-sU", label: "UDP (-sU)" },
            { value: "-sn", label: "Ping Scan / No Port (-sn)" },
            { value: "-sV", label: "Version Detection (-sV)" },
          ] },
          { id: "ports", type: "text", label: "Ports (-p)", flag: "-p", placeholder: "22,80,443 or 1-1000", halfWidth: true },
          { id: "topPorts", type: "number", label: "Top Ports (--top-ports)", flag: "--top-ports", placeholder: "100", halfWidth: true },
          { id: "os", type: "checkbox", label: "OS Detection (-O)", flag: "-O" },
          { id: "serviceVersion", type: "checkbox", label: "Service version (-sV)", flag: "-sV" },
          { id: "aggressive", type: "checkbox", label: "Aggressive (-A)", flag: "-A" },
        ],
      },
      {
        title: "Output",
        defaultOpen: false,
        fields: [
          { id: "output", type: "text", label: "Output File (-oN)", flag: "-oN", placeholder: "scan.txt", halfWidth: true },
          { id: "xml", type: "text", label: "XML Output (-oX)", flag: "-oX", placeholder: "scan.xml", halfWidth: true },
          { id: "verbose", type: "checkbox", label: "Verbose (-v)", flag: "-v" },
          { id: "reason", type: "checkbox", label: "Show reason (--reason)", flag: "--reason" },
          { id: "timing", type: "select", label: "Timing (-T)", flag: "-T", options: [
            { value: "", label: "Default (T3)" },
            { value: "0", label: "Paranoid (T0)" },
            { value: "1", label: "Sneaky (T1)" },
            { value: "2", label: "Polite (T2)" },
            { value: "3", label: "Normal (T3)" },
            { value: "4", label: "Aggressive (T4)" },
            { value: "5", label: "Insane (T5)" },
          ], halfWidth: true },
        ],
      },
    ],
  },

  // ── mtr ────────────────────────────────────────────────────────
  mtr: {
    binary: "mtr",
    sections: [
      {
        title: "Target",
        defaultOpen: true,
        fields: [
          { id: "host", type: "text", label: "Host", flag: "", positional: true, placeholder: "google.com", required: true },
        ],
      },
      {
        title: "Options",
        defaultOpen: true,
        fields: [
          { id: "report", type: "checkbox", label: "Report mode (-r)", flag: "-r" },
          { id: "reportWide", type: "checkbox", label: "Wide report (-w)", flag: "-w" },
          { id: "cycles", type: "number", label: "Report cycles (-c)", flag: "-c", placeholder: "10", halfWidth: true },
          { id: "interval", type: "number", label: "Interval secs (-i)", flag: "-i", placeholder: "1", halfWidth: true },
          { id: "maxhops", type: "number", label: "Max hops (-m)", flag: "-m", placeholder: "30", halfWidth: true },
          { id: "tcp", type: "checkbox", label: "TCP mode (--tcp)", flag: "--tcp" },
          { id: "udp", type: "checkbox", label: "UDP mode (--udp)", flag: "--udp" },
          { id: "port", type: "number", label: "Port (-P)", flag: "-P", placeholder: "80", halfWidth: true },
          { id: "noresolve", type: "checkbox", label: "No DNS resolve (-n)", flag: "-n" },
          { id: "json", type: "checkbox", label: "JSON output (--json)", flag: "--json" },
          { id: "csv", type: "checkbox", label: "CSV output (--csv)", flag: "--csv" },
          { id: "ipv4", type: "checkbox", label: "IPv4 only (-4)", flag: "-4" },
          { id: "ipv6", type: "checkbox", label: "IPv6 only (-6)", flag: "-6" },
        ],
      },
    ],
  },

  // ── whois ──────────────────────────────────────────────────────
  whois: {
    binary: "whois",
    sections: [
      {
        title: "Query",
        defaultOpen: true,
        fields: [
          { id: "domain", type: "text", label: "Domain / IP", flag: "", positional: true, placeholder: "example.com", required: true },
        ],
      },
      {
        title: "Options",
        defaultOpen: false,
        fields: [
          { id: "server", type: "text", label: "WHOIS Server (-h)", flag: "-h", placeholder: "whois.verisign-grs.com", halfWidth: true },
          { id: "port", type: "number", label: "Port (-p)", flag: "-p", placeholder: "43", halfWidth: true },
          { id: "norecurse", type: "checkbox", label: "No recursion (-r)", flag: "-r" },
        ],
      },
    ],
  },

  // ── ffprobe ────────────────────────────────────────────────────
  ffprobe: {
    binary: "ffprobe",
    sections: [
      {
        title: "Input",
        defaultOpen: true,
        fields: [
          { id: "input", type: "text", label: "Input File", flag: "", positional: true, placeholder: "video.mp4", required: true },
        ],
      },
      {
        title: "Output Options",
        defaultOpen: true,
        fields: [
          { id: "showStreams", type: "checkbox", label: "Show streams (-show_streams)", flag: "-show_streams" },
          { id: "showFormat", type: "checkbox", label: "Show format (-show_format)", flag: "-show_format" },
          { id: "showFrames", type: "checkbox", label: "Show frames (-show_frames)", flag: "-show_frames" },
          { id: "showEntries", type: "text", label: "Show entries (-show_entries)", flag: "-show_entries", placeholder: "stream=codec_name,width,height", halfWidth: true },
          { id: "selectStreams", type: "select", label: "Select Stream (-select_streams)", flag: "-select_streams", options: [
            { value: "", label: "All" },
            { value: "v:0", label: "Video (v:0)" },
            { value: "a:0", label: "Audio (a:0)" },
            { value: "s:0", label: "Subtitle (s:0)" },
          ], halfWidth: true },
          { id: "outputFormat", type: "select", label: "Output Format (-of)", flag: "-of", options: [
            { value: "", label: "Default" },
            { value: "json", label: "JSON" },
            { value: "csv", label: "CSV" },
            { value: "xml", label: "XML" },
            { value: "flat", label: "Flat" },
            { value: "ini", label: "INI" },
          ], halfWidth: true },
          { id: "pretty", type: "checkbox", label: "Pretty print (-pretty)", flag: "-pretty" },
          { id: "quiet", type: "checkbox", label: "Suppress banner (-hide_banner)", flag: "-hide_banner" },
        ],
      },
    ],
  },

  // ── magick ─────────────────────────────────────────────────────
  magick: {
    binary: "magick",
    sections: [
      {
        title: "Input / Output",
        defaultOpen: true,
        fields: [
          { id: "input", type: "text", label: "Input File", flag: "", positional: true, placeholder: "photo.jpg", required: true },
          { id: "output", type: "text", label: "Output File", flag: "", positional: true, placeholder: "photo.png", required: true },
        ],
      },
      {
        title: "Transform",
        defaultOpen: true,
        fields: [
          { id: "resize", type: "text", label: "Resize (-resize)", flag: "-resize", placeholder: "800x600", halfWidth: true, hint: "WxH, 50%, 800x (width only)" },
          { id: "crop", type: "text", label: "Crop (-crop)", flag: "-crop", placeholder: "640x480+10+20", halfWidth: true, hint: "WxH+X+Y" },
          { id: "rotate", type: "number", label: "Rotate (-rotate)", flag: "-rotate", placeholder: "90", halfWidth: true },
          { id: "flip", type: "checkbox", label: "Flip vertical (-flip)", flag: "-flip" },
          { id: "flop", type: "checkbox", label: "Flip horizontal (-flop)", flag: "-flop" },
          { id: "strip", type: "checkbox", label: "Strip metadata (-strip)", flag: "-strip" },
        ],
      },
      {
        title: "Quality & Effects",
        defaultOpen: false,
        fields: [
          { id: "quality", type: "number", label: "Quality (-quality)", flag: "-quality", placeholder: "85", halfWidth: true, min: 1, max: 100 },
          { id: "density", type: "text", label: "Density / DPI (-density)", flag: "-density", placeholder: "300", halfWidth: true },
          { id: "blur", type: "text", label: "Blur (-blur)", flag: "-blur", placeholder: "0x3", halfWidth: true },
          { id: "sharpen", type: "text", label: "Sharpen (-sharpen)", flag: "-sharpen", placeholder: "0x1", halfWidth: true },
          { id: "grayscale", type: "checkbox", label: "Grayscale (-colorspace Gray)", flag: "-colorspace Gray" },
          { id: "negate", type: "checkbox", label: "Negate (-negate)", flag: "-negate" },
          { id: "auto_orient", type: "checkbox", label: "Auto-orient (-auto-orient)", flag: "-auto-orient" },
        ],
      },
    ],
  },
};
