# Karim Majed — Personal Portfolio

A full-stack personal portfolio and learning project. The site will present professional experience, skills, and projects in a recruiter-ready way, while building practical depth in **React**, **TypeScript**, **Spring Boot**, and **Azure** for the European market.

---

## About the developer

**Karim Majed** is a Full Stack Software Developer with 5+ years of experience. Day-to-day background includes **C# / ASP.NET**, **Java**, **JavaScript**, **SQL**, **REST APIs**, and enterprise applications (including financial services), plus Azure **Logic Apps** and **Functions**.

This repository is also a deliberate upskilling track: stronger **Java**, **TypeScript**, **React**, **Spring Boot**, and **Azure**, with clean architecture and incremental delivery rather than a one-shot generated app.

---

## Tech stack

| Layer | Choices |
|-------|---------|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS (planned), React Router (planned) |
| **Backend (planned)** | Java 21, Spring Boot, Spring Security, Spring Data JPA, Hibernate, Maven, REST |
| **Database (planned)** | PostgreSQL, Flyway |
| **Azure** | App Service, Azure Database for PostgreSQL, Blob Storage, Key Vault, Application Insights (code-ready; deploy in later phase) |
| **DevOps** | Git / GitHub, Docker, GitHub Actions CI (build/test; deploy deferred) |

---

## Current status

- Frontend SPA (`frontend/`), Spring Boot API (`backend/`), Postgres + Flyway, admin Basic auth
- Docker Compose stack and automated tests in place
- Azure Blob / Key Vault / App Insights **wired in code** with local fallbacks (no cloud resources required yet)

---

## Repository structure

Target layout for the monorepo:

```text
karim-portfolio/
├── frontend/              # Vite + React + TypeScript SPA (Phase 1 — present)
├── backend/               # Spring Boot API (Phase 3+ — not started)
├── docs/                  # Architecture notes / ADRs (optional in repo)
├── docker-compose.yml     # Local Postgres (and maybe API) later
├── README.md              # This file
└── .gitignore
```

Inside `frontend/` today (simplified):

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Prerequisites

| Tool | When you need it | Check |
|------|------------------|--------|
| **Node.js 20 LTS+** | Now (frontend) | `node -v` / `npm -v` |
| **Git** | Now | `git --version` |
| **JDK 21** | Backend phases | `java -version` |
| **Maven 3.9+** | Backend phases (or Maven Wrapper later) | `mvn -v` |
| **Docker Desktop** | Useful once Postgres / compose land | `docker -v` |
| **Azure account / CLI** | Deploy and cloud phases only | — |

For Phase 1 you only need **Node 20+** and **Git**.

---

## Getting started locally (frontend only)

From the repository root:

### 1. Enter the frontend app

```bash
cd frontend
```

The SPA lives in its own folder so Node tooling stays separate from the future JVM backend.

### 2. Install dependencies

```bash
npm install
```

Reads `package.json` / `package-lock.json` and installs React, Vite, TypeScript, and other template packages into `node_modules/`.

### 3. Start the dev server

```bash
npm run dev
```

