import Link from "next/link";

import type { ProfileUser } from "@/lib/api/client";

function formatDate(value?: string) {
  if (!value) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(value));
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function ProfileCard({ user }: { user: ProfileUser }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt=""
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-2xl font-semibold text-white">
            {getInitial(user.name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-semibold text-slate-950">{user.name}</h2>
          <p className="mt-1 text-sm text-slate-600">{user.email}</p>
          <p className="mt-3 text-xs text-slate-500">
            Member since {formatDate(user.createdAt)}
          </p>
        </div>
        <Link
          href="/profile/password"
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
        >
          Change Password
        </Link>
      </div>
    </section>
  );
}
