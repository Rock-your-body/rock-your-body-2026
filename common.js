const CFG = window.APP_CONFIG;

const $ = id => document.getElementById(id);

const num = (v, f = 0) =>
  Number.isFinite(Number(v))
    ? Number(v)
    : f;

const nullableNum = v => {
  if (
    v === null ||
    v === undefined ||
    v === ''
  ) {
    return null;
  }

  const n = Number(v);

  return Number.isFinite(n)
    ? n
    : null;
};

const fmtInt = v => {
  const n = nullableNum(v);

  return n === null
    ? '--'
    : Math.round(n).toLocaleString('en-US');
};

const fmtWeight = v => {
  const n = nullableNum(v);

  return n === null
    ? '--.-'
    : n.toFixed(1);
};

const pct = (v, m) => {
  const value = num(v, 0);
  const max = num(m, 0);

  if (max <= 0) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      100,
      (value / max) * 100
    )
  );
};


/* ======================================================
   STATUS
====================================================== */

function showStatus(text, error = false) {
  const s = $('status');

  if (!s) return;

  s.textContent = text;

  s.className =
    'status show' +
    (error ? ' error' : '');
}

function hideStatus() {
  const s = $('status');

  if (s) {
    s.className = 'status';
  }
}


/* ======================================================
   UI HELPERS
====================================================== */

function setText(id, value) {
  const el = $(id);

  if (!el) return;

  const text =
    value === null ||
    value === undefined ||
    value === ''
      ? '--'
      : String(value);

  el.textContent = text;

  const emptyValues = [
    '--',
    '--.-',
    '-- / --',
    '--/--',
    '--%',
    '--/--/----'
  ];

  if (emptyValues.includes(text)) {
    el.classList.add('is-empty');
  } else {
    el.classList.remove('is-empty');
  }
}

function setBar(id, value, max) {
  const el = $(id);

  if (!el) return;

  el.style.width =
    pct(value, max) + '%';
}

function setImage(id, src, fallbackId = null) {
  const img = $(id);

  if (!img) return;

  if (src) {
    img.src = src;
    img.style.display = 'block';

    if (fallbackId && $(fallbackId)) {
      $(fallbackId).style.display = 'none';
    }
  } else {
    img.removeAttribute('src');
    img.style.display = 'none';

    if (fallbackId && $(fallbackId)) {
      $(fallbackId).style.display = 'flex';
    }
  }
}


/* ======================================================
   DATE
====================================================== */

function formatDate(v) {
  if (!v) {
    return '--/--/----';
  }

  const d = new Date(v);

  if (Number.isNaN(d.getTime())) {
    return String(v);
  }

  return d.toLocaleDateString(
    'th-TH',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }
  );
}


/* ======================================================
   LIFF
====================================================== */

async function initLiff() {
  await liff.init({
    liffId: CFG.LIFF_ID
  });

  if (!liff.isLoggedIn()) {
    liff.login({
      redirectUri: location.href
    });

    return false;
  }

  if (!liff.getIDToken()) {
    throw new Error(
      'ไม่พบ LINE ID Token'
    );
  }

  return true;
}


/* ======================================================
   API
====================================================== */

async function fetchDashboard() {
  const idToken =
    liff.getIDToken();

  if (!idToken) {
    throw new Error(
      'ไม่พบ LINE ID Token'
    );
  }

  const res =
    await fetch(
      CFG.PLAYER_API,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json'
        },

        body:
          JSON.stringify({
            action: 'dashboard',
            idToken
          })
      }
    );

  const text =
    await res.text();

  let data;

  try {
    data =
      JSON.parse(text);
  } catch {
    throw new Error(
      'API ตอบกลับไม่ถูกต้อง'
    );
  }

  if (
    !res.ok ||
    data.success === false
  ) {
    throw new Error(
      data.error ||
      'โหลดข้อมูลไม่สำเร็จ'
    );
  }

  return data;
}


/* ======================================================
   NORMALIZE
====================================================== */

function normalize(raw = {}) {
  const player =
    raw.player ||
    raw.user ||
    {};

  const weight =
    raw.weight ||
    {};

  const energy =
    (
      raw.energy &&
      typeof raw.energy === 'object'
    )
      ? raw.energy
      : {};

  let totalExp =
    raw.exp;

  if (
    totalExp &&
    typeof totalExp === 'object'
  ) {
    totalExp =
      totalExp.current;
  }

  totalExp =
    num(
      totalExp ??
      player.exp,
      0
    );

  const expPerLevel =
    num(
      raw.expPerLevel ??
      CFG.EXP_PER_LEVEL,
      500
    );

  const levelByExp =
    Math.floor(
      totalExp /
      expPerLevel
    ) + 1;

  const currentWeight =
    nullableNum(
      weight.current ??
      raw.currentWeight ??
      player.current_weight
    );

  const targetWeight =
    nullableNum(
      weight.target ??
      raw.targetWeight ??
      player.target_weight
    );

  const startWeight =
    nullableNum(
      weight.start ??
      raw.startWeight ??
      player.start_weight
    );

  let remaining = null;

  if (
    currentWeight !== null &&
    targetWeight !== null
  ) {
    remaining =
      Math.max(
        0,
        currentWeight -
        targetWeight
      );
  }

  let lostWeight = null;

  if (
    startWeight !== null &&
    currentWeight !== null
  ) {
    lostWeight =
      Math.max(
        0,
        startWeight -
        currentWeight
      );
  }

  return {
    player: {
      picture:
        player.pictureUrl ??
        player.picture_url ??
        raw.pictureUrl ??
        '',

      displayName:
        player.displayName ??
        player.display_name ??
        'ROCK HERO',

      level:
        Math.max(
          levelByExp,
          num(
            raw.level ??
            player.level,
            levelByExp
          )
        ),

      exp:
        totalExp,

      expPerLevel:
        expPerLevel,

      coin:
        num(
          raw.rockCoin ??
          player.rockCoin ??
          player.rock_coin,
          0
        ),

      energy:
        num(
          energy.current ??
          raw.energyCurrent ??
          player.energy,
          0
        ),

      maxEnergy:
        num(
          energy.max ??
          raw.maxEnergy ??
          player.max_energy ??
          player.maxEnergy,
          CFG.MAX_ENERGY
        ),

      currentWeight,
      targetWeight,
      startWeight,

      remaining,
      lostWeight,

      startDate:
        weight.startDate ??
        raw.startDate ??
        player.start_date ??
        null,

      updatedAt:
        weight.updatedAt ??
        raw.weightUpdatedAt ??
        player.weight_updated_at ??
        null
    },

    missions:
      raw.missions || {},

    battle:
      raw.battle || {}
  };
}


/* ======================================================
   NAVIGATION
====================================================== */

function go(url) {
  if (!url) return;

  location.href = url;
}


/* ======================================================
   EXPORT GLOBAL
====================================================== */

window.ROCK = {
  CFG,
  $,

  num,
  nullableNum,
  fmtInt,
  fmtWeight,
  pct,
  formatDate,

  setText,
  setBar,
  setImage,

  showStatus,
  hideStatus,

  initLiff,
  fetchDashboard,
  normalize,

  go
};
