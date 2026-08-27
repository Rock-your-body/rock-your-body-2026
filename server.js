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

/* =========================================================
   HEALTH
   ========================================================= */

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "ROCK YOUR BODY 2026 API",
    time: new Date().toISOString(),
  });
});

/* =========================================================
   CURRENT USER
   ========================================================= */

app.get("/api/me", (req, res) => {

  const lineUserId =
    req.headers["x-line-user-id"];

  /*
    ตอนนี้ยังไม่บังคับ LINE ID
    เพื่อให้ frontend ทดสอบระบบได้ก่อน
  */

  const user = {
    lineUserId:
      lineUserId || null,

    name:
      "สมาชิก ROCK YOUR BODY",

    rockCoin: 1250,

    energy: 150,

    maxEnergy: 200,

    points: 12560,

    rank: 12,

    weight: 78.5,

    targetWeight: 72.0,

    steps: 6842,

    targetSteps: 10000,

    calories: 320,

    targetCalories: 500,

    sleep: 7.3,

    targetSleep: 8,

    healthScore: 85,

    inbodyScore: 72,

    programDay: 45,

    programTotalDays: 90
  };

  res.json({
    ok: true,
    user
  });
});

/* =========================================================
   DASHBOARD
   ========================================================= */

app.get("/api/dashboard", (req, res) => {

  res.json({
    ok: true,

    dashboard: {

      steps: {
        current: 6842,
        target: 10000
      },

      calories: {
        current: 320,
        target: 500
      },

      sleep: {
        current: 7.3,
        target: 8
      },

      healthScore: 85,

      weight: {
        current: 78.5,
        target: 72.0
      },

      inbody: {
        score: 72
      },

      program: {
        currentDay: 45,
        totalDays: 90
      }
    }
  });
});

/* =========================================================
   MISSIONS
   ========================================================= */

app.get("/api/missions", (req, res) => {

  res.json({
    ok: true,

    missions: {

      daily: [
        {
          id: "daily-step",
          title: "เดินให้ครบ 10,000 ก้าว",
          type: "MOVE",
          rewardCoin: 100,
          rewardEnergy: 10,
          completed: false
        },
        {
          id: "daily-water",
          title: "ดื่มน้ำให้ครบ 3 ลิตร",
          type: "HEALTH",
          rewardCoin: 80,
          rewardEnergy: 10,
          completed: false
        }
      ],

      weekly: [
        {
          id: "weekly-exercise",
          title: "ออกกำลังกายครบ 5 วัน",
          type: "MOVE",
          rewardCoin: 300,
          rewardEnergy: 30,
          completed: false
        }
      ],

      monthly: [
        {
          id: "monthly-health",
          title: "ทำภารกิจสุขภาพครบตามเป้าหมาย",
          type: "HEALTH",
          rewardCoin: 1000,
          rewardEnergy: 100,
          completed: false
        }
      ],

      bonus: [
        {
          id: "bonus-checkup",
          title: "ตรวจสุขภาพ / InBody",
          type: "BONUS",
          rewardCoin: 500,
          rewardEnergy: 50,
          completed: false
        }
      ]
    }
  });
});

/* =========================================================
   COMPLETE MISSION
   ========================================================= */

app.post(
  "/api/missions/:missionId/complete",
  (req, res) => {

    const missionId =
      req.params.missionId;

    res.json({
      ok: true,

      message:
        "Mission completed",

      missionId,

      reward: {
        rockCoin: 100,
        energy: 10
      }
    });
  }
);

/* =========================================================
   BATTLE
   ========================================================= */

app.get("/api/battle", (req, res) => {

  res.json({
    ok: true,

    battle: {

      monster: {
        id: "sugar-monster",
        name: "SUGAR MONSTER",

        hp: 68500,
        maxHp: 100000,

        percent: 68
      },

      user: {
        energy: 150,
        maxEnergy: 200
      }
    }
  });
});

/* =========================================================
   FIGHT MONSTER
   ========================================================= */

app.post("/api/battle/fight", (req, res) => {

  res.json({
    ok: true,

    result: {
      damage: 500,

      energyUsed: 10,

      remainingEnergy: 140,

      reward: {
        rockCoin: 50,
        points: 100
      }
    }
  });
});

/* =========================================================
   REWARDS
   ========================================================= */

app.get("/api/rewards", (req, res) => {

  res.json({
    ok: true,

    rewards: [

      {
        id: "coin-1000",
        name: "1,000 ROCK COIN",
        type: "ROCK_COIN",
        value: 1000,
        claimed: false
      },

      {
        id: "energy-10",
        name: "10 ENERGY",
        type: "ENERGY",
        value: 10,
        claimed: false
      },

      {
        id: "health-badge",
        name: "นักสู้สุขภาพ BADGE",
        type: "BADGE",
        value: 1,
        claimed: false
      }
    ]
  });
});

/* =========================================================
   RANKING
   ========================================================= */

app.get("/api/ranking", (req, res) => {

  res.json({
    ok: true,

    myRank: 12,

    totalMembers: 238,

    ranking: [

      {
        rank: 1,
        name: "ROCK HERO",
        points: 12560
      },

      {
        rank: 2,
        name: "FIT WARRIOR",
        points: 9870
      },

      {
        rank: 3,
        name: "HEALTHY KING",
        points: 7230
      },

      {
        rank: 12,
        name: "สมาชิก ROCK YOUR BODY",
        points: 4560
      }
    ]
  });
});

/* =========================================================
   404
   ========================================================= */

app.use((req, res) => {

  res.status(404).json({
    ok: false,
    error: "API endpoint not found"
  });

});

/* =========================================================
   ERROR
   ========================================================= */

app.use(
  (err, req, res, next) => {

    console.error(
      "SERVER ERROR:",
      err
    );

    res.status(500).json({
      ok: false,
      error: "Internal server error"
    });

  }
);

/* =========================================================
   START
   ========================================================= */

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `ROCK YOUR BODY 2026 API running on port ${PORT}`
    );

  }
);
