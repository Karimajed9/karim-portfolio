import PageHeader from '../components/PageHeader'
import { site } from '../data/site'

export default function ProjectsPage() {
  return (
    <section>
      <PageHeader title={site.projects.title} subtitle={site.projects.subtitle} />
      <ul className="space-y-8">
        {site.projects.items.map((project) => (
          <li key={project.name} className="border-t border-line pt-6">
            <a
              href={project.href}
              target="_blank"
              rel="noreferrer"
              className="font-display text-xl font-bold tracking-tight text-ink transition-colors duration-200 hover:text-accent"
            >
              {project.name}
            </a>
            <p className="mt-2 max-w-xl text-ink-soft">{project.summary}</p>
            <p className="mt-3 text-sm text-muted">{project.tags.join(' · ')}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
