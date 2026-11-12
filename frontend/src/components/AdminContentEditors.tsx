import { useEffect, useState } from 'react'
import { apiUrl } from '../api'
import { useLocale } from '../i18n/LocaleContext'
import StatusBanner from './StatusBanner'

export type AdminEditorPanel = 'experience' | 'projects' | 'skills' | 'education' | 'cv'

type AuthProps = {
  csrfToken: string
  panel: AdminEditorPanel
  /** Bump to re-fetch public content after Refresh. */
  reloadToken?: number
}

type ExperienceItem = {
  id?: number
  companyEn: string
  companyFr: string
  roleEn: string
  roleFr: string
  startDate: string
  endDate: string
  locationEn: string
  locationFr: string
  highlightsEn: string
  highlightsFr: string
  sortOrder: number
}

type ProjectItem = {
  id?: number
  nameEn: string
  nameFr: string
  summaryEn: string
  summaryFr: string
  tagsEn: string
  tagsFr: string
  href: string
}

type SkillItem = {
  id?: number
  categoryEn: string
  categoryFr: string
  nameEn: string
  nameFr: string
  sortOrder: number
}

type EducationItem = {
  id?: number
  schoolEn: string
  schoolFr: string
  cityEn: string
  cityFr: string
  degreeEn: string
  degreeFr: string
  countryEn: string
  countryFr: string
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

function emptyToString(value: string | null | undefined): string {
  return value ?? ''
}

async function readJson<T>(path: string): Promise<T> {
  const res = await fetch(apiUrl(path))
  if (!res.ok) throw new Error(`GET ${path} failed`)
  return (await res.json()) as T
}

export default function AdminContentEditors({
  csrfToken,
  panel,
  reloadToken = 0,
}: AuthProps) {
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
  const [cvEnInputKey, setCvEnInputKey] = useState(0)
  const [cvFrInputKey, setCvFrInputKey] = useState(0)

  const labelEn = (base: string) => `${base} (${ui.admin.langEn})`
  const labelFr = (base: string) => `${base} (${ui.admin.langFr})`

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
        companyEn: emptyToString(row.companyEn),
        companyFr: emptyToString(row.companyFr),
        roleEn: emptyToString(row.roleEn),
        roleFr: emptyToString(row.roleFr),
        locationEn: emptyToString(row.locationEn),
        locationFr: emptyToString(row.locationFr),
        highlightsEn: highlightsToLines(emptyToString(row.highlightsEn)),
        highlightsFr: highlightsToLines(emptyToString(row.highlightsFr)),
        sortOrder: row.sortOrder ?? 0,
      })),
    )
    setProjects(
      projectRows.map((row) => ({
        ...row,
        nameEn: emptyToString(row.nameEn),
        nameFr: emptyToString(row.nameFr),
        summaryEn: emptyToString(row.summaryEn),
        summaryFr: emptyToString(row.summaryFr),
        tagsEn: emptyToString(row.tagsEn),
        tagsFr: emptyToString(row.tagsFr),
        href: emptyToString(row.href),
      })),
    )
    setSkills(
      skillRows.map((row) => ({
        ...row,
        categoryEn: emptyToString(row.categoryEn),
        categoryFr: emptyToString(row.categoryFr),
        nameEn: emptyToString(row.nameEn),
        nameFr: emptyToString(row.nameFr),
        sortOrder: row.sortOrder ?? 0,
      })),
    )
    setEducation(
      (about.education ?? []).map((row) => ({
        ...row,
        schoolEn: emptyToString(row.schoolEn),
        schoolFr: emptyToString(row.schoolFr),
        cityEn: emptyToString(row.cityEn),
        cityFr: emptyToString(row.cityFr),
        degreeEn: emptyToString(row.degreeEn),
        degreeFr: emptyToString(row.degreeFr),
        countryEn: emptyToString(row.countryEn),
        countryFr: emptyToString(row.countryFr),
        sortOrder: row.sortOrder ?? 0,
      })),
    )
  }

  useEffect(() => {
    void reload().catch(() => setError(ui.admin.unreachable))
  }, [csrfToken, reloadToken, ui.admin.unreachable])

  useEffect(() => {
    setStatus(null)
    setError(null)
  }, [panel])

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
    setBusyKey(slot)
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
      if (slot === 'cv-en') {
        setCvEnFile(null)
        setCvEnInputKey((n) => n + 1)
      } else {
        setCvFrFile(null)
        setCvFrInputKey((n) => n + 1)
      }
      setStatus(ui.admin.cvSaved)
    } catch {
      setError(ui.admin.unreachable)
    } finally {
      setBusyKey(null)
    }
  }

  return (
    <div className="mt-6 space-y-6">
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

      {panel === 'experience' ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="section-label">{ui.admin.experienceHeading}</h2>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                setExperience((rows) => [
                  ...rows,
                  {
                    companyEn: '',
                    companyFr: '',
                    roleEn: '',
                    roleFr: '',
                    startDate: '',
                    endDate: '',
                    locationEn: '',
                    locationFr: '',
                    highlightsEn: '',
                    highlightsFr: '',
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
                    <span className="field-label">{labelEn(ui.admin.company)}</span>
                    <input
                      className="field-control"
                      value={row.companyEn}
                      onChange={(e) =>
                        setExperience((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, companyEn: e.target.value } : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelFr(ui.admin.company)}</span>
                    <input
                      className="field-control"
                      value={row.companyFr}
                      onChange={(e) =>
                        setExperience((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, companyFr: e.target.value } : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelEn(ui.admin.role)}</span>
                    <input
                      className="field-control"
                      value={row.roleEn}
                      onChange={(e) =>
                        setExperience((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, roleEn: e.target.value } : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelFr(ui.admin.role)}</span>
                    <input
                      className="field-control"
                      value={row.roleFr}
                      onChange={(e) =>
                        setExperience((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, roleFr: e.target.value } : item,
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
                    <span className="field-label">{labelEn(ui.admin.location)}</span>
                    <input
                      className="field-control"
                      value={row.locationEn}
                      onChange={(e) =>
                        setExperience((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, locationEn: e.target.value } : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelFr(ui.admin.location)}</span>
                    <input
                      className="field-control"
                      value={row.locationFr}
                      onChange={(e) =>
                        setExperience((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, locationFr: e.target.value } : item,
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
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="field">
                    <span className="field-label">{labelEn(ui.admin.highlights)}</span>
                    <textarea
                      className="field-control min-h-28"
                      value={row.highlightsEn}
                      onChange={(e) =>
                        setExperience((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, highlightsEn: e.target.value } : item,
                          ),
                        )
                      }
                    />
                    <span className="text-sm text-muted">{ui.admin.highlightsHint}</span>
                  </label>
                  <label className="field">
                    <span className="field-label">{labelFr(ui.admin.highlights)}</span>
                    <textarea
                      className="field-control min-h-28"
                      value={row.highlightsFr}
                      onChange={(e) =>
                        setExperience((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, highlightsFr: e.target.value } : item,
                          ),
                        )
                      }
                    />
                    <span className="text-sm text-muted">{ui.admin.highlightsHint}</span>
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
                          ? '/api/admin/experience'
                          : `/api/admin/experience/${row.id}`,
                        {
                          companyEn: row.companyEn,
                          companyFr: row.companyFr,
                          roleEn: row.roleEn,
                          roleFr: row.roleFr,
                          startDate: row.startDate,
                          endDate: row.endDate,
                          locationEn: row.locationEn,
                          locationFr: row.locationFr,
                          highlightsEn: linesToHighlights(row.highlightsEn),
                          highlightsFr: linesToHighlights(row.highlightsFr),
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
                      onClick={() =>
                        void mutate(key, 'DELETE', `/api/admin/experience/${row.id}`)
                      }
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
      ) : null}

      {panel === 'projects' ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="section-label">{ui.admin.projectsHeading}</h2>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                setProjects((rows) => [
                  ...rows,
                  {
                    nameEn: '',
                    nameFr: '',
                    summaryEn: '',
                    summaryFr: '',
                    tagsEn: '',
                    tagsFr: '',
                    href: '',
                  },
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
                    <span className="field-label">{labelEn(ui.admin.name)}</span>
                    <input
                      className="field-control"
                      value={row.nameEn}
                      onChange={(e) =>
                        setProjects((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, nameEn: e.target.value } : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelFr(ui.admin.name)}</span>
                    <input
                      className="field-control"
                      value={row.nameFr}
                      onChange={(e) =>
                        setProjects((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, nameFr: e.target.value } : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="field md:col-span-2">
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
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="field">
                    <span className="field-label">{labelEn(ui.admin.summary)}</span>
                    <textarea
                      className="field-control min-h-24"
                      value={row.summaryEn}
                      onChange={(e) =>
                        setProjects((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, summaryEn: e.target.value } : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelFr(ui.admin.summary)}</span>
                    <textarea
                      className="field-control min-h-24"
                      value={row.summaryFr}
                      onChange={(e) =>
                        setProjects((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, summaryFr: e.target.value } : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelEn(ui.admin.tags)}</span>
                    <input
                      className="field-control"
                      value={row.tagsEn}
                      onChange={(e) =>
                        setProjects((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, tagsEn: e.target.value } : item,
                          ),
                        )
                      }
                    />
                    <span className="text-sm text-muted">{ui.admin.tagsHint}</span>
                  </label>
                  <label className="field">
                    <span className="field-label">{labelFr(ui.admin.tags)}</span>
                    <input
                      className="field-control"
                      value={row.tagsFr}
                      onChange={(e) =>
                        setProjects((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, tagsFr: e.target.value } : item,
                          ),
                        )
                      }
                    />
                    <span className="text-sm text-muted">{ui.admin.tagsHint}</span>
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
                        row.id == null ? '/api/admin/projects' : `/api/admin/projects/${row.id}`,
                        {
                          nameEn: row.nameEn,
                          nameFr: row.nameFr,
                          summaryEn: row.summaryEn,
                          summaryFr: row.summaryFr,
                          tagsEn: row.tagsEn,
                          tagsFr: row.tagsFr,
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
      ) : null}

      {panel === 'skills' ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="section-label">{ui.admin.skillsHeading}</h2>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                setSkills((rows) => [
                  ...rows,
                  {
                    categoryEn: '',
                    categoryFr: '',
                    nameEn: '',
                    nameFr: '',
                    sortOrder: rows.length + 1,
                  },
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
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="field">
                    <span className="field-label">{labelEn(ui.admin.category)}</span>
                    <input
                      className="field-control"
                      value={row.categoryEn}
                      onChange={(e) =>
                        setSkills((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, categoryEn: e.target.value } : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelFr(ui.admin.category)}</span>
                    <input
                      className="field-control"
                      value={row.categoryFr}
                      onChange={(e) =>
                        setSkills((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, categoryFr: e.target.value } : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelEn(ui.admin.name)}</span>
                    <input
                      className="field-control"
                      value={row.nameEn}
                      onChange={(e) =>
                        setSkills((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, nameEn: e.target.value } : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelFr(ui.admin.name)}</span>
                    <input
                      className="field-control"
                      value={row.nameFr}
                      onChange={(e) =>
                        setSkills((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, nameFr: e.target.value } : item,
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
                          categoryEn: row.categoryEn,
                          categoryFr: row.categoryFr,
                          nameEn: row.nameEn,
                          nameFr: row.nameFr,
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
      ) : null}

      {panel === 'education' ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="section-label">{ui.admin.educationHeading}</h2>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                setEducation((rows) => [
                  ...rows,
                  {
                    schoolEn: '',
                    schoolFr: '',
                    cityEn: '',
                    cityFr: '',
                    degreeEn: '',
                    degreeFr: '',
                    countryEn: '',
                    countryFr: '',
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
                    <span className="field-label">{labelEn(ui.admin.school)}</span>
                    <input
                      className="field-control"
                      value={row.schoolEn}
                      onChange={(e) =>
                        setEducation((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, schoolEn: e.target.value } : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelFr(ui.admin.school)}</span>
                    <input
                      className="field-control"
                      value={row.schoolFr}
                      onChange={(e) =>
                        setEducation((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, schoolFr: e.target.value } : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelEn(ui.admin.degree)}</span>
                    <input
                      className="field-control"
                      value={row.degreeEn}
                      onChange={(e) =>
                        setEducation((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, degreeEn: e.target.value } : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelFr(ui.admin.degree)}</span>
                    <input
                      className="field-control"
                      value={row.degreeFr}
                      onChange={(e) =>
                        setEducation((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, degreeFr: e.target.value } : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelEn(ui.admin.city)}</span>
                    <input
                      className="field-control"
                      value={row.cityEn}
                      onChange={(e) =>
                        setEducation((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, cityEn: e.target.value } : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelFr(ui.admin.city)}</span>
                    <input
                      className="field-control"
                      value={row.cityFr}
                      onChange={(e) =>
                        setEducation((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, cityFr: e.target.value } : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelEn(ui.admin.country)}</span>
                    <input
                      className="field-control"
                      value={row.countryEn}
                      onChange={(e) =>
                        setEducation((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, countryEn: e.target.value } : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelFr(ui.admin.country)}</span>
                    <input
                      className="field-control"
                      value={row.countryFr}
                      onChange={(e) =>
                        setEducation((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, countryFr: e.target.value } : item,
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
                          schoolEn: row.schoolEn,
                          schoolFr: row.schoolFr,
                          cityEn: row.cityEn,
                          cityFr: row.cityFr,
                          degreeEn: row.degreeEn,
                          degreeFr: row.degreeFr,
                          countryEn: row.countryEn,
                          countryFr: row.countryFr,
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
                      onClick={() =>
                        void mutate(key, 'DELETE', `/api/admin/education/${row.id}`)
                      }
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
      ) : null}

      {panel === 'cv' ? (
        <section className="space-y-4">
          <h2 className="section-label">{ui.admin.cvHeading}</h2>
          <p className="prose-quiet">{ui.admin.cvHint}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="field">
              <label className="field-label" htmlFor="admin-cv-en">
                {ui.admin.cvEn}
              </label>
              <input
                id="admin-cv-en"
                key={`en-${cvEnInputKey}`}
                type="file"
                accept="application/pdf,.pdf"
                className="field-control"
                onChange={(e) => setCvEnFile(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                className="btn btn-primary mt-3"
                disabled={busyKey === 'cv-en'}
                onClick={() => void uploadCv('cv-en', cvEnFile)}
              >
                {busyKey === 'cv-en' ? ui.admin.saving : ui.admin.cvUploadEn}
              </button>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="admin-cv-fr">
                {ui.admin.cvFr}
              </label>
              <input
                id="admin-cv-fr"
                key={`fr-${cvFrInputKey}`}
                type="file"
                accept="application/pdf,.pdf"
                className="field-control"
                onChange={(e) => setCvFrFile(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                className="btn btn-primary mt-3"
                disabled={busyKey === 'cv-fr'}
                onClick={() => void uploadCv('cv-fr', cvFrFile)}
              >
                {busyKey === 'cv-fr' ? ui.admin.saving : ui.admin.cvUploadFr}
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
