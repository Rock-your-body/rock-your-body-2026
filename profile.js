import { db } from "./auth.js";
import "./admin-users.js";
import "./admin-events.js";
import "./expert-channels.js";
import "./wellness-hub.js";

const $ = (selector) => document.querySelector(selector);
const { data: { session } } = await db.auth.getSession();

if (session) {
  const { data: profile, error } = await db.from("user_profiles").select("*").eq("id", session.user.id).single();
  if (!error && profile) {
    $("#profileName").value = profile.full_name || "";
    $("#profileCode").value = profile.employee_code || "";
    $("#profileDepartment").value = profile.department || "";
    $("#profilePhone").value = profile.phone || "";
    $("#profileEmail").value = session.user.email || "";
    $("#profileRole").value = profile.role;
    $("#profileStatus").value = profile.status;
    if (profile.status !== "active") {
      document.querySelectorAll(".add").forEach((button) => { button.disabled = true; });
      const notice = $("#notice");
      notice.className = "account-pending";
      notice.innerHTML = "<strong>บัญชียังไม่พร้อมใช้งาน</strong><br>กรุณากรอกโปรไฟล์ให้ครบ แล้วรอ HR หรือ Admin อนุมัติ";
    }
  }

  $("#profileForm").onsubmit = async (event) => {
    event.preventDefault();
    const { data, error: saveError } = await db.rpc("update_my_profile", {
      p_full_name: $("#profileName").value.trim(),
      p_employee_code: $("#profileCode").value.trim() || null,
      p_department: $("#profileDepartment").value.trim() || null,
      p_phone: $("#profilePhone").value.trim() || null,
    });
    const notice = $("#notice");
    if (saveError) {
      notice.className = "message bad";
      notice.textContent = saveError.message;
      return;
    }
    notice.className = "message good";
    notice.textContent = "บันทึกโปรไฟล์เรียบร้อย";
    $("#who").textContent = data.full_name || session.user.email;
  };
}
