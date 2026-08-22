window.ROCK = (() => {

  const CFG = window.APP_CONFIG;

  if (!CFG) {
    throw new Error("APP_CONFIG ไม่ถูกโหลด");
  }


  /* ======================================================
     PAGE NAVIGATION
  ====================================================== */

  function go(url) {

    if (!url) {
      return;
    }

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
     CLEAN LIFF CALLBACK URL
  ====================================================== */

  function cleanLiffUrl() {

    const url =
      new URL(window.location.href);

    const keys = [
      "code",
      "state",
      "liff.state",
      "liffClientId",
      "liffRedirectUri"
    ];

    let changed = false;

    keys.forEach(key => {

      if (url.searchParams.has(key)) {

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


    try {

      await liff.init({
        liffId
      });


      /*
        หลัง LINE redirect กลับมา
        ล้าง code/state ออกจาก URL
      */

      cleanLiffUrl();


      /*
        ยังไม่ได้ Login
      */

      if (!liff.isLoggedIn()) {

        liff.login({
          redirectUri:
            window.location.origin +
            window.location.pathname
        });

        return false;
      }


      /*
        ต้องมี ID Token
      */

      const token =
        liff.getIDToken();


      if (!token) {

        console.warn(
          "LINE ID Token not available"
        );

        return false;
      }


      return true;


    } catch (error) {

      console.error(
        "LIFF INIT ERROR:",
        error
      );

      throw error;
    }
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


    liff.login({
      redirectUri:
        window.location.origin +
        window.location.pathname
    });
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
            JSON.stringify(
              payload
            )
        }
      );


    const text =
      await response.text();


    let data;


    try {

      data =
        JSON.parse(text);

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
     TARGET WEIGHT
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
     FORMAT WEIGHT
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


  /* ======================================================
     FORMAT INTEGER
  ====================================================== */

  function fmtInt(value) {

    const n =
      Number(value);


    return Number.isFinite(n)
      ? Math.round(n)
          .toLocaleString("en-US")
      : "0";
  }


  /* ======================================================
     FORMAT DATE
  ====================================================== */

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
        dateStyle: "short",
        timeStyle: "short"
      }
    );
  }


  /* ======================================================
     NUMBER
  ====================================================== */

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


  /* ======================================================
     PUBLIC
  ====================================================== */

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
