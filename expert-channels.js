import { db } from "./auth.js";
import { requireUser } from "./auth-guard.js";

/* =========================================================
   ROCK YOUR BODY 2026
   EXPERT CHANNELS
   ========================================================= */

const channels = {
  nutrition: [
    "🥗",
    "นักโภชนาการ",
    "อาหาร โภชนาการ และเมนูสุขภาพ",
  ],

  physio: [
    "🧘",
    "กายภาพ",
    "การเคลื่อนไหว ออกกำลังกาย และอาการบาดเจ็บ",
  ],

  doctor: [
    "🩺",
    "แพทย์",
    "คำถามสุขภาพ การคัดกรอง และแนวทางพบแพทย์",
  ],
};

const labels = {
  chat: "พูดคุย",
  question: "คำถาม",
  answer: "คำตอบ",
  event: "กิจกรรม",
  video: "วิดีโอ",
};

const normalPostTypes = [
  "chat",
  "question",
];

const adminPostTypes = [
  "event",
  "video",
];

let user = null;
let profile = null;
let posts = [];

let current =
  "nutrition";

let filter =
  "all";

let realtimeChannel =
  null;

const $ = (selector) =>
  document.querySelector(selector);

const all = (selector) =>
  [
    ...document.querySelectorAll(
      selector
    ),
  ];

/* =========================================================
   SAFE HTML
   ========================================================= */

function safe(value) {
  const node =
    document.createElement("div");

  node.textContent =
    String(value ?? "");

  return node.innerHTML;
}

/* =========================================================
   SAFE URL
   ========================================================= */

function safeUrl(value) {
  try {
    const url =
      new URL(value);

    if (
      ![
        "http:",
        "https:",
      ].includes(
        url.protocol
      )
    ) {
      return "#";
    }

    return url.href;
  } catch {
    return "#";
  }
}

/* =========================================================
   MESSAGE
   ========================================================= */

function message(
  text,
  error = false
) {
  const notice =
    $("#notice");

  if (!notice) {
    if (error) {
      console.error(text);
    } else {
      console.log(text);
    }

    return;
  }

  notice.textContent =
    text;

  notice.className =
    `message ${
      error
        ? "bad"
        : "good"
    }`;
}

/* =========================================================
   MARKUP
   ========================================================= */

