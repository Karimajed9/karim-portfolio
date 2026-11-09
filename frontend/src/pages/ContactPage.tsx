import PageHeader from '../components/PageHeader'
import { site } from '../data/site'

export default function ContactPage() {
  return (
    <section>
      <PageHeader title={site.contact.title} subtitle={site.contact.subtitle} />
      <p className="prose-quiet">{site.contact.blurb}</p>
      <p className="mt-4">
        <a href={`mailto:${site.contact.email}`} className="text-link">
          {site.contact.email}
        </a>
      </p>
      <form
        className="mt-10 max-w-md space-y-5"
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <label className="field">
          <span className="field-label">Name</span>
          <input name="name" type="text" className="field-control" required />
        </label>
        <label className="field">
          <span className="field-label">Email</span>
          <input name="email" type="email" className="field-control" required />
        </label>
        <label className="field">
          <span className="field-label">Message</span>
          <textarea name="message" rows={4} className="field-control" required />
        </label>
        <button type="submit" className="btn btn-primary">
          Send
        </button>
      </form>
    </section>
  )
}
