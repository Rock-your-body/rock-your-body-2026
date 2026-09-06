import { db } from "./auth.js";
import {
  requireUser,
  logout,
} from "./auth-guard.js";

/* =========================================================
   ROCK YOUR BODY 2026
   portal.js
   Authentication: Supabase Email / Password
   ========================================================= */

const $ = (selector) =>
  document.querySelector(selector);

const all = (selector) =>
  [...document.querySelectorAll(selector)];

/* =========================================================
   MESSAGE
   ========================================================= */

function say(text, bad = false) {
  const notice = $("#notice");

  if (!notice) return;

  notice.textContent = text;

  notice.className =
    "message " + (bad ? "bad" : "good");
}

/* =========================================================
   STATE
   ========================================================= */

let user = null;
let profile = null;

let entries = [];
let profiles = [];

let factor = null;

/* =========================================================
   AUTH GUARD
   ========================================================= */

user = await requireUser();

/*
 * requireUser()
 * จะ redirect กลับ index.html
 * ถ้าไม่มี Supabase User
 */
if (user) {
  await startPortal();
}

/* =========================================================
   START APPLICATION
   ========================================================= */

async function startPortal() {
  bindNavigation();
  bindHealthEntry();
  bindLogout();
  bindMFA();

  await boot();
}

/* =========================================================
   BOOT
   ========================================================= */

async function boot() {
  /*
   * user.id ตรงนี้คือ Supabase Auth UUID
   * ไม่ใช้ LINE User ID แล้ว
   */

  const {
    data,
    error,
  } = await db
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error(
      "Cannot load user profile:",
      error
    );

    say(
      "ไม่สามารถโหลดข้อมูลผู้ใช้ได้: " +
        error.message,
      true
    );

    return;
  }

  if (!data) {
    say(
      "ไม่พบข้อมูลผู้ใช้งาน กรุณาติดต่อผู้ดูแลระบบ",
      true
    );

    return;
  }

  profile = data;

  /* ---------- User display ---------- */

  if ($("#who")) {
    $("#who").textContent =
      profile.full_name ||
      user.email ||
      "ผู้ใช้งาน";
  }

  if ($("#roleBadge")) {
    $("#roleBadge").textContent =
      (profile.role || "employee").toUpperCase();
  }

  if ($("#hello")) {
    $("#hello").textContent =
      `สวัสดี ${profile.full_name || ""}`;
  }

  if ($("#scope")) {
    $("#scope").textContent =
      profile.role === "employee"
        ? "รายงานสุขภาพส่วนบุคคล"
        : "รายงานภาพรวมองค์กร";
  }

  /* ---------- Permission UI ---------- */

  all(".staff-only").forEach((element) => {
    element.classList.toggle(
      "hidden",
      profile.role === "employee"
    );
  });

  all(".admin-only").forEach((element) => {
    element.classList.toggle(
      "hidden",
      profile.role !== "admin"
    );
  });

  /* ---------- Account Status ---------- */

  if (profile.status !== "active") {
    say(
      `บัญชีอยู่ในสถานะ ${
        profile.status || "unknown"
      } — กรุณาติดต่อ HR/Admin`,
      true
    );
  }

  await load();
}

/* =========================================================
   LOAD DATA
   ========================================================= */

