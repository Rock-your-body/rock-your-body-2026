/* =========================================================
   ROCK YOUR BODY 2026
   COMMON CORE
   ========================================================= */

(function () {
  "use strict";

  const CONFIG = window.ROCK_CONFIG;

  if (!CONFIG) {
    console.error("ROCK_CONFIG is missing.");
    return;
  }

  /* =======================================================
     STORAGE
     ======================================================= */

  const STORAGE = CONFIG.STORAGE;

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Storage save error:", error);
    }
  }

  function load(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);

      if (value === null) {
        return fallback;
      }

      return JSON.parse(value);
    } catch (error) {
      console.error("Storage load error:", error);
      return fallback;
    }
  }

  /* =======================================================
     API
     ======================================================= */

  async function api(path, options = {}) {
    const url =
      CONFIG.API_BASE.replace(/\/$/, "") +
      path;

    const userId =
      localStorage.getItem(STORAGE.LINE_USER_ID);

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    if (userId) {
      headers["x-line-user-id"] = userId;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    let data = null;

    try {
      data = await response.json();
    } catch (error) {
      throw new Error(
        `API returned invalid JSON (${response.status})`
      );
    }

    if (!response.ok) {
      const message =
        data?.error ||
        data?.message ||
        `API Error ${response.status}`;

      throw new Error(message);
    }

    return data;
  }

  /* =======================================================
     HEALTH CHECK
     ======================================================= */

  async function healthCheck() {
    try {
      const result = await api("/api/health");

      console.log(
        "ROCK API ONLINE:",
        result
      );

      return result;
    } catch (error) {
      console.error(
        "ROCK API OFFLINE:",
        error
      );

      return {
        ok: false,
        error: error.message
      };
    }
  }

  /* =======================================================
     LINE LIFF
     ======================================================= */

  async function initLINE() {
    if (
      !CONFIG.LIFF_ID ||
      typeof liff === "undefined"
    ) {
      console.warn(
        "LIFF is not configured."
      );

      return {
        ok: false,
        mode: "web"
      };
    }

    try {
      await liff.init({
        liffId: CONFIG.LIFF_ID
      });

      if (!liff.isLoggedIn()) {
        liff.login();
        return {
          ok: false,
          mode: "login"
        };
      }

      const profile =
        await liff.getProfile();

      const userId = profile.userId;

      localStorage.setItem(
        STORAGE.LINE_USER_ID,
        userId
      );

      const user = {
        lineUserId: userId,
        displayName:
          profile.displayName || "",
        pictureUrl:
          profile.pictureUrl || ""
      };

      save(
        STORAGE.USER,
        user
      );

      return {
        ok: true,
        mode: "line",
        user
      };

    } catch (error) {
      console.error(
        "LINE LIFF ERROR:",
        error
      );

      return {
        ok: false,
        mode: "error",
        error: error.message
      };
    }
  }

  /* =======================================================
     CURRENT USER
     ======================================================= */

  async function getMe() {
    try {
      const data =
        await api("/api/me");

      if (data.user) {
        save(
          STORAGE.USER,
          data.user
        );
      }

      return data;

    } catch (error) {
      console.error(
        "GET USER ERROR:",
        error
      );

      return {
        ok: false,
        error: error.message
      };
    }
  }

  /* =======================================================
     DASHBOARD
     ======================================================= */

  async function getDashboard() {
    return api("/api/dashboard");
  }

  /* =======================================================
     MISSIONS
     ======================================================= */

  async function getMissions() {
    return api("/api/missions");
  }

  async function completeMission(missionId) {
    return api(
      `/api/missions/${encodeURIComponent(
        missionId
      )}/complete`,
      {
        method: "POST"
      }
    );
  }

  /* =======================================================
     BATTLE
     ======================================================= */

  async function getBattle() {
    return api("/api/battle");
  }

  async function fightMonster() {
    return api(
      "/api/battle/fight",
      {
        method: "POST"
      }
    );
  }

  /* =======================================================
     REWARD
     ======================================================= */

  async function getRewards() {
    return api("/api/rewards");
  }

  /* =======================================================
     RANKING
     ======================================================= */

  async function getRanking() {
    return api("/api/ranking");
  }

  /* =======================================================
     NAVIGATION
     ======================================================= */

  function go(page) {
    const target =
      CONFIG.PAGES[page];

    if (!target) {
      console.error(
        "Unknown ROCK page:",
        page
      );

      return;
    }

    window.location.href = target;
  }

  function goHome() {
    go("home");
  }

  function goMission() {
    go("mission");
  }

  function goBattle() {
    go("battle");
  }

  function goReward() {
    go("reward");
  }

  function goRanking() {
    go("ranking");
  }

  function goInfo() {
    go("info");
  }

  /* =======================================================
     FORMATTERS
     ======================================================= */

  function number(value) {
    return Number(value || 0)
      .toLocaleString("en-US");
  }

  function coin(value) {
    return number(value);
  }

  function energy(value, max = CONFIG.MAX_ENERGY) {
    return `${number(value)} / ${number(max)}`;
  }

  /* =======================================================
     UPDATE COMMON UI
     ======================================================= */

  function updateTopBar(user) {
    if (!user) return;

    document
      .querySelectorAll(
        "[data-rock-coin]"
      )
      .forEach((element) => {
        element.textContent =
          coin(user.rockCoin);
      });

    document
      .querySelectorAll(
        "[data-energy]"
      )
      .forEach((element) => {
        element.textContent =
          energy(
            user.energy,
            user.maxEnergy
          );
      });

    document
      .querySelectorAll(
        "[data-points]"
      )
      .forEach((element) => {
        element.textContent =
          number(user.points);
      });

    document
      .querySelectorAll(
        "[data-rank]"
      )
      .forEach((element) => {
        element.textContent =
          user.rank
            ? `#${user.rank}`
            : "-";
      });
  }

  /* =======================================================
     INIT
     ======================================================= */

  async function init() {
    console.log(
      "ROCK YOUR BODY CORE INITIALIZING..."
    );

    await healthCheck();

    /*
      LIFF จะเปิดใช้งานเมื่อใส่ LIFF_ID
    */
    if (CONFIG.LIFF_ID) {
      await initLINE();
    }

    const me =
      await getMe();

    if (me?.user) {
      updateTopBar(me.user);
    }

    console.log(
      "ROCK YOUR BODY CORE READY"
    );
  }

  /* =======================================================
     PUBLIC API
     ======================================================= */

  window.ROCK = {

    config: CONFIG,

    api,

    healthCheck,

    initLINE,

    getMe,

    getDashboard,

    getMissions,
    completeMission,

    getBattle,
    fightMonster,

    getRewards,

    getRanking,

    go,
    goHome,
    goMission,
    goBattle,
    goReward,
    goRanking,
    goInfo,

    save,
    load,

    number,
    coin,
    energy,

    updateTopBar,

    init
  };

})();
