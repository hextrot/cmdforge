"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import CommandPreview from "@/components/CommandPreview";
import Section from "@/components/Section";
import FormField, { TextInput, SelectInput, CheckboxInput, NumberInput, TextAreaInput } from "@/components/FormField";
import AiHelper from "@/components/AiHelper";

interface Header {
  key: string;
  value: string;
}

export default function CurlBuilder() {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState<Header[]>([{ key: "", value: "" }]);
  const [body, setBody] = useState("");
  const [bodyType, setBodyType] = useState("raw");
  const [auth, setAuth] = useState("");
  const [authType, setAuthType] = useState("none");
  const [output, setOutput] = useState("");
  const [followRedirects, setFollowRedirects] = useState(false);
  const [insecure, setInsecure] = useState(false);
  const [verbose, setVerbose] = useState(false);
  const [silent, setSilent] = useState(false);
  const [compressed, setCompressed] = useState(false);
  const [maxTime, setMaxTime] = useState("");
  const [connectTimeout, setConnectTimeout] = useState("");
  const [retries, setRetries] = useState("");
  const [proxy, setProxy] = useState("");
  const [userAgent, setUserAgent] = useState("");
  const [cookie, setCookie] = useState("");
  const [dataUrlencode, setDataUrlencode] = useState(false);

  const command = useMemo(() => {
    const parts: string[] = ["curl"];

    if (method !== "GET") parts.push(`-X ${method}`);
    if (followRedirects) parts.push("-L");
    if (insecure) parts.push("-k");
    if (verbose) parts.push("-v");
    if (silent) parts.push("-s");
    if (compressed) parts.push("--compressed");

    if (maxTime) parts.push(`--max-time ${maxTime}`);
    if (connectTimeout) parts.push(`--connect-timeout ${connectTimeout}`);
    if (retries) parts.push(`--retry ${retries}`);
    if (proxy) parts.push(`--proxy '${proxy}'`);
    if (userAgent) parts.push(`-A '${userAgent}'`);
    if (cookie) parts.push(`-b '${cookie}'`);

    if (authType === "basic" && auth) parts.push(`-u '${auth}'`);
    if (authType === "bearer" && auth) parts.push(`-H 'Authorization: Bearer ${auth}'`);

    headers.forEach((h) => {
      if (h.key && h.value) parts.push(`-H '${h.key}: ${h.value}'`);
    });

    if (body) {
      if (dataUrlencode) {
        parts.push(`--data-urlencode '${body}'`);
      } else if (bodyType === "json") {
        parts.push(`-H 'Content-Type: application/json'`);
        parts.push(`-d '${body}'`);
      } else if (bodyType === "form") {
        parts.push(`-H 'Content-Type: application/x-www-form-urlencoded'`);
        parts.push(`-d '${body}'`);
      } else if (bodyType === "file") {
        parts.push(`-d @${body}`);
      } else {
        parts.push(`-d '${body}'`);
      }
    }

    if (output) parts.push(`-o '${output}'`);
    if (url) parts.push(`'${url}'`);

    return parts.join(" \\\n  ");
  }, [url, method, headers, body, bodyType, auth, authType, output, followRedirects, insecure, verbose, silent, compressed, maxTime, connectTimeout, retries, proxy, userAgent, cookie, dataUrlencode]);

  const addHeader = () => setHeaders([...headers, { key: "", value: "" }]);
  const removeHeader = (i: number) => setHeaders(headers.filter((_, idx) => idx !== i));
  const updateHeader = (i: number, field: "key" | "value", val: string) => {
    const updated = [...headers];
    updated[i][field] = val;
    setHeaders(updated);
  };

  const handleAiCommand = (cmd: string) => {
    // Parse a generated curl command and populate fields
    // For simplicity, just show it in the preview by setting the URL
    // A full parser would be complex - instead show the AI output directly
    setUrl(cmd.replace(/^curl\s+/, "").replace(/['"]/g, ""));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-lg">
            ↗
          </div>
          <div>
            <h1 className="text-xl font-bold">curl Builder</h1>
            <p className="text-sm text-[var(--color-text-muted)]">Build HTTP requests visually</p>
          </div>
        </div>

        <AiHelper tool="curl" onCommandGenerated={handleAiCommand} />

        <Section title="Request">
          <div className="grid grid-cols-[140px_1fr] gap-3">
            <FormField label="Method">
              <SelectInput
                value={method}
                onChange={setMethod}
                options={[
                  { value: "GET", label: "GET" },
                  { value: "POST", label: "POST" },
                  { value: "PUT", label: "PUT" },
                  { value: "PATCH", label: "PATCH" },
                  { value: "DELETE", label: "DELETE" },
                  { value: "HEAD", label: "HEAD" },
                  { value: "OPTIONS", label: "OPTIONS" },
                ]}
              />
            </FormField>
            <FormField label="URL" required>
              <TextInput value={url} onChange={setUrl} placeholder="https://api.example.com/endpoint" />
            </FormField>
          </div>
        </Section>

        <Section title="Headers">
          {headers.map((h, i) => (
            <div key={i} className="flex gap-2 items-end">
              <div className="flex-1">
                <TextInput value={h.key} onChange={(v) => updateHeader(i, "key", v)} placeholder="Header name" />
              </div>
              <div className="flex-1">
                <TextInput value={h.value} onChange={(v) => updateHeader(i, "value", v)} placeholder="Value" />
              </div>
              <button
                onClick={() => removeHeader(i)}
                className="p-2 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            onClick={addHeader}
            className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
          >
            + Add Header
          </button>
        </Section>

        <Section title="Authentication" defaultOpen={false}>
          <FormField label="Auth Type">
            <SelectInput
              value={authType}
              onChange={setAuthType}
              options={[
                { value: "none", label: "None" },
                { value: "basic", label: "Basic (user:pass)" },
                { value: "bearer", label: "Bearer Token" },
              ]}
            />
          </FormField>
          {authType !== "none" && (
            <FormField label={authType === "basic" ? "Credentials" : "Token"}>
              <TextInput
                value={auth}
                onChange={setAuth}
                placeholder={authType === "basic" ? "username:password" : "your-token-here"}
              />
            </FormField>
          )}
        </Section>

        <Section title="Body" defaultOpen={false}>
          <FormField label="Content Type">
            <SelectInput
              value={bodyType}
              onChange={setBodyType}
              options={[
                { value: "raw", label: "Raw" },
                { value: "json", label: "JSON" },
                { value: "form", label: "Form URL-encoded" },
                { value: "file", label: "File (@path)" },
              ]}
            />
          </FormField>
          <FormField label="Body" hint={bodyType === "file" ? "Enter the file path (without @)" : undefined}>
            <TextAreaInput
              value={body}
              onChange={setBody}
              placeholder={bodyType === "json" ? '{"key": "value"}' : bodyType === "file" ? "/path/to/file.json" : "data=value&other=value"}
              rows={4}
            />
          </FormField>
          <CheckboxInput checked={dataUrlencode} onChange={setDataUrlencode} label="URL-encode data (--data-urlencode)" />
        </Section>

        <Section title="Options" defaultOpen={false}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <CheckboxInput checked={followRedirects} onChange={setFollowRedirects} label="Follow redirects (-L)" />
            <CheckboxInput checked={insecure} onChange={setInsecure} label="Skip TLS verify (-k)" />
            <CheckboxInput checked={verbose} onChange={setVerbose} label="Verbose (-v)" />
            <CheckboxInput checked={silent} onChange={setSilent} label="Silent (-s)" />
            <CheckboxInput checked={compressed} onChange={setCompressed} label="Compressed" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Max Time (seconds)">
              <NumberInput value={maxTime} onChange={setMaxTime} placeholder="30" min={0} />
            </FormField>
            <FormField label="Connect Timeout (seconds)">
              <NumberInput value={connectTimeout} onChange={setConnectTimeout} placeholder="10" min={0} />
            </FormField>
            <FormField label="Retries">
              <NumberInput value={retries} onChange={setRetries} placeholder="0" min={0} />
            </FormField>
            <FormField label="Output File">
              <TextInput value={output} onChange={setOutput} placeholder="output.json" />
            </FormField>
          </div>
        </Section>

        <Section title="Advanced" defaultOpen={false}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Proxy">
              <TextInput value={proxy} onChange={setProxy} placeholder="http://proxy:8080" />
            </FormField>
            <FormField label="User-Agent">
              <TextInput value={userAgent} onChange={setUserAgent} placeholder="Mozilla/5.0..." />
            </FormField>
            <FormField label="Cookie">
              <TextInput value={cookie} onChange={setCookie} placeholder="name=value; name2=value2" />
            </FormField>
          </div>
        </Section>

        <div className="h-4" />
      </main>
      <CommandPreview command={command} />
    </div>
  );
}
