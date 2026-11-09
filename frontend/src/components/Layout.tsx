import { Link, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="flex flex-wrap gap-4 border-b border-slate-200 bg-white px-6 py-4">
        <Link className="font-medium text-slate-700 hover:text-slate-900" to="/">Home</Link>
        <Link className="font-medium text-slate-700 hover:text-slate-900" to="/about">About</Link>
        <Link className="font-medium text-slate-700 hover:text-slate-900" to="/skills">Skills</Link>
        <Link className="font-medium text-slate-700 hover:text-slate-900" to="/experience">Experience</Link>
        <Link className="font-medium text-slate-700 hover:text-slate-900" to="/projects">Projects</Link>
        <Link className="font-medium text-slate-700 hover:text-slate-900" to="/contact">Contact</Link>
      </nav>
      <main className="mx-auto max-w-5xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  )
}