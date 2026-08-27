const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "https://rock-your-body.github.io";

const LINE_CHANNEL_ID = process.env.LINE_CHANNEL_ID;

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
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
    time: new Date().toISOString(),
  });
});

// =========================
// LOGIN / CURRENT USER
// =========================

app.post("/api/me", async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(401).json({
        ok: false,
        error: "LINE ID Token is required",
      });
    }

    if (!LINE_CHANNEL_ID) {
      return res.status(500).json({
        ok: false,
        error: "LINE_CHANNEL_ID is not configured",
      });
    }

    // Verify ID Token with LINE
    const response = await fetch(
      "https://api.line.me/oauth2/v2.1/verify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          id_token: idToken,
          client_id: LINE_CHANNEL_ID,
        }),
      }
    );

    const lineUser = await response.json();

    if (!response.ok) {
      console.error("LINE VERIFY ERROR:", lineUser);

      return res.status(401).json({
        ok: false,
        error: "Invalid LINE ID Token",
      });
    }

    // LINE User ID
    const lineUserId = lineUser.sub;

    // =========================
    // TEMPORARY USER DATA
    // =========================

    const user = {
      lineUserId: lineUserId,
      name: lineUser.name || "สมาชิก ROCK YOUR BODY",

      rockCoin: 0,
      energy: 0,
      maxEnergy: 200,
      points: 0,

      rank: null,

      profileImage: lineUser.picture || null,

      // เตรียมไว้สำหรับระบบสมาชิก
      missions: [],
      battles: [],
      rewards: [],
    };

    return res.json({
      ok: true,
      user,
    });

  } catch (error) {
    console.error("ME API ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: "Unable to authenticate LINE user",
    });
  }
});

// =========================
// DASHBOARD
// =========================

app.get("/api/dashboard", async (req, res) => {
  res.json({
    ok: true,

    rockCoin: 0,
    energy: 0,
    maxEnergy: 200,
    points: 0,
    rank: null,

    weight: null,
    targetWeight: null,

    steps: 0,
    calories: 0,
    sleep: 0,
    healthScore: 0,

    programDay: 0,
    programTotalDays: 90,
  });
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
// ERROR HANDLER
// =========================

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    ok: false,
    error: "Internal server error",
  });
});

// =========================
// START
// =========================

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `ROCK YOUR BODY 2026 API running on port ${PORT}`
  );
});
