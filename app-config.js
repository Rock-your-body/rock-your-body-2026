"use strict";

/* ============================================================
   ROCK YOUR BODY 2026
   CENTRAL APP CONFIG
   VERSION: 2026-08-31-BATTLE-V7.3
   Supabase Edge Functions ONLY
============================================================ */

window.APP_CONFIG = {

  /* ==========================================================
     APP
  ========================================================== */

  APP_NAME: "ROCK YOUR BODY 2026",

  VERSION: "2026-08-31-BATTLE-V7.3",


  /* ==========================================================
     LINE LIFF
  ========================================================== */

  LIFF_ID:
    "2011201679-uNWz5yqF",

  LIFF_URL:
    "https://liff.line.me/2011201679-uNWz5yqF",


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
     PAGE ROUTES
  ========================================================== */

  PAGE: {

    HOME:
      "./dashboard.html",

    MISSION:
      "./mission.html",

    /* ---------------- BATTLE ---------------- */

    BATTLE:
      "./battle.html",

    BATTLE_MAP:
      "./battle_map.html",

    BATTLE_STAGE:
      "./battle_stage.html",

    /* ---------------------------------------- */

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
     BATTLE CONFIG
  ========================================================== */

  BATTLE: {

    PAGE:
      "./battle.html",

    MAP:
      "./battle_map.html",

    STAGE:
      "./battle_stage.html",

    MAP_IMAGE:
      "./battle map.jpeg",

    PLAYER_IMAGE:
      "./battle-player.png",

    MAX_STAGE: 10,

    MAX_ENERGY: 200

  },


  /* ==========================================================
     GAME
  ========================================================== */

  MAX_ENERGY: 200,

  EXP_PER_LEVEL: 500,

  REFRESH_MS: 30000,


  /* ==========================================================
     DAILY GOALS
  ========================================================== */

  DAILY_GOALS: {

    STEPS: 8000,

    CALORIES: 300,

    SLEEP_MINUTES: 420

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

  }

};


/* ============================================================
   GET API

   ตัวอย่าง:
   APP_CONFIG.getApi("BATTLE")
============================================================ */

window.APP_CONFIG.getApi = function(name) {

  const key =
    String(name || "")
      .trim()
      .toUpperCase();

  const url =
    window.APP_CONFIG.API?.[key];

  if (!url) {

    throw new Error(
      "ไม่พบ API configuration: " + key
    );

  }

  return url;

};


/* ============================================================
   GET PAGE

   ตัวอย่าง:
   APP_CONFIG.getPage("BATTLE_MAP")
============================================================ */

window.APP_CONFIG.getPage = function(name) {

  const key =
    String(name || "")
      .trim()
      .toUpperCase();

  const page =
    window.APP_CONFIG.PAGE?.[key];

  if (page) {
    return page;
  }

  return window.APP_CONFIG.PAGE.HOME;

};


/* ============================================================
   GET ABSOLUTE PAGE URL

   ตัวอย่าง:
   APP_CONFIG.getPageUrl("BATTLE_MAP")

   ผลลัพธ์:
   https://rock-your-body.github.io/
   rock-your-body-2026/battle_map.html
============================================================ */

window.APP_CONFIG.getPageUrl = function(name) {

  const page =
    window.APP_CONFIG.getPage(name);

  const base =
    String(window.APP_CONFIG.FRONTEND_URL || "")
      .replace(/\/+$/, "");

  const path =
    String(page || "")
      .replace(/^\.\//, "")
      .replace(/^\/+/, "");

  return base + "/" + path;

};


/* ============================================================
   GET MISSION ROUTE
============================================================ */

window.APP_CONFIG.getMissionRoute = function(name) {

  const key =
    String(name || "")
      .trim()
      .toUpperCase();

  return (
    window.APP_CONFIG.MISSION_ROUTE?.[key]
    ||
    window.APP_CONFIG.PAGE.MISSION
  );

};


/* ============================================================
   GO PAGE

   ตัวอย่าง:
   APP_CONFIG.go("BATTLE_MAP")
============================================================ */

window.APP_CONFIG.go = function(name) {

  const page =
    window.APP_CONFIG.getPage(name);

  window.location.href = page;

};


/* ============================================================
   BATTLE HELPERS
============================================================ */


/* ---------------- GO BATTLE ---------------- */

window.APP_CONFIG.goBattle = function() {

  window.location.href =
    window.APP_CONFIG.PAGE.BATTLE;

};


/* ---------------- GO BATTLE MAP ---------------- */

window.APP_CONFIG.goBattleMap = function() {

  window.location.href =
    window.APP_CONFIG.PAGE.BATTLE_MAP;

};


/* ---------------- GO BATTLE STAGE ---------------- */

/*
   ตัวอย่าง:

   APP_CONFIG.goBattleStage(1)

   จะเปิด:

   battle_stage.html?stage=1
*/

window.APP_CONFIG.goBattleStage = function(stage) {

  let stageNo =
    Number(stage || 1);

  if (!Number.isFinite(stageNo)) {
    stageNo = 1;
  }

  stageNo =
    Math.max(
      1,
      Math.min(
        window.APP_CONFIG.BATTLE.MAX_STAGE,
        Math.floor(stageNo)
      )
    );

  window.location.href =
    window.APP_CONFIG.PAGE.BATTLE_STAGE +
    "?stage=" +
    encodeURIComponent(stageNo);

};


/* ============================================================
   MONSTER IMAGE
============================================================ */

/*
   ตัวอย่าง:

   APP_CONFIG.getMonsterImage(1)

   =
   ./battle-monster-stage-001-germ.png
*/

window.APP_CONFIG.getMonsterImage = function(stage) {

  const stageNo =
    Number(stage || 1);

  const monsters = {

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

  };

  return (
    monsters[stageNo]
    ||
    monsters[1]
  );

};


/* ============================================================
   MONSTER NAME
============================================================ */

window.APP_CONFIG.getMonsterName = function(stage) {

  const stageNo =
    Number(stage || 1);

  const names = {

    1:
      "เจ้าจอมเอื่อย",

    2:
      "จอมหวาน",

    3:
      "ปีศาจของทอด",

    4:
      "จอมเค็ม",

    5:
      "ราชาอาหารไร้ประโยชน์",

    6:
      "ปีศาจพักผ่อนน้อย",

    7:
      "จอมเนือยนิ่ง",

    8:
      "ปีศาจพฤติกรรมเสี่ยง",

    9:
      "ราชาความเสี่ยงสุขภาพ",

    10:
      "จอมมาร Final Boss"

  };

  return (
    names[stageNo]
    ||
    "MONSTER"
  );

};


/* ============================================================
   LEGACY COMPATIBILITY

   รองรับหน้าเก่าที่ยังใช้:

   APP_CONFIG.PAGES
============================================================ */

window.APP_CONFIG.PAGES =
  window.APP_CONFIG.PAGE;


/* ============================================================
   READY
============================================================ */

console.log(
  "[APP_CONFIG]",
  window.APP_CONFIG.VERSION,
  "READY"
);
