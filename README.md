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
| **Azure (planned)** | App Service, Azure Database for PostgreSQL, Blob Storage, Key Vault, Application Insights, Monitor |
| **DevOps** | Git / GitHub, Docker, GitHub Actions CI/CD (later) |

---

## Current status

**Phase 1 — in progress**

- Vite + React + TypeScript frontend scaffolded under `frontend/`
- Local frontend dev server works (`npm run dev`)
- Backend not started yet (`backend/` comes in later phases)
- PostgreSQL, Docker Compose, and Azure wiring are planned, not implemented

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

Backend, database, and Docker steps will be documented here when those phases start.

---

## Roadmap

1. **Project init and local environment** — tooling, folder layout, Vite React + TypeScript scaffold  
2. **Frontend architecture and portfolio UI** — routes, layout, Home / About / Skills / Experience / Projects / Contact  
3. **Spring Boot backend skeleton** — Maven project, basic app, health check  
4. **REST API + PostgreSQL** — entities, Flyway, projects and contact persistence  
5. **Frontend / backend integration** — API client, env-based base URL, end-to-end flows  
6. **Auth + admin dashboard** — Spring Security, RBAC, protected admin CRUD  
7. **Azure Blob, Key Vault, monitoring** — uploads, secrets, Application Insights  
8. **Docker + automated testing** — Compose, unit/integration tests  
9. **Azure deploy + GitHub Actions** — App Service, managed Postgres, CI/CD  
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
| — | Blob upload endpoints | Project screenshot / media uploads via Azure Blob |

Exact shapes and auth details will land with the Spring Boot and security phases. Paths above match the product plan (projects CRUD, contact persistence, later admin + Blob).

---

## Security notes

- **Never commit secrets** (API keys, DB passwords, connection strings, Azure credentials).
- Use **`.env`** (local) and **Azure Key Vault** (cloud) when configuration becomes sensitive.
- Root `.gitignore` already ignores `.env` / `.env.*` (with an optional `.env.example` pattern kept allowed).
- Prefer example env files with placeholders only; real values stay on the machine or in Key Vault.

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
