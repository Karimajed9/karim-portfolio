import { useId, useState, type FormEvent } from 'react'
import { apiUrl } from '../api'
import PageHeader from '../components/PageHeader'
import { site } from '../data/site'

export default function ContactPage() {
  const formId = useId()
  const [status, setStatus] = useState<{ kind: 'idle' | 'submitting' | 'success' | 'error'; message: string }>({
    kind: 'idle',
  })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const honeypot = String(data.get('website') ?? '').trim()

    // Bots that fill the hidden honeypot field are rejected client-side.
    if (honeypot.length > 0) {
      setStatus({ kind: 'error', message: 'Could not send message. Please try again.' })
      return
    }

    setStatus({ kind: 'submitting' })
    try {
      const res = await fetch(apiUrl('/api/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          message: data.get('message'),
          website: '',
        }),
      })
      if (res.status === 429) {
        setStatus({
          kind: 'error',
          message: 'Too many messages from this network. Please wait a minute and try again.',
        })
        return
      }
      if (!res.ok) {
        setStatus({
          kind: 'error',
          message: `Send failed. Email me at ${site.contact.email} if the API is offline.`,
        })
        return
      }
      form.reset()
      setStatus({ kind: 'success' })
    } catch {
      setStatus({
        kind: 'error',
        message: `Could not reach the API. Email me at ${site.contact.email} instead.`,
      })
    }
  }

  return (
    <section className="page-wrap">
      <PageHeader index="05" title={site.contact.title} subtitle={site.contact.subtitle} />
      <p className="prose-quiet">{site.contact.blurb}</p>
      <p className="mt-4">
        <a href={`mailto:${site.contact.email}`} className="text-link">
          {site.contact.email}
        </a>
      </p>
      <form className="mt-10 max-w-md space-y-5" onSubmit={handleSubmit} noValidate>
        {status.kind === 'success' ? (
          <p className="status-banner status-banner--success" role="status">
            Message sent. Thanks for reaching out.
          </p>
        ) : null}
        {status.kind === 'error' ? (
          <p className="status-banner status-banner--error" role="alert">
            {status.message}
          </p>
        ) : null}

        {/* Honeypot: hidden from people; bots often autofill it. */}
        <div className="hp-field" aria-hidden="true">
          <label htmlFor={`${formId}-website`}>Website</label>
          <input
            id={`${formId}-website`}
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

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
        <button type="submit" className="btn btn-primary" disabled={status.kind === 'submitting'}>
          {status.kind === 'submitting' ? 'Sending…' : 'Send'}
        </button>
      </form>
    </section>
  )
}
