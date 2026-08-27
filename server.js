const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const FRONTEND_URLS = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "https://rock-your-body.github.io")
  .split(",").map(v => v.trim()).filter(Boolean);
const LINE_CHANNEL_ID = process.env.LINE_CHANNEL_ID || "";
const ADMIN_LINE_USER_IDS = new Set((process.env.ADMIN_LINE_USER_IDS || "").split(",").map(v => v.trim()).filter(Boolean));
const DEV_MODE = String(process.env.DEV_MODE || "false").toLowerCase() === "true";
const DEV_LINE_USER_ID = process.env.DEV_LINE_USER_ID || "dev-user";

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(DATA_DIR, "uploads");
const DB_FILE = process.env.DB_FILE || path.join(DATA_DIR, "rock-your-body.json");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function loadDb() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, "utf8")); }
  catch { return { users: {}, missions: {}, battles: {}, rewards: {} }; }
}
let db = loadDb();
function saveDb() {
  const tmp = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), "utf8");
  fs.renameSync(tmp, DB_FILE);
}
function now() { return new Date().toISOString(); }
function todayKey() { return new Date().toISOString().slice(0, 10); }
function num(v, fallback = 0) { const n = Number(v); return Number.isFinite(n) ? n : fallback; }
function uid() { return crypto.randomUUID(); }

