window.ROCK = (() => {

  const CFG =
    window.APP_CONFIG;


  if (!CFG) {

    throw new Error(
      "APP_CONFIG ไม่ถูกโหลด"
    );

  }


  /* =========================================================
     NAVIGATION
  ========================================================= */

  function go(url) {

    if (!url) {
      return;
    }

    window.location.href =
      url;

  }


  /* =========================================================
     INIT LIFF
     LIFF เดียวทั้งระบบ
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
      CFG.LIFF_ID
    );


    await liff.init({

      liffId:
        CFG.LIFF_ID

    });


    /* =====================================================
       LOGIN
    ====================================================== */

    if (
      !liff.isLoggedIn()
    ) {

      console.log(
        "LINE LOGIN REQUIRED"
      );


      /*
        ไม่กำหนด redirectUri เอง
        ลดปัญหา callback URL
      */

      liff.login();


      return false;

    }


    /* =====================================================
       TOKEN
    ====================================================== */

    const idToken =
      liff.getIDToken();


    if (!idToken) {

      throw new Error(
        "ไม่พบ LINE ID Token"
      );

    }


    console.log(
      "LIFF READY",
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


    return token;

  }


  /* =========================================================
     LOGOUT / LOGIN AGAIN
  ========================================================= */

  function loginAgain() {

    try {

      if (
        typeof liff !==
          "undefined" &&
        liff.isLoggedIn()
      ) {

        liff.logout();

      }

    } catch (error) {

      console.warn(
        "LOGOUT ERROR:",
        error
      );

    }


    window.location.href =
      CFG.PAGE.HOME;

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

        action:
          "dashboard",

        idToken:
          getIdToken()

      }

    );

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


    return await postJSON(

      CFG.API.WEIGHT,

      {

        action:
          "saveWeight",

        idToken:
          getIdToken(),

        weight:
          value

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


    return await postJSON(

      CFG.API.WEIGHT,

      {

        action:
          "setTarget",

        idToken:
          getIdToken(),

        targetWeight:
          value

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
          .toLocaleString(
            "en-US"
          )
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

        dateStyle:
          "short",

        timeStyle:
          "short"

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

      message.includes(
        "token"
      ) ||

      message.includes(
        "authentication"
      ) ||

      message.includes(
        "unauthorized"
      ) ||

      error?.code === 401

    );

  }


  /* =========================================================
     PUBLIC
  ========================================================= */

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

    num,

    isTokenError

  };

})();
