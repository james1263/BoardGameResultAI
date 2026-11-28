import { useDeferredValue, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import GameErrata from './GameErrata'
import GameFaq, { countFaqItems, getFaqNote, getGameFaq, getUnofficialFaq } from './GameFaq'
import type { useGameErrata } from '../lib/useGameErrata'
import '../styles/gqa-tabs.css'

type Tab = 'faq' | 'errata' | 'bgg'

const TIP_FAQ = '出版商發布的官方問答，與規則書衝突時以官方為準。'
const TIP_ERRATA = '玩家實際玩錯後整理的常見錯誤，以及規則助手裡被認可的好答案。'
const TIP_BGG = '非官方：玩家製作的教學筆記與 BGG 討論整理，與官方衝突時以官方為準。'

// 「官方 FAQ・BGG 討論・玩錯紀錄（含我的AI回覆）」：最多三個分頁，一次只看一種資料。
// 分頁順序＝重要性：官方 FAQ → BGG 討論 → 玩錯紀錄。沒有資料的分頁不顯示（玩錯紀錄在讀取中、或你有待審／被退回的投稿時仍會顯示）。
// 「我要投稿」按鈕在彈窗標題列（GameModal），按下去用 openRequest 通知這裡切到玩錯紀錄並打開投稿視窗。
// 搜尋：分頁列最左邊一個放大鏡，按下去分頁列變搜尋框，搜的是目前所在的分頁（目前只有官方 FAQ、BGG 討論）。
// 說明文字：手機長按分頁標籤、電腦滑鼠停在標籤上才會跳出氣泡。
export default function GameQa({
  bggName,
  isAdmin,
  errataApi,
  showErrata,
  includeUnofficial = false,
  openRequest = false,
  onOpenHandled,
}: {
  bggName: string
  isAdmin: boolean
  errataApi: ReturnType<typeof useGameErrata>
  // 玩錯紀錄・我的AI回覆只有 VIP／管理者看得到（和原本的權限相同）
  showErrata: boolean
  // true＝BGG 討論也放在這裡的分頁（GameModal 要同時拿掉自己另外掛的那一區，否則會出現兩次）
  includeUnofficial?: boolean
  // 標題列「我要投稿」按下後為 true；這裡處理完會呼叫 onOpenHandled
  openRequest?: boolean
  onOpenHandled?: () => void
}) {
  const faqData = getGameFaq(bggName)
  const unofficialData = includeUnofficial ? getUnofficialFaq(bggName) : null
  const faqN = faqData ? countFaqItems(faqData) : 0
  const unoN = unofficialData ? countFaqItems(unofficialData) : 0
  const approved = errataApi.items.filter((i) => !i.status || i.status === 'approved')
  const aiN = approved.filter((i) => i.kind === 'ai_answer').length
  const errN = approved.length - aiN
  const mineOpenN = errataApi.items.filter(
    (i) => i.is_mine && (i.status === 'pending' || i.status === 'rejected'),
  ).length

  const [tab, setTab] = useState<Tab | null>(null)
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState('')
  // 按「我要投稿」時，就算玩錯紀錄還是 0 筆也要出現這個分頁（投稿視窗掛在裡面）
  const [forceErrata, setForceErrata] = useState(false)
  const [submitNow, setSubmitNow] = useState(false)

  const tabs: { key: Tab; label: string; full: string; count: number | null; tip: string }[] = []
  if (faqData && faqN > 0) {
    const note = getFaqNote(bggName, 'official')
    tabs.push({
      key: 'faq',
      label: '官方 FAQ',
      full: '官方 FAQ',
      count: faqN,
      tip: note ? `${TIP_FAQ}\n${note}` : TIP_FAQ,
    })
  }
  if (unofficialData && unoN > 0) {
    const note = getFaqNote(bggName, 'unofficial')
    tabs.push({
      key: 'bgg',
      label: 'BGG 討論',
      full: 'BGG 討論',
      count: unoN,
      tip: note ? `${TIP_BGG}\n${note}` : TIP_BGG,
    })
  }
  if (showErrata && (errataApi.loading || approved.length > 0 || mineOpenN > 0 || forceErrata)) {
    tabs.push({
      key: 'errata',
      label: aiN === 0 ? '玩錯紀錄' : errN > 0 ? '玩錯・AI回覆' : '我的AI回覆',
      full: aiN === 0 ? '玩錯紀錄' : errN > 0 ? '玩錯紀錄・我的AI回覆' : '我的AI回覆',
      count: errataApi.loading ? null : approved.length,
      tip: TIP_ERRATA,
    })
  }

  const active: Tab | null = tabs.some((t) => t.key === tab) ? tab : (tabs[0]?.key ?? null)
  const canSearch = active === 'faq' || active === 'bgg'
  // 分頁標籤先立刻切換，下面內容晚一點再換（內容多，切換時畫面才不會定住）
  const shown = useDeferredValue(active)

  // ---- 標題列「我要投稿」：切到玩錯紀錄並打開投稿視窗 ----
  useEffect(() => {
    if (!openRequest) return
    setForceErrata(true)
    setTab('errata')
    setSearching(false)
    setQuery('')
    setSubmitNow(true)
    onOpenHandled?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openRequest])

  // ---- 說明氣泡：手機長按 450ms、電腦滑鼠停 300ms ----
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null)
  const timer = useRef<number | null>(null)
  const heldTip = useRef(false)

  function clearTimer() {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
  }
  function hideTip() {
    clearTimer()
    setTip(null)
  }
  function showTip(el: HTMLElement, text: string) {
    const r = el.getBoundingClientRect()
    setTip({ text, x: Math.max(12, Math.min(r.left, window.innerWidth - 292)), y: r.bottom + 8 })
  }
  function armTip(el: HTMLElement, text: string, delay: number, byHold: boolean) {
    clearTimer()
    timer.current = window.setTimeout(() => {
      if (byHold) heldTip.current = true
      showTip(el, text)
    }, delay)
  }
  useEffect(() => () => clearTimer(), [])

  function changeTab(next: Tab) {
    setTab(next)
    setSearching(false)
    setQuery('')
    hideTip()
  }

  function closeSearch() {
    setSearching(false)
    setQuery('')
  }

  const searchPlaceholder =
    active === 'bgg' ? '搜尋 BGG 討論（例如：太陽能板、維護費）' : '搜尋官方 FAQ（例如：忠誠、切腹）'

  return (
    <div className="gqa">
      {tabs.length === 0 ? (
        <p className="er-note">
          {showErrata
            ? '這款還沒有 FAQ 或玩錯紀錄。可以點右上角「我要投稿」。'
            : '這款還沒有資料。'}
        </p>
      ) : (
        <div className="gqa-bar">
          {searching && canSearch ? (
            <div className="gqa-searchbox">
              <svg className="gqa-ico" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M16.5 16.5L21 21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                className="gqa-search"
                autoFocus
                placeholder={searchPlaceholder}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label={searchPlaceholder}
              />
              <button type="button" className="gqa-cancel" onClick={closeSearch}>
                取消
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="gqa-sbtn"
                aria-label="搜尋"
                title={canSearch ? '搜尋這個分頁' : '這個分頁暫時不能搜尋'}
                disabled={!canSearch}
                onClick={() => setSearching(true)}
              >
                <svg className="gqa-ico" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M16.5 16.5L21 21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <div className="gqa-tabs" role="tablist" aria-label="資料類型">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    className={`gqa-tab${active === t.key ? ' is-active' : ''}`}
                    aria-selected={active === t.key}
                    aria-label={t.full}
                    onPointerDown={(event) => {
                      if (event.pointerType === 'mouse') return
                      heldTip.current = false
                      armTip(event.currentTarget, t.tip, 450, true)
                    }}
                    onPointerEnter={(event) => {
                      if (event.pointerType === 'mouse') armTip(event.currentTarget, t.tip, 300, false)
                    }}
                    onPointerUp={(event) => {
                      if (event.pointerType !== 'mouse') hideTip()
                    }}
                    onPointerLeave={hideTip}
                    onPointerCancel={hideTip}
                    onBlur={hideTip}
                    onContextMenu={(event) => event.preventDefault()}
                    onClick={() => {
                      // 長按跳出氣泡後放開手指，不要順便切換分頁
                      if (heldTip.current) {
                        heldTip.current = false
                        return
                      }
                      changeTab(t.key)
                    }}
                  >
                    {t.label}
                    {t.count !== null && <span className="gqa-tab-n">{t.count}</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {tip &&
        createPortal(
          <div role="tooltip" className="gqa-tip" style={{ left: tip.x, top: tip.y }}>
            {tip.text}
          </div>,
          document.body,
        )}

      {shown === 'faq' && faqData && (
        <section className="gqa-panel gqa-panel-faq">
          <GameFaq key={`${bggName}-faq`} bggName={bggName} hideSearch externalQuery={query} hideNotes />
        </section>
      )}

      {shown === 'bgg' && unofficialData && (
        <section className="gqa-panel gqa-panel-bgg">
          <GameFaq
            key={`${bggName}-bgg`}
            bggName={bggName}
            kind="unofficial"
            hideSearch
            externalQuery={query}
            hideNotes
          />
        </section>
      )}

      {shown === 'errata' && showErrata && (
        <section className="gqa-panel gqa-panel-errata">
          <GameErrata
            key={`${bggName}-errata`}
            bggName={bggName}
            isAdmin={isAdmin}
            embedded
            hideSubmit
            api={errataApi}
            openRequest={submitNow}
            onOpenHandled={() => setSubmitNow(false)}
          />
        </section>
      )}
    </div>
  )
}
