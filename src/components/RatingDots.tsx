import { countRatingSymbols } from '../lib/gameFormat'

const RATING_DOT_COLORS: Record<string, string> = {
  快速性: '#8a6a72',
  變化度: '#7d7f9a',
  溝通度: '#6f7f9a',
  影響度: '#c08a68',
  獨特性: '#b09068',
  複雜度: '#a87aa0',
}

export default function RatingDots({
  label,
  value,
}: {
  label: string
  value?: string | null
}) {
  const count = Math.min(countRatingSymbols(value), 10)
  const color = RATING_DOT_COLORS[label] ?? '#7d8a74'

  return (
    <div className="rating-item">
      <span className="rating-label">{label}</span>
      {count > 0 ? (
        <span
          className="rating-dots"
          role="img"
          aria-label={`${label} ${count} 點`}
        >
          {Array.from({ length: count }, (_, index) => (
            <span
              key={index}
              className="rating-dot"
              style={{ background: color }}
            />
          ))}
        </span>
      ) : (
        <span className="rating-empty">未提供</span>
      )}
    </div>
  )
}
