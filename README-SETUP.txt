FINAL SETUP — ROCK YOUR BODY 2026

1. GitHub Pages
Expected URL:
https://rock-your-body.github.io/rock-your-body-2026/

GitHub Settings > Pages > Deploy from branch > main > /(root)

2. LIFF
Put the real LIFF ID in app-config.js:
LIFF_ID: "YOUR_REAL_LIFF_ID"

LIFF Endpoint URL:
https://rock-your-body.github.io/rock-your-body-2026/

3. Render
Build: npm install
Start: npm start
FRONTEND_URL:
https://rock-your-body.github.io/rock-your-body-2026/

4. /api/me
Do not open /api/me directly in a browser. It intentionally requires x-line-user-id.
Normal flow:
LINE -> LIFF -> liff.getProfile() -> LINE User ID -> /api/me -> HOME

5. Data
This package uses in-memory player data so the complete flow works immediately.
Render restarts reset the demo data. Permanent production storage requires a database.

6. Thai font
Noto Sans Thai is used. No serif font.
