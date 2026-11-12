import { useLocale } from '../i18n/LocaleContext'

type Props = {
  caption: string
}

/** Stack diagram from verified repo pieces — no invented cloud topology. */
export default function ArchitectureDiagram({ caption }: Props) {
  const { ui } = useLocale()

  return (
    <div className="case-arch">
      <div className="case-arch-board" aria-hidden="true">
        <div className="case-arch-node case-arch-node--spa">
          <span className="case-arch-kicker">Frontend</span>
          <strong>React / TypeScript / Vite</strong>
          <span>GitHub Pages</span>
        </div>
        <div className="case-arch-arrow">↓ REST</div>
        <div className="case-arch-node case-arch-node--api">
          <span className="case-arch-kicker">API</span>
          <strong>Spring Boot / Flyway</strong>
          <span>Render (scaffolded)</span>
        </div>
        <div className="case-arch-arrow">↓ JDBC</div>
        <div className="case-arch-node case-arch-node--db">
          <span className="case-arch-kicker">Data</span>
          <strong>PostgreSQL 16</strong>
          <span>Docker Compose locally</span>
        </div>
        <div className="case-arch-planned">
          <span className="case-arch-kicker">{ui.caseStudy.plannedNote}</span>
          <strong>Azure hosting</strong>
          <span>Blob / Key Vault / App Insights code paths with local fallbacks</span>
        </div>
      </div>
      {caption ? <p className="case-arch-caption">{caption}</p> : null}
    </div>
  )
}
