import axios from "axios";
import {
  mockUsers,
  mockStudies,
  mockComments,
  mockFavorites,
  delay,
} from "../mockData/mockData";
import { User, AuthResponse } from "../types";
import { StudyData } from "../types/StudyData";

// Create axios instance (for consistency, though we're mocking)
export const axiosInstance = axios.create({
  timeout: 5000,
});

// Mock API service
export const mockApi = {
  // Auth endpoints
  auth: {
    login: async (email: string, password: string): Promise<AuthResponse> => {
      await delay();

      const user = mockUsers.find((u) => u.email === email);

      if (!user) {
        throw new Error("EMAIL_NOT_FOUND");
      }

      if (password !== "demo123") {
        throw new Error("INVALID_PASSWORD");
      }

      const token = `mock-token-${user._id}-${Date.now()}`;
      return { user, token };
    },

    register: async (
      username: string,
      email: string,
      password: string,
      confirmPassword: string,
    ): Promise<AuthResponse> => {
      await delay();

      // Check if user already exists
      if (mockUsers.find((u) => u.email === email)) {
        throw new Error("User already exists");
      }

      const newUser: User = {
        _id: String(mockUsers.length + 1),
        username,
        email,
        password, // In real apps, passwords should be hashed
        confirmPassword,
        role: "user",
        createdAt: new Date().toISOString(),
      };

      mockUsers.push(newUser);
      const token = `mock-token-${newUser._id}-${Date.now()}`;

      return { user: newUser, token };
    },

    me: async (): Promise<User> => {
      await delay();
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No token found");
      }

      // Extract user ID from token
      const userId = token.split("-")[2];
      const user = mockUsers.find((u) => u._id === userId);

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    },
  },

  // Studies endpoints
  studies: {
    getPublic: async () => {
      await delay();
      return mockStudies.filter((s) => s.isPublic);
    },

    getById: async (id: string) => {
      await delay();
      const study = mockStudies.find((s) => s.id === id);
      if (!study) {
        throw new Error("Study not found");
      }
      return study;
    },

    create: async (data: StudyData) => {
      await delay();
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const userId = token.split("-")[2];
      const user = mockUsers.find((u) => u._id === userId);

      const newStudy = {
        id: String(mockStudies.length + 1),
        ...data,
        userId,
        author: user?.username || "Unknown",
        createdAt: new Date().toISOString(),
      };

      mockStudies.push(newStudy);
      return newStudy;
    },
  },

  // Comments endpoints
  comments: {
    getByStudyId: async (studyId: string) => {
      await delay();
      return mockComments.filter((c) => c.studyId === studyId);
    },

    create: async (studyId: string, content: string) => {
      await delay();
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const userId = token.split("-")[2];
      const user = mockUsers.find((u) => u._id === userId);

      const newComment = {
        id: String(mockComments.length + 1),
        studyId,
        userId,
        username: user?.username || "Unknown",
        content,
        createdAt: new Date().toISOString(),
      };

      mockComments.push(newComment);
      return newComment;
    },
  },

  // Favorites endpoints
  favorites: {
    toggle: async (studyId: string) => {
      await delay();
      if (mockFavorites.has(studyId)) {
        mockFavorites.delete(studyId);
        return { isFavorite: false };
      } else {
        mockFavorites.add(studyId);
        return { isFavorite: true };
      }
    },

    check: async (studyId: string) => {
      await delay();
      return { isFavorite: mockFavorites.has(studyId) };
    },
  },
};
