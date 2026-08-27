/* =========================================================
   ROCK YOUR BODY 2026
   ROCK CORE
   Version: 2026-08-28-FINAL
   ========================================================= */

(function () {
  "use strict";

  /* -------------------------------------------------------
     GLOBAL ROCK OBJECT
  ------------------------------------------------------- */

  window.ROCK = window.ROCK || {};

  const CONFIG = window.APP_CONFIG || {};

  const LIFF_ID = CONFIG.LIFF_ID || "2011201679-uNWz5yqF";

  const API = CONFIG.API || {
    DASHBOARD:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/player-dashboard",

    MISSION:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/mission",

    BATTLE:
      "https://nztvqdzatdpauufpvdaa.supabase.co/functions/v1/battle"
  };


  /* =======================================================
     STATE
  ======================================================= */

  ROCK.state = ROCK.state || {
    liffReady: false,
    loggedIn: false,
    profile: null,
    userId: null,
    dashboard: null
  };


  /* =======================================================
     INIT LINE / LIFF
  ======================================================= */

  ROCK.initLINE = async function () {

    try {

      /* ตรวจสอบ LIFF SDK */

      if (!window.liff) {
        throw new Error(
          "LIFF SDK is not loaded"
        );
      }


      /* Initialize LIFF */

      await liff.init({
        liffId: LIFF_ID
      });

      ROCK.state.liffReady = true;


      /* Login */

      if (!liff.isLoggedIn()) {

        liff.login({
          redirectUri: window.location.href
        });

        return null;
      }


      ROCK.state.loggedIn = true;


      /* LINE Profile */

      const profile = await liff.getProfile();

      ROCK.state.profile = profile;

      ROCK.state.userId = profile.userId;


      /* Save locally */

      localStorage.setItem(
        "rock_line_user_id",
        profile.userId
      );

      localStorage.setItem(
        "rock_line_profile",
        JSON.stringify(profile)
      );


      console.log(
        "ROCK LINE READY",
        profile.userId
      );


      return profile;

    } catch (error) {

      console.error(
        "ROCK.initLINE ERROR:",
        error
      );

      throw error;
    }
  };


  /* =======================================================
     GET LINE USER ID
  ======================================================= */

  ROCK.getLineUserId = function () {

    if (ROCK.state.userId) {
      return ROCK.state.userId;
    }

    const saved =
      localStorage.getItem(
        "rock_line_user_id"
      );

    if (saved) {
      ROCK.state.userId = saved;
      return saved;
    }

    if (
      ROCK.state.profile &&
      ROCK.state.profile.userId
    ) {
      ROCK.state.userId =
        ROCK.state.profile.userId;

      return ROCK.state.profile.userId;
    }

    return null;
  };


  /* =======================================================
     GET PROFILE
  ======================================================= */

  ROCK.getProfile = function () {

    if (ROCK.state.profile) {
      return ROCK.state.profile;
    }

    try {

      const saved =
        localStorage.getItem(
          "rock_line_profile"
        );

      if (saved) {
        ROCK.state.profile =
          JSON.parse(saved);

        return ROCK.state.profile;
      }

    } catch (e) {
      console.warn(
        "Cannot read saved LINE profile",
        e
      );
    }

    return null;
  };


  /* =======================================================
     FETCH DASHBOARD
  ======================================================= */

  ROCK.fetchDashboard = async function () {

    const userId =
      ROCK.getLineUserId();

    if (!userId) {

      throw new Error(
        "LINE User ID is required"
      );
    }


    const url =
      API.DASHBOARD +
      "?lineUserId=" +
      encodeURIComponent(userId);


    console.log(
      "ROCK.fetchDashboard:",
      url
    );


    const response =
      await fetch(
        url,
        {
          method: "GET",

          headers: {
            "Accept":
              "application/json",

            "X-Line-User-ID":
              userId,

            "X-LINE-USER-ID":
              userId
          },

          cache: "no-store"
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.error ||
        "Dashboard API error"
      );
    }


    if (
      data &&
      data.ok === false
    ) {

      throw new Error(
        data.error ||
        "Dashboard API returned error"
      );
    }


    ROCK.state.dashboard =
      data;


    return data;
  };


  /* =======================================================
     GENERIC API
  ======================================================= */

  ROCK.api = async function (
    url,
    options = {}
  ) {

    const userId =
      ROCK.getLineUserId();


    const headers = {
      "Accept":
        "application/json",

      ...(options.headers || {})
    };


    if (userId) {

      headers[
        "X-Line-User-ID"
      ] = userId;

      headers[
        "X-LINE-USER-ID"
      ] = userId;
    }


    const response =
      await fetch(
        url,
        {
          ...options,
          headers
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.error ||
        "API request failed"
      );
    }


    return data;
  };


  /* =======================================================
     NAVIGATION
  ======================================================= */

  ROCK.go = function (page) {

    if (!page) return;


    if (
      page.startsWith("http")
    ) {

      window.location.href =
        page;

      return;
    }


    window.location.href =
      page;
  };


  /* =======================================================
     PAGE HELPERS
  ======================================================= */

  ROCK.goHome = function () {

    const page =
      CONFIG.PAGE?.HOME ||
      "./dashboard.html";

    ROCK.go(page);
  };


  ROCK.goMission = function () {

    const page =
      CONFIG.PAGE?.MISSION ||
      "./mission.html";

    ROCK.go(page);
  };


  ROCK.goBattle = function () {

    const page =
      CONFIG.PAGE?.BATTLE ||
      "./battle.html";

    ROCK.go(page);
  };


  ROCK.goWeight = function () {

    const page =
      CONFIG.PAGE?.WEIGHT ||
      "./weight-check.html";

    ROCK.go(page);
  };


  ROCK.goProgress = function () {

    const page =
      CONFIG.PAGE?.PROGRESS ||
      "./progress.html";

    ROCK.go(page);
  };


  ROCK.goRewards = function () {

    const page =
      CONFIG.PAGE?.REWARDS ||
      "./rewards.html";

    ROCK.go(page);
  };


  ROCK.goRanking = function () {

    const page =
      CONFIG.PAGE?.RANKING ||
      "./ranking.html";

    ROCK.go(page);
  };


  /* =======================================================
     LOGOUT
  ======================================================= */

  ROCK.logout = function () {

    try {

      if (
        window.liff &&
        liff.isLoggedIn()
      ) {
        liff.logout();
      }

    } catch (e) {
      console.warn(e);
    }


    localStorage.removeItem(
      "rock_line_user_id"
    );

    localStorage.removeItem(
      "rock_line_profile"
    );

    ROCK.state.userId = null;
    ROCK.state.profile = null;
    ROCK.state.loggedIn = false;


    window.location.reload();
  };


  /* =======================================================
     READY
  ======================================================= */

  ROCK.ready = function () {

    return (
      ROCK.state.liffReady &&
      ROCK.state.loggedIn &&
      !!ROCK.getLineUserId()
    );
  };


  /* =======================================================
     DEBUG
  ======================================================= */

  console.log(
    "================================="
  );

  console.log(
    "ROCK CORE READY"
  );

  console.log(
    "LIFF ID:",
    LIFF_ID
  );

  console.log(
    "ROCK.initLINE:",
    typeof ROCK.initLINE
  );

  console.log(
    "ROCK.fetchDashboard:",
    typeof ROCK.fetchDashboard
  );

  console.log(
    "================================="
  );

})();
