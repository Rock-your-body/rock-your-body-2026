/* =========================================================
   ROCK YOUR BODY 2026
   COMMON CORE
   common.js
   ========================================================= */

(function () {

  "use strict";


  /* =======================================================
     CONFIG
  ======================================================= */

  const CONFIG =
    window.ROCK_CONFIG;


  if (!CONFIG) {

    console.error(
      "ROCK_CONFIG is missing."
    );

    return;

  }


  const STORAGE =
    CONFIG.STORAGE || {};


  /* =======================================================
     STORAGE
  ======================================================= */

  function save(
    key,
    value
  ) {

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


      return JSON.parse(value);

    } catch (error) {

      console.error(
        "ROCK STORAGE LOAD ERROR:",
        error
      );

      return fallback;

    }

  }


  /* =======================================================
     LINE USER ID
  ======================================================= */

  function getStoredLineUserId() {

    return (
      localStorage.getItem(
        STORAGE.LINE_USER_ID
      ) || ""
    );

  }


  /* =======================================================
     API
  ======================================================= */

  async function api(
    path,
    options = {}
  ) {

    const base =
      String(
        CONFIG.API_BASE || ""
      ).replace(
        /\/$/,
        ""
      );


    const url =
      base + path;


    const lineUserId =
      getStoredLineUserId();


    const headers = {

      "Content-Type":
        "application/json",

      ...(options.headers || {})

    };


    if (
      lineUserId
    ) {

      headers[
        "x-line-user-id"
      ] =
        lineUserId;

    }


    console.log(
      "ROCK API:",
      options.method || "GET",
      url
    );


    const response =
      await fetch(
        url,
        {
          ...options,
          headers
        }
      );


    let data;


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

      throw new Error(
        data?.error ||
        data?.message ||
        `API Error ${response.status}`
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
     LIFF
  ======================================================= */

  async function initLiff() {

    /*
      ถ้ายังไม่ได้ใส่ LIFF ID
      ให้ระบบทำงานบน Web ได้
    */

    if (
      !CONFIG.LIFF_ID
    ) {

      console.warn(
        "ROCK LIFF_ID is empty."
      );


      return true;

    }


    if (
      typeof liff ===
      "undefined"
    ) {

      console.warn(
        "LINE LIFF SDK is not loaded."
      );


      return true;

    }


    try {

      await liff.init({

        liffId:
          CONFIG.LIFF_ID

      });


      console.log(
        "ROCK LIFF INITIALIZED"
      );


      /*
        ถ้ายัง Login ไม่สำเร็จ
        ให้ LINE Login
      */

      if (
        !liff.isLoggedIn()
      ) {

        console.log(
          "ROCK LIFF LOGIN"
        );


        liff.login();


        return false;

      }


      /*
        ดึง Profile จาก LINE
      */

      const profile =
        await liff.getProfile();


      if (
        !profile
      ) {

        throw new Error(
          "ไม่สามารถอ่าน LINE Profile ได้"
        );

      }


      const user = {

        lineUserId:
          profile.userId || "",

        displayName:
          profile.displayName || "",

        pictureUrl:
          profile.pictureUrl || ""

      };


      /*
        เก็บ LINE User ID
      */

      if (
        user.lineUserId
      ) {

        localStorage.setItem(

          STORAGE.LINE_USER_ID,

          user.lineUserId

        );

      }


      /*
        เก็บ Profile
      */

      save(
        STORAGE.USER,
        user
      );


      console.log(
        "ROCK LINE USER:",
        user
      );


      return true;

    } catch (error) {

      console.error(
        "ROCK LIFF ERROR:",
        error
      );


      return true;

    }

  }


  /* =======================================================
     GET PROFILE
  ======================================================= */

  async function getProfile() {

    /*
      ถ้าอยู่ใน LINE
      พยายามอ่าน Profile สดก่อน
    */

    try {

      if (
        typeof liff !==
        "undefined" &&
        liff.isLoggedIn &&
        liff.isLoggedIn()
      ) {

        const profile =
          await liff.getProfile();


        const user = {

          lineUserId:
            profile.userId || "",

          displayName:
            profile.displayName || "",

          pictureUrl:
            profile.pictureUrl || ""

        };


        save(
          STORAGE.USER,
          user
        );


        if (
          user.lineUserId
        ) {

          localStorage.setItem(

            STORAGE.LINE_USER_ID,

            user.lineUserId

          );

        }


        return user;

      }

    } catch (error) {

      console.warn(
        "ROCK LIVE PROFILE ERROR:",
        error
      );

    }


    /*
      ถ้าอ่าน LINE ไม่ได้
      ใช้ข้อมูลที่เก็บไว้
    */

    return (
      load(
        STORAGE.USER,
        null
      ) || {

        lineUserId:
          getStoredLineUserId(),

        displayName:
          "",

        pictureUrl:
          ""

      }
    );

  }


  /* =======================================================
     CURRENT USER
  ======================================================= */

  async function getMe() {

    try {

      const data =
        await api(
          "/api/me"
        );


      if (
        data?.user
      ) {

        save(
          STORAGE.USER,
          data.user
        );

      }


      return data;

    } catch (error) {

      console.error(
        "ROCK GET ME ERROR:",
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
     DASHBOARD
  ======================================================= */

  async function getDashboard() {

    return api(
      "/api/dashboard"
    );

  }


  /*
    Compatibility:
    ป้องกันหน้าเก่าที่เรียก
    fetchDashboard()
  */

  async function fetchDashboard() {

    return getDashboard();

  }


  /* =======================================================
     PROGRESS
  ======================================================= */

  async function getProgress() {

    return api(
      "/api/progress"
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
     REWARD
  ======================================================= */

  async function getRewards() {

    return api(
      "/api/rewards"
    );

  }


  async function claimReward(
    rewardId
  ) {

    return api(

      `/api/rewards/${encodeURIComponent(
        rewardId
      )}/claim`,

      {

        method:
          "POST"

      }

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

  function go(
    page
  ) {

    const target =
      CONFIG.PAGES?.[page];


    if (
      !target
    ) {

      console.error(
        "ROCK UNKNOWN PAGE:",
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


  function goProgress() {

    /*
      รองรับหน้า progress
    */

    if (
      CONFIG.PAGES?.progress
    ) {

      go("progress");

      return;

    }


    window.location.href =
      "./progress.html";

  }


  /* =======================================================
     FORMATTERS
  ======================================================= */

  function number(
    value
  ) {

    const n =
      Number(value || 0);


    return n.toLocaleString(
      "en-US"
    );

  }


  function coin(
    value
  ) {

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


    document
      .querySelectorAll(
        "[data-energy]"
      )
      .forEach(
        element => {

          element.textContent =
            energy(

              user.energy,

              user.maxEnergy ||
              CONFIG.MAX_ENERGY

            );

        }
      );


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


    document
      .querySelectorAll(
        "[data-display-name]"
      )
      .forEach(
        element => {

          element.textContent =
            user.displayName ||
            user.name ||
            "สมาชิก";

        }
      );


    document
      .querySelectorAll(
        "[data-picture-url]"
      )
      .forEach(
        element => {

          if (
            user.pictureUrl
          ) {

            element.src =
              user.pictureUrl;

          }

        }
      );

  }


  /* =======================================================
     UPDATE PROFILE UI
  ======================================================= */

  function updateProfileUI(
    profile
  ) {

    if (
      !profile
    ) {

      return;

    }


    document
      .querySelectorAll(
        "[data-display-name]"
      )
      .forEach(
        element => {

          element.textContent =
            profile.displayName ||
            "สมาชิก ROCK YOUR BODY";

        }
      );


    document
      .querySelectorAll(
        "[data-picture-url]"
      )
      .forEach(
        element => {

          if (
            profile.pictureUrl
          ) {

            element.src =
              profile.pictureUrl;

          }

        }
      );

  }


  /* =======================================================
     FULL INITIALIZATION
  ======================================================= */

  async function init() {

    console.log(
      "===================================="
    );

    console.log(
      "ROCK YOUR BODY CORE START"
    );

    console.log(
      "===================================="
    );


    /*
      1. Health Check
    */

    await healthCheck();


    /*
      2. LIFF
    */

    const liffReady =
      await initLiff();


    /*
      ถ้า LIFF กำลัง Login
      หยุดไว้ก่อน
    */

    if (
      liffReady === false
    ) {

      return {

        ok: false,

        mode:
          "login"

      };

    }


    /*
      3. Profile
    */

    const profile =
      await getProfile();


    updateProfileUI(
      profile
    );


    /*
      4. Backend User
    */

    const me =
      await getMe();


    if (
      me?.user
    ) {

      updateTopBar(
        me.user
      );

    }


    console.log(
      "ROCK YOUR BODY CORE READY"
    );


    return {

      ok: true,

      profile,

      user:
        me?.user || null

    };

  }


  /* =======================================================
     PUBLIC API
  ======================================================= */

  window.ROCK = {

    /*
      Core
    */

    config:
      CONFIG,

    api,

    healthCheck,

    init,

    initLiff,


    /*
      LINE
    */

    getProfile,


    /*
      User
    */

    getMe,


    /*
      Dashboard
    */

    getDashboard,

    fetchDashboard,


    /*
      Progress
    */

    getProgress,


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

    claimReward,


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

    goProgress,


    /*
      Storage
    */

    save,

    load,


    /*
      Format
    */

    number,

    coin,

    energy,


    /*
      UI
    */

    updateTopBar,

    updateProfileUI

  };


  console.log(
    "ROCK API FUNCTIONS READY:",
    Object.keys(
      window.ROCK
    )
  );


})();
