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
  const authError = query.get("error_description") || hash.get("error_description");
  if (authError) say(decodeURIComponent(authError.replace(/\+/g, " ")), true);

  const { data: { session } } = await db.auth.getSession();
  if (session) location.replace("./portal.html");

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
    if (signup) {
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
      say(error.message === "Email not confirmed" ? "อีเมลยังไม่ยืนยัน กรุณากด “ส่งอีเมลยืนยันอีกครั้ง”" : error.message, true);
      return;
    }
    location.replace("./portal.html");
  });

  const resetButton = document.querySelector("#resetBtn");
  resetButton.onclick = async () => {
    const email = document.querySelector("#email").value.trim();
    if (!email) return say("กรุณากรอกอีเมลก่อน", true);
    const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo: APP_URL });
    say(error ? error.message : "ส่งลิงก์ตั้งรหัสผ่านใหม่แล้ว", Boolean(error));
  };

  const resendButton = document.createElement("button");
  resendButton.type = "button";
  resendButton.className = "link-btn";
  resendButton.textContent = "ส่งอีเมลยืนยันอีกครั้ง";
  resetButton.insertAdjacentElement("afterend", resendButton);
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
