import { Link } from 'react-router-dom'
import SectionHeading from '../components/SectionHeading'
import { useLocale } from '../i18n/LocaleContext'

export default function NotFoundPage() {
  const { ui } = useLocale()

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
