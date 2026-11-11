type Props = {
  label: string
}

export default function ArchitecturalVisual({ label }: Props) {
  return (
    <div className="blueprint" aria-hidden="true">
      <div className="blueprint-grid" />
      <svg
        className="blueprint-svg"
        viewBox="0 0 480 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="presentation"
      >
        <g stroke="var(--color-accent)" strokeWidth="1.25" opacity="0.9">
          <path
            className="blueprint-path"
            d="M72 292 V118 H148 V292 M148 148 H214 V292 M214 98 H308 V292 M308 168 H408 V292"
          />
          <path
            className="blueprint-path"
            d="M72 118 L148 72 L214 98 L308 54 L408 112"
          />
          <path d="M96 148 H124 M96 178 H124 M96 208 H124 M96 238 H124" opacity="0.55" />
          <path d="M168 178 H196 M168 208 H196 M168 238 H196" opacity="0.55" />
          <path
            d="M238 128 H284 M238 158 H284 M238 188 H284 M238 218 H284 M238 248 H284"
            opacity="0.55"
          />
          <path d="M332 198 H384 M332 228 H384 M332 258 H384" opacity="0.55" />
          <path d="M48 292 H432" stroke="var(--color-ink-soft)" opacity="0.5" />
          <path d="M48 40 V320 M432 40 V320" stroke="var(--color-line)" />
          <circle cx="148" cy="72" r="3" fill="var(--color-accent)" />
          <circle cx="308" cy="54" r="3" fill="var(--color-accent)" />
        </g>
        <g fontFamily="IBM Plex Mono, monospace" fontSize="10" fill="var(--color-muted)">
          <text x="72" y="308">A</text>
          <text x="214" y="308">B</text>
          <text x="308" y="308">C</text>
          <text x="400" y="308">D</text>
          <text x="420" y="52">01</text>
        </g>
      </svg>
      <span className="blueprint-label">{label}</span>
    </div>
  )
}
