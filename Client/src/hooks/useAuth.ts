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
    const checkAuth = async () => {
      // If user is already loaded, don't check again
      if (user || hasCheckedAuth.current || authCheckPerformed) {
        return;
      }

      if (apiService.isAuthenticated()) {
        hasCheckedAuth.current = true;
        authCheckPerformed = true;
        try {
          dispatch(setLoading(true));
          const userData = await apiService.getProfile();
          dispatch(loginAction(userData));
        } catch (error) {
          const apiError = error as ApiError;
          // Only clear token if it's an authentication error (401)
          // Don't clear on network errors or other issues
          if (apiError.type === "AUTHENTICATION" || apiError.statusCode === 401) {
            dispatch(
              setError({
                message: apiError?.message || "Authentication failed",
                type: apiError?.type || "AUTHENTICATION",
              }),
            );
            apiService.clearAuth();
          } else {
            // For other errors, just set the error but don't clear token
            dispatch(
              setError({
                message: apiError?.message || "Failed to load user profile",
                type: apiError?.type || "SERVER",
              }),
            );
          }
        } finally {
          dispatch(setLoading(false));
        }
      } else {
        hasCheckedAuth.current = true;
        authCheckPerformed = true;
      }
    };

    checkAuth();
  }, [dispatch, user]);

  const login = async (data: LoginData) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      const response = await apiService.login(data);
      // Save token to localStorage
      if (response.token) {
        localStorage.setItem("authToken", response.token);
        dispatch(loginAction(response.user));
      } else {
        throw new Error("No token received from server");
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
      // Save token to localStorage
      if (response.token) {
        localStorage.setItem("authToken", response.token);
        dispatch(loginAction(response.user));
      } else {
        throw new Error("No token received from server");
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
