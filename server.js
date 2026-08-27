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
   TEMP MEMBER DATABASE
   ---------------------------------------------------------
   Phase 1:
   ใช้ Memory Database ก่อน
   Phase ถัดไปจะเปลี่ยนเป็น Database จริง
   ========================================================= */

const members = new Map();

/* =========================================================
   CREATE MEMBER
   ========================================================= */

function createMember(lineUserId, profile = {}) {
  const member = {
    lineUserId,

    displayName:
      profile.displayName ||
      "สมาชิก ROCK YOUR BODY",

    pictureUrl:
      profile.pictureUrl ||
      "",

    /* -------------------------
       ROCK SYSTEM
       ------------------------- */

    rockCoin: 0,

    energy: 200,

    maxEnergy: 200,

    points: 0,

    rank: null,

    /* -------------------------
       HEALTH
       ------------------------- */

    weight: null,

    targetWeight: null,

    steps: 0,

    targetSteps: 10000,

    calories: 0,

    targetCalories: 500,

    sleep: 0,

    targetSleep: 8,

    healthScore: 0,

    inbodyScore: null,

    /* -------------------------
       PROGRAM
       ------------------------- */

    programDay: 1,

    programTotalDays: 90,

    createdAt:
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString()
  };

  members.set(
    lineUserId,
    member
  );

  return member;
}

/* =========================================================
   GET MEMBER
   ========================================================= */

function getMember(lineUserId) {
  if (!lineUserId) {
    return null;
  }

  return members.get(lineUserId) || null;
}

/* =========================================================
   REQUIRE LINE USER
   ========================================================= */

function requireLineUser(req, res) {

  const lineUserId =
    req.headers["x-line-user-id"];

  if (!lineUserId) {

    return res.status(401).json({
      ok: false,
      error: "LINE User ID is required"
    });
  }

  return lineUserId;
}

/* =========================================================
   HEALTH CHECK
   ========================================================= */

app.get(
  "/api/health",
  (req, res) => {

    res.json({

      ok: true,

      service:
        "ROCK YOUR BODY 2026 API",

      status:
        "online",

      members:
        members.size,

      time:
        new Date().toISOString()

    });

  }
);

/* =========================================================
   LOGIN / MEMBER
   =========================================================

   Frontend ส่ง:

   x-line-user-id
   x-line-display-name
   x-line-picture-url

   Backend จะสร้างสมาชิกใหม่
   หรือโหลดสมาชิกเดิม
   ========================================================= */

app.post(
  "/api/auth/line",
  (req, res) => {

    const lineUserId =
      requireLineUser(req, res);

    if (!lineUserId) return;

    const displayName =
      req.headers[
        "x-line-display-name"
      ] || "";

    const pictureUrl =
      req.headers[
        "x-line-picture-url"
      ] || "";

    let member =
      getMember(lineUserId);

    /* -------------------------
       NEW MEMBER
       ------------------------- */

    if (!member) {

      member =
        createMember(
          lineUserId,
          {
            displayName,
            pictureUrl
          }
        );

    }

    /* -------------------------
       UPDATE LINE PROFILE
       ------------------------- */

    if (displayName) {

      member.displayName =
        displayName;

    }

    if (pictureUrl) {

      member.pictureUrl =
        pictureUrl;

    }

    member.updatedAt =
      new Date().toISOString();

    res.json({

      ok: true,

      message:
        "LINE member authenticated",

      user:
        member

    });

  }
);

/* =========================================================
   CURRENT USER
   ========================================================= */

app.get(
  "/api/me",
  (req, res) => {

    const lineUserId =
      requireLineUser(req, res);

    if (!lineUserId) return;

    let member =
      getMember(lineUserId);

    /*
      ถ้ายังไม่มีสมาชิก
      สร้าง Account ใหม่ทันที
    */

    if (!member) {

      member =
        createMember(
          lineUserId
        );

    }

    res.json({

      ok: true,

      user:
        member

    });

  }
);

/* =========================================================
   UPDATE PROFILE
   ========================================================= */

app.put(
  "/api/me",
  (req, res) => {

    const lineUserId =
      requireLineUser(req, res);

    if (!lineUserId) return;

    const member =
      getMember(lineUserId);

    if (!member) {

      return res.status(404).json({

        ok: false,

        error:
          "Member not found"

      });

    }

    const {
      displayName,
      pictureUrl,
      targetWeight,
      targetSteps,
      targetCalories,
      targetSleep
    } = req.body || {};

    if (
      typeof displayName ===
      "string"
    ) {

      member.displayName =
        displayName;

    }

    if (
      typeof pictureUrl ===
      "string"
    ) {

      member.pictureUrl =
        pictureUrl;

    }

    if (
      targetWeight !== undefined
    ) {

      member.targetWeight =
        Number(targetWeight);

    }

    if (
      targetSteps !== undefined
    ) {

      member.targetSteps =
        Number(targetSteps);

    }

    if (
      targetCalories !== undefined
    ) {

      member.targetCalories =
        Number(targetCalories);

    }

    if (
      targetSleep !== undefined
    ) {

      member.targetSleep =
        Number(targetSleep);

    }

    member.updatedAt =
      new Date().toISOString();

    res.json({

      ok: true,

      user:
        member

    });

  }
);

