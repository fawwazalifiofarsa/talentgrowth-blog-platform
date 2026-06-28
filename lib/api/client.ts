import "server-only";

import { headers } from "next/headers";

type ApiSuccess<T> = {
  success: true;
  data: T;
};

type ApiError = {
  success: false;
  message: string;
};

type ApiValidationError = ApiError & {
  errors: Record<string, string>;
};

type ApiResponse<T> = ApiSuccess<T> | ApiError | ApiValidationError;

export type ApiAuthor = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export type PostSummary = {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  author: ApiAuthor;
};

export type PostDetail = PostSummary & {
  content: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

export type PostsResponse = {
  posts: PostSummary[];
  pagination: PaginationMeta;
};

export class ApiClientError extends Error {
  status: number;
  errors?: Record<string, string>;

  constructor(message: string, status: number, errors?: Record<string, string>) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.errors = errors;
  }
}

async function getBaseUrl() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");

  if (!host) {
    return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  }

  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

export async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${await getBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | null;

  if (!response.ok || !payload?.success) {
    const message =
      payload && "message" in payload ? payload.message : "Request failed";
    const errors = payload && "errors" in payload ? payload.errors : undefined;
    throw new ApiClientError(message, response.status, errors);
  }

  return payload.data;
}
