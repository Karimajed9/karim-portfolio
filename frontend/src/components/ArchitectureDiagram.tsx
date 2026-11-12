type Props = {
  caption: string
}

/** Stack diagram from verified repo workflows — SWA frontend, Render API. */
export default function ArchitectureDiagram({ caption }: Props) {
  return (
    <div className="case-arch">
      <div className="case-arch-board" aria-hidden="true">
        <div className="case-arch-node case-arch-node--spa">
          <span className="case-arch-kicker">Frontend</span>
          <strong>React / TypeScript / Vite</strong>
          <span>Azure Static Web Apps</span>
        </div>
        <div className="case-arch-arrow">↓ REST</div>
        <div className="case-arch-node case-arch-node--api">
          <span className="case-arch-kicker">API</span>
          <strong>Spring Boot / Flyway</strong>
          <span>Render</span>
        </div>
        <div className="case-arch-arrow">↓ JDBC</div>
        <div className="case-arch-node case-arch-node--db">
          <span className="case-arch-kicker">Data</span>
          <strong>PostgreSQL 16</strong>
          <span>Render · Docker Compose locally</span>
        </div>
        <div className="case-arch-node case-arch-node--optional">
          <span className="case-arch-kicker">Optional</span>
          <strong>Azure Blob · Application Insights</strong>
          <span>Code paths with local / no-op fallbacks</span>
        </div>
      </div>
      {caption ? <p className="case-arch-caption">{caption}</p> : null}
    </div>
  )
}
