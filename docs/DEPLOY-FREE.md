# Free public hosting (GitHub Pages + Render)

Stay on **free** tiers only. No paid Azure.

| Layer | Host | Public URL (expected) |
|-------|------|------------------------|
| Frontend SPA | GitHub Pages | https://karimajed9.github.io/karim-portfolio/ |
| API + Postgres | Render free (or Neon free DB) | https://\<name\>.onrender.com |

---

## A. Frontend — GitHub Pages (do this first)

1. Merge the PR that adds `.github/workflows/deploy-pages.yml` (or push it to `main`).
2. Open the repo on GitHub → **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, choose **GitHub Actions**.
4. Open **Actions** → run workflow **Deploy GitHub Pages** (**Run workflow**), or push any change under `frontend/`.
5. When the workflow is green, open:  
   **https://karimajed9.github.io/karim-portfolio/**

Without a live API, Home still works; About / Skills / Experience / Projects show **static copy** from `frontend/src/data/site.ts`. Contact mailto works; the form needs the API.

Optional later: **Settings** → **Secrets and variables** → **Actions** → **Variables** → add  
`VITE_API_BASE_URL` = `https://<your-api>.onrender.com`  
then re-run **Deploy GitHub Pages**.

---

## B. Backend — Render (Karim clicks; agent cannot create the account)

### Option 1 — Blueprint (preferred)

1. Create a free account at [https://render.com](https://render.com) (GitHub login is fine).
2. **Dashboard** → **New** → **Blueprint**.
3. Connect **Karimajed9/karim-portfolio** and select branch `main` (after merge).
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
| `CORS_ALLOWED_ORIGINS` | `https://karimajed9.github.io,http://localhost:5173,http://localhost:3000` |
| `APP_STORAGE_MODE` | `local` |

5. Health check path: `/api/health`.
6. Deploy. Smoke: `GET https://<service>.onrender.com/api/health`.

### After API is live

1. Set GitHub Actions variable `VITE_API_BASE_URL` to the Render URL (no trailing slash).
2. Re-run **Deploy GitHub Pages**.
3. Confirm Projects/About load from the API and Contact form posts succeed.
4. Admin: `https://karimajed9.github.io/karim-portfolio/admin` — user `admin`, password = `ADMIN_PASSWORD`.

### Free-tier caveats

- Render free web services **sleep** after idle; the first hit can be slow.
- Free databases may **expire** or change; treat production data as disposable.
- Do not enable paid plans unless you choose to.

---

## C. CORS

Backend reads `CORS_ALLOWED_ORIGINS` (comma-separated). Default includes local Vite/Compose and `https://karimajed9.github.io` (Pages origin has **no** path).

---

## D. What this repo does / does not do

| Done in repo | Needs your click |
|--------------|------------------|
| Pages build + deploy workflow | Enable Pages source = Actions |
| `base` `/karim-portfolio/` when `GITHUB_PAGES=true` | — |
| Static fallbacks when API is down | — |
| `render.yaml` + env docs | Create Render account + Blueprint/service |
| Configurable CORS + `PORT` | Paste `ADMIN_PASSWORD` / DB secrets on Render |
