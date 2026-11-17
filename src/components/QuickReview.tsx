import { RISING_SUN_REVIEW } from '../data/quickReview/risingSun'
import type { ReviewSection } from '../data/quickReview/risingSun'
import '../styles/quick-review.css'

function Items({ section }: { section: ReviewSection }) {
  return (
    <ul className="qr-list">
      {section.items.map((item, i) => (
        <li key={i} className="qr-item">
          <span className="qr-text">
            {item.label && <b className="qr-label">{item.label}</b>}
            {item.text}
          </span>
          <span className="qr-src">{item.src}</span>
        </li>
      ))}
    </ul>
  )
}

export default function QuickReview() {
  const { draftNote, sections } = RISING_SUN_REVIEW
  const main = sections.filter((section) => !section.fold)
  const folded = sections.filter((section) => section.fold)
  return (
    <div className="qr">
      {draftNote && <p className="qr-note">{draftNote}</p>}
      {main.map((section) => (
        <section key={section.title} className="qr-block">
          <h4 className="qr-title">{section.title}</h4>
          <Items section={section} />
        </section>
      ))}
      {folded.length > 0 && <p className="qr-more-head">較少用，需要時再看</p>}
      {folded.map((section) => (
        <details key={section.title} className="qr-fold">
          <summary className="qr-sum">{section.title}</summary>
          <Items section={section} />
        </details>
      ))}
    </div>
  )
}
