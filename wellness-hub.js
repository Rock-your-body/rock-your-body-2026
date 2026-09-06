import { db } from "./auth.js";
import { requireUser } from "./auth-guard.js";

/* =========================================================
   ROCK YOUR BODY 2026
   WELLNESS HUB
   ========================================================= */

const modules = [
  [
    "profile",
    "💚",
    "Health Profile",
    "ข้อมูลสุขภาพ เป้าหมาย และแผนเฉพาะบุคคล",
  ],

  [
    "nutrition",
    "🥗",
    "AI Nutrition Coach",
    "พลังงาน สารอาหาร และบันทึกมื้ออาหาร",
  ],

  [
    "health",
    "🏃",
    "Exercise & Rehab",
    "กิจกรรม การฟื้นฟู และประเมินหลังออกกำลัง",
  ],

  [
    "health",
    "🌙",
    "Sleep & Recovery",
    "การนอน ความเครียด และ Energy",
  ],

  [
    "mission",
    "🎯",
    "Mission & Game",
    "ภารกิจเฉพาะบุคคล EXP Coin และ Badge",
  ],

  [
    "channels",
    "💬",
    "Coach Center",
    "แพทย์ นักโภชนาการ และกายภาพ",
  ],

  [
    "knowledge",
    "▶️",
    "Knowledge & Media",
    "วิดีโอแนะนำตาม Health Profile",
  ],

  [
    "dashboard",
    "📈",
    "Reports & Monitoring",
    "Progress และรายงานตามสิทธิ์",
  ],
];

let user = null;
let profile = null;
let healthEntries = [];

/* =========================================================
   START
   ========================================================= */

async function start() {
  user =
    await requireUser();

  if (!user) {
    return;
  }

  const [
    profileResult,
    entriesResult,
  ] =
    await Promise.all([
      db
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single(),

      db
        .from("health_entries")
        .select("*")
        .eq("user_id", user.id)
        .order(
          "entry_date",
          {
            ascending: false,
          }
        )
        .limit(30),
    ]);

  /* =======================================================
     PROFILE ERROR
     ======================================================= */

  if (profileResult.error) {
    console.error(
      "Wellness profile:",
      profileResult.error
    );

    return;
  }

  profile =
    profileResult.data;

  if (
    !profile ||
    profile.status !==
      "active"
  ) {
    return;
  }

  /* =======================================================
     HEALTH ENTRY ERROR
     ======================================================= */

  if (entriesResult.error) {
    console.error(
      "Wellness entries:",
      entriesResult.error
    );

    healthEntries = [];
  } else {
    healthEntries =
      entriesResult.data ||
      [];
  }

  build(
    profile,
    healthEntries
  );
}

/* =========================================================
   BUILD WELLNESS HUB
   ========================================================= */

