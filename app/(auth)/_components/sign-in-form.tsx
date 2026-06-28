"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signInAction } from "@/app/(auth)/actions";
import type { AuthActionState } from "@/app/(auth)/actions";
import { AuthMessage } from "@/app/(auth)/_components/auth-message";
import { PasswordField } from "@/app/(auth)/_components/password-field";

export function SignInForm({
  initialState = {},
  next,
}: {
  initialState?: AuthActionState;
  next?: string;
}) {
  const [state, formAction, isPending] = useActionState(
    signInAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next ?? ""} />
      <AuthMessage state={state} />
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-800" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.values?.email ?? ""}
          className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm outline-none focus:border-slate-900"
        />
        {state.errors?.email ? (
          <p className="text-sm text-red-600">{state.errors.email}</p>
        ) : null}
      </div>
      <PasswordField
        id="password"
        name="password"
        label="Password"
        autoComplete="current-password"
        defaultValue={state.values?.password ?? ""}
        error={state.errors?.password}
      />
      <button
        type="submit"
        disabled={isPending}
        className="min-h-11 w-full rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>
      <div className="text-sm text-slate-600">
        <Link className="font-medium text-slate-900" href="/sign-up">
          Create an account
        </Link>
      </div>
    </form>
  );
}
