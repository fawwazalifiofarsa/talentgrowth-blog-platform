"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  ApiClientError,
  fetchApi,
  type ProfileUser,
} from "@/lib/api/client";
import { AUTH_COOKIE_NAME } from "@/lib/auth/jwt";
import { validateProfileInput, type ValidationErrors } from "@/lib/validation";

export type ProfileActionState = {
  success?: boolean;
  message?: string;
  errors?: ValidationErrors;
  values?: {
    name?: string;
  };
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

async function getAuthHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  return token ? `Bearer ${token}` : null;
}

export async function updateProfileAction(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const input = {
    name: getString(formData, "name"),
  };
  const validation = validateProfileInput(input);

  if (!validation.success) {
    return {
      errors: validation.errors,
      values: input,
    };
  }

  const authorization = await getAuthHeader();

  if (!authorization) {
    redirect("/sign-in?next=/profile");
  }

  try {
    await fetchApi<ProfileUser>("/api/profile", {
      method: "PUT",
      headers: {
        authorization,
        "content-type": "application/json",
      },
      body: JSON.stringify(validation.data),
    });
  } catch (error) {
    if (error instanceof ApiClientError) {
      return {
        message: error.message,
        errors: error.errors,
        values: input,
      };
    }

    return {
      message: "Failed to update profile",
      values: input,
    };
  }

  return {
    success: true,
    message: "Profile updated successfully.",
    values: input,
  };
}
