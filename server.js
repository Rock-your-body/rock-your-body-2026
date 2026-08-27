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
    credentials: true
  })
);

app.use(express.json());


// =========================
// HEALTH CHECK
// =========================

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "ROCK YOUR BODY 2026 API",
    time: new Date().toISOString()
  });
});


// =========================
// CURRENT USER
// =========================

app.get("/api/me", (req, res) => {

  const lineUserId = req.headers["x-line-user-id"];

  if (!lineUserId) {
    return res.status(401).json({
      ok: false,
      message: "LINE User ID is required"
    });
  }

  res.json({
    ok: true,
    lineUserId: lineUserId,

    user: {
      name: "สมาชิก ROCK YOUR BODY",
      rockCoin: 0,
      energy: 0,
      maxEnergy: 200,
      points: 0,
      rank: null
    }
  });
});


// =========================
// DASHBOARD
// =========================

app.get("/api/dashboard", (req, res) => {

  const lineUserId = req.headers["x-line-user-id"];

  if (!lineUserId) {
    return res.status(401).json({
      ok: false,
      message: "LINE User ID is required"
    });
  }

  res.json({
    ok: true,
    lineUserId,

    dashboard: {
      rockCoin: 0,
      energy: 0,
      maxEnergy: 200,
      points: 0,
      rank: null,

      weight: null,
      targetWeight: null,

      steps: 0,
      stepTarget: 10000,

      calories: 0,
      calorieTarget: 500,

      sleep: 0,
      sleepTarget: 8,

      healthScore: 0
    }
  });
});


// =========================
// 404
// =========================

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: "API endpoint not found"
  });
});


// =========================
// ERROR HANDLER
// =========================

app.use((err, req, res, next) => {

  console.error("SERVER ERROR:", err);

  res.status(500).json({
    ok: false,
    error: "Internal server error"
  });
});


// =========================
// START SERVER
// =========================

app.listen(PORT, "0.0.0.0", () => {

  console.log(
    `ROCK YOUR BODY 2026 API running on port ${PORT}`
  );

});
