(function () {
  "use strict";
  const C = window.ROCK_CONFIG;
  if (!C) throw new Error("ROCK_CONFIG is missing.");
  const S = C.STORAGE;

  function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
  function load(k,fallback=null){try{const v=localStorage.getItem(k);return v===null?fallback:JSON.parse(v);}catch(e){return fallback;}}

  async function api(path, options={}) {
    const headers={...(options.headers||{})};
    if(options.body && !headers["Content-Type"]) headers["Content-Type"]="application/json";
    const id=localStorage.getItem(S.LINE_USER_ID);
    if(id) headers["x-line-user-id"]=id;
    const res=await fetch(C.API_BASE.replace(/\/$/,"")+path,{...options,headers});
    let data; try{data=await res.json();}catch(e){throw new Error(`API returned invalid JSON (${res.status})`);}
    if(!res.ok) throw new Error(data?.error||data?.message||`API Error ${res.status}`);
    return data;
  }

  async function initLINE(){
    if(typeof liff==="undefined") return {ok:false,mode:"no-liff"};
    if(!C.LIFF_ID) return {ok:false,mode:"no-liff-id"};
    await liff.init({liffId:C.LIFF_ID});
    if(!liff.isLoggedIn()){liff.login({redirectUri:location.href});return {ok:false,mode:"login"};}
    const p=await liff.getProfile();
    const profile={userId:p.userId,displayName:p.displayName||"สมาชิก ROCK YOUR BODY",pictureUrl:p.pictureUrl||"",statusMessage:p.statusMessage||""};
    localStorage.setItem(S.LINE_USER_ID,profile.userId);
    save(S.LINE_PROFILE,profile);
    return {ok:true,mode:"line",user:profile};
  }

  async function getMe(){
    const id=localStorage.getItem(S.LINE_USER_ID);
    if(!id) return {ok:false,error:"LINE User ID is required"};
    const data=await api("/api/me");
    if(data.user){
      const p=load(S.LINE_PROFILE,{});
      data.user={...data.user,displayName:data.user.displayName||p.displayName||"สมาชิก ROCK YOUR BODY",pictureUrl:data.user.pictureUrl||p.pictureUrl||"",lineUserId:data.user.lineUserId||id};
      save(S.USER,data.user);
    }
    return data;
  }

  function number(v){return Number(v||0).toLocaleString("en-US");}
  function bindUser(u){
    if(!u)return;
    document.querySelectorAll("[data-line-profile]").forEach(e=>{if(u.pictureUrl)e.src=u.pictureUrl;});
    document.querySelectorAll("[data-line-name]").forEach(e=>e.textContent=u.displayName||u.name||"สมาชิก ROCK YOUR BODY");
    document.querySelectorAll("[data-rock-coin]").forEach(e=>e.textContent=number(u.rockCoin));
    document.querySelectorAll("[data-energy]").forEach(e=>e.textContent=`${number(u.energy)} / ${number(u.maxEnergy??C.MAX_ENERGY)}`);
    document.querySelectorAll("[data-points]").forEach(e=>e.textContent=number(u.points));
    document.querySelectorAll("[data-rank]").forEach(e=>e.textContent=u.rank?`#${u.rank}`:"-");
    document.querySelectorAll("[data-weight]").forEach(e=>e.textContent=Number(u.weight??0).toFixed(1));
    document.querySelectorAll("[data-target-weight]").forEach(e=>e.textContent=Number(u.targetWeight??0).toFixed(1));
    document.querySelectorAll("[data-steps]").forEach(e=>e.textContent=number(u.steps));
    document.querySelectorAll("[data-target-steps]").forEach(e=>e.textContent=number(u.targetSteps));
    document.querySelectorAll("[data-calories]").forEach(e=>e.textContent=number(u.calories));
    document.querySelectorAll("[data-target-calories]").forEach(e=>e.textContent=number(u.targetCalories));
    document.querySelectorAll("[data-sleep]").forEach(e=>e.textContent=Number(u.sleep??0).toFixed(2));
    document.querySelectorAll("[data-target-sleep]").forEach(e=>e.textContent=Number(u.targetSleep??0).toFixed(0));
    document.querySelectorAll("[data-health-score]").forEach(e=>e.textContent=number(u.healthScore));
    document.querySelectorAll("[data-inbody-score]").forEach(e=>e.textContent=number(u.inbodyScore));
    document.querySelectorAll("[data-program-day]").forEach(e=>e.textContent=number(u.programDay));
    document.querySelectorAll("[data-program-total]").forEach(e=>e.textContent=number(u.programTotalDays));
    document.querySelectorAll("[data-team]").forEach(e=>e.textContent=u.team||"HERO ROCK");
    document.querySelectorAll("[data-level]").forEach(e=>e.textContent=u.level??1);
    document.querySelectorAll("[data-exp]").forEach(e=>e.textContent=`${number(u.exp??0)} / ${number(u.maxExp??1000)}`);
  }

  async function init(){
    if(C.LIFF_ID){const l=await initLINE();if(l.mode==="login")return l;}
    const me=await getMe();if(me.user)bindUser(me.user);return me;
  }

  const go=p=>{if(C.PAGES[p])location.href=C.PAGES[p];};
  window.ROCK={config:C,api,save,load,initLINE,getMe,bindUser,init,number,go,
    goHome:()=>go("home"),goMission:()=>go("mission"),goBattle:()=>go("battle"),
    goReward:()=>go("reward"),goRanking:()=>go("ranking"),goInfo:()=>go("info")};
})();
