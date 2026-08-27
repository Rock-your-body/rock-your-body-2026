/* =========================================================
   ROCK YOUR BODY 2026
   COMMON CORE
   ========================================================= */

(function () {

  "use strict";


  const CONFIG =
    window.ROCK_CONFIG;


  if (!CONFIG) {

    console.error(
      "ROCK_CONFIG is missing."
    );

    return;
  }


  const STORAGE =
    CONFIG.STORAGE;



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
        "Storage save error:",
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
        "Storage load error:",
        error
      );

      return fallback;
    }

  }



  /* =======================================================
     API
     ======================================================= */

  async function api(
    path,
    options = {}
  ) {

    const url =
      CONFIG.API_BASE.replace(
        /\/$/,
        ""
      ) + path;


    const lineUserId =
      localStorage.getItem(
        STORAGE.LINE_USER_ID
      );


    const headers = {

      ...(options.body
        ? {
            "Content-Type":
              "application/json"
          }
        : {}),

      ...(options.headers || {})

    };


    /*
      ส่ง LINE USER ID ให้ Backend
    */

    if (lineUserId) {

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


    let data;


    try {

      data =
        await response.json();

    } catch (error) {

      throw new Error(
        "API returned invalid JSON"
      );

    }


    if (!response.ok) {

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
     LINE LIFF
     ======================================================= */

  async function initLINE() {

    /*
      ตรวจสอบ LIFF
    */

    if (
      typeof liff ===
      "undefined"
    ) {

      console.warn(
        "LINE LIFF SDK not found."
      );


      return {

        ok: false,

        mode: "no-liff"

      };

    }



    /*
      ตรวจสอบ LIFF ID
    */

    if (
      !CONFIG.LIFF_ID ||
      CONFIG.LIFF_ID.includes(
        "ใส่_LIFF_ID"
      )
    ) {

      console.warn(
        "LIFF ID is not configured."
      );


      return {

        ok: false,

        mode: "no-liff-id"

      };

    }



    try {

      /*
        INIT LIFF
      */

      await liff.init({

        liffId:
          CONFIG.LIFF_ID

      });



      /*
        ถ้ายัง Login
      */

      if (
        !liff.isLoggedIn()
      ) {

        liff.login({

          redirectUri:
            window.location.href

        });


        return {

          ok: false,

          mode: "login"

        };

      }



      /*
        ดึง LINE Profile
      */

      const profile =
        await liff.getProfile();



      const lineUserId =
        profile.userId;



      /*
        เก็บ LINE User ID
      */

      localStorage.setItem(

        STORAGE.LINE_USER_ID,

        lineUserId

      );



      /*
        เก็บ LINE Profile
      */

      const lineProfile = {

        userId:
          profile.userId,

        displayName:
          profile.displayName || "",

        pictureUrl:
          profile.pictureUrl || "",

        statusMessage:
          profile.statusMessage || ""

      };


      save(

        STORAGE.LINE_PROFILE,

        lineProfile

      );



      console.log(
        "LINE PROFILE:",
        lineProfile
      );



      return {

        ok: true,

        mode: "line",

        user:
          lineProfile

      };


    } catch (error) {

      console.error(
        "LINE LIFF ERROR:",
        error
      );


      return {

        ok: false,

        mode: "error",

        error:
          error.message

      };

    }

  }



  /* =======================================================
     CURRENT USER
     ======================================================= */

  async function getMe() {

    try {

      /*
        ต้องมี LINE User ID
      */

      const lineUserId =
        localStorage.getItem(
          STORAGE.LINE_USER_ID
        );


      if (!lineUserId) {

        return {

          ok: false,

          error:
            "LINE User ID is required"

        };

      }



      const data =
        await api(
          "/api/me"
        );



      if (data?.user) {

        /*
          รวม LINE Profile
          กับข้อมูล Game
        */

        const lineProfile =
          load(
            STORAGE.LINE_PROFILE,
            {}
          );


        const user = {

          ...data.user,

          lineUserId:

            data.user.lineUserId ||
            lineUserId,

          displayName:

            data.user.displayName ||
            lineProfile.displayName ||
            data.user.name ||
            "สมาชิก ROCK YOUR BODY",

          pictureUrl:

            data.user.pictureUrl ||
            lineProfile.pictureUrl ||
            ""

        };


        save(

          STORAGE.USER,

          user

        );


        return {

          ...data,

          user

        };

      }


      return data;


    } catch (error) {

      console.error(
        "GET USER ERROR:",
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

        method: "POST"

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

        method: "POST"

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

    const target =
      CONFIG.PAGES[page];


    if (!target) {

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



  function coin(value) {

    return number(value);

  }



  function energy(
    value,
    max = CONFIG.MAX_ENERGY
  ) {

    return `${number(value)} / ${number(max)}`;

  }



  /* =======================================================
     UPDATE TOP BAR
     ======================================================= */

  function updateTopBar(
    user
  ) {

    if (!user) return;



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
              user.maxEnergy
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



    /*
      รูป LINE Profile
    */

    document
      .querySelectorAll(
        "[data-line-profile]"
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



    /*
      ชื่อ LINE
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

  }



  /* =======================================================
     INIT
     ======================================================= */

  async function init() {

    console.log(
      "ROCK YOUR BODY CORE INITIALIZING..."
    );


    /*
      1. API Health
    */

    await healthCheck();



    /*
      2. LINE
    */

    if (
      CONFIG.LIFF_ID
    ) {

      const line =
        await initLINE();


      /*
        ถ้ากำลัง Login
        ให้หยุดตรงนี้
      */

      if (
        line.mode === "login"
      ) {

        return {

          ok: false,

          mode: "login"

        };

      }

    }



    /*
      3. โหลด User
    */

    const me =
      await getMe();



    /*
      4. Update UI
    */

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


    return me;

  }



  /* =======================================================
     PUBLIC API
     ======================================================= */

   window.ROCK = {

  config: CONFIG,

  api,

  healthCheck,

  initLINE,

  getMe,

  getDashboard,
  fetchDashboard: getDashboard,

  getMissions,
  completeMission,

  getBattle,
  fightMonster,

  getRewards,

  getRanking,

  go,
  goHome,
  goMission,
  goBattle,
  goReward,
  goRanking,
  goInfo,

  save,
  load,

  number,
  coin,
  energy,

  updateTopBar,

  init
};
