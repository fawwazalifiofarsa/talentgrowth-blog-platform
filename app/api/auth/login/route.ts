import { NextRequest, NextResponse } from "next/server";

import {
  errorResponse,
  routeErrorResponse,
  successResponse,
  validationErrorResponse,
} from "@/lib/api/response";
import { readJsonRequest } from "@/lib/api/request";
import { AUTH_COOKIE_NAME, signAuthToken } from "@/lib/auth/jwt";
import { verifyPassword } from "@/lib/auth/password";
import { toSafeUser } from "@/lib/auth/server";
import { validateLoginInput } from "@/lib/auth/validation";
import { prisma } from "@/lib/prisma";

function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function POST(request: NextRequest) {
  try {
    const validation = validateLoginInput(await readJsonRequest(request));

    if (!validation.success) {
      return validationErrorResponse(validation.errors);
    }

    const user = await prisma.user.findUnique({
      where: {
        email: validation.data.email,
      },
    });

    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }

    const isValidPassword = await verifyPassword(
      validation.data.password,
      user.passwordHash,
    );

    if (!isValidPassword) {
      return errorResponse("Invalid email or password", 401);
    }

    const token = signAuthToken({
      sub: user.id,
      email: user.email,
    });
    const response = successResponse({
      token,
      user: toSafeUser(user),
    });

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    return routeErrorResponse(error, "Failed to log in");
  }
}
