import { NextRequest } from "next/server";

import {
  errorResponse,
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

const commentAuthorSelect = {
  id: true,
  name: true,
  avatarUrl: true,
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

async function findPost(id: string) {
  if (!isUuid(id)) {
    return null;
  }

  return prisma.post.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
    },
  });
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const post = await findPost(id);

    if (!post) {
      return errorResponse("Post not found", 404);
    }

    const comments = await prisma.comment.findMany({
      where: {
        postId: id,
      },
      include: {
        author: {
          select: commentAuthorSelect,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return successResponse({ comments });
  } catch (error) {
    return routeErrorResponse(error, "Failed to fetch comments");
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request);
    const { id } = await context.params;
    const validation = validateCommentInput(await readJsonRequest(request));

    if (!validation.success) {
      return validationErrorResponse(validation.errors);
    }

    const post = await findPost(id);

    if (!post) {
      return errorResponse("Post not found", 404);
    }

    const comment = await prisma.comment.create({
      data: {
        content: validation.data.content,
        postId: id,
        authorId: user.id,
      },
      include: {
        author: {
          select: commentAuthorSelect,
        },
      },
    });

    return successResponse(comment, 201);
  } catch (error) {
    return routeErrorResponse(error, "Failed to create comment");
  }
}
