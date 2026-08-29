"use strict";

/* ============================================================
   ROCK YOUR BODY 2026
   CENTRAL APP CONFIG
   Supabase Edge Functions ONLY

   Version: 2026-08-29-STEP3
============================================================ */

window.APP_CONFIG = {

  APP_NAME:
    "ROCK YOUR BODY 2026",

  VERSION:
    "2026-08-29-STEP3",


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

     หมายเหตุ:
     DAILY HEALTH + WEIGHT
     รวมเข้า PLAYER แล้ว
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

    ADMIN:
      "./admin.html"

  },


  /* ==========================================================
     DAILY MISSION ROUTES
  ========================================================== */

  MISSION_ROUTE: {

    MOVE_MORE:
      "./mission.html?category=daily&mission=daily_move_more",

    EXERCISE:
      "./mission.html?category=daily&mission=daily_exercise_30",

    EAT_SMART:
      "./nutrition.html?from=mission&mission=daily_eat_smart",

    SLEEP:
      "./mission.html?category=daily&mission=daily_sleep"

  },


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
     GAME SETTINGS
  ========================================================== */

  MAX_ENERGY:
    200,

  EXP_PER_LEVEL:
    500,

  REFRESH_MS:
    30000,


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
   APP_CONFIG.getApi("PLAYER")
   APP_CONFIG.getApi("player")
============================================================ */

window.APP_CONFIG.getApi =
  function getApi(name) {

    const key =
      String(
        name || ""
      )
        .trim()
        .toUpperCase();

    const url =
      window.APP_CONFIG
        ?.API
        ?.[key];

    if (!url) {

      throw new Error(
        "ไม่พบ API configuration: " +
        key
      );

    }

    return url;

  };


/* ============================================================
   GET PAGE

   ตัวอย่าง:
   APP_CONFIG.getPage("HOME")
============================================================ */

window.APP_CONFIG.getPage =
  function getPage(name) {

    const key =
      String(
        name || ""
      )
        .trim()
        .toUpperCase();

    return (
      window.APP_CONFIG
        ?.PAGE
        ?.[key]
      ||
      window.APP_CONFIG.PAGE.HOME
    );

  };


/* ============================================================
   GET MISSION ROUTE
============================================================ */

window.APP_CONFIG.getMissionRoute =
  function getMissionRoute(name) {

    const key =
      String(
        name || ""
      )
        .trim()
        .toUpperCase();

    return (
      window.APP_CONFIG
        ?.MISSION_ROUTE
        ?.[key]
      ||
      window.APP_CONFIG.PAGE.MISSION
    );

  };


/* ============================================================
   COMPATIBILITY ALIAS

   รองรับไฟล์เดิมที่อาจเรียก APP_CONFIG.PAGES
============================================================ */

window.APP_CONFIG.PAGES =
  window.APP_CONFIG.PAGE;
