/* =========================================================
   ROCK YOUR BODY 2026
   APP-CONFIG.JS
   Version: 2026-08-25
========================================================= */

window.APP_CONFIG = {

  /* =======================================================
     LIFF
  ======================================================= */

  LIFF_ID:
    "2011201679-uNWz5yqF",

  LIFF_URL:
    "https://liff.line.me/2011201679-uNWz5yqF",

  ENDPOINT_URL:
    "https://rock-your-body.github.io/rock-your-body-2026/",


  /* =======================================================
     API
  ======================================================= */

  API: {

    DASHBOARD:
      "",

  },


  /* =======================================================
     PAGE
  ======================================================= */

  PAGE: {

    HOME:
      "./dashboard.html",

    WEIGHT:
      "./weight-check.html",

    PROGRESS:
      "./progress.html",

    RANKING:
      "./ranking.html",

    REWARDS:
      "./rewards.html",

    MISSION:
      "./mission.html",

    BATTLE:
      "./battle.html"

  },


  /* =======================================================
     GAME
  ======================================================= */

  MAX_ENERGY:
    200,

  EXP_PER_LEVEL:
    500,


  /* =======================================================
     REFRESH
  ======================================================= */

  REFRESH_MS:
    30000

};


console.log(
  "================================="
);

console.log(
  "ROCK APP CONFIG LOADED"
);

console.log(
  "LIFF ID:",
  window.APP_CONFIG.LIFF_ID
);

console.log(
  "LIFF URL:",
  window.APP_CONFIG.LIFF_URL
);

console.log(
  "ENDPOINT:",
  window.APP_CONFIG.ENDPOINT_URL
);

console.log(
  "================================="
);
