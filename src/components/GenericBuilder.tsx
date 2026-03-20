"use client";

import { useState, useMemo, useCallback } from "react";
import Navbar from "@/components/Navbar";
import CommandPreview from "@/components/CommandPreview";
import Section from "@/components/Section";
import AiHelper from "@/components/AiHelper";
import { ToolConfig, Field, buildCommand } from "@/lib/tool-configs";
import { ToolMeta, TOOL_COLORS } from "@/lib/tool-registry";

// ─── Field renderers ────────────────────────────────────────────

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const base =
    "w-full px-3 py-2 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] transition-field focus:outline-none";

  switch (field.type) {
    case "text":
      return (
        <input
          type="text"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={base}
        />
      );

    case "number":
      return (
        <input
          type="number"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          min={field.min}
          max={field.max}
          className={base}
        />
      );

    case "textarea":
      return (
        <textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={field.rows ?? 3}
          className={`${base} resize-y`}
        />
      );

    case "select":
      return (
        <select
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        >
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );

    case "checkbox":
      return (
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={(value as boolean) ?? false}
              onChange={(e) => onChange(e.target.checked)}
              className="peer sr-only"
            />
            <div className="w-4 h-4 rounded border border-[var(--color-border)] bg-[var(--color-bg)] peer-checked:bg-[var(--color-accent)] peer-checked:border-[var(--color-accent)] transition-colors flex items-center justify-center">
              {(value as boolean) && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-colors">
            {field.label}
          </span>
        </label>
      );

    case "keyvalue": {
      const items = (value as { key: string; value: string }[]) ?? [{ key: "", value: "" }];
      return (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={item.key}
                onChange={(e) => {
                  const updated = [...items];
                  updated[i] = { ...updated[i], key: e.target.value };
                  onChange(updated);
                }}
                placeholder={field.keyPlaceholder ?? "Key"}
                className={`flex-1 ${base}`}
              />
              <span className="text-[var(--color-text-muted)]">{field.separator ?? "="}</span>
              <input
                type="text"
                value={item.value}
                onChange={(e) => {
                  const updated = [...items];
                  updated[i] = { ...updated[i], value: e.target.value };
                  onChange(updated);
                }}
                placeholder={field.valuePlaceholder ?? "Value"}
                className={`flex-1 ${base}`}
              />
              <button
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            onClick={() => onChange([...items, { key: "", value: "" }])}
            className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
          >
            {field.addLabel ?? "+ Add"}
          </button>
        </div>
      );
    }

    case "repeatable": {
      const items = (value as string[]) ?? [""];
      return (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const updated = [...items];
                  updated[i] = e.target.value;
                  onChange(updated);
                }}
                placeholder={field.placeholder}
                className={`flex-1 ${base}`}
              />
              <button
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            onClick={() => onChange([...items, ""])}
            className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
          >
            {field.addLabel ?? "+ Add"}
          </button>
        </div>
      );
    }
  }
}

// ─── Field wrapper with label ───────────────────────────────────

function FieldWrapper({ field, children }: { field: Field; children: React.ReactNode }) {
  if (field.type === "checkbox") return <>{children}</>;

  return (
    <div className={`space-y-1.5 ${field.halfWidth ? "" : "col-span-full"}`}>
      <label className="flex items-center gap-1 text-sm font-medium text-[var(--color-text)]">
        {field.label}
        {field.required && <span className="text-[var(--color-danger)]">*</span>}
      </label>
      {children}
      {field.hint && <p className="text-xs text-[var(--color-text-muted)]">{field.hint}</p>}
    </div>
  );
}

// ─── Main builder ───────────────────────────────────────────────

interface GenericBuilderProps {
  tool: ToolMeta;
  config: ToolConfig;
}

export default function GenericBuilder({ tool, config }: GenericBuilderProps) {
  const colors = TOOL_COLORS[tool.color] ?? TOOL_COLORS.blue;
  const subcommands = config.subcommands;
  const [activeSubcommand, setActiveSubcommand] = useState<string | null>(
    subcommands ? subcommands[0].name : null,
  );
  const [values, setValues] = useState<Record<string, unknown>>({});

  const setValue = useCallback((id: string, val: unknown) => {
    setValues((prev) => ({ ...prev, [id]: val }));
  }, []);

  const command = useMemo(
    () => buildCommand(config, activeSubcommand, values),
    [config, activeSubcommand, values],
  );

  const sections = activeSubcommand
    ? subcommands?.find((s) => s.name === activeSubcommand)?.sections
    : config.sections;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center ${colors.text}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={tool.icon} />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold">{tool.name} Builder</h1>
            <p className="text-sm text-[var(--color-text-muted)]">{tool.description}</p>
          </div>
        </div>

        {/* AI helper */}
        <AiHelper tool={tool.name} onCommandGenerated={() => {}} />

        {/* Subcommand tabs */}
        {subcommands && (
          <div className="flex gap-1 border-b border-[var(--color-border)] overflow-x-auto">
            {subcommands.map((sub) => (
              <button
                key={sub.name}
                onClick={() => {
                  setActiveSubcommand(sub.name);
                  setValues({});
                }}
                className={`px-4 py-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
                  activeSubcommand === sub.name
                    ? "text-[var(--color-accent)] tab-active"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                {sub.label ?? sub.name}
              </button>
            ))}
          </div>
        )}

        {/* Sections */}
        {sections?.map((section) => {
          const checkboxFields = section.fields.filter((f) => f.type === "checkbox");
          const otherFields = section.fields.filter((f) => f.type !== "checkbox");

          return (
            <Section key={section.title} title={section.title} defaultOpen={section.defaultOpen ?? true}>
              {/* Non-checkbox fields in grid */}
              {otherFields.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {otherFields.map((field) => (
                    <FieldWrapper key={field.id} field={field}>
                      <FieldInput
                        field={field}
                        value={values[field.id]}
                        onChange={(v) => setValue(field.id, v)}
                      />
                    </FieldWrapper>
                  ))}
                </div>
              )}

              {/* Checkbox fields in a row */}
              {checkboxFields.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                  {checkboxFields.map((field) => (
                    <FieldInput
                      key={field.id}
                      field={field}
                      value={values[field.id]}
                      onChange={(v) => setValue(field.id, v)}
                    />
                  ))}
                </div>
              )}
            </Section>
          );
        })}

        <div className="h-4" />
      </main>
      <CommandPreview command={command} />
    </div>
  );
}
