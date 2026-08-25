/* =========================================================
   ROCK YOUR BODY 2026
   COMMON.JS
   Version: 2026-08-25-FIX-LIFF
========================================================= */

(function () {

  "use strict";


  /* =======================================================
     CONFIG
  ======================================================= */

  const CFG = window.APP_CONFIG;


  if (!CFG) {

    console.error(
      "APP_CONFIG ไม่ถูกโหลด"
    );

    throw new Error(
      "APP_CONFIG ไม่ถูกโหลด"
    );

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


  function goRanking() {

    return go(
      CFG.PAGE.RANKING
    );

  }


  function goRewards() {

    return go(
      CFG.PAGE.REWARDS
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


  /* =======================================================
     JWT DECODE
  ======================================================= */

  function decodeJwtPayload(token) {

    try {

      if (!token) {

        return null;

      }


      const parts =
        String(token).split(".");


      if (
        parts.length !== 3
      ) {

        return null;

      }


      let base64 =
        parts[1]
          .replace(/-/g, "+")
          .replace(/_/g, "/");


      while (
        base64.length % 4 !== 0
      ) {

        base64 += "=";

      }


      const binary =
        atob(base64);


      const bytes =
        Uint8Array.from(
          binary,
          function (c) {

            return c.charCodeAt(0);

          }
        );


      const text =
        new TextDecoder(
          "utf-8"
        ).decode(bytes);


      return JSON.parse(text);


    } catch (error) {

      console.warn(
        "JWT DECODE ERROR:",
        error
      );


      return null;

    }

  }


  /* =======================================================
     TOKEN EXPIRED
  ======================================================= */

  function tokenExpired(
    token,
    bufferSeconds = 60
  ) {

    const payload =
      decodeJwtPayload(token);


    if (!payload) {

      return false;

    }


    const exp =
      Number(
        payload.exp
      );


    if (
      !Number.isFinite(exp)
    ) {

      return false;

    }


    const now =
      Math.floor(
        Date.now() / 1000
      );


    return (
      exp <=
      now + bufferSeconds
    );

  }


  /* =======================================================
     INIT LIFF
  ======================================================= */

  async function initLiff() {

    /*
      ป้องกัน init ซ้ำ
    */

    if (liffInitialized) {

      return true;

    }


    if (liffInitializing) {

      return await liffInitializing;

    }


    liffInitializing =
      (async function () {

        console.log(
          "================================="
        );

        console.log(
          "ROCK LIFF INIT"
        );

        console.log(
          "================================="
        );


        /* -----------------------------------------------
           CHECK SDK
        ------------------------------------------------ */

        if (
          typeof window.liff ===
          "undefined"
        ) {

          throw new Error(
            "ไม่พบ LINE LIFF SDK"
          );

        }


        /* -----------------------------------------------
           CHECK LIFF ID
        ------------------------------------------------ */

        if (
          !CFG.LIFF_ID
        ) {

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


        console.log(
          "IS LIFF CLIENT BEFORE INIT:",
          safeIsInClient()
        );


        /* -----------------------------------------------
           LIFF INIT
        ------------------------------------------------ */

        try {

          await window.liff.init({

            liffId:
              CFG.LIFF_ID,

            /*
              เปิด automatic login เฉพาะ
              external browser

              ใน LINE LIFF browser
              LINE จะจัดการ login เอง
            */

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


        const inClient =
          safeIsInClient();


        const loggedIn =
          safeIsLoggedIn();


        console.log(
          "LIFF IN CLIENT:",
          inClient
        );


        console.log(
          "LIFF LOGGED IN:",
          loggedIn
        );


        /* -----------------------------------------------
           LOGIN STATUS
        ------------------------------------------------ */

        if (!loggedIn) {

          /*
            ถ้าอยู่ใน LINE แล้วแต่ยังไม่มี login
            ห้ามเรียก login ซ้ำ
          */

          if (inClient) {

            console.warn(
              "อยู่ใน LINE LIFF แต่สถานะ Login ยังไม่พร้อม"
            );


            return false;

          }


          /*
            External browser

            withLoginOnExternalBrowser:true
            จะจัดการ login ให้อัตโนมัติ
          */

          console.log(
            "External browser: waiting for LINE Login"
          );


          return false;

        }


        /* -----------------------------------------------
           ID TOKEN
        ------------------------------------------------ */

        let token =
          null;


        try {

          token =
            window.liff.getIDToken();

        } catch (error) {

          console.error(
            "GET ID TOKEN ERROR:",
            error
          );

        }


        /*
          ถ้าไม่มี ID token

          อย่า logout
          อย่า login วน
        */

        if (!token) {

          console.warn(
            "ไม่มี ID TOKEN"
          );


          /*
            ถ้าไม่ได้เปิด openid scope
            จะไม่สามารถใช้ getIDToken ได้
          */

          return true;

        }


        console.log(
          "ID TOKEN FOUND"
        );


        console.log(
          "TOKEN LENGTH:",
          token.length
        );


        /*
          ตรวจ expiration เฉพาะกรณี decode ได้
        */

        if (
          tokenExpired(
            token,
            30
          )
        ) {

          console.warn(
            "ID TOKEN ใกล้หมดอายุ"
          );

        }


        liffInitialized =
          true;


        console.log(
          "================================="
        );

        console.log(
          "ROCK LIFF READY"
        );

        console.log(
          "================================="
        );


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
     SAFE LIFF STATUS
  ======================================================= */

  function safeIsInClient() {

    try {

      if (
        typeof window.liff ===
        "undefined"
      ) {

        return false;

      }


      return Boolean(
        window.liff.isInClient()
      );


    } catch (error) {

      return false;

    }

  }


  function safeIsLoggedIn() {

    try {

      if (
        typeof window.liff ===
        "undefined"
      ) {

        return false;

      }


      return Boolean(
        window.liff.isLoggedIn()
      );


    } catch (error) {

      return false;

    }

  }


  /* =======================================================
     GET ID TOKEN
  ======================================================= */

  function getIdToken() {

    if (
      typeof window.liff ===
      "undefined"
    ) {

      throw new Error(
        "LINE LIFF SDK ไม่พร้อม"
      );

    }


    if (
      !window.liff.isLoggedIn()
    ) {

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
     GET PROFILE
  ======================================================= */

  async function getProfile() {

    if (
      typeof window.liff ===
      "undefined"
    ) {

      return null;

    }


    try {

      if (
        !window.liff.isLoggedIn()
      ) {

        return null;

      }


      return await window.liff.getProfile();


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


    let data;


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
      data?.success === false
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
     TOKEN ERROR
  ======================================================= */

  function isTokenError(error) {

    const message =
      String(
        error?.message ||
        error ||
        ""
      ).toLowerCase();


    const code =
      error?.code;


    return (

      code === 401 ||

      code ===
        "LINE_AUTH_FAILED" ||

      code ===
        "LINE_TOKEN_MISSING" ||

      code ===
        "TOKEN_EXPIRED" ||

      message.includes(
        "unauthorized"
      ) ||

      message.includes(
        "authentication"
      ) ||

      message.includes(
        "id token"
      ) ||

      message.includes(
        "idtoken"
      ) ||

      message.includes(
        "token"
      ) ||

      message.includes(
        "401"
      )

    );

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
        "ยังไม่ได้ตั้งค่า API.DASHBOARD ใน app-config.js"
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

    return await callPlayerApi({

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


    return await callPlayerApi({

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


    return await callPlayerApi({

      action:
        "setTarget",

      targetWeight:
        value

    });

  }


  /* =======================================================
     FORMAT WEIGHT
  ======================================================= */

  function fmtWeight(value) {

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

  function fmtInt(value) {

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
        typeof window.liff !==
          "undefined" &&
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

    goWeight,

    goProgress,

    goRanking,

    goRewards,

    goMission,

    goBattle,

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

    isTokenError,

    logout

  };


  console.log(
    "================================="
  );

  console.log(
    "ROCK COMMON.JS READY"
  );

  console.log(
    "ROCK.initLiff:",
    typeof window.ROCK.initLiff
  );

  console.log(
    "================================="
  );


})();
