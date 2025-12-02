export interface DemoUser extends Record<string, unknown> {
  _id: string;
  username: string;
  email: string;
  role: "admin" | "user";
  puzzleRating: number;
  studiesCreated: number;
  createdAt: string;
}
