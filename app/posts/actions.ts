"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ApiClientError, fetchApi, type PostDetail } from "@/lib/api/client";
import { AUTH_COOKIE_NAME } from "@/lib/auth/jwt";
import { validatePostInput, type ValidationErrors } from "@/lib/validation";

export type PostFormState = {
  message?: string;
  errors?: ValidationErrors;
  values?: {
    title?: string;
    description?: string;
    content?: string;
  };
};

export type DeletePostState = {
  message?: string;
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

function getPostInput(formData: FormData) {
  return {
    title: getString(formData, "title"),
    description: getString(formData, "description"),
    content: getString(formData, "content"),
  };
}

function getFormValues(input: ReturnType<typeof getPostInput>) {
  return {
    title: input.title,
    description: input.description,
    content: input.content,
  };
}

export async function createPostAction(
  _previousState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const input = getPostInput(formData);
  const values = getFormValues(input);
  const validation = validatePostInput(input);

  if (!validation.success) {
    return {
      errors: validation.errors,
      values,
    };
  }

  const authorization = await getAuthHeader();

  if (!authorization) {
    return {
      message: "Please sign in before creating a post.",
      values,
    };
  }

  let post: PostDetail;

  try {
    post = await fetchApi<PostDetail>("/api/posts", {
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
        values,
      };
    }

    return {
      message: "Failed to create post",
      values,
    };
  }

  redirect(`/posts/${post.id}`);
}

export async function updatePostAction(
  _previousState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const postId = getString(formData, "postId");
  const input = getPostInput(formData);
  const values = getFormValues(input);
  const validation = validatePostInput(input);

  if (!postId) {
    return {
      message: "Post not found.",
      values,
    };
  }

  if (!validation.success) {
    return {
      errors: validation.errors,
      values,
    };
  }

  const authorization = await getAuthHeader();

  if (!authorization) {
    return {
      message: "Please sign in before editing this post.",
      values,
    };
  }

  try {
    await fetchApi<PostDetail>(`/api/posts/${postId}`, {
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
        values,
      };
    }

    return {
      message: "Failed to update post",
      values,
    };
  }

  redirect(`/posts/${postId}`);
}

export async function deletePostAction(
  _previousState: DeletePostState,
  formData: FormData,
): Promise<DeletePostState> {
  const postId = getString(formData, "postId");

  if (!postId) {
    return {
      message: "Post not found.",
    };
  }

  const authorization = await getAuthHeader();

  if (!authorization) {
    return {
      message: "Please sign in before deleting this post.",
    };
  }

  try {
    await fetchApi(`/api/posts/${postId}`, {
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
      message: "Failed to delete post",
    };
  }

  redirect("/");
}
