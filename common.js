/* =========================================================
   ROCK YOUR BODY 2026
   COMMON.JS
   Version: 2026-08-25-FIX-LIFF
========================================================= */

window.ROCK = (() => {

  /* =========================================================
     CONFIG
  ========================================================= */

  const CFG = window.APP_CONFIG;

  if (!CFG) {
    throw new Error("APP_CONFIG ไม่ถูกโหลด");
  }

  console.log("ROCK CONFIG:", CFG);


  /* =========================================================
     STATE
  ========================================================= */

  let liffReady = false;
  let liffInitPromise = null;


  /* =========================================================
     NAVIGATION
  ========================================================= */

  function go(url) {

    if (!url) {
      console.error("NAVIGATION URL EMPTY");
      return false;
    }

    console.log("NAVIGATE:", url);

    window.location.href = url;

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

      while (base64.length % 4 !== 0) {
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

    return exp <= now + bufferSeconds;
  }


  /* =========================================================
     CHECK LIFF SDK
  ========================================================= */

  function checkLiffSDK() {

    if (
      typeof window.liff === "undefined"
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
  }


  /* =========================================================
     LIFF LOGIN
     
     สำคัญ:
     - ไม่ logout
     - ไม่บังคับ login ซ้ำ
     - ไม่สร้าง login loop
  ========================================================= */

  function loginLiff() {

    checkLiffSDK();

    console.log(
      "LIFF LOGIN REQUEST"
    );

    /*
      ถ้าอยู่ใน LINE App
      ให้ LIFF จัดการ session เอง
    */

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

      throw error;
    }
  }


  /* =========================================================
     INIT LIFF
     
     จุดสำคัญของตัวแก้:
     
     1. init เพียงครั้งเดียว
     2. ไม่ logout
     3. ถ้า login อยู่แล้ว ใช้ session เดิม
     4. ถ้าไม่ได้ login ค่อยเรียก login
     5. ไม่ตรวจ JWT หมดอายุแล้ว logout ทันที
  ========================================================= */

 async function initLiff() {

    if (typeof liff === "undefined") {
        throw new Error("LINE LIFF SDK ไม่พร้อม");
    }

    await liff.init({
        liffId: CFG.LIFF_ID
    });

    console.log("LIFF INIT OK");
    console.log("In Client:", liff.isInClient());
    console.log("Logged In:", liff.isLoggedIn());

    /*
     * อยู่ใน LINE / LIFF Browser
     */
    if (liff.isInClient()) {

        console.log("เปิดจาก LINE");

        /*
         * ห้าม liff.login() ตรงนี้
         */

        return true;
    }

    /*
     * เปิดจาก Chrome / Browser ภายนอก
     */
    if (!liff.isLoggedIn()) {

        console.log(
            "เปิดจาก Browser ภายนอก → LINE Login"
        );

        liff.login({
            redirectUri:
                window.location.href
        });

        return false;
    }

    return true;
}
        /* ---------------------------------------------------
           SDK
        --------------------------------------------------- */

        checkLiffSDK();


        console.log(
          "LIFF ID:",
          CFG.LIFF_ID
        );

        console.log(
          "CURRENT URL:",
          window.location.href
        );

        console.log(
          "IS HTTPS:",
          location.protocol === "https:"
        );


        /* ---------------------------------------------------
           INIT
        --------------------------------------------------- */

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

          liffInitPromise = null;

          throw new Error(
            "ไม่สามารถเริ่มต้น LINE LIFF ได้: " +
            (
              error?.message ||
              String(error)
            )
          );
        }


        console.log(
          "LIFF INIT SUCCESS"
        );


        /* ---------------------------------------------------
           STATUS
        --------------------------------------------------- */

        const loggedIn =
          liff.isLoggedIn();

        const inClient =
          liff.isInClient();


        console.log(
          "LIFF STATUS:",
          {
            loggedIn,
            inClient
          }
        );


        /* ---------------------------------------------------
           NOT LOGGED IN
        --------------------------------------------------- */

        if (!loggedIn) {

          console.warn(
            "LIFF: USER NOT LOGGED IN"
          );


          /*
            สำคัญมาก

            ถ้าเปิดจาก LINE
            ให้ login ผ่าน LIFF

            ถ้าเปิดจาก browser ธรรมดา
            ก็ยังสามารถ login ผ่าน LINE ได้
          */

          loginLiff();

          return false;
        }


        /* ---------------------------------------------------
           GET ID TOKEN
        --------------------------------------------------- */

        let token = null;

        try {

          token =
            liff.getIDToken();

        } catch (error) {

          console.warn(
            "GET ID TOKEN ERROR:",
            error
          );
        }


        /*
          ไม่บังคับ logout
          
          บางกรณี LIFF session พร้อม
          แต่ ID Token ยังไม่พร้อมในจังหวะแรก
        */

        if (!token) {

          console.warn(
            "LIFF LOGIN OK แต่ ID TOKEN ยังไม่พร้อม"
          );

          /*
            ให้หน้าเว็บลอง get ใหม่ภายหลัง
          */

          liffReady = true;

          return true;
        }


        console.log(
          "LIFF ID TOKEN FOUND:",
          token.length
        );


        /* ---------------------------------------------------
           TOKEN INFORMATION
        --------------------------------------------------- */

        const payload =
          decodeJwtPayload(token);


        if (payload) {

          console.log(
            "LIFF TOKEN:",
            {
              sub:
                payload.sub
                  ? "FOUND"
                  : "NONE",

              iss:
                payload.iss,

              exp:
                payload.exp
            }
          );


          /*
            ถ้า token ใกล้หมดอายุ
            ไม่ logout อัตโนมัติ

            เพราะการ logout คือสาเหตุหนึ่ง
            ที่ทำให้ผู้ใช้เด้งกลับ LINE Login
          */

          if (
            tokenExpired(
              token,
              10
            )
          ) {

            console.warn(
              "LIFF TOKEN NEAR EXPIRY"
            );

          }
        }


        /* ---------------------------------------------------
           READY
        --------------------------------------------------- */

        liffReady = true;

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

      })();


    return liffInitPromise;
  }


  /* =========================================================
     IS LIFF READY
  ========================================================= */

  function isLiffReady() {

    return (
      liffReady &&
      typeof window.liff !== "undefined" &&
      liff.isLoggedIn()
    );
  }


  /* =========================================================
     GET ID TOKEN
  ========================================================= */

  function getIdToken() {

    checkLiffSDK();


    /*
      ถ้ายังไม่ได้ login
      อย่า logout
      อย่าทำ login loop
    */

    if (!liff.isLoggedIn()) {

      const error =
        new Error(
          "ยังไม่ได้เข้าสู่ระบบ LINE"
        );

      error.code =
        "LINE_NOT_LOGGED_IN";

      throw error;
    }


    let token;

    try {

      token =
        liff.getIDToken();

    } catch (error) {

      console.error(
        "GET ID TOKEN ERROR:",
        error
      );

      const err =
        new Error(
          "ไม่สามารถอ่าน LINE ID Token ได้"
        );

      err.code =
        "LINE_TOKEN_READ_ERROR";

      throw err;
    }


    if (!token) {

      const error =
        new Error(
          "ไม่พบ LINE ID Token"
        );

      error.code =
        "LINE_TOKEN_MISSING";

      throw error;
    }


    /*
      ตรวจ token หมดอายุ
      แต่ไม่ logout
    */

    if (
      tokenExpired(
        token,
        5
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
     SAFE TOKEN
  ========================================================= */

  async function ensureLiff() {

    if (
      isLiffReady()
    ) {

      return true;
    }


    const ready =
      await initLiff();


    return ready === true;
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
      Boolean(
        payload?.idToken
      )
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
                "application/json",

              "Accept":
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
     TOKEN ERROR
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
     
     สำคัญ:
     ไม่มี relogin อัตโนมัติ
     
     เพราะถ้า API ตอบ 401
     เราจะไม่ส่งผู้ใช้กลับหน้า LINE Login ทันที
  ========================================================= */

  async function postWithFreshToken(
    url,
    payload
  ) {

    const ready =
      await ensureLiff();


    if (!ready) {

      const error =
        new Error(
          "กำลังเชื่อมต่อ LINE..."
        );

      error.code =
        "LIFF_LOGIN_REQUIRED";

      throw error;
    }


    const idToken =
      getIdToken();


    return await postJSON(
      url,
      {

        ...payload,

        idToken

      }
    );
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


    const ready =
      await ensureLiff();


    if (!ready) {

      const error =
        new Error(
          "กำลังเชื่อมต่อ LINE..."
        );

      error.code =
        "LIFF_LOGIN_REQUIRED";

      throw error;
    }


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

      console.error(
        "PLAYER API ERROR:",
        error
      );


      /*
        สำคัญมาก

        ไม่เรียก liff.logout()
        ไม่เรียก liff.login()

        ให้หน้าเว็บแสดง error
        แทนการเด้งกลับ LINE Login
      */

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
     PAGE NAVIGATION
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

    ensureLiff,

    isLiffReady,

    getIdToken,

    postJSON,

    postWithFreshToken,

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
