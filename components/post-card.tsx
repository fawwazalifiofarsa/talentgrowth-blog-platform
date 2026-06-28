import Link from "next/link";

import type { PostSummary } from "@/lib/api/client";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="space-y-3">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-950">
              <Link
                href={`/posts/${post.id}`}
                className="outline-none hover:text-slate-700 focus:text-slate-700"
              >
                {post.title}
              </Link>
            </h2>
            {post.description ? (
              <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                {post.description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {post.author.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.author.avatarUrl}
                alt=""
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {getInitial(post.author.name)}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-950">
                {post.author.name}
              </p>
              <p className="text-xs text-slate-500">
                {formatDate(post.createdAt)}
              </p>
            </div>
          </div>
          <Link
            href={`/posts/${post.id}`}
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
          >
            Read more
          </Link>
        </div>
      </div>
    </article>
  );
}
