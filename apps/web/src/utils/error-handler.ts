import { AxiosError } from "axios";

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response) {
      const message = error.response.data?.message;
      if (typeof message === "string") {
        return message;
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
    return error.message;
  }
  
  return "An unknown error occurred.";
}

export function isAxiosError(error: unknown): error is AxiosError {
  return error instanceof AxiosError;
}