/* =========================================================
   DASHBOARD
   ========================================================= */

app.get(
  "/api/dashboard",
  (req, res) => {

    const lineUserId =
      requireLineUser(req, res);

    if (!lineUserId) return;

    const member =
      getMember(lineUserId);

    if (!member) {

      return res.status(404).json({

        ok: false,

        error:
          "Member not found"

      });

    }

    res.json({

      ok: true,

      dashboard: {

        member: {

          lineUserId:
            member.lineUserId,

          displayName:
            member.displayName,

          pictureUrl:
            member.pictureUrl

        },

        steps: {

          current:
            member.steps,

          target:
            member.targetSteps

        },

        calories: {

          current:
            member.calories,

          target:
            member.targetCalories

        },

        sleep: {

          current:
            member.sleep,

          target:
            member.targetSleep

        },

        healthScore:
          member.healthScore,

        weight: {

          current:
            member.weight,

          target:
            member.targetWeight

        },

        inbody: {

          score:
            member.inbodyScore

        },

        program: {

          currentDay:
            member.programDay,

          totalDays:
            member.programTotalDays

        },

        rockCoin:
          member.rockCoin,

        energy: {

          current:
            member.energy,

          max:
            member.maxEnergy

        },

        points:
          member.points,

        rank:
          member.rank

      }

    });

  }
);

/* =========================================================
   MISSIONS
   ========================================================= */

app.get(
  "/api/missions",
  (req, res) => {

    const lineUserId =
      requireLineUser(req, res);

    if (!lineUserId) return;

    const member =
      getMember(lineUserId);

    if (!member) {

      return res.status(404).json({

        ok: false,

        error:
          "Member not found"

      });

    }

    res.json({

      ok: true,

      missions: {

        daily: [

          {
            id:
              "daily-step",

            title:
              "เดินให้ครบ 10,000 ก้าว",

            type:
              "MOVE",

            rewardCoin:
              100,

            rewardEnergy:
              10,

            completed:
              member.steps >=
              member.targetSteps

          },

          {
            id:
              "daily-water",

            title:
              "ดื่มน้ำให้ครบ 3 ลิตร",

            type:
              "HEALTH",

            rewardCoin:
              80,

            rewardEnergy:
              10,

            completed:
              false

          }

        ],

        weekly: [

          {
            id:
              "weekly-exercise",

            title:
              "ออกกำลังกายครบ 5 วัน",

            type:
              "MOVE",

            rewardCoin:
              300,

            rewardEnergy:
              30,

            completed:
              false

          }

        ],

        monthly: [

          {
            id:
              "monthly-health",

            title:
              "ทำภารกิจสุขภาพครบตามเป้าหมาย",

            type:
              "HEALTH",

            rewardCoin:
              1000,

            rewardEnergy:
              100,

            completed:
              false

          }

        ],

        bonus: [

          {
            id:
              "bonus-checkup",

            title:
              "ตรวจสุขภาพ / InBody",

            type:
              "BONUS",

            rewardCoin:
              500,

            rewardEnergy:
              50,

            completed:
              false

          }

        ]

      }

    });

  }
);

/* =========================================================
   COMPLETE MISSION
   ========================================================= */

app.post(
  "/api/missions/:missionId/complete",
  (req, res) => {

    const lineUserId =
      requireLineUser(req, res);

    if (!lineUserId) return;

    const member =
      getMember(lineUserId);

    if (!member) {

      return res.status(404).json({

        ok: false,

        error:
          "Member not found"

      });

    }

    const missionId =
      req.params.missionId;

    /*
      Phase 1 reward
      จะทำ Database จริงใน Phase 2
    */

    const reward = {

      rockCoin: 100,

      energy: 10,

      points: 100

    };

    member.rockCoin +=
      reward.rockCoin;

    member.energy =
      Math.min(
        member.maxEnergy,
        member.energy +
        reward.energy
      );

    member.points +=
      reward.points;

    member.updatedAt =
      new Date().toISOString();

    res.json({

      ok: true,

      message:
        "Mission completed",

      missionId,

      reward,

      user: {

        rockCoin:
          member.rockCoin,

        energy:
          member.energy,

        points:
          member.points

      }

    });

  }
);

