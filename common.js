window.ROCK = (() => {

  const CFG = window.APP_CONFIG;

  if (!CFG) {
    throw new Error("APP_CONFIG ไม่ถูกโหลด");
  }


  /* ======================================================
     NAVIGATION
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

    const pageName =
      String(page)
        .toUpperCase();

    if (
      pageName === "WEIGHT" &&
      CFG.LIFF_ID?.WEIGHT
    ) {
      return CFG.LIFF_ID.WEIGHT;
    }

    if (CFG.LIFF_ID?.DASHBOARD) {
      return CFG.LIFF_ID.DASHBOARD;
    }

    throw new Error(
      "ไม่พบ LIFF ID"
    );
  }


  /* ======================================================
     PAGE PATH
  ====================================================== */

  function getPagePath(
    page = "DASHBOARD"
  ) {

    const pageName =
      String(page)
        .toUpperCase();

    if (pageName === "WEIGHT") {
      return CFG.PAGE.WEIGHT;
    }

    return CFG.PAGE.HOME;
  }


  /* ======================================================
     CLEAN LIFF CALLBACK URL

     เอา:
     ?code=
     ?state=
     ?liff.state=
     ?liffClientId=
     ?liffRedirectUri=

     ออกจาก Address Bar
  ====================================================== */

  function cleanLiffUrl() {

    try {

      const url =
        new URL(
          window.location.href
        );

      const removeKeys = [
        "code",
        "state",
        "liff.state",
        "liffClientId",
        "liffRedirectUri"
      ];

      let changed =
        false;


      removeKeys.forEach(
        key => {

          if (
            url.searchParams.has(
              key
            )
          ) {

            url.searchParams.delete(
              key
            );

            changed =
              true;
          }
        }
      );


      if (!changed) {
        return;
      }


      const cleanUrl =
        url.pathname +
        (
          url.search
            ? url.search
            : ""
        ) +
        (
          url.hash
            ? url.hash
            : ""
        );


      window.history.replaceState(
        {},
        document.title,
        cleanUrl
      );


    } catch (error) {

      console.warn(
        "CLEAN LIFF URL ERROR:",
        error
      );
    }
  }


  /* ======================================================
     LOGIN
  ====================================================== */

  function login(
    page = "DASHBOARD"
  ) {

    if (
      typeof liff ===
      "undefined"
    ) {

      throw new Error(
        "LINE LIFF SDK ไม่พร้อม"
      );
    }


    /*
      Redirect กลับ URL ปกติ

      เช่น

      /dashboard.html

      หรือ

      /weight-check.html

      ไม่ใช้ liff.line.me
    */

    const redirectUri =
      window.location.origin +
      window.location.pathname;


    console.log(
      "LIFF LOGIN:",
      {
        page,
        redirectUri
      }
    );


    liff.login({
      redirectUri
    });
  }


  /* ======================================================
     INIT LIFF
  ====================================================== */

  async function initLiff(
    page = "DASHBOARD"
  ) {

    if (
      typeof liff ===
      "undefined"
    ) {

      throw new Error(
        "ไม่สามารถโหลด LINE LIFF SDK"
      );
    }


    const liffId =
      getLiffId(
        page
      );


    console.log(
      "LIFF INIT:",
      {
        page,
        liffId
      }
    );


    try {

      /* -------------------------------
         INIT
      -------------------------------- */

      await liff.init({
        liffId
      });


      /*
        สำคัญ:
        ต้อง clean URL หลัง liff.init()
        เพราะ LIFF ต้องอ่าน code/state ก่อน
      */

      cleanLiffUrl();


      /* -------------------------------
         LOGIN
      -------------------------------- */

      if (
        !liff.isLoggedIn()
      ) {

        login(page);

        return false;
      }


      /* -------------------------------
         ID TOKEN
      -------------------------------- */

      const idToken =
        liff.getIDToken();


      if (!idToken) {

        console.warn(
          "LIFF ID Token not found"
        );


        /*
          Session มีปัญหา
          Login ใหม่
        */

        try {

          liff.logout();

        } catch (error) {

          console.warn(
            "LIFF LOGOUT ERROR:",
            error
          );
        }


        login(page);

        return false;
      }


      console.log(
        "LIFF READY:",
        page
      );


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
     GET ID TOKEN
  ====================================================== */

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


    const idToken =
      liff.getIDToken();


    if (!idToken) {

      throw new Error(
        "ไม่พบ LINE ID Token"
      );
    }


    return idToken;
  }


  /* ======================================================
     LOGIN AGAIN
  ====================================================== */

  async function loginAgain(
    page = "DASHBOARD"
  ) {

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


    /*
      ไปหน้าปัจจุบันแบบ URL ปกติก่อน

      จากนั้น initLiff()
      จะ login ใหม่เอง
    */

    const path =
      getPagePath(
        page
      );


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


    const text =
      await response.text();


    let data;


    try {

      data =
        JSON.parse(
          text
        );

    } catch (error) {

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

      const apiError =
        new Error(
          data?.error ||
          data?.message ||
          "ดำเนินการไม่สำเร็จ"
        );


      apiError.code =
        data?.code ||
        response.status;


      throw apiError;
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

    const value =
      Number(
        weight
      );


    if (
      !Number.isFinite(
        value
      ) ||
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


  /* ======================================================
     SET TARGET
  ====================================================== */

  async function setTarget(
    targetWeight
  ) {

    const value =
      Number(
        targetWeight
      );


    if (
      !Number.isFinite(
        value
      ) ||
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


  /* ======================================================
     FORMAT WEIGHT
  ====================================================== */

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
      Number(
        value
      );


    return Number.isFinite(
      number
    )
      ? number.toFixed(1)
      : "--.-";
  }


  /* ======================================================
     FORMAT INTEGER
  ====================================================== */

  function fmtInt(
    value
  ) {

    const number =
      Number(
        value
      );


    return Number.isFinite(
      number
    )
      ? Math.round(
          number
        )
          .toLocaleString(
            "en-US"
          )
      : "0";
  }


  /* ======================================================
     FORMAT DATE
  ====================================================== */

  function formatDate(
    value
  ) {

    if (!value) {
      return "-";
    }


    const date =
      new Date(
        value
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "-";
    }


    return date
      .toLocaleString(
        "th-TH",
        {
          dateStyle:
            "short",

          timeStyle:
            "short"
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

    const number =
      Number(
        value
      );


    return Number.isFinite(
      number
    )
      ? number
      : fallback;
  }


  /* ======================================================
     TOKEN ERROR
  ====================================================== */

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


  /* ======================================================
     PUBLIC
  ====================================================== */

  return {

    CFG,

    go,

    getLiffId,

    getPagePath,

    cleanLiffUrl,

    login,

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