function build(
  profile,
  entries
) {
  const root =
    document.querySelector(
      "#dashboard"
    );

  if (!root) {
    return;
  }

  loadStylesheet();

  const latest =
    entries[0] || {};

  const steps =
    toNumber(
      latest.steps
    );

  const exercise =
    toNumber(
      latest.exercise_minutes
    );

  const sleep =
    toNumber(
      latest.sleep_minutes
    );

  const water =
    toNumber(
      latest.water_ml
    );

  const weight =
    toNumber(
      latest.weight_kg
    );

  const score =
    calculateHealthScore({
      steps,
      exercise,
      sleep,
      water,
    });

  const staff =
    profile.role !==
    "employee";

  const roleLabel =
    getRoleLabel(
      profile.role
    );

  const healthMessage =
    getHealthMessage(
      score
    );

  const sleepText =
    formatSleep(
      sleep
    );

  const exerciseCalories =
    exercise > 0
      ? Math.round(
          exercise * 7
        )
      : null;

  root.innerHTML = `
    <div class="wellness-shell">

      <!-- HEADER -->

      <section class="wellness-head">

        <div>

          <span class="wellness-kicker">
            ${
              staff
                ? "HEALTH TEAM MONITORING"
                : "PERSONAL WELLNESS"
            }
          </span>

          <h1>
            สวัสดี
            ${esc(
              profile.full_name ||
                "สมาชิก"
            )}
          </h1>

          <p>
            ${
              staff
                ? "ติดตามความเสี่ยงและความก้าวหน้าของพนักงานตามสิทธิ์"
                : "ดูแลสุขภาพของคุณให้ดีขึ้นในทุกวัน"
            }
          </p>

        </div>


        <button
          type="button"
          class="profile-pill"
          data-open="profile"
        >
          👤
          ${esc(roleLabel)}
        </button>

      </section>


      <!-- HEALTH SCORE -->

      <section class="score-card">

        <div>

          <span>
            Health Score
          </span>

          <strong>
            ${
              score === null
                ? "—"
                : score
            }

            <small>
              ${
                score === null
                  ? ""
                  : "/100"
              }
            </small>
          </strong>

          <p>
            ${esc(
              healthMessage
            )}
          </p>

        </div>


        <div
          class="score-ring"
          style="--score:${
            score ?? 0
          }"
        >
          <span>
            ♥
          </span>
        </div>

      </section>


      <!-- DAILY OVERVIEW -->

      <section class="daily-grid">

        ${dailyCard({
          icon: "🥗",
          title:
            "Nutrition",
          value:
            "ยังไม่มีข้อมูล",
          target: "",
          percent: 0,
        })}


        ${dailyCard({
          icon: "🔥",
          title:
            "Activity",

          value:
            exerciseCalories ===
            null
              ? "—"
              : `${exerciseCalories}`,

          target:
            exerciseCalories ===
            null
              ? ""
              : "kcal โดยประมาณ",

          percent:
            exercise > 0
              ? Math.min(
                  100,
                  (
                    exercise /
                    30
                  ) *
                    100
                )
              : 0,
        })}


        ${dailyCard({
          icon: "👟",
          title:
            "Steps",

          value:
            steps > 0
              ? steps.toLocaleString(
                  "th-TH"
                )
              : "—",

          target:
            "/ 8,000",

          percent:
            steps > 0
              ? Math.min(
                  100,
                  (
                    steps /
                    8000
                  ) *
                    100
                )
              : 0,
        })}


        ${dailyCard({
          icon: "🌙",
          title:
            "Sleep",

          value:
            sleepText,

          target:
            sleep > 0
              ? "/ 7h"
              : "",

          percent:
            sleep > 0
              ? Math.min(
                  100,
                  (
                    sleep /
                    420
                  ) *
                    100
                )
              : 0,
        })}

      </section>


      <!-- TODAY -->

      <section class="mission-strip">

        <div>

          <span>
            Today's Wellness
          </span>

          <strong>
            ${
              staff
                ? "Health Team Review"
                : getTodaySummary(
                    {
                      steps,
                      exercise,
                      sleep,
                      water,
                    }
                  )
            }
          </strong>

        </div>


        <div class="mission-icons">

          ${missionIndicator(
            steps >= 8000,
            "เดิน"
          )}

          ${missionIndicator(
            exercise >= 30,
            "ออกกำลัง"
          )}

          ${missionIndicator(
            water >= 2000,
            "ดื่มน้ำ"
          )}

          ${missionIndicator(
            sleep >= 420,
            "นอน"
          )}

        </div>

      </section>


      <!-- HEALTH INSIGHT -->

      <section class="ai-advice">

        <span>
          🤖
        </span>

        <div>

          <strong>
            ${
              staff
                ? "Health Team Daily Insight"
                : "Daily Wellness Insight"
            }
          </strong>

          <p>
            ${esc(
              getDailyAdvice({
                staff,
                steps,
                exercise,
                sleep,
                water,
                weight,
              })
            )}
          </p>

        </div>

      </section>


      <!-- MODULES -->

      <div class="module-title">

        <h2>
          8 โมดูลสุขภาพ
        </h2>

        <p>
          เชื่อมข้อมูลผ่าน Health Profile กลาง
        </p>

      </div>


      <section class="module-grid">

        ${modules
          .map(
            (
              [
                view,
                icon,
                title,
                description,
              ],
              index
            ) => `
              <button
                type="button"
                data-module="${view}"
                class="module-card"
              >

                <span>
                  ${icon}
                </span>

                <div>

                  <small>
                    ${String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}
                  </small>

                  <strong>
                    ${esc(title)}
                  </strong>

                  <p>
                    ${esc(
                      description
                    )}
                  </p>

                </div>

                <em>
                  ›
                </em>

              </button>
            `
          )
          .join("")}

      </section>

    </div>
  `;

  /* =======================================================
     MODULE NAVIGATION
     ======================================================= */

  root
    .querySelectorAll(
      "[data-module],[data-open]"
    )
    .forEach(
      (button) => {
        button.onclick =
          () => {
            const target =
              button.dataset
                .module ||
              button.dataset
                .open;

            openView(
              target
            );
          };
      }
    );
}

