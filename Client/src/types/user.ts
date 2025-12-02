export interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role: "admin" | "user";
  createdAt: string;
  puzzleRating?: number;
  studiesCreated?: number;
}
