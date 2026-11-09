import PageHeader from '../components/PageHeader'
import { site } from '../data/site'

export default function ContactPage() {
  return (
    <section>
      <PageHeader title={site.contact.title} subtitle={site.contact.subtitle} />
      <p className="mt-4 max-w-xl text-zinc-600">{site.contact.blurb}</p>
      <p className="mt-2">
        <a href={`mailto:${site.contact.email}`} className="hover:underline">
          {site.contact.email}
        </a>
      </p>
      <form
        className="mt-8 max-w-md space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <label className="block">
          <span className="text-sm text-zinc-600">Name</span>
          <input
            name="name"
            type="text"
            className="mt-1 w-full border border-zinc-300 px-3 py-2"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm text-zinc-600">Email</span>
          <input
            name="email"
            type="email"
            className="mt-1 w-full border border-zinc-300 px-3 py-2"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm text-zinc-600">Message</span>
          <textarea
            name="message"
            rows={4}
            className="mt-1 w-full border border-zinc-300 px-3 py-2"
            required
          />
        </label>
        <button
          type="submit"
          className="border border-zinc-900 px-4 py-2 hover:bg-zinc-900 hover:text-white"
        >
          Send
        </button>
      </form>
    </section>
  )
}