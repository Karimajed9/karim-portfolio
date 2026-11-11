type Props = {
  value: string
  animating?: boolean
  className?: string
}

export default function FlipDigits({ value, animating = false, className }: Props) {
  return (
    <span className={className ? `flip-row ${className}` : 'flip-row'} aria-hidden="true">
      {value.split('').map((ch, index) => (
        <span
          key={`${ch}-${index}`}
          className={`flip-cell${animating ? ' is-animating' : ''}`}
          style={animating ? { animationDelay: `${index * 40}ms` } : undefined}
        >
          {ch}
        </span>
      ))}
    </span>
  )
}
