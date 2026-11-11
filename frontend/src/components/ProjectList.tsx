export type ProjectListItem = {
  id: number | string
  name: string
  summary: string
  tags: string[]
  href: string
}

type Props = {
  projects: ProjectListItem[]
  startIndex?: number
}

export default function ProjectList({ projects, startIndex = 1 }: Props) {
  return (
    <ul className="project-list">
      {projects.map((project, i) => (
        <li key={project.id}>
          <a
            href={project.href}
            target="_blank"
            rel="noreferrer"
            className="project-item"
          >
            <span className="project-index" aria-hidden="true">
              {String(startIndex + i).padStart(2, '0')}
            </span>
            <div className="project-body">
              <span className="project-name">{project.name}</span>
              <p className="project-summary">{project.summary}</p>
              {project.tags.length > 0 ? (
                <p className="project-tags">{project.tags.join(' · ')}</p>
              ) : null}
            </div>
            <span className="project-arrow" aria-hidden="true">
              ↗
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}
