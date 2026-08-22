window.ROCK = (() => {

  const CFG = window.APP_CONFIG;

  if (!CFG) {
    throw new Error("APP_CONFIG ไม่ถูกโหลด");
  }


  /* ======================================================
     NAVIGATION
  ====================================================== */

  function go(url) {

    if (!url) return;

    window.location.href = url;
  }


  /* ======================================================
     LIFF ID
  ====================================================== */

  function getLiffId(page = "DASHBOARD") {

    if (
      page === "WEIGHT" &&
      CFG.LIFF_ID?.WEIGHT
    ) {
      return CFG.LIFF_ID.WEIGHT;
    }

    if (CFG.LIFF_ID?.DASHBOARD) {
      return CFG.LIFF_ID.DASHBOARD;
    }

    throw new Error("ไม่พบ LIFF ID");
  }


  /* ======================================================
     CLEAN CALLBACK URL
  ====================================================== */

  function cleanLiffUrl() {

    try {

      const url =
        new URL(window.location.href);

      const removeKeys = [
        "code",
        "state",
        "liff.state",
        "liffClientId",
        "liffRedirectUri"
      ];

      let changed = false;

      removeKeys.forEach(key => {

        if (
          url.searchParams.has(key)
        ) {

          url.searchParams.delete(key);

          changed = true;
        }
      });

      if (changed) {

        const cleanUrl =
          url.pathname +
          (
            url.search
              ? url.search
              : ""
          ) +
          url.hash;

        window.history.replaceState(
          {},
          document.title,
          cleanUrl
        );
      }

    } catch (error) {

      console.warn(
        "CLEAN URL ERROR:",
        error
      );
    }
  }


  /* ======================================================
     INIT LIFF
  ====================================================== */

  async function initLiff(
    page = "DASHBOARD"
  ) {

    if (
      typeof liff === "undefined"
    ) {
      throw new Error(
        "ไม่สามารถโหลด LINE LIFF SDK"
      );
    }

    const liffId =
      getLiffId(page);

    await liff.init({
      liffId
    });

    cleanLiffUrl();

    if (!liff.isLoggedIn()) {

      liff.login({
        redirectUri:
          window.location.origin +
          window.location.pathname
      });

      return false;
    }

    const token =
      liff.getIDToken();

    if (!token) {

      return false;
    }

    return true;
  }


  /* ======================================================
     TOKEN
  ====================================================== */

  function getIdToken() {

    if (
      typeof liff === "undefined"
    ) {
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


  /* ======================================================
     LOGIN AGAIN
  ====================================================== */

  function loginAgain(
    page = "DASHBOARD"
  ) {

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

    const path =
      page === "WEIGHT"
        ? CFG.PAGE.WEIGHT
        : CFG.PAGE.HOME;

    window.location.href =
      path;
  }


  /* ======================================================
     POST JSON
  ====================================================== */

  async function postJSON(
    url,
    payload
  ) {

    if (!url) {
      throw new Error(
        "ไม่พบ API URL"
      );
    }

    const response =
      await fetch(
        url,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(payload)
        }
      );

    const raw =
      await response.text();

    let data;

    try {

      data =
        JSON.parse(raw);

    } catch {

      console.error(
        "API RAW RESPONSE:",
        raw
      );

      throw new Error(
        "API ตอบกลับไม่ถูกต้อง"
      );
    }

    if (
      !response.ok ||
      data.success === false
    ) {

      const error =
        new Error(
          data.error ||
          data.message ||
          "ดำเนินการไม่สำเร็จ"
        );

      error.code =
        data.code;

      throw error;
    }

    return data;
  }


  /* ======================================================
     DASHBOARD
  ====================================================== */

  async function fetchDashboard() {

    return await postJSON(
      CFG.API.DASHBOARD,
      {
        action: "dashboard",
        idToken: getIdToken()
      }
    );
  }


  /* ======================================================
     SAVE WEIGHT
  ====================================================== */

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

    return await postJSON(
      CFG.API.WEIGHT,
      {
        action: "saveWeight",
        idToken: getIdToken(),
        weight: value
      }
    );
  }


  /* ======================================================
     SET TARGET
  ====================================================== */

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

    return await postJSON(
      CFG.API.WEIGHT,
      {
        action: "setTarget",
        idToken: getIdToken(),
        targetWeight: value
      }
    );
  }


  /* ======================================================
     FORMAT
  ====================================================== */

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


  return {

    CFG,

    go,

    getLiffId,

    initLiff,

    cleanLiffUrl,

    getIdToken,

    loginAgain,

    postJSON,

    fetchDashboard,

    saveWeight,

    setTarget,

    fmtWeight,

    fmtInt,

    formatDate,

    num
  };

})();
