type Props = { title: string; subtitle?: string; index?: string }

export default function PageHeader({ title, subtitle, index }: Props) {
  return (
    <header className="page-header">
      {index ? <p className="page-index">{index}</p> : null}
      <h1 className="page-title">{title}</h1>
      {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      <div className="page-rule" aria-hidden="true" />
    </header>
  )
}