async function load() {
  if (!profile) return;

  /*
   * Security จริงต้องควบคุมด้วย Supabase RLS
   *
   * Employee:
   * RLS ควรอนุญาตเฉพาะ health_entries
   * ที่ user_id = auth.uid()
   *
   * HR/Admin:
   * สามารถอ่านข้อมูลตาม policy ที่กำหนด
   */

  const {
    data,
    error,
  } = await db
    .from("health_entries")
    .select(
      "*, user_profiles(full_name)"
    )
    .order("entry_date", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Load health entries error:",
      error
    );

    say(
      "โหลดข้อมูลสุขภาพไม่สำเร็จ: " +
        error.message,
      true
    );

    return;
  }

  entries = data || [];

  /* =======================================================
     LOAD USERS FOR HR / ADMIN
     ======================================================= */

  if (profile.role !== "employee") {
    const result = await db
      .from("user_profiles")
      .select("*")
      .order("full_name");

    profiles = result.data || [];

    if (result.error) {
      console.error(
        "Load profiles error:",
        result.error
      );

      say(
        "ไม่สามารถอ่านรายชื่อผู้ใช้งานได้ อาจต้องยืนยัน 2FA ก่อน",
        true
      );
    }
  } else {
    profiles = [];
  }

  render();
}

/* =========================================================
   RENDER DASHBOARD
   ========================================================= */

function render() {
  if (!profile) return;

  const month =
    new Date()
      .toISOString()
      .slice(0, 7);

  const approved =
    entries.filter(
      (entry) =>
        entry.status === "approved"
    ).length;

  const entriesWithSteps =
    entries.filter(
      (entry) =>
        entry.steps != null
    );

  /* ---------- KPI: USERS ---------- */

  if ($("#mUsers")) {
    $("#mUsers").textContent =
      profile.role === "employee"
        ? "1"
        : profiles.length.toLocaleString();
  }

  /* ---------- KPI: MONTHLY ENTRIES ---------- */

  if ($("#mEntries")) {
    $("#mEntries").textContent =
      entries
        .filter(
          (entry) =>
            entry.entry_date &&
            entry.entry_date.startsWith(
              month
            )
        )
        .length
        .toLocaleString();
  }

  /* ---------- KPI: AVERAGE STEPS ---------- */

  if ($("#mSteps")) {
    if (entriesWithSteps.length) {
      const totalSteps =
        entriesWithSteps.reduce(
          (total, entry) =>
            total +
            Number(entry.steps || 0),
          0
        );

      const averageSteps =
        Math.round(
          totalSteps /
            entriesWithSteps.length
        );

      $("#mSteps").textContent =
        averageSteps.toLocaleString();
    } else {
      $("#mSteps").textContent = "0";
    }
  }

  /* ---------- KPI: APPROVED ---------- */

  if ($("#mApproved")) {
    $("#mApproved").textContent =
      approved.toLocaleString();
  }

  /* =======================================================
     STATUS SUMMARY
     ======================================================= */

  if ($("#statusSummary")) {
    const statuses = [
      "submitted",
      "approved",
      "rejected",
      "cancelled",
    ];

    $("#statusSummary").innerHTML =
      statuses
        .map((status) => {
          const count =
            entries.filter(
              (entry) =>
                entry.status === status
            ).length;

          return `
            <p>
              <b>${status}</b>
              ${count}
            </p>
          `;
        })
        .join("");
  }

  renderChart();
  renderHealthRows();
  renderPeople();
  bindRows();
}

/* =========================================================
   7 DAYS CHART
   ========================================================= */

function renderChart() {
  const chart = $("#chart");

  if (!chart) return;

  const days = [
    ...Array(7),
  ].map((_, index) => {
    const date = new Date();

    date.setDate(
      date.getDate() -
        6 +
        index
    );

    return date
      .toISOString()
      .slice(0, 10);
  });

  const values = days.map(
    (date) =>
      entries
        .filter(
          (entry) =>
            entry.entry_date === date
        )
        .reduce(
          (total, entry) =>
            total +
            Number(entry.steps || 0),
          0
        )
  );

  const max =
    Math.max(
      1,
      ...values
    );

  chart.innerHTML = days
    .map((date, index) => {
      const value =
        values[index];

      const height =
        Math.max(
          3,
          (value / max) * 100
        );

      return `
        <div
          class="bar"
          title="${value.toLocaleString()} ก้าว"
          style="height:${height}%"
        >
          <span>
            ${date.slice(8)}
          </span>
        </div>
      `;
    })
    .join("");
}

