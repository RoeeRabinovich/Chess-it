import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import searchReducer from "./searchSlice";
import archiveReducer from "./archiveSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    search: searchReducer,
    archive: archiveReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
