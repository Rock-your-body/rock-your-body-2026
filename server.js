/* =========================================================
   ROCK YOUR BODY 2026
   BACKEND API
   server.js
   ========================================================= */

"use strict";

const express = require("express");
const cors = require("cors");

const app = express();

/* =========================================================
   CONFIG
========================================================= */

const PORT =
  process.env.PORT || 3000;

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "https://rock-your-body.github.io";

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true
  })
);

app.use(
  express.json({
    limit: "2mb"
  })
);


/* =========================================================
   DATABASE
   TEMPORARY MEMORY DATABASE

   ภายหลังสามารถเปลี่ยนส่วนนี้เป็น
   PostgreSQL / Supabase / MongoDB ได้
========================================================= */

const players = new Map();


/* =========================================================
   DEMO PLAYER
========================================================= */

const demoPlayer = {

  lineUserId:
    "demo-user",

  displayName:
    "สมาชิก ROCK YOUR BODY",

  pictureUrl:
    "",

  rockCoin:
    1250,

  energy:
    150,

  maxEnergy:
    200,

  points:
    4560,

  rank:
    12,

  weight: {
    start: 80.0,
    current: 78.5,
    target: 72.0
  },

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

  healthScore:
    85,

  inbodyScore:
    72,

  program: {
    currentDay: 45,
    totalDays: 90
  },

  missions: {
    completed: []
  }

};


players.set(
  demoPlayer.lineUserId,
  demoPlayer
);


/* =========================================================
   HELPERS
========================================================= */

function getLineUserId(req) {

  return (
    req.headers["x-line-user-id"] ||
    req.headers["x-line-userid"] ||
    req.headers["x-line-user"] ||
    "demo-user"
  );

}


function getPlayer(req) {

  const lineUserId =
    getLineUserId(req);

  let player =
    players.get(lineUserId);


  /*
    ถ้ายังไม่มีสมาชิก
    สร้าง Player ใหม่อัตโนมัติ
  */

  if (!player) {

    player = {

      ...demoPlayer,

      lineUserId,

      displayName:
        "สมาชิก ROCK YOUR BODY",

      pictureUrl:
        "",

      missions: {
        completed: []
      }

    };

    players.set(
      lineUserId,
      player
    );

  }


  return player;

}


function number(value) {

  const n =
    Number(value);

  if (
    !Number.isFinite(n)
  ) {

    return 0;

  }

  return n;

}


/* =========================================================
   ROOT
========================================================= */

app.get("/", (req, res) => {

  res.json({

    ok: true,

    service:
      "ROCK YOUR BODY 2026 API",

    version:
      "2.0.0"

  });

});


/* =========================================================
   HEALTH
========================================================= */

app.get(
  "/api/health",
  (req, res) => {

    res.json({

      ok: true,

      service:
        "ROCK YOUR BODY 2026 API",

      version:
        "2.0.0",

      time:
        new Date().toISOString()

    });

  }
);


/* =========================================================
   CURRENT USER
========================================================= */

app.get(
  "/api/me",
  (req, res) => {

    const player =
      getPlayer(req);


    res.json({

      ok: true,

      user: {

        lineUserId:
          player.lineUserId,

        displayName:
          player.displayName,

        name:
          player.displayName,

        pictureUrl:
          player.pictureUrl,

        rockCoin:
          player.rockCoin,

        energy:
          player.energy,

        maxEnergy:
          player.maxEnergy,

        points:
          player.points,

        rank:
          player.rank,

        weight:
          player.weight.current,

        targetWeight:
          player.weight.target,

        startWeight:
          player.weight.start,

        steps:
          player.steps.current,

        targetSteps:
          player.steps.target,

        calories:
          player.calories.current,

        targetCalories:
          player.calories.target,

        sleep:
          player.sleep.current,

        targetSleep:
          player.sleep.target,

        healthScore:
          player.healthScore,

        inbodyScore:
          player.inbodyScore,

        programDay:
          player.program.currentDay,

        programTotalDays:
          player.program.totalDays

      }

    });

  }
);


/* =========================================================
   PROFILE
========================================================= */

app.get(
  "/api/profile",
  (req, res) => {

    const player =
      getPlayer(req);


    res.json({

      ok: true,

      profile: {

        lineUserId:
          player.lineUserId,

        displayName:
          player.displayName,

        pictureUrl:
          player.pictureUrl

      }

    });

  }
);


/* =========================================================
   DASHBOARD
========================================================= */

