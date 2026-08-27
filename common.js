/* =========================================================
   ROCK YOUR BODY 2026
   COMMON.JS
   Version: 2026-08-27-FINAL

   FLOW

   LINE
     ↓
   LIFF
     ↓
   ID TOKEN
     ↓
   player-dashboard API
     ↓
   dashboard data
     ↓
   window.ROCK
   ========================================================= */

(function () {

  "use strict";


  /* =======================================================
     CONFIG
  ======================================================= */

  const CFG =
    window.APP_CONFIG;


  if (!CFG) {

    console.error(
      "APP_CONFIG ไม่ถูกโหลด"
    );

    return;

  }


  /* =======================================================
     STATE
  ======================================================= */

  let liffInitialized =
    false;

  let liffInitializing =
    null;


  /* =======================================================
     NAVIGATION
  ======================================================= */

  function go(url) {

    if (!url) {

      console.error(
        "NAVIGATION URL EMPTY"
      );

      return false;

    }

    window.location.href =
      url;

    return true;

  }


  function goHome() {

    return go(
      CFG.PAGE.HOME
    );

  }


  function goMission() {

    return go(
      CFG.PAGE.MISSION
    );

  }


  function goBattle() {

    return go(
      CFG.PAGE.BATTLE
    );

  }


  function goWeight() {

    return go(
      CFG.PAGE.WEIGHT
    );

  }


  function goProgress() {

    return go(
      CFG.PAGE.PROGRESS
    );

  }


  function goRewards() {

    return go(
      CFG.PAGE.REWARDS
    );

  }


  function goRanking() {

    return go(
      CFG.PAGE.RANKING
    );

  }


  /* =======================================================
     LIFF STATUS
  ======================================================= */

  function isLiffReady() {

    return (
      typeof window.liff !==
        "undefined"
    );

  }


  function isLoggedIn() {

    try {

      if (!isLiffReady()) {
        return false;
      }

      return Boolean(
        window.liff.isLoggedIn()
      );

    } catch (error) {

      console.warn(
        "LIFF LOGIN CHECK:",
        error
      );

      return false;

    }

  }


  function isInClient() {

    try {

      if (!isLiffReady()) {
        return false;
      }

      return Boolean(
        window.liff.isInClient()
      );

    } catch (error) {

      return false;

    }

  }


  /* =======================================================
     INIT LIFF
  ======================================================= */

  async function initLiff() {

    /* already ready */

    if (liffInitialized) {

      return true;

    }


    /* prevent duplicate init */

    if (liffInitializing) {

      return await liffInitializing;

    }


    liffInitializing =
      (async function () {

        console.log(
          "ROCK LIFF INIT"
        );


        /* SDK */

        if (!isLiffReady()) {

          throw new Error(
            "ไม่พบ LINE LIFF SDK"
          );

        }


        /* LIFF ID */

        if (!CFG.LIFF_ID) {

          throw new Error(
            "ไม่พบ LIFF ID"
          );

        }


        console.log(
          "LIFF ID:",
          CFG.LIFF_ID
        );


        console.log(
          "CURRENT URL:",
          window.location.href
        );


        /* -------------------------------------------------
           INIT
        ------------------------------------------------- */

        try {

          await window.liff.init({

            liffId:
              CFG.LIFF_ID,

            withLoginOnExternalBrowser:
              true

          });

        } catch (error) {

          console.error(
            "LIFF INIT ERROR:",
            error
          );

          throw new Error(
            "LIFF เริ่มต้นไม่สำเร็จ: " +
            (
              error?.message ||
              String(error)
            )
          );

        }


        console.log(
          "LIFF INIT SUCCESS"
        );


        /* -------------------------------------------------
           LOGIN
        ------------------------------------------------- */

        if (!isLoggedIn()) {

          console.log(
            "LINE ยังไม่ได้ Login"
          );


          /*
             ใน LINE LIFF Client
             ไม่ต้อง login ซ้ำ
          */

          if (isInClient()) {

            console.warn(
              "อยู่ใน LINE แต่ยังไม่มี Login"
            );

            return false;

          }


          /*
             External browser
          */

          try {

            window.liff.login({
              redirectUri:
                window.location.href
            });

          } catch (error) {

            console.error(
              "LIFF LOGIN ERROR:",
              error
            );

          }


          return false;

        }


        /* -------------------------------------------------
           TOKEN
        ------------------------------------------------- */

        const token =
          window.liff.getIDToken();


        if (!token) {

          throw new Error(
            "ไม่พบ LINE ID Token"
          );

        }


        console.log(
          "LINE ID TOKEN READY"
        );


        liffInitialized =
          true;


        return true;

      })();


    try {

      return await liffInitializing;

    } finally {

      liffInitializing =
        null;

    }

  }


  /* =======================================================
     GET ID TOKEN
  ======================================================= */

  function getIdToken() {

    if (!isLiffReady()) {

      const error =
        new Error(
          "LINE LIFF SDK ไม่พร้อม"
        );

      error.code =
        "LIFF_SDK_MISSING";

      throw error;

    }


    if (!window.liff.isLoggedIn()) {

      const error =
        new Error(
          "ยังไม่ได้เข้าสู่ระบบ LINE"
        );

      error.code =
        "LINE_NOT_LOGGED_IN";

      throw error;

    }


    const token =
      window.liff.getIDToken();


    if (!token) {

      const error =
        new Error(
          "ไม่พบ LINE ID Token"
        );

      error.code =
        "LINE_TOKEN_MISSING";

      throw error;

    }


    return token;

  }


  /* =======================================================
     GET LINE PROFILE
  ======================================================= */

  async function getProfile() {

    try {

      if (!isLiffReady()) {
        return null;
      }

      if (!window.liff.isLoggedIn()) {
        return null;
      }

      return await
        window.liff.getProfile();

    } catch (error) {

      console.warn(
        "GET PROFILE ERROR:",
        error
      );

      return null;

    }

  }


  /* =======================================================
     POST JSON
  ======================================================= */

  async function postJSON(
    url,
    payload
  ) {

    if (!url) {

      throw new Error(
        "ไม่พบ API URL"
      );

    }


    console.log(
      "POST API:",
      url
    );


    let response;


    try {

      response =
        await fetch(
          url,
          {

            method:
              "POST",

            headers: {

              "Content-Type":
                "application/json"

            },

            body:
              JSON.stringify(
                payload
              )

          }
        );

    } catch (error) {

      console.error(
        "NETWORK ERROR:",
        error
      );

      throw new Error(
        "ไม่สามารถเชื่อมต่อ API ได้"
      );

    }


    const raw =
      await response.text();


    let data =
      {};


    try {

      data =
        raw
          ? JSON.parse(raw)
          : {};

    } catch (error) {

      console.error(
        "API RAW:",
        raw
      );

      throw new Error(
        "API ตอบกลับไม่ใช่ JSON"
      );

    }


    console.log(
      "API RESPONSE:",
      data
    );


    if (
      !response.ok ||
      data?.success === false ||
      data?.ok === false
    ) {

      const error =
        new Error(
          data?.error ||
          data?.message ||
          (
            "API ERROR " +
            response.status
          )
        );


      error.code =
        data?.code ||
        response.status;


      error.data =
        data;


      throw error;

    }


    return data;

  }


  /* =======================================================
     PLAYER API
  ======================================================= */

  async function callPlayerApi(
    payload
  ) {

    if (
      !CFG.API ||
      !CFG.API.DASHBOARD
    ) {

      throw new Error(
        "ยังไม่ได้ตั้งค่า API.DASHBOARD"
      );

    }


    const idToken =
      getIdToken();


    return await postJSON(

      CFG.API.DASHBOARD,

      {

        ...payload,

        idToken

      }

    );

  }


  /* =======================================================
     DASHBOARD
  ======================================================= */

  async function fetchDashboard() {

    return await
      callPlayerApi({

        action:
          "dashboard"

      });

  }


  /* =======================================================
     SAVE WEIGHT
  ======================================================= */

  async function saveWeight(
    weight
  ) {

    const value =
      Number(weight);


    if (
      !Number.isFinite(value) ||
      value < 20 ||
      value > 400
    ) {

      throw new Error(
        "น้ำหนักต้องอยู่ระหว่าง 20 - 400 kg"
      );

    }


    return await
      callPlayerApi({

        action:
          "saveWeight",

        weight:
          value

      });

  }


  /* =======================================================
     SET TARGET
  ======================================================= */

  async function setTarget(
    targetWeight
  ) {

    const value =
      Number(targetWeight);


    if (
      !Number.isFinite(value) ||
      value < 20 ||
      value > 400
    ) {

      throw new Error(
        "เป้าหมายต้องอยู่ระหว่าง 20 - 400 kg"
      );

    }


    return await
      callPlayerApi({

        action:
          "setTarget",

        targetWeight:
          value

      });

  }


  /* =======================================================
     FORMAT WEIGHT
  ======================================================= */

  function fmtWeight(
    value
  ) {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {

      return "--.-";

    }


    const n =
      Number(value);


    return Number.isFinite(n)

      ? n.toFixed(1)

      : "--.-";

  }


  /* =======================================================
     FORMAT INTEGER
  ======================================================= */

  function fmtInt(
    value
  ) {

    const n =
      Number(value);


    return Number.isFinite(n)

      ? Math.round(n)
          .toLocaleString(
            "en-US"
          )

      : "0";

  }


  /* =======================================================
     FORMAT DATE
  ======================================================= */

  function formatDate(
    value
  ) {

    if (!value) {

      return "-";

    }


    const date =
      new Date(value);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "-";

    }


    return date.toLocaleString(

      "th-TH",

      {

        dateStyle:
          "short",

        timeStyle:
          "short"

      }

    );

  }


  /* =======================================================
     FORMAT DATE ONLY
  ======================================================= */

  function formatDateOnly(
    value
  ) {

    if (!value) {

      return "--/--/----";

    }


    const date =
      new Date(value);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "--/--/----";

    }


    return date.toLocaleDateString(

      "th-TH",

      {

        day:
          "2-digit",

        month:
          "2-digit",

        year:
          "numeric"

      }

    );

  }


  /* =======================================================
     NUMBER
  ======================================================= */

  function num(
    value,
    fallback = 0
  ) {

    const n =
      Number(value);


    return Number.isFinite(n)

      ? n

      : fallback;

  }


  /* =======================================================
     LOGOUT
  ======================================================= */

  function logout() {

    try {

      if (
        isLiffReady() &&
        window.liff.isLoggedIn()
      ) {

        window.liff.logout();

      }

    } catch (error) {

      console.warn(
        "LOGOUT ERROR:",
        error
      );

    }


    liffInitialized =
      false;


    window.location.reload();

  }


  /* =======================================================
     PUBLIC API
  ======================================================= */

  window.ROCK = {

    CFG,

    go,

    goHome,

    goMission,

    goBattle,

    goWeight,

    goProgress,

    goRewards,

    goRanking,

    initLiff,

    getIdToken,

    getProfile,

    postJSON,

    callPlayerApi,

    fetchDashboard,

    saveWeight,

    setTarget,

    fmtWeight,

    fmtInt,

    formatDate,

    formatDateOnly,

    num,

    logout

  };


  /* =======================================================
     READY
  ======================================================= */

  console.log(
    "================================="
  );

  console.log(
    "ROCK COMMON.JS READY"
  );

  console.log(
    "ROCK:",
    window.ROCK
  );

  console.log(
    "ROCK.fetchDashboard:",
    typeof window.ROCK.fetchDashboard
  );

  console.log(
    "ROCK.initLiff:",
    typeof window.ROCK.initLiff
  );

  console.log(
    "================================="
  );


})();
