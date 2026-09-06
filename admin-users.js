import { db } from "./auth.js";

const roleLabels = {
  employee: "พนักงาน",
  hr: "HR",
  admin: "Admin",
};

const statusLabels = {
  pending: "รออนุมัติ",
  active: "ใช้งาน",
  suspended: "ระงับใช้งาน",
};

const allowedRoles = [
  "employee",
  "hr",
  "admin",
];

const allowedStatuses = [
  "pending",
  "active",
  "suspended",
];

/* =========================================================
   NOTICE
   ========================================================= */

function showNotice(
  message,
  isError = false
) {
  const notice =
    document.querySelector(
      "#notice"
    );

  if (!notice) {
    if (isError) {
      console.error(message);
    } else {
      console.log(message);
    }

    return;
  }

  notice.className =
    `message ${
      isError
        ? "bad"
        : "good"
    }`;

  notice.textContent =
    message;

  notice.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
  });
}

/* =========================================================
   CREATE / GET DIALOG
   ========================================================= */

function ensureDialog() {
  let dialog =
    document.querySelector(
      "#manageUserDialog"
    );

  if (dialog) {
    return dialog;
  }

  dialog =
    document.createElement(
      "dialog"
    );

  dialog.id =
    "manageUserDialog";

  dialog.innerHTML = `
    <form id="manageUserForm">

      <h2>
        จัดการสิทธิ์ผู้ใช้งาน
      </h2>

      <p class="muted">
        การเปลี่ยนสิทธิ์หรือสถานะ
        ต้องยืนยัน 2FA ก่อนทุกครั้ง
      </p>

      <input
        id="managedUserId"
        type="hidden"
      >


      <label>

        ชื่อ-นามสกุล

        <input
          id="managedName"
          maxlength="150"
          required
        >

      </label>


      <label>

        รหัสพนักงาน

        <input
          id="managedCode"
          maxlength="50"
        >

      </label>


      <label>

        แผนก

        <input
          id="managedDepartment"
          maxlength="100"
        >

      </label>


      <label>

        ประเภทผู้ใช้

        <select id="managedRole">

          <option value="employee">
            พนักงาน
          </option>

          <option value="hr">
            HR
          </option>

          <option value="admin">
            Admin
          </option>

        </select>

      </label>


      <label>

        สถานะบัญชี

        <select id="managedStatus">

          <option value="pending">
            รออนุมัติ
          </option>

          <option value="active">
            อนุมัติให้ใช้งาน
          </option>

          <option value="suspended">
            ระงับใช้งาน
          </option>

        </select>

      </label>


      <div class="actions">

        <button
          id="saveManagedUser"
          type="submit"
        >
          บันทึกการเปลี่ยนแปลง
        </button>

        <button
          id="cancelManagedUser"
          type="button"
          class="secondary"
        >
          ยกเลิก
        </button>

      </div>

    </form>
  `;

  document.body.appendChild(
    dialog
  );

  dialog
    .querySelector(
      "#cancelManagedUser"
    )
    .onclick =
      () => {
        dialog.close();
      };

  dialog.addEventListener(
    "click",
    (event) => {
      if (
        event.target === dialog
      ) {
        dialog.close();
      }
    }
  );

  dialog
    .querySelector(
      "#manageUserForm"
    )
    .onsubmit =
      saveUser;

  return dialog;
}

/* =========================================================
   OPEN USER MANAGEMENT
   ========================================================= */

async function openUser(
  userId
) {
  if (!userId) {
    showNotice(
      "ไม่พบ User ID",
      true
    );

    return;
  }

  /* =======================================================
     REQUIRE AAL2 / MFA
     ======================================================= */

  const {
    data: assurance,
    error: assuranceError,
  } =
    await db.auth.mfa
      .getAuthenticatorAssuranceLevel();

  if (assuranceError) {
    console.error(
      assuranceError
    );

    showNotice(
      "ไม่สามารถตรวจสอบสถานะ 2FA ได้: " +
        assuranceError.message,
      true
    );

    return;
  }

  if (
    assurance?.currentLevel !==
    "aal2"
  ) {
    showNotice(
      "กรุณาไปที่เมนู ความปลอดภัย / 2FA และยืนยันรหัสก่อนจัดการผู้ใช้",
      true
    );

    return;
  }

  /* =======================================================
     LOAD TARGET USER
     ======================================================= */

  const {
    data: userProfile,
    error,
  } =
    await db
      .from("user_profiles")
      .select(
        `
          id,
          full_name,
          employee_code,
          department,
          role,
          status
        `
      )
      .eq(
        "id",
        userId
      )
      .single();

  if (error) {
    console.error(
      error
    );

    showNotice(
      error.message,
      true
    );

    return;
  }

  if (!userProfile) {
    showNotice(
      "ไม่พบข้อมูลผู้ใช้งาน",
      true
    );

    return;
  }

  const dialog =
    ensureDialog();

  dialog
    .querySelector(
      "#managedUserId"
    )
    .value =
      userProfile.id;

  dialog
    .querySelector(
      "#managedName"
    )
    .value =
      userProfile.full_name ||
      "";

  dialog
    .querySelector(
      "#managedCode"
    )
    .value =
      userProfile.employee_code ||
      "";

  dialog
    .querySelector(
      "#managedDepartment"
    )
    .value =
      userProfile.department ||
      "";

  dialog
    .querySelector(
      "#managedRole"
    )
    .value =
      allowedRoles.includes(
        userProfile.role
      )
        ? userProfile.role
        : "employee";

  dialog
    .querySelector(
      "#managedStatus"
    )
    .value =
      allowedStatuses.includes(
        userProfile.status
      )
        ? userProfile.status
        : "pending";

  dialog.showModal();
}

