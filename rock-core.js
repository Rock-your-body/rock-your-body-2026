/* =========================================================
   ROCK YOUR BODY 2026
   ROCK CORE
   Supabase Auth Edition
   Version: 2026-09-06-SUPABASE-AUTH
   ========================================================= */

(function () {
  "use strict";

  /* =======================================================
     GLOBAL ROCK OBJECT
     ======================================================= */

  window.ROCK =
    window.ROCK || {};

  const CONFIG =
    window.APP_CONFIG || {};

  const API =
    CONFIG.API || {};


  /* =======================================================
     STATE
     ======================================================= */

  ROCK.state =
    ROCK.state || {
      authReady: false,
      loggedIn: false,

      user: null,
      userId: null,

      profile: null,

      session: null,
      accessToken: null,

      dashboard: null,
    };


  /* =======================================================
     INTERNAL
     Supabase client
     ======================================================= */

  let supabaseClient =
    null;

  let authModule =
    null;


  /**
   * rock-core.js เป็น classic script
   * แต่ auth.js เป็น ES module
   *
   * เราจึง import auth.js แบบ dynamic
   * เพื่อใช้ Supabase client ตัวเดียวกับระบบ Login
   */
  async function getSupabase() {
    if (supabaseClient) {
      return supabaseClient;
    }

    try {
      if (!authModule) {
        authModule =
          await import(
            "./auth.js"
          );
      }

      if (!authModule?.db) {
        throw new Error(
          "Supabase client is not available from auth.js"
        );
      }

      supabaseClient =
        authModule.db;

      return supabaseClient;

    } catch (error) {
      console.error(
        "ROCK getSupabase error:",
        error
      );

      throw new Error(
        "ไม่สามารถเชื่อมต่อระบบ Authentication ได้"
      );
    }
  }


  /* =======================================================
     CLEAR AUTH STATE
     ======================================================= */

  function clearAuthState() {
    ROCK.state.authReady =
      true;

    ROCK.state.loggedIn =
      false;

    ROCK.state.user =
      null;

    ROCK.state.userId =
      null;

    ROCK.state.profile =
      null;

    ROCK.state.session =
      null;

    ROCK.state.accessToken =
      null;

    ROCK.state.dashboard =
      null;
  }


  /* =======================================================
     INIT AUTH
     ======================================================= */

  ROCK.initAuth =
    async function ({
      redirect = true,
    } = {}) {

      try {
        const db =
          await getSupabase();


        /* -----------------------------------------------
           GET SESSION
        ----------------------------------------------- */

        const {
          data: sessionData,
          error: sessionError,
        } =
          await db.auth
            .getSession();

        if (sessionError) {
          console.error(
            "ROCK getSession:",
            sessionError
          );
        }

        const session =
          sessionData?.session ||
          null;


        /* -----------------------------------------------
           NO SESSION
        ----------------------------------------------- */

        if (!session) {
          clearAuthState();

          if (redirect) {
            ROCK.goLogin();
          }

          return null;
        }


        /* -----------------------------------------------
           VERIFY USER
        ----------------------------------------------- */

        const {
          data: userData,
          error: userError,
        } =
          await db.auth
            .getUser();

        if (
          userError ||
          !userData?.user
        ) {
          console.error(
            "ROCK getUser:",
            userError
          );

          clearAuthState();

          if (redirect) {
            ROCK.goLogin();
          }

          return null;
        }


        const user =
          userData.user;


        /* -----------------------------------------------
           SET STATE
        ----------------------------------------------- */

        ROCK.state.authReady =
          true;

        ROCK.state.loggedIn =
          true;

        ROCK.state.user =
          user;

        ROCK.state.userId =
          user.id;

        ROCK.state.session =
          session;

        ROCK.state.accessToken =
          session.access_token;


        /* -----------------------------------------------
           LOAD PROFILE
        ----------------------------------------------- */

        await ROCK.fetchProfile({
          redirect,
        });


        console.log(
          "ROCK AUTH READY:",
          user.id
        );


        return user;

      } catch (error) {
        console.error(
          "ROCK.initAuth ERROR:",
          error
        );

        clearAuthState();

        throw error;
      }
    };


  /* =======================================================
     INIT
     Compatibility helper
     ======================================================= */

  ROCK.init =
    ROCK.initAuth;


  /* =======================================================
     GET USER
     ======================================================= */

  ROCK.getUser =
    function () {
      return (
        ROCK.state.user ||
        null
      );
    };


  /* =======================================================
     GET USER ID
     ======================================================= */

  ROCK.getUserId =
    function () {
      return (
        ROCK.state.userId ||
        ROCK.state.user?.id ||
        null
      );
    };


  /* =======================================================
     GET ACCESS TOKEN
     ======================================================= */

  ROCK.getAccessToken =
    async function () {

      try {
        const db =
          await getSupabase();

        const {
          data,
          error,
        } =
          await db.auth
            .getSession();

        if (error) {
          throw error;
        }

        const session =
          data?.session;

        if (!session) {
          clearAuthState();
          return null;
        }

        ROCK.state.session =
          session;

        ROCK.state.accessToken =
          session.access_token;

        ROCK.state.user =
          session.user ||
          ROCK.state.user;

        ROCK.state.userId =
          session.user?.id ||
          ROCK.state.userId;

        ROCK.state.loggedIn =
          true;

        return (
          session.access_token ||
          null
        );

      } catch (error) {
        console.error(
          "ROCK.getAccessToken:",
          error
        );

        return null;
      }
    };


  /* =======================================================
     FETCH USER PROFILE
     ======================================================= */

  ROCK.fetchProfile =
    async function ({
      redirect = true,
    } = {}) {

      const userId =
        ROCK.getUserId();

      if (!userId) {
        if (redirect) {
          ROCK.goLogin();
        }

        return null;
      }


      try {
        const db =
          await getSupabase();

        const {
          data,
          error,
        } =
          await db
            .from(
              "user_profiles"
            )
            .select("*")
            .eq(
              "id",
              userId
            )
            .single();


        if (error) {
          console.error(
            "ROCK.fetchProfile:",
            error
          );

          ROCK.state.profile =
            null;

          return null;
        }


        ROCK.state.profile =
          data;


        /* -----------------------------------------------
           ACCOUNT STATUS
        ----------------------------------------------- */

        if (
          data?.status &&
          data.status !== "active"
        ) {
          console.warn(
            "ROCK account is not active:",
            data.status
          );
        }


        return data;

      } catch (error) {
        console.error(
          "ROCK.fetchProfile ERROR:",
          error
        );

        return null;
      }
    };


  /* =======================================================
     GET PROFILE
     ======================================================= */

  ROCK.getProfile =
    function () {
      return (
        ROCK.state.profile ||
        null
      );
    };


  /* =======================================================
     AUTHENTICATED FETCH
     ======================================================= */

  ROCK.api =
    async function (
      url,
      options = {}
    ) {

      if (!url) {
        throw new Error(
          "API URL is required"
        );
      }


      /* -----------------------------------------------
         GET TOKEN
      ----------------------------------------------- */

      let token =
        await ROCK.getAccessToken();


      /*
       * ถ้ายังไม่มี session ใน state
       * ให้ลอง initialize authentication
       */
      if (!token) {
        await ROCK.initAuth({
          redirect: false,
        });

        token =
          await ROCK.getAccessToken();
      }


      if (!token) {
        ROCK.goLogin();

        throw new Error(
          "Authentication required"
        );
      }


      /* -----------------------------------------------
         HEADERS
      ----------------------------------------------- */

      const headers =
        new Headers(
          options.headers ||
          {}
        );


      if (
        !headers.has(
          "Accept"
        )
      ) {
        headers.set(
          "Accept",
          "application/json"
        );
      }


      /*
       * Supabase JWT
       *
       * Edge Function ต้องอ่าน token นี้
       * และหา auth.uid() จาก token
       *
       * ห้ามใช้ userId จาก query/header
       * เป็นตัวตัดสิน identity อีกต่อไป
       */
      headers.set(
        "Authorization",
        `Bearer ${token}`
      );


      /* -----------------------------------------------
         JSON BODY
      ----------------------------------------------- */

      if (
        options.body &&
        typeof options.body ===
          "object" &&
        !(
          options.body instanceof
          FormData
        ) &&
        !(
          options.body instanceof
          Blob
        ) &&
        !(
          options.body instanceof
          ArrayBuffer
        )
      ) {
        if (
          !headers.has(
            "Content-Type"
          )
        ) {
          headers.set(
            "Content-Type",
            "application/json"
          );
        }

        options = {
          ...options,

          body:
            JSON.stringify(
              options.body
            ),
        };
      }


      /* -----------------------------------------------
         REQUEST
      ----------------------------------------------- */

      const response =
        await fetch(
          url,
          {
            ...options,

            headers,

            cache:
              options.cache ||
              "no-store",
          }
        );


      /* -----------------------------------------------
         READ RESPONSE
      ----------------------------------------------- */

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";


      let data;


      if (
        contentType.includes(
          "application/json"
        )
      ) {
        data =
          await response.json();
      } else {
        const text =
          await response.text();

        data = {
          text,
        };
      }


      /* -----------------------------------------------
         UNAUTHORIZED
      ----------------------------------------------- */

      if (
        response.status ===
          401
      ) {
        clearAuthState();

        console.warn(
          "ROCK API unauthorized"
        );

        ROCK.goLogin();

        throw new Error(
          data?.error ||
          data?.message ||
          "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่"
        );
      }


      /* -----------------------------------------------
         FORBIDDEN
      ----------------------------------------------- */

      if (
        response.status ===
          403
      ) {
        throw new Error(
          data?.error ||
          data?.message ||
          "คุณไม่มีสิทธิ์ดำเนินการนี้"
        );
      }


      /* -----------------------------------------------
         OTHER ERROR
      ----------------------------------------------- */

      if (!response.ok) {
        throw new Error(
          data?.error ||
          data?.message ||
          `API request failed (${response.status})`
        );
      }


      if (
        data &&
        data.ok === false
      ) {
        throw new Error(
          data.error ||
          data.message ||
          "API returned an error"
        );
      }


      return data;
    };


  /* =======================================================
     FETCH DASHBOARD
     ======================================================= */

  ROCK.fetchDashboard =
    async function () {

      /*
       * app-config.js เวอร์ชันใหม่ใช้ API.PLAYER
       * แต่รองรับ API.DASHBOARD ชั่วคราว
       */
      const url =
        API.PLAYER ||
        API.DASHBOARD;


      if (!url) {
        throw new Error(
          "Player Dashboard API is not configured"
        );
      }


      /*
       * ไม่มี ?lineUserId=
       * ไม่มี X-Line-User-ID
       *
       * Edge Function ต้องหา user
       * จาก Authorization JWT เท่านั้น
       */
      const data =
        await ROCK.api(
          url,
          {
            method: "GET",
          }
        );


      ROCK.state.dashboard =
        data;


      return data;
    };


  /* =======================================================
     MISSION API
     ======================================================= */

  ROCK.mission =
    async function (
      options = {}
    ) {

      if (!API.MISSION) {
        throw new Error(
          "Mission API is not configured"
        );
      }

      return ROCK.api(
        API.MISSION,
        options
      );
    };


  /* =======================================================
     BATTLE API
     ======================================================= */

  ROCK.battle =
    async function (
      options = {}
    ) {

      if (!API.BATTLE) {
        throw new Error(
          "Battle API is not configured"
        );
      }

      return ROCK.api(
        API.BATTLE,
        options
      );
    };


  /* =======================================================
     NUTRITION API
     ======================================================= */

  ROCK.nutrition =
    async function (
      options = {}
    ) {

      if (!API.NUTRITION) {
        throw new Error(
          "Nutrition API is not configured"
        );
      }

      return ROCK.api(
        API.NUTRITION,
        options
      );
    };


  /* =======================================================
     INBODY API
     ======================================================= */

  ROCK.inbody =
    async function (
      options = {}
    ) {

      if (!API.INBODY) {
        throw new Error(
          "InBody API is not configured"
        );
      }

      return ROCK.api(
        API.INBODY,
        options
      );
    };


  /* =======================================================
     PROJECT SETTINGS API
     ======================================================= */

  ROCK.projectSettings =
    async function (
      options = {}
    ) {

      if (
        !API.PROJECT_SETTINGS
      ) {
        throw new Error(
          "Project Settings API is not configured"
        );
      }

      return ROCK.api(
        API.PROJECT_SETTINGS,
        options
      );
    };


  /* =======================================================
     ADMIN API
     ======================================================= */

  ROCK.admin =
    async function (
      options = {}
    ) {

      if (!API.ADMIN) {
        throw new Error(
          "Admin API is not configured"
        );
      }

      return ROCK.api(
        API.ADMIN,
        options
      );
    };


  /* =======================================================
     NAVIGATION
     ======================================================= */

  ROCK.go =
    function (page) {

      if (!page) {
        return;
      }


      if (
        /^https?:\/\//i.test(
          page
        )
      ) {
        window.location.href =
          page;

        return;
      }


      window.location.href =
        page;
    };


  /* =======================================================
     LOGIN PAGE
     ======================================================= */

  ROCK.goLogin =
    function () {

      const page =
        CONFIG.PAGE?.LOGIN ||
        "./index.html";


      /*
       * กัน redirect loop
       * ถ้าอยู่ index.html อยู่แล้ว
       */
      const currentFile =
        window.location.pathname
          .split("/")
          .pop();


      const loginFile =
        page
          .split("?")[0]
          .split("#")[0]
          .split("/")
          .pop();


      if (
        currentFile ===
        loginFile
      ) {
        return;
      }


      ROCK.go(page);
    };


  /* =======================================================
     PAGE HELPERS
     ======================================================= */

  ROCK.goHome =
    function () {

      const page =
        CONFIG.PAGE?.HOME ||
        CONFIG.PAGE?.DASHBOARD ||
        "./dashboard.html";

      ROCK.go(page);
    };


  ROCK.goMission =
    function () {

      const page =
        CONFIG.PAGE?.MISSION ||
        "./mission.html";

      ROCK.go(page);
    };


  ROCK.goBattle =
    function () {

      const page =
        CONFIG.PAGE?.BATTLE ||
        "./battle.html";

      ROCK.go(page);
    };


  ROCK.goBattleMap =
    function () {

      const page =
        CONFIG.PAGE?.BATTLE_MAP ||
        "./battle_map.html";

      ROCK.go(page);
    };


  ROCK.goBattleStage =
    function () {

      const page =
        CONFIG.PAGE?.BATTLE_STAGE ||
        "./battle_stage.html";

      ROCK.go(page);
    };


  ROCK.goWeight =
    function () {

      const page =
        CONFIG.PAGE?.WEIGHT ||
        "./weight-check.html";

      ROCK.go(page);
    };


  ROCK.goProgress =
    function () {

      const page =
        CONFIG.PAGE?.PROGRESS ||
        "./progress.html";

      ROCK.go(page);
    };


  ROCK.goRewards =
    function () {

      const page =
        CONFIG.PAGE?.REWARDS ||
        "./rewards.html";

      ROCK.go(page);
    };


  ROCK.goRanking =
    function () {

      const page =
        CONFIG.PAGE?.RANKING ||
        "./ranking.html";

      ROCK.go(page);
    };


  ROCK.goNutrition =
    function () {

      const page =
        CONFIG.PAGE?.NUTRITION ||
        "./nutrition.html";

      ROCK.go(page);
    };


  ROCK.goInBody =
    function () {

      const page =
        CONFIG.PAGE?.INBODY ||
        "./inbody.html";

      ROCK.go(page);
    };


  ROCK.goPortal =
    function () {

      const page =
        CONFIG.PAGE?.PORTAL ||
        "./portal.html";

      ROCK.go(page);
    };


  /* =======================================================
     LOGOUT
     ======================================================= */

  ROCK.logout =
    async function () {

      try {
        const db =
          await getSupabase();

        const {
          error,
        } =
          await db.auth
            .signOut();

        if (error) {
          console.error(
            "ROCK logout:",
            error
          );
        }

      } catch (error) {
        console.error(
          "ROCK.logout ERROR:",
          error
        );
      }


      clearAuthState();


      /*
       * ลบข้อมูล LINE legacy
       * ที่อาจยังค้างจากเวอร์ชันเก่า
       */
      try {
        localStorage.removeItem(
          "rock_line_user_id"
        );

        localStorage.removeItem(
          "rock_line_profile"
        );
      } catch {
        // ignore
      }


      window.location.replace(
        CONFIG.PAGE?.LOGIN ||
        "./index.html"
      );
    };


  /* =======================================================
     READY
     ======================================================= */

  ROCK.ready =
    function () {

      return Boolean(
        ROCK.state.authReady &&
        ROCK.state.loggedIn &&
        ROCK.state.userId &&
        ROCK.state.accessToken
      );
    };


  /* =======================================================
     REQUIRE AUTH
     ======================================================= */

  ROCK.requireAuth =
    async function () {

      if (
        ROCK.ready()
      ) {
        return ROCK.state.user;
      }


      const user =
        await ROCK.initAuth({
          redirect: true,
        });


      return user;
    };


  /* =======================================================
     AUTH STATE LISTENER
     ======================================================= */

  async function setupAuthListener() {
    try {
      const db =
        await getSupabase();


      db.auth.onAuthStateChange(
        (
          event,
          session
        ) => {

          /*
           * SIGNED OUT
           */
          if (
            event ===
            "SIGNED_OUT"
          ) {
            clearAuthState();
            return;
          }


          /*
           * TOKEN REFRESH / SIGNED IN
           */
          if (session) {
            ROCK.state.authReady =
              true;

            ROCK.state.loggedIn =
              true;

            ROCK.state.session =
              session;

            ROCK.state.accessToken =
              session.access_token;

            ROCK.state.user =
              session.user;

            ROCK.state.userId =
              session.user?.id ||
              null;
          }
        }
      );

    } catch (error) {
      console.error(
        "ROCK auth listener:",
        error
      );
    }
  }


  /* =======================================================
     REMOVE LEGACY LINE STORAGE
     ======================================================= */

  function cleanupLegacyLineData() {
    try {
      localStorage.removeItem(
        "rock_line_user_id"
      );

      localStorage.removeItem(
        "rock_line_profile"
      );
    } catch {
      // localStorage may be unavailable
    }
  }


  cleanupLegacyLineData();

  setupAuthListener();


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
    "Authentication: Supabase Auth"
  );

  console.log(
    "ROCK.initAuth:",
    typeof ROCK.initAuth
  );

  console.log(
    "ROCK.requireAuth:",
    typeof ROCK.requireAuth
  );

  console.log(
    "ROCK.fetchDashboard:",
    typeof ROCK.fetchDashboard
  );

  console.log(
    "ROCK.api:",
    typeof ROCK.api
  );

  console.log(
    "================================="
  );

})();
