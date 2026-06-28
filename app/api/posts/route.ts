import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

import {
  routeErrorResponse,
  successResponse,
  validationErrorResponse,
} from "@/lib/api/response";
import { readJsonRequest } from "@/lib/api/request";
import { requireAuth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { validatePostInput } from "@/lib/validation";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const postListSelect = {
  id: true,
  title: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: {
      id: true,
      name: true,
      avatarUrl: true,
    },
  },
} satisfies Prisma.PostSelect;

function getPositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = getPositiveInteger(searchParams.get("page"), DEFAULT_PAGE);
    const requestedLimit = getPositiveInteger(
      searchParams.get("limit"),
      DEFAULT_LIMIT,
    );
    const limit = Math.min(requestedLimit, MAX_LIMIT);
    const search = searchParams.get("search")?.trim();
    const where: Prisma.PostWhereInput = search
      ? {
          OR: [
            {
              title: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              content: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {};

    const [posts, totalItems] = await prisma.$transaction([
      prisma.post.findMany({
        where,
        select: postListSelect,
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return successResponse({
      posts,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    return routeErrorResponse(error, "Failed to fetch posts");
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const validation = validatePostInput(await readJsonRequest(request));

    if (!validation.success) {
      return validationErrorResponse(validation.errors);
    }

    const post = await prisma.post.create({
      data: {
        title: validation.data.title,
        description: validation.data.description,
        content: validation.data.content,
        authorId: user.id,
      },
    });

    return successResponse(post, 201);
  } catch (error) {
    return routeErrorResponse(error, "Failed to create post");
  }
}
