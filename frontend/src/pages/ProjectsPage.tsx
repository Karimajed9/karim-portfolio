import PageHeader from '../components/PageHeader'
import { site } from '../data/site'

export default function ProjectsPage() {
  return (
    <section>
      <PageHeader title={site.projects.title} subtitle={site.projects.subtitle} />
      <ul className="mt-8 space-y-6">
        {site.projects.items.map((project) => (
          <li key={project.name}>
            <a
              href={project.href}
              target="_blank"
              rel="noreferrer"
              className="text-lg font-medium hover:underline"
            >
              {project.name}
            </a>
            <p className="mt-1 text-zinc-600">{project.summary}</p>
            <p className="mt-2 text-sm text-zinc-500">{project.tags.join(' · ')}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}