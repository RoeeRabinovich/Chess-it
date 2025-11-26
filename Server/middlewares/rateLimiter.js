const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");
const config = require("config");

/**
 * Helper function to check if an IP should be exempted from rate limiting
 * (e.g., localhost in development)
 */
const shouldExemptIP = (ip) => {
  if (!config.has("RATE_LIMIT.EXEMPT_LOCALHOST")) {
    return false;
  }

  const exemptLocalhost = config.get("RATE_LIMIT.EXEMPT_LOCALHOST");
  if (!exemptLocalhost) {
    return false;
  }

  // Check if IP is localhost (IPv4 or IPv6)
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "::ffff:127.0.0.1" ||
    ip.startsWith("::ffff:127.0.0.1")
  );
};

/**
 * Get rate limit configuration from config file
 */
const getRateLimitConfig = (type) => {
  if (!config.has(`RATE_LIMIT.${type}`)) {
    // Fallback defaults
    return {
      windowMs: 900000, // 15 minutes
      max: 100,
      message: "Too many requests. Please try again later.",
    };
  }

  return config.get(`RATE_LIMIT.${type}`);
};

/**
 * Create a rate limiter that uses IP address (for public endpoints)
 */
const createIPRateLimiter = (type) => {
  const config = getRateLimitConfig(type);

  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: config.message,
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    // Skip rate limiting for exempted IPs (localhost in development)
    skip: (req) => {
      const ip = ipKeyGenerator(req);
      return shouldExemptIP(ip);
    },
    // Custom key generator - use IP address with proper IPv6 handling
    keyGenerator: ipKeyGenerator,
    // Custom handler to match existing error format
    handler: (req, res) => {
      const retryAfter = Math.ceil(config.windowMs / 1000); // Convert to seconds
      res.setHeader("Retry-After", retryAfter);
      res.status(429).send(config.message);
    },
  });
};

/**
 * Create a rate limiter that uses User ID (for authenticated endpoints)
 * Falls back to IP if user is not authenticated
 */
const createUserRateLimiter = (type) => {
  const config = getRateLimitConfig(type);

  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: config.message,
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for exempted IPs (localhost in development)
    skip: (req) => {
      const ip = ipKeyGenerator(req);
      return shouldExemptIP(ip);
    },
    // Custom key generator - use User ID if authenticated, otherwise IP with proper IPv6 handling
    keyGenerator: (req) => {
      // If user is authenticated, use their ID
      if (req.user && req.user._id) {
        return `user:${req.user._id}`;
      }
      // Otherwise fall back to IP (using helper for proper IPv6 handling)
      return `ip:${ipKeyGenerator(req)}`;
    },
    // Custom handler to match existing error format
    handler: (req, res) => {
      const retryAfter = Math.ceil(config.windowMs / 1000); // Convert to seconds
      res.setHeader("Retry-After", retryAfter);
      res.status(429).send(config.message);
    },
  });
};

/**
 * Rate limiters for different endpoint types
 */
const authRateLimiter = createIPRateLimiter("AUTH");
const stockfishRateLimiter = createIPRateLimiter("STOCKFISH");
const generalRateLimiter = createUserRateLimiter("GENERAL");

module.exports = {
  authRateLimiter,
  stockfishRateLimiter,
  generalRateLimiter,
};

