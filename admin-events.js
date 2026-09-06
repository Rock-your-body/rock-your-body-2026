import { db } from "./auth.js";
import { requireUser } from "./auth-guard.js";

const teams = [
  {
    key: "nutrition",
    icon: "🥗",
    title: "นักโภชนาการ",
    duty: "วางแผนอาหาร เมนูสุขภาพ และคำแนะนำด้านโภชนาการ",
  },
  {
    key: "physio",
    icon: "🧘",
    title: "กายภาพ",
    duty: "วางแผนการเคลื่อนไหว การยืดเหยียด และดูแลความปลอดภัย",
  },
  {
    key: "doctor",
    icon: "🩺",
    title: "แพทย์",
    duty: "คัดกรองสุขภาพ เฝ้าระวังความเสี่ยง และกำหนดแนวทางส่งต่อ",
  },
  {
    key: "developer",
    icon: "🛠️",
    title: "Admin ผู้พัฒนาระบบ",
    duty: "ดูแลการลงทะเบียน สิทธิ์ ระบบหน้างาน และรายงานหลังจบ Event",
  },
];

const allowedStatuses = [
  "draft",
  "published",
  "completed",
  "cancelled",
];

let currentUser = null;
let currentProfile = null;
let eventRows = [];
let editingId = null;

/* =========================================================
   NOTICE
   ========================================================= */

function notify(message, error = false) {
  const notice = document.querySelector("#notice");

  if (!notice) {
    if (error) {
      console.error(message);
    } else {
      console.log(message);
    }
    return;
  }

  notice.textContent = message;
  notice.className = `message ${error ? "bad" : "good"}`;
}

/* =========================================================
   SAFE HTML
   ========================================================= */

function safe(value) {
  const node = document.createElement("div");
  node.textContent = String(value ?? "");
  return node.innerHTML;
}

/* =========================================================
   MARKUP
   ========================================================= */

function markup() {
  return `
    <section id="events" class="view hidden">

      <div class="event-heading">
        <div>
          <span class="badge">
            ADMIN EVENT CENTER
          </span>

          <h1>
            บริหาร Event และทีมผู้เชี่ยวชาญ
          </h1>

          <p class="muted">
            กำหนดหน้าที่ของแต่ละทีม และติดตามสถานะจากจุดเดียว
          </p>
        </div>

        <button
          id="newEventBtn"
          type="button"
        >
          + สร้าง Event
        </button>
      </div>

      <div class="specialist-grid">
        ${teams
          .map(
            (team) => `
              <button
                class="specialist-card"
                data-specialist="${team.key}"
                type="button"
              >
                <span>
                  ${team.icon}
                </span>

                <strong>
                  ${safe(team.title)}
                </strong>

                <small>
                  ${safe(team.duty)}
                </small>
              </button>
            `
          )
          .join("")}
      </div>

      <div
        id="specialistWorkspace"
        class="specialist-workspace card"
      ></div>

      <div class="event-list-head">
        <div>
          <h2>
            Event ทั้งหมด
          </h2>

          <p
            class="muted"
            id="eventCount"
          ></p>
        </div>
      </div>

      <div
        id="eventCards"
        class="event-cards"
      ></div>

    </section>

    <dialog
      id="eventDialog"
      class="event-dialog"
    >
      <form id="eventForm">

        <div class="event-form-head">

          <div>
            <span class="badge">
              EVENT
            </span>

            <h2 id="eventDialogTitle">
              สร้าง Event
            </h2>
          </div>

          <button
            type="button"
            class="close-event secondary"
            aria-label="ปิด"
          >
            ×
          </button>

        </div>

        <div class="event-form-grid">

          <label class="wide">
            ชื่อ Event

            <input
              id="eventTitle"
              maxlength="180"
              required
            >
          </label>

          <label>
            วันที่

            <input
              id="eventDate"
              type="date"
              required
            >
          </label>

          <label>
            เวลาเริ่ม

            <input
              id="eventTime"
              type="time"
            >
          </label>

          <label class="wide">
            สถานที่

            <input
              id="eventLocation"
              maxlength="250"
            >
          </label>

          <label>
            สถานะ

            <select id="eventStatus">
              <option value="draft">
                ฉบับร่าง
              </option>

              <option value="published">
                ประกาศแล้ว
              </option>

              <option value="completed">
                เสร็จสิ้น
              </option>

              <option value="cancelled">
                ยกเลิก
              </option>
            </select>
          </label>

        </div>

        <h3>
          มอบหมายหน้าที่แต่ละ Admin
        </h3>

        <div class="duty-grid">

          ${teams
            .map(
              (team) => `
                <label>
                  <span>
                    ${team.icon}
                    ${safe(team.title)}
                  </span>

                  <textarea
                    id="${team.key}Duties"
                    rows="3"
                    placeholder="${safe(team.duty)}"
                  ></textarea>
                </label>
              `
            )
            .join("")}

        </div>

        <div class="actions">

          <button
            id="saveEventBtn"
            type="submit"
          >
            บันทึก Event
          </button>

          <button
            type="button"
            class="close-event secondary"
          >
            ยกเลิก
          </button>

        </div>

      </form>
    </dialog>
  `;
}

