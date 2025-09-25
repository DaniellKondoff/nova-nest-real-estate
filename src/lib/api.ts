import { formatErrorMessage } from "@/lib/errors";
import type { ErrorResponse, SuccessResponse } from "@/types/api";

/**
 * Build a JSON Response with a consistent success envelope.
 * Ensures all successful responses follow `{ data, message? }`.
 */
export function ok<T>(data: T, init?: ResponseInit & { message?: string }): Response {
  const body: SuccessResponse<T> = { data, message: init?.message };
  const status = init?.status ?? 200;
  return Response.json(body, { ...init, status });
}

/**
 * Build a JSON Response with a consistent error envelope.
 * Ensures all error responses follow `{ error, code?, details? }`.
 */
export function fail(
  err: unknown,
  init?: ResponseInit & { code?: string | number; details?: Record<string, unknown> }
): Response {
  const status = init?.status ?? 500;
  const body: ErrorResponse = {
    error: formatErrorMessage(err),
    code: init?.code,
    details: init?.details,
  };
  return Response.json(body, { ...init, status });
}

/**
 * Create a uniform validation error payload.
 */
export function validationError(message: string, details?: Record<string, unknown>): Response {
  return fail(message, { status: 400, code: "VALIDATION_ERROR", details });
}

/**
 * Create a uniform unauthorized error payload.
 */
export function unauthorized(message = "Unauthorized"): Response {
  return fail(message, { status: 401, code: "UNAUTHORIZED" });
}

/**
 * Create a uniform not found error payload.
 */
export function notFound(message = "Not Found"): Response {
  return fail(message, { status: 404, code: "NOT_FOUND" });
}

/**
 * Create a uniform server error payload.
 */
export function serverError(err: unknown, details?: Record<string, unknown>): Response {
  return fail(err, { status: 500, code: "SERVER_ERROR", details });
}


