export interface User extends Record<string, unknown> {
  _id: string;
  username: string;
  email?: string; // Optional - not stored in localStorage for security, but available from API
  role?: "admin" | "user"; // Optional for backward compatibility
  isAdmin?: boolean; // Primary field from backend
  createdAt: string;
  puzzleRating?: number;
  studiesCreated?: number;
}
