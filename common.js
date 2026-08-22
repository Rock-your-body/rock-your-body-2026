window.ROCK = (() => {

  const CFG =
    window.APP_CONFIG;

  function go(url) {
    window.location.href = url;
  }

  function getPageLiffId(pageName) {

    if (pageName === "WEIGHT") {
      return CFG.LIFF_ID.WEIGHT;
    }

    return CFG.LIFF_ID.DASHBOARD;
  }

  async function initLiff(pageName = "DASHBOARD") {

    if (typeof liff === "undefined") {
      throw new Error("ไม่สามารถโหลด LINE LIFF SDK");
    }

    const liffId =
      getPageLiffId(pageName);

    await liff.init({
      liffId
    });

    if (!liff.isLoggedIn()) {

      liff.login({
        redirectUri:
          window.location.href
      });

      return false;
    }

    const idToken =
      liff.getIDToken();

    if (!idToken) {

      try {
        liff.logout();
      } catch {}

      liff.login({
        redirectUri:
          window.location.href
      });

      return false;
    }

    return true;
  }

  function getIdToken() {

    if (
      typeof liff === "undefined" ||
      !liff.isLoggedIn()
    ) {
      throw new Error(
        "LINE ยังไม่ได้เข้าสู่ระบบ"
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
            JSON.stringify(payload)
        }
      );

    const text =
      await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        "API ตอบกลับไม่ถูกต้อง"
      );
    }

    if (
      !response.ok ||
      data.success === false
    ) {
      throw new Error(
        data.error ||
        data.message ||
        "ดำเนินการไม่สำเร็จ"
      );
    }

    return data;
  }

  async function fetchDashboard() {

    return await postJSON(
      CFG.API.DASHBOARD,
      {
        action: "dashboard",
        idToken: getIdToken()
      }
    );
  }

  async function saveWeight(
    weight
  ) {

    return await postJSON(
      CFG.API.WEIGHT,
      {
        action: "saveWeight",
        idToken: getIdToken(),
        weight
      }
    );
  }

  async function setTarget(
    targetWeight
  ) {

    return await postJSON(
      CFG.API.WEIGHT,
      {
        action: "setTarget",
        idToken: getIdToken(),
        targetWeight
      }
    );
  }

  function fmtWeight(v) {

    if (
      v === null ||
      v === undefined ||
      v === ""
    ) {
      return "--.-";
    }

    const n = Number(v);

    return Number.isFinite(n)
      ? n.toFixed(1)
      : "--.-";
  }

  function fmtInt(v) {

    const n = Number(v);

    return Number.isFinite(n)
      ? Math.round(n)
          .toLocaleString("en-US")
      : "0";
  }

  function formatDate(v) {

    if (!v) {
      return "--/--/----";
    }

    const d = new Date(v);

    if (
      Number.isNaN(
        d.getTime()
      )
    ) {
      return "--/--/----";
    }

    return d.toLocaleDateString(
      "th-TH",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }
    );
  }

  return {
    CFG,
    go,
    initLiff,
    getIdToken,
    postJSON,
    fetchDashboard,
    saveWeight,
    setTarget,
    fmtWeight,
    fmtInt,
    formatDate
  };

})();
