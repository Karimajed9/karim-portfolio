import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

export default function NotFoundPage() {
  return (
    <section className="page-wrap">
      <PageHeader
        index="404"
        title="Page not found"
        subtitle="That route is not part of this portfolio."
      />
      <p className="prose-quiet">
        Check the URL, or head back to the home page and navigate from there.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/" className="btn btn-primary">
          Back home
        </Link>
        <Link to="/contact" className="btn btn-secondary">
          Contact
        </Link>
      </div>
    </section>
  )
}
