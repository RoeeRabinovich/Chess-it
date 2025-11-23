const cors = require("cors");

// Cors Middleware - Allow requests from specific origins
const corsMiddleware = cors({
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:5500",
    "http://localhost:4173",
    "http://localhost:5173",
    "https://localhost:5173",
    "http://localhost:5174",
    "https://localhost:5174",
    "http://localhost:8181",
    "https://localhost:8181",
    "http://localhost:9191",
    "https://localhost:9191",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
});

module.exports = corsMiddleware;
