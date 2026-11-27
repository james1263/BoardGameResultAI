import { useEffect, useMemo, useRef, useState } from 'react'
import { getQuickReview } from '../data/quickReview'
import type { ReviewSection } from '../data/quickReview/risingSun'
import '../styles/quick-review.css'
import TermText, { TermViewProvider, stripTerms } from './TermText'
import { useVip } from '../lib/useVip'

function Items({ section }: { section: ReviewSection }) {
  return (
    <ul className="qr-list">
      {section.items.map((item, i) => (
        <li key={i} className="qr-item">
          <span className="qr-text">
            {item.label && (
              <b className="qr-label">
                <TermText text={item.label} />
              </b>
            )}
            <TermText text={item.text} />
          </span>
          <span className="qr-src">{item.src}</span>
        </li>
      ))}
    </ul>
  )
}

// 關鍵字（空白分隔，全部都要出現）比對區塊標題與內文
function sectionMatches(section: ReviewSection, query: string): boolean {
  if (query === '') return true
  const hay = [section.title, ...section.items.map((item) => stripTerms(`${item.label ?? ''} ${item.text}`))]
    .join('\n')
    .toLowerCase()
  return query
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => hay.includes(word))
}

export default function QuickReview({
  bggName,
  noteOpen = false,
  panelOpen = false,
  onPanelChange,
}: {
  bggName: string
  // 說明（點標題列的標題）與篩選面板（標題列的篩選鈕）由外面控制
  noteOpen?: boolean
  panelOpen?: boolean
  onPanelChange?: (open: boolean) => void
}) {
  const data = getQuickReview(bggName)
  // 名詞長按看圖只開給 VIP／管理者（useVip 管理者也算）；在這裡查一次，內部的名詞共用
  const vip = useVip()
  const rootRef = useRef<HTMLDivElement | null>(null)
  // 已套用的篩選（按 OK 後才生效）
  const [applied, setApplied] = useState<string[]>([])
  const [appliedQuery, setAppliedQuery] = useState('')
  // 面板裡還沒按 OK 的草稿
  const [draftPick, setDraftPick] = useState<string[]>([])
  const [draftQuery, setDraftQuery] = useState('')
  // 取消篩選後要停在哪一個標題（title）；tick 讓同一個標題也能再捲一次
  const [anchor, setAnchor] = useState<string | null>(null)
  const [anchorTick, setAnchorTick] = useState(0)

  const sections = data?.sections ?? []
  const query = appliedQuery.trim().toLowerCase()
  const filtering = applied.length > 0 || query !== ''

  const visible = useMemo(
    () =>
      sections.filter(
        (section) =>
          (applied.length === 0 || applied.includes(section.title)) &&
          sectionMatches(section, query),
      ),
    [sections, applied, query],
  )

  // 取消篩選後，畫面停在剛剛看的那個標題
  useEffect(() => {
    if (!anchor || anchorTick === 0) return
    const target = Array.from(
      rootRef.current?.querySelectorAll<HTMLElement>('[data-qr-title]') ?? [],
    ).find((el) => el.dataset.qrTitle === anchor)
    target?.scrollIntoView({ block: 'start' })
  }, [anchor, anchorTick])

  // 面板打開時，草稿帶入目前已套用的篩選
  useEffect(() => {
    if (!panelOpen) return
    setDraftPick(applied)
    setDraftQuery(appliedQuery)
    // 只在面板打開那一刻同步
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelOpen])

  if (!data) return null
  const { draftNote } = data
  const main = visible.filter((section) => !section.fold)
  const folded = visible.filter((section) => section.fold)

  function togglePick(title: string) {
    setDraftPick((current) =>
      current.includes(title) ? current.filter((t) => t !== title) : [...current, title],
    )
  }

  function applyFilter() {
    setApplied(draftPick)
    setAppliedQuery(draftQuery)
    setAnchor(null)
    onPanelChange?.(false)
  }

  function clearFilter() {
    const first = visible[0]?.title ?? null
    setApplied([])
    setAppliedQuery('')
    setDraftPick([])
    setDraftQuery('')
    onPanelChange?.(false)
    setAnchor(first)
    setAnchorTick((n) => n + 1)
  }

  return (
    <TermViewProvider value={vip.isVip}>
    <div className="qr" ref={rootRef}>
      {filtering && (
        <div className="qr-bar">
          <span className="qr-bar-info">篩選中：顯示 {visible.length} / {sections.length} 個區塊</span>
          <button type="button" className="qr-barbtn is-clear" onClick={clearFilter}>
            取消篩選
          </button>
        </div>
      )}

      {noteOpen && draftNote && <p className="qr-note">{draftNote}</p>}

      {panelOpen && (
        <div className="qr-panel">
          <input
            type="search"
            className="qr-search"
            placeholder="搜尋關鍵字（例如：計分、戰鬥）"
            value={draftQuery}
            onChange={(event) => setDraftQuery(event.target.value)}
            aria-label="搜尋快速複習"
          />
          <p className="qr-panel-hint">勾選要看的標題（可複選）；都不勾＝全部顯示。</p>
          <ul className="qr-pick">
            {sections.map((section) => (
              <li key={section.title}>
                <label className="qr-pick-row">
                  <input
                    type="checkbox"
                    checked={draftPick.includes(section.title)}
                    onChange={() => togglePick(section.title)}
                  />
                  <span>
                    {section.title}
                    {section.fold && <small className="qr-pick-tag">較少用</small>}
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <div className="qr-panel-actions">
            <button type="button" className="qr-ok" onClick={applyFilter}>
              OK
            </button>
            <button
              type="button"
              className="qr-barbtn"
              onClick={() => {
                setDraftPick([])
                setDraftQuery('')
              }}
            >
              全部清除
            </button>
            <button type="button" className="qr-barbtn" onClick={() => onPanelChange?.(false)}>
              關閉
            </button>
          </div>
        </div>
      )}

      {visible.length === 0 && <p className="qr-empty">沒有符合的區塊。</p>}

      {main.map((section) => (
        <section key={section.title} className="qr-block" data-qr-title={section.title}>
          <h4 className="qr-title">{section.title}</h4>
          <Items section={section} />
        </section>
      ))}
      {folded.length > 0 && !filtering && <p className="qr-more-head">較少用，需要時再看</p>}
      {folded.map((section) => (
        <details
          key={section.title}
          className="qr-fold"
          data-qr-title={section.title}
          open={filtering || anchor === section.title ? true : undefined}
        >
          <summary className="qr-sum">{section.title}</summary>
          <Items section={section} />
        </details>
      ))}
    </div>
    </TermViewProvider>
  )
}