/* =========================================================
   SETUP
   ========================================================= */

async function setup() {
  currentUser = await requireUser();

  if (!currentUser) {
    return;
  }

  const {
    data: profile,
    error,
  } = await db
    .from("user_profiles")
    .select("role,status")
    .eq("id", currentUser.id)
    .single();

  if (error) {
    console.error("Load admin profile:", error);
    return;
  }

  currentProfile = profile;

  if (
    currentProfile?.role !== "admin" ||
    currentProfile?.status !== "active"
  ) {
    return;
  }

  /* ---------- CSS ---------- */

  if (
    !document.querySelector(
      'link[href="./admin-events.css"]'
    )
  ) {
    const css =
      document.createElement("link");

    css.rel = "stylesheet";
    css.href = "./admin-events.css";

    document.head.appendChild(css);
  }

  const aside =
    document.querySelector("aside");

  const main =
    document.querySelector("main.content");

  if (!aside || !main) {
    return;
  }

  /* ป้องกันโหลดซ้ำ */

  if (
    document.querySelector(
      '[data-view="events"]'
    )
  ) {
    return;
  }

  const menu =
    document.createElement("button");

  menu.type = "button";
  menu.className = "admin-only";
  menu.dataset.view = "events";
  menu.textContent = "Event Center";

  aside.appendChild(menu);

  main.insertAdjacentHTML(
    "beforeend",
    markup()
  );

  /* ---------- Menu ---------- */

  menu.onclick = async () => {
    document
      .querySelectorAll(".view")
      .forEach((view) => {
        view.classList.add("hidden");
      });

    document
      .querySelector("#events")
      ?.classList.remove("hidden");

    document
      .querySelectorAll("aside button")
      .forEach((button) => {
        button.classList.remove("active");
      });

    menu.classList.add("active");

    await loadEvents();
  };

  /* ---------- New Event ---------- */

  const newButton =
    document.querySelector(
      "#newEventBtn"
    );

  if (newButton) {
    newButton.onclick = () =>
      openForm();
  }

  /* ---------- Close Dialog ---------- */

  document
    .querySelectorAll(".close-event")
    .forEach((button) => {
      button.onclick = () => {
        document
          .querySelector("#eventDialog")
          ?.close();
      };
    });

  /* ---------- Form ---------- */

  const form =
    document.querySelector(
      "#eventForm"
    );

  if (form) {
    form.onsubmit =
      saveEvent;
  }

  /* ---------- Team buttons ---------- */

  document
    .querySelectorAll(
      "[data-specialist]"
    )
    .forEach((button) => {
      button.onclick = () => {
        renderTeam(
          button.dataset.specialist
        );
      };
    });

  renderTeam("nutrition");
}

/* =========================================================
   MFA
   ========================================================= */

async function requireAAL2() {
  const {
    data,
    error,
  } = await db.auth.mfa
    .getAuthenticatorAssuranceLevel();

  if (error) {
    console.error(
      "MFA assurance error:",
      error
    );

    notify(
      "ไม่สามารถตรวจสอบสถานะ 2FA ได้: " +
        error.message,
      true
    );

    return false;
  }

  if (
    data?.currentLevel !==
    "aal2"
  ) {
    notify(
      "กรุณายืนยัน 2FA ที่เมนู ความปลอดภัย / 2FA ก่อนใช้งาน Event Center",
      true
    );

    return false;
  }

  return true;
}

/* =========================================================
   LOAD EVENTS
   ========================================================= */

async function loadEvents() {
  const allowed =
    await requireAAL2();

  if (!allowed) {
    eventRows = [];
    renderEvents();
    return;
  }

  const {
    data,
    error,
  } = await db
    .from("events")
    .select("*")
    .order(
      "event_date",
      {
        ascending: false,
      }
    );

  if (error) {
    console.error(
      "Load events:",
      error
    );

    notify(
      error.message,
      true
    );

    return;
  }

  eventRows =
    data || [];

  renderEvents();
}

/* =========================================================
   RENDER EVENTS
   ========================================================= */

