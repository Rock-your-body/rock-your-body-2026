/* =========================================================
   ROCK YOUR BODY 2026
   APP CONFIG
   Version: 2026-08-28-DAILY-HEALTH-MISSION-LINKS
========================================================= */

"use strict";


window.APP_CONFIG = {

  /* =====================================================
     APP
  ====================================================== */

  APP_NAME:
    "ROCK YOUR BODY 2026",

  VERSION:
    "2026-08-28-DAILY-HEALTH-MISSION-LINKS",


  /* =====================================================
     LINE LIFF
  ====================================================== */

  LIFF_ID:
    "2011201679-uNWz5yqF",


  /* =====================================================
     SUPABASE
  ====================================================== */

  SUPABASE: {

    PROJECT_REF:
      "nztvqdzatdpauufpvdaa",

    BASE_URL:
      "https://nztvqdzatdpauufpvdaa.supabase.co"

  },


  /* =====================================================
     EDGE FUNCTIONS
  ====================================================== */

  API: {

    /* HOME */

    DASHBOARD:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/player-dashboard",


    /* MISSION */

    MISSION:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/mission",


    /* BATTLE */

    BATTLE:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/battle",


    /* INBODY */

    INBODY:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/inbody",


    /* PROJECT */

    PROJECT:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/project-settings",


    /* DAILY HEALTH
       เก็บ Steps / Calories / Sleep ของผู้ใช้รายวัน
    */

    DAILY_HEALTH:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/daily-health"

  },


  /* =====================================================
     NORMAL PAGE URL
  ====================================================== */

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
      "./project-settings.html"

  },


  /* =====================================================
     BACKWARD COMPATIBLE PAGE URL
  ====================================================== */

  PAGES: {

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
      "./project-settings.html"

  },


  /* =====================================================
     DAILY MISSION DEEP LINKS

     ใช้สำหรับกดจาก HOME

     Steps
       → Daily Mission / MOVE MORE

     Calories
       → Daily Mission / MOVE MORE + Exercise

     Sleep
       → Daily Mission / SLEEP WELL
  ====================================================== */

  MISSION_LINK: {

    /* ---------------------------------------------
       STEPS
    ---------------------------------------------- */

    STEPS:
      "./mission.html?category=daily&mission=daily_move_more&metric=steps",


    /* ---------------------------------------------
       CALORIES

       เปิด MOVE MORE
       พร้อมบอก mission.html ว่าเข้ามาจาก Calories
    ---------------------------------------------- */

    CALORIES:
      "./mission.html?category=daily&mission=daily_move_more&metric=calories&exercise=1",


    /* ---------------------------------------------
       SLEEP

       เปิด SLEEP WELL
    ---------------------------------------------- */

    SLEEP:
      "./mission.html?category=daily&mission=bonus_sleep&metric=sleep"

  },


  /* =====================================================
     MISSION IDs

     ใช้ชื่อเดียวกันทั้ง HOME / MISSION / BACKEND
  ====================================================== */

  MISSION_ID: {

    MOVE_MORE:
      "daily_move_more",

    EAT_SMART:
      "daily_eat_smart",

    EXERCISE:
      "daily_exercise_30",

    SLEEP_WELL:
      "bonus_sleep"

  },


  /* =====================================================
     DAILY HEALTH DEFAULT VALUES

     ถ้าไม่มีข้อมูลจริง:
       Steps = 0
       Calories = 0
       Sleep = 0 นาที

     ห้ามแสดง --
  ====================================================== */

  DAILY_DEFAULT: {

    STEPS:
      0,

    CALORIES:
      0,

    SLEEP_MINUTES:
      0

  },


  /* =====================================================
     DAILY HEALTH GOALS

     ใช้คำนวณ Progress Bar
  ====================================================== */

  DAILY_GOALS: {

    /* 8,000 ก้าว */

    STEPS:
      8000,


    /* 300 kcal */

    CALORIES:
      300,


    /* 7 ชั่วโมง = 420 นาที */

    SLEEP_MINUTES:
      420

  },


  /* =====================================================
     DAILY HEALTH DISPLAY
  ====================================================== */

  DAILY_DISPLAY: {

    STEPS_EMPTY:
      "0",

    CALORIES_EMPTY:
      "0 kcal",

    SLEEP_EMPTY:
      "0 ชม. 0 นาที"

  },


  /* =====================================================
     MISSION EVIDENCE

     ต้องมีหลักฐานก่อนส่ง Mission
  ====================================================== */

  MISSION_EVIDENCE: {

    MOVE_MORE: {

      REQUIRED:
        true,

      ALLOW_IMAGE:
        true,

      ALLOW_VIDEO:
        true,

      ALLOW_LINK:
        false

    },


    EXERCISE: {

      REQUIRED:
        true,

      ALLOW_IMAGE:
        true,

      ALLOW_VIDEO:
        true,

      ALLOW_LINK:
        false

    },


    SLEEP_WELL: {

      REQUIRED:
        true,

      ALLOW_IMAGE:
        true,

      ALLOW_VIDEO:
        false,

      ALLOW_LINK:
        false

    }

  },


  /* =====================================================
     REWARD RULE

     ส่งตัวเลขอย่างเดียว = ยังไม่ได้รางวัล

     ต้อง:
       1. กรอกข้อมูล
       2. อัปโหลดหลักฐาน
       3. ส่ง Mission
       4. Admin Approve
       5. Backend ให้ Coin / Energy / EXP
  ====================================================== */

  REWARD_RULE: {

    REQUIRE_EVIDENCE:
      true,

    REQUIRE_ADMIN_APPROVAL:
      true,

    GRANT_ON_APPROVED:
      true

  },


  /* =====================================================
     GAME
  ====================================================== */

  MAX_ENERGY:
    200,

  EXP_PER_LEVEL:
    500,

  REFRESH_MS:
    30000,


  /* =====================================================
     STORAGE
  ====================================================== */

  STORAGE: {

    MISSION_EVIDENCE:
      "mission-evidence",

    INBODY_RESULTS:
      "inbody-results",

    ROCK_ASSETS:
      "rock-assets"

  },


  /* =====================================================
     ASSETS
  ====================================================== */

  ASSETS: {

    HOME_TEMPLATE:
      "./home-template.png",

    MISSION_TEMPLATE:
      "./mission-template.png",

    BATTLE_TEMPLATE:
      "./battle-template.png"

  }

};


