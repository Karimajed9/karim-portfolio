import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import SkillsPage from './pages/SkillsPage'
import ExperiencePage from './pages/ExperiencePage'
import ProjectsPage from './pages/ProjectsPage'
import ContactPage from './pages/ContactPage'
import AdminPage from './pages/AdminPage'
import NotFoundPage from './pages/NotFoundPage'
import Layout from './components/Layout'

// Vite BASE_URL is "/" locally and "/karim-portfolio/" on GitHub Pages builds.
// React Router basename must omit a trailing slash; root deploys omit basename.
const trimmedBase = import.meta.env.BASE_URL.replace(/\/$/, '')
const routerBasename = trimmedBase.length > 0 ? trimmedBase : undefined

function App() {
  return (
    // useTransitions={false}: RR7 defaults to startTransition for history
    // updates, which keeps the outgoing page painted until the destination
    // commits — that reads as a Home flash when leaving `/`.
    <BrowserRouter basename={routerBasename} useTransitions={false}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="skills" element={<SkillsPage />} />
          <Route path="experience" element={<ExperiencePage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
