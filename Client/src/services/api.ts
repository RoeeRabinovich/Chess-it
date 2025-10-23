import axios, { AxiosError, AxiosResponse } from "axios";
import { AuthResponse, LoginData, RegisterData, ApiError } from "../types/auth";
import { User } from "../types/user";

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

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
        apiError.message = errorMessage || "Invalid email or password";
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

// API service class
class ApiService {
  // Authentication endpoints
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/users/login", data);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      "/users/register",
      data,
    );
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>("/users/profile");
    return response.data;
  }

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
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