/* =========================================================
   HEALTH TABLE
   ========================================================= */

function renderHealthRows() {
  const table =
    $("#healthRows");

  if (!table) return;

  if (!entries.length) {
    table.innerHTML = `
      <tr>
        <td colspan="8">
          ยังไม่มีข้อมูลสุขภาพ
        </td>
      </tr>
    `;

    return;
  }

  table.innerHTML =
    entries
      .map((entry) => {
        let actions = "";

        /*
         * HR / Admin
         * สามารถ Review submitted record
         */
        if (
          profile.role !== "employee" &&
          entry.status === "submitted"
        ) {
          actions += `
            <button
              data-review="${entry.id}"
              data-status="approved"
            >
              อนุมัติ
            </button>

            <button
              class="danger"
              data-review="${entry.id}"
              data-status="rejected"
            >
              ปฏิเสธ
            </button>
          `;
        }

        /*
         * Employee สามารถลบ Draft
         */
        if (
          profile.role === "employee" &&
          entry.status === "draft"
        ) {
          actions += `
            <button
              class="danger"
              data-del="${entry.id}"
            >
              ลบ
            </button>
          `;
        }

        return `
          <tr>
            <td>
              ${entry.entry_date || "-"}
            </td>

            <td>
              ${
                entry.user_profiles
                  ?.full_name ||
                profile.full_name ||
                "-"
              }
            </td>

            <td>
              ${
                entry.weight_kg ??
                "-"
              }
            </td>

            <td>
              ${
                entry.steps != null
                  ? Number(
                      entry.steps
                    ).toLocaleString()
                  : "-"
              }
            </td>

            <td>
              ${
                entry.exercise_minutes ??
                "-"
              } นาที
            </td>

            <td>
              ${
                entry.sleep_minutes ??
                "-"
              } นาที
            </td>

            <td>
              ${
                entry.status ||
                "-"
              }
            </td>

            <td class="actions">
              ${actions}
            </td>
          </tr>
        `;
      })
      .join("");
}

/* =========================================================
   PEOPLE
   ========================================================= */

function renderPeople() {
  if (
    !profile ||
    profile.role === "employee"
  ) {
    return;
  }

  const table =
    $("#peopleRows");

  if (!table) return;

  if (!profiles.length) {
    table.innerHTML = `
      <tr>
        <td colspan="6">
          ไม่พบข้อมูลผู้ใช้งาน
        </td>
      </tr>
    `;

    return;
  }

  table.innerHTML =
    profiles
      .map((person) => {
        let action =
          "ดูเท่านั้น";

        if (
          profile.role === "admin"
        ) {
          action = `
            <button
              data-user="${person.id}"
            >
              แก้ไข
            </button>
          `;
        }

        return `
          <tr>
            <td>
              ${
                person.full_name ||
                "-"
              }
            </td>

            <td>
              ${
                person.employee_code ||
                "-"
              }
            </td>

            <td>
              ${
                person.department ||
                "-"
              }
            </td>

            <td>
              ${
                person.role ||
                "-"
              }
            </td>

            <td>
              ${
                person.status ||
                "-"
              }
            </td>

            <td>
              ${action}
            </td>
          </tr>
        `;
      })
      .join("");
}

/* =========================================================
   TABLE ACTIONS
   ========================================================= */

