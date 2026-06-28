import type { NextRequest } from "next/server";

export async function readJsonRequest(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function getSafeRedirectPath(value: string | null, fallback = "/dashboard") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}
