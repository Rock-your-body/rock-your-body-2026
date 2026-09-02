const URL = "https://nztvqdzatdpauufpvdaa.supabase.co";
const KEY = "sb_publishable_9pB2sJE9xrebbNpjnZdeYA_qwfBcR4V";
const APP_URL = "https://rock-your-body.github.io/rock-your-body-2026/index.html";

export const db = window.supabase.createClient(URL, KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
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
  const query = new URLSearchParams(location.search);
  const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
  const recoveryMode = query.get("type") === "recovery" || hash.get("type") === "recovery";
  const authError = query.get("error_description") || hash.get("error_description");
  if (authError) say(decodeURIComponent(authError.replace(/\+/g, " ")), true);
  if (query.get("password") === "updated") say("ตั้งรหัสผ่านใหม่สำเร็จ กรุณาเข้าสู่ระบบด้วยรหัสใหม่");

  const { data: { session } } = await db.auth.getSession();
  if (session && !recoveryMode) location.replace("./portal.html");

  const resetButton = document.querySelector("#resetBtn");
  const resendButton = document.createElement("button");
  resendButton.type = "button";
  resendButton.className = "link-btn";
  resendButton.textContent = "ส่งอีเมลยืนยันอีกครั้ง";
  resetButton.insertAdjacentElement("afterend", resendButton);

  if (recoveryMode) {
    const emailInput = document.querySelector("#email");
    document.querySelector("#authTitle").textContent = "ตั้งรหัสผ่านใหม่";
    document.querySelector("#nameLabel").classList.add("hidden");
    emailInput.closest("label").classList.add("hidden");
    emailInput.required = false;
    emailInput.disabled = true;
    document.querySelector("#password").autocomplete = "new-password";
    document.querySelector("#password").value = "";
    document.querySelector("#password").placeholder = "รหัสผ่านใหม่อย่างน้อย 8 ตัว";
    document.querySelector("#submitText").textContent = "บันทึกรหัสผ่านใหม่";
    document.querySelector("#modeBtn").classList.add("hidden");
    resetButton.classList.add("hidden");
    resendButton.classList.add("hidden");
    say("กรุณากำหนดรหัสผ่านใหม่สำหรับบัญชีของคุณ");
  }

  document.querySelector("#modeBtn").onclick = () => {
    signup = !signup;
    document.querySelector("#nameLabel").classList.toggle("hidden", !signup);
    document.querySelector("#authTitle").textContent = signup ? "สมัครบัญชี" : "เข้าสู่ระบบ";
    document.querySelector("#submitText").textContent = signup ? "สมัครบัญชี" : "เข้าสู่ระบบ";
    document.querySelector("#modeBtn").textContent = signup ? "กลับไปเข้าสู่ระบบ" : "สมัครบัญชีใหม่";
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    say("กำลังตรวจสอบ...");
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value;
    let error;
    if (recoveryMode) {
      if (password.length < 8) return say("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัว", true);
      ({ error } = await db.auth.updateUser({ password }));
      if (!error) {
        await db.auth.signOut();
        location.replace(APP_URL + "?password=updated");
        return;
      }
    } else if (signup) {
      const result = await db.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: document.querySelector("#fullName").value.trim() },
          emailRedirectTo: APP_URL,
        },
      });
      error = result.error;
      if (!error && !result.data.session) {
        say("สมัครสำเร็จ กรุณาเปิดอีเมลล่าสุดและกดยืนยันเพียงครั้งเดียว");
        return;
      }
    } else {
      ({ error } = await db.auth.signInWithPassword({ email, password }));
    }
    if (error) {
      const translated = error.message === "Email not confirmed"
        ? "อีเมลยังไม่ยืนยัน กรุณากด “ส่งอีเมลยืนยันอีกครั้ง”"
        : error.message === "Invalid login credentials"
          ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง หากจำรหัสไม่ได้ให้กด “ลืมรหัสผ่าน”"
          : error.message;
      say(translated, true);
      return;
    }
    location.replace("./portal.html");
  });

  resetButton.onclick = async () => {
    const email = document.querySelector("#email").value.trim();
    if (!email) return say("กรุณากรอกอีเมลก่อน", true);
    resetButton.disabled = true;
    say("กำลังส่งลิงก์ตั้งรหัสผ่านใหม่...");
    const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo: APP_URL });
    resetButton.disabled = false;
    const text = error?.message?.toLowerCase().includes("rate")
      ? "ส่งอีเมลถี่เกินไป กรุณารอประมาณ 1 นาทีแล้วลองใหม่"
      : error?.message || "ส่งลิงก์ตั้งรหัสผ่านใหม่แล้ว กรุณาตรวจ Inbox และ Spam/Junk";
    say(text, Boolean(error));
  };

  resendButton.onclick = async () => {
    const email = document.querySelector("#email").value.trim();
    if (!email) return say("กรุณากรอกอีเมลก่อน", true);
    say("กำลังส่งอีเมลยืนยัน...");
    const { error } = await db.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: APP_URL },
    });
    say(error ? error.message : "ส่งอีเมลยืนยันฉบับใหม่แล้ว กรุณาใช้ลิงก์ล่าสุดเพียงครั้งเดียว", Boolean(error));
  };
}
