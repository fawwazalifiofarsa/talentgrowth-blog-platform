import { NextRequest } from "next/server";

import {
  routeErrorResponse,
  successResponse,
  validationErrorResponse,
} from "@/lib/api/response";
import { readJsonRequest } from "@/lib/api/request";
import { requireAuth, toSafeUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { validateProfileInput } from "@/lib/validation";

const profilePostSelect = {
  id: true,
  title: true,
  description: true,
  createdAt: true,
  updatedAt: true,
};

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const posts = await prisma.post.findMany({
      where: {
        authorId: user.id,
      },
      select: profilePostSelect,
      orderBy: {
        createdAt: "desc",
      },
    });

    return successResponse({
      user: toSafeUser(user),
      posts,
    });
  } catch (error) {
    return routeErrorResponse(error, "Failed to fetch profile");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const validation = validateProfileInput(await readJsonRequest(request));

    if (!validation.success) {
      return validationErrorResponse(validation.errors);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        name: validation.data.name,
      },
    });

    return successResponse(toSafeUser(updatedUser));
  } catch (error) {
    return routeErrorResponse(error, "Failed to update profile");
  }
}
