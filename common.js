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
     INIT LIFF
     ใช้ LIFF ตัวเดียวทั้งระบบ
  ========================================================= */

  async function initLiff() {

    if (typeof liff === "undefined") {
      throw new Error("LINE LIFF SDK ไม่พร้อม");
    }

    if (!CFG.LIFF_ID) {
      throw new Error("ไม่พบ LIFF ID");
    }

    console.log("LIFF INIT:", {
      liffId: CFG.LIFF_ID,
      url: window.location.href
    });

    await liff.init({
      liffId: CFG.LIFF_ID
    });


    /* ยังไม่ได้ Login */

    if (!liff.isLoggedIn()) {

      console.log(
        "LINE LOGIN REQUIRED"
      );

      liff.login();

      return false;
    }


    /* ตรวจ Token */

    const idToken =
      liff.getIDToken();

    if (!idToken) {
      throw new Error(
        "ไม่พบ LINE ID Token"
      );
    }


    console.log(
      "LIFF READY:",
      {
        loggedIn:
          liff.isLoggedIn(),

        inClient:
          liff.isInClient()
      }
    );

    return true;
  }


  /* =========================================================
     TOKEN
  ========================================================= */

  function getIdToken() {

    if (typeof liff === "undefined") {
      throw new Error(
        "LINE LIFF SDK ไม่พร้อม"
      );
    }

    if (!liff.isLoggedIn()) {
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

    return token;
  }


  /* =========================================================
     LOGIN AGAIN
  ========================================================= */

  function loginAgain() {

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


    let response;

    try {

      response =
        await fetch(
          url,
          {
            method: "POST",

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


    const text =
      await response.text();


    let data;

    try {

      data =
        text
          ? JSON.parse(text)
          : {};

    } catch {

      console.error(
        "API RAW RESPONSE:",
        text
      );

      throw new Error(
        "API ตอบกลับไม่ถูกต้อง"
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

      throw error;
    }


    return data;
  }


  /* =========================================================
     DASHBOARD
  ========================================================= */

  async function fetchDashboard() {

    return await postJSON(
      CFG.API.DASHBOARD,
      {
        action: "dashboard",
        idToken: getIdToken()
      }
    );
  }


  /* =========================================================
     SAVE WEIGHT
     TEST MODE:
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


    /*
      ใช้ player-dashboard
      เพราะรองรับ action saveWeight อยู่แล้ว
    */

    return await postJSON(
      CFG.API.DASHBOARD,
      {
        action: "saveWeight",
        idToken: getIdToken(),
        weight: value
      }
    );
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


    /*
      ใช้ player-dashboard
      เพราะรองรับ action setTarget อยู่แล้ว
    */

    return await postJSON(
      CFG.API.DASHBOARD,
      {
        action: "setTarget",
        idToken: getIdToken(),
        targetWeight: value
      }
    );
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

    const n =
      Number(value);

    return Number.isFinite(n)
      ? n.toFixed(1)
      : "--.-";
  }


  /* =========================================================
     FORMAT INTEGER
  ========================================================= */

  function fmtInt(
    value
  ) {

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
        dateStyle: "short",
        timeStyle: "short"
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
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
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


    return (
      message.includes("token") ||
      message.includes("authentication") ||
      message.includes("unauthorized") ||
      message.includes("401") ||
      error?.code === 401
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
