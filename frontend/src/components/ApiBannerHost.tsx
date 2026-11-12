import { useApiBannerReason } from '../lib/apiBannerState'
import ApiFallbackBanner from './ApiFallbackBanner'

/** Single mount point for the shared API warming/offline/loading banner. */
export default function ApiBannerHost() {
  const reason = useApiBannerReason()
  if (!reason) return null
  return <ApiFallbackBanner reason={reason} />
}
