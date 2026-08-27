/* =========================================================
   ROCK YOUR BODY 2026
   COMMON CORE
   LINE LIFF + API + PLAYER DATA
   ========================================================= */

(function () {

  "use strict";


  /* =======================================================
     CONFIG
  ======================================================= */

  const CONFIG = window.ROCK_CONFIG;


  if (!CONFIG) {

    console.error(
      "ROCK_CONFIG is missing."
    );

    return;

  }


  const STORAGE =
    CONFIG.STORAGE || {

      LINE_USER_ID:
        "rock_line_user_id",

      USER:
        "rock_user",

      ENERGY:
        "rock_energy",

      COIN:
        "rock_coin"

    };


  /* =======================================================
     STORAGE
  ======================================================= */

  function save(key, value) {

    try {

      localStorage.setItem(
        key,
        JSON.stringify(value)
      );

    } catch (error) {

      console.error(
        "ROCK STORAGE SAVE ERROR:",
        error
      );

    }

  }


  function load(
    key,
    fallback = null
  ) {

    try {

      const value =
        localStorage.getItem(key);


      if (
        value === null
      ) {

        return fallback;

      }


      return JSON.parse(
        value
      );

    } catch (error) {

      console.error(
        "ROCK STORAGE LOAD ERROR:",
        error
      );

      return fallback;

    }

  }


  function remove(key) {

    try {

      localStorage.removeItem(
        key
      );

    } catch (error) {

      console.error(
        "ROCK STORAGE REMOVE ERROR:",
        error
      );

    }

  }


  /* =======================================================
     API HELPER
     ======================================================= */

  async function api(
    path,
    options = {}
  ) {

    if (
      !CONFIG.API_BASE
    ) {

      throw new Error(
        "API_BASE is not configured."
      );

    }


    const url =
      CONFIG.API_BASE.replace(
        /\/$/,
        ""
      ) +
      path;


    const lineUserId =
      localStorage.getItem(
        STORAGE.LINE_USER_ID
      );


    const headers = {

      "Content-Type":
        "application/json",

      ...(options.headers || {})

    };


    /*
      ส่ง LINE USER ID
      ให้ Backend รู้ว่าเป็นผู้เล่นคนไหน
    */

    if (
      lineUserId
    ) {

      headers[
        "x-line-user-id"
      ] = lineUserId;

    }


    const response =
      await fetch(
        url,
        {
          ...options,
          headers
        }
      );


    let data = null;


    try {

      data =
        await response.json();

    } catch (error) {

      throw new Error(
        `API returned invalid JSON (${response.status})`
      );

    }


    if (
      !response.ok
    ) {

      const message =
        data?.error ||
        data?.message ||
        `API Error ${response.status}`;


      throw new Error(
        message
      );

    }


    return data;

  }


  /* =======================================================
     HEALTH CHECK
     ======================================================= */

  async function healthCheck() {

    try {

      const result =
        await api(
          "/api/health"
        );


      console.log(
        "ROCK API ONLINE:",
        result
      );


      return result;

    } catch (error) {

      console.error(
        "ROCK API OFFLINE:",
        error
      );


      return {

        ok: false,

        error:
          error.message

      };

    }

  }


  /* =======================================================
     LIFF STATUS
     ======================================================= */

  function isLIFFAvailable() {

    return (
      typeof window.liff !==
      "undefined"
    );

  }


  function isLINEConfigured() {

    return (
      !!CONFIG.LIFF_ID &&
      isLIFFAvailable()
    );

  }


  /* =======================================================
     INIT LIFF
     ======================================================= */

  async function initLiff() {

    /*
      ถ้ายังไม่ได้ใส่ LIFF ID
      ให้ระบบสามารถเปิดผ่าน browser ได้
    */

    if (
      !CONFIG.LIFF_ID
    ) {

      console.warn(
        "LIFF_ID is empty. Running in WEB mode."
      );


      return true;

    }


    if (
      !isLIFFAvailable()
    ) {

      console.warn(
        "LINE LIFF SDK is not available."
      );


      return true;

    }


    try {

      console.log(
        "Initializing LINE LIFF..."
      );


      await liff.init({

        liffId:
          CONFIG.LIFF_ID

      });


      console.log(
        "LIFF initialized."
      );


      /*
        ยังไม่ได้ Login
      */

      if (
        !liff.isLoggedIn()
      ) {

        console.log(
          "LINE user is not logged in."
        );


        liff.login({

          redirectUri:
            window.location.href

        });


        /*
          หยุด flow รอบนี้
          LINE จะ redirect กลับมา
        */

        return false;

      }


      console.log(
        "LINE user logged in."
      );


      /*
        ดึง profile
      */

      const profile =
        await getLineProfile();


      if (
        profile
      ) {

        console.log(
          "LINE PROFILE READY:",
          profile
        );

      }


      return true;

    } catch (error) {

      console.error(
        "LIFF INIT ERROR:",
        error
      );


      /*
        ไม่ทำให้หน้าเว็บพัง
        หาก LIFF มีปัญหา
      */

      return true;

    }

  }


  /* =======================================================
     LINE PROFILE
     ======================================================= */

  async function getLineProfile() {

    if (
      !isLIFFAvailable()
    ) {

      console.warn(
        "LIFF SDK unavailable."
      );

      return null;

    }


    try {

      /*
        ต้อง Login ก่อน
      */

      if (
        !liff.isLoggedIn()
      ) {

        return null;

      }


      const profile =
        await liff.getProfile();


      if (
        !profile
      ) {

        return null;

      }


      const lineUser = {

        lineUserId:
          profile.userId || "",

        displayName:
          profile.displayName || "",

        pictureUrl:
          profile.pictureUrl || "",

        statusMessage:
          profile.statusMessage || ""

      };


      /*
        เก็บ LINE USER ID
      */

      if (
        lineUser.lineUserId
      ) {

        localStorage.setItem(
          STORAGE.LINE_USER_ID,
          lineUser.lineUserId
        );

      }


      /*
        เก็บ LINE profile
      */

      save(
        "rock_line_profile",
        lineUser
      );


      /*
        เก็บเป็น USER เบื้องต้น
      */

      const oldUser =
        load(
          STORAGE.USER,
          {}
        );


      save(
        STORAGE.USER,
        {
          ...oldUser,
          ...lineUser
        }
      );


      return lineUser;

    } catch (error) {

      console.error(
        "GET LINE PROFILE ERROR:",
        error
      );


      return null;

    }

  }


  /* =======================================================
     BACKWARD COMPATIBILITY
     ======================================================= */

  /*
    ชื่อเก่าที่หน้าอื่นอาจเรียก
  */

  async function initLINE() {

    return initLiff();

  }


  /* =======================================================
     GET CURRENT USER
     ======================================================= */

  async function getMe() {

    try {

      /*
        ดึง LINE profile ก่อน
        เพื่อให้ API รู้ user คนปัจจุบัน
      */

      let lineProfile =
        load(
          "rock_line_profile",
          null
        );


      /*
        ถ้าอยู่ใน LINE
        และยังไม่มี profile
        ให้ดึงใหม่
      */

      if (
        !lineProfile &&
        isLINEConfigured()
      ) {

        lineProfile =
          await getLineProfile();

      }


      const data =
        await api(
          "/api/me"
        );


      /*
        ข้อมูลจาก Backend
      */

      const apiUser =
        data?.user || {};


      /*
        รวมข้อมูล LINE
        + ข้อมูลผู้เล่นจาก API
      */

      const user = {

        ...apiUser,

        /*
          LINE profile ต้องอยู่ด้านหน้า
          เพื่อไม่ให้ข้อมูลหาย
        */

        ...(lineProfile || {}),

        /*
          ให้ค่า backend ที่มีความสำคัญ
          ยังคงอยู่
        */

        lineUserId:
          apiUser.lineUserId ||
          lineProfile?.lineUserId ||
          null

      };


      /*
        ถ้า Backend ไม่มีชื่อ
        ใช้ชื่อจาก LINE
      */

      if (
        !user.name &&
        lineProfile?.displayName
      ) {

        user.name =
          lineProfile.displayName;

      }


      /*
        ถ้า Backend ไม่มีรูป
        ใช้รูปจาก LINE
      */

      if (
        !user.pictureUrl &&
        lineProfile?.pictureUrl
      ) {

        user.pictureUrl =
          lineProfile.pictureUrl;

      }


      /*
        Save user
      */

      save(
        STORAGE.USER,
        user
      );


      /*
        Save coin
      */

      if (
        user.rockCoin !== undefined
      ) {

        save(
          STORAGE.COIN,
          user.rockCoin
        );

      }


      /*
        Save energy
      */

      if (
        user.energy !== undefined
      ) {

        save(
          STORAGE.ENERGY,
          user.energy
        );

      }


      return {

        ok: true,

        user

      };

    } catch (error) {

      console.error(
        "GET USER ERROR:",
        error
      );


      /*
        ถ้า API มีปัญหา
        ยังใช้ข้อมูลล่าสุดจาก localStorage
      */

      const cachedUser =
        load(
          STORAGE.USER,
          null
        );


      if (
        cachedUser
      ) {

        return {

          ok: true,

          cached: true,

          user:
            cachedUser

        };

      }


      return {

        ok: false,

        error:
          error.message

      };

    }

  }


  /* =======================================================
     GET CACHED USER
     ======================================================= */

  function getCachedUser() {

    return load(
      STORAGE.USER,
      null
    );

  }


  /* =======================================================
     DASHBOARD
     ======================================================= */

  async function getDashboard() {

    return api(
      "/api/dashboard"
    );

  }


  /* =======================================================
     MISSIONS
     ======================================================= */

  async function getMissions() {

    return api(
      "/api/missions"
    );

  }


  async function completeMission(
    missionId
  ) {

    if (
      !missionId
    ) {

      throw new Error(
        "Mission ID is required."
      );

    }


    return api(

      `/api/missions/${encodeURIComponent(
        missionId
      )}/complete`,

      {

        method:
          "POST"

      }

    );

  }


  /* =======================================================
     BATTLE
     ======================================================= */

  async function getBattle() {

    return api(
      "/api/battle"
    );

  }


  async function fightMonster() {

    return api(

      "/api/battle/fight",

      {

        method:
          "POST"

      }

    );

  }


  /* =======================================================
     REWARDS
     ======================================================= */

  async function getRewards() {

    return api(
      "/api/rewards"
    );

  }


  /* =======================================================
     RANKING
     ======================================================= */

  async function getRanking() {

    return api(
      "/api/ranking"
    );

  }


  /* =======================================================
     NAVIGATION
     ======================================================= */

  function go(page) {

    const pages =
      CONFIG.PAGES || {};


    const target =
      pages[page];


    if (
      !target
    ) {

      console.error(
        "Unknown ROCK page:",
        page
      );

      return;

    }


    window.location.href =
      target;

  }


  function goHome() {

    go("home");

  }


  function goMission() {

    go("mission");

  }


  function goBattle() {

    go("battle");

  }


  function goReward() {

    go("reward");

  }


  function goRanking() {

    go("ranking");

  }


  function goInfo() {

    go("info");

  }


  function goDashboard() {

    go("dashboard");

  }


  function goFood() {

    go("food");

  }


  /* =======================================================
     FORMATTERS
     ======================================================= */

  function number(value) {

    return Number(
      value || 0
    ).toLocaleString(
      "en-US"
    );

  }


  function decimal(
    value,
    digits = 1
  ) {

    return Number(
      value || 0
    ).toLocaleString(
      "en-US",
      {
        minimumFractionDigits:
          digits,

        maximumFractionDigits:
          digits
      }
    );

  }


  function coin(value) {

    return number(
      value
    );

  }


  function energy(
    value,
    max = CONFIG.MAX_ENERGY || 200
  ) {

    return (

      `${number(value)} / ${number(max)}`

    );

  }


  function percent(
    current,
    target
  ) {

    const c =
      Number(current || 0);

    const t =
      Number(target || 0);


    if (
      t <= 0
    ) {

      return 0;

    }


    return Math.min(
      100,
      Math.max(
        0,
        Math.round(
          (c / t) * 100
        )
      )
    );

  }


  /* =======================================================
     UPDATE TOP BAR
     ======================================================= */

  function updateTopBar(
    user
  ) {

    if (
      !user
    ) {

      return;

    }


    /*
      ROCK COIN
    */

    document
      .querySelectorAll(
        "[data-rock-coin]"
      )
      .forEach(
        element => {

          element.textContent =
            coin(
              user.rockCoin
            );

        }
      );


    /*
      ENERGY
    */

    document
      .querySelectorAll(
        "[data-energy]"
      )
      .forEach(
        element => {

          element.textContent =
            energy(
              user.energy,
              user.maxEnergy
            );

        }
      );


    /*
      POINTS
    */

    document
      .querySelectorAll(
        "[data-points]"
      )
      .forEach(
        element => {

          element.textContent =
            number(
              user.points
            );

        }
      );


    /*
      RANK
    */

    document
      .querySelectorAll(
        "[data-rank]"
      )
      .forEach(
        element => {

          element.textContent =
            user.rank
              ? `#${user.rank}`
              : "-";

        }
      );


    /*
      NAME
    */

    document
      .querySelectorAll(
        "[data-user-name]"
      )
      .forEach(
        element => {

          element.textContent =
            user.name ||
            user.displayName ||
            "สมาชิก ROCK YOUR BODY";

        }
      );


    /*
      LINE DISPLAY NAME
    */

    document
      .querySelectorAll(
        "[data-line-name]"
      )
      .forEach(
        element => {

          element.textContent =
            user.displayName ||
            user.name ||
            "สมาชิก ROCK YOUR BODY";

        }
      );


    /*
      PROFILE IMAGE
    */

    document
      .querySelectorAll(
        "[data-profile-image]"
      )
      .forEach(
        element => {

          if (
            user.pictureUrl
          ) {

            element.src =
              user.pictureUrl;

            element.alt =
              user.displayName ||
              user.name ||
              "LINE Profile";

          }

        }
      );


    /*
      TEAM
    */

    document
      .querySelectorAll(
        "[data-team]"
      )
      .forEach(
        element => {

          element.textContent =
            user.team ||
            user.teamName ||
            "HERO ROCK";

        }
      );


    /*
      LEVEL
    */

    document
      .querySelectorAll(
        "[data-level]"
      )
      .forEach(
        element => {

          const level =
            user.level ||
            user.lv ||
            1;

          element.textContent =
            `Lv.${level}`;

        }
      );


    /*
      EXP
    */

    document
      .querySelectorAll(
        "[data-exp]"
      )
      .forEach(
        element => {

          element.textContent =
            number(
              user.exp || 0
            );

        }
      );

  }


  /* =======================================================
     UPDATE HOME DATA
     ======================================================= */

  function updateUserData(
    user
  ) {

    if (
      !user
    ) {

      return;

    }


    /*
      น้ำหนัก
    */

    document
      .querySelectorAll(
        "[data-weight]"
      )
      .forEach(
        element => {

          element.textContent =
            decimal(
              user.weight,
              1
            );

        }
      );


    /*
      เป้าหมายน้ำหนัก
    */

    document
      .querySelectorAll(
        "[data-target-weight]"
      )
      .forEach(
        element => {

          element.textContent =
            decimal(
              user.targetWeight,
              1
            );

        }
      );


    /*
      Steps
    */

    document
      .querySelectorAll(
        "[data-steps]"
      )
      .forEach(
        element => {

          element.textContent =
            number(
              user.steps
            );

        }
      );


    /*
      Target Steps
    */

    document
      .querySelectorAll(
        "[data-target-steps]"
      )
      .forEach(
        element => {

          element.textContent =
            number(
              user.targetSteps ||
              10000
            );

        }
      );


    /*
      Calories
    */

    document
      .querySelectorAll(
        "[data-calories]"
      )
      .forEach(
        element => {

          element.textContent =
            number(
              user.calories
            );

        }
      );


    /*
      Target Calories
    */

    document
      .querySelectorAll(
        "[data-target-calories]"
      )
      .forEach(
        element => {

          element.textContent =
            number(
              user.targetCalories ||
              500
            );

        }
      );


    /*
      Sleep
    */

    document
      .querySelectorAll(
        "[data-sleep]"
      )
      .forEach(
        element => {

          element.textContent =
            decimal(
              user.sleep,
              1
            );

        }
      );


    /*
      Target Sleep
    */

    document
      .querySelectorAll(
        "[data-target-sleep]"
      )
      .forEach(
        element => {

          element.textContent =
            decimal(
              user.targetSleep ||
              8,
              1
            );

        }
      );


    /*
      Health Score
    */

    document
      .querySelectorAll(
        "[data-health-score]"
      )
      .forEach(
        element => {

          element.textContent =
            number(
              user.healthScore
            );

        }
      );


    /*
      InBody
    */

    document
      .querySelectorAll(
        "[data-inbody-score]"
      )
      .forEach(
        element => {

          element.textContent =
            number(
              user.inbodyScore
            );

        }
      );


    /*
      Program Day
    */

    document
      .querySelectorAll(
        "[data-program-day]"
      )
      .forEach(
        element => {

          element.textContent =
            number(
              user.programDay
            );

        }
      );


    /*
      Program Total Days
    */

    document
      .querySelectorAll(
        "[data-program-total-days]"
      )
      .forEach(
        element => {

          element.textContent =
            number(
              user.programTotalDays ||
              90
            );

        }
      );


    /*
      Weight Progress
    */

    const currentWeight =
      Number(
        user.weight || 0
      );


    const targetWeight =
      Number(
        user.targetWeight || 0
      );


    if (
      currentWeight > 0 &&
      targetWeight > 0
    ) {

      /*
        ตัวอย่าง:
        78.5 → 72
        ลดไป 6.5 kg

        หากต้องการ Progress
        จะคำนวณจากน้ำหนักตั้งต้น
        ในอนาคตสามารถเพิ่ม initialWeight ได้
      */

      const initialWeight =
        Number(
          user.initialWeight ||
          currentWeight
        );


      const totalToLose =
        initialWeight -
        targetWeight;


      const lost =
        initialWeight -
        currentWeight;


      let progress = 0;


      if (
        totalToLose > 0
      ) {

        progress =
          Math.round(
            (
              lost /
              totalToLose
            ) * 100
          );

      }


      progress =
        Math.max(
          0,
          Math.min(
            100,
            progress
          )
        );


      document
        .querySelectorAll(
          "[data-weight-progress]"
        )
        .forEach(
          element => {

            element.textContent =
              `${progress}%`;

          }
        );

    }

  }


  /* =======================================================
     UPDATE ALL USER UI
     ======================================================= */

  function updateUI(
    user
  ) {

    updateTopBar(
      user
    );

    updateUserData(
      user
    );

  }


  /* =======================================================
     INIT APP
     ======================================================= */

  async function init() {

    console.log(
      "===================================="
    );

    console.log(
      "ROCK YOUR BODY 2026"
    );

    console.log(
      "COMMON CORE INITIALIZING..."
    );

    console.log(
      "===================================="
    );


    /*
      1. API Health
    */

    await healthCheck();


    /*
      2. LINE LIFF
    */

    if (
      CONFIG.LIFF_ID
    ) {

      await initLiff();

    }


    /*
      3. ดึงข้อมูลผู้เล่น
    */

    const me =
      await getMe();


    /*
      4. Update UI
    */

    if (
      me?.user
    ) {

      updateUI(
        me.user
      );

    }


    console.log(
      "ROCK YOUR BODY CORE READY"
    );


    return me;

  }


  /* =======================================================
     PUBLIC API
     ======================================================= */

  window.ROCK = {

    /*
      Config
    */

    config:
      CONFIG,


    /*
      Storage
    */

    save,
    load,
    remove,


    /*
      API
    */

    api,
    healthCheck,


    /*
      LINE
    */

    initLiff,
    initLINE,
    getLineProfile,


    /*
      User
    */

    getMe,
    getCachedUser,


    /*
      Dashboard
    */

    getDashboard,


    /*
      Mission
    */

    getMissions,
    completeMission,


    /*
      Battle
    */

    getBattle,
    fightMonster,


    /*
      Reward
    */

    getRewards,


    /*
      Ranking
    */

    getRanking,


    /*
      Navigation
    */

    go,
    goHome,
    goMission,
    goBattle,
    goReward,
    goRanking,
    goInfo,
    goDashboard,
    goFood,


    /*
      Format
    */

    number,
    decimal,
    coin,
    energy,
    percent,


    /*
      UI
    */

    updateTopBar,
    updateUserData,
    updateUI,


    /*
      Init
    */

    init

  };


  console.log(
    "ROCK COMMON CORE LOADED"
  );


})();
