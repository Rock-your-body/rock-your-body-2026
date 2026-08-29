"use strict";

window.APP_CONFIG = {

  APP_NAME:
    "ROCK YOUR BODY 2026",

  VERSION:
    "2026-08-29-render-v1",


  /* =========================================================
     LINE LIFF
  ========================================================= */

  LIFF_ID:
    "2011201679-uNWz5yqF",

  LIFF_URL:
    "https://liff.line.me/2011201679-uNWz5yqF",


  /* =========================================================
     FRONTEND
  ========================================================= */

  FRONTEND_URL:
    "https://rock-your-body.github.io/rock-your-body-2026",


  /* =========================================================
     RENDER BACKEND

     ใส่ URL จริงของ Render ตรงนี้
     ห้ามมี / ปิดท้าย
  ========================================================= */

  API_BASE:
    "https://YOUR-RENDER-SERVICE.onrender.com",


  /* =========================================================
     API
  ========================================================= */

  API: {

    HEALTH:
      "/api/health",

    ME:
      "/api/me",

    PLAYER:
      "/api/player",

    MISSION:
      "/api/mission",

    BATTLE:
      "/api/battle"

  },


  /* =========================================================
     PAGES
  ========================================================= */

  PAGE: {

    HOME:
      "./dashboard.html",

    MISSION:
      "./mission.html",

    BATTLE:
      "./battle.html",

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
      "./nutrition.html"
  },


  /* =========================================================
     GAME SETTINGS
  ========================================================= */

  MAX_ENERGY:
    200,

  EXP_PER_LEVEL:
    500,

  REFRESH_MS:
    30000,


  /* =========================================================
     DAILY GOALS
  ========================================================= */

  DAILY_GOALS: {

    STEPS:
      8000,

    CALORIES:
      300,

    SLEEP_MINUTES:
      420
  }

};


/* =========================================================
   BUILD FULL API URL

   ตัวอย่าง:
   APP_CONFIG.apiUrl("PLAYER")
   =>
   https://xxxx.onrender.com/api/player
========================================================= */

window.APP_CONFIG.apiUrl =
  function(name){

    const base =
      String(
        window.APP_CONFIG.API_BASE ||
        ""
      )
      .replace(/\/+$/,"");

    const path =
      window.APP_CONFIG.API?.[name];

    if(!base){
      throw new Error(
        "ยังไม่ได้ตั้ง APP_CONFIG.API_BASE"
      );
    }

    if(!path){
      throw new Error(
        `ไม่พบ API.${name}`
      );
    }

    return (
      base +
      (
        String(path).startsWith("/")
          ? path
          : "/" + path
      )
    );
  };
