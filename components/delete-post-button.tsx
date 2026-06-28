"use client";

import { useActionState } from "react";

import { deletePostAction } from "@/app/posts/actions";

export function DeletePostButton({ postId }: { postId: string }) {
  const [state, formAction, isPending] = useActionState(deletePostAction, {});

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm("Delete this post? This action cannot be undone.")) {
          event.preventDefault();
        }
      }}
      className="space-y-2"
    >
      <input type="hidden" name="postId" value={postId} />
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-10 items-center justify-center rounded-md border border-red-300 px-3 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Deleting..." : "Delete"}
      </button>
      {state.message ? (
        <p className="text-sm text-red-600">{state.message}</p>
      ) : null}
    </form>
  );
}
