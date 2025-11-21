import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ArchiveState {
  isActive: boolean;
}

// Load initial state from localStorage
const loadStateFromStorage = (): ArchiveState => {
  try {
    const stored = localStorage.getItem("archiveFilter");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading archive state from localStorage:", error);
  }
  return { isActive: false };
};

const initialState: ArchiveState = loadStateFromStorage();

const archiveSlice = createSlice({
  name: "archive",
  initialState,
  reducers: {
    toggleArchive: (state) => {
      state.isActive = !state.isActive;
      // Persist to localStorage
      try {
        localStorage.setItem("archiveFilter", JSON.stringify(state));
      } catch (error) {
        console.error("Error saving archive state to localStorage:", error);
      }
    },
    setArchive: (state, action: PayloadAction<boolean>) => {
      state.isActive = action.payload;
      // Persist to localStorage
      try {
        localStorage.setItem("archiveFilter", JSON.stringify(state));
      } catch (error) {
        console.error("Error saving archive state to localStorage:", error);
      }
    },
    clearArchive: (state) => {
      state.isActive = false;
      // Clear from localStorage
      try {
        localStorage.removeItem("archiveFilter");
      } catch (error) {
        console.error("Error clearing archive state from localStorage:", error);
      }
    },
  },
});

export const { toggleArchive, setArchive, clearArchive } = archiveSlice.actions;
export default archiveSlice.reducer;

