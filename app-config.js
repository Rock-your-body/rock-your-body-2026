/* =========================================================
   ROCK YOUR BODY 2026
   APP CONFIG
   Version: 2026-08-27-FINAL
   ========================================================= */

window.APP_CONFIG = {

  /* -------------------------------------------------------
     APP
  ------------------------------------------------------- */

  APP_NAME:
    "ROCK YOUR BODY 2026",

  VERSION:
    "2026-08-27-FINAL",


  /* -------------------------------------------------------
     LINE LIFF
  ------------------------------------------------------- */

  LIFF_ID:
    "2011201679-uNWz5yqF",


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
  ------------------------------------------------------- */

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

    REWARDS:
      "./rewards.html",

    RANKING:
      "./ranking.html"

  },


  /* -------------------------------------------------------
     GAME
  ------------------------------------------------------- */

  MAX_ENERGY:
    200,

  EXP_PER_LEVEL:
    500,


  /* -------------------------------------------------------
     REFRESH
  ------------------------------------------------------- */

  REFRESH_MS:
    30000

};


/* =========================================================
   SAFETY CHECK
   ========================================================= */

console.log(
  "================================="
);

console.log(
  "ROCK APP CONFIG READY"
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
  "================================="
);
