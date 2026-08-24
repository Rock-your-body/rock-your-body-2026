window.APP_CONFIG = {

  /* =========================================================
     LIFF
  ========================================================= */

  LIFF_ID:
    "2011201679-uNWz5yqF",


  /* =========================================================
     API
  ========================================================= */

  API: {

    DASHBOARD:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/player-dashboard",

    MISSION:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/mission",

    BATTLE:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/battle"

    MISSION_ADMIN:
  "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/mission-admin"
  },


  /* =========================================================
     PAGE
  ========================================================= */

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
      "./mission.html?v=20260824-02",

    BATTLE:
      "./battle.html?v=20260824-02"

  },


  /* =========================================================
     GAME SETTINGS
  ========================================================= */

  EXP_PER_LEVEL:
    500,

  MAX_ENERGY:
    200,

  REFRESH_MS:
    30000

};


/* =========================================================
   PAGE NAVIGATION
========================================================= */

/*
  ใช้ฟังก์ชันชุดนี้เมื่อต้องการเปลี่ยนหน้า

  สำคัญ:
  ห้ามใช้
      window.location.href = "HOME";
      window.location.href = "BATTLE";

  เพราะ GitHub Pages จะพยายามเปิด
      /HOME
      /BATTLE

  แล้วเกิด 404
*/


window.goHome = function () {

  const url =
    window.APP_CONFIG?.PAGE?.HOME ||
    "./dashboard.html";

  window.location.href =
    url;

};


window.goWeight = function () {

  const url =
    window.APP_CONFIG?.PAGE?.WEIGHT ||
    "./weight-check.html";

  window.location.href =
    url;

};


window.goProgress = function () {

  const url =
    window.APP_CONFIG?.PAGE?.PROGRESS ||
    "./progress.html";

  window.location.href =
    url;

};


window.goRanking = function () {

  const url =
    window.APP_CONFIG?.PAGE?.RANKING ||
    "./ranking.html";

  window.location.href =
    url;

};


window.goRewards = function () {

  const url =
    window.APP_CONFIG?.PAGE?.REWARDS ||
    "./rewards.html";

  window.location.href =
    url;

};


window.goMission = function () {

  const url =
    window.APP_CONFIG?.PAGE?.MISSION ||
    "./mission.html";

  window.location.href =
    url;

};


window.goBattle = function () {

  const url =
    window.APP_CONFIG?.PAGE?.BATTLE ||
    "./battle.html";

  window.location.href =
    url;

};


/* =========================================================
   GENERIC NAVIGATION
========================================================= */

/*
  สามารถใช้:

      APP_NAV.go("HOME");
      APP_NAV.go("MISSION");
      APP_NAV.go("BATTLE");

  ได้เช่นกัน
*/

window.APP_NAV = {

  go(pageName) {

    const key =
      String(
        pageName || ""
      )
      .trim()
      .toUpperCase();


    const url =
      window.APP_CONFIG
        ?.PAGE
        ?.[key];


    if (!url) {

      console.error(
        "PAGE_NOT_FOUND:",
        key
      );

      return false;

    }


    window.location.href =
      url;


    return true;

  }

};
