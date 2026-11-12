import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Reset window scroll on pathname changes (keeps hash jumps on the same path). */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}