app.get(
  "/api/dashboard",
  (req, res) => {

    const player =
      getPlayer(req);


    res.json({

      ok: true,

      dashboard: {

        player: {

          lineUserId:
            player.lineUserId,

          displayName:
            player.displayName,

          pictureUrl:
            player.pictureUrl

        },

        steps: {

          current:
            player.steps.current,

          target:
            player.steps.target

        },

        calories: {

          current:
            player.calories.current,

          target:
            player.calories.target

        },

        sleep: {

          current:
            player.sleep.current,

          target:
            player.sleep.target

        },

        healthScore:
          player.healthScore,

        weight: {

          start:
            player.weight.start,

          current:
            player.weight.current,

          target:
            player.weight.target

        },

        inbody: {

          score:
            player.inbodyScore

        },

        program: {

          currentDay:
            player.program.currentDay,

          totalDays:
            player.program.totalDays

        },

        rockCoin:
          player.rockCoin,

        energy:
          player.energy,

        maxEnergy:
          player.maxEnergy,

        points:
          player.points,

        rank:
          player.rank

      }

    });

  }
);


/* =========================================================
   PROGRESS
========================================================= */

app.get(
  "/api/progress",
  (req, res) => {

    const player =
      getPlayer(req);


    const weightStart =
      number(
        player.weight.start
      );

    const weightCurrent =
      number(
        player.weight.current
      );

    const weightTarget =
      number(
        player.weight.target
      );


    const weightLost =
      Math.max(
        0,
        weightStart -
        weightCurrent
      );


    const weightGoal =
      weightStart -
      weightTarget;


    const weightProgress =
      weightGoal > 0
        ? Math.min(
            100,
            Math.max(
              0,
              (
                weightLost /
                weightGoal
              ) *
              100
            )
          )
        : 0;


    const programProgress =
      player.program.totalDays > 0
        ? Math.min(
            100,
            Math.max(
              0,
              (
                player.program.currentDay /
                player.program.totalDays
              ) *
              100
            )
          )
        : 0;


    res.json({

      ok: true,

      progress: {

        program: {

          currentDay:
            player.program.currentDay,

          totalDays:
            player.program.totalDays,

          percent:
            Math.round(
              programProgress
            )

        },

        weight: {

          start:
            weightStart,

          current:
            weightCurrent,

          target:
            weightTarget,

          lost:
            weightLost,

          percent:
            Math.round(
              weightProgress
            )

        },

        health: {

          score:
            player.healthScore,

          inbodyScore:
            player.inbodyScore

        },

        activity: {

          steps:
            player.steps.current,

          targetSteps:
            player.steps.target,

          calories:
            player.calories.current,

          targetCalories:
            player.calories.target,

          sleep:
            player.sleep.current,

          targetSleep:
            player.sleep.target

        }

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

    const player =
      getPlayer(req);


    const completed =
      player.missions.completed;


    const missions = {

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
            completed.includes(
              "daily-step"
            )

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
            completed.includes(
              "daily-water"
            )

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
            completed.includes(
              "weekly-exercise"
            )

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
            completed.includes(
              "monthly-health"
            )

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
            completed.includes(
              "bonus-checkup"
            )

        }

      ]

    };


    res.json({

      ok: true,

      missions

    });

  }
);


/* =========================================================
   COMPLETE MISSION
========================================================= */

app.post(
  "/api/missions/:missionId/complete",
  (req, res) => {

    const player =
      getPlayer(req);

    const missionId =
      req.params.missionId;


    if (
      !player.missions.completed.includes(
        missionId
      )
    ) {

      player.missions.completed.push(
        missionId
      );

      player.rockCoin += 100;

      player.energy =
        Math.min(
          player.maxEnergy,
          player.energy + 10
        );

      player.points += 100;

    }


    res.json({

      ok: true,

      message:
        "Mission completed",

      missionId,

      reward: {

        rockCoin:
          100,

        energy:
          10,

        points:
          100

      },

      user: {

        rockCoin:
          player.rockCoin,

        energy:
          player.energy,

        points:
          player.points

      }

    });

  }
);


/* =========================================================
   BATTLE
========================================================= */

let monster = {

  id:
    "sugar-monster",

  name:
    "SUGAR MONSTER",

  hp:
    68500,

  maxHp:
    100000

};


app.get(
  "/api/battle",
  (req, res) => {

    const player =
      getPlayer(req);


    const percent =
      monster.maxHp > 0
        ? Math.round(
            (
              monster.hp /
              monster.maxHp
            ) *
            100
          )
        : 0;


    res.json({

      ok: true,

      battle: {

        monster: {

          id:
            monster.id,

          name:
            monster.name,

          hp:
            monster.hp,

          maxHp:
            monster.maxHp,

          percent

        },

        user: {

          energy:
            player.energy,

          maxEnergy:
            player.maxEnergy

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

    const player =
      getPlayer(req);


    const energyUsed =
      10;

    const damage =
      500;


    if (
      player.energy <
      energyUsed
    ) {

      return res.status(400).json({

        ok: false,

        error:
          "Energy ไม่เพียงพอ"

      });

    }


    player.energy -=
      energyUsed;


    monster.hp =
      Math.max(
        0,
        monster.hp -
        damage
      );


    player.rockCoin +=
      50;

    player.points +=
      100;


    res.json({

      ok: true,

      result: {

        damage,

        energyUsed,

        remainingEnergy:
          player.energy,

        monsterHp:
          monster.hp,

        reward: {

          rockCoin:
            50,

          points:
            100

        }

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

    const player =
      getPlayer(req);


    res.json({

      ok: true,

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

      ],

      user: {

        rockCoin:
          player.rockCoin,

        energy:
          player.energy,

        points:
          player.points

      }

    });

  }
);


/* =========================================================
   CLAIM REWARD
========================================================= */

app.post(
  "/api/rewards/:rewardId/claim",
  (req, res) => {

    const player =
      getPlayer(req);

    const rewardId =
      req.params.rewardId;


    let reward = {

      rockCoin:
        0,

      energy:
        0,

      points:
        0

    };


    if (
      rewardId ===
      "coin-1000"
    ) {

      reward.rockCoin =
        1000;

    }


    else if (
      rewardId ===
      "energy-10"
    ) {

      reward.energy =
        10;

    }


    else if (
      rewardId ===
      "health-badge"
    ) {

      reward.points =
        100;

    }


    else {

      return res.status(404).json({

        ok: false,

        error:
          "Reward not found"

      });

    }


    player.rockCoin +=
      reward.rockCoin;


    player.energy =
      Math.min(
        player.maxEnergy,
        player.energy +
        reward.energy
      );


    player.points +=
      reward.points;


    res.json({

      ok: true,

      rewardId,

      reward,

      user: {

        rockCoin:
          player.rockCoin,

        energy:
          player.energy,

        points:
          player.points

      }

    });

  }
);


/* =========================================================
   RANKING
========================================================= */

function getRankingData() {

  return Array
    .from(
      players.values()
    )
    .sort(
      (a, b) =>
        b.points -
        a.points
    )
    .map(
      (player, index) => ({

        rank:
          index + 1,

        lineUserId:
          player.lineUserId,

        name:
          player.displayName,

        pictureUrl:
          player.pictureUrl,

        points:
          player.points

      })
    );

}


app.get(
  "/api/ranking",
  (req, res) => {

    const player =
      getPlayer(req);


    const ranking =
      getRankingData();


    const myRankIndex =
      ranking.findIndex(
        item =>
          item.lineUserId ===
          player.lineUserId
      );


    const myRank =
      myRankIndex >= 0
        ? myRankIndex + 1
        : null;


    res.json({

      ok: true,

      myRank,

      totalMembers:
        ranking.length,

      ranking

    });

  }
);


/* =========================================================
   UPDATE PLAYER
   สำหรับทดสอบ / เชื่อมข้อมูลจริงภายหลัง
========================================================= */

app.patch(
  "/api/me",
  (req, res) => {

    const player =
      getPlayer(req);

    const body =
      req.body || {};


    if (
      typeof body.displayName ===
      "string"
    ) {

      player.displayName =
        body.displayName;

    }


    if (
      typeof body.pictureUrl ===
      "string"
    ) {

      player.pictureUrl =
        body.pictureUrl;

    }


    if (
      body.weight
    ) {

      if (
        body.weight.start !==
        undefined
      ) {

        player.weight.start =
          number(
            body.weight.start
          );

      }


      if (
        body.weight.current !==
        undefined
      ) {

        player.weight.current =
          number(
            body.weight.current
          );

      }


      if (
        body.weight.target !==
        undefined
      ) {

        player.weight.target =
          number(
            body.weight.target
          );

      }

    }


    if (
      body.steps
    ) {

      if (
        body.steps.current !==
        undefined
      ) {

        player.steps.current =
          number(
            body.steps.current
          );

      }

    }


    if (
      body.calories
    ) {

      if (
        body.calories.current !==
        undefined
      ) {

        player.calories.current =
          number(
            body.calories.current
          );

      }

    }


    if (
      body.sleep
    ) {

      if (
        body.sleep.current !==
        undefined
      ) {

        player.sleep.current =
          number(
            body.sleep.current
          );

      }

    }


    if (
      body.healthScore !==
      undefined
    ) {

      player.healthScore =
        number(
          body.healthScore
        );

    }


    if (
      body.inbodyScore !==
      undefined
    ) {

      player.inbodyScore =
        number(
          body.inbodyScore
        );

    }


    res.json({

      ok: true,

      message:
        "Player updated",

      user:
        player

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
      "ROCK SERVER ERROR:",
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
   START SERVER
========================================================= */

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      "=========================================="
    );

    console.log(
      "ROCK YOUR BODY 2026 API"
    );

    console.log(
      `PORT: ${PORT}`
    );

    console.log(
      `FRONTEND: ${FRONTEND_URL}`
    );

    console.log(
      "=========================================="
    );

  }
);