function renderEvents() {
  const labels = {
    draft: "ฉบับร่าง",
    published: "ประกาศแล้ว",
    completed: "เสร็จสิ้น",
    cancelled: "ยกเลิก",
  };

  const count =
    document.querySelector(
      "#eventCount"
    );

  const container =
    document.querySelector(
      "#eventCards"
    );

  if (!count || !container) {
    return;
  }

  count.textContent =
    `${eventRows.length} รายการ`;

  if (!eventRows.length) {
    container.innerHTML = `
      <div class="empty-event card">

        <strong>
          ยังไม่มี Event
        </strong>

        <p class="muted">
          กด “สร้าง Event”
          เพื่อเริ่มมอบหมายงาน
        </p>

      </div>
    `;

    renderTeam(
      getActiveTeam()
    );

    return;
  }

  container.innerHTML =
    eventRows
      .map((event) => {
        const statusLabel =
          labels[event.status] ||
          event.status ||
          "-";

        return `
          <article
            class="event-card card"
          >

            <div class="event-date">

              <strong>
                ${formatShortDate(
                  event.event_date
                )}
              </strong>

              <span>
                ${
                  event.start_time
                    ?.slice(0, 5) ||
                  "ทั้งวัน"
                }
              </span>

            </div>

            <div class="event-main">

              <span
                class="event-status ${safe(
                  event.status
                )}"
              >
                ${safe(statusLabel)}
              </span>

              <h3>
                ${safe(event.title)}
              </h3>

              <p>
                📍
                ${safe(
                  event.location ||
                    "ยังไม่ระบุสถานที่"
                )}
              </p>

              <div class="event-duty-summary">

                ${teams
                  .map(
                    (team) => `
                      <span>
                        ${team.icon}
                        ${
                          event[
                            `${team.key}_duties`
                          ]
                            ? "มอบหมายแล้ว"
                            : "รอมอบหมาย"
                        }
                      </span>
                    `
                  )
                  .join("")}

              </div>

            </div>

            <div class="event-actions">

              <button
                type="button"
                data-edit-event="${safe(
                  event.id
                )}"
              >
                แก้ไข
              </button>

              <button
                type="button"
                class="danger"
                data-cancel-event="${safe(
                  event.id
                )}"
                ${
                  event.status ===
                  "cancelled"
                    ? "disabled"
                    : ""
                }
              >
                ยกเลิก
              </button>

            </div>

          </article>
        `;
      })
      .join("");

  document
    .querySelectorAll(
      "[data-edit-event]"
    )
    .forEach((button) => {
      button.onclick = () => {
        const row =
          eventRows.find(
            (event) =>
              String(event.id) ===
              String(
                button.dataset
                  .editEvent
              )
          );

        if (row) {
          openForm(row);
        }
      };
    });

  document
    .querySelectorAll(
      "[data-cancel-event]"
    )
    .forEach((button) => {
      button.onclick = () => {
        cancelEvent(
          button.dataset
            .cancelEvent
        );
      };
    });

  renderTeam(
    getActiveTeam()
  );
}

/* =========================================================
   TEAM VIEW
   ========================================================= */

function getActiveTeam() {
  return (
    document.querySelector(
      "[data-specialist].active"
    )?.dataset
      .specialist ||
    "nutrition"
  );
}

function renderTeam(key) {
  const team =
    teams.find(
      (item) =>
        item.key === key
    );

  if (!team) {
    return;
  }

  document
    .querySelectorAll(
      "[data-specialist]"
    )
    .forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset
          .specialist === key
      );
    });

  const workspace =
    document.querySelector(
      "#specialistWorkspace"
    );

  if (!workspace) {
    return;
  }

  const assignments =
    eventRows.filter(
      (event) =>
        event[
          `${team.key}_duties`
        ] &&
        event.status !==
          "cancelled"
    );

  workspace.innerHTML = `
    <div class="workspace-title">

      <span class="workspace-icon">
        ${team.icon}
      </span>

      <div>
        <h2>
          หน้าของ${safe(
            team.title
          )}
        </h2>

        <p class="muted">
          ${safe(team.duty)}
        </p>
      </div>

    </div>

    <div class="assignment-list">

      ${
        assignments.length
          ? assignments
              .map(
                (event) => `
                  <div>

                    <strong>
                      ${safe(
                        event.title
                      )}
                    </strong>

                    <span>
                      ${formatFullDate(
                        event.event_date
                      )}
                    </span>

                    <p>
                      ${safe(
                        event[
                          `${team.key}_duties`
                        ]
                      )}
                    </p>

                  </div>
                `
              )
              .join("")
          : `
              <p class="muted">
                ยังไม่มีงานที่ได้รับมอบหมายใน Event
              </p>
            `
      }

    </div>
  `;
}

/* =========================================================
   OPEN FORM
   ========================================================= */

