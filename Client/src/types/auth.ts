import { User } from "./user";

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ApiError {
  type: "VALIDATION" | "AUTHENTICATION" | "NETWORK" | "SERVER";
  message: string;
  field?: string;
  statusCode?: number;
}