Starts Vite’s local development server (typically [http://localhost:5173](http://localhost:5173)). Open that URL in a browser. You should see the default Vite + React page until the portfolio UI is built. Stop the server with `Ctrl+C`.

**Useful follow-ups (same folder):**

```bash
npm run build    # production build into frontend/dist
npm run preview  # serve the production build locally
npm run lint     # run the configured linter
```

---

## Run the full stack with Docker

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) running (`docker version` shows Client + Server).

From the repository root:

```bash
copy .env.example .env
# Edit .env — set DB_PASSWORD and ADMIN_PASSWORD (placeholders only in the example)

docker compose up --build
```

Then open:

| Service | URL |
|---------|-----|
| Frontend (nginx) | [http://localhost:3000](http://localhost:3000) |
| Backend API | [http://localhost:8080/api/health](http://localhost:8080/api/health) |
| Postgres | `localhost:5432` (db `portfolio`, user `postgres`) |

Compose starts Postgres (healthcheck), then the Spring Boot API (Flyway migrations on startup), then the React static build behind nginx. Nginx proxies `/api` to the backend so the browser can use same-origin API calls.

Stop with `Ctrl+C`, or `docker compose down`. Add `-v` to also remove the Postgres volume.

Ports and secrets come from `.env` (see `.env.example`). Never commit real passwords.

---

## Automated tests

Small learning-friendly suite — not a full coverage goal yet.

**Backend** (JUnit 5 + MockMvc + Testcontainers Postgres; Docker Desktop required):

```bash
cd backend
./mvnw test
```

Covers: context load, `GET /api/health`, public `GET /api/projects`, `GET /api/admin/messages` (401 without auth / 200 with Basic `admin` / default `password`), and local `BlobStorage` unit tests.

**Frontend** (Vitest + Testing Library):

```bash
cd frontend
npm test
```

Covers: `apiUrl()` path joining and a smoke render of `HomePage`.

### GitHub Actions CI (free)

On every push and pull request to `main`, [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs:

- **Frontend:** `npm ci` → `npm test` → `npm run build`
- **Backend:** `./mvnw test` (Testcontainers Postgres on the Ubuntu runner’s Docker)

**Azure deploy is deferred** until you are ready to spend or use free credit — this workflow has no Azure login, no deploy jobs, and no resource provisioning.

---

## Azure wiring (local-first, no spend required)

This repo is prepared for Azure Blob, Key Vault, and Application Insights **without creating paid resources**. Leave the Azure env vars unset and everything stays local.

### How it works locally (default)

| Concern | Local behavior |
|---------|----------------|
| **Blob uploads** | Files go under `./data/uploads` via `LocalBlobStorage` |
| **Secrets** | `.env` / process env (`DB_PASSWORD`, `ADMIN_PASSWORD`) |
| **Monitoring** | Request logging only; App Insights agent does **not** attach |

Exercise the upload hook (admin Basic auth):

```bash
curl -u admin:$ADMIN_PASSWORD -F "file=@./somepicture.png" http://localhost:8080/api/admin/uploads
```

Response: `{ "key": "uploads/...", "url": "file:///..." }`. This does not yet attach images to project rows — it only proves the storage abstraction.

### Env vars to set later (when you deploy)

| Variable | Purpose |
|----------|---------|
| `APP_STORAGE_MODE` | `auto` (default), `local`, or `azure` |
| `AZURE_STORAGE_CONNECTION_STRING` | Blob access for smoke tests / simple setups |
| `AZURE_STORAGE_ACCOUNT_NAME` | Prefer with App Service **Managed Identity** (no connection string) |
| `AZURE_STORAGE_CONTAINER` | Default `portfolio-uploads` |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Enables App Insights attach in `main` |
| `DB_PASSWORD` / `ADMIN_PASSWORD` | Same names in cloud — map from Key Vault / App Settings |

Production profile hints live in `backend/src/main/resources/application-prod.properties` (`--spring.profiles.active=prod`).

### Secrets: local env → Key Vault (no SDK required)

On **Azure App Service**, use [Key Vault references](https://learn.microsoft.com/en-us/azure/app-service/app-service-key-vault-references) so `DB_PASSWORD`, `ADMIN_PASSWORD`, and (if needed) blob credentials are injected as **environment variables**. Existing Spring/`SecurityConfig` code already reads those names — you do not need an in-process Key Vault client for the first deploy.

### Rough Azure checklist (deploy phase — create only when ready)

Do **not** run these yet if you are cost-conscious; this is a future shopping list (CI build/test is already free via GitHub Actions):

1. Resource group + App Service (Java 21) for the API (and static frontend or same app)
2. Azure Database for PostgreSQL Flexible Server
3. Storage account + blob container `portfolio-uploads`
4. Key Vault secrets for `DB_PASSWORD`, `ADMIN_PASSWORD` (+ optional storage connection string)
5. Application Insights component → copy connection string to App Setting
6. Managed Identity on App Service with Blob (and Key Vault) RBAC roles
7. App Settings / Key Vault references matching the env var table above
8. `SPRING_PROFILES_ACTIVE=prod`

---

## Roadmap

1. **Project init and local environment** — tooling, folder layout, Vite React + TypeScript scaffold  
2. **Frontend architecture and portfolio UI** — routes, layout, Home / About / Skills / Experience / Projects / Contact  
3. **Spring Boot backend skeleton** — Maven project, basic app, health check  
4. **REST API + PostgreSQL** — entities, Flyway, projects and contact persistence  
5. **Frontend / backend integration** — API client, env-based base URL, end-to-end flows  
6. **Auth + admin dashboard** — Spring Security, RBAC, protected admin CRUD  
7. **Azure Blob, Key Vault, monitoring** — code + local fallbacks (this phase)  
8. **Docker + automated testing** — Compose, unit/integration tests  
9. **GitHub Actions CI** — free build/test on push/PR (done); **Azure deploy** later when ready to spend
10. **Docs, polish, launch** — README accuracy, recruiter polish, go-live checklist  

---

## Planned API endpoints

Public (target):

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/projects` | List portfolio projects |
| `GET` | `/api/projects/{id}` | Project detail |
| `POST` | `/api/contact` | Submit contact form (validated, stored in PostgreSQL) |

Admin / authenticated (later phases):

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/projects` | Create project |
| `PUT` | `/api/projects/{id}` | Update project |
| `DELETE` | `/api/projects/{id}` | Delete project |
| `GET` | `/api/contact` | List contact messages (admin) |
| `POST` | `/api/admin/uploads` | Multipart file → `BlobStorage` (local or Azure); returns `{ key, url }` |

Exact shapes and auth details will land with the Spring Boot and security phases. Paths above match the product plan (projects CRUD, contact persistence, later admin + Blob).

---

## Security notes

- **Never commit secrets** (API keys, DB passwords, connection strings, Azure credentials).
- Use **`.env`** (local) and **Azure Key Vault** (cloud) when configuration becomes sensitive.
- Root `.gitignore` already ignores `.env` / `.env.*` (with an optional `.env.example` pattern kept allowed).
- Prefer example env files with placeholders only; real values stay on the machine or in Key Vault.
- Admin Basic auth: user `admin`, password from env `ADMIN_PASSWORD` (default `password`). The value is BCrypt-encoded at startup — **restart the backend after changing `ADMIN_PASSWORD`**. Example: `curl -u admin:password http://localhost:8080/api/admin/messages`.
- Azure connection strings and instrumentation keys belong in env / Key Vault only — never in source or Docker images.

---

## Contributing / learning approach

This is a personal learning and portfolio repo, built **incrementally**:

- One phase at a time; no big-bang codegen of the whole stack  
- Prefer small, reviewable changes with a clear “done” for each step  
- Tests arrive with features (unit + integration as the API grows)  
- Suggestions and PRs are welcome in spirit, but expect mentored, deliberate pacing over drive-by refactors  

If you are Karim (or mentoring alongside): finish the current phase checklist before pulling the next layer (Tailwind, Spring Boot, Azure, etc.).

---

## License

MIT License — see a future `LICENSE` file, or treat this repository as MIT unless stated otherwise.
