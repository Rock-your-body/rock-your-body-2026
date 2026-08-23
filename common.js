window.ROCK = (() => {

  const CFG = window.APP_CONFIG;

  if (!CFG) {
    throw new Error("APP_CONFIG ไม่ถูกโหลด");
  }


  /* =========================================================
     NAVIGATION
  ========================================================= */

  function go(url) {

    if (!url) {
      return;
    }

    window.location.href = url;
  }


  /* =========================================================
     JWT PAYLOAD
     ใช้ตรวจเวลาหมดอายุของ LINE ID Token
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
          char =>
            char.charCodeAt(0)
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


  /* =========================================================
     TOKEN EXPIRED
  ========================================================= */

  function isIdTokenExpired(
    token,
    bufferSeconds = 60
  ) {

    const payload =
      decodeJwtPayload(token);

    /*
      ถ้าอ่าน JWT ไม่ได้
      ให้ Server ตรวจต่อ
    */

    if (!payload) {
      return false;
    }

    const exp =
      Number(payload.exp);

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


  /* =========================================================
     FORCE LINE LOGIN
  ========================================================= */

  function forceLineLogin() {

    const refreshKey =
      "rock_liff_refreshing";


    /*
      ป้องกัน redirect loop
    */

    if (
      sessionStorage.getItem(
        refreshKey
      ) === "1"
    ) {

      sessionStorage.removeItem(
        refreshKey
      );

      throw new Error(
        "LINE session หมดอายุ กรุณาปิดหน้านี้แล้วเปิดใหม่จาก LINE"
      );
    }


    sessionStorage.setItem(
      refreshKey,
      "1"
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


    /*
      Login ใหม่
      ไม่กำหนด redirectUri เอง
    */

    liff.login();
  }


  /* =========================================================
     INIT LIFF
     ใช้ LIFF ตัวเดียวทั้งระบบ
  ========================================================= */

  async function initLiff() {

    if (
      typeof liff === "undefined"
    ) {

      throw new Error(
        "LINE LIFF SDK ไม่พร้อม"
      );
    }


    if (!CFG.LIFF_ID) {

      throw new Error(
        "ไม่พบ LIFF ID"
      );
    }


    console.log(
      "LIFF INIT:",
      {
        liffId:
          CFG.LIFF_ID,

        url:
          window.location.href
      }
    );


    /* =====================================================
       LIFF INIT
    ====================================================== */

    try {

      await liff.init({
        liffId:
          CFG.LIFF_ID
      });

    } catch (error) {

      console.error(
        "LIFF INIT ERROR:",
        error
      );

      throw new Error(
        "ไม่สามารถเริ่มต้น LINE LIFF ได้"
      );
    }


    /* =====================================================
       LOGIN
    ====================================================== */

    if (
      !liff.isLoggedIn()
    ) {

      console.log(
        "LINE LOGIN REQUIRED"
      );

      liff.login();

      return false;
    }


    /* =====================================================
       GET TOKEN
    ====================================================== */

    const idToken =
      liff.getIDToken();


    console.log(
      "LIFF TOKEN:",
      {
        hasToken:
          Boolean(idToken),

        tokenLength:
          idToken
            ? idToken.length
            : 0,

        loggedIn:
          liff.isLoggedIn(),

        inClient:
          liff.isInClient()
      }
    );


    if (!idToken) {

      console.warn(
        "LINE ID TOKEN MISSING"
      );

      forceLineLogin();

      return false;
    }


    /* =====================================================
       CHECK TOKEN EXPIRED
    ====================================================== */

    if (
      isIdTokenExpired(
        idToken,
        60
      )
    ) {

      console.warn(
        "LINE ID TOKEN EXPIRED"
      );

      forceLineLogin();

      return false;
    }


    /*
      Token ใช้งานได้แล้ว
      ล้างสถานะ refresh
    */

    sessionStorage.removeItem(
      "rock_liff_refreshing"
    );


    console.log(
      "LIFF READY"
    );


    return true;
  }


  /* =========================================================
     GET ID TOKEN
  ========================================================= */

  function getIdToken() {

    if (
      typeof liff ===
      "undefined"
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
      isIdTokenExpired(
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
     LOGIN AGAIN
  ========================================================= */

  function loginAgain() {

    try {

      sessionStorage.removeItem(
        "rock_liff_refreshing"
      );


      if (
        typeof liff !==
          "undefined" &&
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
      typeof liff !==
      "undefined"
    ) {

      liff.login();

      return;
    }


    window.location.href =
      CFG.PAGE?.HOME ||
      "./dashboard.html";
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
      "POST API:",
      {
        url,

        action:
          payload?.action,

        hasIdToken:
          Boolean(
            payload?.idToken
          ),

        tokenLength:
          payload?.idToken
            ? payload.idToken.length
            : 0
      }
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


    let data;


    try {

      data =
        raw
          ? JSON.parse(raw)
          : {};

    } catch (error) {

      console.error(
        "API RAW RESPONSE:",
        raw
      );

      throw new Error(
        "API ตอบกลับไม่ถูกต้อง"
      );
    }


    console.log(
      "API RESPONSE:",
      {
        status:
          response.status,

        success:
          data?.success,

        code:
          data?.code,

        error:
          data?.error
      }
    );


    /* =====================================================
       API ERROR
    ====================================================== */

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


      throw error;
    }


    return data;
  }


  /* =========================================================
     API CALL WITH TOKEN
  ========================================================= */

  async function callPlayerApi(
    payload
  ) {

    const idToken =
      getIdToken();


    try {

      return await postJSON(
        CFG.API.DASHBOARD,
        {
          ...payload,
          idToken
        }
      );

    } catch (error) {

      /*
        ถ้า Server แจ้ง Token หมดอายุ
        Login ใหม่
      */

      if (
        isTokenError(error)
      ) {

        const message =
          String(
            error?.message ||
            ""
          )
            .toLowerCase();


        if (
          message.includes(
            "expired"
          ) ||
          message.includes(
            "หมดอายุ"
          )
        ) {

          console.warn(
            "SERVER REPORTS TOKEN EXPIRED"
          );


          try {

            forceLineLogin();

          } catch (
            refreshError
          ) {

            throw refreshError;
          }


          return new Promise(
            () => {}
          );
        }
      }


      throw error;
    }
  }


  /* =========================================================
     DASHBOARD
  ========================================================= */

  async function fetchDashboard() {

    return await callPlayerApi({
      action:
        "dashboard"
    });
  }


  /* =========================================================
     SAVE WEIGHT
     TEST MODE
     บันทึกได้หลายครั้งต่อวัน
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
      Number(
        targetWeight
      );


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


    const number =
      Number(value);


    return Number.isFinite(
      number
    )
      ? number.toFixed(1)
      : "--.-";
  }


  /* =========================================================
     FORMAT INTEGER
  ========================================================= */

  function fmtInt(
    value
  ) {

    const number =
      Number(value);


    return Number.isFinite(
      number
    )
      ? Math.round(number)
          .toLocaleString(
            "en-US"
          )
      : "0";
  }


  /* =========================================================
     FORMAT DATE + TIME
  ========================================================= */

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


  /* =========================================================
     FORMAT DATE ONLY
  ========================================================= */

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


  /* =========================================================
     NUMBER
  ========================================================= */

  function num(
    value,
    fallback = 0
  ) {

    const number =
      Number(value);


    return Number.isFinite(
      number
    )
      ? number
      : fallback;
  }


  /* =========================================================
     TOKEN ERROR
  ========================================================= */

  function isTokenError(
    error
  ) {

    const message =
      String(
        error?.message ||
        error ||
        ""
      )
        .toLowerCase();


    const code =
      error?.code;


    return (

      message.includes(
        "token"
      ) ||

      message.includes(
        "idtoken"
      ) ||

      message.includes(
        "expired"
      ) ||

      message.includes(
        "หมดอายุ"
      ) ||

      message.includes(
        "authentication"
      ) ||

      message.includes(
        "unauthorized"
      ) ||

      message.includes(
        "401"
      ) ||

      code === 401 ||

      code ===
        "LINE_AUTH_FAILED" ||

      code ===
        "TOKEN_EXPIRED"

    );
  }


  /* =========================================================
     PAGE HELPERS
  ========================================================= */

  function goHome() {

    go(
      CFG.PAGE?.HOME ||
      "./dashboard.html"
    );
  }


  function goWeight() {

    go(
      CFG.PAGE?.WEIGHT ||
      "./weight-check.html"
    );
  }


  function goProgress() {

    go(
      CFG.PAGE?.PROGRESS ||
      "./progress.html"
    );
  }


  function goMission() {

    go(
      CFG.PAGE?.MISSION ||
      "./mission.html"
    );
  }


  function goBattle() {

    go(
      CFG.PAGE?.BATTLE ||
      "./battle.html"
    );
  }


  function goRanking() {

    go(
      CFG.PAGE?.RANKING ||
      "./ranking.html"
    );
  }


  function goRewards() {

    go(
      CFG.PAGE?.REWARDS ||
      "./rewards.html"
    );
  }


  /* =========================================================
     PUBLIC
  ========================================================= */

  return {

    CFG,

    go,

    goHome,

    goWeight,

    goProgress,

    goMission,

    goBattle,

    goRanking,

    goRewards,

    initLiff,

    getIdToken,

    loginAgain,

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

    isTokenError

  };

})();
