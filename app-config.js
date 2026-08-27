/* =========================================================
   ROCK YOUR BODY 2026
   APP CONFIG
   ========================================================= */

window.ROCK_CONFIG = {

  APP_NAME: "ROCK YOUR BODY 2026",

  /* =======================================================
     BACKEND
     ======================================================= */

  API_BASE:
    window.ROCK_API_BASE ||
    "https://rock-your-body-2026.onrender.com",


  /* =======================================================
     LINE LIFF
     ======================================================= */

  /*
    ใส่ LIFF ID จริงของ ROCK YOUR BODY

    ตัวอย่าง:
    "2001234567-AbCdEfGh"

    ห้ามใส่ URL
    ห้ามใส่ https://
  */

  LIFF_ID:
    window.ROCK_LIFF_ID ||
    "ใส่_LIFF_ID_จริงตรงนี้",


  /* =======================================================
     FRONTEND
     ======================================================= */

  FRONTEND_URL:
    "https://rock-your-body.github.io/rock-your-body-2026/",


  /* =======================================================
     GAME SETTINGS
     ======================================================= */

  MAX_ENERGY: 200,

  DEFAULT_TEAM: "HERO ROCK",

  DEFAULT_LEVEL: 1,

  DEFAULT_EXP: 0,

  DEFAULT_MAX_EXP: 1000,


  /* =======================================================
     PAGES
     ======================================================= */

  PAGES: {

    home:
      "./HOME.html",

    mission:
      "./mission.html",

    battle:
      "./battle.html",

    reward:
      "./reward.html",

    ranking:
      "./ranking.html",

    info:
      "./info.html",

    dashboard:
      "./dashboard.html",

    food:
      "./food-log.html"

  },


  /* =======================================================
     STORAGE
     ======================================================= */

  STORAGE: {

    LINE_USER_ID:
      "rock_line_user_id",

    USER:
      "rock_user",

    LINE_PROFILE:
      "rock_line_profile",

    ENERGY:
      "rock_energy",

    COIN:
      "rock_coin",

    POINTS:
      "rock_points"

  }

};


console.log(
  "ROCK YOUR BODY CONFIG READY",
  window.ROCK_CONFIG
);
