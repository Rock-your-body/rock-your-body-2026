"use strict";

/* ============================================================
   ROCK YOUR BODY 2026
   CENTRAL APP CONFIG
   Supabase Edge Functions ONLY
============================================================ */

window.APP_CONFIG = {

  APP_NAME: "ROCK YOUR BODY 2026",

  VERSION: "2026-08-29-clean-v2",

  /* ==========================================================
     LINE LIFF
  ========================================================== */

  LIFF_ID: "2011201679-uNWz5yqF",

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
     GAME SETTINGS
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
  }

};


/* ============================================================
   SIMPLE API GETTER

   ใช้:
   APP_CONFIG.getApi("PLAYER")
============================================================ */

window.APP_CONFIG.getApi = function(name){

  const url =
    window.APP_CONFIG.API?.[name];

  if(!url){

    throw new Error(
      "ไม่พบ API configuration: " + name
    );

  }

  return url;

};
