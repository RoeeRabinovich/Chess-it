const helmet = require("helmet");
const config = require("config");

/**
 * Get Helmet configuration from config file
 */
const getHelmetConfig = () => {
  if (!config.has("HELMET")) {
    // Fallback to default Helmet configuration
    return {
      enabled: true,
      useDefaults: true,
    };
  }

  return config.get("HELMET");
};

/**
 * Configure Helmet middleware with custom settings
 * Security headers middleware - protects against common vulnerabilities
 */
const configureHelmet = () => {
  const helmetConfig = getHelmetConfig();

  // Skip if Helmet is disabled
  if (!helmetConfig.enabled) {
    return (req, res, next) => next();
  }

  // Use default Helmet configuration (recommended)
  if (helmetConfig.useDefaults !== false) {
    return helmet();
  }

  // Custom configuration (if needed)
  const helmetOptions = {};

  // Content Security Policy
  if (helmetConfig.CONTENT_SECURITY_POLICY) {
    const cspConfig = helmetConfig.CONTENT_SECURITY_POLICY;
    if (cspConfig.useDefaults) {
      helmetOptions.contentSecurityPolicy = {
        useDefaults: true,
        directives: cspConfig.directives || {},
      };
    } else if (cspConfig.directives) {
      helmetOptions.contentSecurityPolicy = {
        directives: cspConfig.directives,
      };
    } else {
      helmetOptions.contentSecurityPolicy = false;
    }
  }

  // Cross-Origin Embedder Policy (matches client vite.config.ts)
  if (helmetConfig.CROSS_ORIGIN_EMBEDDER_POLICY) {
    const policy = helmetConfig.CROSS_ORIGIN_EMBEDDER_POLICY.policy;
    helmetOptions.crossOriginEmbedderPolicy =
      policy !== false ? { policy } : false;
  }

  // Cross-Origin Opener Policy (matches client vite.config.ts)
  if (helmetConfig.CROSS_ORIGIN_OPENER_POLICY) {
    const policy = helmetConfig.CROSS_ORIGIN_OPENER_POLICY.policy;
    helmetOptions.crossOriginOpenerPolicy =
      policy !== false ? { policy } : false;
  }

  // Cross-Origin Resource Policy (matches client vite.config.ts)
  if (helmetConfig.CROSS_ORIGIN_RESOURCE_POLICY) {
    const policy = helmetConfig.CROSS_ORIGIN_RESOURCE_POLICY.policy;
    helmetOptions.crossOriginResourcePolicy =
      policy !== false ? { policy } : false;
  }

  return helmet(helmetOptions);
};

const helmetMiddleware = configureHelmet();

module.exports = helmetMiddleware;

