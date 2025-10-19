import { User } from "../types";

// Mock users database
export const mockUsers: User[] = [
  {
    _id: "1",
    username: "demo",
    email: "demo@chess-it.com",
    password: "demo123", // In real apps, passwords should be hashed
    role: "user",
    createdAt: new Date("2024-01-01").toISOString(),
  },
];

// Mock studies database
export const mockStudies = [
  {
    id: "1",
    title: "Sicilian Defense Basics",
    description: "Learn the fundamental moves of the Sicilian Defense",
    category: "Opening",
    userId: "1",
    author: "demo",
    isPublic: true,
    moves: [
      { moveNumber: 1, san: "e4", note: "King's pawn opening" },
      { moveNumber: 2, san: "c5", note: "Sicilian Defense begins" },
    ],
    createdAt: new Date("2024-01-15").toISOString(),
  },
  {
    id: "2",
    title: "Ruy Lopez Opening",
    description: "Master the Ruy Lopez opening strategy",
    category: "Opening",
    userId: "1",
    author: "demo",
    isPublic: true,
    moves: [
      { moveNumber: 1, san: "e4", note: "Control the center" },
      { moveNumber: 2, san: "e5", note: "Mirror the move" },
      { moveNumber: 3, san: "Nf3", note: "Develop the knight" },
    ],
    createdAt: new Date("2024-01-20").toISOString(),
  },
];

// Mock comments
export const mockComments = [
  {
    id: "1",
    studyId: "1",
    userId: "1",
    username: "demo",
    content: "Great study! Very helpful.",
    createdAt: new Date("2024-01-16").toISOString(),
  },
];

// Mock favorites
export const mockFavorites = new Set<string>();

// Helper to simulate network delay
export const delay = (ms: number = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));
