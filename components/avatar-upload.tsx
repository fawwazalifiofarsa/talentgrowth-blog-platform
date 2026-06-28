"use client";

import { useEffect, useRef, useState } from "react";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function validateAvatarFile(file: File | null) {
  if (!file || file.size === 0) {
    return "Avatar file is required";
  }

  if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
    return "Invalid image file";
  }

  if (file.size > MAX_AVATAR_SIZE) {
    return "Avatar file is too large";
  }

  return null;
}

export function AvatarUpload({
  currentAvatarUrl,
  name,
  onUploaded,
}: {
  currentAvatarUrl: string | null;
  name: string;
  onUploaded?: (avatarUrl: string) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [savedAvatarUrl, setSavedAvatarUrl] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const avatarUrl = previewUrl ?? savedAvatarUrl ?? currentAvatarUrl;

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function clearPreview() {
    setPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl);
      }

      return null;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const avatar = formData.get("avatar");
    const file = avatar instanceof File ? avatar : null;
    const validationError = validateAvatarFile(file);

    if (validationError) {
      setClientError(validationError);
      setMessage(null);
      setIsSuccess(false);
      return;
    }

    setClientError(null);
    setMessage(null);
    setIsSuccess(false);
    setIsPending(true);

    try {
      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success || !payload.data?.avatarUrl) {
        setMessage(payload?.message ?? "Failed to upload avatar");
        setIsSuccess(false);
        return;
      }

      setSavedAvatarUrl(payload.data.avatarUrl);
      setMessage("Avatar uploaded successfully.");
      setIsSuccess(true);
      onUploaded?.(payload.data.avatarUrl);
      formRef.current?.reset();
      clearPreview();
    } catch {
      setMessage("Failed to upload avatar");
      setIsSuccess(false);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form
      ref={formRef}
      className="space-y-4"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-xl font-semibold text-white">
            {getInitial(name)}
          </div>
        )}
        <div className="text-sm leading-6 text-slate-600">
          <p>JPG, PNG, or WebP.</p>
          <p>Maximum size 2MB.</p>
        </div>
      </div>
      {clientError || message ? (
        <div
          className={`rounded-md border p-3 text-sm ${
            !clientError && isSuccess
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {clientError ?? message}
        </div>
      ) : null}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-800" htmlFor="avatar">
          Avatar image
        </label>
        <input
          id="avatar"
          name="avatar"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          onChange={(event) => {
            const file = event.target.files?.[0];
            const validationError = validateAvatarFile(file ?? null);

            if (validationError || !file) {
              setClientError(validationError);
              setMessage(null);
              setIsSuccess(false);
              clearPreview();
              return;
            }

            const nextPreviewUrl = URL.createObjectURL(file);
            setPreviewUrl((currentPreviewUrl) => {
              if (currentPreviewUrl) {
                URL.revokeObjectURL(currentPreviewUrl);
              }

              return nextPreviewUrl;
            });
            setClientError(null);
            setMessage(null);
            setIsSuccess(false);
          }}
          className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-900"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="min-h-11 rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Uploading..." : "Upload avatar"}
      </button>
    </form>
  );
}
