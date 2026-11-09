type Props = { title: string; subtitle?: string }

export default function PageHeader({ title, subtitle }: Props) {
  return (
    <header className="page-header">
      <h1 className="page-title">{title}</h1>
      {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
    </header>
  )
}
