import { NextRequest } from "next/server";

import {
  errorResponse,
  messageResponse,
  routeErrorResponse,
  successResponse,
  validationErrorResponse,
} from "@/lib/api/response";
import { readJsonRequest } from "@/lib/api/request";
import { requireAuth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { validateCommentInput } from "@/lib/validation";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

async function findComment(id: string) {
  if (!isUuid(id)) {
    return null;
  }

  return prisma.comment.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      authorId: true,
      postId: true,
    },
  });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request);
    const { id } = await context.params;
    const comment = await findComment(id);

    if (!comment) {
      return errorResponse("Comment not found", 404);
    }

    if (comment.authorId !== user.id) {
      return errorResponse("You are not allowed to modify this comment", 403);
    }

    const validation = validateCommentInput(await readJsonRequest(request));

    if (!validation.success) {
      return validationErrorResponse(validation.errors);
    }

    const updatedComment = await prisma.comment.update({
      where: {
        id,
      },
      data: {
        content: validation.data.content,
      },
    });

    return successResponse(updatedComment);
  } catch (error) {
    return routeErrorResponse(error, "Failed to update comment");
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request);
    const { id } = await context.params;
    const comment = await findComment(id);

    if (!comment) {
      return errorResponse("Comment not found", 404);
    }

    if (comment.authorId !== user.id) {
      return errorResponse("You are not allowed to modify this comment", 403);
    }

    await prisma.comment.delete({
      where: {
        id,
      },
    });

    return messageResponse("Comment deleted successfully");
  } catch (error) {
    return routeErrorResponse(error, "Failed to delete comment");
  }
}
