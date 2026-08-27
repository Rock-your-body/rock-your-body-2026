const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "https://rock-your-body.github.io";

/* =========================================================
   MIDDLEWARE
   ========================================================= */

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

/* =========================================================
   DEMO USER DATA
   ========================================================= */

const demoUser = {
  lineUserId: null,

  name: "สมาชิก ROCK YOUR BODY",

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
  programTotalDays: 90,
};

/* =========================================================
   HEALTH CHECK
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
    req.headers["x-line-user-id"] || null;

  res.json({
    ok: true,

    user: {
      ...demoUser,
      lineUserId,
    },
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
        current: demoUser.steps,
        target: demoUser.targetSteps,
        percent: Math.min(
          100,
          Math.round(
            (demoUser.steps /
              demoUser.targetSteps) *
              100
          )
        ),
      },

      calories: {
        current: demoUser.calories,
        target: demoUser.targetCalories,
        percent: Math.min(
          100,
          Math.round(
            (demoUser.calories /
              demoUser.targetCalories) *
              100
          )
        ),
      },

      sleep: {
        current: demoUser.sleep,
        target: demoUser.targetSleep,
        percent: Math.min(
          100,
          Math.round(
            (demoUser.sleep /
              demoUser.targetSleep) *
              100
          )
        ),
      },

      healthScore:
        demoUser.healthScore,

      weight: {
        current: demoUser.weight,
        target: demoUser.targetWeight,
      },

      inbody: {
        score:
          demoUser.inbodyScore,
      },

      program: {
        currentDay:
          demoUser.programDay,

        totalDays:
          demoUser.programTotalDays,

        percent: Math.round(
          (demoUser.programDay /
            demoUser.programTotalDays) *
            100
        ),
      },
    },
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

          title:
            "เดินให้ครบ 10,000 ก้าว",

          type: "MOVE",

          rewardCoin: 100,
          rewardEnergy: 10,

          completed: false,
        },

        {
          id: "daily-water",

          title:
            "ดื่มน้ำให้ครบ 3 ลิตร",

          type: "HEALTH",

          rewardCoin: 80,
          rewardEnergy: 10,

          completed: false,
        },

        {
          id: "daily-sleep",

          title:
            "นอนให้ได้อย่างน้อย 8 ชั่วโมง",

          type: "SLEEP",

          rewardCoin: 100,
          rewardEnergy: 10,

          completed: false,
        },
      ],

      weekly: [
        {
          id: "weekly-exercise",

          title:
            "ออกกำลังกายครบ 5 วัน",

          type: "MOVE",

          rewardCoin: 300,
          rewardEnergy: 30,

          completed: false,
        },

        {
          id: "weekly-health",

          title:
            "ทำกิจกรรมสุขภาพครบ 7 วัน",

          type: "HEALTH",

          rewardCoin: 500,
          rewardEnergy: 50,

          completed: false,
        },
      ],

      monthly: [
        {
          id: "monthly-health",

          title:
            "ทำภารกิจสุขภาพครบตามเป้าหมาย",

          type: "HEALTH",

          rewardCoin: 1000,
          rewardEnergy: 100,

          completed: false,
        },
      ],

      bonus: [
        {
          id: "bonus-checkup",

          title:
            "ตรวจสุขภาพ / InBody",

          type: "BONUS",

          rewardCoin: 500,
          rewardEnergy: 50,

          completed: false,
        },
      ],
    },
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

    const missionRewards = {
      "daily-step": {
        rockCoin: 100,
        energy: 10,
      },

      "daily-water": {
        rockCoin: 80,
        energy: 10,
      },

      "daily-sleep": {
        rockCoin: 100,
        energy: 10,
      },

      "weekly-exercise": {
        rockCoin: 300,
        energy: 30,
      },

      "weekly-health": {
        rockCoin: 500,
        energy: 50,
      },

      "monthly-health": {
        rockCoin: 1000,
        energy: 100,
      },

      "bonus-checkup": {
        rockCoin: 500,
        energy: 50,
      },
    };

    const reward =
      missionRewards[missionId];

    if (!reward) {
      return res.status(404).json({
        ok: false,

        error:
          "Mission not found",
      });
    }

    res.json({
      ok: true,

      message:
        "Mission completed",

      missionId,

      reward,
    });
  }
);

/* =========================================================
   BATTLE
   ========================================================= */