function openForm(
  row = null
) {
  const dialog =
    document.querySelector(
      "#eventDialog"
    );

  if (!dialog) {
    return;
  }

  editingId =
    row?.id || null;

  const dialogTitle =
    document.querySelector(
      "#eventDialogTitle"
    );

  if (dialogTitle) {
    dialogTitle.textContent =
      row
        ? "แก้ไข Event"
        : "สร้าง Event";
  }

  setValue(
    "#eventTitle",
    row?.title || ""
  );

  setValue(
    "#eventDate",
    row?.event_date ||
      getTodayLocal()
  );

  setValue(
    "#eventTime",
    row?.start_time
      ?.slice(0, 5) ||
      ""
  );

  setValue(
    "#eventLocation",
    row?.location || ""
  );

  setValue(
    "#eventStatus",
    allowedStatuses.includes(
      row?.status
    )
      ? row.status
      : "draft"
  );

  teams.forEach((team) => {
    setValue(
      `#${team.key}Duties`,
      row?.[
        `${team.key}_duties`
      ] || ""
    );
  });

  dialog.showModal();
}

function setValue(
  selector,
  value
) {
  const element =
    document.querySelector(
      selector
    );

  if (element) {
    element.value =
      value ?? "";
  }
}

/* =========================================================
   SAVE EVENT
   ========================================================= */

async function saveEvent(
  event
) {
  event.preventDefault();

  const allowed =
    await requireAAL2();

  if (!allowed) {
    return;
  }

  const button =
    document.querySelector(
      "#saveEventBtn"
    );

  const title =
    document
      .querySelector(
        "#eventTitle"
      )
      ?.value
      .trim();

  const eventDate =
    document
      .querySelector(
        "#eventDate"
      )
      ?.value;

  const status =
    document
      .querySelector(
        "#eventStatus"
      )
      ?.value;

  if (!title) {
    notify(
      "กรุณากรอกชื่อ Event",
      true
    );
    return;
  }

  if (!eventDate) {
    notify(
      "กรุณาระบุวันที่ Event",
      true
    );
    return;
  }

  if (
    !allowedStatuses.includes(
      status
    )
  ) {
    notify(
      "สถานะ Event ไม่ถูกต้อง",
      true
    );
    return;
  }

  if (button) {
    button.disabled = true;
    button.textContent =
      "กำลังบันทึก...";
  }

  const payload = {
    title,

    event_date:
      eventDate,

    start_time:
      document.querySelector(
        "#eventTime"
      )?.value ||
      null,

    location:
      document
        .querySelector(
          "#eventLocation"
        )
        ?.value
        .trim() ||
      null,

    status,
  };

  teams.forEach((team) => {
    payload[
      `${team.key}_duties`
    ] =
      document
        .querySelector(
          `#${team.key}Duties`
        )
        ?.value
        .trim() ||
      null;
  });

  let result;

  if (editingId) {
    result =
      await db
        .from("events")
        .update(payload)
        .eq(
          "id",
          editingId
        );
  } else {
    payload.created_by =
      currentUser.id;

    result =
      await db
        .from("events")
        .insert(payload);
  }

  if (button) {
    button.disabled = false;
    button.textContent =
      "บันทึก Event";
  }

  if (result.error) {
    console.error(
      "Save event:",
      result.error
    );

    notify(
      result.error.message,
      true
    );

    return;
  }

  document
    .querySelector(
      "#eventDialog"
    )
    ?.close();

  notify(
    editingId
      ? "แก้ไข Event เรียบร้อย"
      : "สร้าง Event เรียบร้อย"
  );

  editingId = null;

  await loadEvents();
}

/* =========================================================
   CANCEL EVENT
   ========================================================= */

async function cancelEvent(id) {
  if (!id) {
    return;
  }

  const confirmed =
    window.confirm(
      "ยืนยันการยกเลิก Event นี้? ข้อมูลจะยังอยู่ในรายงาน"
    );

  if (!confirmed) {
    return;
  }

  const allowed =
    await requireAAL2();

  if (!allowed) {
    return;
  }

  const {
    error,
  } = await db
    .from("events")
    .update({
      status: "cancelled",
    })
    .eq("id", id);

  if (error) {
    console.error(
      "Cancel event:",
      error
    );

    notify(
      error.message,
      true
    );

    return;
  }

  notify(
    "ยกเลิก Event เรียบร้อย"
  );

  await loadEvents();
}

/* =========================================================
   DATE HELPERS
   ========================================================= */

function formatShortDate(
  value
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(
      `${value}T00:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "th-TH",
    {
      day: "2-digit",
      month: "short",
    }
  );
}

function formatFullDate(
  value
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(
      `${value}T00:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "th-TH"
  );
}

function getTodayLocal() {
  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      now.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* =========================================================
   START
   ========================================================= */

setup();
