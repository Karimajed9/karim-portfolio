import { useEffect, useState } from 'react'
import { loadWithStaticFallback, type ApiFallbackReason } from '../api'
import ApiFallbackBanner from '../components/ApiFallbackBanner'
import PageHeader from '../components/PageHeader'
import ProjectList, { type ProjectListItem } from '../components/ProjectList'
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

function toListItems(projects: Project[]): ProjectListItem[] {
  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    summary: project.summary,
    tags: project.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    href: project.href,
  }))
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [fallbackReason, setFallbackReason] = useState<ApiFallbackReason | null>(null)

  useEffect(() => {
    let cancelled = false
    void loadWithStaticFallback<Project[]>('/api/projects', staticProjects, (data, meta) => {
      if (!cancelled) {
        setProjects(data)
        setFallbackReason(meta.usingStatic ? (meta.reason ?? 'offline') : null)
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
        subtitle="Editorial showcase of selected work. Case studies can expand as project fields grow."
      />
      {fallbackReason ? <ApiFallbackBanner reason={fallbackReason} /> : null}

      {projects.length === 0 ? (
        <p className="prose-quiet">Loading projects…</p>
      ) : (
        <ProjectList projects={toListItems(projects)} />
      )}
    </section>
  )
}
