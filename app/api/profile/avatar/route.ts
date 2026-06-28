import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";

import {
  errorResponse,
  routeErrorResponse,
  successResponse,
} from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const formData = await request.formData();
    const avatar = formData.get("avatar");

    if (!(avatar instanceof File) || avatar.size === 0) {
      return errorResponse("Avatar file is required", 400);
    }

    const extension = ALLOWED_AVATAR_TYPES.get(avatar.type);

    if (!extension) {
      return errorResponse("Invalid image file", 400);
    }

    if (avatar.size > MAX_AVATAR_SIZE) {
      return errorResponse("Avatar file is too large", 400);
    }

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "uploads",
      "avatars",
    );
    const filename = `${user.id}-${Date.now()}-${randomUUID()}.${extension}`;
    const relativePath = `public/uploads/avatars/${filename}`;
    const filePath = path.join(uploadDirectory, filename);
    const avatarUrl = `/uploads/avatars/${filename}`;

    await mkdir(uploadDirectory, { recursive: true });
    await writeFile(filePath, Buffer.from(await avatar.arrayBuffer()));

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        avatarUrl,
        avatarPath: relativePath,
      },
    });

    return successResponse({
      avatarUrl,
      avatarPath: relativePath,
    });
  } catch (error) {
    return routeErrorResponse(error, "Failed to upload avatar");
  }
}
