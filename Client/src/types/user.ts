export interface User extends Record<string, unknown> {
  _id: string;
  username: string;
  email: string;
  role?: "admin" | "user"; // Optional for backward compatibility
  isAdmin?: boolean; // Primary field from backend
  createdAt: string;
  puzzleRating?: number;
  studiesCreated?: number;
}
