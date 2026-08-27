# ROCK YOUR BODY 2026

ระบบประกอบด้วย LINE LIFF + GitHub Pages + Render API

## 1) Render Environment Variables

ตั้งค่าใน Render Web Service:

- `LINE_CHANNEL_ID` = LINE Login Channel ID ของ LIFF
- `FRONTEND_URLS` = `https://rock-your-body.github.io,https://rock-your-body.github.io/rock-your-body-2026`
- `ADMIN_LINE_USER_IDS` = LINE User ID ของ Admin คั่นด้วย comma
- `DATA_DIR` = `./data` (ค่าเริ่มต้น)

สำหรับทดสอบก่อนเชื่อม LINE จริง สามารถใช้ `DEV_MODE=true` แล้วส่ง token รูปแบบ `DEV:<LINE_USER_ID>` ได้ แต่ควรปิด `DEV_MODE` เมื่อใช้งานจริง

## 2) LINE LIFF

LIFF ID: `2011201679-uNWz5yqF`

ตั้ง Endpoint URL เป็น:

`https://rock-your-body.github.io/rock-your-body-2026/`

จากนั้น Rich Menu ให้เปิด LIFF URL:

`https://liff.line.me/2011201679-uNWz5yqF`

## 3) Flow การ Login

Rich Menu HOME → LIFF → `index.html` → `ROCK.initLiff()` → LINE Login → `getIDToken()` → `POST /api/me` → server verify token กับ LINE → ใช้ `sub` เป็น LINE User ID → สร้าง/โหลดสมาชิก → Dashboard

ทุกข้อมูลเกมผูกกับ `lineUserId` คนละคนแยกกัน

## 4) API หลัก

- `GET /api/health`
- `POST /api/me`
- `POST /api/player` actions: dashboard, saveWeight, setTarget, saveSteps, saveSleep, saveHealthScore, progress, ranking, rewards, claimReward
- `POST /api/mission`
- `POST /api/battle`

## 5) หมายเหตุเรื่องฐานข้อมูล

รุ่นนี้ใช้ JSON persistence เพื่อให้ระบบทำงานได้ทันทีโดยไม่ต้องตั้งฐานข้อมูลเพิ่ม แต่ filesystem ของ Render แบบ Free อาจไม่ถาวรเมื่อมีการ redeploy/restart. สำหรับ production จริงควรย้าย `users`, `missions`, `battles`, `rewards` ไป PostgreSQL/Supabase หรือฐานข้อมูลถาวร แล้วคง API contract เดิมไว้
