const mongoSanitize = require("mongo-sanitize");
const validator = require("validator");
const config = require("config");

/**
 * Get sanitization configuration from config file
 */
const getSanitizationConfig = () => {
  if (!config.has("SANITIZATION")) {
    // Fallback defaults
    return {
      enabled: true,
      strictMode: true,
      removeHTML: true,
      trimWhitespace: true,
      normalizeEmail: true,
      skipFields: ["password", "confirmPassword"],
      skipTechnicalFields: [
        "fen",
        "position",
        "moves",
        "branches",
        "gameState",
      ],
    };
  }

  return config.get("SANITIZATION");
};

/**
 * Check if a field should be skipped from sanitization
 */
const shouldSkipField = (key, skipFields, skipTechnicalFields) => {
  // Check if field is in skip list
  if (skipFields && skipFields.includes(key)) {
    return true;
  }

  // Check if field is a technical field (case-insensitive)
  if (skipTechnicalFields) {
    const lowerKey = key.toLowerCase();
    return skipTechnicalFields.some(
      (field) => field.toLowerCase() === lowerKey
    );
  }

  return false;
};

/**
 * Sanitize a string value
 */
const sanitizeString = (value, config) => {
  if (typeof value !== "string") {
    return value;
  }

  let sanitized = value;

  // Trim whitespace
  if (config.trimWhitespace) {
    sanitized = sanitized.trim();
  }

  // Remove HTML tags and scripts
  if (config.removeHTML) {
    sanitized = validator.escape(sanitized);
    // Also remove any remaining HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, "");
  }

  // Normalize whitespace (replace multiple spaces with single space)
  if (config.strictMode) {
    sanitized = sanitized.replace(/\s+/g, " ");
  }

  return sanitized;
};

/**
 * Sanitize an email address
 */
const sanitizeEmail = (value, config) => {
  if (typeof value !== "string") {
    return value;
  }

  let sanitized = value.trim().toLowerCase();

  // Validate and normalize email
  if (config.normalizeEmail && validator.isEmail(sanitized)) {
    sanitized = validator.normalizeEmail(sanitized) || sanitized;
  }

  return sanitized;
};

/**
 * Recursively sanitize an object
 */
const sanitizeObject = (obj, config, parentKey = "") => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item, index) => {
      if (typeof item === "object" && item !== null) {
        return sanitizeObject(item, config, `${parentKey}[${index}]`);
      }
      if (typeof item === "string") {
        const fullKey = `${parentKey}[${index}]`;
        if (
          shouldSkipField(
            fullKey,
            config.skipFields,
            config.skipTechnicalFields
          )
        ) {
          return item;
        }
        return sanitizeString(item, config);
      }
      return item;
    });
  }

  // Handle objects
  if (typeof obj === "object") {
    const sanitized = {};

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = parentKey ? `${parentKey}.${key}` : key;

      // Skip password fields and technical fields
      if (shouldSkipField(key, config.skipFields, config.skipTechnicalFields)) {
        sanitized[key] = value;
        continue;
      }

      // Handle nested objects (like gameState)
      if (key === "gameState" && typeof value === "object" && value !== null) {
        // Skip sanitization of technical chess data
        sanitized[key] = value;
        continue;
      }

      // Handle nested objects recursively
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        sanitized[key] = sanitizeObject(value, config, fullKey);
        continue;
      }

      // Handle arrays
      if (Array.isArray(value)) {
        sanitized[key] = sanitizeObject(value, config, fullKey);
        continue;
      }

      // Handle strings
      if (typeof value === "string") {
        // Special handling for email fields
        if (key.toLowerCase().includes("email")) {
          sanitized[key] = sanitizeEmail(value, config);
        } else {
          sanitized[key] = sanitizeString(value, config);
        }
        continue;
      }

      // Keep other types as-is (numbers, booleans, etc.)
      sanitized[key] = value;
    }

    return sanitized;
  }

  // Handle primitive values
  if (typeof obj === "string") {
    return sanitizeString(obj, config);
  }

  return obj;
};

/**
 * Sanitization middleware
 * Sanitizes req.body, req.query, and req.params
 */
const sanitizeMiddleware = (req, res, next) => {
  const sanitizationConfig = getSanitizationConfig();

  // Skip if sanitization is disabled
  if (!sanitizationConfig.enabled) {
    return next();
  }

  try {
    // Sanitize req.body
    if (req.body && typeof req.body === "object") {
      // First, sanitize MongoDB operators (prevent NoSQL injection)
      req.body = mongoSanitize(req.body);

      // Then, sanitize string values
      req.body = sanitizeObject(req.body, sanitizationConfig);
    }

    // Sanitize req.query
    if (req.query && typeof req.query === "object") {
      req.query = mongoSanitize(req.query);

      // Sanitize query string values
      for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === "string") {
          if (
            !shouldSkipField(
              key,
              sanitizationConfig.skipFields,
              sanitizationConfig.skipTechnicalFields
            )
          ) {
            req.query[key] = sanitizeString(value, sanitizationConfig);
          }
        }
      }
    }

    // Sanitize req.params (usually IDs, but sanitize strings)
    if (req.params && typeof req.params === "object") {
      req.params = mongoSanitize(req.params);

      // Sanitize param string values
      for (const [key, value] of Object.entries(req.params)) {
        if (typeof value === "string") {
          if (
            !shouldSkipField(
              key,
              sanitizationConfig.skipFields,
              sanitizationConfig.skipTechnicalFields
            )
          ) {
            req.params[key] = sanitizeString(value, sanitizationConfig);
          }
        }
      }
    }
  } catch (error) {
    // Log error but continue (silent sanitization)
    console.error("Sanitization error:", error);
  }

  next();
};

module.exports = sanitizeMiddleware;
