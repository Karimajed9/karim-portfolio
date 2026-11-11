import ContactForm from '../components/ContactForm'
import SectionHeading from '../components/SectionHeading'
import { useLocale } from '../i18n/LocaleContext'
import { cvEnPath, cvFrPath } from '../lib/cv'

export default function ContactPage() {
  const { site, ui } = useLocale()

  return (
    <section className="page-wrap">
      <SectionHeading title={ui.contact.title} index="07" />
      <div className="contact-email-row">
        <a href={`mailto:${site.contact.email}`} className="contact-email">
          {site.contact.email}
        </a>
      </div>
      <p className="contact-blurb">{site.contact.blurb}</p>
      <div className="hero-actions hero-actions--compact">
        <a href={cvEnPath} className="btn btn-secondary" download>
          {ui.cv.downloadEn}
        </a>
        <a href={cvFrPath} className="btn btn-secondary" download>
          {ui.cv.downloadFr}
        </a>
      </div>
      <ContactForm />
    </section>
  )
}
