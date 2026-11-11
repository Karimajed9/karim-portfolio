# Application Insights — free-tier portal setup

Backend-only monitoring for the Spring Boot API. **No browser / frontend SDK** (keeps ingestion cheap on a quiet portfolio). Telemetry attaches only when a connection string is present in the environment.

Repo already includes:

| Piece | Role |
|-------|------|
| `applicationinsights-runtime-attach` (Maven) | Java agent, attached from `main` |
| `PortfolioApplication` | Calls `ApplicationInsights.attach()` only if env is set |
| `applicationinsights.json` | Role name + **25%** sampling; drops `/api/health` |
| Env `APPLICATIONINSIGHTS_CONNECTION_STRING` | Secret connection string (Render / `.env` / Compose) |

Local and CI stay silent when the env var is unset.

---

## Cost model (read before creating resources)

Workspace-based Application Insights bills through its **Log Analytics** workspace. Pay-as-you-go includes about **5 GB/month** of Analytics Logs ingestion free **per billing account** (shared). This portfolio API is low traffic; with 25% sampling and health probes dropped, you should stay well under that if you only enable backend attach.

Still:

- Prefer **one** small resource + one Log Analytics workspace.
- Do **not** add Live Metrics long-running sessions, continuous export, or a frontend JS SDK unless you opt in.
- Delete the resource group if you stop using Azure monitoring.

---

## A. Create the resource (portal clicks — Karim)

1. Open [Azure Portal](https://portal.azure.com) → **Create a resource** → search **Application Insights** → **Create**.
2. **Subscription** / **Resource group**: free/student subscription; e.g. `rg-portfolio` (reuse if you already have one for Static Web Apps).
3. **Name**: e.g. `karim-portfolio-insights`.
4. **Region**: same region as other portfolio resources when possible.
5. **Resource Mode**: **Workspace-based** (classic is retired).
6. **Log Analytics Workspace**: create new (e.g. `law-portfolio`) or pick an existing unused one.
7. **Application type**: **Java** (or **Node.js** / **General** — type is mostly a label for backend APIs).
8. **Review + create** → **Create**. Wait until deployment finishes.
9. Open the resource → **Overview** → copy **Connection String**  
   (`InstrumentationKey=...;IngestionEndpoint=https://...;...`).  
   Never commit this value.

Optional cost guardrails after create:

- Insights resource → **Usage and estimated costs** → set a daily cap / ingestion sampling if offered.
- Log Analytics workspace → retention: keep the default short retention while learning.

---

## B. Wire the connection string (no secrets in git)

### Local Docker Compose

1. Copy `.env.example` → `.env` if needed.
2. Set:

```env
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=...;IngestionEndpoint=https://...
```

3. `docker compose up --build` (or restart the `backend` service).
4. Hit a few API routes (not only `/api/health`).
5. In Azure: Application Insights → **Transaction search** / **Live Metrics** — requests should appear within a minute or two.

Without the env var, startup skips attach (expected).

### Render (free API)

1. Render dashboard → **karim-portfolio-api** (or your web service) → **Environment**.
2. Add:

| Key | Value |
|-----|--------|
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | paste connection string from Azure |

3. Save → wait for redeploy.
4. Smoke: `GET https://<service>.onrender.com/api/projects` (or Contact), then check Azure **Transaction search**.

`render.yaml` declares the key as `sync: false` so Blueprint prompts you; paste the value in the dashboard — never into the YAML file.

### Azure App Service (later)

Map the same name as an App Setting (or Key Vault reference). No code change.

---

## C. What is intentionally omitted

| Omitted | Why |
|---------|-----|
| Frontend `@microsoft/applicationinsights-web` | Extra page views / AJAX telemetry burns free GB; SPA already works without it |
| Hard-coded connection string | Secrets stay in env / host dashboards |
| Always-on attach | Local/CI would fail or spam without a resource |

If you later want browser telemetry, add it as a separate opt-in with a public instrumentation connection string and aggressive sampling — not part of PW-21.

---

## D. Verify without Azure

```bash
# From repo root — no APPLICATIONINSIGHTS_CONNECTION_STRING
cd backend && ./mvnw test
```

Context and API tests must pass with attach skipped. To exercise attach locally, set the env var to a real connection string for a short session, then unset it.

---

## E. Sampling knobs

Edit `backend/src/main/resources/applicationinsights.json`:

- `"percentage": 25` — raise only if you need denser traces; lower if ingestion climbs.
- Override for `url.path` = `/api/health` at `0` — Render health checks stay silent.

Docs: [Java agent configuration](https://learn.microsoft.com/en-us/azure/azure-monitor/app/java-standalone-config).
