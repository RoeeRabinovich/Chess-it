/**
 * Generates a deterministic color for a username
 * Same username will always get the same color
 */

// Predefined color palette - ensures good contrast and readability
const AVATAR_COLORS = [
  "#FF6B6B", // Coral Red
  "#4ECDC4", // Turquoise
  "#45B7D1", // Sky Blue
  "#FFA07A", // Light Salmon
  "#98D8C8", // Mint Green
  "#F7DC6F", // Yellow
  "#BB8FCE", // Purple
  "#85C1E2", // Light Blue
  "#F8B739", // Orange
  "#52BE80", // Green
  "#EC7063", // Pink Red
  "#5DADE2", // Blue
  "#F1948A", // Light Pink
  "#9ADBB3", // pastel mint green
  "#F4D03F", // Gold
  "#A569BD", // Purple
];

/**
 * Simple hash function to convert string to number
 * @param str - String to hash
 * @returns Hash number
 */
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

/**
 * Gets a deterministic color for a username
 * @param username - Username to generate color for
 * @returns Hex color string
 */
export const getAvatarColor = (username: string): string => {
  if (!username) return AVATAR_COLORS[0];
  const hash = hashString(username.toLowerCase());
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

/**
 * Gets the first letter of a username (uppercase)
 * @param username - Username to get initial from
 * @returns Single uppercase letter
 */
export const getInitial = (username: string): string => {
  if (!username) return "?";
  return username.charAt(0).toUpperCase();
};
