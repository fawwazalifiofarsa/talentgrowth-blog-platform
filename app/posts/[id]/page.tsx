import Link from "next/link";

import { CommentForm } from "@/components/comment-form";
import { CommentList } from "@/components/comment-list";
import { DeletePostButton } from "@/components/delete-post-button";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import {
  ApiClientError,
  fetchApi,
  type CommentsResponse,
  type PostDetail,
} from "@/lib/api/client";
import { getCurrentUser } from "@/lib/auth/server";

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
  const user = await getCurrentUser();
  let post: PostDetail | null = null;
  let error: ApiClientError | Error | null = null;
  let commentsResponse: CommentsResponse | null = null;
  let commentsError: string | null = null;

  try {
    post = await fetchApi<PostDetail>(`/api/posts/${id}`);
  } catch (caughtError) {
    error =
      caughtError instanceof Error
        ? caughtError
        : new Error("Failed to fetch post");
  }

  if (post) {
    try {
      commentsResponse = await fetchApi<CommentsResponse>(
        `/api/posts/${post.id}/comments`,
      );
    } catch (caughtError) {
      commentsError =
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to fetch comments";
    }
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
            {user?.id === post.author.id ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <Link
                  href={`/posts/${post.id}/edit`}
                  className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
                >
                  Edit
                </Link>
                <DeletePostButton postId={post.id} />
              </div>
            ) : null}
          </header>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <MarkdownRenderer content={post.content} />
          </div>

          <section className="space-y-5">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-slate-950">
                Comments
              </h2>
              <p className="text-sm leading-6 text-slate-600">
                Read and join the discussion for this post.
              </p>
            </div>
            <CommentForm postId={post.id} isAuthenticated={Boolean(user)} />
            {commentsError ? (
              <ErrorState
                title="Unable to load comments."
                message={commentsError}
              />
            ) : (
              <CommentList
                comments={commentsResponse?.comments ?? []}
                postId={post.id}
                currentUserId={user?.id}
              />
            )}
          </section>
        </article>
      ) : null}
    </div>
  );
}
