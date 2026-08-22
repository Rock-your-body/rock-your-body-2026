window.ROCK = (() => {

  const CFG =
    window.APP_CONFIG;

  if (!CFG) {
    throw new Error(
      "APP_CONFIG ไม่ถูกโหลด"
    );
  }


  /* ======================================================
     PAGE
  ====================================================== */

  function go(url) {

    if (!url) {
      return;
    }

    window.location.href =
      url;
  }


  /* ======================================================
     LIFF ID
  ====================================================== */

  function getLiffId(page) {

    if (page === "WEIGHT") {
      return CFG.LIFF_ID.WEIGHT;
    }

    return CFG.LIFF_ID.DASHBOARD;
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


    if (!liffId) {
      throw new Error(
        "ไม่พบ LIFF ID"
      );
    }


    await liff.init({
      liffId
    });


    if (
      !liff.isLoggedIn()
    ) {

      liff.login({
        redirectUri:
          window.location.href
      });

      return false;
    }


    const token =
      liff.getIDToken();


    if (!token) {

      try {
        liff.logout();
      } catch (error) {
        console.warn(error);
      }


      liff.login({
        redirectUri:
          window.location.href
      });

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

      console.warn(error);
    }


    liff.login({
      redirectUri:
        window.location.href
    });
  }


  /* ======================================================
     POST JSON
  ====================================================== */

  async function postJSON(
    url,
    payload
  ) {

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
        "API RAW:",
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
        action:
          "dashboard",

        idToken:
          getIdToken()
      }
    );
  }


  /* ======================================================
     SAVE WEIGHT
  ====================================================== */

  async function saveWeight(
    weight
  ) {

    return await postJSON(
      CFG.API.WEIGHT,
      {
        action:
          "saveWeight",

        idToken:
          getIdToken(),

        weight:
          Number(weight)
      }
    );
  }


  /* ======================================================
     TARGET
  ====================================================== */

  async function setTarget(
    targetWeight
  ) {

    return await postJSON(
      CFG.API.WEIGHT,
      {
        action:
          "setTarget",

        idToken:
          getIdToken(),

        targetWeight:
          Number(targetWeight)
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

    num
  };

})();
