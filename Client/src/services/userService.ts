import { AuthResponse, LoginData, RegisterData } from "../types/auth";
import { User } from "../types/user";
import { apiClient } from "./api";

// User service class
class UserService {
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

  async updateUsername(username: string): Promise<User> {
    const response = await apiClient.patch<User>("/users/username", {
      username,
    });
    return response.data;
  }

  async updatePuzzleRating(newRating: number): Promise<User> {
    const response = await apiClient.patch<User>("/users/puzzle-rating", {
      puzzleRating: newRating,
    });
    return response.data;
  }

  // Password reset endpoints
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      "/users/forgot-password",
      { email },
    );
    return response.data;
  }

  async resetPassword(
    token: string,
    password: string,
    confirmPassword: string,
  ): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      "/users/reset-password",
      { token, password, confirmPassword },
    );
    return response.data;
  }
}

// Export singleton instance
export const userService = new UserService();
export default userService;

