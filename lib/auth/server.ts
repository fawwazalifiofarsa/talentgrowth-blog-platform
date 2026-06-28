import "server-only";

import type { User } from "@prisma/client";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  avatarPath: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export function toSafeUser(
  user: Pick<
    User,
    "id" | "name" | "email" | "avatarUrl" | "avatarPath" | "createdAt" | "updatedAt"
  >,
): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    avatarPath: user.avatarPath,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export class AuthError extends Error {
  status: number;

  constructor(message = "Unauthorized", status = 401) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

function getBearerToken(request?: Request | NextRequest) {
  const authorization = request?.headers.get("authorization");

  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

async function getAuthToken(request?: Request | NextRequest) {
  const bearerToken = getBearerToken(request);

  if (bearerToken) {
    return bearerToken;
  }

  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
}

export async function getCurrentUser(request?: Request | NextRequest) {
  const token = await getAuthToken(request);

  if (!token) {
    return null;
  }

  const payload = verifyAuthToken(token);

  if (!payload) {
    return null;
  }

  return prisma.user.findUnique({
    where: {
      id: payload.sub,
    },
  });
}

export async function requireAuth(request?: Request | NextRequest) {
  const user = await getCurrentUser(request);

  if (!user) {
    throw new AuthError();
  }

  return user;
}