app.get("/api/battle", (req, res) => {
  const hp = 68500;
  const maxHp = 100000;

  res.json({
    ok: true,

    battle: {
      monster: {
        id: "sugar-monster",

        name:
          "SUGAR MONSTER",

        hp,

        maxHp,

        percent: Math.round(
          (hp / maxHp) * 100
        ),

        damageTaken:
          maxHp - hp,
      },

      user: {
        energy:
          demoUser.energy,

        maxEnergy:
          demoUser.maxEnergy,
      },
    },
  });
});

/* =========================================================
   FIGHT MONSTER
   ========================================================= */

app.post(
  "/api/battle/fight",
  (req, res) => {
    const energyCost = 10;

    if (
      demoUser.energy <
      energyCost
    ) {
      return res.status(400).json({
        ok: false,

        error:
          "Not enough energy",
      });
    }

    const damage = 500;

    demoUser.energy -=
      energyCost;

    res.json({
      ok: true,

      result: {
        damage,

        energyUsed:
          energyCost,

        remainingEnergy:
          demoUser.energy,

        reward: {
          rockCoin: 50,
          points: 100,
        },
      },
    });
  }
);

/* =========================================================
   REWARDS
   ========================================================= */

app.get("/api/rewards", (req, res) => {
  res.json({
    ok: true,

    rewards: [
      {
        id: "coin-1000",

        name:
          "1,000 ROCK COIN",

        type:
          "ROCK_COIN",

        value: 1000,

        claimed: false,
      },

      {
        id: "energy-10",

        name:
          "10 ENERGY",

        type:
          "ENERGY",

        value: 10,

        claimed: false,
      },

      {
        id: "health-badge",

        name:
          "นักสู้สุขภาพ BADGE",

        type:
          "BADGE",

        value: 1,

        claimed: false,
      },
    ],
  });
});

/* =========================================================
   RANKING
   ========================================================= */

app.get("/api/ranking", (req, res) => {
  res.json({
    ok: true,

    myRank:
      demoUser.rank,

    myPoints:
      demoUser.points,

    totalMembers: 238,

    ranking: [
      {
        rank: 1,

        name:
          "ROCK HERO",

        points: 18560,
      },

      {
        rank: 2,

        name:
          "FIT WARRIOR",

        points: 16970,
      },

      {
        rank: 3,

        name:
          "HEALTHY KING",

        points: 15730,
      },

      {
        rank: 10,

        name:
          "MOVE MASTER",

        points: 13900,
      },

      {
        rank: 11,

        name:
          "HEALTH ROCKER",

        points: 13100,
      },

      {
        rank: 12,

        name:
          "สมาชิก ROCK YOUR BODY",

        points:
          demoUser.points,
      },
    ],
  });
});

/* =========================================================
   SUMMARY
   ========================================================= */

app.get("/api/summary", (req, res) => {
  res.json({
    ok: true,

    summary: {
      points:
        demoUser.points,

      rockCoin:
        demoUser.rockCoin,

      energy:
        demoUser.energy,

      maxEnergy:
        demoUser.maxEnergy,

      rank:
        demoUser.rank,

      healthScore:
        demoUser.healthScore,
    },
  });
});

/* =========================================================
   404
   ========================================================= */

app.use((req, res) => {
  res.status(404).json({
    ok: false,

    error:
      "API endpoint not found",
  });
});

/* =========================================================
   ERROR HANDLER
   ========================================================= */

app.use(
  (err, req, res, next) => {
    console.error(
      "SERVER ERROR:",
      err
    );

    res.status(500).json({
      ok: false,

      error:
        "Internal server error",
    });
  }
);

/* =========================================================
   START SERVER
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
