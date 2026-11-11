# Free public hosting (GitHub Pages + Render)

Stay on **free** tiers only. No paid Azure.

| Layer | Host | Public URL (expected) |
|-------|------|------------------------|
| Frontend SPA | GitHub Pages + custom domain | **https://karimmajed.com** |
| Fallback (optional) | Project Pages path | https://karimajed9.github.io/karim-portfolio/ (needs `VITE_BASE_PATH=/karim-portfolio/`) |
| API + Postgres | Render free (or Neon free DB) | https://\<name\>.onrender.com |

---

## A. Frontend — GitHub Pages (custom domain)

Vite `base` defaults to **`/`** for the apex domain. After changing base/docs, **re-run Actions → Deploy GitHub Pages** (or push to `main` under `frontend/`).

1. Confirm **Settings → Pages → Source = GitHub Actions**.
2. Custom domain **karimmajed.com** (TLS already done).
3. **Actions → Deploy GitHub Pages → Run workflow** after this change merges.
4. Open **https://karimmajed.com**

Without a live API, Home still works; About / Skills / Experience / Projects show **static copy** from `frontend/src/data/site.ts`. Contact mailto works; the form needs the API.

### Optional Actions variables

| Variable | When |
|----------|------|
| `VITE_API_BASE_URL` | Public API URL (e.g. `https://<api>.onrender.com`) |
| `VITE_BASE_PATH` | Only if you must serve the **github.io/karim-portfolio/** path without relying on the custom domain — set to `/karim-portfolio/`. Prefer apex; leave unset for `/`. |

---

## B. Backend — Render (Karim clicks; agent cannot create the account)

### Option 1 — Blueprint (preferred)

1. Create a free account at [https://render.com](https://render.com) (GitHub login is fine).
2. **Dashboard** → **New** → **Blueprint**.
3. Connect **Karimajed9/karim-portfolio** and select branch `main`.
4. Confirm it reads root `render.yaml`.
5. When prompted for `ADMIN_PASSWORD`, set a strong password (not committed).
6. Apply. Wait for the first deploy.

If free **Postgres** is missing or blocked, skip to **Option 2**.

### Option 2 — Manual Web Service + free Postgres elsewhere

1. **New** → **Web Service** → this repo → Docker → root context `backend/` (Dockerfile path `backend/Dockerfile`).
2. Instance type: **Free**.
3. Create a free Postgres (Render if offered, otherwise [Neon](https://neon.tech) free project).
4. Set env vars on the Web Service:

| Variable | Value |
|----------|--------|
| `PORT` | `8080` |
| `DB_HOST` | Postgres host |
| `DB_PORT` | `5432` (or Neon port) |
| `DB_NAME` | database name |
| `SPRING_DATASOURCE_USERNAME` | db user |
| `DB_PASSWORD` | db password |
| `ADMIN_PASSWORD` | your admin password |
| `CORS_ALLOWED_ORIGINS` | `https://karimmajed.com,https://www.karimmajed.com,https://karimajed9.github.io,http://localhost:5173,http://localhost:3000` |
| `APP_STORAGE_MODE` | `local` |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Optional — Azure App Insights connection string (see [application-insights.md](application-insights.md)) |

5. Health check path: `/api/health`.
6. Deploy. Smoke: `GET https://<service>.onrender.com/api/health`.

### After API is live

1. Set GitHub Actions variable `VITE_API_BASE_URL` to the Render URL (no trailing slash).
2. Re-run **Deploy GitHub Pages**.
3. Confirm Projects/About load from the API and Contact form posts succeed.
4. Admin: `https://karimmajed.com/admin` — user `admin`, password = `ADMIN_PASSWORD`.

### Free-tier caveats

- Render free web services **sleep** after idle; the first hit can be slow.
- Free databases may **expire** or change; treat production data as disposable.
- Do not enable paid plans unless you choose to.

---

## C. CORS

Backend reads `CORS_ALLOWED_ORIGINS` (comma-separated). Default includes local Vite/Compose, **https://karimmajed.com**, **https://www.karimmajed.com**, and `https://karimajed9.github.io` (origins have **no** path).

---

## D. Optional — Application Insights (backend only)

Code is ready: the API attaches the Java agent when `APPLICATIONINSIGHTS_CONNECTION_STRING` is set. Leave it unset on Render if you want zero Azure monitoring cost.

Portal create + paste steps: [application-insights.md](application-insights.md). No frontend SDK.

---

## E. What this repo does / does not do

| Done in repo | Needs your click |
|--------------|------------------|
| Pages build + deploy workflow | Enable Pages + custom domain / TLS |
| Vite `base` `/` (override via `VITE_BASE_PATH`) | Re-run **Deploy GitHub Pages** after merge |
| Static fallbacks when API is down | — |
| `render.yaml` + env docs | Create Render account + Blueprint/service |
| Configurable CORS + `PORT` | Paste `ADMIN_PASSWORD` / DB secrets on Render |
| App Insights runtime attach + sampling | Create Insights resource + paste connection string |
