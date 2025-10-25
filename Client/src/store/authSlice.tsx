import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, ApiError } from "../types";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  errorType: ApiError["type"] | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  errorType: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.error = null;
      state.errorType = null;
    },
    logout: (state) => {
      state.user = null;
      state.error = null;
      state.errorType = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (
      state,
      action: PayloadAction<{ message: string; type: ApiError["type"] }>,
    ) => {
      state.error = action.payload.message;
      state.errorType = action.payload.type;
    },
    clearError: (state) => {
      state.error = null;
      state.errorType = null;
    },
  },
});

export const { login, logout, setLoading, setError, clearError } =
  authSlice.actions;
export default authSlice.reducer;