/* =========================================================
   SAVE USER
   ========================================================= */

async function saveUser(
  event
) {
  event.preventDefault();

  const dialog =
    event.currentTarget
      .closest("dialog");

  if (!dialog) {
    return;
  }

  const saveButton =
    dialog.querySelector(
      "#saveManagedUser"
    );

  const userId =
    dialog
      .querySelector(
        "#managedUserId"
      )
      .value;

  const fullName =
    dialog
      .querySelector(
        "#managedName"
      )
      .value
      .trim();

  const employeeCode =
    dialog
      .querySelector(
        "#managedCode"
      )
      .value
      .trim();

  const department =
    dialog
      .querySelector(
        "#managedDepartment"
      )
      .value
      .trim();

  const role =
    dialog
      .querySelector(
        "#managedRole"
      )
      .value;

  const status =
    dialog
      .querySelector(
        "#managedStatus"
      )
      .value;

  /* =======================================================
     VALIDATION
     ======================================================= */

  if (!userId) {
    showNotice(
      "ไม่พบ User ID",
      true
    );

    return;
  }

  if (!fullName) {
    showNotice(
      "กรุณากรอกชื่อ-นามสกุล",
      true
    );

    return;
  }

  if (
    !allowedRoles.includes(
      role
    )
  ) {
    showNotice(
      "ประเภทผู้ใช้ไม่ถูกต้อง",
      true
    );

    return;
  }

  if (
    !allowedStatuses.includes(
      status
    )
  ) {
    showNotice(
      "สถานะบัญชีไม่ถูกต้อง",
      true
    );

    return;
  }

  /* =======================================================
     CHECK MFA AGAIN BEFORE WRITE
     ======================================================= */

  const {
    data: assurance,
    error: assuranceError,
  } =
    await db.auth.mfa
      .getAuthenticatorAssuranceLevel();

  if (assuranceError) {
    showNotice(
      assuranceError.message,
      true
    );

    return;
  }

  if (
    assurance?.currentLevel !==
    "aal2"
  ) {
    dialog.close();

    showNotice(
      "เซสชัน 2FA ไม่อยู่ในระดับ AAL2 กรุณายืนยัน 2FA ใหม่",
      true
    );

    return;
  }

  /* =======================================================
     SAVE
     ======================================================= */

  saveButton.disabled =
    true;

  saveButton.textContent =
    "กำลังบันทึก...";

  const {
    error,
  } =
    await db.rpc(
      "manage_user",
      {
        p_user_id:
          userId,

        p_role:
          role,

        p_status:
          status,

        p_full_name:
          fullName,

        p_department:
          department ||
          null,

        p_employee_code:
          employeeCode ||
          null,
      }
    );

  saveButton.disabled =
    false;

  saveButton.textContent =
    "บันทึกการเปลี่ยนแปลง";

  if (error) {
    console.error(
      error
    );

    showNotice(
      error.message,
      true
    );

    return;
  }

  dialog.close();

  showNotice(
    `บันทึกเป็น ${
      roleLabels[role]
    } · ${
      statusLabels[status]
    } เรียบร้อย`
  );

  /*
   * แจ้ง portal.js ว่าข้อมูล user เปลี่ยนแล้ว
   * หาก portal.js รองรับ event นี้
   * จะ refresh เฉพาะข้อมูล ไม่ reload ทั้งหน้า
   */
  window.dispatchEvent(
    new CustomEvent(
      "ryb:user-updated",
      {
        detail: {
          userId,
          role,
          status,
        },
      }
    )
  );
}

/* =========================================================
   GLOBAL CLICK HANDLER
   ========================================================= */

document.addEventListener(
  "click",
  (event) => {
    const button =
      event.target.closest(
        "[data-user]"
      );

    if (!button) {
      return;
    }

    event.preventDefault();

    /*
     * กัน handler เดิมใน portal.js
     * ที่จับ [data-user] เช่นกัน
     */
    event.stopImmediatePropagation();

    openUser(
      button.dataset.user
    );
  },
  true
);
