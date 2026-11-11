import { useMemo } from 'react'
import ApiFallbackBanner from '../components/ApiFallbackBanner'
import PageHeader from '../components/PageHeader'
import ProjectList, { type ProjectListItem } from '../components/ProjectList'
import { useLocale } from '../i18n/LocaleContext'
import type { SiteContent } from '../i18n/types'
import { useStaticApiResource } from '../lib/useStaticApiResource'

type Project = {
  id: number
  name: string
  summary: string
  tags: string
  href: string
}

function buildStaticProjects(site: SiteContent): Project[] {
  return site.projects.items.map((item, index) => ({
    id: index + 1,
    name: item.name,
    summary: item.summary,
    tags: item.tags.join(','),
    href: item.href,
  }))
}

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
  const { locale, site, ui } = useLocale()
  const staticProjects = useMemo(() => buildStaticProjects(site), [site])
  const { data: projects, fallbackReason } = useStaticApiResource(
    '/api/projects',
    staticProjects,
    locale,
  )

  return (
    <section className="page-wrap">
      <PageHeader
        index="04"
        title={ui.projects.title}
        subtitle={site.projects.subtitle}
      />
      {fallbackReason ? <ApiFallbackBanner reason={fallbackReason} /> : null}

      <ProjectList projects={toListItems(projects)} />
    </section>
  )
}
