import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { ApiClientError, fetchApi, type PostDetail } from "@/lib/api/client";

type PostDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  let post: PostDetail | null = null;
  let error: ApiClientError | Error | null = null;

  try {
    post = await fetchApi<PostDetail>(`/api/posts/${id}`);
  } catch (caughtError) {
    error =
      caughtError instanceof Error
        ? caughtError
        : new Error("Failed to fetch post");
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <Link
          href="/"
          className="inline-flex min-h-10 items-center rounded-md text-sm font-medium text-slate-700 transition hover:text-slate-950"
        >
          ← Back to posts
        </Link>
      </div>

      {error instanceof ApiClientError && error.status === 404 ? (
        <EmptyState
          title="Post not found."
          message="The post may have been removed or the link may be incorrect."
        />
      ) : null}

      {error && !(error instanceof ApiClientError && error.status === 404) ? (
        <ErrorState
          title="Unable to load post."
          message={error.message || "Failed to fetch post"}
        />
      ) : null}

      {post ? (
        <article className="space-y-8">
          <header className="space-y-5">
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold text-slate-950 sm:text-5xl">
                {post.title}
              </h1>
              {post.description ? (
                <p className="text-lg leading-8 text-slate-600">
                  {post.description}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-3 border-y border-slate-200 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {post.author.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.author.avatarUrl}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    {getInitial(post.author.name)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-950">
                    {post.author.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    Published {formatDate(post.createdAt)}
                  </p>
                </div>
              </div>
              {post.updatedAt !== post.createdAt ? (
                <p className="text-sm text-slate-500">
                  Updated {formatDate(post.updatedAt)}
                </p>
              ) : null}
            </div>
          </header>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="whitespace-pre-wrap break-words text-base leading-8 text-slate-800">
              {post.content}
            </div>
          </div>

          <section className="rounded-lg border border-dashed border-slate-300 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">Comments</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Comments will be added in the next batch.
            </p>
          </section>
        </article>
      ) : null}
    </div>
  );
}
