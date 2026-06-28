import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthError, requireAuth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

async function getDashboardUser() {
  try {
    return await requireAuth();
  } catch (error) {
    if (error instanceof AuthError && error.status === 401) {
      redirect("/sign-in?next=/dashboard");
    }

    throw error;
  }
}

export default async function DashboardPage() {
  const user = await getDashboardUser();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Dashboard
        </p>
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Welcome back, {user.name}.
          </h1>
          <p className="text-lg leading-8 text-slate-600">
            This is the authenticated account area. Blog management screens will
            be connected in the next feature batches.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/profile/password"
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300"
        >
          <h2 className="text-lg font-semibold text-slate-950">
            Change password
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Update your password using your current password.
          </p>
        </Link>
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-950">Posts</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Post creation and management will be added in the posts batch.
          </p>
        </div>
      </section>
    </div>
  );
}
