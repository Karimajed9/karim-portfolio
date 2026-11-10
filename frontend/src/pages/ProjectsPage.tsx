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
    <section>
      <PageHeader title={site.projects.title} subtitle={site.projects.subtitle} />
      {error && <p className="mt-4 text-red-600">{error}</p>}
      <ul className="mt-8 space-y-6">
        {projects.map((project) => (
          <li key={project.id}>
            <a href={project.href} target="_blank" rel="noreferrer" className="text-lg font-medium hover:underline">
              {project.name}
            </a>
            <p className="mt-1 text-zinc-600">{project.summary}</p>
            <p className="mt-2 text-sm text-zinc-500">{project.tags.split(',').join(' · ')}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}