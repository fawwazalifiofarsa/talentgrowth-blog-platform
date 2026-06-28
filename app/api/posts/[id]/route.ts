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
import { validatePostInput } from "@/lib/validation";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const postDetailInclude = {
  author: {
    select: {
      id: true,
      name: true,
      avatarUrl: true,
    },
  },
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!isUuid(id)) {
      return errorResponse("Post not found", 404);
    }

    const post = await prisma.post.findUnique({
      where: {
        id,
      },
      include: postDetailInclude,
    });

    if (!post) {
      return errorResponse("Post not found", 404);
    }

    return successResponse(post);
  } catch (error) {
    return routeErrorResponse(error, "Failed to fetch post");
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request);
    const { id } = await context.params;

    if (!isUuid(id)) {
      return errorResponse("Post not found", 404);
    }

    const post = await prisma.post.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!post) {
      return errorResponse("Post not found", 404);
    }

    if (post.authorId !== user.id) {
      return errorResponse("You are not allowed to modify this post", 403);
    }

    const validation = validatePostInput(await readJsonRequest(request));

    if (!validation.success) {
      return validationErrorResponse(validation.errors);
    }

    const updatedPost = await prisma.post.update({
      where: {
        id,
      },
      data: {
        title: validation.data.title,
        description: validation.data.description,
        content: validation.data.content,
      },
    });

    return successResponse(updatedPost);
  } catch (error) {
    return routeErrorResponse(error, "Failed to update post");
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request);
    const { id } = await context.params;

    if (!isUuid(id)) {
      return errorResponse("Post not found", 404);
    }

    const post = await prisma.post.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!post) {
      return errorResponse("Post not found", 404);
    }

    if (post.authorId !== user.id) {
      return errorResponse("You are not allowed to modify this post", 403);
    }

    await prisma.post.delete({
      where: {
        id,
      },
    });

    return messageResponse("Post deleted successfully");
  } catch (error) {
    return routeErrorResponse(error, "Failed to delete post");
  }
}