app.use(cors({
  origin(origin, cb) {
    if (!origin || FRONTEND_URLS.includes(origin)) return cb(null, true);
    return cb(new Error("CORS origin not allowed"));
  },
  credentials: true
}));
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(UPLOAD_DIR));

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase();
      cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`);
    }
  }),
  limits: { fileSize: 50 * 1024 * 1024 }
});

function ensureUser(lineUserId, profile = {}) {
  if (!db.users[lineUserId]) {
    db.users[lineUserId] = {
      lineUserId,
      name: profile.name || "สมาชิก ROCK YOUR BODY",
      pictureUrl: profile.pictureUrl || null,
      rockCoin: 0,
      energy: 100,
      maxEnergy: 200,
      points: 0,
      totalExp: 0,
      level: 1,
      weight: { current: null, target: null, start: null, updatedAt: null, history: [] },
      steps: { today: 0, calories: 0, date: todayKey(), history: [] },
      sleep: { hours: 0, date: todayKey() },
      healthScore: 0,
      missionsCompleted: 0,
      battlesWon: 0,
      createdAt: now(),
      updatedAt: now()
    };
    saveDb();
  } else if (profile.name || profile.pictureUrl) {
    db.users[lineUserId].name = profile.name || db.users[lineUserId].name;
    db.users[lineUserId].pictureUrl = profile.pictureUrl || db.users[lineUserId].pictureUrl;
    db.users[lineUserId].updatedAt = now();
    saveDb();
  }
  return db.users[lineUserId];
}

async function verifyIdToken(idToken) {
  if (!idToken) {
    const err = new Error("LINE ID Token is required"); err.status = 401; throw err;
  }
  if (DEV_MODE && idToken.startsWith("DEV:")) {
    const lineUserId = idToken.slice(4) || DEV_LINE_USER_ID;
    return { sub: lineUserId, name: `DEV ${lineUserId}`, picture: null };
  }
  if (!LINE_CHANNEL_ID) {
    const err = new Error("LINE_CHANNEL_ID is not configured on Render"); err.status = 500; throw err;
  }
  const response = await fetch("https://api.line.me/oauth2/v2.1/verify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ id_token: idToken, client_id: LINE_CHANNEL_ID })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.sub) {
    const err = new Error(data.error_description || "Invalid LINE ID Token"); err.status = 401; throw err;
  }
  return data;
}

async function authFromRequest(req) {
  const token = req.body?.idToken || req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (token) return verifyIdToken(token);
  if (DEV_MODE && req.headers["x-line-user-id"]) return { sub: req.headers["x-line-user-id"], name: "DEV USER" };
  const err = new Error("LINE authentication is required"); err.status = 401; throw err;
}

function publicUser(u) {
  const level = Math.max(1, Math.floor(num(u.totalExp) / 500) + 1);
  u.level = level;
  return {
    lineUserId: u.lineUserId,
    name: u.name,
    pictureUrl: u.pictureUrl,
    rockCoin: u.rockCoin,
    energy: { current: u.energy, max: u.maxEnergy },
    points: u.points,
    totalExp: u.totalExp,
    level,
    weight: u.weight,
    steps: u.steps,
    sleep: u.sleep,
    healthScore: u.healthScore,
    missionsCompleted: u.missionsCompleted,
    battlesWon: u.battlesWon,
    updatedAt: u.updatedAt
  };
}

function rewardUser(u, reward = {}) {
  const coin = Math.max(0, Math.round(num(reward.coin ?? reward.rockCoin)));
  const energy = Math.max(0, Math.round(num(reward.energy)));
  const exp = Math.max(0, Math.round(num(reward.exp)));
  const points = Math.max(0, Math.round(num(reward.points ?? exp)));
  u.rockCoin += coin;
  u.energy = Math.min(u.maxEnergy, u.energy + energy);
  u.totalExp += exp;
  u.points += points;
  u.level = Math.floor(u.totalExp / 500) + 1;
  u.updatedAt = now();
  return { rockCoin: coin, energy, exp, points };
}

function dashboard(u) {
  const rank = Object.values(db.users).sort((a,b) => num(b.points)-num(a.points)).findIndex(x => x.lineUserId === u.lineUserId) + 1;
  return {
    ok: true,
    user: publicUser(u),
    rockCoin: u.rockCoin,
    energy: { current: u.energy, max: u.maxEnergy },
    maxEnergy: u.maxEnergy,
    points: u.points,
    rank: rank || null,
    weight: u.weight,
    steps: u.steps.today,
    calories: u.steps.calories,
    sleep: u.sleep.hours,
    healthScore: u.healthScore,
    programDay: 0,
    programTotalDays: 90,
    rewards: Object.values(db.rewards).filter(r => r.lineUserId === u.lineUserId),
    updatedAt: u.updatedAt
  };
}

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "ROCK YOUR BODY 2026 API", time: now() }));

app.get("/api/me", async (req, res) => {
  try {
    const lineUserId = req.headers["x-line-user-id"];
    if (!lineUserId) return res.status(401).json({ ok: false, message: "LINE User ID is required" });
    const u = ensureUser(lineUserId);
    return res.json({ ok: true, user: publicUser(u) });
  } catch (e) { return res.status(e.status || 500).json({ ok: false, error: e.message }); }
});

app.post("/api/me", async (req, res) => {
  try {
    const line = await authFromRequest(req);
    const u = ensureUser(line.sub, { name: line.name, pictureUrl: line.picture });
    return res.json({ ok: true, user: publicUser(u) });
  } catch (e) { return res.status(e.status || 500).json({ ok: false, error: e.message }); }
});

app.post("/api/player", async (req, res) => {
  try {
    const line = await authFromRequest(req);
    const u = ensureUser(line.sub, { name: line.name, pictureUrl: line.picture });
    const action = req.body.action || "dashboard";

    if (action === "dashboard") return res.json(dashboard(u));

    if (action === "saveWeight") {
      const weight = num(req.body.weight, NaN);
      if (!Number.isFinite(weight) || weight < 20 || weight > 400) return res.status(400).json({ ok:false, error:"น้ำหนักต้องอยู่ระหว่าง 20 - 400 kg" });
      const today = todayKey();
      const existing = u.weight.history.find(x => x.date === today);
      if (existing) return res.json({ ok:true, alreadyCheckedToday:true, weight:{...u.weight, current:existing.weight}, rewards:{coin:0,energy:0,exp:0} });
      if (u.weight.start == null) u.weight.start = weight;
      u.weight.current = weight; u.weight.updatedAt = now();
      u.weight.history.unshift({ date: today, weight, createdAt: now() });
      const rewards = rewardUser(u, { coin:10, energy:10, exp:20, points:20 });
      saveDb();
      return res.json({ ok:true, weight:u.weight, rewards });
    }

    if (action === "setTarget") {
      const target = num(req.body.targetWeight, NaN);
      if (!Number.isFinite(target) || target < 20 || target > 400) return res.status(400).json({ ok:false, error:"เป้าหมายต้องอยู่ระหว่าง 20 - 400 kg" });
      u.weight.target = target; u.weight.updatedAt = now(); u.updatedAt = now(); saveDb();
      return res.json({ ok:true, weight:u.weight });
    }

    if (action === "saveSteps") {
      const steps = Math.max(0, Math.round(num(req.body.steps)));
      if (u.steps.date !== todayKey()) u.steps = { today:0, calories:0, date:todayKey(), history:u.steps.history || [] };
      const previous = u.steps.today;
      u.steps.today = steps; u.steps.calories = Math.round(steps * 0.045);
      if (steps > previous) rewardUser(u, { coin:5, energy:5, exp:10, points:10 });
      u.steps.history = [{ date:todayKey(), steps, calories:u.steps.calories }, ...(u.steps.history || []).filter(x=>x.date!==todayKey())].slice(0,90);
      saveDb(); return res.json({ ok:true, steps:u.steps });
    }

    if (action === "saveSleep") {
      const hours = Math.max(0, Math.min(24, num(req.body.hours)));
      u.sleep = { hours, date:todayKey() }; saveDb(); return res.json({ ok:true, sleep:u.sleep });
    }

    if (action === "saveHealthScore") {
      u.healthScore = Math.max(0, Math.min(100, Math.round(num(req.body.score)))); saveDb(); return res.json({ ok:true, healthScore:u.healthScore });
    }

    if (action === "progress") return res.json({ ok:true, user:publicUser(u), weightHistory:u.weight.history, stepsHistory:u.steps.history || [] });

    if (action === "ranking") {
      const rows = Object.values(db.users).sort((a,b)=>num(b.points)-num(a.points)).map((x,i)=>({rank:i+1,lineUserId:x.lineUserId,name:x.name,points:x.points,rockCoin:x.rockCoin,level:x.level}));
      return res.json({ ok:true, ranking:rows, myRank:rows.find(x=>x.lineUserId===u.lineUserId)?.rank || null });
    }

    if (action === "rewards") return res.json({ ok:true, rewards:Object.values(db.rewards).filter(r=>r.lineUserId===u.lineUserId) });

    if (action === "claimReward") {
      const rewardId = String(req.body.rewardId || "");
      const r = db.rewards[rewardId];
      if (!r || r.lineUserId !== u.lineUserId) return res.status(404).json({ok:false,error:"ไม่พบรางวัล"});
      if (r.claimedAt) return res.json({ok:true,alreadyClaimed:true,reward:r});
      r.claimedAt = now(); saveDb(); return res.json({ok:true,reward:r});
    }

    return res.status(400).json({ ok:false, error:`Unknown player action: ${action}` });
  } catch (e) { console.error("PLAYER API ERROR", e); return res.status(e.status || 500).json({ ok:false, error:e.message }); }
});

app.get("/api/dashboard", async (req,res)=>{
  try { const line = await authFromRequest(req); const u=ensureUser(line.sub,{name:line.name,pictureUrl:line.picture}); return res.json(dashboard(u)); }
  catch(e){ return res.status(e.status||500).json({ok:false,error:e.message}); }
});

app.post("/api/mission", upload.single("file"), async (req,res)=>{
  try {
    const line = await authFromRequest(req); const u=ensureUser(line.sub,{name:line.name,pictureUrl:line.picture});
    const action=req.body.action;
    if(action === "myMissionStatus") {
      const submissions=Object.values(db.missions).filter(x=>x.lineUserId===u.lineUserId).sort((a,b)=>String(b.submittedAt).localeCompare(String(a.submittedAt)));
      return res.json({success:true,submissions});
    }
    if(action === "submitEvidence") {
      const missionId=String(req.body.missionId||""); if(!missionId) return res.status(400).json({success:false,error:"missionId is required"});
      const duplicate=Object.values(db.missions).find(x=>x.lineUserId===u.lineUserId&&x.missionId===missionId&&x.status==="pending");
      if(duplicate) return res.json({success:true,alreadySubmitted:true,submission:duplicate});
      const id=uid(); const file=req.file;
      const item={id,submissionId:id,lineUserId:u.lineUserId,player_name:u.name,missionId,category:req.body.category||"daily",note:req.body.note||"",link:req.body.link||"",fileName:file?.originalname||"",evidence_url:file?`/uploads/${file.filename}`:"",status:"pending",submittedAt:now(),reviewedAt:null,approvedAt:null,rejectReason:"",reward:{coin:10,energy:10,exp:20,points:20}};
      db.missions[id]=item; saveDb(); return res.json({success:true,submission:item});
    }
    if(action === "adminWhoAmI") {
      if(!ADMIN_LINE_USER_IDS.has(u.lineUserId)) return res.status(403).json({success:false,error:"ไม่มีสิทธิ์ Admin"});
      return res.json({success:true,admin:{lineUserId:u.lineUserId,displayName:u.name}});
    }
    if(action === "adminListSubmissions") {
      if(!ADMIN_LINE_USER_IDS.has(u.lineUserId)) return res.status(403).json({success:false,error:"ไม่มีสิทธิ์ Admin"});
      const status=req.body.status||"pending"; const limit=Math.min(200,Math.max(1,num(req.body.limit,100)));
      const submissions=Object.values(db.missions).filter(x=>status==="all"||x.status===status).sort((a,b)=>String(b.submittedAt).localeCompare(String(a.submittedAt))).slice(0,limit); return res.json({success:true,submissions});
    }
    if(action === "adminReviewSubmission") {
      if(!ADMIN_LINE_USER_IDS.has(u.lineUserId)) return res.status(403).json({success:false,error:"ไม่มีสิทธิ์ Admin"});
      const item=db.missions[String(req.body.submissionId||"")]; if(!item) return res.status(404).json({success:false,error:"ไม่พบ submission"});
      if(req.body.decision==="approve") {
        if(item.status==="approved") return res.json({success:true,alreadyProcessed:true,submission:item});
        item.status="approved"; item.reviewedAt=now(); item.approvedAt=now();
        const player=ensureUser(item.lineUserId); const rewards=rewardUser(player,item.reward); player.missionsCompleted+=1;
        item.grantedReward=rewards; const rewardId = uid(); db.rewards[rewardId]={id:rewardId,lineUserId:item.lineUserId,type:"mission",title:`Mission ${item.missionId}`,reward:rewards,createdAt:now(),claimedAt:null}; saveDb();
        return res.json({success:true,submission:item,rewards});
      }
      item.status="rejected"; item.reviewedAt=now(); item.rejectReason=String(req.body.reason||"ไม่ผ่านการตรวจสอบ"); saveDb(); return res.json({success:true,submission:item});
    }
    return res.status(400).json({success:false,error:`Unknown mission action: ${action}`});
  } catch(e){ console.error("MISSION API ERROR",e); return res.status(e.status||500).json({success:false,error:e.message}); }
});

const STAGES=Array.from({length:10},(_,i)=>({id:i+1,hp:10000+(i*10000),energy:10+i*2,damage:1000+i*250,name:["เจ้าจอมเอื่อย","จอมหวาน","ปีศาจของทอด","จอมเค็ม","ราชาอาหารไร้ประโยชน์","ปีศาจพักผ่อนน้อย","จอมเนื่อยนิ่ง","ปีศาจพฤติกรรมเสี่ยง","ราชาความเสี่ยงสุขภาพ","จอมมารโรคร้าย"][i]}));
app.post("/api/battle", async (req,res)=>{
  try{
    const line=await authFromRequest(req); const u=ensureUser(line.sub,{name:line.name,pictureUrl:line.picture}); const action=req.body.action;
    if(action==="battleStatus") return res.json({success:true,player:publicUser(u),stages:STAGES.map(s=>({id:s.id,name:s.name,hp:s.hp,unlocked:s.id===1||u.battlesWon>=s.id-1}))});
    if(action==="startBattle"){
      const stage=STAGES.find(s=>s.id===num(req.body.stageId)); if(!stage)return res.status(404).json({success:false,error:"ไม่พบ Stage"});
      if(u.energy<stage.energy)return res.status(400).json({success:false,error:"Energy ไม่พอ",player:{energy:u.energy}});
      u.energy-=stage.energy; const runId=uid(); db.battles[runId]={id:runId,lineUserId:u.lineUserId,stageId:stage.id,monsterHp:stage.hp,startedAt:now(),finished:false}; saveDb();
      return res.json({success:true,run:{id:runId,monster_hp:stage.hp},player:{energy:u.energy,maxEnergy:u.maxEnergy}});
    }
    if(action==="attack"){
      const run=db.battles[String(req.body.runId||"")]; if(!run||run.lineUserId!==u.lineUserId)return res.status(404).json({success:false,error:"ไม่พบ Battle"});
      if(run.finished)return res.json({success:true,monsterHp:0,win:true,player:{energy:u.energy}});
      const stage=STAGES.find(s=>s.id===run.stageId); const damage=stage.damage; run.monsterHp=Math.max(0,run.monsterHp-damage); let rewards=null;
      if(run.monsterHp===0){run.finished=true;u.battlesWon+=1;rewards=rewardUser(u,{coin:50,energy:20,exp:100,points:100});const rewardId = uid(); db.rewards[rewardId]={id:rewardId,lineUserId:u.lineUserId,type:"battle",title:`Boss Stage ${stage.id}`,reward:rewards,createdAt:now(),claimedAt:null};}
      saveDb(); return res.json({success:true,damage,monsterHp:run.monsterHp,win:run.monsterHp===0,player:{energy:u.energy,maxEnergy:u.maxEnergy},rewards});
    }
    return res.status(400).json({success:false,error:`Unknown battle action: ${action}`});
  }catch(e){console.error("BATTLE API ERROR",e);return res.status(e.status||500).json({success:false,error:e.message});}
});

app.use((req,res)=>res.status(404).json({ok:false,error:"API endpoint not found"}));
app.use((err,_req,res,_next)=>{console.error("SERVER ERROR",err);res.status(500).json({ok:false,error:err.message||"Internal server error"});});

app.listen(PORT,"0.0.0.0",()=>console.log(`ROCK YOUR BODY 2026 API running on port ${PORT}`));