function bindRows() {
  /* ---------- REVIEW ENTRY ---------- */

  all("[data-review]").forEach(
    (button) => {
      button.onclick =
        async () => {
          const note =
            prompt(
              "หมายเหตุ (ถ้ามี)"
            ) || "";

          button.disabled = true;

          const {
            error,
          } = await db.rpc(
            "review_health_entry",
            {
              p_entry_id:
                button.dataset.review,

              p_status:
                button.dataset.status,

              p_review_note:
                note,
            }
          );

          button.disabled = false;

          if (error) {
            console.error(
              error
            );

            say(
              error.message,
              true
            );

            return;
          }

          say(
            "อัปเดตสถานะเรียบร้อย"
          );

          await load();
        };
    }
  );

  /* ---------- DELETE DRAFT ---------- */

  all("[data-del]").forEach(
    (button) => {
      button.onclick =
        async () => {
          const confirmed =
            confirm(
              "ลบรายการฉบับร่างนี้?"
            );

          if (!confirmed) {
            return;
          }

          button.disabled = true;

          const {
            error,
          } = await db
            .from(
              "health_entries"
            )
            .delete()
            .eq(
              "id",
              button.dataset.del
            );

          button.disabled = false;

          if (error) {
            console.error(
              error
            );

            say(
              error.message,
              true
            );

            return;
          }

          say(
            "ลบรายการเรียบร้อย"
          );

          await load();
        };
    }
  );

  /* ---------- ADMIN MANAGE USER ---------- */

  all("[data-user]").forEach(
    (button) => {
      button.onclick =
        async () => {
          if (
            profile.role !==
            "admin"
          ) {
            return;
          }

          const person =
            profiles.find(
              (item) =>
                item.id ===
                button.dataset.user
            );

          if (!person) {
            return;
          }

          const role =
            prompt(
              "ประเภท: employee, hr, admin",
              person.role
            );

          if (!role) {
            return;
          }

          const allowedRoles = [
            "employee",
            "hr",
            "admin",
          ];

          if (
            !allowedRoles.includes(
              role
            )
          ) {
            say(
              "Role ไม่ถูกต้อง",
              true
            );

            return;
          }

          const status =
            prompt(
              "สถานะ: pending, active, suspended",
              person.status
            );

          if (!status) {
            return;
          }

          const allowedStatuses = [
            "pending",
            "active",
            "suspended",
          ];

          if (
            !allowedStatuses.includes(
              status
            )
          ) {
            say(
              "Status ไม่ถูกต้อง",
              true
            );

            return;
          }

          button.disabled = true;

          const {
            error,
          } = await db.rpc(
            "manage_user",
            {
              p_user_id:
                person.id,

              p_role:
                role,

              p_status:
                status,

              p_full_name:
                person.full_name,

              p_department:
                person.department,

              p_employee_code:
                person.employee_code,
            }
          );

          button.disabled = false;

          if (error) {
            console.error(
              error
            );

            say(
              error.message,
              true
            );

            return;
          }

          say(
            "แก้ไขผู้ใช้งานเรียบร้อย"
          );

          await load();
        };
    }
  );
}

/* =========================================================
   NAVIGATION
   ========================================================= */

function bindNavigation() {
  all("aside button").forEach(
    (button) => {
      button.onclick =
        async () => {
          /*
           * Logout button ไม่มี data-view
           */
          if (
            !button.dataset.view
          ) {
            return;
          }

          all(".view").forEach(
            (view) =>
              view.classList.add(
                "hidden"
              )
          );

          const target =
            document.getElementById(
              button.dataset.view
            );

          if (target) {
            target.classList.remove(
              "hidden"
            );
          }

          all(
            "aside button[data-view]"
          ).forEach(
            (item) =>
              item.classList.remove(
                "active"
              )
          );

          button.classList.add(
            "active"
          );

          /*
           * Audit Log
           */
          if (
            button.dataset.view ===
            "audit"
          ) {
            await loadAudit();
          }
        };
    }
  );
}

/* =========================================================
   AUDIT LOG
   ========================================================= */

