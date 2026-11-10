import { useEffect, useState } from 'react'
import { apiUrl } from '../api'
import PageHeader from '../components/PageHeader'
import { site } from '../data/site'

type Project = {
  id: number
  name: string
  summary: string
  tags: string
  href: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(apiUrl('/api/projects'))
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load projects')
        return r.json()
      })
      .then(setProjects)
      .catch((e) => setError(e.message))
  }, [])

  return (
    <section className="page-wrap">
      <PageHeader
        index="04"
        title={site.projects.title}
        subtitle={site.projects.subtitle}
      />
      {error && <p className="mt-4 text-red-600">{error}</p>}
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