/* =========================================================
   DAILY CARD
   ========================================================= */

function dailyCard({
  icon,
  title,
  value,
  target,
  percent,
}) {
  const safePercent =
    Math.max(
      0,
      Math.min(
        100,
        Number(percent) ||
          0
      )
    );

  return `
    <article>

      <span>
        ${icon}
        ${esc(title)}
      </span>

      <strong>
        ${esc(value)}

        ${
          target
            ? `
                <small>
                  ${esc(target)}
                </small>
              `
            : ""
        }
      </strong>

      <i
        style="--p:${safePercent}%"
      ></i>

    </article>
  `;
}

/* =========================================================
   MISSION INDICATOR
   ========================================================= */

function missionIndicator(
  done,
  label
) {
  return `
    <b class="${
      done
        ? "done"
        : ""
    }">

      ${
        done
          ? "✓"
          : "○"
      }

      <small>
        ${esc(label)}
      </small>

    </b>
  `;
}

/* =========================================================
   HEALTH SCORE
   ========================================================= */

function calculateHealthScore({
  steps,
  exercise,
  sleep,
  water,
}) {
  const hasData =
    steps > 0 ||
    exercise > 0 ||
    sleep > 0 ||
    water > 0;

  if (!hasData) {
    return null;
  }

  let score =
    40;

  /* ---------- Steps: max 20 ---------- */

  score +=
    Math.min(
      20,
      (
        steps /
        8000
      ) *
        20
    );

  /* ---------- Exercise: max 15 ---------- */

  score +=
    Math.min(
      15,
      (
        exercise /
        30
      ) *
        15
    );

  /* ---------- Sleep: max 15 ---------- */

  score +=
    Math.min(
      15,
      (
        sleep /
        420
      ) *
        15
    );

  /* ---------- Water: max 10 ---------- */

  score +=
    Math.min(
      10,
      (
        water /
        2000
      ) *
        10
    );

  return Math.min(
    100,
    Math.round(score)
  );
}

/* =========================================================
   HEALTH MESSAGE
   ========================================================= */

function getHealthMessage(
  score
) {
  if (score === null) {
    return "เริ่มบันทึกข้อมูลสุขภาพเพื่อดู Health Score";
  }

  if (score >= 85) {
    return "ยอดเยี่ยม รักษาพฤติกรรมสุขภาพที่ดีนี้ต่อไป";
  }

  if (score >= 70) {
    return "ภาพรวมดี และยังมีโอกาสพัฒนาได้อีกเล็กน้อย";
  }

  if (score >= 50) {
    return "เริ่มจากเป้าหมายเล็ก ๆ และทำอย่างสม่ำเสมอ";
  }

  return "ข้อมูลวันนี้ยังต่ำกว่าเป้าหมาย ลองปรับทีละด้าน";
}

/* =========================================================
   DAILY SUMMARY
   ========================================================= */

function getTodaySummary({
  steps,
  exercise,
  sleep,
  water,
}) {
  const completed = [
    steps >= 8000,
    exercise >= 30,
    water >= 2000,
    sleep >= 420,
  ].filter(Boolean).length;

  return `${completed} / 4 เป้าหมายสำเร็จ`;
}

/* =========================================================
   DAILY ADVICE
   ========================================================= */

