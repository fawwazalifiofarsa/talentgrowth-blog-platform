"use client";

import Link from "next/link";
import { useActionState } from "react";

import { createCommentAction } from "@/app/comments/actions";

type CommentFormProps = {
  postId: string;
  isAuthenticated: boolean;
};

export function CommentForm({ postId, isAuthenticated }: CommentFormProps) {
  const [state, formAction, isPending] = useActionState(createCommentAction, {});

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-600">
          <Link className="font-medium text-slate-950" href="/sign-in">
            Log in
          </Link>{" "}
          to join the discussion.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="postId" value={postId} />
      {state.message ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-800" htmlFor="content">
          Add a comment
        </label>
        <textarea
          id="content"
          name="content"
          rows={4}
          required
          defaultValue={state.values?.content ?? ""}
          className="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-950 shadow-sm outline-none focus:border-slate-900"
        />
        {state.errors?.content ? (
          <p className="text-sm text-red-600">{state.errors.content}</p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="min-h-10 rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Posting..." : "Post comment"}
      </button>
    </form>
  );
}
