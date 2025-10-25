import React, { useId } from "react";

export function Field({
  label,
  hint,
  children,
  id,
}: {
  label: React.ReactNode;
  hint?: string;
  children: (id: string) => React.ReactNode;
  id?: string;
}) {
  const auto = useId();
  const _id = id || auto;
  return (
    <div className="mb-3">
      <label htmlFor={_id} className="block text-sm text-slate-300 mb-1">
        {label}
      </label>
      {children(_id)}
      {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
    </div>
  );
}

export function Input({
  id,
  name,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const _id = id || useId();
  return (
    <input
      id={_id}
      name={name || _id}
      {...rest}
      className={`w-full rounded-lg bg-[#0F172A] border border-[#1F2937] px-3 py-2 text-slate-100 ${
        rest.className || ""
      }`}
    />
  );
}

export function Select({
  id,
  name,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const _id = id || useId();
  return (
    <select
      id={_id}
      name={name || _id}
      {...rest}
      className={`w-full rounded-lg bg-[#0F172A] border border-[#1F2937] px-3 py-2 text-slate-100 ${
        rest.className || ""
      }`}
    >
      {children}
    </select>
  );
}

export function Textarea({
  id,
  name,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const _id = id || useId();
  return (
    <textarea
      id={_id}
      name={name || _id}
      {...rest}
      className={`w-full rounded-lg bg-[#0F172A] border border-[#1F2937] px-3 py-2 text-slate-100 ${
        rest.className || ""
      }`}
    />
  );
}
