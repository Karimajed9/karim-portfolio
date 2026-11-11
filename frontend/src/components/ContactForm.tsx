import { useId, useState, type FormEvent } from 'react'
import { apiUrl } from '../api'
import { useLocale } from '../i18n/LocaleContext'
import StatusBanner from './StatusBanner'

type FieldErrors = {
  name?: string
  email?: string
  message?: string
}

type FormStatus =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | { kind: 'error'; message: string }

function validateEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default function ContactForm() {
  const { site, ui } = useLocale()
  const formId = useId()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<FormStatus>({ kind: 'idle' })

  function validate(fields: { name: string; email: string; message: string }): FieldErrors {
    const next: FieldErrors = {}
    if (fields.name.trim().length < 2) next.name = ui.contact.nameError
    if (!validateEmail(fields.email.trim())) next.email = ui.contact.emailError
    if (fields.message.trim().length < 10) next.message = ui.contact.messageError
    return next
  }

  function withEmail(template: string): string {
    return template.replace('{email}', site.contact.email)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (website.trim().length > 0) {
      setStatus({ kind: 'error', message: ui.contact.honeypotRejected })
      return
    }

    const nextErrors = validate({ name, email, message })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setStatus({ kind: 'idle' })
      return
    }

    setStatus({ kind: 'submitting' })
    try {
      const res = await fetch(apiUrl('/api/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          website: '',
        }),
      })
      if (res.status === 429) {
        setStatus({ kind: 'error', message: ui.contact.rateLimited })
        return
      }
      if (!res.ok) {
        setStatus({ kind: 'error', message: withEmail(ui.contact.sendFailed) })
        return
      }
      setName('')
      setEmail('')
      setMessage('')
      setWebsite('')
      setErrors({})
      setStatus({ kind: 'success' })
    } catch {
      setStatus({ kind: 'error', message: withEmail(ui.contact.unreachable) })
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      {status.kind === 'success' ? (
        <StatusBanner tone="success" role="status">
          {ui.contact.success}
        </StatusBanner>
      ) : null}
      {status.kind === 'error' ? (
        <StatusBanner tone="error" role="alert">
          {status.message}
        </StatusBanner>
      ) : null}

      <div className="hp-field" aria-hidden="true">
        <label htmlFor={`${formId}-website`}>Website</label>
        <input
          id={`${formId}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <label className="field" htmlFor={`${formId}-name`}>
        <span className="field-label">{ui.contact.name}</span>
        <input
          id={`${formId}-name`}
          name="name"
          type="text"
          autoComplete="name"
          className="field-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? `${formId}-name-error` : undefined}
          required
        />
        {errors.name ? (
          <p id={`${formId}-name-error`} className="field-error" role="alert">
            {errors.name}
          </p>
        ) : null}
      </label>

      <label className="field" htmlFor={`${formId}-email`}>
        <span className="field-label">{ui.contact.email}</span>
        <input
          id={`${formId}-email`}
          name="email"
          type="email"
          autoComplete="email"
          className="field-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? `${formId}-email-error` : undefined}
          required
        />
        {errors.email ? (
          <p id={`${formId}-email-error`} className="field-error" role="alert">
            {errors.email}
          </p>
        ) : null}
      </label>

      <label className="field" htmlFor={`${formId}-message`}>
        <span className="field-label">{ui.contact.message}</span>
        <textarea
          id={`${formId}-message`}
          name="message"
          rows={5}
          className="field-control"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? `${formId}-message-error` : undefined}
          required
        />
        {errors.message ? (
          <p id={`${formId}-message-error`} className="field-error" role="alert">
            {errors.message}
          </p>
        ) : null}
      </label>

      <button type="submit" className="btn btn-primary" disabled={status.kind === 'submitting'}>
        {status.kind === 'submitting' ? ui.contact.sending : ui.contact.send}
      </button>
    </form>
  )
}
