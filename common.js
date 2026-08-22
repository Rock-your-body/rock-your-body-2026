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
     LIFF ID
  ========================================================= */

  function getLiffId(page = "DASHBOARD") {

    const name =
      String(page).toUpperCase();

    if (name === "WEIGHT") {
      return CFG.LIFF_ID.WEIGHT;
    }

    return CFG.LIFF_ID.DASHBOARD;
  }


  /* =========================================================
     INIT LIFF
  ========================================================= */

  async function initLiff(page = "DASHBOARD") {

    if (typeof liff === "undefined") {
      throw new Error("LINE LIFF SDK ไม่พร้อม");
    }

    const liffId =
      getLiffId(page);

    if (!liffId) {
      throw new Error("ไม่พบ LIFF ID");
    }

    console.log("LIFF INIT:", {
      page,
      liffId,
      url: window.location.href
    });


    await liff.init({
      liffId: liffId
    });


    /* ยังไม่ได้ Login */

    if (!liff.isLoggedIn()) {

      const redirectUri =
        window.location.origin +
        window.location.pathname;

      console.log(
        "LIFF LOGIN REDIRECT:",
        redirectUri
      );

      liff.login({
        redirectUri: redirectUri
      });

      return false;
    }


    /* Login แล้ว */

    const token =
      liff.getIDToken();

    if (!token) {
      throw new Error(
        "ไม่พบ LINE ID Token"
      );
    }


    console.log(
      "LIFF READY:",
      page
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
      console.warn(error);
    }

    window.location.reload();
  }


  /* =========================================================
     POST JSON
  ========================================================= */

  async function postJSON(url, payload) {

    if (!url) {
      throw new Error(
        "ไม่พบ API URL"
      );
    }

    const response =
      await fetch(url, {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify(payload)
      });


    const text =
      await response.text();


    let data;

    try {

      data =
        JSON.parse(text);

    } catch {

      console.error(
        "API RAW:",
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
          "ดำเนินการไม่สำเร็จ"
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
  ========================================================= */

  async function saveWeight(weight) {

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

    return await postJSON(
      CFG.API.WEIGHT,
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

  async function setTarget(targetWeight) {

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

    return await postJSON(
      CFG.API.WEIGHT,
      {
        action: "setTarget",
        idToken: getIdToken(),
        targetWeight: value
      }
    );
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
          .toLocaleString("en-US")
      : "0";
  }


  function formatDate(value) {

    if (!value) {
      return "-";
    }

    const d =
      new Date(value);

    if (
      Number.isNaN(
        d.getTime()
      )
    ) {
      return "-";
    }

    return d.toLocaleString(
      "th-TH",
      {
        dateStyle: "short",
        timeStyle: "short"
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
     TOKEN ERROR
  ========================================================= */

  function isTokenError(error) {

    const message =
      String(
        error?.message ||
        error ||
        ""
      ).toLowerCase();

    return (
      message.includes("token") ||
      message.includes("authentication") ||
      message.includes("unauthorized") ||
      error?.code === 401
    );
  }


  /* =========================================================
     PUBLIC
  ========================================================= */

  return {

    CFG,

    go,

    getLiffId,

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

    num,

    isTokenError
  };

})();
