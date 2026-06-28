"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { PostFormState } from "@/app/posts/actions";

type PostFormValues = {
  title?: string | null;
  description?: string | null;
  content?: string | null;
};

type PostFormProps = {
  mode: "create" | "edit";
  action: (
    previousState: PostFormState,
    formData: FormData,
  ) => Promise<PostFormState>;
  initialValues?: PostFormValues;
  postId?: string;
};

function getValue(
  state: PostFormState,
  initialValues: PostFormValues | undefined,
  key: keyof PostFormValues,
) {
  return state.values?.[key] ?? initialValues?.[key] ?? "";
}

export function PostForm({
  mode,
  action,
  initialValues,
  postId,
}: PostFormProps) {
  const [state, formAction, isPending] = useActionState(action, {});
  const submitLabel = mode === "create" ? "Create post" : "Update post";

  return (
    <form action={formAction} className="space-y-5">
      {postId ? <input type="hidden" name="postId" value={postId} /> : null}

      {state.message ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-800" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={getValue(state, initialValues, "title")}
          className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-900"
        />
        {state.errors?.title ? (
          <p className="text-sm text-red-600">{state.errors.title}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-medium text-slate-800"
          htmlFor="description"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={getValue(state, initialValues, "description")}
          className="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-950 shadow-sm outline-none focus:border-slate-900"
        />
        {state.errors?.description ? (
          <p className="text-sm text-red-600">{state.errors.description}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-800" htmlFor="content">
          Content
        </label>
        <textarea
          id="content"
          name="content"
          rows={14}
          required
          defaultValue={getValue(state, initialValues, "content")}
          className="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm leading-6 text-slate-950 shadow-sm outline-none focus:border-slate-900"
        />
        {state.errors?.content ? (
          <p className="text-sm text-red-600">{state.errors.content}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={isPending}
          className="min-h-11 rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : submitLabel}
        </button>
        <Link
          href={postId ? `/posts/${postId}` : "/"}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
