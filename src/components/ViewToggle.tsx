import type { ViewMode } from '../lib/libraryTypes'

export default function ViewToggle({
  viewMode,
  onChange,
}: {
  viewMode: ViewMode
  onChange: (mode: ViewMode) => void
}) {
  return (
    <div className="view-toggle" role="group" aria-label="檢視模式">
      <button
        type="button"
        className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
        onClick={() => onChange('list')}
        aria-label="清單檢視"
        title="清單"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="8" y1="6" x2="20" y2="6" />
          <line x1="8" y1="12" x2="20" y2="12" />
          <line x1="8" y1="18" x2="20" y2="18" />
          <circle cx="4" cy="6" r="1" fill="currentColor" />
          <circle cx="4" cy="12" r="1" fill="currentColor" />
          <circle cx="4" cy="18" r="1" fill="currentColor" />
        </svg>
      </button>
      <button
        type="button"
        className={`view-btn ${viewMode === 'grid-4' ? 'active' : ''}`}
        onClick={() => onChange('grid-4')}
        aria-label="一排 4 個"
        title="一排 4 個"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <rect x="3" y="3" width="8" height="8" rx="1.5" />
          <rect x="13" y="3" width="8" height="8" rx="1.5" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" />
          <rect x="13" y="13" width="8" height="8" rx="1.5" />
        </svg>
      </button>
      <button
        type="button"
        className={`view-btn ${viewMode === 'grid-9' ? 'active' : ''}`}
        onClick={() => onChange('grid-9')}
        aria-label="一排 9 個"
        title="一排 9 個"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <rect x="3" y="3" width="5" height="5" rx="1" />
          <rect x="9.5" y="3" width="5" height="5" rx="1" />
          <rect x="16" y="3" width="5" height="5" rx="1" />
          <rect x="3" y="9.5" width="5" height="5" rx="1" />
          <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
          <rect x="16" y="9.5" width="5" height="5" rx="1" />
          <rect x="3" y="16" width="5" height="5" rx="1" />
          <rect x="9.5" y="16" width="5" height="5" rx="1" />
          <rect x="16" y="16" width="5" height="5" rx="1" />
        </svg>
      </button>
    </div>
  )
}
