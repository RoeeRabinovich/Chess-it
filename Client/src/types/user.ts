export interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role: "admin" | "user";
  image: {
    url: string;
    alt: string;
  };
  createdAt: string;
}
