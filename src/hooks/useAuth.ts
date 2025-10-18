import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  checkAuth as checkAuthAction,
  login as loginAction,
  register as registerAction,
  logout as logoutAction,
} from "../store/authSlice";

// Custom hook to handle authentication
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuthAction());
  }, [dispatch]);

  const login = async (email: string, password: string) => {
    const result = await dispatch(loginAction({ email, password }));
    if (loginAction.fulfilled.match(result)) {
      return result.payload;
    }
    throw new Error(error || "Login failed");
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) => {
    const result = await dispatch(
      registerAction({ username, email, password, confirmPassword }),
    );
    if (registerAction.fulfilled.match(result)) {
      return result.payload;
    }
    throw new Error(error || "Registration failed");
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  return { user, loading, login, register, logout, isAuthenticated: !!user };
};
