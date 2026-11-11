import { useMemo } from 'react'
import ApiFallbackBanner from '../components/ApiFallbackBanner'
import PageHeader from '../components/PageHeader'
import { useLocale } from '../i18n/LocaleContext'
import type { SiteContent } from '../i18n/types'
import { groupSkillsByDomain, type SkillDomain } from '../lib/skills'
import { useStaticApiResource } from '../lib/useStaticApiResource'

type Skill = {
  id: number
  category: string
  name: string
  sortOrder: number
}

function buildStaticSkills(site: SiteContent): Skill[] {
  return site.skills.flatMap((group, groupIndex) =>
    group.items.map((name, itemIndex) => ({
      id: groupIndex * 100 + itemIndex + 1,
      category: group.category,
      name,
      sortOrder: itemIndex + 1,
    })),
  )
}

export default function SkillsPage() {
  const { locale, site, ui } = useLocale()
  const staticSkills = useMemo(() => buildStaticSkills(site), [site])
  const { data: skills, fallbackReason } = useStaticApiResource(
    '/api/skills',
    staticSkills,
    locale,
  )

  const domainLabel: Record<SkillDomain, string> = {
    Backend: ui.skills.domains.backend,
    Frontend: ui.skills.domains.frontend,
    Cloud: ui.skills.domains.cloud,
    Databases: ui.skills.domains.databases,
    Tools: ui.skills.domains.tools,
  }

  const groups = groupSkillsByDomain(skills)

  return (
    <section className="page-wrap">
      <PageHeader index="02" title={ui.nav.skills} subtitle={ui.skills.subtitle} />
      {fallbackReason ? <ApiFallbackBanner reason={fallbackReason} /> : null}

      <div className="domain-grid">
        {groups.map((group) => (
          <article key={group.domain} className="domain-card">
            <h2 className="domain-title">{domainLabel[group.domain]}</h2>
            {group.primary.length > 0 ? (
              <div className="mb-4">
                <p className="section-label !mb-2">{ui.skills.main}</p>
                <ul className="domain-list">
                  {group.primary.map((item) => (
                    <li key={item.id} className="chip chip--primary">
                      {item.name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {group.supporting.length > 0 ? (
              <div>
                <p className="section-label !mb-2">{ui.skills.alsoUse}</p>
                <ul className="domain-list">
                  {group.supporting.map((item) => (
                    <li key={item.id} className="chip">
                      {item.name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}
