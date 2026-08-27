const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "https://rock-your-body.github.io";

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

// =========================
// Health Check
// =========================

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "ROCK YOUR BODY 2026 API",
    time: new Date().toISOString(),
  });
});

// =========================
// Current User
// =========================

app.get("/api/me", async (req, res) => {
  try {
    res.json({
      ok: true,
      message: "Authentication endpoint ready",
    });
  } catch (error) {
    console.error("ME API ERROR:", error);

    res.status(500).json({
      ok: false,
      error: "Unable to load user profile",
    });
  }
});

// =========================
// Dashboard
// =========================

app.get("/api/dashboard", async (req, res) => {
  try {
    res.status(501).json({
      ok: false,
      error: "Dashboard data source is not connected yet",
    });
  } catch (error) {
    console.error("DASHBOARD API ERROR:", error);

    res.status(500).json({
      ok: false,
      error: "Unable to load dashboard",
    });
  }
});

// =========================
// 404
// =========================

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: "API endpoint not found",
  });
});

// =========================
// Error Handler
// =========================

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    ok: false,
    error: "Internal server error",
  });
});

// =========================
// Start Server
// =========================

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `ROCK YOUR BODY 2026 API running on port ${PORT}`
  );
});
