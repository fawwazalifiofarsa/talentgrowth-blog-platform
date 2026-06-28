import { redirect } from "next/navigation";

import { createPostAction } from "@/app/posts/actions";
import { PostForm } from "@/components/post-form";
import { getCurrentUser } from "@/lib/auth/server";

export default async function NewPostPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in?next=/posts/new");
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <p className="text-sm font-medium uppercase text-slate-500">
          New Post
        </p>
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-slate-950">
            Create a blog post
          </h1>
          <p className="text-base leading-7 text-slate-600">
            Write raw Markdown content with a clear title and optional summary.
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <PostForm mode="create" action={createPostAction} />
      </section>
    </div>
  );
}
