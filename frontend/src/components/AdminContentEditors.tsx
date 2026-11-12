import { useEffect, useState } from 'react'
import { apiUrl } from '../api'
import { useLocale } from '../i18n/LocaleContext'
import StatusBanner from './StatusBanner'

type AuthProps = {
  csrfToken: string
}

type ExperienceItem = {
  id?: number
  company: string
  role: string
  startDate: string
  endDate: string
  location: string
  highlights: string
  sortOrder: number
}

type ProjectItem = {
  id?: number
  name: string
  summary: string
  tags: string
  href: string
}

type SkillItem = {
  id?: number
  category: string
  name: string
  sortOrder: number
}

type EducationItem = {
  id?: number
  school: string
  city: string
  degree: string
  country: string
  startDate: string
  endDate: string
  sortOrder: number
}

function highlightsToLines(value: string): string {
  return value
    .split('|||')
    .map((part) => part.trim())
    .filter(Boolean)
    .join('\n')
}

function linesToHighlights(value: string): string {
  return value
    .split(/\r?\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .join('|||')
}

async function readJson<T>(path: string): Promise<T> {
  const res = await fetch(apiUrl(path))
  if (!res.ok) throw new Error(`GET ${path} failed`)
  return (await res.json()) as T
}

export default function AdminContentEditors({ csrfToken }: AuthProps) {
  const { ui } = useLocale()
  const [experience, setExperience] = useState<ExperienceItem[]>([])
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [skills, setSkills] = useState<SkillItem[]>([])
  const [education, setEducation] = useState<EducationItem[]>([])
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [cvEnFile, setCvEnFile] = useState<File | null>(null)
  const [cvFrFile, setCvFrFile] = useState<File | null>(null)

  async function reload() {
    setError(null)
    const [experienceRows, projectRows, skillRows, about] = await Promise.all([
      readJson<ExperienceItem[]>('/api/experience'),
      readJson<ProjectItem[]>('/api/projects'),
      readJson<SkillItem[]>('/api/skills'),
      readJson<{ education: EducationItem[] }>('/api/about'),
    ])
    setExperience(
      experienceRows.map((row) => ({
        ...row,
        highlights: highlightsToLines(row.highlights ?? ''),
        sortOrder: row.sortOrder ?? 0,
      })),
    )
    setProjects(projectRows)
    setSkills(skillRows.map((row) => ({ ...row, sortOrder: row.sortOrder ?? 0 })))
    setEducation(
      (about.education ?? []).map((row) => ({
        ...row,
        sortOrder: row.sortOrder ?? 0,
      })),
    )
  }

  useEffect(() => {
    void reload().catch(() => setError(ui.admin.unreachable))
  }, [csrfToken, ui.admin.unreachable])

  async function mutate(
    key: string,
    method: 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: unknown,
  ) {
    setBusyKey(key)
    setStatus(null)
    setError(null)
    try {
      const res = await fetch(apiUrl(path), {
        method,
        credentials: 'include',
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      })
      if (!res.ok) {
        setError(ui.admin.saveFailed)
        return false
      }
      await reload()
      setStatus(ui.admin.saved)
      return true
    } catch {
      setError(ui.admin.unreachable)
      return false
    } finally {
      setBusyKey(null)
    }
  }

  async function uploadCv(slot: 'cv-en' | 'cv-fr', file: File | null) {
    if (!file) {
      setError(ui.admin.cvPickFile)
      return
    }
    setBusyKey(`cv-${slot}`)
    setStatus(null)
    setError(null)
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('slot', slot)
      const res = await fetch(apiUrl('/api/admin/uploads'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRF-TOKEN': csrfToken },
        body,
      })
      if (!res.ok) {
        setError(ui.admin.cvUploadFailed)
        return
      }
      if (slot === 'cv-en') setCvEnFile(null)
      else setCvFrFile(null)
      setStatus(ui.admin.cvSaved)
    } catch {
      setError(ui.admin.unreachable)
    } finally {
      setBusyKey(null)
    }
  }

  return (
    <div className="mt-10 space-y-10">
      <h2 className="section-label">{ui.admin.contentHeading}</h2>
      {status ? (
        <StatusBanner tone="success" role="status">
          {status}
        </StatusBanner>
      ) : null}
      {error ? (
        <StatusBanner tone="error" role="alert">
          {error}
        </StatusBanner>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-semibold tracking-tight">{ui.admin.experienceHeading}</h3>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              setExperience((rows) => [
                ...rows,
                {
                  company: '',
                  role: '',
                  startDate: '',
                  endDate: '',
                  location: '',
                  highlights: '',
                  sortOrder: rows.length + 1,
                },
              ])
            }
          >
            {ui.admin.add}
          </button>
        </div>
        {experience.map((row, index) => {
          const key = `experience-${row.id ?? `new-${index}`}`
          return (
            <article key={key} className="border border-line bg-surface p-5 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="field">
                  <span className="field-label">{ui.admin.company}</span>
                  <input
                    className="field-control"
                    value={row.company}
                    onChange={(e) =>
                      setExperience((rows) =>
                        rows.map((item, i) =>
                          i === index ? { ...item, company: e.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
                <label className="field">
                  <span className="field-label">{ui.admin.role}</span>
                  <input
                    className="field-control"
                    value={row.role}
                    onChange={(e) =>
                      setExperience((rows) =>
                        rows.map((item, i) =>
                          i === index ? { ...item, role: e.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
                <label className="field">
                  <span className="field-label">{ui.admin.startDate}</span>
                  <input
                    className="field-control"
                    value={row.startDate}
                    onChange={(e) =>
                      setExperience((rows) =>
                        rows.map((item, i) =>
                          i === index ? { ...item, startDate: e.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
                <label className="field">
                  <span className="field-label">{ui.admin.endDate}</span>
                  <input
                    className="field-control"
                    value={row.endDate}
                    onChange={(e) =>
                      setExperience((rows) =>
                        rows.map((item, i) =>
                          i === index ? { ...item, endDate: e.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
                <label className="field">
                  <span className="field-label">{ui.admin.location}</span>
                  <input
                    className="field-control"
                    value={row.location}
                    onChange={(e) =>
                      setExperience((rows) =>
                        rows.map((item, i) =>
                          i === index ? { ...item, location: e.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
                <label className="field">
                  <span className="field-label">{ui.admin.sortOrder}</span>
                  <input
                    type="number"
                    className="field-control"
                    value={row.sortOrder}
                    onChange={(e) =>
                      setExperience((rows) =>
                        rows.map((item, i) =>
                          i === index
                            ? { ...item, sortOrder: Number(e.target.value) || 0 }
                            : item,
                        ),
                      )
                    }
                  />
                </label>
              </div>
              <label className="field">
                <span className="field-label">{ui.admin.highlights}</span>
                <textarea
                  className="field-control min-h-28"
                  value={row.highlights}
                  onChange={(e) =>
                    setExperience((rows) =>
                      rows.map((item, i) =>
                        i === index ? { ...item, highlights: e.target.value } : item,
                      ),
                    )
                  }
                />
                <span className="text-sm text-muted">{ui.admin.highlightsHint}</span>
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={busyKey === key}
                  onClick={() =>
                    void mutate(
                      key,
                      row.id == null ? 'POST' : 'PUT',
                      row.id == null
                        ? '/api/admin/experience'
                        : `/api/admin/experience/${row.id}`,
                      {
                        company: row.company,
                        role: row.role,
                        startDate: row.startDate,
                        endDate: row.endDate,
                        location: row.location,
                        highlights: linesToHighlights(row.highlights),
                        sortOrder: row.sortOrder,
                      },
                    )
                  }
                >
                  {busyKey === key ? ui.admin.saving : ui.admin.save}
                </button>
                {row.id != null ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={busyKey === key}
                    onClick={() => void mutate(key, 'DELETE', `/api/admin/experience/${row.id}`)}
                  >
                    {ui.admin.remove}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      setExperience((rows) => rows.filter((_, i) => i !== index))
                    }
                  >
                    {ui.admin.remove}
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-semibold tracking-tight">{ui.admin.projectsHeading}</h3>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              setProjects((rows) => [
                ...rows,
                { name: '', summary: '', tags: '', href: '' },
              ])
            }
          >
            {ui.admin.add}
          </button>
        </div>
        {projects.map((row, index) => {
          const key = `project-${row.id ?? `new-${index}`}`
          return (
            <article key={key} className="border border-line bg-surface p-5 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="field">
                  <span className="field-label">{ui.admin.name}</span>
                  <input
                    className="field-control"
                    value={row.name}
                    onChange={(e) =>
                      setProjects((rows) =>
                        rows.map((item, i) =>
                          i === index ? { ...item, name: e.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
                <label className="field">
                  <span className="field-label">{ui.admin.href}</span>
                  <input
                    className="field-control"
                    value={row.href}
                    onChange={(e) =>
                      setProjects((rows) =>
                        rows.map((item, i) =>
                          i === index ? { ...item, href: e.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
              </div>
              <label className="field">
                <span className="field-label">{ui.admin.summary}</span>
                <textarea
                  className="field-control min-h-24"
                  value={row.summary}
                  onChange={(e) =>
                    setProjects((rows) =>
                      rows.map((item, i) =>
                        i === index ? { ...item, summary: e.target.value } : item,
                      ),
                    )
                  }
                />
              </label>
              <label className="field">
                <span className="field-label">{ui.admin.tags}</span>
                <input
                  className="field-control"
                  value={row.tags}
                  onChange={(e) =>
                    setProjects((rows) =>
                      rows.map((item, i) =>
                        i === index ? { ...item, tags: e.target.value } : item,
                      ),
                    )
                  }
                />
                <span className="text-sm text-muted">{ui.admin.tagsHint}</span>
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={busyKey === key}
                  onClick={() =>
                    void mutate(
                      key,
                      row.id == null ? 'POST' : 'PUT',
                      row.id == null ? '/api/admin/projects' : `/api/admin/projects/${row.id}`,
                      {
                        name: row.name,
                        summary: row.summary,
                        tags: row.tags,
                        href: row.href,
                      },
                    )
                  }
                >
                  {busyKey === key ? ui.admin.saving : ui.admin.save}
                </button>
                {row.id != null ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={busyKey === key}
                    onClick={() => void mutate(key, 'DELETE', `/api/admin/projects/${row.id}`)}
                  >
                    {ui.admin.remove}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setProjects((rows) => rows.filter((_, i) => i !== index))}
                  >
                    {ui.admin.remove}
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-semibold tracking-tight">{ui.admin.skillsHeading}</h3>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              setSkills((rows) => [
                ...rows,
                { category: '', name: '', sortOrder: rows.length + 1 },
              ])
            }
          >
            {ui.admin.add}
          </button>
        </div>
        {skills.map((row, index) => {
          const key = `skill-${row.id ?? `new-${index}`}`
          return (
            <article key={key} className="border border-line bg-surface p-5 space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <label className="field">
                  <span className="field-label">{ui.admin.category}</span>
                  <input
                    className="field-control"
                    value={row.category}
                    onChange={(e) =>
                      setSkills((rows) =>
                        rows.map((item, i) =>
                          i === index ? { ...item, category: e.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
                <label className="field">
                  <span className="field-label">{ui.admin.name}</span>
                  <input
                    className="field-control"
                    value={row.name}
                    onChange={(e) =>
                      setSkills((rows) =>
                        rows.map((item, i) =>
                          i === index ? { ...item, name: e.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
                <label className="field">
                  <span className="field-label">{ui.admin.sortOrder}</span>
                  <input
                    type="number"
                    className="field-control"
                    value={row.sortOrder}
                    onChange={(e) =>
                      setSkills((rows) =>
                        rows.map((item, i) =>
                          i === index
                            ? { ...item, sortOrder: Number(e.target.value) || 0 }
                            : item,
                        ),
                      )
                    }
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={busyKey === key}
                  onClick={() =>
                    void mutate(
                      key,
                      row.id == null ? 'POST' : 'PUT',
                      row.id == null ? '/api/admin/skills' : `/api/admin/skills/${row.id}`,
                      {
                        category: row.category,
                        name: row.name,
                        sortOrder: row.sortOrder,
                      },
                    )
                  }
                >
                  {busyKey === key ? ui.admin.saving : ui.admin.save}
                </button>
                {row.id != null ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={busyKey === key}
                    onClick={() => void mutate(key, 'DELETE', `/api/admin/skills/${row.id}`)}
                  >
                    {ui.admin.remove}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setSkills((rows) => rows.filter((_, i) => i !== index))}
                  >
                    {ui.admin.remove}
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-semibold tracking-tight">{ui.admin.educationHeading}</h3>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              setEducation((rows) => [
                ...rows,
                {
                  school: '',
                  city: '',
                  degree: '',
                  country: '',
                  startDate: '',
                  endDate: '',
                  sortOrder: rows.length + 1,
                },
              ])
            }
          >
            {ui.admin.add}
          </button>
        </div>
        {education.map((row, index) => {
          const key = `education-${row.id ?? `new-${index}`}`
          return (
            <article key={key} className="border border-line bg-surface p-5 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="field">
                  <span className="field-label">{ui.admin.school}</span>
                  <input
                    className="field-control"
                    value={row.school}
                    onChange={(e) =>
                      setEducation((rows) =>
                        rows.map((item, i) =>
                          i === index ? { ...item, school: e.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
                <label className="field">
                  <span className="field-label">{ui.admin.degree}</span>
                  <input
                    className="field-control"
                    value={row.degree}
                    onChange={(e) =>
                      setEducation((rows) =>
                        rows.map((item, i) =>
                          i === index ? { ...item, degree: e.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
                <label className="field">
                  <span className="field-label">{ui.admin.city}</span>
                  <input
                    className="field-control"
                    value={row.city}
                    onChange={(e) =>
                      setEducation((rows) =>
                        rows.map((item, i) =>
                          i === index ? { ...item, city: e.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
                <label className="field">
                  <span className="field-label">{ui.admin.country}</span>
                  <input
                    className="field-control"
                    value={row.country}
                    onChange={(e) =>
                      setEducation((rows) =>
                        rows.map((item, i) =>
                          i === index ? { ...item, country: e.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
                <label className="field">
                  <span className="field-label">{ui.admin.startDate}</span>
                  <input
                    className="field-control"
                    value={row.startDate}
                    onChange={(e) =>
                      setEducation((rows) =>
                        rows.map((item, i) =>
                          i === index ? { ...item, startDate: e.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
                <label className="field">
                  <span className="field-label">{ui.admin.endDate}</span>
                  <input
                    className="field-control"
                    value={row.endDate}
                    onChange={(e) =>
                      setEducation((rows) =>
                        rows.map((item, i) =>
                          i === index ? { ...item, endDate: e.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
                <label className="field">
                  <span className="field-label">{ui.admin.sortOrder}</span>
                  <input
                    type="number"
                    className="field-control"
                    value={row.sortOrder}
                    onChange={(e) =>
                      setEducation((rows) =>
                        rows.map((item, i) =>
                          i === index
                            ? { ...item, sortOrder: Number(e.target.value) || 0 }
                            : item,
                        ),
                      )
                    }
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={busyKey === key}
                  onClick={() =>
                    void mutate(
                      key,
                      row.id == null ? 'POST' : 'PUT',
                      row.id == null
                        ? '/api/admin/education'
                        : `/api/admin/education/${row.id}`,
                      {
                        school: row.school,
                        city: row.city,
                        degree: row.degree,
                        country: row.country,
                        startDate: row.startDate,
                        endDate: row.endDate,
                        sortOrder: row.sortOrder,
                      },
                    )
                  }
                >
                  {busyKey === key ? ui.admin.saving : ui.admin.save}
                </button>
                {row.id != null ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={busyKey === key}
                    onClick={() => void mutate(key, 'DELETE', `/api/admin/education/${row.id}`)}
                  >
                    {ui.admin.remove}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      setEducation((rows) => rows.filter((_, i) => i !== index))
                    }
                  >
                    {ui.admin.remove}
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold tracking-tight">{ui.admin.cvHeading}</h3>
        <p className="prose-quiet">{ui.admin.cvHint}</p>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="field">
            <span className="field-label">{ui.admin.cvEn}</span>
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="field-control"
              onChange={(e) => setCvEnFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              className="btn btn-primary mt-3"
              disabled={busyKey === 'cv-cv-en'}
              onClick={() => void uploadCv('cv-en', cvEnFile)}
            >
              {busyKey === 'cv-cv-en' ? ui.admin.saving : ui.admin.cvUploadEn}
            </button>
          </label>
          <label className="field">
            <span className="field-label">{ui.admin.cvFr}</span>
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="field-control"
              onChange={(e) => setCvFrFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              className="btn btn-primary mt-3"
              disabled={busyKey === 'cv-cv-fr'}
              onClick={() => void uploadCv('cv-fr', cvFrFile)}
            >
              {busyKey === 'cv-cv-fr' ? ui.admin.saving : ui.admin.cvUploadFr}
            </button>
          </label>
        </div>
      </section>
    </div>
  )
}
