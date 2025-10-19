export interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role: "admin" | "user";
  createdAt: string;
}

export interface Study {
  _id: string;
  title: string;
  description: string;
  author: User;
  moves: Move[];
  isPublic: boolean;
  isApproved: boolean;
  startingFen?: string;
  category?: string;
  favoriteCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Move {
  san: string;
  fen: string;
  note?: string;
}

export interface Comment {
  _id: string;
  studyId: string;
  author: User;
  content: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
