import FlipDigits from './FlipDigits'

type Props = {
  title: string
  index: string
}

export default function SectionHeading({ title, index }: Props) {
  return (
    <div className="section-head">
      <h2 className="section-title">{title}</h2>
      <FlipDigits value={index} />
    </div>
  )
}
