import { redirect } from "next/navigation";

import { ChangePasswordForm } from "@/app/profile/password/_components/change-password-form";
import { AuthError, requireAuth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

async function getPasswordPageUser() {
  try {
    return await requireAuth();
  } catch (error) {
    if (error instanceof AuthError && error.status === 401) {
      redirect("/sign-in?next=/profile/password");
    }

    throw error;
  }
}

export default async function ChangePasswordPage() {
  await getPasswordPageUser();

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12 sm:px-6">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Account
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          Change password
        </h1>
        <p className="text-sm leading-6 text-slate-600">
          Enter your current password before setting a new one.
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
