import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ErrorState } from "@/components/error-state";
import { ProfileDetailsClient } from "@/components/profile-details-client";
import { ApiClientError, fetchApi, type ProfileResponse } from "@/lib/api/client";
import { AUTH_COOKIE_NAME } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

async function getProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/sign-in?next=/profile");
  }

  return fetchApi<ProfileResponse>("/api/profile", {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}

export default async function ProfilePage() {
  let profile: ProfileResponse | null = null;
  let errorMessage: string | null = null;

  try {
    profile = await getProfile();
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      redirect("/sign-in?next=/profile");
    }

    errorMessage =
      error instanceof Error ? error.message : "Failed to fetch profile";
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <p className="text-sm font-medium uppercase text-slate-500">Profile</p>
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-semibold text-slate-950 sm:text-5xl">
            Manage your profile.
          </h1>
          <p className="text-lg leading-8 text-slate-600">
            Update your display name, profile picture, and review the posts you
            have written.
          </p>
        </div>
      </section>

      {errorMessage ? (
        <ErrorState title="Unable to load profile." message={errorMessage} />
      ) : null}

      {profile ? (
        <>
          <ProfileDetailsClient user={profile.user} />
        </>
      ) : null}
    </div>
  );
}
