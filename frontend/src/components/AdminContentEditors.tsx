import { useEffect, useState } from 'react'
import { apiUrl } from '../api'
import { useLocale } from '../i18n/LocaleContext'
import { publicAssetUrl } from '../lib/publicAsset'
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
  slug: string
  nameEn: string
  nameFr: string
  summaryEn: string
  summaryFr: string
  tagsEn: string
  tagsFr: string
  href: string
  categoryEn: string
  categoryFr: string
  statusEn: string
  statusFr: string
  coverImageUrl: string
  liveDemoUrl: string
  roleEn: string
  roleFr: string
  overviewEn: string
  overviewFr: string
  problemEn: string
  problemFr: string
  architectureImageUrl: string
  architectureCaptionEn: string
  architectureCaptionFr: string
  featuresEn: string
  featuresFr: string
  tradeoffsEn: string
  tradeoffsFr: string
  challengesEn: string
  challengesFr: string
  testingEn: string
  testingFr: string
  galleryUrls: string
  lessonsEn: string
  lessonsFr: string
  mark: string
  sortOrder: number
}

function emptyProject(sortOrder: number): ProjectItem {
  return {
    slug: '',
    nameEn: '',
    nameFr: '',
    summaryEn: '',
    summaryFr: '',
    tagsEn: '',
    tagsFr: '',
    href: '',
    categoryEn: '',
    categoryFr: '',
    statusEn: '',
    statusFr: '',
    coverImageUrl: '',
    liveDemoUrl: '',
    roleEn: '',
    roleFr: '',
    overviewEn: '',
    overviewFr: '',
    problemEn: '',
    problemFr: '',
    architectureImageUrl: '',
    architectureCaptionEn: '',
    architectureCaptionFr: '',
    featuresEn: '',
    featuresFr: '',
    tradeoffsEn: '',
    tradeoffsFr: '',
    challengesEn: '',
    challengesFr: '',
    testingEn: '',
    testingFr: '',
    galleryUrls: '',
    lessonsEn: '',
    lessonsFr: '',
    mark: '',
    sortOrder,
  }
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
      projectRows.map((row, index) => ({
        ...emptyProject(row.sortOrder ?? index + 1),
        ...row,
        slug: emptyToString(row.slug),
        nameEn: emptyToString(row.nameEn),
        nameFr: emptyToString(row.nameFr),
        summaryEn: emptyToString(row.summaryEn),
        summaryFr: emptyToString(row.summaryFr),
        tagsEn: emptyToString(row.tagsEn),
        tagsFr: emptyToString(row.tagsFr),
        href: emptyToString(row.href),
        categoryEn: emptyToString(row.categoryEn),
        categoryFr: emptyToString(row.categoryFr),
        statusEn: emptyToString(row.statusEn),
        statusFr: emptyToString(row.statusFr),
        coverImageUrl: emptyToString(row.coverImageUrl),
        liveDemoUrl: emptyToString(row.liveDemoUrl),
        roleEn: emptyToString(row.roleEn),
        roleFr: emptyToString(row.roleFr),
        overviewEn: emptyToString(row.overviewEn),
        overviewFr: emptyToString(row.overviewFr),
        problemEn: emptyToString(row.problemEn),
        problemFr: emptyToString(row.problemFr),
        architectureImageUrl: emptyToString(row.architectureImageUrl),
        architectureCaptionEn: emptyToString(row.architectureCaptionEn),
        architectureCaptionFr: emptyToString(row.architectureCaptionFr),
        featuresEn: highlightsToLines(emptyToString(row.featuresEn)),
        featuresFr: highlightsToLines(emptyToString(row.featuresFr)),
        tradeoffsEn: highlightsToLines(emptyToString(row.tradeoffsEn)),
        tradeoffsFr: highlightsToLines(emptyToString(row.tradeoffsFr)),
        challengesEn: highlightsToLines(emptyToString(row.challengesEn)),
        challengesFr: highlightsToLines(emptyToString(row.challengesFr)),
        testingEn: emptyToString(row.testingEn),
        testingFr: emptyToString(row.testingFr),
        galleryUrls: emptyToString(row.galleryUrls).replace(/,/g, '\n'),
        lessonsEn: highlightsToLines(emptyToString(row.lessonsEn)),
        lessonsFr: highlightsToLines(emptyToString(row.lessonsFr)),
        mark: emptyToString(row.mark),
        sortOrder: row.sortOrder ?? index + 1,
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

  async function uploadProjectCover(index: number, file: File | null) {
    if (!file) {
      setError(ui.admin.coverImagePick)
      return
    }
    const busy = `cover-${index}`
    setBusyKey(busy)
    setStatus(null)
    setError(null)
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch(apiUrl('/api/admin/uploads'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRF-TOKEN': csrfToken },
        body,
      })
      if (!res.ok) {
        setError(ui.admin.coverImageFailed)
        return
      }
      const payload = (await res.json()) as { url?: string }
      const url = (payload.url ?? '').trim()
      if (!url) {
        setError(ui.admin.coverImageFailed)
        return
      }
      setProjects((rows) =>
        rows.map((item, i) => (i === index ? { ...item, coverImageUrl: url } : item)),
      )
      setStatus(ui.admin.coverImageSaved)
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
                setProjects((rows) => [...rows, emptyProject(rows.length + 1)])
              }
            >
              {ui.admin.add}
            </button>
          </div>
          {projects.map((row, index) => {
            const key = `project-${row.id ?? `new-${index}`}`
            const patch = (partial: Partial<ProjectItem>) =>
              setProjects((rows) =>
                rows.map((item, i) => (i === index ? { ...item, ...partial } : item)),
              )
            return (
              <article key={key} className="border border-line bg-surface p-5 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="field">
                    <span className="field-label">{ui.admin.slug}</span>
                    <input
                      className="field-control"
                      value={row.slug}
                      onChange={(e) => patch({ slug: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{ui.admin.sortOrder}</span>
                    <input
                      type="number"
                      className="field-control"
                      value={row.sortOrder}
                      onChange={(e) => patch({ sortOrder: Number(e.target.value) || 0 })}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelEn(ui.admin.name)}</span>
                    <input
                      className="field-control"
                      value={row.nameEn}
                      onChange={(e) => patch({ nameEn: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelFr(ui.admin.name)}</span>
                    <input
                      className="field-control"
                      value={row.nameFr}
                      onChange={(e) => patch({ nameFr: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelEn(ui.admin.category)}</span>
                    <input
                      className="field-control"
                      value={row.categoryEn}
                      onChange={(e) => patch({ categoryEn: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelFr(ui.admin.category)}</span>
                    <input
                      className="field-control"
                      value={row.categoryFr}
                      onChange={(e) => patch({ categoryFr: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelEn(ui.admin.status)}</span>
                    <input
                      className="field-control"
                      value={row.statusEn}
                      onChange={(e) => patch({ statusEn: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelFr(ui.admin.status)}</span>
                    <input
                      className="field-control"
                      value={row.statusFr}
                      onChange={(e) => patch({ statusFr: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelEn(ui.admin.role)}</span>
                    <input
                      className="field-control"
                      value={row.roleEn}
                      onChange={(e) => patch({ roleEn: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelFr(ui.admin.role)}</span>
                    <input
                      className="field-control"
                      value={row.roleFr}
                      onChange={(e) => patch({ roleFr: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{ui.admin.href}</span>
                    <input
                      className="field-control"
                      value={row.href}
                      onChange={(e) => patch({ href: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{ui.admin.liveDemoUrl}</span>
                    <input
                      className="field-control"
                      value={row.liveDemoUrl}
                      onChange={(e) => patch({ liveDemoUrl: e.target.value })}
                    />
                  </label>
                  <div className="field md:col-span-2 admin-cover-field">
                    <span className="field-label" id={`admin-cover-label-${index}`}>
                      {ui.admin.coverImage}
                    </span>
                    <p className="prose-quiet">{ui.admin.coverImageHint}</p>
                    {row.coverImageUrl ? (
                      <img
                        src={publicAssetUrl(row.coverImageUrl)}
                        alt=""
                        className="admin-cover-preview"
                      />
                    ) : null}
                    <div className="admin-cover-actions">
                      <input
                        id={`admin-cover-file-${index}`}
                        className="admin-file-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
                        disabled={busyKey === `cover-${index}`}
                        aria-labelledby={`admin-cover-label-${index}`}
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null
                          void uploadProjectCover(index, file)
                          e.target.value = ''
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={busyKey === `cover-${index}`}
                        onClick={() => {
                          const input = document.getElementById(`admin-cover-file-${index}`)
                          if (input instanceof HTMLInputElement) input.click()
                        }}
                      >
                        {busyKey === `cover-${index}`
                          ? ui.admin.saving
                          : ui.admin.coverImageUpload}
                      </button>
                    </div>
                    <label className="field admin-cover-url">
                      <span className="field-label">{ui.admin.coverImageUrl}</span>
                      <input
                        className="field-control"
                        value={row.coverImageUrl}
                        onChange={(e) => patch({ coverImageUrl: e.target.value })}
                        placeholder="/media/uploads/…"
                      />
                    </label>
                  </div>
                  <label className="field">
                    <span className="field-label">{ui.admin.mark}</span>
                    <input
                      className="field-control"
                      value={row.mark}
                      onChange={(e) => patch({ mark: e.target.value })}
                    />
                  </label>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="field">
                    <span className="field-label">{labelEn(ui.admin.summary)}</span>
                    <textarea
                      className="field-control min-h-24"
                      value={row.summaryEn}
                      onChange={(e) => patch({ summaryEn: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelFr(ui.admin.summary)}</span>
                    <textarea
                      className="field-control min-h-24"
                      value={row.summaryFr}
                      onChange={(e) => patch({ summaryFr: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelEn(ui.admin.overview)}</span>
                    <textarea
                      className="field-control min-h-24"
                      value={row.overviewEn}
                      onChange={(e) => patch({ overviewEn: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelFr(ui.admin.overview)}</span>
                    <textarea
                      className="field-control min-h-24"
                      value={row.overviewFr}
                      onChange={(e) => patch({ overviewFr: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelEn(ui.admin.problem)}</span>
                    <textarea
                      className="field-control min-h-24"
                      value={row.problemEn}
                      onChange={(e) => patch({ problemEn: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelFr(ui.admin.problem)}</span>
                    <textarea
                      className="field-control min-h-24"
                      value={row.problemFr}
                      onChange={(e) => patch({ problemFr: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelEn(ui.admin.tags)}</span>
                    <input
                      className="field-control"
                      value={row.tagsEn}
                      onChange={(e) => patch({ tagsEn: e.target.value })}
                    />
                    <span className="text-sm text-muted">{ui.admin.tagsHint}</span>
                  </label>
                  <label className="field">
                    <span className="field-label">{labelFr(ui.admin.tags)}</span>
                    <input
                      className="field-control"
                      value={row.tagsFr}
                      onChange={(e) => patch({ tagsFr: e.target.value })}
                    />
                    <span className="text-sm text-muted">{ui.admin.tagsHint}</span>
                  </label>
                  <label className="field">
                    <span className="field-label">{ui.admin.architectureImage}</span>
                    <input
                      className="field-control"
                      value={row.architectureImageUrl}
                      onChange={(e) => patch({ architectureImageUrl: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{ui.admin.gallery}</span>
                    <textarea
                      className="field-control min-h-20"
                      value={row.galleryUrls}
                      onChange={(e) => patch({ galleryUrls: e.target.value })}
                    />
                    <span className="text-sm text-muted">{ui.admin.galleryHint}</span>
                  </label>
                  <label className="field">
                    <span className="field-label">{labelEn(ui.admin.architectureCaption)}</span>
                    <textarea
                      className="field-control min-h-24"
                      value={row.architectureCaptionEn}
                      onChange={(e) => patch({ architectureCaptionEn: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelFr(ui.admin.architectureCaption)}</span>
                    <textarea
                      className="field-control min-h-24"
                      value={row.architectureCaptionFr}
                      onChange={(e) => patch({ architectureCaptionFr: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelEn(ui.admin.features)}</span>
                    <textarea
                      className="field-control min-h-28"
                      value={row.featuresEn}
                      onChange={(e) => patch({ featuresEn: e.target.value })}
                    />
                    <span className="text-sm text-muted">{ui.admin.highlightsHint}</span>
                  </label>
                  <label className="field">
                    <span className="field-label">{labelFr(ui.admin.features)}</span>
                    <textarea
                      className="field-control min-h-28"
                      value={row.featuresFr}
                      onChange={(e) => patch({ featuresFr: e.target.value })}
                    />
                    <span className="text-sm text-muted">{ui.admin.highlightsHint}</span>
                  </label>
                  <label className="field">
                    <span className="field-label">{labelEn(ui.admin.tradeoffs)}</span>
                    <textarea
                      className="field-control min-h-24"
                      value={row.tradeoffsEn}
                      onChange={(e) => patch({ tradeoffsEn: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelFr(ui.admin.tradeoffs)}</span>
                    <textarea
                      className="field-control min-h-24"
                      value={row.tradeoffsFr}
                      onChange={(e) => patch({ tradeoffsFr: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelEn(ui.admin.challenges)}</span>
                    <textarea
                      className="field-control min-h-24"
                      value={row.challengesEn}
                      onChange={(e) => patch({ challengesEn: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelFr(ui.admin.challenges)}</span>
                    <textarea
                      className="field-control min-h-24"
                      value={row.challengesFr}
                      onChange={(e) => patch({ challengesFr: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelEn(ui.admin.testing)}</span>
                    <textarea
                      className="field-control min-h-24"
                      value={row.testingEn}
                      onChange={(e) => patch({ testingEn: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelFr(ui.admin.testing)}</span>
                    <textarea
                      className="field-control min-h-24"
                      value={row.testingFr}
                      onChange={(e) => patch({ testingFr: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelEn(ui.admin.lessons)}</span>
                    <textarea
                      className="field-control min-h-24"
                      value={row.lessonsEn}
                      onChange={(e) => patch({ lessonsEn: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">{labelFr(ui.admin.lessons)}</span>
                    <textarea
                      className="field-control min-h-24"
                      value={row.lessonsFr}
                      onChange={(e) => patch({ lessonsFr: e.target.value })}
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
                        row.id == null ? '/api/admin/projects' : `/api/admin/projects/${row.id}`,
                        {
                          slug: row.slug,
                          nameEn: row.nameEn,
                          nameFr: row.nameFr,
                          summaryEn: row.summaryEn,
                          summaryFr: row.summaryFr,
                          tagsEn: row.tagsEn,
                          tagsFr: row.tagsFr,
                          href: row.href,
                          categoryEn: row.categoryEn,
                          categoryFr: row.categoryFr,
                          statusEn: row.statusEn,
                          statusFr: row.statusFr,
                          coverImageUrl: row.coverImageUrl,
                          liveDemoUrl: row.liveDemoUrl,
                          roleEn: row.roleEn,
                          roleFr: row.roleFr,
                          overviewEn: row.overviewEn,
                          overviewFr: row.overviewFr,
                          problemEn: row.problemEn,
                          problemFr: row.problemFr,
                          architectureImageUrl: row.architectureImageUrl,
                          architectureCaptionEn: row.architectureCaptionEn,
                          architectureCaptionFr: row.architectureCaptionFr,
                          featuresEn: linesToHighlights(row.featuresEn),
                          featuresFr: linesToHighlights(row.featuresFr),
                          tradeoffsEn: linesToHighlights(row.tradeoffsEn),
                          tradeoffsFr: linesToHighlights(row.tradeoffsFr),
                          challengesEn: linesToHighlights(row.challengesEn),
                          challengesFr: linesToHighlights(row.challengesFr),
                          testingEn: row.testingEn,
                          testingFr: row.testingFr,
                          galleryUrls: row.galleryUrls
                            .split(/\r?\n/)
                            .map((part) => part.trim())
                            .filter(Boolean)
                            .join(','),
                          lessonsEn: linesToHighlights(row.lessonsEn),
                          lessonsFr: linesToHighlights(row.lessonsFr),
                          mark: row.mark,
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
