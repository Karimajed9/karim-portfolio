import { apiUrl } from '../api'

const EN_FILE = 'Karim_Majed_Backend_CV_Final.pdf'
const FR_FILE = 'Karim_Majed_Backend_CV_FR.pdf'

const siteBase = import.meta.env.BASE_URL.replace(/\/?$/, '/')

/**
 * Stable CV download paths.
 * - Dev / explicit API base / same-origin Compose (`VITE_API_BASE_URL=""`) → API `/cv/...`
 * - Production static host with no API base → bundled `public/cv/...` (avoid localhost links)
 */
function cvPath(filename: string): string {
  const raw = import.meta.env.VITE_API_BASE_URL
  if (typeof raw === 'string' || import.meta.env.DEV) {
    return apiUrl(`/cv/${filename}`)
  }
  return `${siteBase}cv/${filename}`
}

export const cvEnPath = cvPath(EN_FILE)
export const cvFrPath = cvPath(FR_FILE)
