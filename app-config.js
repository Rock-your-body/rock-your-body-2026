"use strict";

/* ============================================================
   ROCK YOUR BODY 2026
   APP CONFIG
   VERSION: 2026-08-31-BATTLE-STAGE-V7
============================================================ */

window.APP_CONFIG = {

  /* ==========================================================
     APP
  ========================================================== */

  APP_NAME:
    "ROCK YOUR BODY 2026",

  VERSION:
    "2026-08-31-battle-stage-v7",


  /* ==========================================================
     FRONTEND
  ========================================================== */

  FRONTEND_URL:
    "https://rock-your-body.github.io/rock-your-body-2026",


  /* ==========================================================
     SUPABASE
  ========================================================== */

  SUPABASE_URL:
    "https://nztvqdzatdpauufpvdaa.supabase.co",


  /* ==========================================================
     EDGE FUNCTIONS
  ========================================================== */

  API: {

    PLAYER:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/player-dashboard",

    MISSION:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/mission",

    ADMIN:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/admin-api",

    BATTLE:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/battle",

    INBODY:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/inbody",

    NUTRITION:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/nutrition",

    PROJECT_SETTINGS:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/project-settings"

  },


  /* ==========================================================
     PAGES
  ========================================================== */

  PAGE: {

    HOME:
      "./dashboard.html",

    MISSION:
      "./mission.html",

    BATTLE:
      "./battle.html",

    /*
      Battle Map
      battle.html
          ↓
      battle_map.html
    */
    BATTLE_MAP:
      "./battle_map.html",

    /*
      Battle Stage

      ใช้หน้าเดียว
      แล้วรับ ?stage=1 ถึง ?stage=10

      ตัวอย่าง:
      battle_stage.html?stage=1
      battle_stage.html?stage=10
    */
    BATTLE_STAGE:
      "./battle_stage.html",

    WEIGHT:
      "./weight-check.html",

    PROGRESS:
      "./progress.html",

    RANKING:
      "./ranking.html",

    REWARDS:
      "./rewards.html",

    PROJECT_SETTINGS:
      "./project-settings.html",

    NUTRITION:
      "./nutrition.html",

    INBODY:
      "./inbody.html",

    ADMIN:
      "./admin.html"

  },


  /* ==========================================================
     MISSION ROUTES
  ========================================================== */

  MISSION_ROUTE: {

    MOVE_MORE:
      "./mission.html?category=daily&mission=daily_move_more",

    EAT_SMART:
      "./nutrition.html?from=mission&mission=daily_eat_smart",

    EXERCISE:
      "./mission.html?category=daily&mission=daily_exercise_30",

    SLEEP:
      "./mission.html?category=daily&mission=daily_sleep"

  },


  /* ==========================================================
     PLAYER
  ========================================================== */

  MAX_ENERGY:
    200,

  EXP_PER_LEVEL:
    500,

  REFRESH_MS:
    30000,


  /* ==========================================================
     DAILY GOALS
  ========================================================== */

  DAILY_GOALS: {

    STEPS:
      8000,

    CALORIES:
      300,

    SLEEP_MINUTES:
      420

  },


  /* ==========================================================
     STORAGE
  ========================================================== */

  STORAGE: {

    MISSION_EVIDENCE:
      "mission-evidence",

    INBODY_RESULTS:
      "inbody-results",

    NUTRITION_EVIDENCE:
      "nutrition-evidence",

    ROCK_ASSETS:
      "rock-assets"

  },


  /* ==========================================================
     BATTLE ASSETS
  ========================================================== */

  BATTLE_ASSET: {

    /*
      ตัวละครผู้เล่น
    */
    PLAYER:
      "./battle-player.png",


    /*
      Battle Map Background
    */
    MAP:
      "./battle%20map.jpeg",


    /*
      Battle Stage Template 01 - 10

      ตั้งชื่อไฟล์ใน GitHub ให้ตรงนี้
    */
    STAGE_TEMPLATE: {

      1:
        "./battle-stage-01.jpeg",

      2:
        "./battle-stage-02.jpeg",

      3:
        "./battle-stage-03.jpeg",

      4:
        "./battle-stage-04.jpeg",

      5:
        "./battle-stage-05.jpeg",

      6:
        "./battle-stage-06.jpeg",

      7:
        "./battle-stage-07.jpeg",

      8:
        "./battle-stage-08.jpeg",

      9:
        "./battle-stage-09.jpeg",

      10:
        "./battle-stage-10.jpeg"

    },


    /*
      Monster PNG
    */
    MONSTER: {

      1:
        "./battle-monster-stage-001-germ.png",

      2:
        "./battle-monster-stage-002-donut.png",

      3:
        "./battle-monster-stage-003-fries.png",

      4:
        "./battle-monster-stage-004-salt.png",

      5:
        "./battle-monster-stage-005-burger-king.png",

      6:
        "./battle-monster-stage-006-rest.png",

      7:
        "./battle-monster-stage-007-sedentary.png",

      8:
        "./battle-monster-stage-008-risk.png",

      9:
        "./battle-monster-stage-009-risk-king.png",

      10:
        "./battle-monster-stage-010-boss.png"

    }

  },


  /* ==========================================================
     BATTLE STAGES
  ========================================================== */

  BATTLE_STAGE: {

    1: {
      stage: 1,
      name: "เจ้าจอมเอื่อย",
      hp: 1200,
      attackCost: 10,
      expRequired: 0
    },

    2: {
      stage: 2,
      name: "จอมหวาน",
      hp: 2200,
      attackCost: 20,
      expRequired: 300
    },

    3: {
      stage: 3,
      name: "ปีศาจของทอด",
      hp: 3500,
      attackCost: 30,
      expRequired: 700
    },

    4: {
      stage: 4,
      name: "จอมเค็ม",
      hp: 5000,
      attackCost: 40,
      expRequired: 1200
    },

    5: {
      stage: 5,
      name: "ราชาอาหารไร้ประโยชน์",
      hp: 7000,
      attackCost: 50,
      expRequired: 1800
    },

    6: {
      stage: 6,
      name: "ปีศาจพักผ่อนน้อย",
      hp: 9500,
      attackCost: 60,
      expRequired: 2400
    },

    7: {
      stage: 7,
      name: "จอมเนือยนิ่ง",
      hp: 12500,
      attackCost: 70,
      expRequired: 3300
    },

    8: {
      stage: 8,
      name: "ปีศาจพฤติกรรมเสี่ยง",
      hp: 16000,
      attackCost: 80,
      expRequired: 4300
    },

    9: {
      stage: 9,
      name: "ราชาความเสี่ยงสุขภาพ",
      hp: 20000,
      attackCost: 90,
      expRequired: 5500
    },

    10: {
      stage: 10,
      name: "จอมมาร Final Boss",
      hp: 30000,
      attackCost: 100,
      expRequired: 7000
    }

  }

};


