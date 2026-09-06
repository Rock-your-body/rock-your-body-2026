import { db } from "./auth.js";
import { requireUser } from "./auth-guard.js";

/*
 * โมดูลเสริมเดิมของระบบ
 */
import "./admin-users.js";
import "./admin-events.js";
import "./expert-channels.js";
import "./wellness-hub.js";

/* =========================================================
   ROCK YOUR BODY 2026
   PROFILE
   Authentication: Supabase Auth
   User Identity: auth.users.id
   ========================================================= */

const $ = (selector) =>
  document.querySelector(selector);

/* =========================================================
   SECURITY / HTML ESCAPE
   ========================================================= */

function safe(value) {
  const element =
    document.createElement("div");

  element.textContent =
    value ?? "";

  return element.innerHTML;
}

function showList(value) {
  if (!Array.isArray(value)) {
    return "ยังไม่ได้ระบุ";
  }

  return (
    value
      .filter(Boolean)
      .join(", ") ||
    "ยังไม่ได้ระบุ"
  );
}

/* =========================================================
   AUTH
   ========================================================= */

const user =
  await requireUser();

if (user) {
  await loadProfile();
}

/* =========================================================
   LOAD PROFILE
   ========================================================= */

async function loadProfile() {
  const profileApp =
    $("#profileApp");

  if (!profileApp) {
    return;
  }

  profileApp.innerHTML = `
    <div class="card">
      กำลังโหลดข้อมูลโปรไฟล์...
    </div>
  `;

  const results =
    await Promise.all([
      /*
       * Basic account profile
       */
      db
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single(),

      /*
       * Extended health profile
       */
      db
        .from("health_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),

      /*
       * Weight / health history
       */
      db
        .from("health_entries")
        .select("*")
        .eq("user_id", user.id)
        .order(
          "entry_date",
          {
            ascending: true,
          }
        )
        .limit(12),

      /*
       * MFA level
       */
      db.auth.mfa
        .getAuthenticatorAssuranceLevel(),
    ]);

  const profileResult =
    results[0];

  const healthResult =
    results[1];

  const entriesResult =
    results[2];

  const aalResult =
    results[3];

  /* =======================================================
     ERROR
     ======================================================= */

  if (profileResult.error) {
    console.error(
      "Profile error:",
      profileResult.error
    );

    profileApp.innerHTML = `
      <div class="message bad">
        ไม่สามารถโหลดข้อมูลโปรไฟล์ได้:
        ${safe(profileResult.error.message)}
      </div>
    `;

    return;
  }

  if (healthResult.error) {
    console.error(
      "Health profile error:",
      healthResult.error
    );
  }

  if (entriesResult.error) {
    console.error(
      "Health entries error:",
      entriesResult.error
    );
  }

  if (aalResult.error) {
    console.error(
      "MFA error:",
      aalResult.error
    );
  }

  const profile =
    profileResult.data;

  const health =
    healthResult.data || {};

  const entries =
    entriesResult.data || [];

  const aal =
    aalResult.data;

  if (!profile) {
    profileApp.innerHTML = `
      <div class="message bad">
        ไม่พบข้อมูลโปรไฟล์ผู้ใช้งาน
      </div>
    `;

    return;
  }

  render(
    profile,
    health,
    entries,
    aal
  );
}

/* =========================================================
   RENDER
   ========================================================= */

function render(
  profile,
  health,
  entries,
  aal
) {
  const profileApp =
    $("#profileApp");

  if (!profileApp) {
    return;
  }

  const latestEntry =
    entries.length
      ? entries[
          entries.length - 1
        ]
      : null;

  /* =======================================================
     BASIC HEALTH VALUES
     ======================================================= */

  const weight =
    latestEntry?.weight_kg != null
      ? Number(
          latestEntry.weight_kg
        )
      : null;

  const height =
    health.height_cm != null
      ? Number(
          health.height_cm
        )
      : null;

  let bmi = "—";

  if (
    weight &&
    height &&
    height > 0
  ) {
    bmi =
      (
        weight /
        Math.pow(
          height / 100,
          2
        )
      ).toFixed(1);
  }

  const age =
    calculateAge(
      health.birth_date
    );

  const score =
    Number(
      health.health_score ??
        50
    );

  const level =
    Number(
      health.level ??
        1
    );

  const exp =
    Number(
      health.exp ??
        0
    );

  const expTarget =
    Math.max(
      1000,
      level * 1000
    );

  /* =======================================================
     AVATAR
     ======================================================= */

  let avatar;

  if (profile.avatar_url) {
    avatar = `
      <img
        src="${safe(profile.avatar_url)}"
        alt="รูปโปรไฟล์"
      >
    `;
  } else {
    const firstCharacter =
      (
        profile.full_name ||
        user.email ||
        "U"
      )
        .charAt(0)
        .toUpperCase();

    avatar = `
      <span>
        ${safe(firstCharacter)}
      </span>
    `;
  }

  /* =======================================================
     MEMBER ID
     ======================================================= */

  const memberId =
    profile.employee_code ||
    (
      "RYB-" +
      user.id
        .slice(0, 8)
        .toUpperCase()
    );

  /* =======================================================
     WEIGHT CHART
     ======================================================= */

  const weights =
    entries
      .map(
        (entry) =>
          Number(
            entry.weight_kg
          )
      )
      .filter(
        (value) =>
          Number.isFinite(value) &&
          value > 0
      );

  const chart =
    buildWeightChart(
      weights
    );

  /* =======================================================
     HEALTH SCORE
     ======================================================= */

  let healthLabel =
    "START";

  if (score >= 80) {
    healthLabel =
      "GOOD";
  } else if (
    score >= 60
  ) {
    healthLabel =
      "FAIR";
  }

  const aal2 =
    aal?.currentLevel ===
    "aal2";

  /* =======================================================
     HTML
     ======================================================= */

  profileApp.innerHTML = `

    <!-- ================================================
         HEADER
         ================================================ -->

    <div class="profile-page-title">

      <button
        type="button"
        data-nav="dashboard"
      >
        ←
      </button>

      <h1>
        PROFILE
      </h1>

      <button
        type="button"
        data-nav="security"
      >
        ⚙
      </button>

    </div>


    <!-- ================================================
         IDENTITY
         ================================================ -->

    <section class="profile-card identity-card">

      <div class="avatar-wrap">

        <div class="profile-avatar">
          ${avatar}
        </div>

        <label class="camera-button">

          📷

          <input
            id="avatarInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
          >

        </label>

      </div>


      <div class="member-copy">

        <div class="name-row">

          <h2>
            ${safe(
              profile.full_name ||
              "สมาชิก"
            )}
          </h2>

          <button
            id="editProfile"
            type="button"
          >
            แก้ไข
          </button>

        </div>


        <p>
          Member ID ·

          <b>
            ${safe(memberId)}
          </b>

          <i>
            Lv.${level}
          </i>
        </p>


        <span>
          EXP
          ${exp.toLocaleString()}
          /
          ${expTarget.toLocaleString()}
        </span>


        <div class="exp-bar">

          <b
            style="
              width:
              ${Math.min(
                100,
                (
                  exp /
                  expTarget
                ) *
                100
              )}%
            "
          ></b>

        </div>

      </div>


      <div class="health-score">

        <small>
          HEALTH SCORE
        </small>

        <div
          class="score-ring"
          style="
            --score:
            ${Math.min(
              100,
              Math.max(
                0,
                score
              )
            )}
          "
        >

          <strong>
            ${score}
          </strong>

        </div>

        <b>
          ${healthLabel}
        </b>

      </div>

    </section>


    <!-- ================================================
         BASIC HEALTH
         ================================================ -->

    <section class="profile-card bio-grid">

      ${stat(
        "อายุ",
        age === null
          ? "—"
          : `${age} ปี`,
        "●"
      )}

      ${stat(
        "เพศ",
        gender(
          health.gender
        ),
        "♀"
      )}

      ${stat(
        "ส่วนสูง",
        height
          ? `${height} cm`
          : "—",
        "↕"
      )}

      ${stat(
        "น้ำหนัก",
        weight
          ? `${weight} kg`
          : "—",
        "◆"
      )}

      ${stat(
        "BMI",
        bmi,
        "↗"
      )}

      ${stat(
        "เป้าหมาย",
        health.goal ||
          "ดูแลสุขภาพ",
        "◎"
      )}

    </section>


    <!-- ================================================
         INBODY / WEIGHT
         ================================================ -->

    <section class="profile-card">

      <header>

        <div>
          <em>01</em>

          <h3>
            InBody ล่าสุด
          </h3>
        </div>

        <span>
          ${safe(
            latestEntry
              ?.entry_date ||
              "ยังไม่มีวันที่บันทึก"
          )}
        </span>

      </header>


      <div class="inbody-layout">

        <div class="metric-list">

          ${metric(
            "น้ำหนัก",
            weight
              ? `${weight} kg`
              : "—"
          )}

          ${metric(
            "มวลกล้ามเนื้อ",
            health.muscle_mass_kg !=
              null
              ? `${health.muscle_mass_kg} kg`
              : "—"
          )}

          ${metric(
            "ไขมันในร่างกาย",
            health.body_fat_pct !=
              null
              ? `${health.body_fat_pct} %`
              : "—"
          )}

          ${metric(
            "น้ำในร่างกาย",
            health.body_water_l !=
              null
              ? `${health.body_water_l} L`
              : "—"
          )}

        </div>


        <div class="trend-card">

          <b>
            แนวโน้มน้ำหนัก
          </b>

          ${chart}

        </div>

      </div>

    </section>


    <!-- ================================================
         HEALTH INFORMATION
         ================================================ -->

    <div class="profile-columns">

      <section class="profile-card">

        <header>

          <div>
            <em>02</em>

            <h3>
              ข้อมูลสุขภาพ
            </h3>
          </div>

          <button
            id="editHealth"
            type="button"
          >
            แก้ไข
          </button>

        </header>


        <div class="detail-list">

          ${detail(
            "โรคประจำตัว",
            showList(
              health.conditions
            )
          )}

          ${detail(
            "ยาประจำ",
            showList(
              health.medications
            )
          )}

          ${detail(
            "แพ้อาหาร / แพ้ยา",
            showList(
              health.allergies
            )
          )}

          ${detail(
            "สูบบุหรี่",
            health.smoking ||
              "ไม่สูบ"
          )}

          ${detail(
            "แอลกอฮอล์",
            health.alcohol ||
              "ไม่ดื่ม"
          )}

          ${detail(
            "Activity level",
            health.activity_level ||
              "ปานกลาง"
          )}

        </div>

      </section>


      <!-- ==============================================
           DAILY PLAN
           ============================================== -->

      <section class="profile-card">

        <header>

          <div>
            <em>03</em>

            <h3>
              เป้าหมาย & Daily Plan
            </h3>
          </div>

        </header>


        <div class="goal-box">

          <span>
            เป้าหมายหลัก
          </span>

          <strong>
            ${safe(
              health.goal ||
              "ดูแลสุขภาพ"
            )}
          </strong>

        </div>


        <div class="plan-grid">

          ${plan(
            "Calories",
            health.daily_calories ??
              1650,
            "kcal"
          )}

          ${plan(
            "Protein",
            health.daily_protein_g ??
              90,
            "g"
          )}

          ${plan(
            "Steps",
            health.daily_steps ??
              8000,
            "ก้าว"
          )}

          ${plan(
            "Sleep",
            Math.round(
              (
                health.daily_sleep_min ??
                420
              ) /
              60
            ),
            "ชม."
          )}

        </div>

      </section>

    </div>


    <!-- ================================================
         ACHIEVEMENTS
         ================================================ -->

    <section class="profile-card">

      <header>

        <div>
          <em>04</em>

          <h3>
            Achievement
          </h3>
        </div>

        <span>
          ความสำเร็จของฉัน
        </span>

      </header>


      <div class="achievement-row">

        ${badge(
          "7",
          "Day Streak"
        )}

        ${badge(
          "10K",
          "Steps"
        )}

        ${badge(
          "500",
          "Burn kcal"
        )}

        ${badge(
          "★",
          "Health Star"
        )}

        ${badge(
          "✓",
          "Profile Pro"
        )}

      </div>

    </section>


    <!-- ================================================
         SETTINGS / SECURITY
         ================================================ -->

    <div class="profile-columns">

      <section class="profile-card">

        <header>

          <div>
            <em>05</em>

            <h3>
              Settings
            </h3>
          </div>

        </header>


        <div class="setting-list">

          <button type="button">
            🔔 การแจ้งเตือน
            <b>›</b>
          </button>

          <button type="button">
            ◎ เป้าหมายรายวัน
            <b>›</b>
          </button>

          <button type="button">
            ◐ ธีม
            <span>
              น้ำเงิน / แดง / ดำ
            </span>
          </button>

          <button type="button">
            TH ภาษา
            <span>
              ไทย
            </span>
          </button>

        </div>

      </section>


      <section class="profile-card">

        <header>

          <div>
            <em>06</em>

            <h3>
              Account & Security
            </h3>
          </div>

        </header>


        <div class="account-list">

          <p>

            <span>
              อีเมล
            </span>

            <b>
              ${safe(
                user.email ||
                "-"
              )}
            </b>

          </p>


          <p>

            <span>
              User ID
            </span>

            <b>
              ${safe(
                user.id.slice(
                  0,
                  13
                )
              )}…
            </b>

          </p>


          <p>

            <span>
              2FA
            </span>

            <b
              class="${
                aal2
                  ? "secure"
                  : "warning"
              }"
            >
              ${
                aal2
                  ? "เปิดใช้งาน"
                  : "รอยืนยัน"
              }
            </b>

          </p>


          <button
            type="button"
            data-nav="security"
          >
            จัดการบัญชีและ 2FA
          </button>

        </div>

      </section>

    </div>
  `;

  /* =======================================================
     BOTTOM NAVIGATION
     ======================================================= */

  profileApp.insertAdjacentHTML(
    "beforeend",
    `
      <nav class="profile-bottom-nav">

        <button
          type="button"
          data-nav="dashboard"
        >
          ⌂
          <span>
            หน้าหลัก
          </span>
        </button>

        <button
          type="button"
          data-nav="health"
        >
          ＋
          <span>
            วันนี้
          </span>
        </button>

        <button
          type="button"
          data-nav="dashboard"
        >
          🏆
          <span>
            ภารกิจ
          </span>
        </button>

        <button
          type="button"
          data-nav="channels"
        >
          ◉
          <span>
            โค้ช
          </span>
        </button>

        <button
          type="button"
          class="active"
        >
          ●
          <span>
            โปรไฟล์
          </span>
        </button>

      </nav>
    `
  );

  /* =======================================================
     EVENTS
     ======================================================= */

  document
    .querySelectorAll(
      "#profileApp [data-nav]"
    )
    .forEach(
      (button) => {
        button.onclick =
          () => {
            const target =
              document.querySelector(
                `aside [data-view="${button.dataset.nav}"]`
              );

            target?.click();
          };
      }
    );

  const editProfile =
    $("#editProfile");

  if (editProfile) {
    editProfile.onclick =
      () =>
        openEdit(
          profile,
          health
        );
  }

  const editHealth =
    $("#editHealth");

  if (editHealth) {
    editHealth.onclick =
      () =>
        openEdit(
          profile,
          health
        );
  }

  const avatarInput =
    $("#avatarInput");

  if (avatarInput) {
    avatarInput.onchange =
      uploadAvatar;
  }
}

/* =========================================================
   COMPONENT HELPERS
   ========================================================= */

function stat(
  title,
  value,
  icon
) {
  return `
    <article>

      <i>
        ${icon}
      </i>

      <span>

        ${safe(title)}

        <b>
          ${safe(
            String(value)
          )}
        </b>

      </span>

    </article>
  `;
}

function metric(
  title,
  value
) {
  return `
    <p>

      <span>
        ${safe(title)}
      </span>

      <b>
        ${safe(
          String(value)
        )}
      </b>

    </p>
  `;
}

function detail(
  title,
  value
) {
  return `
    <p>

      <span>
        ${safe(title)}
      </span>

      <b>
        ${safe(
          String(value)
        )}
      </b>

    </p>
  `;
}

function plan(
  title,
  value,
  unit
) {
  const numericValue =
    Number(value);

  return `
    <article>

      <span>
        ${safe(title)}
      </span>

      <b>

        ${
          Number.isFinite(
            numericValue
          )
            ? numericValue
                .toLocaleString()
            : "—"
        }

        <small>
          ${safe(unit)}
        </small>

      </b>

    </article>
  `;
}

function badge(
  icon,
  title
) {
  return `
    <article>

      <i>
        ${safe(icon)}
      </i>

      <span>
        ${safe(title)}
      </span>

    </article>
  `;
}

function gender(value) {
  const genders = {
    female:
      "หญิง",

    male:
      "ชาย",

    other:
      "อื่น ๆ",

    unspecified:
      "ไม่ระบุ",
  };

  return (
    genders[value] ||
    "ไม่ระบุ"
  );
}

/* =========================================================
   AGE
   ========================================================= */

function calculateAge(
  birthDate
) {
  if (!birthDate) {
    return null;
  }

  const birth =
    new Date(
      birthDate + "T00:00:00"
    );

  if (
    Number.isNaN(
      birth.getTime()
    )
  ) {
    return null;
  }

  const today =
    new Date();

  let age =
    today.getFullYear() -
    birth.getFullYear();

  const month =
    today.getMonth() -
    birth.getMonth();

  if (
    month < 0 ||
    (
      month === 0 &&
      today.getDate() <
        birth.getDate()
    )
  ) {
    age--;
  }

  return age >= 0
    ? age
    : null;
}

/* =========================================================
   WEIGHT CHART
   ========================================================= */

function buildWeightChart(
  values
) {
  if (
    !values ||
    values.length < 2
  ) {
    return `
      <div class="muted">
        ยังมีข้อมูลน้ำหนักไม่เพียงพอสำหรับแสดงแนวโน้ม
      </div>
    `;
  }

  const min =
    Math.min(
      ...values
    ) - 1;

  const max =
    Math.max(
      ...values
    ) + 1;

  const range =
    Math.max(
      1,
      max - min
    );

  const points =
    values
      .map(
        (
          value,
          index
        ) => {
          const x =
            8 +
            index *
              (
                84 /
                Math.max(
                  1,
                  values.length -
                    1
                )
              );

          const y =
            86 -
            (
              (
                value -
                min
              ) /
              range
            ) *
              68;

          return `${x},${y}`;
        }
      )
      .join(" ");

  return `
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label="กราฟแนวโน้มน้ำหนัก"
    >
      <polyline
        points="${points}"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
      />
    </svg>
  `;
}

/* =========================================================
   EDIT PROFILE
   ========================================================= */

function openEdit(
  profile,
  health
) {
  let dialog =
    $("#profileEditDialog");

  if (!dialog) {
    dialog =
      document.createElement(
        "dialog"
      );

    dialog.id =
      "profileEditDialog";

    document.body
      .appendChild(
        dialog
      );
  }

  dialog.innerHTML = `
    <form id="profileEditForm">

      <div class="dialog-title">

        <h2>
          แก้ไข Health Profile
        </h2>

        <button
          type="button"
          class="close-dialog"
        >
          ×
        </button>

      </div>


      <div class="edit-grid">

        <label>

          ชื่อ-นามสกุล

          <input
            id="pfName"
            required
          >

        </label>


        <label>

          รหัสพนักงาน

          <input id="pfCode">

        </label>


        <label>

          แผนก

          <input id="pfDepartment">

        </label>


        <label>

          โทรศัพท์

          <input
            id="pfPhone"
            type="tel"
            autocomplete="tel"
          >

        </label>


        <label>

          วันเกิด

          <input
            id="pfBirth"
            type="date"
          >

        </label>


        <label>

          เพศ

          <select id="pfGender">

            <option value="unspecified">
              ไม่ระบุ
            </option>

            <option value="female">
              หญิง
            </option>

            <option value="male">
              ชาย
            </option>

            <option value="other">
              อื่น ๆ
            </option>

          </select>

        </label>


        <label>

          ส่วนสูง (cm)

          <input
            id="pfHeight"
            type="number"
            min="50"
            max="250"
            step="0.1"
          >

        </label>


        <label>

          เป้าหมายสุขภาพ

          <input id="pfGoal">

        </label>


        <label class="wide">

          โรคประจำตัว

          <textarea
            id="pfConditions"
          ></textarea>

        </label>


        <label class="wide">

          ยาประจำ

          <textarea
            id="pfMedications"
          ></textarea>

        </label>


        <label class="wide">

          แพ้อาหาร / แพ้ยา

          <textarea
            id="pfAllergies"
          ></textarea>

        </label>


        <label>

          สูบบุหรี่

          <input id="pfSmoking">

        </label>


        <label>

          แอลกอฮอล์

          <input id="pfAlcohol">

        </label>


        <label>

          Activity level

          <select id="pfActivity">

            <option value="น้อย">
              น้อย
            </option>

            <option value="ปานกลาง">
              ปานกลาง
            </option>

            <option value="สูง">
              สูง
            </option>

          </select>

        </label>


        <label>

          Health Score

          <input
            id="pfScore"
            type="number"
            min="0"
            max="100"
          >

        </label>

      </div>


      <p
        id="profileEditMessage"
      ></p>


      <div class="dialog-actions">

        <button
          type="button"
          class="secondary close-dialog"
        >
          ยกเลิก
        </button>

        <button
          type="submit"
        >
          บันทึกข้อมูล
        </button>

      </div>

    </form>
  `;

  const set =
    (
      id,
      value
    ) => {
      const element =
        $("#" + id);

      if (element) {
        element.value =
          value ?? "";
      }
    };

  set(
    "pfName",
    profile.full_name
  );

  set(
    "pfCode",
    profile.employee_code
  );

  set(
    "pfDepartment",
    profile.department
  );

  set(
    "pfPhone",
    profile.phone
  );

  set(
    "pfBirth",
    health.birth_date
  );

  set(
    "pfGender",
    health.gender ||
      "unspecified"
  );

  set(
    "pfHeight",
    health.height_cm
  );

  set(
    "pfGoal",
    health.goal
  );

  set(
    "pfConditions",
    (
      health.conditions ||
      []
    ).join(", ")
  );

  set(
    "pfMedications",
    (
      health.medications ||
      []
    ).join(", ")
  );

  set(
    "pfAllergies",
    (
      health.allergies ||
      []
    ).join(", ")
  );

  set(
    "pfSmoking",
    health.smoking ||
      "ไม่สูบ"
  );

  set(
    "pfAlcohol",
    health.alcohol ||
      "ไม่ดื่ม"
  );

  set(
    "pfActivity",
    health.activity_level ||
      "ปานกลาง"
  );

  set(
    "pfScore",
    health.health_score ??
      50
  );

  dialog
    .querySelectorAll(
      ".close-dialog"
    )
    .forEach(
      (button) => {
        button.onclick =
          () =>
            dialog.close();
      }
    );

  const form =
    $("#profileEditForm");

  if (form) {
    form.onsubmit =
      (event) =>
        saveProfile(
          event,
          health,
          dialog
        );
  }

  dialog.showModal();
}

/* =========================================================
   SAVE PROFILE
   ========================================================= */

async function saveProfile(
  event,
  currentHealth,
  dialog
) {
  event.preventDefault();

  const message =
    $("#profileEditMessage");

  const form =
    event.currentTarget;

  const submitButton =
    form.querySelector(
      '[type="submit"]'
    );

  const arrayValue =
    (id) =>
      $("#" + id)
        .value
        .split(",")
        .map(
          (value) =>
            value.trim()
        )
        .filter(Boolean);

  if (message) {
    message.className =
      "";

    message.textContent =
      "กำลังบันทึก…";
  }

  if (submitButton) {
    submitButton.disabled =
      true;
  }

  /* =======================================================
     BASIC PROFILE
     ======================================================= */

  const profileResult =
    await db.rpc(
      "update_my_profile",
      {
        p_full_name:
          $("#pfName")
            .value
            .trim(),

        p_employee_code:
          $("#pfCode")
            .value
            .trim() ||
          null,

        p_department:
          $("#pfDepartment")
            .value
            .trim() ||
          null,

        p_phone:
          $("#pfPhone")
            .value
            .trim() ||
          null,
      }
    );

  if (profileResult.error) {
    if (submitButton) {
      submitButton.disabled =
        false;
    }

    if (message) {
      message.className =
        "bad";

      message.textContent =
        profileResult.error
          .message;
    }

    return;
  }

  /* =======================================================
     HEALTH PROFILE
     ======================================================= */

  const healthPayload = {
    ...currentHealth,

    user_id:
      user.id,

    birth_date:
      $("#pfBirth").value ||
      null,

    gender:
      $("#pfGender").value,

    height_cm:
      Number(
        $("#pfHeight").value
      ) || null,

    goal:
      $("#pfGoal")
        .value
        .trim() ||
      null,

    conditions:
      arrayValue(
        "pfConditions"
      ),

    medications:
      arrayValue(
        "pfMedications"
      ),

    allergies:
      arrayValue(
        "pfAllergies"
      ),

    smoking:
      $("#pfSmoking")
        .value
        .trim() ||
      "ไม่สูบ",

    alcohol:
      $("#pfAlcohol")
        .value
        .trim() ||
      "ไม่ดื่ม",

    activity_level:
      $("#pfActivity")
        .value,

    health_score:
      Number(
        $("#pfScore").value
      ) || 0,

    updated_at:
      new Date()
        .toISOString(),
  };

  delete healthPayload.created_at;

  const healthResult =
    await db
      .from(
        "health_profiles"
      )
      .upsert(
        healthPayload,
        {
          onConflict:
            "user_id",
        }
      );

  if (submitButton) {
    submitButton.disabled =
      false;
  }

  if (healthResult.error) {
    if (message) {
      message.className =
        "bad";

      message.textContent =
        healthResult.error
          .message;
    }

    return;
  }

  if (message) {
    message.className =
      "good";

    message.textContent =
      "บันทึกเรียบร้อย";
  }

  setTimeout(
    async () => {
      dialog.close();

      await loadProfile();
    },
    400
  );
}

/* =========================================================
   AVATAR
   ========================================================= */

async function uploadAvatar(
  event
) {
  const file =
    event.target
      .files?.[0];

  if (!file) {
    return;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (
    !allowedTypes.includes(
      file.type
    )
  ) {
    alert(
      "รองรับเฉพาะ JPG, PNG และ WEBP"
    );

    event.target.value =
      "";

    return;
  }

  /*
   * Maximum 5 MB
   */
  if (
    file.size >
    5 * 1024 * 1024
  ) {
    alert(
      "ไฟล์รูปต้องมีขนาดไม่เกิน 5 MB"
    );

    event.target.value =
      "";

    return;
  }

  const extensionMap = {
    "image/jpeg":
      "jpg",

    "image/png":
      "png",

    "image/webp":
      "webp",
  };

  const extension =
    extensionMap[
      file.type
    ];

  /*
   * user.id เป็น folder ของเจ้าของไฟล์
   */
  const path =
    `${user.id}/avatar-${Date.now()}.${extension}`;

  const uploadResult =
    await db.storage
      .from(
        "profile-avatars"
      )
      .upload(
        path,
        file,
        {
          contentType:
            file.type,

          upsert:
            false,
        }
      );

  if (
    uploadResult.error
  ) {
    console.error(
      uploadResult.error
    );

    alert(
      uploadResult.error
        .message
    );

    return;
  }

  const publicResult =
    db.storage
      .from(
        "profile-avatars"
      )
      .getPublicUrl(
        path
      );

  const publicUrl =
    publicResult
      .data
      ?.publicUrl;

  if (!publicUrl) {
    alert(
      "ไม่สามารถสร้าง URL ของรูปโปรไฟล์ได้"
    );

    return;
  }

  const updateResult =
    await db
      .from(
        "user_profiles"
      )
      .update({
        avatar_url:
          publicUrl,

        updated_at:
          new Date()
            .toISOString(),
      })
      .eq(
        "id",
        user.id
      );

  if (
    updateResult.error
  ) {
    console.error(
      updateResult.error
    );

    alert(
      updateResult.error
        .message
    );

    return;
  }

  await loadProfile();
}
