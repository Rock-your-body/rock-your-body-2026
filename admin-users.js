import { db } from "./auth.js";

const roleLabels = { employee: "พนักงาน", hr: "HR", admin: "Admin" };
const statusLabels = { pending: "รออนุมัติ", active: "ใช้งาน", suspended: "ระงับใช้งาน" };

function showNotice(message, isError = false) {
  const notice = document.querySelector("#notice");
  notice.className = `message ${isError ? "bad" : "good"}`;
  notice.textContent = message;
  notice.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function ensureDialog() {
  let dialog = document.querySelector("#manageUserDialog");
  if (dialog) return dialog;
  dialog = document.createElement("dialog");
  dialog.id = "manageUserDialog";
  dialog.innerHTML = `
    <form id="manageUserForm">
      <h2>จัดการสิทธิ์ผู้ใช้งาน</h2>
      <p class="muted">การเปลี่ยนสิทธิ์หรือสถานะต้องยืนยัน 2FA ก่อนทุกครั้ง</p>
      <input id="managedUserId" type="hidden">
      <label>ชื่อ-นามสกุล<input id="managedName" maxlength="150" required></label>
      <label>รหัสพนักงาน<input id="managedCode" maxlength="50"></label>
      <label>แผนก<input id="managedDepartment" maxlength="100"></label>
      <label>ประเภทผู้ใช้<select id="managedRole"><option value="employee">พนักงาน</option><option value="hr">HR</option><option value="admin">Admin</option></select></label>
      <label>สถานะบัญชี<select id="managedStatus"><option value="pending">รออนุมัติ</option><option value="active">อนุมัติให้ใช้งาน</option><option value="suspended">ระงับใช้งาน</option></select></label>
      <div class="actions"><button id="saveManagedUser" type="submit">บันทึกการเปลี่ยนแปลง</button><button id="cancelManagedUser" type="button" class="secondary">ยกเลิก</button></div>
    </form>`;
  document.body.appendChild(dialog);
  dialog.querySelector("#cancelManagedUser").onclick = () => dialog.close();
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  dialog.querySelector("#manageUserForm").onsubmit = saveUser;
  return dialog;
}

async function openUser(userId) {
  const { data: assurance } = await db.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assurance?.currentLevel !== "aal2") {
    showNotice("กรุณาไปที่เมนู ความปลอดภัย / 2FA และยืนยันรหัสก่อนจัดการผู้ใช้", true);
    return;
  }
  const { data: userProfile, error } = await db.from("user_profiles").select("id,full_name,employee_code,department,role,status").eq("id", userId).single();
  if (error) {
    showNotice(error.message, true);
    return;
  }
  const dialog = ensureDialog();
  dialog.querySelector("#managedUserId").value = userProfile.id;
  dialog.querySelector("#managedName").value = userProfile.full_name || "";
  dialog.querySelector("#managedCode").value = userProfile.employee_code || "";
  dialog.querySelector("#managedDepartment").value = userProfile.department || "";
  dialog.querySelector("#managedRole").value = userProfile.role;
  dialog.querySelector("#managedStatus").value = userProfile.status;
  dialog.showModal();
}

async function saveUser(event) {
  event.preventDefault();
  const dialog = event.currentTarget.closest("dialog");
  const saveButton = dialog.querySelector("#saveManagedUser");
  saveButton.disabled = true;
  saveButton.textContent = "กำลังบันทึก...";
  const role = dialog.querySelector("#managedRole").value;
  const status = dialog.querySelector("#managedStatus").value;
  const { error } = await db.rpc("manage_user", {
    p_user_id: dialog.querySelector("#managedUserId").value,
    p_role: role,
    p_status: status,
    p_full_name: dialog.querySelector("#managedName").value.trim(),
    p_department: dialog.querySelector("#managedDepartment").value.trim() || null,
    p_employee_code: dialog.querySelector("#managedCode").value.trim() || null,
  });
  saveButton.disabled = false;
  saveButton.textContent = "บันทึกการเปลี่ยนแปลง";
  if (error) {
    showNotice(error.message, true);
    return;
  }
  dialog.close();
  showNotice(`บันทึกเป็น ${roleLabels[role]} · ${statusLabels[status]} เรียบร้อย`);
  window.setTimeout(() => window.location.reload(), 650);
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-user]");
  if (!button) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  openUser(button.dataset.user);
}, true);
