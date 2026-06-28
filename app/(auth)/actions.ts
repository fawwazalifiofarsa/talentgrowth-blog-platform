"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getSafeRedirectPath } from "@/lib/api/request";
import { AUTH_COOKIE_NAME, signAuthToken } from "@/lib/auth/jwt";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { AuthError, requireAuth } from "@/lib/auth/server";
import { validateLoginInput } from "@/lib/auth/validation";
import { prisma } from "@/lib/prisma";
import { validateSchema, z, type ValidationErrors } from "@/lib/validation";

export type AuthActionState = {
  success?: boolean;
  message?: string;
  errors?: ValidationErrors;
  values?: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
  };
};

type SignUpInput = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const emailSchema = z.email("Please enter a valid email address.");

const signUpSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required."),
    email: emailSchema,
    password: z.string().min(1, "Password is required."),
    confirmPassword: z.string().min(1, "Confirm password is required."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(1, "New password is required."),
    confirmNewPassword: z.string().min(1, "Confirm new password is required."),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "New passwords do not match.",
  });

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getPasswordString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

async function setAuthCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

async function deleteAuthCookie() {
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

function validateSignUpInput(input: SignUpInput) {
  return validateSchema(signUpSchema, input);
}

function validateChangePasswordFormInput(input: {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}) {
  return validateSchema(changePasswordSchema, input);
}

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const input = {
    email: getString(formData, "email"),
    password: getPasswordString(formData, "password"),
  };
  const validation = validateLoginInput(input);
  const values = {
    email: input.email,
    password: input.password,
  };

  if (!validation.success) {
    return { errors: validation.errors, values };
  }

  const user = await prisma.user.findUnique({
    where: {
      email: validation.data.email,
    },
  });

  if (!user) {
    return {
      message: "Invalid email or password.",
      values,
    };
  }

  const isValidPassword = await verifyPassword(
    validation.data.password,
    user.passwordHash,
  );

  if (!isValidPassword) {
    return {
      message: "Invalid email or password.",
      values,
    };
  }

  const token = signAuthToken({
    sub: user.id,
    email: user.email,
  });

  await setAuthCookie(token);

  const next = getString(formData, "next") || "/dashboard";
  redirect(getSafeRedirectPath(next));
}

export async function signUpAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const input = {
    name: getString(formData, "name"),
    email: getString(formData, "email"),
    password: getPasswordString(formData, "password"),
    confirmPassword: getPasswordString(formData, "confirmPassword"),
  };
  const validation = validateSignUpInput(input);
  const values = {
    name: input.name,
    email: input.email,
    password: input.password,
    confirmPassword: input.confirmPassword,
  };

  if (!validation.success) {
    return { errors: validation.errors, values };
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: validation.data.email,
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    return {
      message: "An account with this email already exists.",
      values,
    };
  }

  const passwordHash = await hashPassword(validation.data.password);
  const user = await prisma.user.create({
    data: {
      name: validation.data.name,
      email: validation.data.email,
      passwordHash,
    },
  });
  const token = signAuthToken({
    sub: user.id,
    email: user.email,
  });

  await setAuthCookie(token);
  redirect("/dashboard");
}

export async function changePasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const input = {
    currentPassword: getPasswordString(formData, "currentPassword"),
    newPassword: getPasswordString(formData, "newPassword"),
    confirmNewPassword: getPasswordString(formData, "confirmNewPassword"),
  };
  const validation = validateChangePasswordFormInput(input);

  if (!validation.success) {
    return {
      errors: validation.errors,
    };
  }

  let user;

  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthError && error.status === 401) {
      redirect("/sign-in?next=/profile/password");
    }

    throw error;
  }

  const isCurrentPasswordValid = await verifyPassword(
    validation.data.currentPassword,
    user.passwordHash,
  );

  if (!isCurrentPasswordValid) {
    return {
      message: "Current password is incorrect.",
    };
  }

  const passwordHash = await hashPassword(validation.data.newPassword);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      passwordHash,
    },
  });

  return {
    success: true,
    message: "Password updated successfully.",
  };
}

export async function signOutAction() {
  await deleteAuthCookie();
  redirect("/sign-in");
}
