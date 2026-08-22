const CFG = window.APP_CONFIG;
const $ = id => document.getElementById(id);
const num = (v,f=0) => Number.isFinite(Number(v)) ? Number(v) : f;
const fmtInt = v => Math.round(num(v)).toLocaleString('en-US');
const fmtWeight = v => (v === null || v === undefined || v === '' || !Number.isFinite(Number(v))) ? '--.-' : Number(v).toFixed(1);
const pct = (v,m) => m > 0 ? Math.max(0,Math.min(100,num(v)/num(m)*100)) : 0;

function showStatus(text, error=false){
  const s=$('status'); if(!s) return;
  s.textContent=text; s.className='status show'+(error?' error':'');
}
function hideStatus(){ const s=$('status'); if(s) s.className='status'; }

async function initLiff(){
  await liff.init({liffId: CFG.LIFF_ID});
  if(!liff.isLoggedIn()){
    liff.login({redirectUri: location.href});
    return false;
  }
  if(!liff.getIDToken()) throw new Error('ไม่พบ LINE ID Token');
  return true;
}

async function fetchDashboard(){
  const idToken=liff.getIDToken();
  if(!idToken) throw new Error('ไม่พบ LINE ID Token');
  const res=await fetch(CFG.PLAYER_API,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action:'dashboard',idToken})
  });
  const text=await res.text();
  let data;
  try{ data=JSON.parse(text); }catch{ throw new Error('API ตอบกลับไม่ถูกต้อง'); }
  if(!res.ok || data.success===false) throw new Error(data.error||'โหลดข้อมูลไม่สำเร็จ');
  return data;
}

function normalize(raw){
  const player=raw.player||raw.user||{};
  const weight=raw.weight||{};
  const energy=(raw.energy&&typeof raw.energy==='object')?raw.energy:{};
  let totalExp=raw.exp;
  if(totalExp&&typeof totalExp==='object') totalExp=totalExp.current;
  totalExp=num(totalExp ?? player.exp,0);
  const levelByExp=Math.floor(totalExp/CFG.EXP_PER_LEVEL)+1;
  return {
    player:{
      picture: player.pictureUrl ?? player.picture_url ?? raw.pictureUrl ?? '',
      level: Math.max(levelByExp,num(raw.level ?? player.level,levelByExp)),
      exp: totalExp,
      coin: num(raw.rockCoin ?? player.rockCoin ?? player.rock_coin,0),
      energy: num(energy.current ?? raw.energyCurrent ?? player.energy,0),
      maxEnergy: num(energy.max ?? raw.maxEnergy ?? player.max_energy ?? player.maxEnergy,CFG.MAX_ENERGY),
      currentWeight: weight.current ?? raw.currentWeight ?? player.current_weight ?? null,
      targetWeight: weight.target ?? raw.targetWeight ?? player.target_weight ?? null,
      startWeight: weight.start ?? raw.startWeight ?? player.start_weight ?? null,
      startDate: weight.startDate ?? raw.startDate ?? player.start_date ?? null,
      updatedAt: weight.updatedAt ?? raw.weightUpdatedAt ?? player.weight_updated_at ?? null
    },
    missions: raw.missions||{},
    battle: raw.battle||{}
  };
}

function go(url){ location.href=url; }
function formatDate(v){
  if(!v) return '--/--/----';
  const d=new Date(v); if(Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString('th-TH',{day:'2-digit',month:'2-digit',year:'numeric'});
}
