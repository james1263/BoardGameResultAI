import { RISING_SUN_REVIEW } from '../data/quickReview/risingSun'
import '../styles/quick-review.css'

export default function QuickReview() {
  return (
    <div className="qr">
      <p className="qr-note">{RISING_SUN_REVIEW.draftNote}</p>
      {RISING_SUN_REVIEW.blocks.map((block) => (
        <section key={block.title} className="qr-block">
          <div className="qr-title">{block.title}</div>
          <ul className="qr-list">
            {block.items.map((item, i) => (
              <li key={i} className="qr-item">
                <span className="qr-text">{item.text}</span>
                <span className="qr-src">{item.src}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
