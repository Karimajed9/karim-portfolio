import { Link } from 'react-router-dom'
import { site } from '../data/site'

export default function HomePage() {
  return (
    <section className="space-y-6">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
        {site.title}
      </p>
      <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
        {site.name}
      </h1>
      <p className="max-w-2xl text-lg text-slate-600">
        {site.description}
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          to="/projects"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          View projects
        </Link>
        <Link
          to="/contact"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-white"
        >
          Contact me
        </Link>
      </div>
      <div className="flex gap-4 text-sm text-slate-600">
        <a href={site.githubUrl} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href={site.linkedInUrl} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
      </div>
    </section>
  )
}