/* =========================================================
   BACKWARD COMPATIBILITY
========================================================= */

window.APP_CONFIG.API_BASE =
  window.APP_CONFIG.SUPABASE.BASE_URL;


/* =========================================================
   GET PAGE
========================================================= */

window.APP_CONFIG.getPage =
  function getPage(name) {

    const key =
      String(
        name || ""
      )
        .trim()
        .toUpperCase();


    return (
      window.APP_CONFIG.PAGE[key] ||
      window.APP_CONFIG.PAGE.HOME
    );

  };


/* =========================================================
   GET API
========================================================= */

window.APP_CONFIG.getApi =
  function getApi(name) {

    const key =
      String(
        name || ""
      )
        .trim()
        .toUpperCase();


    return (
      window.APP_CONFIG.API[key] ||
      null
    );

  };


/* =========================================================
   GET MISSION LINK

   ตัวอย่าง:

   APP_CONFIG.getMissionLink("STEPS")
   APP_CONFIG.getMissionLink("CALORIES")
   APP_CONFIG.getMissionLink("SLEEP")
========================================================= */

window.APP_CONFIG.getMissionLink =
  function getMissionLink(name) {

    const key =
      String(
        name || ""
      )
        .trim()
        .toUpperCase();


    return (
      window.APP_CONFIG
        .MISSION_LINK[key] ||
      window.APP_CONFIG
        .PAGE
        .MISSION
    );

  };


/* =========================================================
   DAILY DEFAULT HELPER
========================================================= */

window.APP_CONFIG.getDailyDefault =
  function getDailyDefault(name) {

    const key =
      String(
        name || ""
      )
        .trim()
        .toUpperCase();


    return (
      window.APP_CONFIG
        .DAILY_DEFAULT[key] ??
      0
    );

  };


/* =========================================================
   DEBUG
========================================================= */

console.log(
  "ROCK YOUR BODY CONFIG:",
  {

    version:
      window.APP_CONFIG.VERSION,

    liffId:
      window.APP_CONFIG.LIFF_ID,

    dailyHealthApi:
      window.APP_CONFIG.API.DAILY_HEALTH,

    stepsMission:
      window.APP_CONFIG.MISSION_LINK.STEPS,

    caloriesMission:
      window.APP_CONFIG.MISSION_LINK.CALORIES,

    sleepMission:
      window.APP_CONFIG.MISSION_LINK.SLEEP,

    stepsDefault:
      window.APP_CONFIG.DAILY_DEFAULT.STEPS,

    caloriesDefault:
      window.APP_CONFIG.DAILY_DEFAULT.CALORIES,

    sleepDefault:
      window.APP_CONFIG.DAILY_DEFAULT.SLEEP_MINUTES

  }
);
