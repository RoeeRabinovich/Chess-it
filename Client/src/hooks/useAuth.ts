import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  login as loginAction,
  logout as logoutAction,
  setLoading,
  setError,
  clearError,
} from "../store/authSlice";
import { apiService } from "../services/api";
import { LoginData, RegisterData, ApiError } from "../types";

// Track if auth check has been performed globally
let authCheckPerformed = false;

// Custom hook to handle authentication
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error, errorType } = useAppSelector(
    (state) => state.auth,
  );
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    // Check if user is already authenticated on app load
    // Only run once globally, or if user is not already loaded and token exists
    const checkAuth = () => {
      // If user is already loaded, don't check again
      if (user || hasCheckedAuth.current || authCheckPerformed) {
        return;
      }

      // Set loading to true while checking
      dispatch(setLoading(true));

      const token = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        // Restore user from localStorage synchronously
        try {
          const userData = JSON.parse(storedUser);
          dispatch(loginAction(userData));
          hasCheckedAuth.current = true;
          authCheckPerformed = true;
        } catch {
          // Invalid user data in localStorage, clear it
          localStorage.removeItem("user");
          apiService.clearAuth();
          hasCheckedAuth.current = true;
          authCheckPerformed = true;
        }
      } else if (token) {
        // Token exists but no user data - clear token
        apiService.clearAuth();
        hasCheckedAuth.current = true;
        authCheckPerformed = true;
      } else {
        hasCheckedAuth.current = true;
        authCheckPerformed = true;
      }

      // Set loading to false after check is complete
      dispatch(setLoading(false));
    };

    checkAuth();
  }, [dispatch, user]);

  const login = async (data: LoginData) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      const response = await apiService.login(data);
      // Save token and user to localStorage
      if (response.token && response.user) {
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        dispatch(loginAction(response.user));
      } else {
        throw new Error("No token or user received from server");
      }

      return response;
    } catch (error) {
      const apiError = error as ApiError;
      dispatch(
        setError({
          message: apiError?.message || "Login failed",
          type: apiError?.type || "AUTHENTICATION",
        }),
      );
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const register = async (data: RegisterData) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      const response = await apiService.register(data);
      // Register may return token+user or just user
      if (response.token && response.user) {
        // Has token, save both
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        dispatch(loginAction(response.user));
      } else if (response.user) {
        // Only user (no token), just save user
        localStorage.setItem("user", JSON.stringify(response.user));
        dispatch(loginAction(response.user));
      } else {
        throw new Error("No user received from server");
      }

      return response;
    } catch (error) {
      const apiError = error as ApiError;
      dispatch(
        setError({
          message: apiError?.message || "Registration failed",
          type: apiError?.type || "VALIDATION",
        }),
      );
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    // Reset auth check flags on logout
    hasCheckedAuth.current = false;
    authCheckPerformed = false;
    dispatch(logoutAction());
  };

  return {
    user,
    loading,
    error,
    errorType,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
};
