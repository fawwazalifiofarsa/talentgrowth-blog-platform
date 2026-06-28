"use client";

import { useState } from "react";

type PasswordFieldProps = {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
  error?: string;
  defaultValue?: string;
};

export function PasswordField({
  id,
  name,
  label,
  autoComplete,
  error,
  defaultValue = "",
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-800" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={isVisible ? "text" : "password"}
          autoComplete={autoComplete}
          defaultValue={defaultValue}
          className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 pr-16 text-sm shadow-sm outline-none focus:border-slate-900"
        />
        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          className="absolute inset-y-1 right-1 rounded px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
          aria-label={isVisible ? `Hide ${label}` : `Show ${label}`}
        >
          {isVisible ? "Hide" : "Show"}
        </button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