/* =========================================================
   BATTLE
   ========================================================= */

app.get(
  "/api/battle",
  (req, res) => {

    const lineUserId =
      requireLineUser(req, res);

    if (!lineUserId) return;

    const member =
      getMember(lineUserId);

    if (!member) {

      return res.status(404).json({

        ok: false,

        error:
          "Member not found"

      });

    }

    const maxHp =
      100000;

    const hp =
      68500;

    res.json({

      ok: true,

      battle: {

        monster: {

          id:
            "sugar-monster",

          name:
            "SUGAR MONSTER",

          hp,

          maxHp,

          percent:
            Math.round(
              (hp / maxHp) * 100
            )

        },

        user: {

          energy:
            member.energy,

          maxEnergy:
            member.maxEnergy

        }

      }

    });

  }
);

/* =========================================================
   FIGHT MONSTER
   ========================================================= */

app.post(
  "/api/battle/fight",
  (req, res) => {

    const lineUserId =
      requireLineUser(req, res);

    if (!lineUserId) return;

    const member =
      getMember(lineUserId);

    if (!member) {

      return res.status(404).json({

        ok: false,

        error:
          "Member not found"

      });

    }

    const energyUsed =
      10;

    if (
      member.energy <
      energyUsed
    ) {

      return res.status(400).json({

        ok: false,

        error:
          "Energy is not enough"

      });

    }

    member.energy -=
      energyUsed;

    const reward = {

      rockCoin:
        50,

      points:
        100

    };

    member.rockCoin +=
      reward.rockCoin;

    member.points +=
      reward.points;

    member.updatedAt =
      new Date().toISOString();

    res.json({

      ok: true,

      result: {

        damage:
          500,

        energyUsed,

        remainingEnergy:
          member.energy,

        reward

      }

    });

  }
);

/* =========================================================
   REWARDS
   ========================================================= */

app.get(
  "/api/rewards",
  (req, res) => {

    const lineUserId =
      requireLineUser(req, res);

    if (!lineUserId) return;

    const member =
      getMember(lineUserId);

    if (!member) {

      return res.status(404).json({

        ok: false,

        error:
          "Member not found"

      });

    }

    res.json({

      ok: true,

      user: {

        rockCoin:
          member.rockCoin,

        points:
          member.points

      },

      rewards: [

        {
          id:
            "coin-1000",

          name:
            "1,000 ROCK COIN",

          type:
            "ROCK_COIN",

          value:
            1000,

          claimed:
            false
        },

        {
          id:
            "energy-10",

          name:
            "10 ENERGY",

          type:
            "ENERGY",

          value:
            10,

          claimed:
            false
        },

        {
          id:
            "health-badge",

          name:
            "นักสู้สุขภาพ BADGE",

          type:
            "BADGE",

          value:
            1,

          claimed:
            false
        }

      ]

    });

  }
);

/* =========================================================
   RANKING
   ========================================================= */

app.get(
  "/api/ranking",
  (req, res) => {

    const lineUserId =
      requireLineUser(req, res);

    if (!lineUserId) return;

    const member =
      getMember(lineUserId);

    if (!member) {

      return res.status(404).json({

        ok: false,

        error:
          "Member not found"

      });

    }

    /*
      Phase 1:
      Ranking จากสมาชิกที่อยู่ใน Memory
    */

    const ranking =
      Array.from(
        members.values()
      )
      .sort(
        (a, b) =>
          b.points -
          a.points
      )
      .map(
        (item, index) => ({

          rank:
            index + 1,

          name:
            item.displayName,

          points:
            item.points

        })
      );

    const myRankIndex =
      ranking.findIndex(
        item =>
          members.get(
            lineUserId
          ) &&
          item.name ===
          member.displayName
      );

    res.json({

      ok: true,

      myRank:
        myRankIndex >= 0
          ? myRankIndex + 1
          : null,

      totalMembers:
        ranking.length,

      ranking

    });

  }
);

/* =========================================================
   404
   ========================================================= */

app.use(
  (req, res) => {

    res.status(404).json({

      ok: false,

      error:
        "API endpoint not found",

      path:
        req.originalUrl

    });

  }
);

/* =========================================================
   ERROR HANDLER
   ========================================================= */

app.use(
  (
    err,
    req,
    res,
    next
  ) => {

    console.error(
      "SERVER ERROR:",
      err
    );

    res.status(500).json({

      ok: false,

      error:
        "Internal server error"

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
      "===================================="
    );

    console.log(
      "ROCK YOUR BODY 2026 API"
    );

    console.log(
      `Running on port ${PORT}`
    );

    console.log(
      `Frontend: ${FRONTEND_URL}`
    );

    console.log(
      "===================================="

    );

  }
);
