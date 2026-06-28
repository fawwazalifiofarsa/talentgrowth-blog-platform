"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ApiClientError, fetchApi, type Comment } from "@/lib/api/client";
import { AUTH_COOKIE_NAME } from "@/lib/auth/jwt";
import { validateCommentInput, type ValidationErrors } from "@/lib/validation";

export type CommentFormState = {
  message?: string;
  errors?: ValidationErrors;
  values?: {
    content?: string;
  };
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

async function getAuthHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  return token ? `Bearer ${token}` : null;
}

function getCommentInput(formData: FormData) {
  return {
    content: getString(formData, "content"),
  };
}

export async function createCommentAction(
  _previousState: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const postId = getString(formData, "postId");
  const input = getCommentInput(formData);
  const validation = validateCommentInput(input);

  if (!postId) {
    return {
      message: "Post not found.",
      values: input,
    };
  }

  if (!validation.success) {
    return {
      errors: validation.errors,
      values: input,
    };
  }

  const authorization = await getAuthHeader();

  if (!authorization) {
    return {
      message: "Please sign in before adding a comment.",
      values: input,
    };
  }

  try {
    await fetchApi<Comment>(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        authorization,
        "content-type": "application/json",
      },
      body: JSON.stringify(validation.data),
    });
  } catch (error) {
    if (error instanceof ApiClientError) {
      return {
        message: error.message,
        errors: error.errors,
        values: input,
      };
    }

    return {
      message: "Failed to create comment",
      values: input,
    };
  }

  redirect(`/posts/${postId}`);
}

export async function updateCommentAction(
  _previousState: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const postId = getString(formData, "postId");
  const commentId = getString(formData, "commentId");
  const input = getCommentInput(formData);
  const validation = validateCommentInput(input);

  if (!postId || !commentId) {
    return {
      message: "Comment not found.",
      values: input,
    };
  }

  if (!validation.success) {
    return {
      errors: validation.errors,
      values: input,
    };
  }

  const authorization = await getAuthHeader();

  if (!authorization) {
    return {
      message: "Please sign in before editing this comment.",
      values: input,
    };
  }

  try {
    await fetchApi<Comment>(`/api/comments/${commentId}`, {
      method: "PUT",
      headers: {
        authorization,
        "content-type": "application/json",
      },
      body: JSON.stringify(validation.data),
    });
  } catch (error) {
    if (error instanceof ApiClientError) {
      return {
        message: error.message,
        errors: error.errors,
        values: input,
      };
    }

    return {
      message: "Failed to update comment",
      values: input,
    };
  }

  redirect(`/posts/${postId}`);
}

export async function deleteCommentAction(
  _previousState: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const postId = getString(formData, "postId");
  const commentId = getString(formData, "commentId");

  if (!postId || !commentId) {
    return {
      message: "Comment not found.",
    };
  }

  const authorization = await getAuthHeader();

  if (!authorization) {
    return {
      message: "Please sign in before deleting this comment.",
    };
  }

  try {
    await fetchApi(`/api/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        authorization,
      },
    });
  } catch (error) {
    if (error instanceof ApiClientError) {
      return {
        message: error.message,
      };
    }

    return {
      message: "Failed to delete comment",
    };
  }

  redirect(`/posts/${postId}`);
}
