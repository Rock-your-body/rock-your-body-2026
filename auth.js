const URL = "https://nztvqdzatdpauufpvdaa.supabase.co";
const KEY = "sb_publishable_9pB2sJE9xrebbNpjnZdeYA_qwfBcR4V";

const BASE_URL =
  "https://rock-your-body.github.io/rock-your-body-2026/";

const LOGIN_URL = BASE_URL + "index.html";

export const db = window.supabase.createClient(URL, KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

const form = document.querySelector("#loginForm");
const msg = document.querySelector("#message");

const say = (text, bad = false) => {
  if (!msg) return;

  msg.textContent = text;
  msg.className = "message " + (bad ? "bad" : "good");
};

if (form) {
  let signup = false;
  let recoveryMode = false;

  const query = new URLSearchParams(location.search);
  const hash = new URLSearchParams(
    location.hash.replace(/^#/, "")
  );

  /*
   * รองรับ URL recovery เดิมด้วย
   */
  if (
    query.get("type") === "recovery" ||
    hash.get("type") === "recovery"
  ) {
    recoveryMode = true;
  }

  /*
   * แสดง Auth error ที่ Supabase ส่งกลับมา
   */
  const authError =
    query.get("error_description") ||
    hash.get("error_description");

  if (authError) {
    say(
      decodeURIComponent(
        authError.replace(/\+/g, " ")
      ),
      true
    );
  }

  if (query.get("password") === "updated") {
    say(
      "ตั้งรหัสผ่านใหม่สำเร็จ กรุณาเข้าสู่ระบบด้วยรหัสใหม่"
    );
  }

  const emailInput =
    document.querySelector("#email");

  const passwordInput =
    document.querySelector("#password");

  const resetButton =
    document.querySelector("#resetBtn");

  const modeButton =
    document.querySelector("#modeBtn");

  const nameLabel =
    document.querySelector("#nameLabel");

  const authTitle =
    document.querySelector("#authTitle");

  const submitText =
    document.querySelector("#submitText");

  /*
   * ปุ่ม Resend confirmation
   */
  const resendButton =
    document.createElement("button");

  resendButton.type = "button";
  resendButton.className = "link-btn";
  resendButton.textContent =
    "ส่งอีเมลยืนยันอีกครั้ง";

  resetButton.insertAdjacentElement(
    "afterend",
    resendButton
  );

  /*
   * เปลี่ยนหน้า Login
   * เป็นหน้า Set New Password
   */
  function showRecoveryScreen() {
    recoveryMode = true;

    authTitle.textContent =
      "ตั้งรหัสผ่านใหม่";

    nameLabel.classList.add("hidden");

    emailInput
      .closest("label")
      .classList.add("hidden");

    emailInput.required = false;
    emailInput.disabled = true;

    passwordInput.autocomplete =
      "new-password";

    passwordInput.value = "";

    passwordInput.placeholder =
      "รหัสผ่านใหม่อย่างน้อย 8 ตัว";

    submitText.textContent =
      "บันทึกรหัสผ่านใหม่";

    modeButton.classList.add("hidden");
    resetButton.classList.add("hidden");
    resendButton.classList.add("hidden");

    say(
      "กรุณากำหนดรหัสผ่านใหม่สำหรับบัญชีของคุณ"
    );
  }

  if (recoveryMode) {
    showRecoveryScreen();
  }

  /*
   * สำคัญ:
   * ให้ Supabase บอกว่า URL นี้เป็น
   * Password Recovery จริง
   */
  db.auth.onAuthStateChange(
    (event, session) => {

      if (event === "PASSWORD_RECOVERY") {
        showRecoveryScreen();
        return;
      }

      /*
       * มี session อยู่แล้ว
       * และไม่ได้กำลัง Reset Password
       */
      if (
        event === "INITIAL_SESSION" &&
        session &&
        !recoveryMode
      ) {
        location.replace("./portal.html");
      }
    }
  );

  /*
   * Login <-> Signup
   */
  modeButton.onclick = () => {
    signup = !signup;

    nameLabel.classList.toggle(
      "hidden",
      !signup
    );

    authTitle.textContent =
      signup
        ? "สมัครบัญชี"
        : "เข้าสู่ระบบ";

    submitText.textContent =
      signup
        ? "สมัครบัญชี"
        : "เข้าสู่ระบบ";

    modeButton.textContent =
      signup
        ? "กลับไปเข้าสู่ระบบ"
        : "สมัครบัญชีใหม่";
  };

  /*
   * Submit
   */
  form.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      say("กำลังตรวจสอบ...");

      const email =
        emailInput.value.trim();

      const password =
        passwordInput.value;

      let error;

      /*
       * ==========================
       * RESET PASSWORD
       * ==========================
       */
      if (recoveryMode) {

        if (password.length < 8) {
          say(
            "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัว",
            true
          );
          return;
        }

        const result =
          await db.auth.updateUser({
            password,
          });

        error = result.error;

        if (!error) {

          /*
           * Logout session recovery
           * แล้วให้ Login ใหม่
           */
          await db.auth.signOut();

          location.replace(
            LOGIN_URL +
            "?password=updated"
          );

          return;
        }
      }

      /*
       * ==========================
       * SIGN UP
       * ==========================
       */
      else if (signup) {

        if (!email) {
          say(
            "กรุณากรอกอีเมล",
            true
          );
          return;
        }

        if (password.length < 8) {
          say(
            "รหัสผ่านต้องมีอย่างน้อย 8 ตัว",
            true
          );
          return;
        }

        const fullName =
          document
            .querySelector("#fullName")
            .value
            .trim();

        if (!fullName) {
          say(
            "กรุณากรอกชื่อ-นามสกุล",
            true
          );
          return;
        }

        const result =
          await db.auth.signUp({
            email,
            password,

            options: {
              data: {
                full_name: fullName,
              },

              emailRedirectTo:
                LOGIN_URL,
            },
          });

        error = result.error;

        /*
         * เปิด Confirm Email อยู่
         */
        if (
          !error &&
          !result.data.session
        ) {
          say(
            "สมัครสำเร็จ กรุณาเปิดอีเมลและกดยืนยันบัญชีก่อนเข้าสู่ระบบ"
          );

          return;
        }
      }

      /*
       * ==========================
       * LOGIN
       * ==========================
       */
      else {

        const result =
          await db.auth.signInWithPassword({
            email,
            password,
          });

        error = result.error;
      }

      /*
       * ==========================
       * ERROR
       * ==========================
       */
      if (error) {

        let translated =
          error.message;

        if (
          error.message ===
          "Email not confirmed"
        ) {
          translated =
            "อีเมลยังไม่ยืนยัน กรุณากด “ส่งอีเมลยืนยันอีกครั้ง”";
        }

        else if (
          error.message ===
          "Invalid login credentials"
        ) {
          translated =
            "อีเมลหรือรหัสผ่านไม่ถูกต้อง หากจำรหัสไม่ได้ให้กด “ลืมรหัสผ่าน”";
        }

        say(
          translated,
          true
        );

        return;
      }

      /*
       * Login สำเร็จ
       */
      location.replace(
        "./portal.html"
      );
    }
  );

  /*
   * ==========================
   * FORGOT PASSWORD
   * ==========================
   */
  resetButton.onclick =
    async () => {

      const email =
        emailInput.value.trim();

      if (!email) {
        say(
          "กรุณากรอกอีเมลก่อน",
          true
        );

        return;
      }

      resetButton.disabled = true;

      say(
        "กำลังส่งลิงก์ตั้งรหัสผ่านใหม่..."
      );

      const { error } =
        await db.auth.resetPasswordForEmail(
          email,
          {
            redirectTo:
              LOGIN_URL,
          }
        );

      resetButton.disabled = false;

      if (error) {

        const text =
          error.message
            ?.toLowerCase()
            .includes("rate")
            ? "ส่งอีเมลถี่เกินไป กรุณารอสักครู่แล้วลองใหม่"
            : error.message;

        say(
          text,
          true
        );

        return;
      }

      /*
       * จงใจไม่บอกว่ามี Email นี้
       * อยู่จริงหรือไม่
       */
      say(
        "หากอีเมลนี้มีบัญชีอยู่ ระบบจะส่งลิงก์ตั้งรหัสผ่านใหม่ กรุณาตรวจ Inbox และ Spam/Junk"
      );
    };

  /*
   * ==========================
   * RESEND CONFIRM EMAIL
   * ==========================
   */
  resendButton.onclick =
    async () => {

      const email =
        emailInput.value.trim();

      if (!email) {
        say(
          "กรุณากรอกอีเมลก่อน",
          true
        );

        return;
      }

      resendButton.disabled = true;

      say(
        "กำลังส่งอีเมลยืนยัน..."
      );

      const { error } =
        await db.auth.resend({
          type: "signup",
          email,

          options: {
            emailRedirectTo:
              LOGIN_URL,
          },
        });

      resendButton.disabled = false;

      if (error) {
        say(
          error.message,
          true
        );

        return;
      }

      say(
        "หากบัญชีนี้รอการยืนยัน ระบบจะส่งอีเมลยืนยัน กรุณาใช้ลิงก์ล่าสุด"
      );
    };
}
