const cors = require("cors");
const config = require("config");

// Default CORS origins fallback (used if config doesn't have CORS_ORIGINS)
const defaultOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
];

// Get CORS origins from config, fallback to defaults if not configured
const corsOrigins = config.has("CORS_ORIGINS")
  ? config.get("CORS_ORIGINS")
  : defaultOrigins;

// Cors Middleware - Allow requests from specific origins
// Origins are configured in config/development.json and config/production.json
const corsMiddleware = cors({
  origin: corsOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
});

module.exports = corsMiddleware;
