FINAL SETUP — ROCK YOUR BODY 2026

1. GitHub Pages

Repository:
rock-your-body/rock-your-body-2026

GitHub Pages URL:
https://rock-your-body.github.io/rock-your-body-2026/

GitHub:
Settings
> Pages
> Deploy from branch
> main
> /(root)

HOME:
https://rock-your-body.github.io/rock-your-body-2026/dashboard.html


2. LINE LIFF

LIFF ID:
2011201679-uNWz5yqF

LIFF URL:
https://liff.line.me/2011201679-uNWz5yqF

app-config.js:

LIFF_ID: "2011201679-uNWz5yqF"

LIFF Endpoint URL:
https://rock-your-body.github.io/rock-your-body-2026/index.html

เปิดระบบผ่าน:

LINE Rich Menu
→ LIFF URL
→ index.html
→ liff.init()
→ LINE Login
→ dashboard.html


3. BACKEND

ระบบนี้ใช้:

Supabase
Project Ref:
nztvqdzatdpauufpvdaa

Supabase URL:
https://nztvqdzatdpauufpvdaa.supabase.co

ไม่ได้ใช้ Render เป็น backend หลัก

Edge Functions ที่ใช้งาน:

player-dashboard
mission
battle
inbody
project-settings
daily-health
nutrition


4. LINE AUTHENTICATION

ไม่ใช้ /api/me

Flow ปัจจุบัน:

LINE
→ LIFF
→ liff.init()
→ liff.isLoggedIn()
→ liff.getIDToken()
→ ส่ง idToken ไป Supabase Edge Function
→ Edge Function ตรวจสอบ ID Token กับ LINE
→ อ่าน LINE User ID จาก token
→ โหลดข้อมูลผู้เล่น
→ HOME

ห้ามเก็บ LINE ID Token แบบถาวรใน localStorage

ถ้า ID Token หมดอายุ:
→ logout / re-auth
→ เปิด LIFF ใหม่
→ รับ ID Token ใหม่


5. DATABASE

ระบบใช้ Supabase Database จริง

ไม่ได้ใช้ in-memory player data

ข้อมูลต่าง ๆ เช่น:

players
mission_submissions
nutrition_logs
project_settings
InBody
Daily Health

ควรบันทึกใน Supabase

ดังนั้นการ restart Edge Function
จะไม่ทำให้ข้อมูลผู้เล่นหาย


6. STORAGE

Supabase Storage buckets:

mission-evidence
inbody-results
nutrition-evidence
rock-assets


7. DAILY HEALTH GOALS

Steps:
8,000 steps

Calories:
300 kcal

Sleep:
420 minutes


8. MAIN PAGES

HOME:
./dashboard.html

MISSION:
./mission.html

BATTLE:
./battle.html

WEIGHT:
./weight-check.html

PROGRESS:
./progress.html

RANKING:
./ranking.html

REWARDS:
./rewards.html

PROJECT SETTINGS:
./project-settings.html

NUTRITION:
./nutrition.html


9. RICH MENU

HOME:
https://liff.line.me/2011201679-uNWz5yqF

MISSION:
https://rock-your-body.github.io/rock-your-body-2026/mission.html

BATTLE:
https://rock-your-body.github.io/rock-your-body-2026/battle.html

REWARD:
https://rock-your-body.github.io/rock-your-body-2026/rewards.html

RANKING:
https://rock-your-body.github.io/rock-your-body-2026/ranking.html

ข้อมูลเพิ่มเติม:
https://rock-your-body.github.io/rock-your-body-2026/project-settings.html


10. FONT

dashboard.html ปัจจุบันใช้:

Prompt

Google Fonts:
https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600;700;800;900

ไม่ใช่ Noto Sans Thai เป็น font หลัก
