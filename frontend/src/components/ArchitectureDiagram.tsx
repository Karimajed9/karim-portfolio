import { Fragment } from 'react'

type Props = {
  caption: string
  /** Project tags. Omit this to keep the portfolio case study's own boxes. */
  nodes?: string[]
}

type LayerId = 'frontend' | 'api' | 'data' | 'tooling'

type StackLayer = {
  id: LayerId
  label: string
  className: string
  primary: string[]
  secondary: string[]
  dashed: boolean
}

const LAYER_META: Array<Omit<StackLayer, 'primary' | 'secondary'>> = [
  { id: 'frontend', label: 'Frontend', className: 'case-arch-node case-arch-node--spa', dashed: false },
  { id: 'api', label: 'API', className: 'case-arch-node case-arch-node--api', dashed: false },
  { id: 'data', label: 'Data', className: 'case-arch-node case-arch-node--db', dashed: false },
  {
    id: 'tooling',
    label: 'Tooling',
    className: 'case-arch-node case-arch-node--optional',
    dashed: true,
  },
]

/** Tags that already name a layer. Anything else is left off the board. */
const TAG_SLOTS: Array<{ name: string; layer: LayerId; role: 'primary' | 'secondary' }> = [
  { name: 'React', layer: 'frontend', role: 'primary' },
  { name: 'TypeScript', layer: 'frontend', role: 'primary' },
  { name: 'Vite', layer: 'frontend', role: 'primary' },
  { name: 'Tailwind CSS', layer: 'frontend', role: 'secondary' },
  { name: 'Electron', layer: 'frontend', role: 'secondary' },
  { name: 'Spring Boot', layer: 'api', role: 'primary' },
  { name: 'Java', layer: 'api', role: 'secondary' },
  { name: 'REST API', layer: 'api', role: 'secondary' },
  { name: 'API REST', layer: 'api', role: 'secondary' },
  { name: 'PostgreSQL', layer: 'data', role: 'primary' },
  { name: 'Docker', layer: 'tooling', role: 'primary' },
  { name: 'Maven', layer: 'tooling', role: 'primary' },
  { name: 'Testcontainers', layer: 'tooling', role: 'secondary' },
  { name: 'GitHub Actions', layer: 'tooling', role: 'secondary' },
]

function groupTagLayers(tags: string[]): StackLayer[] {
  const buckets: Record<LayerId, { primary: string[]; secondary: string[] }> = {
    frontend: { primary: [], secondary: [] },
    api: { primary: [], secondary: [] },
    data: { primary: [], secondary: [] },
    tooling: { primary: [], secondary: [] },
  }
  const seen = new Set<string>()
  for (const slot of TAG_SLOTS) {
    const found = tags.find((tag) => tag.trim().toLowerCase() === slot.name.toLowerCase())
    if (!found) continue
    const key = found.trim().toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    buckets[slot.layer][slot.role].push(found.trim())
  }
  return LAYER_META.flatMap((meta) => {
    const bucket = buckets[meta.id]
    const primary = bucket.primary.length > 0 ? bucket.primary : bucket.secondary
    const secondary = bucket.primary.length > 0 ? bucket.secondary : []
    if (primary.length === 0) return []
    return [{ ...meta, primary, secondary }]
  })
}

function LayerBox({ layer }: { layer: StackLayer }) {
  return (
    <div className={layer.className}>
      <span className="case-arch-kicker">{layer.label}</span>
      <strong>{layer.primary.join(' / ')}</strong>
      {layer.secondary.length > 0 ? <span>{layer.secondary.join(' · ')}</span> : null}
    </div>
  )
}

/** Portfolio boxes stay fixed. Other projects pass their own tags. */
export default function ArchitectureDiagram({ caption, nodes }: Props) {
  const layers = nodes ? groupTagLayers(nodes) : []
  const solid = layers.filter((layer) => !layer.dashed)
  const dashed = layers.filter((layer) => layer.dashed)
  return (
    <div className="case-arch">
      {nodes ? (
        <div className="case-arch-board">
          {solid.map((layer, index) => (
            <Fragment key={layer.id}>
              {index > 0 ? <div className="case-arch-arrow">↓</div> : null}
              <LayerBox layer={layer} />
            </Fragment>
          ))}
          {dashed.map((layer) => (
            <LayerBox key={layer.id} layer={layer} />
          ))}
        </div>
      ) : (
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
      )}
      {caption ? <p className="case-arch-caption">{caption}</p> : null}
    </div>
  )
}
