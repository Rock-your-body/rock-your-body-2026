# ROCK YOUR BODY 2026 — Cloud deployment

ระบบใหม่ใช้ Supabase project `nztvqdzatdpauufpvdaa` สำหรับ Email/Password Auth, TOTP MFA และ PostgreSQL โดยหน้าเว็บเป็น static application ที่นำขึ้น GitHub Pages หรือ static hosting อื่นได้

## สิ่งที่ติดตั้งบน Cloud แล้ว

- `user_profiles` ผูกหนึ่งต่อหนึ่งกับ `auth.users.id`
- `health_entries` เก็บข้อมูลสุขภาพด้วย UUID ของผู้ใช้
- `auth_audit_logs` บันทึกเหตุการณ์สำคัญ
- บทบาท `employee`, `hr`, `admin`
- สถานะ `pending`, `active`, `suspended`
- RLS จำกัดข้อมูลรายบุคคลและบังคับ MFA ระดับ `aal2` สำหรับ HR/Admin
- RPC ที่ตรวจสิทธิ์สำหรับแก้ผู้ใช้และอนุมัติข้อมูล

## ตั้งค่า Supabase Dashboard ก่อนเปิดใช้จริง

1. Authentication → Providers → Email: เปิด Email + Password
2. Authentication → URL Configuration:
   - Site URL: URL จริงของเว็บไซต์
   - Redirect URLs: เพิ่ม URL จริงและ URL ที่ลงท้ายด้วย `/index.html`
3. Authentication → Multi-Factor: เปิด TOTP
4. Production ควรตั้ง Custom SMTP เพื่อความน่าเชื่อถือของอีเมลยืนยันและรีเซ็ตรหัสผ่าน
5. เปิดใช้ CAPTCHA และกำหนด Password policy ตามนโยบายองค์กร

## บัญชีและสิทธิ์

บัญชีแรกจะเป็น `admin / active` อัตโนมัติ เพื่อ bootstrap ระบบ บัญชีถัดไปจะเป็น `employee / pending` และต้องให้ Admin เปลี่ยนเป็น `active` ก่อนบันทึกข้อมูลได้

| ความสามารถ | Employee | HR | Admin |
|---|---:|---:|---:|
| ดู/เพิ่มข้อมูลตนเอง | ✓ | ✓ | ✓ |
| ดูรายงานรวม | — | ✓ + 2FA | ✓ + 2FA |
| อนุมัติ/ปฏิเสธข้อมูล | — | ✓ + 2FA | ✓ + 2FA |
| เปลี่ยนบทบาท/ระงับบัญชี | — | — | ✓ + 2FA |
| ลบข้อมูลผู้อื่น/Audit Log | — | — | ✓ + 2FA |

## การเผยแพร่

ไฟล์เริ่มต้นคือ `index.html` และ Portal คือ `portal.html` ไม่มี LINE SDK หรือ LIFF ใน flow ใหม่ เมื่อ push branch นี้ไปยัง GitHub Pages เดิม หน้า root จะเปลี่ยนเป็นระบบ Email/Password ทันที

ก่อนเผยแพร่ production ให้ทดสอบด้วยบัญชี 3 ประเภท และเก็บ LIFF pages เดิมไว้จนกว่าจะย้ายข้อมูลจากคอลัมน์ `line_user_id` ไปยัง UUID ครบถ้วน

## การย้ายข้อมูล LINE เดิม

ข้อมูลเดิมไม่ถูกลบ การย้ายต้องมี mapping ที่ตรวจสอบได้ระหว่าง `line_user_id` กับอีเมล/UUID ของพนักงาน ห้ามเดาจากชื่อ เพราะอาจผูกข้อมูลสุขภาพผิดคน หลัง HR ยืนยัน mapping แล้วจึง migrate ตารางเดิมเป็นรอบ ๆ พร้อม audit และตรวจจำนวนรายการก่อน/หลัง
