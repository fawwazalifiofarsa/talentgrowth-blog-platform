import "server-only";

import jwt from "jsonwebtoken";

export const AUTH_COOKIE_NAME = "blog_auth_token";

export type AuthTokenPayload = {
  sub: string;
  email: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }

  return secret;
}

export function signAuthToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "7d",
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const payload = jwt.verify(token, getJwtSecret());

    if (
      typeof payload === "object" &&
      typeof payload.sub === "string" &&
      typeof payload.email === "string"
    ) {
      return {
        sub: payload.sub,
        email: payload.email,
      };
    }

    return null;
  } catch {
    return null;
  }
}
