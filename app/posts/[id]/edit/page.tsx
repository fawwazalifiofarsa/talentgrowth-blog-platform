import Link from "next/link";
import { redirect } from "next/navigation";

import { updatePostAction } from "@/app/posts/actions";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { PostForm } from "@/components/post-form";
import { ApiClientError, fetchApi, type PostDetail } from "@/lib/api/client";
import { getCurrentUser } from "@/lib/auth/server";

type EditPostPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  const user = await getCurrentUser();
  const { id } = await params;

  if (!user) {
    redirect(`/sign-in?next=/posts/${id}/edit`);
  }

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

  const isAuthor = post?.author.id === user.id;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <Link
          href={post ? `/posts/${post.id}` : "/"}
          className="inline-flex min-h-10 items-center rounded-md text-sm font-medium text-slate-700 transition hover:text-slate-950"
        >
          ← Back to post
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

      {post && !isAuthor ? (
        <EmptyState
          title="You cannot edit this post."
          message="Only the author can edit this post."
        />
      ) : null}

      {post && isAuthor ? (
        <>
          <section className="space-y-3">
            <p className="text-sm font-medium uppercase text-slate-500">
              Edit Post
            </p>
            <h1 className="text-3xl font-semibold text-slate-950">
              Update your post
            </h1>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <PostForm
              mode="edit"
              action={updatePostAction}
              postId={post.id}
              initialValues={post}
            />
          </section>
        </>
      ) : null}
    </div>
  );
}