function getDailyAdvice({
  staff,
  steps,
  exercise,
  sleep,
  water,
  weight,
}) {
  if (staff) {
    return "ใช้หน้ารายงานและข้อมูลพนักงานเพื่อติดตามรายการตามสิทธิ์ที่ได้รับ";
  }

  const noData =
    steps <= 0 &&
    exercise <= 0 &&
    sleep <= 0 &&
    water <= 0 &&
    weight <= 0;

  if (noData) {
    return "เริ่มบันทึกก้าว การออกกำลัง การนอน น้ำ และน้ำหนัก เพื่อให้ระบบสรุปแนวโน้มของคุณได้";
  }

  if (
    sleep > 0 &&
    sleep < 360
  ) {
    return "เวลานอนวันนี้ต่ำกว่า 6 ชั่วโมง ควรให้ความสำคัญกับการพักผ่อนและการฟื้นตัว";
  }

  if (
    water > 0 &&
    water < 1500
  ) {
    return "ปริมาณน้ำที่บันทึกวันนี้ยังค่อนข้างน้อย ลองแบ่งดื่มน้ำอย่างสม่ำเสมอตลอดวัน";
  }

  if (
    steps > 0 &&
    steps < 5000
  ) {
    return "จำนวนก้าววันนี้ยังต่ำกว่าเป้าหมาย ลองเพิ่มการเดินระยะสั้นระหว่างวัน";
  }

  if (
    exercise > 0 &&
    exercise < 30
  ) {
    return "วันนี้มีการออกกำลังกายแล้ว หากร่างกายพร้อมสามารถค่อย ๆ เพิ่มเวลาให้ใกล้ 30 นาที";
  }

  return "ข้อมูลสุขภาพวันนี้อยู่ในทิศทางที่ดี รักษาความสม่ำเสมอและติดตามแนวโน้มต่อเนื่อง";
}

/* =========================================================
   SLEEP
   ========================================================= */

function formatSleep(minutes) {
  if (
    !minutes ||
    minutes <= 0
  ) {
    return "—";
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  const remaining =
    minutes % 60;

  return `${hours}h ${remaining}m`;
}

/* =========================================================
   NUMBER
   ========================================================= */

function toNumber(value) {
  const number =
    Number(value);

  if (
    !Number.isFinite(
      number
    )
  ) {
    return 0;
  }

  return number;
}

/* =========================================================
   ROLE
   ========================================================= */

function getRoleLabel(role) {
  const labels = {
    employee:
      "EMPLOYEE",

    hr:
      "HR",

    admin:
      "ADMIN",
  };

  return (
    labels[role] ||
    String(
      role ||
        "MEMBER"
    ).toUpperCase()
  );
}

/* =========================================================
   NAVIGATION
   ========================================================= */

function openView(view) {
  /*
   * Mapping ระหว่าง Wellness Module
   * กับ View ที่มีจริงใน portal.html
   */

  const mapping = {
    profile:
      "profile",

    nutrition:
      "health",

    health:
      "health",

    mission:
      "dashboard",

    channels:
      "channels",

    knowledge:
      "channels",

    dashboard:
      "dashboard",
  };

  const target =
    mapping[view] ||
    view;

  const button =
    document.querySelector(
      `[data-view="${target}"]`
    );

  if (button) {
    button.click();
    return;
  }

  console.warn(
    `ไม่พบ view: ${target}`
  );
}

/* =========================================================
   CSS
   ========================================================= */

function loadStylesheet() {
  if (
    document.querySelector(
      'link[href="./wellness-hub.css"]'
    )
  ) {
    return;
  }

  const css =
    document.createElement(
      "link"
    );

  css.rel =
    "stylesheet";

  css.href =
    "./wellness-hub.css";

  document.head.appendChild(
    css
  );
}

/* =========================================================
   ESCAPE
   ========================================================= */

function esc(value) {
  const node =
    document.createElement(
      "div"
    );

  node.textContent =
    String(
      value ?? ""
    );

  return node.innerHTML;
}

/* =========================================================
   RUN
   ========================================================= */

start();
