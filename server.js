const express=require("express");
const cors=require("cors");
const app=express();
const PORT=process.env.PORT||3000;
app.use(cors({origin:true,credentials:true}));
app.use(express.json({limit:"1mb"}));
const players=new Map();

function id(req){return req.headers["x-line-user-id"]||null}
function get(req){
  const uid=id(req); if(!uid)return null;
  if(!players.has(uid))players.set(uid,{
    lineUserId:uid,displayName:"สมาชิก ROCK YOUR BODY",pictureUrl:"",
    team:"HERO ROCK",level:12,exp:560,maxExp:1000,rockCoin:1250,energy:150,maxEnergy:200,
    points:12560,rank:12,weight:78.5,targetWeight:72,steps:6842,targetSteps:10000,
    calories:320,targetCalories:500,sleep:7.3,targetSleep:8,healthScore:85,inbodyScore:72,
    programDay:45,programTotalDays:90
  });
  return players.get(uid);
}
function auth(req,res){const u=get(req);if(!u){res.status(401).json({ok:false,error:"LINE User ID is required"});return null}return u}

app.get("/api/health",(req,res)=>res.json({ok:true,service:"ROCK YOUR BODY 2026 API",time:new Date().toISOString()}));
app.get("/api/me",(req,res)=>{const u=auth(req,res);if(u)res.json({ok:true,user:u})});
app.get("/api/dashboard",(req,res)=>{const u=auth(req,res);if(u)res.json({ok:true,dashboard:{steps:{current:u.steps,target:u.targetSteps},calories:{current:u.calories,target:u.targetCalories},sleep:{current:u.sleep,target:u.targetSleep},healthScore:u.healthScore,weight:{current:u.weight,target:u.targetWeight},inbody:{score:u.inbodyScore},program:{currentDay:u.programDay,totalDays:u.programTotalDays}}})});
app.get("/api/missions",(req,res)=>res.json({ok:true,missions:{
daily:[{id:"daily-step",title:"เดินให้ครบ 10,000 ก้าว",type:"MOVE",rewardCoin:100,rewardEnergy:10,completed:false},{id:"daily-water",title:"ดื่มน้ำให้ครบ 3 ลิตร",type:"HEALTH",rewardCoin:80,rewardEnergy:10,completed:false}],
weekly:[{id:"weekly-exercise",title:"ออกกำลังกายครบ 5 วัน",type:"MOVE",rewardCoin:300,rewardEnergy:30,completed:false}],
monthly:[{id:"monthly-health",title:"ทำภารกิจสุขภาพครบตามเป้าหมาย",type:"HEALTH",rewardCoin:1000,rewardEnergy:100,completed:false}],
bonus:[{id:"bonus-checkup",title:"ตรวจสุขภาพ / InBody",type:"BONUS",rewardCoin:500,rewardEnergy:50,completed:false}]
}}));
app.post("/api/missions/:missionId/complete",(req,res)=>{const u=auth(req,res);if(!u)return;u.rockCoin+=100;u.energy=Math.min(u.maxEnergy,u.energy+10);u.points+=100;res.json({ok:true,missionId:req.params.missionId,reward:{rockCoin:100,energy:10,points:100}})});
app.get("/api/battle",(req,res)=>{const u=auth(req,res);if(!u)return;res.json({ok:true,battle:{monster:{id:"sugar-monster",name:"SUGAR MONSTER",hp:68500,maxHp:100000,percent:68},user:{energy:u.energy,maxEnergy:u.maxEnergy}}})});
app.post("/api/battle/fight",(req,res)=>{const u=auth(req,res);if(!u)return;if(u.energy<10)return res.status(400).json({ok:false,error:"Energy not enough"});u.energy-=10;u.points+=100;u.rockCoin+=50;res.json({ok:true,result:{damage:500,energyUsed:10,remainingEnergy:u.energy,reward:{rockCoin:50,points:100}}})});
app.get("/api/rewards",(req,res)=>res.json({ok:true,rewards:[{id:"coin-1000",name:"1,000 ROCK COIN",type:"ROCK_COIN",value:1000,claimed:false},{id:"energy-10",name:"10 ENERGY",type:"ENERGY",value:10,claimed:false},{id:"health-badge",name:"นักสู้สุขภาพ BADGE",type:"BADGE",value:1,claimed:false}]}));
app.get("/api/ranking",(req,res)=>{const u=auth(req,res);if(!u)return;res.json({ok:true,myRank:u.rank,totalMembers:238,ranking:[{rank:1,name:"ROCK HERO",points:12560},{rank:2,name:"FIT WARRIOR",points:9870},{rank:3,name:"HEALTHY KING",points:7230},{rank:u.rank,name:u.displayName,points:u.points}]})});
app.use((req,res)=>res.status(404).json({ok:false,error:"API endpoint not found"}));
app.use((err,req,res,next)=>{console.error(err);res.status(500).json({ok:false,error:"Internal server error"})});
app.listen(PORT,"0.0.0.0",()=>console.log(`ROCK YOUR BODY 2026 API running on ${PORT}`));
