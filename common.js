/* =========================================================
   ROCK YOUR BODY 2026
   COMMON CORE — GitHub Pages -> Supabase Edge Functions
   Version: 2026-08-28-SUPABASE
========================================================= */

(function () {
  "use strict";

  const CFG = window.APP_CONFIG;

  if (!CFG) {
    throw new Error("APP_CONFIG ไม่ถูกโหลด");
  }

  const STORAGE = {
    LINE_USER_ID: "rock_line_user_id",
    LINE_PROFILE: "rock_line_profile"
  };

  /* =========================================================
     STORAGE
  ========================================================= */

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn("STORAGE SAVE ERROR:", error);
    }
  }

  function load(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  /* =========================================================
     JWT
  ========================================================= */

  function decodeJwtPayload(token) {
    try {
      if (!token) return null;

      const parts = String(token).split(".");
      if (parts.length !== 3) return null;

      let base64 = parts[1]
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      while (base64.length % 4 !== 0) {
        base64 += "=";
      }

      const binary = atob(base64);
      const bytes = Uint8Array.from(
        binary,
        c => c.charCodeAt(0)
      );

      return JSON.parse(
        new TextDecoder("utf-8").decode(bytes)
      );
    } catch {
      return null;
    }
  }

  function tokenExpired(token, bufferSeconds = 45) {
    const payload = decodeJwtPayload(token);
    const exp = Number(payload?.exp);

    if (!Number.isFinite(exp)) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    return exp <= now + bufferSeconds;
  }

  /* =========================================================
     LIFF
  ========================================================= */

  async function initLiff() {
    if (typeof liff === "undefined") {
      throw new Error("LINE LIFF SDK ไม่พร้อม");
    }

    const liffId = CFG.LIFF_ID;

    if (!liffId) {
      throw new Error("ไม่พบ LIFF_ID ใน app-config.js");
    }

    await liff.init({
      liffId
    });

    if (!liff.isLoggedIn()) {
      liff.login({
        redirectUri: window.location.href
      });
      return false;
    }

    const idToken = liff.getIDToken();

    if (!idToken || tokenExpired(idToken)) {
      try {
        liff.logout();
      } catch {}

      liff.login({
        redirectUri: window.location.href
      });

      return false;
    }

    try {
      const profile = await liff.getProfile();

      if (profile?.userId) {
        localStorage.setItem(
          STORAGE.LINE_USER_ID,
          profile.userId
        );

        save(
          STORAGE.LINE_PROFILE,
          profile
        );
      }
    } catch (error) {
      console.warn("LIFF PROFILE ERROR:", error);
    }

    return true;
  }

  function getIdToken() {
    if (
      typeof liff === "undefined" ||
      !liff.isLoggedIn()
    ) {
      throw new Error("LINE ยังไม่ได้ Login");
    }

    const token = liff.getIDToken();

    if (!token) {
      throw new Error("ไม่พบ LINE ID Token");
    }

    if (tokenExpired(token, 30)) {
      const error = new Error("LINE ID Token หมดอายุ");
      error.code = "TOKEN_EXPIRED";
      throw error;
    }

    return token;
  }

  async function getProfile() {
    try {
      if (
        typeof liff !== "undefined" &&
        liff.isLoggedIn()
      ) {
        const profile = await liff.getProfile();

        if (profile?.userId) {
          localStorage.setItem(
            STORAGE.LINE_USER_ID,
            profile.userId
          );
          save(STORAGE.LINE_PROFILE, profile);
        }

        return profile;
      }
    } catch (error) {
      console.warn("GET PROFILE ERROR:", error);
    }

    return load(STORAGE.LINE_PROFILE, null);
  }

  /* =========================================================
     SUPABASE EDGE FUNCTION REQUEST
  ========================================================= */

  async function postJSON(url, payload) {
    if (!url) {
      throw new Error("ไม่พบ Supabase Edge Function URL");
    }

    let response;

    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error("NETWORK ERROR:", error);
      throw new Error("เชื่อมต่อ Supabase ไม่สำเร็จ");
    }

    const raw = await response.text();
    let data = {};

    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      console.error("EDGE FUNCTION RAW RESPONSE:", raw);
      throw new Error(
        `Supabase ตอบกลับไม่ใช่ JSON (${response.status})`
      );
    }

    if (!response.ok || data?.success === false) {
      const error = new Error(
        data?.error ||
        data?.message ||
        `Supabase Error ${response.status}`
      );

      error.code =
        data?.code ||
        response.status;

      error.data = data;
      throw error;
    }

    return data;
  }

  async function callEdge(url, action, extra = {}) {
    const idToken = getIdToken();

    try {
      return await postJSON(url, {
        action,
        idToken,
        ...extra
      });
    } catch (error) {
      const message = String(
        error?.message || ""
      ).toLowerCase();

      if (
        error?.code === 401 ||
        error?.code === "LINE_AUTH_FAILED" ||
        error?.code === "TOKEN_EXPIRED" ||
        message.includes("expired") ||
        message.includes("idtoken")
      ) {
        try {
          liff.logout();
        } catch {}

        liff.login({
          redirectUri: window.location.href
        });

        return await new Promise(() => {});
      }

      throw error;
    }
  }

  /* =========================================================
     PLAYER DASHBOARD
  ========================================================= */

  async function fetchDashboard() {
    return await callEdge(
      CFG.API?.DASHBOARD,
      "dashboard"
    );
  }

  async function getDashboard() {
    return fetchDashboard();
  }

  async function saveWeight(weight) {
    const value = Number(weight);

    if (
      !Number.isFinite(value) ||
      value < 20 ||
      value > 400
    ) {
      throw new Error(
        "น้ำหนักต้องอยู่ระหว่าง 20 - 400 kg"
      );
    }

    return await callEdge(
      CFG.API?.DASHBOARD,
      "saveWeight",
      {
        weight: value
      }
    );
  }

  async function setTarget(targetWeight) {
    const value = Number(targetWeight);

    if (
      !Number.isFinite(value) ||
      value < 20 ||
      value > 400
    ) {
      throw new Error(
        "เป้าหมายต้องอยู่ระหว่าง 20 - 400 kg"
      );
    }

    return await callEdge(
      CFG.API?.DASHBOARD,
      "setTarget",
      {
        targetWeight: value
      }
    );
  }

  async function getProgress() {
    return fetchDashboard();
  }

  /* =========================================================
     MISSION
     Edge Function ปัจจุบันของโปรเจกต์ใช้ myMissionStatus
  ========================================================= */

  async function getMissions() {
    return await callEdge(
      CFG.API?.MISSION,
      "myMissionStatus"
    );
  }

  async function completeMission(missionId) {
    /*
      ระบบ Mission รุ่นปัจจุบันใช้การส่งหลักฐาน
      จึงไม่ควรแจก Reward จาก browser โดยตรง
    */
    throw new Error(
      "Mission ต้องส่งหลักฐานผ่านหน้า mission.html"
    );
  }

  /* =========================================================
     BATTLE
  ========================================================= */

  async function getBattle() {
    return await callEdge(
      CFG.API?.BATTLE,
      "battleStatus"
    );
  }

  async function fightMonster(extra = {}) {
    /*
      ใช้ action fight เป็นค่า compatibility
      ถ้า Edge Function ของคุณใช้ชื่อ action อื่น
      ให้เปลี่ยนเฉพาะคำว่า fight ตรงนี้
    */
    return await callEdge(
      CFG.API?.BATTLE,
      "fight",
      extra
    );
  }

  /* =========================================================
     REWARD / RANKING
     ไม่มี Edge Function แยกใน APP_CONFIG ปัจจุบัน
  ========================================================= */

  async function getRewards() {
    const dashboard = await fetchDashboard();

    return (
      dashboard?.rewards
        ? dashboard
        : {
            success: true,
            rewards:
              dashboard?.data?.rewards ||
              dashboard?.dashboard?.rewards ||
              []
          }
    );
  }

  async function getRanking() {
    const dashboard = await fetchDashboard();

    return (
      dashboard?.ranking
        ? dashboard
        : {
            success: true,
            ranking:
              dashboard?.data?.ranking ||
              dashboard?.dashboard?.ranking ||
              [],
            myRank:
              dashboard?.data?.myRank ??
              dashboard?.myRank ??
              null,
            totalMembers:
              dashboard?.data?.totalMembers ??
              dashboard?.totalMembers ??
              0
          }
    );
  }

  async function claimReward() {
    throw new Error(
      "ระบบ Claim Reward ต้องทำผ่าน Edge Function ฝั่ง Server"
    );
  }

  /* =========================================================
     NAVIGATION
  ========================================================= */

  function go(target) {
    if (!target) return;

    const key =
      String(target).trim().toUpperCase();

    const url =
      CFG.PAGE?.[key] ||
      target;

    window.location.href = url;
  }

  function goHome() {
    go(CFG.PAGE?.HOME || "./HOME.html");
  }

  function goMission() {
    go(CFG.PAGE?.MISSION || "./mission.html");
  }

  function goBattle() {
    go(CFG.PAGE?.BATTLE || "./battle.html");
  }

  function goReward() {
    go(CFG.PAGE?.REWARDS || "./rewards.html");
  }

  function goRewards() {
    goReward();
  }

  function goRanking() {
    go(CFG.PAGE?.RANKING || "./ranking.html");
  }

  function goProgress() {
    go(CFG.PAGE?.PROGRESS || "./progress.html");
  }

  /* =========================================================
     FORMATTERS
  ========================================================= */

  function num(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function fmtInt(value) {
    return Math.round(
      num(value, 0)
    ).toLocaleString("en-US");
  }

  function fmtWeight(value) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "--.-";
    }

    const n = Number(value);

    return Number.isFinite(n)
      ? n.toFixed(1)
      : "--.-";
  }

  function number(value) {
    return fmtInt(value);
  }

  function coin(value) {
    return fmtInt(value);
  }

  function energy(value, max = CFG.MAX_ENERGY || 200) {
    return `${fmtInt(value)} / ${fmtInt(max)}`;
  }

  function formatDate(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString("th-TH");
  }

  function formatDateOnly(value) {
    if (!value) return "--/--/----";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
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
     UI COMPATIBILITY
  ========================================================= */

  function updateTopBar(user = {}) {
    const coinValue =
      user.rockCoin ??
      user.rock_coin ??
      user.coin ??
      0;

    const energyValue =
      user.energy?.current ??
      user.energy ??
      0;

    const maxEnergy =
      user.energy?.max ??
      user.max_energy ??
      CFG.MAX_ENERGY ??
      200;

    document
      .querySelectorAll("[data-rock-coin]")
      .forEach(el => {
        el.textContent = fmtInt(coinValue);
      });

    document
      .querySelectorAll("[data-rock-energy]")
      .forEach(el => {
        el.textContent =
          energy(energyValue, maxEnergy);
      });
  }

  function updateProfileUI(profile = {}) {
    document
      .querySelectorAll("[data-rock-name]")
      .forEach(el => {
        el.textContent =
          profile.displayName || "";
      });

    document
      .querySelectorAll("[data-rock-profile]")
      .forEach(el => {
        if (profile.pictureUrl) {
          el.src = profile.pictureUrl;
        }
      });
  }

  async function init() {
    const ready = await initLiff();

    if (ready === false) {
      return false;
    }

    return true;
  }

  /* =========================================================
     PUBLIC API
  ========================================================= */

  window.ROCK = {
    CFG,
    config: CFG,

    init,
    initLiff,
    initLINE: initLiff,

    getIdToken,
    getProfile,

    postJSON,
    callEdge,

    getDashboard,
    fetchDashboard,
    saveWeight,
    setTarget,
    getProgress,

    getMissions,
    completeMission,

    getBattle,
    fightMonster,

    getRewards,
    claimReward,
    getRanking,

    go,
    goHome,
    goMission,
    goBattle,
    goReward,
    goRewards,
    goRanking,
    goProgress,

    save,
    load,

    num,
    fmtInt,
    fmtWeight,
    formatDate,
    formatDateOnly,
    number,
    coin,
    energy,

    updateTopBar,
    updateProfileUI
  };

  console.log(
    "ROCK SUPABASE BRIDGE READY:",
    {
      dashboard: CFG.API?.DASHBOARD,
      mission: CFG.API?.MISSION,
      battle: CFG.API?.BATTLE
    }
  );

})();
