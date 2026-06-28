import Link from "next/link";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import { EmptyState } from "@/components/empty-state";
import { Pagination } from "@/components/pagination";
import { PostCard } from "@/components/post-card";
import { SearchInput } from "@/components/search-input";
import type { PostSummary } from "@/lib/api/client";
import { AuthError, requireAuth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
  }>;
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

async function getDashboardUser() {
  try {
    return await requireAuth();
  } catch (error) {
    if (error instanceof AuthError && error.status === 401) {
      redirect("/sign-in?next=/dashboard");
    }

    throw error;
  }
}

function getPositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function serializePost(post: {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}): PostSummary {
  return {
    id: post.id,
    title: post.title,
    description: post.description,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    author: post.author,
  };
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const user = await getDashboardUser();
  const params = await searchParams;
  const page = getPositiveInteger(params.page, DEFAULT_PAGE);
  const requestedLimit = getPositiveInteger(params.limit, DEFAULT_LIMIT);
  const limit = Math.min(requestedLimit, MAX_LIMIT);
  const search = params.search?.trim() ?? "";
  const where: Prisma.PostWhereInput = {
    authorId: user.id,
    ...(search
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
      : {}),
  };

  const [posts, totalItems] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      select: {
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
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);
  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <p className="text-sm font-medium uppercase text-slate-500">
          Dashboard
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl font-semibold text-slate-950 sm:text-5xl">
              Manage your posts.
            </h1>
            <p className="text-lg leading-8 text-slate-600">
              Welcome back, {user.name}. Search, review, and edit posts you
              have written.
            </p>
          </div>
          <Link
            href="/posts/new"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Create Post
          </Link>
        </div>
      </section>

      <section className="space-y-5">
        <SearchInput search={search} limit={limit} action="/dashboard" />

        {posts.length === 0 ? (
          <EmptyState
            title={search ? "No matching posts." : "You have not written any posts yet."}
            message={
              search
                ? "Try a different keyword or clear the search to view all of your posts."
                : "Create your first post when you are ready to publish."
            }
          />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={serializePost(post)}
                  showManageActions
                />
              ))}
            </div>
            <Pagination
              pagination={{
                page,
                limit,
                totalItems,
                totalPages,
              }}
              search={search || undefined}
              basePath="/dashboard"
            />
          </>
        )}
      </section>
    </div>
  );
}
