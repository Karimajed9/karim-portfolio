type Props = { title: string; subtitle?: string }

export default function PageHeader({ title, subtitle }: Props) {
  return (
    <header className="mb-10 space-y-3">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h1>
      {subtitle ? (
        <p className="max-w-2xl text-base leading-relaxed text-slate-600">{subtitle}</p>
      ) : null}
    </header>
  )
}