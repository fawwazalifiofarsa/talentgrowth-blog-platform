import { NextRequest } from "next/server";

import {
  errorResponse,
  messageResponse,
  routeErrorResponse,
  validationErrorResponse,
} from "@/lib/api/response";
import { readJsonRequest } from "@/lib/api/request";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { requireAuth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { validateChangePasswordInput } from "@/lib/validation";

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const validation = validateChangePasswordInput(await readJsonRequest(request));

    if (!validation.success) {
      return validationErrorResponse(validation.errors);
    }

    const isCurrentPasswordValid = await verifyPassword(
      validation.data.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      return errorResponse("Current password is incorrect", 400);
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

    return messageResponse("Password updated successfully");
  } catch (error) {
    return routeErrorResponse(error, "Failed to update password");
  }
}
