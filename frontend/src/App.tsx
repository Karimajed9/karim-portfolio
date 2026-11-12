import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ContactPage from './pages/ContactPage'
import AdminPage from './pages/AdminPage'
import NotFoundPage from './pages/NotFoundPage'
import ProjectCaseStudyPage from './pages/ProjectCaseStudyPage'
import Layout from './components/Layout'
import { LocaleProvider } from './i18n/LocaleContext'
import { ThemeProvider } from './theme/ThemeContext'

// Vite BASE_URL is "/" locally and "/karim-portfolio/" on GitHub Pages builds.
// React Router basename must omit a trailing slash; root deploys omit basename.
const trimmedBase = import.meta.env.BASE_URL.replace(/\/$/, '')
const routerBasename = trimmedBase.length > 0 ? trimmedBase : undefined

function App() {
  return (
    <ThemeProvider>
      <LocaleProvider>
        {/* useTransitions={false}: RR7 defaults to startTransition for history
            updates, which keeps the outgoing page painted until the destination
            commits — that reads as a Home flash when leaving `/`. */}
        <BrowserRouter basename={routerBasename} useTransitions={false}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="admin" element={<AdminPage />} />
              {/* Old multipage routes collapse into the single-page anchors. */}
              <Route path="about" element={<Navigate to="/#profile" replace />} />
              <Route path="skills" element={<Navigate to="/#skills" replace />} />
              <Route path="experience" element={<Navigate to="/#experience" replace />} />
              <Route path="projects/:slug" element={<ProjectCaseStudyPage />} />
              <Route path="projects" element={<Navigate to="/#projects" replace />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LocaleProvider>
    </ThemeProvider>
  )
}

export default App
