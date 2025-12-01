import axios, { AxiosError, AxiosResponse } from "axios";
import { ApiError } from "../types/auth";

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Callback function to handle logout (set by auth hook)
let onUnauthorizedCallback: (() => void) | null = null;

// Function to set the logout callback
export const setUnauthorizedHandler = (callback: () => void) => {
  onUnauthorizedCallback = callback;
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const apiError: ApiError = {
      type: "SERVER",
      message: "An unexpected error occurred",
      statusCode: 500,
    };

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      apiError.statusCode = status;

      // Handle both string and object responses
      let errorMessage = "";
      if (typeof data === "string") {
        errorMessage = data;
      } else if (data && typeof data === "object" && "message" in data) {
        errorMessage = (data as { message: string }).message;
      }

      if (status === 400) {
        apiError.type = "VALIDATION";
        apiError.message = errorMessage || "Invalid request data";
      } else if (status === 401) {
        apiError.type = "AUTHENTICATION";
        apiError.message =
          errorMessage || "Authentication required. Please log in.";
        // Automatically log out user on 401 (token expired/invalid)
        // Skip logout for login/register endpoints to avoid infinite loops
        const url = error.config?.url || "";
        if (!url.includes("/login") && !url.includes("/register")) {
          // Clear auth data
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          // Trigger logout callback if set
          if (onUnauthorizedCallback) {
            onUnauthorizedCallback();
          }
        }
      } else if (status === 403) {
        apiError.type = "AUTHENTICATION";
        apiError.message = errorMessage || "Access denied";
      } else if (status === 404) {
        apiError.type = "SERVER";
        apiError.message = errorMessage || "Resource not found";
      } else if (status === 409) {
        apiError.type = "VALIDATION";
        apiError.message = errorMessage || "User already exists";
      } else if (status >= 500) {
        apiError.type = "SERVER";
        apiError.message =
          errorMessage || "Server error. Please try again later";
      }
    } else if (error.request) {
      // Network error
      apiError.type = "NETWORK";
      apiError.message = "Network error. Please check your connection";
    } else {
      // Other error
      apiError.message = error.message || "An unexpected error occurred";
    }

    return Promise.reject(apiError);
  },
);

// API utility service class
class ApiService {
  // Utility method to check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem("authToken");
  }

  // Utility method to get stored token
  getToken(): string | null {
    return localStorage.getItem("authToken");
  }

  // Utility method to clear authentication
  clearAuth(): void {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