/* ============================================================
   COMPATIBILITY
============================================================ */

window.APP_CONFIG.PAGES =
  window.APP_CONFIG.PAGE;


/* ============================================================
   GET API
============================================================ */

window.APP_CONFIG.getApi =
  function(name){

    const key =
      String(
        name || ""
      )
      .trim()
      .toUpperCase();


    return (
      window.APP_CONFIG.API[key] ||
      ""
    );
  };


/* ============================================================
   GET PAGE
============================================================ */

window.APP_CONFIG.getPage =
  function(name){

    const key =
      String(
        name || ""
      )
      .trim()
      .toUpperCase();


    return (
      window.APP_CONFIG.PAGE[key] ||
      ""
    );
  };


/* ============================================================
   GET MISSION ROUTE
============================================================ */

window.APP_CONFIG.getMissionRoute =
  function(name){

    const key =
      String(
        name || ""
      )
      .trim()
      .toUpperCase();


    return (
      window.APP_CONFIG.MISSION_ROUTE[key] ||
      ""
    );
  };


/* ============================================================
   GET BATTLE STAGE
============================================================ */

window.APP_CONFIG.getBattleStage =
  function(stageNo){

    const stage =
      Math.max(
        1,
        Math.min(
          10,
          Number(stageNo) || 1
        )
      );


    return (
      window.APP_CONFIG.BATTLE_STAGE[stage] ||
      window.APP_CONFIG.BATTLE_STAGE[1]
    );
  };


/* ============================================================
   GET BATTLE STAGE TEMPLATE
============================================================ */

window.APP_CONFIG.getBattleStageTemplate =
  function(stageNo){

    const stage =
      Math.max(
        1,
        Math.min(
          10,
          Number(stageNo) || 1
        )
      );


    return (
      window.APP_CONFIG
        .BATTLE_ASSET
        .STAGE_TEMPLATE[stage] ||
      ""
    );
  };


/* ============================================================
   GET BATTLE MONSTER
============================================================ */

window.APP_CONFIG.getBattleMonster =
  function(stageNo){

    const stage =
      Math.max(
        1,
        Math.min(
          10,
          Number(stageNo) || 1
        )
      );


    return (
      window.APP_CONFIG
        .BATTLE_ASSET
        .MONSTER[stage] ||
      ""
    );
  };


/* ============================================================
   CREATE BATTLE STAGE URL
============================================================ */

window.APP_CONFIG.getBattleStageUrl =
  function(stageNo){

    const stage =
      Math.max(
        1,
        Math.min(
          10,
          Number(stageNo) || 1
        )
      );


    return (
      window.APP_CONFIG.PAGE.BATTLE_STAGE +
      "?stage=" +
      encodeURIComponent(stage)
    );
  };


/* ============================================================
   LOG
============================================================ */

console.log(
  `[${window.APP_CONFIG.APP_NAME}]`,
  window.APP_CONFIG.VERSION
);
