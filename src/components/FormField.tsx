"use client";

import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export default function FormField({ label, hint, required, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-sm font-medium text-[var(--color-text)]">
        {label}
        {required && <span className="text-[var(--color-danger)]">*</span>}
      </label>
      {children}
      {hint && (
        <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>
      )}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] transition-field focus:outline-none ${className}`}
    />
  );
}

export function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text)] transition-field focus:outline-none"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function CheckboxInput({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <div className="w-4 h-4 rounded border border-[var(--color-border)] bg-[var(--color-bg)] peer-checked:bg-[var(--color-accent)] peer-checked:border-[var(--color-accent)] transition-colors flex items-center justify-center">
          {checked && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <span className="text-sm text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-colors">
        {label}
      </span>
    </label>
  );
}

export function NumberInput({
  value,
  onChange,
  placeholder,
  min,
  max,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      max={max}
      className="w-full px-3 py-2 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] transition-field focus:outline-none"
    />
  );
}

export function TextAreaInput({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] transition-field focus:outline-none resize-y"
    />
  );
}
