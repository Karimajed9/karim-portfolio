import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { useLocale } from '../i18n/LocaleContext'

export default function NotFoundPage() {
  const { ui } = useLocale()

  return (
    <section className="page-wrap">
      <PageHeader
        index="404"
        title={ui.notFound.title}
        subtitle={ui.notFound.subtitle}
      />
      <p className="prose-quiet">{ui.notFound.body}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/" className="btn btn-primary">
          {ui.notFound.goHome}
        </Link>
        <Link to="/contact" className="btn btn-secondary">
          {ui.notFound.contact}
        </Link>
      </div>
    </section>
  )
}