async function loadAudit() {
  const target =
    $("#auditRows");

  if (!target) return;

  target.innerHTML =
    "<p>กำลังโหลด...</p>";

  const {
    data,
    error,
  } = await db
    .from("auth_audit_logs")
    .select("*")
    .order(
      "created_at",
      {
        ascending: false,
      }
    )
    .limit(100);

  if (error) {
    console.error(
      error
    );

    target.textContent =
      error.message;

    return;
  }

  if (!data?.length) {
    target.innerHTML =
      "<p>ยังไม่มี Audit Log</p>";

    return;
  }

  target.innerHTML =
    data
      .map(
        (item) => `
          <p>
            <b>
              ${item.action || "-"}
            </b>

            ·

            ${
              item.created_at
                ? new Date(
                    item.created_at
                  ).toLocaleString(
                    "th-TH"
                  )
                : "-"
            }

            ·

            ${
              item.entity_type ||
              "-"
            }
          </p>
        `
      )
      .join("");
}

/* =========================================================
   HEALTH ENTRY FORM
   ========================================================= */

function bindHealthEntry() {
  all(".add").forEach(
    (button) => {
      button.onclick =
        () => {
          if (
            $("#entryDate")
          ) {
            $("#entryDate").value =
              new Date()
                .toISOString()
                .slice(0, 10);
          }

          if (
            $("#entryDialog")
          ) {
            $("#entryDialog")
              .showModal();
          }
        };
    }
  );

  const entryForm =
    $("#entryForm");

  if (!entryForm) {
    return;
  }

  entryForm.onsubmit =
    async (event) => {
      event.preventDefault();

      if (!user) {
        say(
          "ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่",
          true
        );

        return;
      }

      const numberOrNull =
        (id) => {
          const element =
            $("#" + id);

          if (
            !element ||
            element.value === ""
          ) {
            return null;
          }

          return Number(
            element.value
          );
        };

      const payload = {
        /*
         * Supabase Auth UUID
         */
        user_id:
          user.id,

        entry_date:
          $("#entryDate").value,

        weight_kg:
          numberOrNull(
            "weight"
          ),

        steps:
          numberOrNull(
            "steps"
          ),

        exercise_minutes:
          numberOrNull(
            "exercise"
          ),

        sleep_minutes:
          numberOrNull(
            "sleep"
          ),

        water_ml:
          numberOrNull(
            "water"
          ),

        note:
          $("#note")?.value
            ?.trim() || "",

        status:
          "submitted",
      };

      const submitButton =
        entryForm.querySelector(
          '[type="submit"]'
        );

      if (submitButton) {
        submitButton.disabled =
          true;
      }

      const {
        error,
      } = await db
        .from("health_entries")
        .upsert(
          payload,
          {
            onConflict:
              "user_id,entry_date",
          }
        );

      if (submitButton) {
        submitButton.disabled =
          false;
      }

      if (error) {
        console.error(
          "Save health entry:",
          error
        );

        say(
          error.message,
          true
        );

        return;
      }

      if (
        $("#entryDialog")
      ) {
        $("#entryDialog")
          .close();
      }

      entryForm.reset();

      say(
        "บันทึกข้อมูลเรียบร้อย"
      );

      await load();
    };
}

/* =========================================================
   LOGOUT
   ========================================================= */

function bindLogout() {
  const button =
    $("#logout");

  if (!button) return;

  button.onclick =
    async () => {
      button.disabled =
        true;

      await logout();
    };
}

/* =========================================================
   MFA / 2FA
   ========================================================= */

