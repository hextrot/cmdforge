"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import CommandPreview from "@/components/CommandPreview";
import Section from "@/components/Section";
import FormField, { TextInput, SelectInput, CheckboxInput, NumberInput } from "@/components/FormField";
import AiHelper from "@/components/AiHelper";

interface PortMapping { host: string; container: string; protocol: string; }
interface VolumeMapping { host: string; container: string; mode: string; }
interface EnvVar { key: string; value: string; }

export default function DockerBuilder() {
  const [subcommand, setSubcommand] = useState("run");

  // docker run state
  const [image, setImage] = useState("");
  const [tag, setTag] = useState("latest");
  const [containerName, setContainerName] = useState("");
  const [ports, setPorts] = useState<PortMapping[]>([{ host: "", container: "", protocol: "tcp" }]);
  const [volumes, setVolumes] = useState<VolumeMapping[]>([{ host: "", container: "", mode: "rw" }]);
  const [envVars, setEnvVars] = useState<EnvVar[]>([{ key: "", value: "" }]);
  const [detached, setDetached] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [tty, setTty] = useState(false);
  const [rm, setRm] = useState(false);
  const [restart, setRestart] = useState("no");
  const [network, setNetwork] = useState("");
  const [workdir, setWorkdir] = useState("");
  const [entrypoint, setEntrypoint] = useState("");
  const [cmd, setCmd] = useState("");
  const [memory, setMemory] = useState("");
  const [cpus, setCpus] = useState("");
  const [user, setUser] = useState("");
  const [hostname, setHostname] = useState("");
  const [privileged, setPrivileged] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [platform, setPlatform] = useState("");

  // docker build state
  const [buildContext, setBuildContext] = useState(".");
  const [dockerfile, setDockerfile] = useState("");
  const [buildTag, setBuildTag] = useState("");
  const [buildArgs, setBuildArgs] = useState<EnvVar[]>([{ key: "", value: "" }]);
  const [noCache, setNoCache] = useState(false);
  const [buildPlatform, setBuildPlatform] = useState("");
  const [target, setTarget] = useState("");

  // docker exec state
  const [execContainer, setExecContainer] = useState("");
  const [execCmd, setExecCmd] = useState("");
  const [execInteractive, setExecInteractive] = useState(true);
  const [execTty, setExecTty] = useState(true);
  const [execUser, setExecUser] = useState("");
  const [execWorkdir, setExecWorkdir] = useState("");
  const [execEnvVars, setExecEnvVars] = useState<EnvVar[]>([{ key: "", value: "" }]);

  // docker compose state
  const [composeAction, setComposeAction] = useState("up");
  const [composeFile, setComposeFile] = useState("");
  const [composeDetached, setComposeDetached] = useState(false);
  const [composeBuild, setComposeBuild] = useState(false);
  const [composeServices, setComposeServices] = useState("");

  const command = useMemo(() => {
    const parts: string[] = ["docker"];

    if (subcommand === "run") {
      parts.push("run");
      if (detached) parts.push("-d");
      if (interactive) parts.push("-i");
      if (tty) parts.push("-t");
      if (rm) parts.push("--rm");
      if (containerName) parts.push(`--name ${containerName}`);
      if (restart !== "no") parts.push(`--restart ${restart}`);
      if (network) parts.push(`--network ${network}`);
      if (workdir) parts.push(`-w '${workdir}'`);
      if (hostname) parts.push(`--hostname ${hostname}`);
      if (user) parts.push(`--user ${user}`);
      if (privileged) parts.push("--privileged");
      if (readOnly) parts.push("--read-only");
      if (memory) parts.push(`--memory ${memory}`);
      if (cpus) parts.push(`--cpus ${cpus}`);
      if (platform) parts.push(`--platform ${platform}`);
      if (entrypoint) parts.push(`--entrypoint '${entrypoint}'`);
      ports.forEach((p) => {
        if (p.host && p.container) {
          const proto = p.protocol !== "tcp" ? `/${p.protocol}` : "";
          parts.push(`-p ${p.host}:${p.container}${proto}`);
        }
      });
      volumes.forEach((v) => {
        if (v.host && v.container) {
          const mode = v.mode !== "rw" ? `:${v.mode}` : "";
          parts.push(`-v ${v.host}:${v.container}${mode}`);
        }
      });
      envVars.forEach((e) => {
        if (e.key) parts.push(`-e ${e.key}${e.value ? `=${e.value}` : ""}`);
      });
      if (image) parts.push(`${image}${tag && tag !== "latest" ? `:${tag}` : ""}`);
      if (cmd) parts.push(cmd);
    } else if (subcommand === "build") {
      parts.push("build");
      if (buildTag) parts.push(`-t ${buildTag}`);
      if (dockerfile) parts.push(`-f ${dockerfile}`);
      if (noCache) parts.push("--no-cache");
      if (buildPlatform) parts.push(`--platform ${buildPlatform}`);
      if (target) parts.push(`--target ${target}`);
      buildArgs.forEach((a) => {
        if (a.key) parts.push(`--build-arg ${a.key}${a.value ? `=${a.value}` : ""}`);
      });
      parts.push(buildContext);
    } else if (subcommand === "exec") {
      parts.push("exec");
      if (execInteractive) parts.push("-i");
      if (execTty) parts.push("-t");
      if (execUser) parts.push(`-u ${execUser}`);
      if (execWorkdir) parts.push(`-w '${execWorkdir}'`);
      execEnvVars.forEach((e) => {
        if (e.key) parts.push(`-e ${e.key}${e.value ? `=${e.value}` : ""}`);
      });
      if (execContainer) parts.push(execContainer);
      if (execCmd) parts.push(execCmd);
    } else if (subcommand === "compose") {
      parts.push("compose");
      if (composeFile) parts.push(`-f ${composeFile}`);
      parts.push(composeAction);
      if (composeAction === "up" && composeDetached) parts.push("-d");
      if (composeAction === "up" && composeBuild) parts.push("--build");
      if (composeServices) parts.push(composeServices);
    }

    return parts.join(" \\\n  ");
  }, [subcommand, image, tag, containerName, ports, volumes, envVars, detached, interactive, tty, rm, restart, network, workdir, entrypoint, cmd, memory, cpus, user, hostname, privileged, readOnly, platform, buildContext, dockerfile, buildTag, buildArgs, noCache, buildPlatform, target, execContainer, execCmd, execInteractive, execTty, execUser, execWorkdir, execEnvVars, composeAction, composeFile, composeDetached, composeBuild, composeServices]);

  const addPort = () => setPorts([...ports, { host: "", container: "", protocol: "tcp" }]);
  const addVolume = () => setVolumes([...volumes, { host: "", container: "", mode: "rw" }]);
  const addEnvVar = () => setEnvVars([...envVars, { key: "", value: "" }]);
  const addBuildArg = () => setBuildArgs([...buildArgs, { key: "", value: "" }]);
  const addExecEnv = () => setExecEnvVars([...execEnvVars, { key: "", value: "" }]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-lg">
            ▣
          </div>
          <div>
            <h1 className="text-xl font-bold">Docker Builder</h1>
            <p className="text-sm text-[var(--color-text-muted)]">Build container commands visually</p>
          </div>
        </div>

        <AiHelper tool="docker" onCommandGenerated={(cmd) => setCmd(cmd.replace(/^docker\s+/, ""))} />

        {/* Subcommand Tabs */}
        <div className="flex gap-1 border-b border-[var(--color-border)]">
          {["run", "build", "exec", "compose"].map((sub) => (
            <button
              key={sub}
              onClick={() => setSubcommand(sub)}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                subcommand === sub
                  ? "text-[var(--color-accent)] tab-active"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {subcommand === "run" && (
          <>
            <Section title="Image">
              <div className="grid grid-cols-[1fr_120px] gap-3">
                <FormField label="Image" required>
                  <TextInput value={image} onChange={setImage} placeholder="nginx, postgres, ubuntu..." />
                </FormField>
                <FormField label="Tag">
                  <TextInput value={tag} onChange={setTag} placeholder="latest" />
                </FormField>
              </div>
              <FormField label="Container Name">
                <TextInput value={containerName} onChange={setContainerName} placeholder="my-container" />
              </FormField>
            </Section>

            <Section title="Ports">
              {ports.map((p, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <TextInput value={p.host} onChange={(v) => { const u = [...ports]; u[i].host = v; setPorts(u); }} placeholder="Host port" />
                  </div>
                  <span className="text-[var(--color-text-muted)] pb-2">:</span>
                  <div className="flex-1">
                    <TextInput value={p.container} onChange={(v) => { const u = [...ports]; u[i].container = v; setPorts(u); }} placeholder="Container port" />
                  </div>
                  <div className="w-20">
                    <SelectInput value={p.protocol} onChange={(v) => { const u = [...ports]; u[i].protocol = v; setPorts(u); }} options={[{ value: "tcp", label: "TCP" }, { value: "udp", label: "UDP" }]} />
                  </div>
                  <button onClick={() => setPorts(ports.filter((_, idx) => idx !== i))} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-danger)]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
              <button onClick={addPort} className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">+ Add Port Mapping</button>
            </Section>

            <Section title="Volumes" defaultOpen={false}>
              {volumes.map((v, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1"><TextInput value={v.host} onChange={(val) => { const u = [...volumes]; u[i].host = val; setVolumes(u); }} placeholder="Host path" /></div>
                  <span className="text-[var(--color-text-muted)] pb-2">:</span>
                  <div className="flex-1"><TextInput value={v.container} onChange={(val) => { const u = [...volumes]; u[i].container = val; setVolumes(u); }} placeholder="Container path" /></div>
                  <div className="w-20">
                    <SelectInput value={v.mode} onChange={(val) => { const u = [...volumes]; u[i].mode = val; setVolumes(u); }} options={[{ value: "rw", label: "rw" }, { value: "ro", label: "ro" }]} />
                  </div>
                  <button onClick={() => setVolumes(volumes.filter((_, idx) => idx !== i))} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-danger)]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
              <button onClick={addVolume} className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">+ Add Volume</button>
            </Section>

            <Section title="Environment Variables" defaultOpen={false}>
              {envVars.map((e, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1"><TextInput value={e.key} onChange={(v) => { const u = [...envVars]; u[i].key = v; setEnvVars(u); }} placeholder="KEY" /></div>
                  <span className="text-[var(--color-text-muted)] pb-2">=</span>
                  <div className="flex-1"><TextInput value={e.value} onChange={(v) => { const u = [...envVars]; u[i].value = v; setEnvVars(u); }} placeholder="value" /></div>
                  <button onClick={() => setEnvVars(envVars.filter((_, idx) => idx !== i))} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-danger)]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
              <button onClick={addEnvVar} className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">+ Add Variable</button>
            </Section>

            <Section title="Runtime Options" defaultOpen={false}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <CheckboxInput checked={detached} onChange={setDetached} label="Detached (-d)" />
                <CheckboxInput checked={interactive} onChange={setInteractive} label="Interactive (-i)" />
                <CheckboxInput checked={tty} onChange={setTty} label="TTY (-t)" />
                <CheckboxInput checked={rm} onChange={setRm} label="Auto Remove (--rm)" />
                <CheckboxInput checked={privileged} onChange={setPrivileged} label="Privileged" />
                <CheckboxInput checked={readOnly} onChange={setReadOnly} label="Read-only FS" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Restart Policy">
                  <SelectInput value={restart} onChange={setRestart} options={[
                    { value: "no", label: "No" },
                    { value: "always", label: "Always" },
                    { value: "unless-stopped", label: "Unless Stopped" },
                    { value: "on-failure", label: "On Failure" },
                  ]} />
                </FormField>
                <FormField label="Network">
                  <TextInput value={network} onChange={setNetwork} placeholder="bridge, host, custom..." />
                </FormField>
                <FormField label="Memory Limit">
                  <TextInput value={memory} onChange={setMemory} placeholder="512m, 1g..." />
                </FormField>
                <FormField label="CPU Limit">
                  <TextInput value={cpus} onChange={setCpus} placeholder="0.5, 2..." />
                </FormField>
                <FormField label="Working Directory">
                  <TextInput value={workdir} onChange={setWorkdir} placeholder="/app" />
                </FormField>
                <FormField label="User">
                  <TextInput value={user} onChange={setUser} placeholder="1000:1000" />
                </FormField>
                <FormField label="Hostname">
                  <TextInput value={hostname} onChange={setHostname} placeholder="my-host" />
                </FormField>
                <FormField label="Platform">
                  <TextInput value={platform} onChange={setPlatform} placeholder="linux/amd64" />
                </FormField>
              </div>
            </Section>

            <Section title="Entrypoint & Command" defaultOpen={false}>
              <FormField label="Entrypoint" hint="Overrides the image ENTRYPOINT">
                <TextInput value={entrypoint} onChange={setEntrypoint} placeholder="/bin/sh" />
              </FormField>
              <FormField label="Command" hint="Command to run in the container">
                <TextInput value={cmd} onChange={setCmd} placeholder="echo hello" />
              </FormField>
            </Section>
          </>
        )}

        {subcommand === "build" && (
          <>
            <Section title="Build Configuration">
              <FormField label="Tag (-t)" required>
                <TextInput value={buildTag} onChange={setBuildTag} placeholder="myapp:latest" />
              </FormField>
              <FormField label="Build Context">
                <TextInput value={buildContext} onChange={setBuildContext} placeholder="." />
              </FormField>
              <FormField label="Dockerfile Path">
                <TextInput value={dockerfile} onChange={setDockerfile} placeholder="Dockerfile" />
              </FormField>
              <FormField label="Target Stage">
                <TextInput value={target} onChange={setTarget} placeholder="builder" />
              </FormField>
              <FormField label="Platform">
                <TextInput value={buildPlatform} onChange={setBuildPlatform} placeholder="linux/amd64,linux/arm64" />
              </FormField>
              <CheckboxInput checked={noCache} onChange={setNoCache} label="No Cache (--no-cache)" />
            </Section>
            <Section title="Build Arguments" defaultOpen={false}>
              {buildArgs.map((a, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1"><TextInput value={a.key} onChange={(v) => { const u = [...buildArgs]; u[i].key = v; setBuildArgs(u); }} placeholder="ARG_NAME" /></div>
                  <span className="text-[var(--color-text-muted)] pb-2">=</span>
                  <div className="flex-1"><TextInput value={a.value} onChange={(v) => { const u = [...buildArgs]; u[i].value = v; setBuildArgs(u); }} placeholder="value" /></div>
                  <button onClick={() => setBuildArgs(buildArgs.filter((_, idx) => idx !== i))} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-danger)]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
              <button onClick={addBuildArg} className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">+ Add Build Arg</button>
            </Section>
          </>
        )}

        {subcommand === "exec" && (
          <Section title="Exec Configuration">
            <FormField label="Container" required>
              <TextInput value={execContainer} onChange={setExecContainer} placeholder="container-name-or-id" />
            </FormField>
            <FormField label="Command" required>
              <TextInput value={execCmd} onChange={setExecCmd} placeholder="/bin/bash" />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <CheckboxInput checked={execInteractive} onChange={setExecInteractive} label="Interactive (-i)" />
              <CheckboxInput checked={execTty} onChange={setExecTty} label="TTY (-t)" />
            </div>
            <FormField label="User">
              <TextInput value={execUser} onChange={setExecUser} placeholder="root" />
            </FormField>
            <FormField label="Working Directory">
              <TextInput value={execWorkdir} onChange={setExecWorkdir} placeholder="/app" />
            </FormField>
            {execEnvVars.map((e, i) => (
              <div key={i} className="flex gap-2 items-end">
                <div className="flex-1"><TextInput value={e.key} onChange={(v) => { const u = [...execEnvVars]; u[i].key = v; setExecEnvVars(u); }} placeholder="KEY" /></div>
                <span className="text-[var(--color-text-muted)] pb-2">=</span>
                <div className="flex-1"><TextInput value={e.value} onChange={(v) => { const u = [...execEnvVars]; u[i].value = v; setExecEnvVars(u); }} placeholder="value" /></div>
                <button onClick={() => setExecEnvVars(execEnvVars.filter((_, idx) => idx !== i))} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-danger)]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
            <button onClick={addExecEnv} className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">+ Add Env Variable</button>
          </Section>
        )}

        {subcommand === "compose" && (
          <Section title="Compose Configuration">
            <FormField label="Action">
              <SelectInput value={composeAction} onChange={setComposeAction} options={[
                { value: "up", label: "up" },
                { value: "down", label: "down" },
                { value: "build", label: "build" },
                { value: "logs", label: "logs" },
                { value: "ps", label: "ps" },
                { value: "restart", label: "restart" },
                { value: "stop", label: "stop" },
                { value: "pull", label: "pull" },
              ]} />
            </FormField>
            <FormField label="Compose File" hint="Leave empty for default docker-compose.yml">
              <TextInput value={composeFile} onChange={setComposeFile} placeholder="docker-compose.yml" />
            </FormField>
            <FormField label="Services" hint="Space-separated service names (leave empty for all)">
              <TextInput value={composeServices} onChange={setComposeServices} placeholder="web db redis" />
            </FormField>
            {composeAction === "up" && (
              <div className="flex gap-4">
                <CheckboxInput checked={composeDetached} onChange={setComposeDetached} label="Detached (-d)" />
                <CheckboxInput checked={composeBuild} onChange={setComposeBuild} label="Build (--build)" />
              </div>
            )}
          </Section>
        )}

        <div className="h-4" />
      </main>
      <CommandPreview command={command} />
    </div>
  );
}
