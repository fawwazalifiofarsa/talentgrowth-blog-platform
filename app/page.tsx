import { redirect } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { Pagination } from "@/components/pagination";
import { PostCard } from "@/components/post-card";
import { SearchInput } from "@/components/search-input";
import { ApiClientError, fetchApi, type PostsResponse } from "@/lib/api/client";

type HomeProps = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
  }>;
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function getPositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function getPostsPath(page: number, limit: number, search: string) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));

  if (search) {
    params.set("search", search);
  }

  return `/api/posts?${params.toString()}`;
}

function getHomePath(page: number, limit: number, search: string) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));

  if (search) {
    params.set("search", search);
  }

  return `/?${params.toString()}`;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const page = getPositiveInteger(params.page, DEFAULT_PAGE);
  const requestedLimit = getPositiveInteger(params.limit, DEFAULT_LIMIT);
  const limit = Math.min(requestedLimit, MAX_LIMIT);
  const search = params.search?.trim() ?? "";

  let postsResponse: PostsResponse | null = null;
  let errorMessage: string | null = null;

  try {
    postsResponse = await fetchApi<PostsResponse>(
      getPostsPath(page, limit, search),
    );
  } catch (error) {
    errorMessage =
      error instanceof ApiClientError ? error.message : "Failed to fetch posts";
  }

  if (
    postsResponse &&
    postsResponse.pagination.totalPages > 0 &&
    page > postsResponse.pagination.totalPages
  ) {
    redirect(getHomePath(postsResponse.pagination.totalPages, limit, search));
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <p className="text-sm font-medium uppercase text-slate-500">
          Blog Platform
        </p>
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-semibold text-slate-950 sm:text-5xl">
            Read focused developer posts.
          </h1>
          <p className="text-lg leading-8 text-slate-600">
            Browse practical writing from the Talent Growth Blog, search by
            topic, and open each post for the full article.
          </p>
        </div>
      </section>

      <section className="space-y-5">
        <SearchInput search={search} limit={limit} />

        {errorMessage ? (
          <ErrorState title="Unable to load posts." message={errorMessage} />
        ) : null}

        {!errorMessage && postsResponse?.posts.length === 0 ? (
          <EmptyState
            title={search ? "No matching posts." : "No posts yet."}
            message={
              search
                ? "Try a different keyword or clear the search to view all posts."
                : "Published posts will appear here when they are available."
            }
          />
        ) : null}

        {!errorMessage && postsResponse?.posts.length ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {postsResponse.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <Pagination
              pagination={postsResponse.pagination}
              search={search || undefined}
            />
          </>
        ) : null}
      </section>
    </div>
  );
}
