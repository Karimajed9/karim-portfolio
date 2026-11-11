import {
  messageForFallbackReason,
  type ApiFallbackReason,
} from '../api'
import StatusBanner from './StatusBanner'

type Props = {
  reason: ApiFallbackReason
}

export default function ApiFallbackBanner({ reason }: Props) {
  return <StatusBanner>{messageForFallbackReason(reason)}</StatusBanner>
}
