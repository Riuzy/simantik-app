import { AxiosError } from "axios";

export function getErrorMessage(error: unknown, fallback = "An error occurred."): string {
  if (error instanceof AxiosError) {
    if (error.response) {
      const data = error.response.data as Record<string, unknown> | undefined;
      if (data) {
        if (typeof data.message === "string" && data.message.trim()) {
          return data.message;
        }
        if (typeof data.error === "string" && data.error.trim()) {
          return data.error;
        }
        if (typeof data.details === "string" && data.details.trim()) {
          return data.details;
        }
      }

      if (error.response.status === 400) {
        return "Bad request. Please check your input.";
      }

      if (error.response.status === 401) {
        return "Unauthorized. Please log in again.";
      }

      if (error.response.status === 403) {
        return "Forbidden. You don't have permission to access this resource.";
      }

      if (error.response.status === 404) {
        return "Resource not found.";
      }

      if (error.response.status === 500) {
        return "Internal server error. Please try again later.";
      }

      return `Request failed with status ${error.response.status}.`;
    }

    if (error.request) {
      return "No response from server. Please check your internet connection.";
    }

    return error.message || "An error occurred while making the request.";
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

/**
 * Extracts a user-facing message from a backend error payload.
 * Resolution order: message -> error -> details -> fallback.
 */
export function getApiError(error: unknown, fallback = "Failed to generate script."): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as Record<string, unknown> | undefined;
    if (data) {
      if (typeof data.message === "string" && data.message.trim()) return data.message;
      if (typeof data.error === "string" && data.error.trim()) return data.error;
      if (typeof data.details === "string" && data.details.trim()) return data.details;
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        const first = data.errors[0] as { message?: string } | undefined;
        if (first?.message) return first.message;
      }
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function isAxiosError(error: unknown): error is AxiosError {
  return error instanceof AxiosError;
}