function markup() {
  return `
    <section
      id="channels"
      class="view hidden"
    >

      <div class="channel-hero">

        <div>

          <span class="badge">
            EXPERT CHANNELS
          </span>

          <h1>
            พูดคุยกับทีมผู้เชี่ยวชาญ
          </h1>

          <p class="muted">
            ถาม–ตอบ ติดตามกิจกรรม
            และรับชมสื่อสุขภาพในแต่ละช่อง
          </p>

        </div>


        <button
          id="composePostBtn"
          type="button"
        >
          + สร้างโพสต์
        </button>

      </div>


      <div class="channel-layout">

        <nav class="channel-nav">

          ${Object.entries(
            channels
          )
            .map(
              (
                [
                  key,
                  channel,
                ]
              ) => `
                <button
                  type="button"
                  data-channel="${key}"
                >

                  <span>
                    ${channel[0]}
                  </span>

                  <div>

                    <strong>
                      ${safe(
                        channel[1]
                      )}
                    </strong>

                    <small>
                      ${safe(
                        channel[2]
                      )}
                    </small>

                  </div>

                </button>
              `
            )
            .join("")}

        </nav>


        <div class="channel-stream">

          <div
            id="channelHeader"
            class="channel-header card"
          ></div>


          <div class="feed-tabs">

            <button
              type="button"
              data-feed="all"
              class="active"
            >
              ทั้งหมด
            </button>

            <button
              type="button"
              data-feed="question"
            >
              คำถาม
            </button>

            <button
              type="button"
              data-feed="event"
            >
              กิจกรรม
            </button>

            <button
              type="button"
              data-feed="video"
            >
              วิดีโอ
            </button>

          </div>


          <div
            id="channelFeed"
            class="channel-feed"
          ></div>

        </div>

      </div>

    </section>


    <!-- CREATE POST -->

    <dialog
      id="postDialog"
      class="post-dialog"
    >

      <form id="postForm">

        <div class="post-dialog-head">

          <div>

            <span class="badge">
              CHANNEL POST
            </span>

            <h2 id="postDialogTitle">
              สร้างโพสต์
            </h2>

          </div>


          <button
            type="button"
            class="secondary close-post"
            aria-label="ปิด"
          >
            ×
          </button>

        </div>


        <label>

          ประเภท

          <select id="postType">

            <option value="chat">
              พูดคุย
            </option>

            <option value="question">
              ถามคำถาม
            </option>

          </select>

        </label>


        <label>

          หัวข้อ

          <input
            id="postTitle"
            maxlength="180"
          >

        </label>


        <label>

          รายละเอียด

          <textarea
            id="postBody"
            rows="5"
            maxlength="4000"
            required
          ></textarea>

        </label>


        <label
          id="mediaUrlLabel"
          class="hidden"
        >

          ลิงก์วิดีโอ

          <input
            id="postMediaUrl"
            type="url"
            maxlength="1000"
          >

        </label>


        <div class="actions">

          <button
            type="submit"
          >
            เผยแพร่
          </button>

          <button
            type="button"
            class="secondary close-post"
          >
            ยกเลิก
          </button>

        </div>

      </form>

    </dialog>


    <!-- REPLY -->

    <dialog
      id="replyDialog"
      class="post-dialog"
    >

      <form id="replyForm">

        <h2>
          ตอบกลับ
        </h2>


        <input
          id="replyParent"
          type="hidden"
        >


        <textarea
          id="replyBody"
          rows="4"
          maxlength="4000"
          required
        ></textarea>


        <div class="actions">

          <button
            type="submit"
          >
            ส่งคำตอบ
          </button>

          <button
            type="button"
            class="secondary close-reply"
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
  user =
    await requireUser();

  if (!user) {
    return;
  }

  const {
    data,
    error,
  } =
    await db
      .from(
        "user_profiles"
      )
      .select(
        "full_name,role,status"
      )
      .eq(
        "id",
        user.id
      )
      .single();

  if (error) {
    console.error(
      "Expert channel profile:",
      error
    );

    return;
  }

  profile =
    data;

  if (
    !profile ||
    profile.status !==
      "active"
  ) {
    return;
  }

  /* =======================================================
     CSS
     ======================================================= */

  if (
    !document.querySelector(
      'link[href="./expert-channels.css"]'
    )
  ) {
    const css =
      document.createElement(
        "link"
      );

    css.rel =
      "stylesheet";

    css.href =
      "./expert-channels.css";

    document.head.appendChild(
      css
    );
  }

  const aside =
    $("aside");

  const main =
    $("main.content");

  if (!aside || !main) {
    return;
  }

  /* =======================================================
     PREVENT DUPLICATE
     ======================================================= */

  if (
    document.querySelector(
      '[data-view="channels"]'
    )
  ) {
    return;
  }

  /* =======================================================
     MENU
     ======================================================= */

  const menu =
    document.createElement(
      "button"
    );

  menu.type =
    "button";

  menu.dataset.view =
    "channels";

  menu.textContent =
    "ช่องผู้เชี่ยวชาญ";

  aside.appendChild(
    menu
  );

  main.insertAdjacentHTML(
    "beforeend",
    markup()
  );

  /* =======================================================
     ADMIN CONTENT TYPES
     ======================================================= */

  if (
    profile.role ===
    "admin"
  ) {
    $("#postType")
      ?.insertAdjacentHTML(
        "beforeend",
        `
          <option value="event">
            ประกาศกิจกรรม
          </option>

          <option value="video">
            สื่อวิดีโอ
          </option>
        `
      );
  }

  /* =======================================================
     SIDEBAR
     ======================================================= */

  menu.onclick =
    async () => {
      all(".view")
        .forEach(
          (view) => {
            view.classList.add(
              "hidden"
            );
          }
        );

      $("#channels")
        ?.classList.remove(
          "hidden"
        );

      all(
        "aside button"
      ).forEach(
        (button) => {
          button.classList.remove(
            "active"
          );
        }
      );

      menu.classList.add(
        "active"
      );

      await load();
    };

  /* =======================================================
     CHANNEL SWITCH
     ======================================================= */

  all(
    "[data-channel]"
  ).forEach(
    (button) => {
      button.onclick =
        async () => {
          const channel =
            button.dataset.channel;

          if (
            !channels[channel]
          ) {
            return;
          }

          current =
            channel;

          await load();
        };
    }
  );

  /* =======================================================
     FILTER
     ======================================================= */

  all(
    "[data-feed]"
  ).forEach(
    (button) => {
      button.onclick =
        () => {
          filter =
            button.dataset.feed;

          all(
            "[data-feed]"
          ).forEach(
            (item) => {
              item.classList.toggle(
                "active",
                item === button
              );
            }
          );

          render();
        };
    }
  );

  /* =======================================================
     COMPOSER
     ======================================================= */

  const composeButton =
    $("#composePostBtn");

  if (composeButton) {
    composeButton.onclick =
      openComposer;
  }

  /* =======================================================
     CLOSE POST
     ======================================================= */

  all(
    ".close-post"
  ).forEach(
    (button) => {
      button.onclick =
        () => {
          $("#postDialog")
            ?.close();
        };
    }
  );

  /* =======================================================
     CLOSE REPLY
     ======================================================= */

  all(
    ".close-reply"
  ).forEach(
    (button) => {
      button.onclick =
        () => {
          $("#replyDialog")
            ?.close();
        };
    }
  );

  /* =======================================================
     POST TYPE
     ======================================================= */

  const postType =
    $("#postType");

  if (postType) {
    postType.onchange =
      (event) => {
        $("#mediaUrlLabel")
          ?.classList.toggle(
            "hidden",
            event.target
              .value !==
              "video"
          );
      };
  }

  /* =======================================================
     FORMS
     ======================================================= */

  const postForm =
    $("#postForm");

  if (postForm) {
    postForm.onsubmit =
      createPost;
  }

  const replyForm =
    $("#replyForm");

  if (replyForm) {
    replyForm.onsubmit =
      createReply;
  }

  header();

  setupRealtime();
}

/* =========================================================
   LOAD
   ========================================================= */

async function load() {
  header();

  const {
    data,
    error,
  } =
    await db
      .from(
        "channel_posts"
      )
      .select("*")
      .eq(
        "channel",
        current
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(150);

  if (error) {
    console.error(
      "Load channel posts:",
      error
    );

    message(
      error.message,
      true
    );

    return;
  }

  posts =
    data || [];

  render();
}

/* =========================================================
   HEADER
   ========================================================= */

function header() {
  const channel =
    channels[current];

  if (!channel) {
    return;
  }

  all(
    "[data-channel]"
  ).forEach(
    (button) => {
      button.classList.toggle(
        "active",
        button.dataset
          .channel ===
          current
      );
    }
  );

  const node =
    $("#channelHeader");

  if (!node) {
    return;
  }

  node.innerHTML = `
    <span class="channel-icon">
      ${channel[0]}
    </span>

    <div>

      <h2>
        Channel
        ${safe(channel[1])}
      </h2>

      <p>
        ${safe(channel[2])}
      </p>

    </div>

    <span class="live-dot">
      LIVE
    </span>
  `;
}

/* =========================================================
   RENDER
   ========================================================= */

function render() {
  const feed =
    $("#channelFeed");

  if (!feed) {
    return;
  }

  const roots =
    posts.filter(
      (post) =>
        !post.parent_id &&
        (
          filter === "all" ||
          post.content_type ===
            filter
        )
    );

  feed.innerHTML =
    roots.length
      ? roots
          .map(card)
          .join("")
      : `
          <div class="card empty-channel">

            <strong>
              ยังไม่มีเนื้อหาในหมวดนี้
            </strong>

            <p class="muted">
              เริ่มพูดคุยหรือส่งคำถามแรกได้เลย
            </p>

          </div>
        `;

  all(
    "[data-reply]"
  ).forEach(
    (button) => {
      button.onclick =
        () => {
          openReply(
            button.dataset.reply
          );
        };
    }
  );

  all(
    "[data-delete-post]"
  ).forEach(
    (button) => {
      button.onclick =
        () => {
          deletePost(
            button.dataset
              .deletePost
          );
        };
    }
  );
}

/* =========================================================
   POST CARD
   ========================================================= */

function card(post) {
  const author =
    post.author_name ||
    "สมาชิก";

  const replies =
    posts
      .filter(
        (reply) =>
          String(
            reply.parent_id
          ) ===
          String(
            post.id
          )
      )
      .sort(
        (a, b) =>
          new Date(
            a.created_at
          ) -
          new Date(
            b.created_at
          )
      );

  const canDelete =
    String(
      post.created_by
    ) ===
      String(user.id) ||
    profile.role ===
      "admin";

  const typeLabel =
    labels[
      post.content_type
    ] ||
    post.content_type ||
    "-";

  let video = "";

  if (
    post.content_type ===
      "video" &&
    post.media_url
  ) {
    const url =
      safeUrl(
        post.media_url
      );

    if (
      url !== "#"
    ) {
      video = `
        <a
          class="video-link"
          href="${safe(url)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          ▶ เปิดชมวิดีโอ
        </a>
      `;
    }
  }

  return `
    <article
      class="channel-post card type-${safe(
        post.content_type
      )}"
    >

      <div class="post-top">

        <div class="avatar">
          ${safe(
            author
          ).slice(0, 1)}
        </div>

        <div>

          <strong>
            ${safe(author)}
          </strong>

          <small>
            ${formatDateTime(
              post.created_at
            )}
          </small>

        </div>

        <span class="post-type">
          ${safe(typeLabel)}
        </span>

      </div>


      ${
        post.title
          ? `
              <h3>
                ${safe(
                  post.title
                )}
              </h3>
            `
          : ""
      }


      <p class="post-body">
        ${safe(post.body)}
      </p>


      ${video}


      <div class="post-tools">

        <button
          type="button"
          data-reply="${safe(
            post.id
          )}"
          class="secondary"
        >
          ตอบกลับ (${replies.length})
        </button>


        ${
          canDelete
            ? `
                <button
                  type="button"
                  data-delete-post="${safe(
                    post.id
                  )}"
                  class="text-danger"
                >
                  ลบ
                </button>
              `
            : ""
        }

      </div>


      ${
        replies.length
          ? `
              <div class="replies">

                ${replies
                  .map(
                    (reply) => `
                      <div>

                        <strong>
                          ${safe(
                            reply.author_name ||
                              "สมาชิก"
                          )}
                        </strong>

                        <span>
                          ${formatDateTime(
                            reply.created_at
                          )}
                        </span>

                        <p>
                          ${safe(
                            reply.body
                          )}
                        </p>

                      </div>
                    `
                  )
                  .join("")}

              </div>
            `
          : ""
      }

    </article>
  `;
}

/* =========================================================
   OPEN COMPOSER
   ========================================================= */

function openComposer() {
  const form =
    $("#postForm");

  if (!form) {
    return;
  }

  form.reset();

  $("#mediaUrlLabel")
    ?.classList.add(
      "hidden"
    );

  const title =
    $("#postDialogTitle");

  if (title) {
    title.textContent =
      `โพสต์ใน Channel ${
        channels[current][1]
      }`;
  }

  $("#postDialog")
    ?.showModal();
}

/* =========================================================
   CREATE POST
   ========================================================= */

async function createPost(
  event
) {
  event.preventDefault();

  const type =
    $("#postType")
      ?.value;

  const title =
    $("#postTitle")
      ?.value
      .trim() ||
    null;

  const body =
    $("#postBody")
      ?.value
      .trim();

  if (!body) {
    message(
      "กรุณากรอกรายละเอียดโพสต์",
      true
    );

    return;
  }

  const normalType =
    normalPostTypes.includes(
      type
    );

  const adminType =
    adminPostTypes.includes(
      type
    );

  if (
    !normalType &&
    !adminType
  ) {
    message(
      "ประเภทโพสต์ไม่ถูกต้อง",
      true
    );

    return;
  }

  /* =======================================================
     ADMIN CONTENT
     ======================================================= */

  if (adminType) {
    if (
      profile.role !==
      "admin"
    ) {
      message(
        "เฉพาะ Admin เท่านั้นที่สามารถลงกิจกรรมหรือวิดีโอได้",
        true
      );

      return;
    }

    const allowed =
      await requireAAL2(
        "Admin ต้องยืนยัน 2FA ก่อนลงกิจกรรมหรือวิดีโอ"
      );

    if (!allowed) {
      return;
    }
  }

  /* =======================================================
     VIDEO URL
     ======================================================= */

  let mediaUrl =
    null;

  if (
    type === "video"
  ) {
    const rawUrl =
      $("#postMediaUrl")
        ?.value
        .trim();

    if (!rawUrl) {
      message(
        "กรุณากรอกลิงก์วิดีโอ",
        true
      );

      return;
    }

    if (
      safeUrl(rawUrl) ===
      "#"
    ) {
      message(
        "ลิงก์วิดีโอไม่ถูกต้อง",
        true
      );

      return;
    }

    mediaUrl =
      rawUrl;
  }

  const {
    error,
  } =
    await db
      .from(
        "channel_posts"
      )
      .insert({
        channel:
          current,

        content_type:
          type,

        title,

        body,

        media_url:
          mediaUrl,

        created_by:
          user.id,

        author_name:
          profile.full_name ||
          "สมาชิก",
      });

  if (error) {
    console.error(
      "Create post:",
      error
    );

    message(
      error.message,
      true
    );

    return;
  }

  $("#postDialog")
    ?.close();

  message(
    "เผยแพร่ใน Channel เรียบร้อย"
  );

  await load();
}

/* =========================================================
   OPEN REPLY
   ========================================================= */

function openReply(id) {
  if (!id) {
    return;
  }

  const parent =
    posts.find(
      (post) =>
        String(
          post.id
        ) ===
        String(id)
    );

  if (
    !parent ||
    parent.parent_id
  ) {
    message(
      "ไม่พบโพสต์ที่ต้องการตอบกลับ",
      true
    );

    return;
  }

  const parentInput =
    $("#replyParent");

  const replyBody =
    $("#replyBody");

  if (
    !parentInput ||
    !replyBody
  ) {
    return;
  }

  parentInput.value =
    id;

  replyBody.value =
    "";

  $("#replyDialog")
    ?.showModal();
}

/* =========================================================
   CREATE REPLY
   ========================================================= */

async function createReply(
  event
) {
  event.preventDefault();

  const parentId =
    $("#replyParent")
      ?.value;

  const body =
    $("#replyBody")
      ?.value
      .trim();

  if (
    !parentId ||
    !body
  ) {
    message(
      "กรุณากรอกข้อความตอบกลับ",
      true
    );

    return;
  }

  const parent =
    posts.find(
      (post) =>
        String(
          post.id
        ) ===
        String(parentId)
    );

  if (
    !parent ||
    parent.parent_id
  ) {
    message(
      "ไม่พบโพสต์หลัก",
      true
    );

    return;
  }

  const {
    error,
  } =
    await db
      .from(
        "channel_posts"
      )
      .insert({
        channel:
          current,

        content_type:
          "answer",

        body,

        parent_id:
          parentId,

        created_by:
          user.id,

        author_name:
          profile.full_name ||
          "สมาชิก",
      });

  if (error) {
    console.error(
      "Create reply:",
      error
    );

    message(
      error.message,
      true
    );

    return;
  }

  $("#replyDialog")
    ?.close();

  message(
    "ส่งคำตอบเรียบร้อย"
  );

  await load();
}

/* =========================================================
   DELETE POST
   ========================================================= */

async function deletePost(id) {
  if (!id) {
    return;
  }

  const post =
    posts.find(
      (item) =>
        String(
          item.id
        ) ===
        String(id)
    );

  if (!post) {
    message(
      "ไม่พบโพสต์",
      true
    );

    return;
  }

  const ownPost =
    String(
      post.created_by
    ) ===
    String(user.id);

  const isAdmin =
    profile.role ===
    "admin";

  if (
    !ownPost &&
    !isAdmin
  ) {
    message(
      "คุณไม่มีสิทธิ์ลบโพสต์นี้",
      true
    );

    return;
  }

  const confirmed =
    window.confirm(
      "ลบโพสต์นี้และคำตอบทั้งหมดหรือไม่?"
    );

  if (!confirmed) {
    return;
  }

  /*
   * Admin ลบโพสต์ของคนอื่น
   * บังคับ MFA
   */
  if (
    isAdmin &&
    !ownPost
  ) {
    const allowed =
      await requireAAL2(
        "Admin ต้องยืนยัน 2FA ก่อนลบโพสต์ของผู้ใช้อื่น"
      );

    if (!allowed) {
      return;
    }
  }

  const {
    error,
  } =
    await db
      .from(
        "channel_posts"
      )
      .delete()
      .eq(
        "id",
        id
      );

  if (error) {
    console.error(
      "Delete post:",
      error
    );

    message(
      error.message,
      true
    );

    return;
  }

  message(
    "ลบโพสต์แล้ว"
  );

  await load();
}

/* =========================================================
   MFA
   ========================================================= */

async function requireAAL2(
  customMessage =
    "กรุณายืนยัน 2FA ก่อนดำเนินการ"
) {
  const {
    data,
    error,
  } =
    await db.auth.mfa
      .getAuthenticatorAssuranceLevel();

  if (error) {
    console.error(
      "MFA assurance:",
      error
    );

    message(
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
    message(
      customMessage,
      true
    );

    return false;
  }

  return true;
}

/* =========================================================
   REALTIME
   ========================================================= */

function setupRealtime() {
  /*
   * กัน subscribe ซ้ำ
   */
  if (realtimeChannel) {
    db.removeChannel(
      realtimeChannel
    );

    realtimeChannel =
      null;
  }

  realtimeChannel =
    db
      .channel(
        `expert-channel-${user.id}`
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "channel_posts",
        },
        (payload) => {
          const changedChannel =
            payload.new
              ?.channel ||
            payload.old
              ?.channel;

          if (
            changedChannel ===
            current
          ) {
            load();
          }
        }
      )
      .subscribe();
}

/* =========================================================
   DATE
   ========================================================= */

function formatDateTime(
  value
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleString(
    "th-TH"
  );
}

/* =========================================================
   START
   ========================================================= */

setup();
