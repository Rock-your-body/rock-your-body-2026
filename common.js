"use strict";

/*
  ROCK YOUR BODY 2026
  common.js
  Version: 2026-08-29-WEIGHT-HOTFIX-V2.11.2

  Canonical:
  GitHub Pages
  -> LINE LIFF ID Token
  -> Supabase Edge Functions
  -> Supabase DB

  Fix:
  - API.PLAYER
  - ROCK.fmtWeight()
  - ROCK.CFG compatibility
  - Weight save / target / history
  - ไม่ใช้ line_user_id ใน localStorage เป็น identity
*/

(function () {

  const CFG =
    window.APP_CONFIG ||
    {};

  const STORAGE = {
    LINE_PROFILE:
      "rock_line_profile"
  };


  /* =========================================================
     BASIC
  ========================================================= */

  function text(value) {

    return String(
      value ??
      ""
    ).trim();
  }


  function number(
    value,
    fallback = 0
  ) {

    const n =
      Number(value);

    return Number.isFinite(n)
      ? n
      : fallback;
  }


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

    if (
      !Number.isFinite(n)
    ) {
      return "--.-";
    }

    return n.toFixed(1);
  }


  function save(
    key,
    value
  ) {

    try {

      localStorage.setItem(
        key,
        JSON.stringify(value)
      );

    } catch (error) {

      console.warn(
        "LOCAL STORAGE SAVE ERROR:",
        error
      );
    }
  }


  function load(
    key,
    fallback = null
  ) {

    try {

      const raw =
        localStorage.getItem(
          key
        );

      if (!raw) {
        return fallback;
      }

      return JSON.parse(raw);

    } catch (error) {

      console.warn(
        "LOCAL STORAGE LOAD ERROR:",
        error
      );

      return fallback;
    }
  }


  /* =========================================================
     PAGE NAVIGATION
  ========================================================= */

  function go(target) {

    if (!target) {
      return;
    }

    const key =
      String(target)
        .trim()
        .toUpperCase();

    const url =
      CFG.PAGE?.[key] ||
      target;

    window.location.href =
      url;
  }


  function goHome() {

    go(
      CFG.PAGE?.HOME ||
      "./dashboard.html"
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


  function goReward() {

    go(
      CFG.PAGE?.REWARDS ||
      "./rewards.html"
    );
  }


  function goRanking() {

    go(
      CFG.PAGE?.RANKING ||
      "./ranking.html"
    );
  }


  function goProgress() {

    go(
      CFG.PAGE?.PROGRESS ||
      "./progress.html"
    );
  }


  function goWeight() {

    go(
      CFG.PAGE?.WEIGHT ||
      "./weight-check.html"
    );
  }


  function goNutrition() {

    go(
      CFG.PAGE?.NUTRITION ||
      "./nutrition.html"
    );
  }


  function goInBody() {

    go(
      CFG.PAGE?.INBODY ||
      "./inbody.html"
    );
  }


  /* =========================================================
     LIFF
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


    const liffId =
      text(
        CFG.LIFF_ID
      );


    if (!liffId) {

      throw new Error(
        "ไม่พบ LIFF_ID"
      );
    }


    await liff.init({
      liffId
    });


    if (
      !liff.isLoggedIn()
    ) {

      liff.login();

      return false;
    }


    return true;
  }


  async function getIdToken() {

    const ready =
      await initLiff();


    if (
      ready === false
    ) {
      return null;
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


  async function getProfile() {

    const cached =
      load(
        STORAGE.LINE_PROFILE,
        null
      );


    try {

      const ready =
        await initLiff();


      if (
        ready === false
      ) {
        return cached;
      }


      const profile =
        await liff.getProfile();


      if (profile) {

        save(
          STORAGE.LINE_PROFILE,
          profile
        );
      }


      return profile;


    } catch (error) {

      console.warn(
        "LINE PROFILE ERROR:",
        error
      );

      return cached;
    }
  }


  /* =========================================================
     API
  ========================================================= */

  function apiUrl(name) {

    const key =
      String(
        name ||
        ""
      )
        .trim()
        .toUpperCase();


    if (
      typeof CFG.getApi ===
      "function"
    ) {

      return CFG.getApi(
        key
      );
    }


    const url =
      CFG.API?.[key];


    if (!url) {

      throw new Error(
        "ไม่พบ Supabase Edge Function URL"
      );
    }


    return url;
  }


  async function postJson(
    url,
    payload = {}
  ) {

    const idToken =
      await getIdToken();


    if (!idToken) {
      return null;
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
            JSON.stringify({
              ...payload,
              idToken
            })
        }
      );


    const raw =
      await response.text();


    let data = {};


    try {

      data =
        raw
          ? JSON.parse(raw)
          : {};

    } catch (error) {

      throw new Error(
        `API ตอบกลับไม่ใช่ JSON (HTTP ${response.status})`
      );
    }


    if (
      !response.ok ||
      data?.success === false
    ) {

      throw new Error(
        data?.error ||
        data?.message ||
        `HTTP ${response.status}`
      );
    }


    return data;
  }


  /* =========================================================
     PLAYER DASHBOARD
  ========================================================= */

  async function fetchDashboard() {

    return await postJson(
      apiUrl(
        "PLAYER"
      ),
      {
        action:
          "dashboard"
      }
    );
  }


  async function fetchDailyHealth() {

    return await postJson(
      apiUrl(
        "PLAYER"
      ),
      {
        action:
          "dailyHealth"
      }
    );
  }


  /* =========================================================
     WEIGHT
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
        "กรุณากรอกน้ำหนักระหว่าง 20 - 400 kg"
      );
    }


    return await postJson(
      apiUrl(
        "PLAYER"
      ),
      {
        action:
          "saveWeight",

        weight:
          value
      }
    );
  }


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
        "กรุณากรอกเป้าหมายน้ำหนักระหว่าง 20 - 400 kg"
      );
    }


    return await postJson(
      apiUrl(
        "PLAYER"
      ),
      {
        action:
          "setTarget",

        targetWeight:
          value
      }
    );
  }


  async function getWeightHistory() {

    return await postJson(
      apiUrl(
        "PLAYER"
      ),
      {
        action:
          "weightHistory"
      }
    );
  }


  /* =========================================================
     PROJECT SETTINGS
  ========================================================= */

  async function fetchProjectSettings() {

    return await postJson(
      apiUrl(
        "PROJECT_SETTINGS"
      ),
      {
        action:
          "get"
      }
    );
  }


  /* =========================================================
     MISSION
  ========================================================= */

  async function missionApi(
    action,
    payload = {}
  ) {

    return await postJson(
      apiUrl(
        "MISSION"
      ),
      {
        action,
        ...payload
      }
    );
  }


  /* =========================================================
     NUTRITION
  ========================================================= */

  async function nutritionApi(
    action,
    payload = {}
  ) {

    return await postJson(
      apiUrl(
        "NUTRITION"
      ),
      {
        action,
        ...payload
      }
    );
  }


  /* =========================================================
     INBODY
  ========================================================= */

  async function inbodyApi(
    action,
    payload = {}
  ) {

    return await postJson(
      apiUrl(
        "INBODY"
      ),
      {
        action,
        ...payload
      }
    );
  }


  /* =========================================================
     GLOBAL EXPORT
  ========================================================= */

  window.ROCK = {

    VERSION:
      "2026-08-29-WEIGHT-HOTFIX-V2.11.2",


    /*
      Compatibility สำหรับหน้าเก่า
      เช่น weight-check.html
      ที่เรียก ROCK.CFG.PAGE.HOME
    */

    CFG,

    config:
      CFG,


    /* LINE */

    initLiff,

    getIdToken,

    getProfile,


    /* API */

    apiUrl,

    postJson,


    /* PLAYER */

    fetchDashboard,

    fetchDailyHealth,


    /* WEIGHT */

    saveWeight,

    setTarget,

    getWeightHistory,

    fmtWeight,


    /* OTHER */

    fetchProjectSettings,

    missionApi,

    nutritionApi,

    inbodyApi,


    /* NAVIGATION */

    go,

    goHome,

    goMission,

    goBattle,

    goReward,

    goRanking,

    goProgress,

    goWeight,

    goNutrition,

    goInBody,


    /* UTIL */

    number
  };


  console.log(
    "[ROCK COMMON]",
    window.ROCK.VERSION
  );

})();
