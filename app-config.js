/* =========================================================
   ROCK YOUR BODY 2026
   APP CONFIGURATION
   ========================================================= */

(function () {
  "use strict";

  /* =======================================================
     BASIC APP
     ======================================================= */

  const APP_NAME = "ROCK YOUR BODY 2026";

  /* =======================================================
     BACKEND API
     ======================================================= */

  const API_BASE =
    window.ROCK_API_BASE ||
  "https://rock-your-body-2026.onrender.com",
  /* =======================================================
     LINE LIFF
     ======================================================= */

  /*
    ใส่ LIFF ID จริงของระบบที่นี่

    ตัวอย่าง:
    LIFF_ID: "2001234567-AbCdEfGh"

    หรือสามารถกำหนดจาก HTML ก่อนโหลดไฟล์นี้ได้:
    window.ROCK_LIFF_ID = "xxxxxxxxxxxxxxxx";
  */

  const LIFF_ID =
    window.ROCK_LIFF_ID ||
    "";

  /* =======================================================
     FRONTEND
     ======================================================= */

  const FRONTEND_URL =
    "https://rock-your-body.github.io/rock-your-body-2026/",
  /* =======================================================
     DEFAULT GAME SETTINGS
     ======================================================= */

  const MAX_ENERGY = 200;

  const DEFAULT_USER = {
    lineUserId: null,

    name: "สมาชิก ROCK YOUR BODY",

    pictureUrl: "",

    rockCoin: 0,

    energy: MAX_ENERGY,

    maxEnergy: MAX_ENERGY,

    points: 0,

    rank: 0,

    weight: 0,

    targetWeight: 0,

    steps: 0,

    targetSteps: 10000,

    calories: 0,

    targetCalories: 500,

    sleep: 0,

    targetSleep: 8,

    healthScore: 0,

    inbodyScore: 0,

    programDay: 0,

    programTotalDays: 90
  };

  /* =======================================================
     PAGE ROUTES
     ======================================================= */

  const PAGES = {

    home:
      "./HOME.html",

    mission:
      "./mission.html",

    battle:
      "./battle.html",

    reward:
      "./reward.html",

    ranking:
      "./ranking.html",

    info:
      "./info.html",

    dashboard:
      "./dashboard.html",

    food:
      "./food-log.html",

    admin:
      "./admin-mission.html"

  };

  /* =======================================================
     STORAGE KEYS
     ======================================================= */

  const STORAGE = {

    LINE_USER_ID:
      "rock_line_user_id",

    USER:
      "rock_user",

    PROFILE:
      "rock_line_profile",

    ENERGY:
      "rock_energy",

    COIN:
      "rock_coin",

    POINTS:
      "rock_points",

    RANK:
      "rock_rank"

  };

  /* =======================================================
     API ENDPOINTS
     ======================================================= */

  const API = {

    health:
      "/api/health",

    me:
      "/api/me",

    dashboard:
      "/api/dashboard",

    missions:
      "/api/missions",

    battle:
      "/api/battle",

    rewards:
      "/api/rewards",

    ranking:
      "/api/ranking"

  };

  /* =======================================================
     HELPER : API URL
     ======================================================= */

  function apiUrl(path) {

    if (!path) {
      return API_BASE;
    }

    return (
      API_BASE.replace(/\/$/, "") +
      "/" +
      path.replace(/^\//, "")
    );

  }

  /* =======================================================
     HELPER : GET STORED USER
     ======================================================= */

  function getStoredUser() {

    try {

      const raw =
        localStorage.getItem(
          STORAGE.USER
        );

      if (!raw) {
        return {
          ...DEFAULT_USER
        };
      }

      const user =
        JSON.parse(raw);

      return {
        ...DEFAULT_USER,
        ...user
      };

    } catch (error) {

      console.error(
        "Cannot read stored user:",
        error
      );

      return {
        ...DEFAULT_USER
      };

    }

  }

  /* =======================================================
     HELPER : SAVE USER
     ======================================================= */

  function saveUser(user) {

    const finalUser = {
      ...DEFAULT_USER,
      ...(user || {})
    };

    try {

      localStorage.setItem(
        STORAGE.USER,
        JSON.stringify(
          finalUser
        )
      );

      if (
        finalUser.lineUserId
      ) {

        localStorage.setItem(
          STORAGE.LINE_USER_ID,
          finalUser.lineUserId
        );

      }

      if (
        finalUser.pictureUrl
      ) {

        localStorage.setItem(
          STORAGE.PROFILE,
          finalUser.pictureUrl
        );

      }

      localStorage.setItem(
        STORAGE.ENERGY,
        String(
          finalUser.energy ?? MAX_ENERGY
        )
      );

      localStorage.setItem(
        STORAGE.COIN,
        String(
          finalUser.rockCoin ?? 0
        )
      );

      localStorage.setItem(
        STORAGE.POINTS,
        String(
          finalUser.points ?? 0
        )
      );

      localStorage.setItem(
        STORAGE.RANK,
        String(
          finalUser.rank ?? 0
        )
      );

    } catch (error) {

      console.error(
        "Cannot save user:",
        error
      );

    }

    return finalUser;

  }

  /* =======================================================
     HELPER : GET LINE USER ID
     ======================================================= */

  function getLineUserId() {

    try {

      return (
        localStorage.getItem(
          STORAGE.LINE_USER_ID
        ) || null
      );

    } catch (error) {

      return null;

    }

  }

  /* =======================================================
     HELPER : GET PROFILE IMAGE
     ======================================================= */

  function getProfileImage() {

    try {

      return (
        localStorage.getItem(
          STORAGE.PROFILE
        ) || ""
      );

    } catch (error) {

      return "";

    }

  }

  /* =======================================================
     FETCH CURRENT USER
     ======================================================= */

  async function fetchMe() {

    const lineUserId =
      getLineUserId();

    const headers = {};

    if (lineUserId) {

      headers[
        "x-line-user-id"
      ] = lineUserId;

    }

    const response =
      await fetch(
        apiUrl(API.me),
        {
          method: "GET",
          headers,
          credentials: "include"
        }
      );

    if (!response.ok) {

      throw new Error(
        "Unable to load user"
      );

    }

    const data =
      await response.json();

    if (
      data &&
      data.user
    ) {

      saveUser(
        data.user
      );

    }

    return data;

  }

  /* =======================================================
     FETCH DASHBOARD
     ======================================================= */

  async function fetchDashboard() {

    const response =
      await fetch(
        apiUrl(API.dashboard),
        {
          method: "GET",
          credentials: "include"
        }
      );

    if (!response.ok) {

      throw new Error(
        "Unable to load dashboard"
      );

    }

    return response.json();

  }

  /* =======================================================
     FETCH MISSIONS
     ======================================================= */

  async function fetchMissions() {

    const response =
      await fetch(
        apiUrl(API.missions),
        {
          method: "GET",
          credentials: "include"
        }
      );

    if (!response.ok) {

      throw new Error(
        "Unable to load missions"
      );

    }

    return response.json();

  }

  /* =======================================================
     FETCH BATTLE
     ======================================================= */

  async function fetchBattle() {

    const response =
      await fetch(
        apiUrl(API.battle),
        {
          method: "GET",
          credentials: "include"
        }
      );

    if (!response.ok) {

      throw new Error(
        "Unable to load battle"
      );

    }

    return response.json();

  }

  /* =======================================================
     FETCH REWARDS
     ======================================================= */

  async function fetchRewards() {

    const response =
      await fetch(
        apiUrl(API.rewards),
        {
          method: "GET",
          credentials: "include"
        }
      );

    if (!response.ok) {

      throw new Error(
        "Unable to load rewards"
      );

    }

    return response.json();

  }

  /* =======================================================
     FETCH RANKING
     ======================================================= */

  async function fetchRanking() {

    const response =
      await fetch(
        apiUrl(API.ranking),
        {
          method: "GET",
          credentials: "include"
        }
      );

    if (!response.ok) {

      throw new Error(
        "Unable to load ranking"
      );

    }

    return response.json();

  }

  /* =======================================================
     NAVIGATION
     ======================================================= */

  function go(page) {

    if (
      !PAGES[page]
    ) {

      console.warn(
        "Unknown page:",
        page
      );

      return;

    }

    window.location.href =
      PAGES[page];

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

  function goDashboard() {
    go("dashboard");
  }

  function goFood() {
    go("food");
  }

  /* =======================================================
     FORMAT NUMBER
     ======================================================= */

  function number(value) {

    const n =
      Number(value);

    if (
      Number.isNaN(n)
    ) {

      return "0";

    }

    return n.toLocaleString(
      "en-US"
    );

  }

  /* =======================================================
     FORMAT DECIMAL
     ======================================================= */

  function decimal(
    value,
    digits = 1
  ) {

    const n =
      Number(value);

    if (
      Number.isNaN(n)
    ) {

      return "0";

    }

    return n.toLocaleString(
      "en-US",
      {
        minimumFractionDigits:
          digits,

        maximumFractionDigits:
          digits
      }
    );

  }

  /* =======================================================
     CALCULATE PERCENT
     ======================================================= */

  function percent(
    current,
    target
  ) {

    const c =
      Number(current) || 0;

    const t =
      Number(target) || 0;

    if (t <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        Math.round(
          (c / t) * 100
        )
      )
    );

  }

  /* =======================================================
     LINE PROFILE
     ======================================================= */

  function saveLineProfile(
    profile
  ) {

    if (!profile) {
      return null;
    }

    const lineProfile = {

      userId:
        profile.userId ||
        null,

      displayName:
        profile.displayName ||
        "สมาชิก ROCK YOUR BODY",

      pictureUrl:
        profile.pictureUrl ||
        "",

      statusMessage:
        profile.statusMessage ||
        ""

    };

    try {

      localStorage.setItem(
        STORAGE.PROFILE,
        lineProfile.pictureUrl
      );

      if (
        lineProfile.userId
      ) {

        localStorage.setItem(
          STORAGE.LINE_USER_ID,
          lineProfile.userId
        );

      }

    } catch (error) {

      console.error(
        "Cannot save LINE profile:",
        error
      );

    }

    return lineProfile;

  }

  /* =======================================================
     GET LINE PROFILE
     ======================================================= */

  async function getLineProfile() {

    if (
      !window.liff ||
      !LIFF_ID
    ) {

      return null;

    }

    try {

      const profile =
        await window.liff.getProfile();

      return saveLineProfile(
        profile
      );

    } catch (error) {

      console.error(
        "LINE profile error:",
        error
      );

      return null;

    }

  }

  /* =======================================================
     INITIALIZE LINE LIFF
     ======================================================= */

  async function initLIFF() {

    if (
      !window.liff ||
      !LIFF_ID
    ) {

      console.warn(
        "LIFF is not configured."
      );

      return {
        ready: false,
        loggedIn: false,
        profile: null
      };

    }

    try {

      await window.liff.init(
        {
          liffId: LIFF_ID
        }
      );

      let loggedIn =
        window.liff.isLoggedIn();

      /*
        ถ้าเปิดผ่าน LINE
        แต่ยังไม่ได้ login
        ให้ login
      */

      if (!loggedIn) {

        if (
          window.liff.isInClient()
        ) {

          /*
            ใน LINE App
            ปกติไม่ต้องเรียก login
          */

          loggedIn =
            window.liff.isLoggedIn();

        }

      }

      let profile = null;

      if (loggedIn) {

        profile =
          await getLineProfile();

      }

      return {
        ready: true,
        loggedIn,
        profile
      };

    } catch (error) {

      console.error(
        "LIFF initialization error:",
        error
      );

      return {
        ready: false,
        loggedIn: false,
        profile: null,
        error
      };

    }

  }

  /* =======================================================
     INITIALIZE APPLICATION
     ======================================================= */

  async function initApp() {

    let line = null;

    try {

      line =
        await initLIFF();

    } catch (error) {

      console.error(
        "LINE init failed:",
        error
      );

    }

    let user =
      getStoredUser();

    /*
      ถ้ามี LINE profile
      ให้นำข้อมูล profile
      มาใส่ user
    */

    if (
      line &&
      line.profile
    ) {

      user = {

        ...user,

        lineUserId:
          line.profile.userId ||
          user.lineUserId,

        name:
          line.profile.displayName ||
          user.name,

        pictureUrl:
          line.profile.pictureUrl ||
          user.pictureUrl

      };

      saveUser(user);

    }

    /*
      โหลดข้อมูลจาก API
    */

    try {

      const result =
        await fetchMe();

      if (
        result &&
        result.user
      ) {

        user = {
          ...user,
          ...result.user
        };

        /*
          สำคัญ:
          ให้ LINE profile
          มี priority สำหรับ
          รูปและชื่อ
        */

        if (
          line &&
          line.profile
        ) {

          user.name =
            line.profile.displayName ||
            user.name;

          user.pictureUrl =
            line.profile.pictureUrl ||
            user.pictureUrl;

          user.lineUserId =
            line.profile.userId ||
            user.lineUserId;

        }

        saveUser(user);

      }

    } catch (error) {

      console.warn(
        "API user loading failed:",
        error
      );

    }

    return {

      user,

      line,

      config:
        window.ROCK_CONFIG

    };

  }

  /* =======================================================
     EXPORT CONFIG
     ======================================================= */

  window.ROCK_CONFIG = {

    APP_NAME,

    API_BASE,

    LIFF_ID,

    FRONTEND_URL,

    MAX_ENERGY,

    DEFAULT_USER,

    PAGES,

    STORAGE,

    API,

    apiUrl,

    getStoredUser,

    saveUser,

    getLineUserId,

    getProfileImage,

    fetchMe,

    fetchDashboard,

    fetchMissions,

    fetchBattle,

    fetchRewards,

    fetchRanking,

    saveLineProfile,

    getLineProfile,

    initLIFF,

    initApp,

    go,

    goHome,

    goMission,

    goBattle,

    goReward,

    goRanking,

    goInfo,

    goDashboard,

    goFood,

    number,

    decimal,

    percent

  };

  /* =======================================================
     GLOBAL ROCK OBJECT
     ======================================================= */

  window.ROCK =
    window.ROCK || {};

  Object.assign(
    window.ROCK,
    {

      config:
        window.ROCK_CONFIG,

      go,

      goHome,

      goMission,

      goBattle,

      goReward,

      goRanking,

      goInfo,

      goDashboard,

      goFood,

      fetchMe,

      fetchDashboard,

      fetchMissions,

      fetchBattle,

      fetchRewards,

      fetchRanking,

      initLIFF,

      initApp,

      getLineProfile,

      getProfileImage,

      getStoredUser,

      saveUser,

      number,

      decimal,

      percent

    }
  );

  /* =======================================================
     READY
     ======================================================= */

  console.log(
    "ROCK YOUR BODY 2026 CONFIG READY",
    window.ROCK_CONFIG
  );

})();
