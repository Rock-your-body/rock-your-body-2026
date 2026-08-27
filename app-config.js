/* =========================================================
   ROCK YOUR BODY 2026
   APP CONFIG
   ========================================================= */

window.ROCK_CONFIG = {
  APP_NAME: "ROCK YOUR BODY 2026",

  // Backend API
  API_BASE:
    window.ROCK_API_BASE ||
    "https://rock-your-body-2026.onrender.com",

  // LINE LIFF ID
  // ใส่ LIFF ID จริงภายหลัง
  LIFF_ID:
    window.ROCK_LIFF_ID ||
    "",

  // GitHub Pages
  FRONTEND_URL:
    "https://rock-your-body.github.io",

  // Default values
  MAX_ENERGY: 200,

  // Navigation
  PAGES: {
    home: "./HOME.html",
    mission: "./mission.html",
    battle: "./battle.html",
    reward: "./reward.html",
    ranking: "./ranking.html",
    info: "./info.html",
    dashboard: "./dashboard.html",
    food: "./food-log.html"
  },

  // Storage keys
  STORAGE: {
    LINE_USER_ID: "rock_line_user_id",
    USER: "rock_user",
    ENERGY: "rock_energy",
    COIN: "rock_coin"
  }
};

console.log(
  "ROCK YOUR BODY CONFIG READY",
  window.ROCK_CONFIG
);
