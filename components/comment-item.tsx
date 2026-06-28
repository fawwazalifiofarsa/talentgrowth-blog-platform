"use client";

import { useActionState, useState } from "react";

import {
  deleteCommentAction,
  updateCommentAction,
} from "@/app/comments/actions";
import type { Comment } from "@/lib/api/client";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(value));
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function CommentItem({
  comment,
  postId,
  currentUserId,
}: {
  comment: Comment;
  postId: string;
  currentUserId?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editState, editAction, isEditingPending] = useActionState(
    updateCommentAction,
    {},
  );
  const [deleteState, deleteAction, isDeletingPending] = useActionState(
    deleteCommentAction,
    {},
  );
  const isAuthor = currentUserId === comment.author.id;

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          {comment.author.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={comment.author.avatarUrl}
              alt=""
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              {getInitial(comment.author.name)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="truncate text-sm font-medium text-slate-950">
                {comment.author.name}
              </p>
              <p className="text-xs text-slate-500">
                {formatDate(comment.createdAt)}
                {comment.updatedAt !== comment.createdAt ? " (edited)" : ""}
              </p>
            </div>

            {isEditing ? (
              <form action={editAction} className="mt-3 space-y-3">
                <input type="hidden" name="postId" value={postId} />
                <input type="hidden" name="commentId" value={comment.id} />
                {editState.message ? (
                  <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {editState.message}
                  </div>
                ) : null}
                <textarea
                  name="content"
                  rows={4}
                  required
                  defaultValue={editState.values?.content ?? comment.content}
                  className="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-950 shadow-sm outline-none focus:border-slate-900"
                />
                {editState.errors?.content ? (
                  <p className="text-sm text-red-600">
                    {editState.errors.content}
                  </p>
                ) : null}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="submit"
                    disabled={isEditingPending}
                    className="min-h-10 rounded-md bg-slate-900 px-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isEditingPending ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="min-h-10 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                {comment.content}
              </p>
            )}
          </div>
        </div>

        {isAuthor && !isEditing ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="min-h-10 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
            >
              Edit
            </button>
            <form
              action={deleteAction}
              onSubmit={(event) => {
                if (!window.confirm("Delete this comment?")) {
                  event.preventDefault();
                }
              }}
              className="space-y-2"
            >
              <input type="hidden" name="postId" value={postId} />
              <input type="hidden" name="commentId" value={comment.id} />
              <button
                type="submit"
                disabled={isDeletingPending}
                className="min-h-10 rounded-md border border-red-300 px-3 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeletingPending ? "Deleting..." : "Delete"}
              </button>
              {deleteState.message ? (
                <p className="text-sm text-red-600">{deleteState.message}</p>
              ) : null}
            </form>
          </div>
        ) : null}
      </div>
    </article>
  );
}
