window.ROCK = (() => {

  const CFG = window.APP_CONFIG;

  if (!CFG) {
    throw new Error("APP_CONFIG ไม่ถูกโหลด");
  }


  /* =========================================================
     NAVIGATION
  ========================================================= */

  function go(url) {
    if (!url) return;
    window.location.href = url;
  }


  /* =========================================================
     JWT
  ========================================================= */

  function decodeJwtPayload(token) {

    try {

      if (!token) return null;

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
     LIFF LOGIN REFRESH
  ========================================================= */

  function relogin() {

    const key =
      "rock_liff_relogin";

    const count =
      Number(
        sessionStorage.getItem(key) ||
        "0"
      );

    if (count >= 1) {

      sessionStorage.removeItem(
        key
      );

      throw new Error(
        "LINE session หมดอายุ กรุณาปิดหน้านี้แล้วเปิดใหม่จาก LINE"
      );
    }


    sessionStorage.setItem(
      key,
      String(count + 1)
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


    liff.login();
  }


  /* =========================================================
     INIT LIFF
     LIFF ตัวเดียวทั้งระบบ
  ========================================================= */

  async function initLiff() {

    if (
      typeof liff ===
      "undefined"
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


    if (
      !liff.isLoggedIn()
    ) {

      console.log(
        "LINE LOGIN REQUIRED"
      );

      liff.login();

      return false;
    }


    const token =
      liff.getIDToken();


    console.log(
      "LIFF TOKEN CHECK:",
      {
        hasToken:
          Boolean(token),

        tokenLength:
          token
            ? token.length
            : 0,

        inClient:
          liff.isInClient(),

        loggedIn:
          liff.isLoggedIn()
      }
    );


    if (!token) {

      relogin();

      return false;
    }


    if (
      tokenExpired(
        token,
        60
      )
    ) {

      console.warn(
        "LINE ID TOKEN EXPIRED"
      );

      relogin();

      return false;
    }


    sessionStorage.removeItem(
      "rock_liff_relogin"
    );


    return true;
  }


  /* =========================================================
     GET TOKEN
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
      "POST API:",
      {
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

    } catch {

      console.error(
        "API RAW:",
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
      message.includes("token") ||
      message.includes("idtoken") ||
      message.includes("expired") ||
      message.includes("หมดอายุ") ||
      message.includes("authentication") ||
      message.includes("unauthorized") ||
      message.includes("401") ||
      code === 401 ||
      code ===
        "LINE_AUTH_FAILED" ||
      code ===
        "LINE_TOKEN_MISSING" ||
      code ===
        "TOKEN_EXPIRED"
    );
  }


  /* =========================================================
     PLAYER API
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
          message.includes("expired") ||
          message.includes("หมดอายุ")
        ) {

          console.warn(
            "TOKEN EXPIRED FROM SERVER"
          );

          relogin();

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
     TEST MODE: หลายครั้งต่อวัน
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
     FORMAT
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


  /* =========================================================
     PUBLIC
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
