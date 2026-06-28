"use client";

import { useCallback, useState } from "react";

import { AvatarUpload } from "@/components/avatar-upload";
import { ProfileCard } from "@/components/profile-card";
import { ProfileForm } from "@/components/profile-form";
import type { ProfileUser } from "@/lib/api/client";

export function ProfileDetailsClient({ user }: { user: ProfileUser }) {
  const [profileUser, setProfileUser] = useState(user);
  const handleNameUpdated = useCallback((name: string) => {
    setProfileUser((current) =>
      current.name === name
        ? current
        : {
            ...current,
            name,
          },
    );
  }, []);
  const handleAvatarUploaded = useCallback((avatarUrl: string) => {
    setProfileUser((current) =>
      current.avatarUrl === avatarUrl
        ? current
        : {
            ...current,
            avatarUrl,
          },
    );
  }, []);

  return (
    <>
      <ProfileCard user={profileUser} />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 space-y-2">
            <h2 className="text-xl font-semibold text-slate-950">
              Profile details
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              Change the display name shown on your posts and comments.
            </p>
          </div>
          <ProfileForm
            name={profileUser.name}
            onUpdated={handleNameUpdated}
          />
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 space-y-2">
            <h2 className="text-xl font-semibold text-slate-950">
              Profile picture
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              Upload a local avatar image for this case-study application.
            </p>
          </div>
          <AvatarUpload
            currentAvatarUrl={profileUser.avatarUrl}
            name={profileUser.name}
            onUploaded={handleAvatarUploaded}
          />
        </section>
      </div>
    </>
  );
}
