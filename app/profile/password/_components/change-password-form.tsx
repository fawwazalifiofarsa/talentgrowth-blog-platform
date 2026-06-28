"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";

import {
  changePasswordAction,
  type AuthActionState,
} from "@/app/(auth)/actions";
import { AuthMessage } from "@/app/(auth)/_components/auth-message";
import { PasswordField } from "@/app/(auth)/_components/password-field";

const initialState: AuthActionState = {};

export function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <AuthMessage state={state} />
      <PasswordField
        id="currentPassword"
        name="currentPassword"
        label="Current password"
        autoComplete="current-password"
        error={state.errors?.currentPassword}
      />
      <PasswordField
        id="newPassword"
        name="newPassword"
        label="New password"
        autoComplete="new-password"
        error={state.errors?.newPassword}
      />
      <PasswordField
        id="confirmNewPassword"
        name="confirmNewPassword"
        label="Confirm new password"
        autoComplete="new-password"
        error={state.errors?.confirmNewPassword}
      />
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard"
          className="inline-flex min-h-11 items-center justify-center rounded-md px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
        >
          Back to dashboard
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Updating password..." : "Update password"}
        </button>
      </div>
    </form>
  );
}
