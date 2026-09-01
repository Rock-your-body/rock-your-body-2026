import { db } from "./auth.js";

const teams = [
  { key: "nutrition", icon: "🥗", title: "นักโภชนาการ", duty: "วางแผนอาหาร เมนูสุขภาพ และคำแนะนำด้านโภชนาการ" },
  { key: "physio", icon: "🧘", title: "กายภาพ", duty: "วางแผนการเคลื่อนไหว การยืดเหยียด และดูแลความปลอดภัย" },
  { key: "doctor", icon: "🩺", title: "แพทย์", duty: "คัดกรองสุขภาพ เฝ้าระวังความเสี่ยง และกำหนดแนวทางส่งต่อ" },
  { key: "developer", icon: "🛠️", title: "Admin ผู้พัฒนาระบบ", duty: "ดูแลการลงทะเบียน สิทธิ์ ระบบหน้างาน และรายงานหลังจบ Event" },
];
let currentUser;
let eventRows = [];
let editingId = null;

function notify(message, error = false) {
  const notice = document.querySelector("#notice");
  notice.textContent = message;
  notice.className = `message ${error ? "bad" : "good"}`;
}

function markup() {
  return `<section id="events" class="view hidden">
    <div class="event-heading"><div><span class="badge">ADMIN EVENT CENTER</span><h1>บริหาร Event และทีมผู้เชี่ยวชาญ</h1><p class="muted">กำหนดหน้าที่ของแต่ละทีม และติดตามสถานะจากจุดเดียว</p></div><button id="newEventBtn">+ สร้าง Event</button></div>
    <div class="specialist-grid">${teams.map(t => `<button class="specialist-card" data-specialist="${t.key}"><span>${t.icon}</span><strong>${t.title}</strong><small>${t.duty}</small></button>`).join("")}</div>
    <div id="specialistWorkspace" class="specialist-workspace card"></div>
    <div class="event-list-head"><div><h2>Event ทั้งหมด</h2><p class="muted" id="eventCount"></p></div></div>
    <div id="eventCards" class="event-cards"></div>
  </section>
  <dialog id="eventDialog" class="event-dialog"><form id="eventForm">
    <div class="event-form-head"><div><span class="badge">EVENT</span><h2 id="eventDialogTitle">สร้าง Event</h2></div><button type="button" class="close-event secondary" aria-label="ปิด">×</button></div>
    <div class="event-form-grid"><label class="wide">ชื่อ Event<input id="eventTitle" maxlength="180" required></label><label>วันที่<input id="eventDate" type="date" required></label><label>เวลาเริ่ม<input id="eventTime" type="time"></label><label class="wide">สถานที่<input id="eventLocation" maxlength="250"></label><label>สถานะ<select id="eventStatus"><option value="draft">ฉบับร่าง</option><option value="published">ประกาศแล้ว</option><option value="completed">เสร็จสิ้น</option><option value="cancelled">ยกเลิก</option></select></label></div>
    <h3>มอบหมายหน้าที่แต่ละ Admin</h3>
    <div class="duty-grid">${teams.map(t => `<label><span>${t.icon} ${t.title}</span><textarea id="${t.key}Duties" rows="3" placeholder="${t.duty}"></textarea></label>`).join("")}</div>
    <div class="actions"><button id="saveEventBtn">บันทึก Event</button><button type="button" class="close-event secondary">ยกเลิก</button></div>
  </form></dialog>`;
}

async function setup() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) return;
  currentUser = session.user;
  const { data: profile } = await db.from("user_profiles").select("role,status").eq("id", currentUser.id).single();
  if (profile?.role !== "admin" || profile?.status !== "active") return;
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "./admin-events.css";
  document.head.appendChild(css);
  const menu = document.createElement("button");
  menu.className = "admin-only";
  menu.dataset.view = "events";
  menu.textContent = "Event Center";
  document.querySelector("aside").appendChild(menu);
  document.querySelector("main.content").insertAdjacentHTML("beforeend", markup());
  menu.onclick = async () => {
    document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
    document.querySelector("#events").classList.remove("hidden");
    document.querySelectorAll("aside button").forEach(b => b.classList.remove("active"));
    menu.classList.add("active");
    await loadEvents();
  };
  document.querySelector("#newEventBtn").onclick = () => openForm();
  document.querySelectorAll(".close-event").forEach(b => { b.onclick = () => document.querySelector("#eventDialog").close(); });
  document.querySelector("#eventForm").onsubmit = saveEvent;
  document.querySelectorAll("[data-specialist]").forEach(b => { b.onclick = () => renderTeam(b.dataset.specialist); });
  renderTeam("nutrition");
}

async function loadEvents() {
  const { data: aal } = await db.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel !== "aal2") {
    notify("กรุณายืนยัน 2FA ที่เมนู ความปลอดภัย / 2FA ก่อนเปิด Event Center", true);
    eventRows = [];
    renderEvents();
    return;
  }
  const { data, error } = await db.from("events").select("*").order("event_date", { ascending: false });
  if (error) return notify(error.message, true);
  eventRows = data || [];
  renderEvents();
}

