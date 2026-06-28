"use client";

import { useActionState, useEffect } from "react";

import {
  updateProfileAction,
  type ProfileActionState,
} from "@/app/profile/actions";

export function ProfileForm({
  name,
  onUpdated,
}: {
  name: string;
  onUpdated?: (name: string) => void;
}) {
  const [state, formAction, isPending] = useActionState<ProfileActionState, FormData>(
    updateProfileAction,
    {},
  );

  useEffect(() => {
    if (state.success && state.values?.name) {
      onUpdated?.(state.values.name);
    }
  }, [onUpdated, state.success, state.values?.name]);

  return (
    <form action={formAction} className="space-y-4">
      {state.message ? (
        <div
          className={`rounded-md border p-3 text-sm ${
            state.success
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </div>
      ) : null}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-800" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={state.values?.name ?? name}
          className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-900"
        />
        {state.errors?.name ? (
          <p className="text-sm text-red-600">{state.errors.name}</p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="min-h-11 rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Update profile"}
      </button>
    </form>
  );
}
