/* =========================================================
   ROCK YOUR BODY 2026
   COMMON.JS
   Version: 2026-08-25
========================================================= */

window.ROCK = (() => {

  /* =========================================================
     CONFIG
  ========================================================= */

  const CFG = window.APP_CONFIG;

  if (!CFG) {

    throw new Error(
      "APP_CONFIG ไม่ถูกโหลด"
    );

  }


  console.log(
    "ROCK CONFIG:",
    CFG
  );


  /* =========================================================
     NAVIGATION
  ========================================================= */

  function go(url) {

    if (!url) {

      console.error(
        "NAVIGATION URL EMPTY"
      );

      return false;
    }


    console.log(
      "NAVIGATE:",
      url
    );


    window.location.href =
      url;


    return true;

  }


  /* =========================================================
     JWT
  ========================================================= */

  function decodeJwtPayload(token) {

    try {

      if (!token) {
        return null;
      }


      const parts =
        String(token).split(".");


      if (parts.length !== 3) {

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
          c => c.charCodeAt(0)
        );


      const text =
        new TextDecoder("utf-8")
          .decode(bytes);


      return JSON.parse(text);


    } catch (error) {

      console.warn(
        "JWT DECODE ERROR:",
        error
      );


      return null;

    }

  }


  /* =========================================================
     TOKEN EXPIRED
  ========================================================= */

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
      Number(payload.exp);


    if (!Number.isFinite(exp)) {

      return false;

    }


    const now =
      Math.floor(
        Date.now() / 1000
      );


    return (
      exp <=
      now +
      bufferSeconds
    );

  }


  /* =========================================================
     LIFF RELOGIN
  ========================================================= */

  function relogin(
    reason = "TOKEN_EXPIRED"
  ) {

    const key =
      "rock_liff_relogin_at";


    const now =
      Date.now();


    const last =
      Number(
        sessionStorage.getItem(key) ||
        "0"
      );


    /*
      ป้องกัน Login Loop
    */

    if (
      last > 0 &&
      now - last < 10000
    ) {

      throw new Error(
        "LINE session ยังไม่พร้อม กรุณาปิดหน้านี้แล้วเปิดใหม่จาก LINE"
      );

    }


    sessionStorage.setItem(
      key,
      String(now)
    );


    console.warn(
      "LIFF RELOGIN:",
      reason
    );


    try {

      if (
        typeof liff !== "undefined" &&
        liff.isLoggedIn()
      ) {

        liff.logout();

      }

    } catch (error) {

      console.warn(
        "LIFF LOGOUT ERROR:",
        error
      );

    }


    if (
      typeof liff === "undefined"
    ) {

      throw new Error(
        "LINE LIFF SDK ไม่พร้อม"
      );

    }


    console.log(
      "กำลัง Login LINE ใหม่..."
    );


    liff.login({

      redirectUri:
        window.location.href

    });

  }


  /* =========================================================
     INIT LIFF
  ========================================================= */

  async function initLiff() {

    console.log(
      "================================="
    );

    console.log(
      "ROCK LIFF INITIALIZATION"
    );

    console.log(
      "================================="
    );


    /* -------------------------------------------------------
       CHECK SDK
    ------------------------------------------------------- */

    if (
      typeof liff === "undefined"
    ) {

      throw new Error(
        "LINE LIFF SDK ไม่พร้อม"
      );

    }


    /* -------------------------------------------------------
       CHECK LIFF ID
    ------------------------------------------------------- */

    if (
      !CFG.LIFF_ID
    ) {

      throw new Error(
        "ไม่พบ LIFF ID ใน APP_CONFIG"
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
      "USER AGENT:",
      navigator.userAgent
    );


    /* -------------------------------------------------------
       INIT
    ------------------------------------------------------- */

    try {

      console.log(
        "STEP LIFF 1: เรียก liff.init()"
      );


      await Promise.race([

        liff.init({

          liffId:
            CFG.LIFF_ID

        }),


        new Promise(
          (_, reject) => {

            setTimeout(
              () => {

                reject(
                  new Error(
                    "LIFF init ใช้เวลานานเกิน 15 วินาที"
                  )
                );

              },
              15000
            );

          }
        )

      ]);


      console.log(
        "STEP LIFF 2: liff.init() สำเร็จ"
      );


    } catch (error) {

      console.error(
        "LIFF INIT ERROR:",
        error
      );


      throw new Error(
        "ไม่สามารถเริ่มต้น LINE LIFF ได้: " +
        (
          error?.message ||
          String(error)
        )
      );

    }


    /* -------------------------------------------------------
       STATUS
    ------------------------------------------------------- */

    console.log(
      "LIFF isLoggedIn:",
      liff.isLoggedIn()
    );


    console.log(
      "LIFF isInClient:",
      liff.isInClient()
    );


    /* -------------------------------------------------------
       LOGIN
    ------------------------------------------------------- */

    if (
      !liff.isLoggedIn()
    ) {

      console.log(
        "STEP LIFF 3: ยังไม่ได้ Login"
      );


      try {

        liff.login({

          redirectUri:
            window.location.href

        });


      } catch (error) {

        console.error(
          "LIFF LOGIN ERROR:",
          error
        );


        throw new Error(
          "ไม่สามารถเข้าสู่ระบบ LINE ได้: " +
          (
            error?.message ||
            String(error)
          )
        );

      }


      return false;

    }


    /* -------------------------------------------------------
       ID TOKEN
    ------------------------------------------------------- */

    console.log(
      "STEP LIFF 4: ตรวจ ID Token"
    );


    let token;


    try {

      token =
        liff.getIDToken();

    } catch (error) {

      console.error(
        "GET ID TOKEN ERROR:",
        error
      );


      throw new Error(
        "ไม่สามารถอ่าน LINE ID Token ได้"
      );

    }


    console.log(
      "ID TOKEN:",
      token
        ? "พบ Token"
        : "ไม่พบ Token"
    );


    if (!token) {

      throw new Error(
        "LINE Login สำเร็จ แต่ไม่พบ ID Token"
      );

    }


    console.log(
      "TOKEN LENGTH:",
      token.length
    );


    /* -------------------------------------------------------
       TOKEN EXPIRED
    ------------------------------------------------------- */

    if (
      tokenExpired(
        token,
        60
      )
    ) {

      console.warn(
        "LINE ID TOKEN EXPIRED"
      );


      relogin(
        "TOKEN_EXPIRED_CLIENT"
      );


      return false;

    }


    /* -------------------------------------------------------
       LOGIN READY
    ------------------------------------------------------- */

    sessionStorage.removeItem(
      "rock_liff_relogin_at"
    );


    console.log(
      "================================="
    );

    console.log(
      "LIFF READY"
    );

    console.log(
      "================================="
    );


    return true;

  }


  /* =========================================================
     GET ID TOKEN
  ========================================================= */

  function getIdToken() {

    if (
      typeof liff === "undefined"
    ) {

      throw new Error(
        "LINE LIFF SDK ไม่พร้อม"
      );

    }


    if (
      !liff.isLoggedIn()
    ) {

      throw new Error(
        "ยังไม่ได้เข้าสู่ระบบ LINE"
      );

    }


    const token =
      liff.getIDToken();


    if (!token) {

      throw new Error(
        "ไม่พบ LINE ID Token"
      );

    }


    if (
      tokenExpired(
        token,
        30
      )
    ) {

      const error =
        new Error(
          "LINE ID Token หมดอายุ"
        );


      error.code =
        "TOKEN_EXPIRED";


      throw error;

    }


    return token;

  }


  /* =========================================================
     POST JSON
  ========================================================= */

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
      "================================="
    );

    console.log(
      "POST API"
    );

    console.log(
      "URL:",
      url
    );

    console.log(
      "ACTION:",
      payload?.action
    );

    console.log(
      "HAS ID TOKEN:",
      Boolean(payload?.idToken)
    );

    console.log(
      "================================="
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
        "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้"
      );

    }


    const raw =
      await response.text();


    console.log(
      "API STATUS:",
      response.status
    );


    console.log(
      "API RAW:",
      raw
    );


    let data;


    try {

      data =
        raw
          ? JSON.parse(raw)
          : {};


    } catch (error) {

      console.error(
        "API JSON PARSE ERROR:",
        error
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
          `ดำเนินการไม่สำเร็จ (${response.status})`

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


  /* =========================================================
     TOKEN ERROR CHECK
  ========================================================= */

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

      message.includes("token") ||

      message.includes("idtoken") ||

      message.includes("expired") ||

      message.includes("หมดอายุ") ||

      message.includes("authentication") ||

      message.includes("unauthorized") ||

      message.includes("401") ||

      code === 401 ||

      code === "LINE_AUTH_FAILED" ||

      code === "LINE_TOKEN_MISSING" ||

      code === "TOKEN_EXPIRED"

    );

  }


  /* =========================================================
     AUTHENTICATED POST
  ========================================================= */

  async function postWithFreshToken(
    url,
    payload
  ) {

    let idToken;


    try {

      idToken =
        getIdToken();


    } catch (error) {

      if (
        isTokenError(error)
      ) {

        relogin(
          "TOKEN_EXPIRED_CLIENT_API"
        );


        return await new Promise(
          () => {}
        );

      }


      throw error;

    }


    try {

      return await postJSON(
        url,
        {

          ...payload,

          idToken

        }
      );


    } catch (error) {

      if (
        isTokenError(error)
      ) {

        console.warn(
          "AUTH API TOKEN ERROR:",
          error
        );


        relogin(
          "TOKEN_EXPIRED_SERVER_API"
        );


        return await new Promise(
          () => {}
        );

      }


      throw error;

    }

  }


  /* =========================================================
     PLAYER API
  ========================================================= */

  async function callPlayerApi(
    payload
  ) {

    if (
      !CFG.API?.DASHBOARD
    ) {

      throw new Error(
        "ไม่พบ API.DASHBOARD"
      );

    }


    let idToken;


    try {

      idToken =
        getIdToken();


    } catch (error) {

      console.error(
        "PLAYER API TOKEN ERROR:",
        error
      );


      if (
        isTokenError(error)
      ) {

        relogin(
          "TOKEN_EXPIRED_CLIENT_PLAYER"
        );


        return await new Promise(
          () => {}
        );

      }


      throw error;

    }


    try {

      return await postJSON(

        CFG.API.DASHBOARD,

        {

          ...payload,

          idToken

        }

      );


    } catch (error) {

      console.error(
        "PLAYER API ERROR:",
        error
      );


      if (
        isTokenError(error)
      ) {

        console.warn(
          "TOKEN INVALID FROM SERVER"
        );


        relogin(
          "TOKEN_EXPIRED_SERVER_PLAYER"
        );


        return await new Promise(
          () => {}
        );

      }


      throw error;

    }

  }


  /* =========================================================
     DASHBOARD
  ========================================================= */

  async function fetchDashboard() {

    console.log(
      "FETCH DASHBOARD"
    );


    return await callPlayerApi({

      action:
        "dashboard"

    });

  }


  /* =========================================================
     SAVE WEIGHT
  ========================================================= */

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


  /* =========================================================
     SET TARGET
  ========================================================= */

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


  /* =========================================================
     FORMAT WEIGHT
  ========================================================= */

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


  /* =========================================================
     FORMAT INTEGER
  ========================================================= */

  function fmtInt(value) {

    const n =
      Number(value);


    return Number.isFinite(n)

      ? Math.round(n)
          .toLocaleString("en-US")

      : "0";

  }


  /* =========================================================
     FORMAT DATE
  ========================================================= */

  function formatDate(value) {

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


  /* =========================================================
     FORMAT DATE ONLY
  ========================================================= */

  function formatDateOnly(value) {

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


  /* =========================================================
     NUMBER
  ========================================================= */

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


  /* =========================================================
     PAGE HELPERS
  ========================================================= */

  function goHome() {

    return go(
      CFG.PAGE?.HOME ||
      "./dashboard.html"
    );

  }


  function goWeight() {

    return go(
      CFG.PAGE?.WEIGHT ||
      "./weight-check.html"
    );

  }


  function goProgress() {

    return go(
      CFG.PAGE?.PROGRESS ||
      "./progress.html"
    );

  }


  function goRanking() {

    return go(
      CFG.PAGE?.RANKING ||
      "./ranking.html"
    );

  }


  function goRewards() {

    return go(
      CFG.PAGE?.REWARDS ||
      "./rewards.html"
    );

  }


  function goMission() {

    return go(
      CFG.PAGE?.MISSION ||
      "./mission.html"
    );

  }


  function goBattle() {

    return go(
      CFG.PAGE?.BATTLE ||
      "./battle.html"
    );

  }


  /* =========================================================
     PUBLIC API
  ========================================================= */

  return {

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

    postJSON,

    postWithFreshToken,

    relogin,

    callPlayerApi,

    fetchDashboard,

    saveWeight,

    setTarget,

    fmtWeight,

    fmtInt,

    formatDate,

    formatDateOnly,

    num,

    isTokenError

  };


})();
