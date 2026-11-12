import { useEffect, useState } from 'react'
import { useLocale } from '../i18n/LocaleContext'

type Props = {
  href?: string
}

function formatBoardTime(locale: string, at: number): string {
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(at))
}

export default function DeparturesBoard({ href = '#mobility' }: Props) {
  const { locale, site, ui } = useLocale()
  const [tick, setTick] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const time = formatBoardTime(locale, now)

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  function replay() {
    setTick((n) => n + 1)
  }

  return (
    <>
    <a
      href={href}
      className="board"
      aria-label={ui.home.boardAria}
      onMouseEnter={replay}
      onFocus={replay}
    >
      <div className="board-head">
        <span>{ui.home.departures}</span>
        <span>Montréal {time}</span>
      </div>
      <div className="board-grid" aria-hidden="true">
        {site.mobility.boardRows.map((row, rowIndex) => (
          <div key={`${row.join('-')}-${rowIndex}`} className="board-line">
            {row.map((segment, segIndex) => (
              <div key={`${segment}-${segIndex}`} className="board-segment">
                {segment.split('').map((ch, cellIndex) => (
                  <span
                    key={`${tick}-${rowIndex}-${segIndex}-${cellIndex}-${ch}`}
                    className="board-cell is-animating"
                    style={{
                      animationDelay: `${rowIndex * 70 + segIndex * 35 + cellIndex * 28}ms`,
                    }}
                  >
                    {ch}
                  </span>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="board-foot">
        <span className="board-foot-dot" aria-hidden="true" />
        <span>{site.mobility.boardFoot}</span>
      </div>
    </a>
    <a href={href} className="relocation-banner">
      <p className="relocation-banner-line">{site.mobility.headline}</p>
      <p className="relocation-banner-meta">
        {site.mobility.destinations.map((destination) => destination.name).join(' · ')}
      </p>
    </a>
    </>
  )
}
