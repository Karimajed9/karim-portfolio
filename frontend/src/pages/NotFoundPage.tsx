import { Link, useLocation } from 'react-router-dom'
import SectionHeading from '../components/SectionHeading'
import { useLocale } from '../i18n/LocaleContext'
import { useDocumentSeo } from '../lib/siteSeo'

export default function NotFoundPage() {
  const { site, ui } = useLocale()
  const { pathname } = useLocation()
  useDocumentSeo({
    title: `${ui.notFound.title} | ${site.name}`,
    description: ui.notFound.subtitle,
    path: pathname,
    index: false,
  })

  return (
    <section className="page-wrap">
      <SectionHeading title={ui.notFound.title} index="404" />
      <p className="profile-lede profile-lede--compact">{ui.notFound.subtitle}</p>
      <p className="contact-blurb">{ui.notFound.body}</p>
      <div className="hero-actions">
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