function bindMFA() {
  loadAAL();

  /* ---------- ENROLL ---------- */

  const enrollButton =
    $("#enrollBtn");

  if (enrollButton) {
    enrollButton.onclick =
      async () => {
        enrollButton.disabled =
          true;

        const {
          data,
          error,
        } =
          await db.auth.mfa.enroll(
            {
              factorType:
                "totp",

              friendlyName:
                "RYB Authenticator",
            }
          );

        enrollButton.disabled =
          false;

        if (error) {
          console.error(
            error
          );

          say(
            error.message,
            true
          );

          return;
        }

        factor = data;

        /*
         * Supabase ส่ง QR SVG
         */
        if (
          $("#qr") &&
          data?.totp?.qr_code
        ) {
          $("#qr").innerHTML =
            data.totp.qr_code;
        }

        say(
          "กรุณาสแกน QR Code ด้วยแอป Authenticator แล้วกรอกรหัส 6 หลัก"
        );
      };
  }

  /* ---------- VERIFY ENROLL ---------- */

  const verifyEnroll =
    $("#verifyEnroll");

  if (verifyEnroll) {
    verifyEnroll.onclick =
      async () => {
        if (!factor) {
          say(
            "กรุณาสร้าง QR Code ก่อน",
            true
          );

          return;
        }

        const code =
          $("#totp")
            ?.value
            ?.trim();

        if (!code) {
          say(
            "กรุณากรอกรหัสจาก Authenticator",
            true
          );

          return;
        }

        verifyEnroll.disabled =
          true;

        const {
          error,
        } =
          await db.auth.mfa.challengeAndVerify(
            {
              factorId:
                factor.id,

              code,
            }
          );

        verifyEnroll.disabled =
          false;

        if (error) {
          console.error(
            error
          );

          say(
            error.message,
            true
          );

          return;
        }

        factor = null;

        if ($("#totp")) {
          $("#totp").value =
            "";
        }

        say(
          "เปิดใช้ 2FA สำเร็จ"
        );

        await loadAAL();
        await load();
      };
  }

  /* ---------- OPEN MFA CHALLENGE ---------- */

  const challengeButton =
    $("#challengeBtn");

  if (challengeButton) {
    challengeButton.onclick =
      async () => {
        if (
          $("#codeDialog")
        ) {
          $("#codeDialog")
            .showModal();
        }
      };
  }

  /* ---------- VERIFY MFA CHALLENGE ---------- */

  const verifyChallenge =
    $("#verifyChallenge");

  if (verifyChallenge) {
    verifyChallenge.onclick =
      async () => {
        const code =
          $("#challengeCode")
            ?.value
            ?.trim();

        if (!code) {
          say(
            "กรุณากรอกรหัส 2FA",
            true
          );

          return;
        }

        const {
          data,
          error,
        } =
          await db.auth.mfa
            .listFactors();

        if (error) {
          console.error(
            error
          );

          say(
            error.message,
            true
          );

          return;
        }

        const verifiedFactor =
          data?.totp?.find(
            (item) =>
              item.status ===
              "verified"
          );

        if (!verifiedFactor) {
          say(
            "ยังไม่ได้ตั้งค่า 2FA",
            true
          );

          return;
        }

        verifyChallenge.disabled =
          true;

        const result =
          await db.auth.mfa
            .challengeAndVerify(
              {
                factorId:
                  verifiedFactor.id,

                code,
              }
            );

        verifyChallenge.disabled =
          false;

        if (result.error) {
          console.error(
            result.error
          );

          say(
            result.error.message,
            true
          );

          return;
        }

        if (
          $("#codeDialog")
        ) {
          $("#codeDialog")
            .close();
        }

        if (
          $("#challengeCode")
        ) {
          $("#challengeCode")
            .value = "";
        }

        say(
          "ยืนยัน 2FA สำเร็จ"
        );

        await loadAAL();
        await load();
      };
  }
}

/* =========================================================
   AUTHENTICATOR ASSURANCE LEVEL
   ========================================================= */

async function loadAAL() {
  const aalTarget =
    $("#aal");

  if (!aalTarget) {
    return null;
  }

  const {
    data,
    error,
  } =
    await db.auth.mfa
      .getAuthenticatorAssuranceLevel();

  if (error) {
    console.error(
      "AAL error:",
      error
    );

    aalTarget.textContent =
      "ไม่สามารถตรวจสอบระดับ 2FA ได้";

    return null;
  }

  aalTarget.textContent =
    `ระดับปัจจุบัน: ${
      data?.currentLevel ||
      "-"
    } / ระดับที่รองรับ: ${
      data?.nextLevel ||
      "-"
    }`;

  return data;
}
