import { NextResponse } from "next/server";

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiMessage = {
  success: true;
  message: string;
};

export type ApiError = {
  success: false;
  message: string;
};

export type ApiValidationError = ApiError & {
  errors: Record<string, string>;
};

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccess<T>>({ success: true, data }, { status });
}

export function messageResponse(message: string, status = 200) {
  return NextResponse.json<ApiMessage>({ success: true, message }, { status });
}

export function errorResponse(message: string, status = 500) {
  return NextResponse.json<ApiError>({ success: false, message }, { status });
}

export function validationErrorResponse(
  errors: Record<string, string>,
  message = "Validation failed",
) {
  return NextResponse.json<ApiValidationError>(
    { success: false, message, errors },
    { status: 400 },
  );
}

export function routeErrorResponse(error: unknown, fallbackMessage: string) {
  if (
    error instanceof Error &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return errorResponse(error.message, error.status);
  }

  return errorResponse(fallbackMessage);
}
