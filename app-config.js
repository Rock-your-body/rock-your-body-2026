window.APP_CONFIG = {

  /* =====================================================
     LIFF
  ===================================================== */

  LIFF_ID: {
    DASHBOARD: "2011201679-uNWz5ygF",
    WEIGHT: "2011201679-uN62Coga"
  },


  /* =====================================================
     SUPABASE EDGE FUNCTIONS
  ===================================================== */

  API: {

    DASHBOARD:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/player-dashboard",

    WEIGHT:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/weight-check"

  },


  /* =====================================================
     PAGE URL
     ใช้ GitHub Pages ปกติ
     ไม่ใส่ liff.line.me
  ===================================================== */

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


  /* =====================================================
     GAME
  ===================================================== */

  EXP_PER_LEVEL: 500,

  MAX_ENERGY: 200,

  REFRESH_MS: 30000

};
