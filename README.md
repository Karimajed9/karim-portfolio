# Karim Majed — Personal Portfolio

Full-stack portfolio site for **Karim Majed** — recruiter-ready pages (Home, About, Skills, Experience, Projects, Contact) plus a small admin view for contact messages. Built as a deliberate upskilling track in **React**, **TypeScript**, **Spring Boot**, and **Azure** (local-first; cloud deploy deferred).

**Karim** is a Full Stack Software Developer with 5+ years of experience (C# / ASP.NET, Java, JavaScript, SQL, REST, enterprise apps including financial services, Azure Logic Apps and Functions).

---

## Stack

| Layer | Choices |
|-------|---------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, React Router |
| **Backend** | Java 21, Spring Boot, Spring Security (Basic auth), Spring Data JPA, Flyway, Maven |
| **Database** | PostgreSQL 16 |
| **Azure (code-ready)** | Blob Storage, Key Vault references, Application Insights — wired with **local fallbacks**; no paid resources required |
| **DevOps** | Docker Compose, GitHub Actions CI (build + test). **Azure deploy deferred** |

---

## Status

| Area | State |
|------|--------|
| Portfolio SPA + public content APIs | Done |
| Contact form → Postgres + admin messages UI | Done |
| Docker Compose (Postgres + API + nginx frontend) | Done |
| Automated tests (Vitest + JUnit/Testcontainers) | Done |
| GitHub Actions CI on `main` | Done (free build/test only) |
| Public / Azure hosting | **Deferred** — stay local until you opt in to spend or free credit |

---

## Repository layout

```text
karim-portfolio/
├── frontend/              # Vite + React + TypeScript SPA
├── backend/               # Spring Boot API (Maven Wrapper included)
├── .github/workflows/     # CI: npm test/build + mvnw test
├── docker-compose.yml     # Postgres + backend + frontend
├── .env.example           # Copy to .env for Compose secrets/ports
└── README.md
```

---

## Prerequisites

| Tool | Needed for |
|------|------------|
| **Node.js 20+** (22 fine) | Frontend install / test / build |
| **JDK 21** + Maven Wrapper (`./mvnw`) | Backend without Docker |
| **Docker Desktop** | Compose stack and backend Testcontainers |
| **Git** | Clone / PR workflow |

Azure CLI / cloud account: **not required** for local launch.

---

## Quick start (Docker Compose) — recommended

```bash
copy .env.example .env
# Set DB_PASSWORD and ADMIN_PASSWORD (placeholders only in the example)

docker compose up --build
```

| What | URL |
|------|-----|
| Site | [http://localhost:3000](http://localhost:3000) |
| API health | [http://localhost:8080/api/health](http://localhost:8080/api/health) |
| Admin UI | [http://localhost:3000/admin](http://localhost:3000/admin) — user `admin`, password = `ADMIN_PASSWORD` |
| Postgres | `localhost:5432` — db `portfolio`, user `postgres` |

Nginx serves the SPA and proxies `/api` to the backend (same-origin fetches in the image).

Stop: `Ctrl+C` or `docker compose down` (add `-v` to drop the Postgres volume).

---

## Run without Docker (npm + Spring)

You still need a running Postgres on `localhost:5432` with database `portfolio`, user `postgres`, and password matching `DB_PASSWORD` (Compose’s Postgres service is fine if you only start that container).

**Terminal 1 — API**

```bash
# Windows PowerShell example
$env:DB_PASSWORD="change-me"
$env:ADMIN_PASSWORD="change-me"
cd backend
.\mvnw.cmd spring-boot:run
```

**Terminal 2 — SPA**

```bash
cd frontend
npm install
npm run dev
```

Vite defaults API calls to `http://localhost:8080`. Override with `frontend/.env`:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

Open [http://localhost:5173](http://localhost:5173).

---

## Tests

**Backend** (JUnit 5 + MockMvc + Testcontainers Postgres — Docker required):

```bash
cd backend
./mvnw test          # Unix / Git Bash
.\mvnw.cmd test      # Windows
```

**Frontend** (Vitest + Testing Library):

```bash
cd frontend
npm test
```

### CI (free)

On every push and pull request to `main`, [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs frontend `npm ci` → `npm test` → `npm run build` and backend `./mvnw test`. No Azure login, no deploy jobs.

---

## API surface (current)

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/api/health` | Public |
| `GET` | `/api/about`, `/api/skills`, `/api/experience`, `/api/projects` | Public |
| `POST` | `/api/contact` | Public |
| `GET` | `/api/admin/messages` | Basic `admin` / `ADMIN_PASSWORD` |
| `POST` | `/api/admin/uploads` | Same — multipart → local or Azure blob abstraction |

Restart the backend after changing `ADMIN_PASSWORD` (BCrypt-encoded at startup).

---

## Azure (deferred deploy)

Leave Azure env vars unset: uploads go under `./data/uploads`, secrets stay in `.env`, App Insights does not attach. Production profile hints live in `backend/src/main/resources/application-prod.properties`. Provision App Service / Postgres / Blob / Key Vault / Insights only when you are ready to spend or use free credit — this repo does not create those resources.

---

## Security

- Never commit `.env` or real passwords / connection strings.
- Prefer placeholders in `.env.example` only.
- Admin Basic auth: username `admin`, password from `ADMIN_PASSWORD` (default `password` if unset).

---

## Learning approach

Personal learning repo: small incremental PRs, tests with features, mentor-paced changes. Suggestions welcome; expect deliberate scope over drive-by rewrites.

---

## License

Treat this repository as MIT unless a `LICENSE` file states otherwise.
