import { useEffect, useState } from 'react'
import { loadWithStaticFallback } from '../api'
import PageHeader from '../components/PageHeader'
import { site } from '../data/site'

type Project = {
  id: number
  name: string
  summary: string
  tags: string
  href: string
}

const staticProjects: Project[] = site.projects.items.map((item, index) => ({
  id: index + 1,
  name: item.name,
  summary: item.summary,
  tags: item.tags.join(','),
  href: item.href,
}))

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [usingStatic, setUsingStatic] = useState(false)

  useEffect(() => {
    let cancelled = false
    void loadWithStaticFallback<Project[]>('/api/projects', staticProjects, (data, staticMode) => {
      if (!cancelled) {
        setProjects(data)
        setUsingStatic(staticMode)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="page-wrap">
      <PageHeader
        index="04"
        title={site.projects.title}
        subtitle={site.projects.subtitle}
      />
      {usingStatic && (
        <p className="mt-4 text-sm text-muted">
          Showing static portfolio copy (API offline). Connect a free backend to load live data.
        </p>
      )}
      <ul className="project-list">
        {projects.map((project, i) => (
          <li key={project.id} className="project-item">
            <span className="project-index" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="project-body">
              <a
                href={project.href}
                target="_blank"
                rel="noreferrer"
                className="project-name"
              >
                {project.name}
              </a>
              <p className="project-summary">{project.summary}</p>
              <p className="project-tags">{project.tags.split(',').join(' · ')}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
