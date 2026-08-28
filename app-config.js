/* =========================================================
   ROCK YOUR BODY 2026
   APP CONFIG
   Version: 2026-08-29-MISSION-ROUTES-V4
========================================================= */

"use strict";


window.APP_CONFIG = {

  /* =======================================================
     APP
  ======================================================= */

  APP_NAME:
    "ROCK YOUR BODY 2026",

  VERSION:
    "2026-08-29-MISSION-ROUTES-V4",


  /* =======================================================
     LINE LIFF
  ======================================================= */

  LIFF_ID:
    "2011201679-uNWz5yqF",


  /* =======================================================
     SUPABASE
  ======================================================= */

  SUPABASE: {

    PROJECT_REF:
      "nztvqdzatdpauufpvdaa",

    BASE_URL:
      "https://nztvqdzatdpauufpvdaa.supabase.co"

  },


  /* =======================================================
     EDGE FUNCTIONS
  ======================================================= */

  API: {

    DASHBOARD:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/player-dashboard",

    MISSION:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/mission",

    BATTLE:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/battle",

    INBODY:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/inbody",

    PROJECT:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/project-settings",

    DAILY_HEALTH:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/daily-health",

    NUTRITION:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/nutrition"

  },


  /* =======================================================
     PAGE ROUTES
  ======================================================= */

  PAGE: {

    /* -----------------------
       MAIN
    ----------------------- */

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
      "./nutrition.html",


    /* =====================================================
       DAILY HEALTH → DAILY MISSION
    ===================================================== */


    /*
       STEPS
       HOME → DAILY MISSION → MOVE MORE
    */
    DAILY_MOVE:
      "./mission.html?category=daily&mission=daily_move_more",


    /*
       CALORIES
       HOME → DAILY MISSION → EXERCISE

       mission.html ชุดล่าสุดรองรับ mission id นี้โดยตรง
    */
    DAILY_EXERCISE:
      "./mission.html?category=daily&mission=daily_exercise_30",


    /*
       SLEEP
       HOME → DAILY MISSION → SLEEP
    */
    DAILY_SLEEP:
      "./mission.html?category=daily&mission=daily_sleep",


    /*
       EAT SMART
       HOME / Nutrition → DAILY MISSION → EAT SMART
    */
    DAILY_EAT_SMART:
      "./mission.html?category=daily&mission=daily_eat_smart"

  },


  /* =======================================================
     DAILY HEALTH DEFAULT
     ไม่มีข้อมูล = 0
  ======================================================= */

  DAILY_HEALTH_DEFAULTS: {

    STEPS:
      0,

    CALORIES:
      0,

    SLEEP_MINUTES:
      0

  },


  /* =======================================================
     DAILY GOALS
  ======================================================= */

  DAILY_GOALS: {

    STEPS:
      8000,

    CALORIES:
      300,

    SLEEP_MINUTES:
      420

  },


  /* =======================================================
     GAME SETTINGS
  ======================================================= */

  MAX_ENERGY:
    200,

  EXP_PER_LEVEL:
    500,

  REFRESH_MS:
    30000,


  /* =======================================================
     STORAGE
  ======================================================= */

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



/* =========================================================
   COMPATIBILITY ALIAS
========================================================= */

/*
   รองรับไฟล์เก่าที่เรียก
   APP_CONFIG.PAGES.xxx
*/

window.APP_CONFIG.PAGES =
  window.APP_CONFIG.PAGE;


/*
   Base URL alias
*/

window.APP_CONFIG.API_BASE =
  window.APP_CONFIG.SUPABASE.BASE_URL;



/* =========================================================
   PAGE HELPER
========================================================= */

window.APP_CONFIG.getPage =
  function getPage(name){

    const key =
      String(name || "")
        .trim()
        .toUpperCase();


    return (
      window.APP_CONFIG.PAGE[key] ||
      window.APP_CONFIG.PAGE.HOME
    );

  };



/* =========================================================
   API HELPER
========================================================= */

window.APP_CONFIG.getApi =
  function getApi(name){

    const key =
      String(name || "")
        .trim()
        .toUpperCase();


    return (
      window.APP_CONFIG.API[key] ||
      null
    );

  };



/* =========================================================
   DAILY HEALTH ROUTER
========================================================= */

window.APP_CONFIG.getHealthRoute =
  function getHealthRoute(metric){

    const key =
      String(metric || "")
        .trim()
        .toLowerCase();


    /* -----------------------
       STEPS
    ----------------------- */

    if(
      key === "steps" ||
      key === "step"
    ){

      return (
        window.APP_CONFIG
          .PAGE
          .DAILY_MOVE
      );

    }


    /* -----------------------
       CALORIES
    ----------------------- */

    if(
      key === "calories" ||
      key === "calorie" ||
      key === "kcal" ||
      key === "exercise"
    ){

      return (
        window.APP_CONFIG
          .PAGE
          .DAILY_EXERCISE
      );

    }


    /* -----------------------
       SLEEP
    ----------------------- */

    if(
      key === "sleep" ||
      key === "sleep_minutes"
    ){

      return (
        window.APP_CONFIG
          .PAGE
          .DAILY_SLEEP
      );

    }


    /* -----------------------
       FALLBACK
    ----------------------- */

    return (
      window.APP_CONFIG
        .PAGE
        .MISSION
    );

  };



/* =========================================================
   DAILY MISSION ROUTER
========================================================= */

window.APP_CONFIG.getDailyMissionRoute =
  function getDailyMissionRoute(mission){

    const key =
      String(mission || "")
        .trim()
        .toLowerCase();


    switch(key){

      case "move":
      case "move_more":
      case "daily_move_more":
      case "steps":

        return (
          window.APP_CONFIG
            .PAGE
            .DAILY_MOVE
        );


      case "exercise":
      case "daily_exercise_30":
      case "calories":
      case "kcal":

        return (
          window.APP_CONFIG
            .PAGE
            .DAILY_EXERCISE
        );


      case "sleep":
      case "sleep_well":
      case "daily_sleep":

        return (
          window.APP_CONFIG
            .PAGE
            .DAILY_SLEEP
        );


      case "eat":
      case "eat_smart":
      case "daily_eat_smart":
      case "nutrition":

        return (
          window.APP_CONFIG
            .PAGE
            .DAILY_EAT_SMART
        );


      default:

        return (
          window.APP_CONFIG
            .PAGE
            .MISSION
        );

    }

  };



/* =========================================================
   DEBUG
========================================================= */

console.log(
  "======================================"
);

console.log(
  "ROCK YOUR BODY APP CONFIG READY"
);

console.log(
  "VERSION:",
  window.APP_CONFIG.VERSION
);

console.log(
  "DAILY HEALTH API:",
  window.APP_CONFIG.API.DAILY_HEALTH
);

console.log(
  "STEPS →",
  window.APP_CONFIG.PAGE.DAILY_MOVE
);

console.log(
  "CALORIES →",
  window.APP_CONFIG.PAGE.DAILY_EXERCISE
);

console.log(
  "SLEEP →",
  window.APP_CONFIG.PAGE.DAILY_SLEEP
);

console.log(
  "EAT SMART →",
  window.APP_CONFIG.PAGE.DAILY_EAT_SMART
);

console.log(
  "======================================"
);
