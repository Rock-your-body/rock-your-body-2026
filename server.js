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
    const lineUserId = req.headers["x-line-user-id"];

    // ไม่มี LINE User ID
    if (!lineUserId) {
      return res.status(401).json({
        ok: false,
        message: "LINE User ID is required",
      });
    }

    // ข้อมูลทดลองของสมาชิก
    // ขั้นต่อไปจะเปลี่ยนส่วนนี้เป็น Database
    const user = {
      lineUserId: lineUserId,
      name: "สมาชิก ROCK YOUR BODY",
      rockCoin: 1250,
      energy: 150,
      maxEnergy: 200,
      points: 0,
      rank: null,
    };

    res.json({
      ok: true,
      user: user,
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
    const lineUserId = req.headers["x-line-user-id"];

    if (!lineUserId) {
      return res.status(401).json({
        ok: false,
        message: "LINE User ID is required",
      });
    }

    res.json({
      ok: true,

      user: {
        lineUserId: lineUserId,
        name: "สมาชิก ROCK YOUR BODY",
      },

      points: {
        rockCoin: 1250,
        missionPoint: 0,
        battlePoint: 0,
      },

      energy: {
        current: 150,
        max: 200,
      },

      mission: {
        daily: 0,
        weekly: 0,
        monthly: 0,
        bonus: 0,
      },

      battle: {
        bossName: "SUGAR MONSTER",
        hp: 68500,
        maxHp: 100000,
      },

      health: {
        weight: null,
        targetWeight: null,
        steps: 0,
        calories: 0,
        sleep: null,
        healthScore: null,
      },
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
