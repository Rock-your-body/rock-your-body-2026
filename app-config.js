/* =========================================================
   ROCK YOUR BODY 2026
   APP CONFIG
   Version: 2026-08-28-FINAL
   ========================================================= */

window.APP_CONFIG = {

  /* -------------------------------------------------------
     APP
  ------------------------------------------------------- */

  APP_NAME: "ROCK YOUR BODY 2026",

  VERSION: "2026-08-28-FINAL",


  /* -------------------------------------------------------
     LINE LIFF
  ------------------------------------------------------- */

  LIFF_ID: "2011201679-uNWz5yqF",


  /* -------------------------------------------------------
     API
  ------------------------------------------------------- */

  API: {

    DASHBOARD:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/player-dashboard",

    MISSION:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/mission",

    BATTLE:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/battle"

  },


  /* -------------------------------------------------------
     PAGES
     HOME.html = หน้าหลักตัวจริง
  ------------------------------------------------------- */

  PAGE: {

    HOME:
      "./HOME.html",

    MISSION:
      "./mission.html",

    BATTLE:
      "./battle.html",

    WEIGHT:
      "./weight-check.html",

    PROGRESS:
      "./progress.html",

    REWARDS:
      "./rewards.html",

    RANKING:
      "./ranking.html"

  },


  /* -------------------------------------------------------
     GAME
  ------------------------------------------------------- */

  MAX_ENERGY: 200,

  EXP_PER_LEVEL: 500,


  /* -------------------------------------------------------
     REFRESH
  ------------------------------------------------------- */

  REFRESH_MS: 30000

};


/* =========================================================
   BACKWARD COMPATIBILITY
   รองรับโค้ดเก่าที่เรียก ROCK_CONFIG
   ========================================================= */

window.ROCK_CONFIG = {

  APP_NAME:
    window.APP_CONFIG.APP_NAME,

  VERSION:
    window.APP_CONFIG.VERSION,

  LIFF_ID:
    window.APP_CONFIG.LIFF_ID,

  API_BASE:
    "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1",

  API:
    window.APP_CONFIG.API,

  FRONTEND_URL:
    "https://rock-your-body.github.io/rock-your-body-2026/",

  MAX_ENERGY:
    window.APP_CONFIG.MAX_ENERGY,

  EXP_PER_LEVEL:
    window.APP_CONFIG.EXP_PER_LEVEL,

  REFRESH_MS:
    window.APP_CONFIG.REFRESH_MS,

  PAGES: {

    home:
      window.APP_CONFIG.PAGE.HOME,

    mission:
      window.APP_CONFIG.PAGE.MISSION,

    battle:
      window.APP_CONFIG.PAGE.BATTLE,

    weight:
      window.APP_CONFIG.PAGE.WEIGHT,

    progress:
      window.APP_CONFIG.PAGE.PROGRESS,

    reward:
      window.APP_CONFIG.PAGE.REWARDS,

    ranking:
      window.APP_CONFIG.PAGE.RANKING

  },

  STORAGE: {

    LINE_USER_ID:
      "rock_line_user_id",

    LINE_PROFILE:
      "rock_line_profile",

    USER:
      "rock_user"

  }

};


/* =========================================================
   SAFETY CHECK
   ========================================================= */

console.log(
  "================================="
);

console.log(
  "ROCK YOUR BODY 2026"
);

console.log(
  "APP CONFIG READY"
);

console.log(
  "LIFF_ID:",
  window.APP_CONFIG.LIFF_ID
);

console.log(
  "DASHBOARD API:",
  window.APP_CONFIG.API.DASHBOARD
);

console.log(
  "HOME:",
  window.APP_CONFIG.PAGE.HOME
);

console.log(
  "ROCK_CONFIG:",
  window.ROCK_CONFIG
);

console.log(
  "================================="
);
