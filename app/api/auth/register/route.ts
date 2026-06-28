import { NextRequest, NextResponse } from "next/server";

import {
  errorResponse,
  routeErrorResponse,
  successResponse,
  validationErrorResponse,
} from "@/lib/api/response";
import { readJsonRequest } from "@/lib/api/request";
import { AUTH_COOKIE_NAME, signAuthToken } from "@/lib/auth/jwt";
import { hashPassword } from "@/lib/auth/password";
import { toSafeUser } from "@/lib/auth/server";
import { validateRegisterInput } from "@/lib/auth/validation";
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
    const validation = validateRegisterInput(await readJsonRequest(request));

    if (!validation.success) {
      return validationErrorResponse(validation.errors);
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
      return errorResponse("User already exists", 409);
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
    const response = successResponse(
      {
        token,
        user: toSafeUser(user),
      },
      201,
    );

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    return routeErrorResponse(error, "Failed to register");
  }
}
