import { useEffect } from "react";
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

// Custom hook to handle authentication
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error, errorType } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkAuth = async () => {
      if (apiService.isAuthenticated()) {
        try {
          dispatch(setLoading(true));
          const userData = await apiService.getProfile();
          dispatch(loginAction(userData));
        } catch (error) {
          const apiError = error as ApiError;
          dispatch(
            setError({
              message: apiError?.message || "Authentication failed",
              type: apiError?.type || "AUTHENTICATION",
            }),
          );
          apiService.clearAuth();
        } finally {
          dispatch(setLoading(false));
        }
      }
    };

    checkAuth();
  }, [dispatch]);

  const login = async (data: LoginData) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      const response = await apiService.login(data);
      localStorage.setItem("authToken", response.token);
      dispatch(loginAction(response.user));

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
      localStorage.setItem("authToken", response.token);
      dispatch(loginAction(response.user));

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