function renderEvents() {
  const labels = { draft: "ฉบับร่าง", published: "ประกาศแล้ว", completed: "เสร็จสิ้น", cancelled: "ยกเลิก" };
  document.querySelector("#eventCount").textContent = `${eventRows.length} รายการ`;
  document.querySelector("#eventCards").innerHTML = eventRows.length ? eventRows.map(e => `
    <article class="event-card card"><div class="event-date"><strong>${new Date(e.event_date + "T00:00:00").toLocaleDateString("th-TH", { day: "2-digit", month: "short" })}</strong><span>${e.start_time?.slice(0,5) || "ทั้งวัน"}</span></div>
    <div class="event-main"><span class="event-status ${e.status}">${labels[e.status]}</span><h3>${safe(e.title)}</h3><p>📍 ${safe(e.location || "ยังไม่ระบุสถานที่")}</p><div class="event-duty-summary">${teams.map(t => `<span>${t.icon} ${e[t.key + "_duties"] ? "มอบหมายแล้ว" : "รอมอบหมาย"}</span>`).join("")}</div></div>
    <div class="event-actions"><button data-edit-event="${e.id}">แก้ไข</button><button class="danger" data-cancel-event="${e.id}" ${e.status === "cancelled" ? "disabled" : ""}>ยกเลิก</button></div></article>`).join("") : `<div class="empty-event card"><strong>ยังไม่มี Event</strong><p class="muted">กด “สร้าง Event” เพื่อเริ่มมอบหมายงาน</p></div>`;
  document.querySelectorAll("[data-edit-event]").forEach(b => { b.onclick = () => openForm(eventRows.find(e => e.id === b.dataset.editEvent)); });
  document.querySelectorAll("[data-cancel-event]").forEach(b => { b.onclick = () => cancelEvent(b.dataset.cancelEvent); });
  const activeTeam = document.querySelector("[data-specialist].active")?.dataset.specialist || "nutrition";
  renderTeam(activeTeam);
}

function renderTeam(key) {
  const team = teams.find(t => t.key === key);
  document.querySelectorAll("[data-specialist]").forEach(b => b.classList.toggle("active", b.dataset.specialist === key));
  const assignments = eventRows.filter(e => e[team.key + "_duties"] && e.status !== "cancelled");
  document.querySelector("#specialistWorkspace").innerHTML = `<div class="workspace-title"><span class="workspace-icon">${team.icon}</span><div><h2>หน้าของ${team.title}</h2><p class="muted">${team.duty}</p></div></div><div class="assignment-list">${assignments.length ? assignments.map(e => `<div><strong>${safe(e.title)}</strong><span>${new Date(e.event_date + "T00:00:00").toLocaleDateString("th-TH")}</span><p>${safe(e[team.key + "_duties"])}</p></div>`).join("") : "<p class='muted'>ยังไม่มีงานที่ได้รับมอบหมายใน Event</p>"}</div>`;
}

function openForm(row = null) {
  editingId = row?.id || null;
  document.querySelector("#eventDialogTitle").textContent = row ? "แก้ไข Event" : "สร้าง Event";
  document.querySelector("#eventTitle").value = row?.title || "";
  document.querySelector("#eventDate").value = row?.event_date || new Date().toISOString().slice(0,10);
  document.querySelector("#eventTime").value = row?.start_time?.slice(0,5) || "";
  document.querySelector("#eventLocation").value = row?.location || "";
  document.querySelector("#eventStatus").value = row?.status || "draft";
  teams.forEach(t => { document.querySelector(`#${t.key}Duties`).value = row?.[t.key + "_duties"] || ""; });
  document.querySelector("#eventDialog").showModal();
}

async function saveEvent(event) {
  event.preventDefault();
  const button = document.querySelector("#saveEventBtn");
  button.disabled = true;
  const payload = { title: document.querySelector("#eventTitle").value.trim(), event_date: document.querySelector("#eventDate").value, start_time: document.querySelector("#eventTime").value || null, location: document.querySelector("#eventLocation").value.trim() || null, status: document.querySelector("#eventStatus").value, created_by: currentUser.id };
  teams.forEach(t => { payload[t.key + "_duties"] = document.querySelector(`#${t.key}Duties`).value.trim() || null; });
  const query = editingId ? db.from("events").update(payload).eq("id", editingId) : db.from("events").insert(payload);
  const { error } = await query;
  button.disabled = false;
  if (error) return notify(error.message, true);
  document.querySelector("#eventDialog").close();
  notify(editingId ? "แก้ไข Event เรียบร้อย" : "สร้าง Event เรียบร้อย");
  await loadEvents();
}

async function cancelEvent(id) {
  if (!window.confirm("ยืนยันการยกเลิก Event นี้? ข้อมูลจะยังอยู่ในรายงาน")) return;
  const { error } = await db.from("events").update({ status: "cancelled" }).eq("id", id);
  if (error) return notify(error.message, true);
  notify("ยกเลิก Event เรียบร้อย");
  await loadEvents();
}

function safe(value) {
  const node = document.createElement("div");
  node.textContent = String(value ?? "");
  return node.innerHTML;
}

setup();
