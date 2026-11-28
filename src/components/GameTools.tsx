import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useBackClose } from '../lib/useBackClose'
import ToolWorkspace from './ToolWorkspace'
import { LadderIcon } from './LadderTool'
import { clearResourceSnapshot } from '../lib/scoreSheet'
import { kindOfView } from '../lib/toolWorkspace'
import '../styles/game-tools.css'
import '../styles/tools-float.css'
import '../styles/home-toolbar.css'

export type ToolView = 'grid' | 'dice' | 'ladder' | 'sheet' | 'counter'
export type ToolChoice = ToolView | 'picker'

// 手指長按、滑動時，手機會自動把底下的文字框選起來，害人滑不到清單。
// 按住期間在 <html> 掛上 gt-pressing（見 tool-workspace.css：全頁不能選取、不跳放大鏡），放開或清單關掉再拿掉。
function lockSelect(on: boolean) {
  document.documentElement.classList.toggle('gt-pressing', on)
  if (on) window.getSelection()?.removeAllRanges()
}


function ToolboxIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18M11 13v2h2v-2" />
    </svg>
  )
}

// 在目前工具裡用浮動視窗打開的小工具（不離開目前畫面）

const MENU_ITEMS: { id: ToolChoice; icon: ReactNode; name: string }[] = [
  { id: 'dice', icon: '🎲', name: '擲骰' },
  { id: 'ladder', icon: <LadderIcon />, name: '爬梯子' },
  { id: 'picker', icon: '🎰', name: '挑三款' },
  { id: 'sheet', icon: '🧮', name: '計分表' },
  { id: 'counter', icon: '📦', name: '資源計數器' },
]

const GRID_SLOTS = 9
const LONG_PRESS_MS = 500
const ORDER_KEY = 'boardgame-tools-order'

// 小工具順序只存在這支手機的瀏覽器；之後新增的工具會自動排在最後
function loadOrder(): ToolChoice[] {
  const ids = MENU_ITEMS.map((item) => item.id)
  try {
    const raw = localStorage.getItem(ORDER_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        const kept: ToolChoice[] = []
        for (const x of parsed) {
          const id = ids.find((i) => i === x)
          if (id && !kept.includes(id)) kept.push(id)
        }
        return [...kept, ...ids.filter((i) => !kept.includes(i))]
      }
    }
  } catch {
    // 讀不到就用預設順序
  }
  return ids
}

function saveOrder(order: ToolChoice[]) {
  try {
    localStorage.setItem(ORDER_KEY, JSON.stringify(order))
  } catch {
    // 存不了就算了
  }
}

/* ───────────── 首頁按鈕：短按開小工具，長按跳出快捷清單（手指不放可滑動選取；電腦右鍵） ───────────── */

export function ToolsButton({
  onSelect,
}: {
  onSelect: (choice: ToolChoice) => void
}) {
  const [menu, setMenu] = useState<{
    left: number
    top: number
    items: ToolChoice[]
  } | null>(null)
  const [hoverId, setHoverId] = useState<ToolChoice | null>(null)
  const timerRef = useRef<number | null>(null)
  const longRef = useRef(false)
  // 手指（或觸控筆）還按著，而且可以滑動選取；滑鼠不走這條路
  const slideRef = useRef(false)
  const startRef = useRef({ x: 0, y: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)

  function clearTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
      lockSelect(false)
    },
    [],
  )

  // 長按清單關掉了才解除「不能選取」（清單開著時手指可能已經放開）
  useEffect(() => {
    if (menu === null) lockSelect(false)
  }, [menu])

  // 手指現在壓在哪一個清單項目上（沒壓在項目上就是 null）
  function itemAt(x: number, y: number): ToolChoice | null {
    const el = document.elementFromPoint(x, y)
    const id = el?.closest('[data-gt-id]')?.getAttribute('data-gt-id')
    return MENU_ITEMS.find((item) => item.id === id)?.id ?? null
  }

  function openMenu() {
    const rect = btnRef.current?.getBoundingClientRect()
    if (!rect) return
    longRef.current = true
    const width = 168
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8))
    // 主畫面長按只顯示九格最前面的 3 個
    setMenu({ left, top: rect.bottom + 6, items: loadOrder().slice(0, 3) })
  }

  function pick(choice: ToolChoice) {
    setMenu(null)
    setHoverId(null)
    onSelect(choice)
  }

  const menuItems = (menu?.items ?? []).flatMap((id) => {
    const item = MENU_ITEMS.find((m) => m.id === id)
    return item ? [item] : []
  })

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="ht-btn gt-launch-icon"
        aria-label="小工具"
        title="小工具"
        style={{ WebkitTouchCallout: 'none', userSelect: 'none', touchAction: 'none' }}
        onPointerDown={(event) => {
          longRef.current = false
          slideRef.current = event.pointerType !== 'mouse'
          if (slideRef.current) lockSelect(true)
          startRef.current = { x: event.clientX, y: event.clientY }
          setHoverId(null)
          clearTimer()
          timerRef.current = window.setTimeout(() => {
            timerRef.current = null
            openMenu()
          }, LONG_PRESS_MS)
        }}
        onPointerMove={(event) => {
          if (timerRef.current !== null) {
            // 還沒長按成功就先移動太多，代表不是長按，取消
            const dx = event.clientX - startRef.current.x
            const dy = event.clientY - startRef.current.y
            if (dx * dx + dy * dy > 100) clearTimer()
            return
          }
          if (slideRef.current && longRef.current) {
            setHoverId(itemAt(event.clientX, event.clientY))
          }
        }}
        onPointerUp={(event) => {
          clearTimer()
          // 清單已經跳出、手指在項目上放開：直接進入該工具
          if (slideRef.current && longRef.current) {
            const id = itemAt(event.clientX, event.clientY)
            if (id) pick(id)
          }
          slideRef.current = false
          setHoverId(null)
          if (!longRef.current) lockSelect(false)
        }}
        onPointerLeave={clearTimer}
        onPointerCancel={() => {
          clearTimer()
          slideRef.current = false
          setHoverId(null)
          if (!longRef.current) lockSelect(false)
        }}
        onContextMenu={(event) => {
          event.preventDefault()
          clearTimer()
          openMenu()
        }}
        onClick={() => {
          if (longRef.current) {
            longRef.current = false
            return
          }
          onSelect('grid')
        }}
      >
        <ToolboxIcon />
      </button>
      {menu &&
        createPortal(
          <div
            className="gt-root gt-menu-backdrop"
            onClick={() => setMenu(null)}
            onContextMenu={(event) => {
              event.preventDefault()
              setMenu(null)
            }}
          >
            <div
              className="gt-menu"
              role="menu"
              style={{ left: menu.left, top: menu.top }}
              onClick={(event) => event.stopPropagation()}
            >
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  data-gt-id={item.id}
                  className={`gt-menu-item${hoverId === item.id ? ' active' : ''}`}
                  onClick={() => pick(item.id)}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}

/* ───────────── 擲骰 ───────────── */
/* ───────────── 九格：長按工具進入調整位置，拖曳換位置 ───────────── */

function ToolGrid({ onChoose }: { onChoose: (id: ToolChoice) => void }) {
  const [order, setOrder] = useState<ToolChoice[]>(loadOrder)
  const [editing, setEditing] = useState(false)
  const [drag, setDrag] = useState<{
    id: ToolChoice
    dx: number
    dy: number
    over: ToolChoice | null
  } | null>(null)
  const timerRef = useRef<number | null>(null)
  const suppressRef = useRef(false)
  const startRef = useRef({ x: 0, y: 0 })

  function clearTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => clearTimer, [])

  // 手指現在在哪一格工具上（排除自己）
  function tileAt(x: number, y: number, exclude: ToolChoice): ToolChoice | null {
    const tiles = document.querySelectorAll<HTMLElement>('[data-gt-tile]')
    for (const el of Array.from(tiles)) {
      const id = el.getAttribute('data-gt-tile')
      if (id === exclude) continue
      const r = el.getBoundingClientRect()
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        return MENU_ITEMS.find((m) => m.id === id)?.id ?? null
      }
    }
    return null
  }

  function finishDrag() {
    if (drag && drag.over && drag.over !== drag.id) {
      const next = order.filter((i) => i !== drag.id)
      const at = next.indexOf(drag.over)
      // 往後拖放在目標後面，往前拖放在目標前面
      const from = order.indexOf(drag.id)
      const to = order.indexOf(drag.over)
      next.splice(from < to ? at + 1 : at, 0, drag.id)
      setOrder(next)
      saveOrder(next)
    }
    setDrag(null)
  }

  return (
    <>
      {editing && (
        <div className="gt-edit-bar">
          <span>拖曳工具調整位置，主畫面長按只會顯示最前面 3 個</span>
          <button
            type="button"
            className="gt-secondary gt-edit-done"
            onClick={() => {
              setEditing(false)
              setDrag(null)
            }}
          >
            完成
          </button>
        </div>
      )}
      <div className="gt-grid">
        {order.map((id, index) => {
          const item = MENU_ITEMS.find((m) => m.id === id)
          if (!item) return null
          const dragging = drag?.id === id
          const cls = [
            'gt-tile',
            editing && !dragging ? 'wiggle' : '',
            dragging ? 'dragging' : '',
            drag && drag.over === id ? 'drop' : '',
            index < 3 ? 'fav' : '',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <button
              key={id}
              type="button"
              data-gt-tile={id}
              className={cls}
              style={
                dragging && drag
                  ? { transform: `translate(${drag.dx}px, ${drag.dy}px) scale(1.06)` }
                  : undefined
              }
              onPointerDown={(event) => {
                suppressRef.current = false
                lockSelect(true)
                startRef.current = { x: event.clientX, y: event.clientY }
                try {
                  event.currentTarget.setPointerCapture(event.pointerId)
                } catch {
                  // 不能抓取就算了
                }
                if (editing) {
                  setDrag({ id, dx: 0, dy: 0, over: null })
                  return
                }
                clearTimer()
                timerRef.current = window.setTimeout(() => {
                  timerRef.current = null
                  suppressRef.current = true
                  setEditing(true)
                  // 長按後手指不放，可以直接拖
                  setDrag({ id, dx: 0, dy: 0, over: null })
                }, LONG_PRESS_MS)
              }}
              onPointerMove={(event) => {
                const dx = event.clientX - startRef.current.x
                const dy = event.clientY - startRef.current.y
                if (drag && drag.id === id) {
                  setDrag({
                    id,
                    dx,
                    dy,
                    over: tileAt(event.clientX, event.clientY, id),
                  })
                } else if (timerRef.current !== null && dx * dx + dy * dy > 100) {
                  clearTimer()
                }
              }}
              onPointerUp={() => {
                clearTimer()
                finishDrag()
                lockSelect(false)
              }}
              onPointerCancel={() => {
                clearTimer()
                setDrag(null)
                lockSelect(false)
              }}
              onContextMenu={(event) => event.preventDefault()}
              onClick={() => {
                if (suppressRef.current) {
                  suppressRef.current = false
                  return
                }
                if (editing) return
                onChoose(id)
              }}
            >
              <span className="gt-tile-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="gt-tile-name">{item.name}</span>
            </button>
          )
        })}
        {Array.from({ length: GRID_SLOTS - order.length }, (_, i) => (
          <div key={`empty-${i}`} className="gt-tile gt-tile-empty">
            <span className="gt-tile-icon" aria-hidden="true">
              ＋
            </span>
            <span className="gt-tile-name">待加入</span>
          </div>
        ))}
      </div>
    </>
  )
}

/* ───────────── 小工具視窗（全螢幕） ───────────── */


export default function GameTools({
  view,
  onViewChange,
  onClose,
  onOpenPicker,
}: {
  view: ToolView | null
  onViewChange: (view: ToolView) => void
  onClose: () => void
  onOpenPicker: () => void
}) {
  useBackClose(onClose, view !== null)

  // 關掉小工具視窗就清掉資源數量（只放記憶體）
  useEffect(() => {
    if (view === null) clearResourceSnapshot()
  }, [view])

  if (view === null) return null

  // 先關掉小工具，稍等再開挑三款，避免兩個視窗同時改瀏覽紀錄
  function openPicker() {
    onClose()
    window.setTimeout(onOpenPicker, 350)
  }

  const kind = kindOfView(view)

  // ✕：在工作區裡回到小工具九格，在九格才關閉；點視窗外面直接回主畫面
  function handleX() {
    if (view === 'grid') onClose()
    else onViewChange('grid')
  }

  return (
    <div className="gt-root gt-backdrop" onClick={onClose}>
      <div
        className={kind === null ? 'gt-sheet' : 'gt-sheet tw-sheet'}
        role="dialog"
        aria-label="小工具"
        onClick={(event) => event.stopPropagation()}
      >
        {kind === null ? (
          <>
            <div className="gt-head">
              <span className="gt-title">🧰 小工具</span>
              <span className="gt-head-actions">
                <button type="button" className="gt-close" aria-label="關閉" onClick={handleX}>
                  ×
                </button>
              </span>
            </div>
            <div className="gt-body">
              <ToolGrid onChoose={(id) => (id === 'picker' ? openPicker() : onViewChange(id))} />
            </div>
          </>
        ) : (
          <ToolWorkspace key={view} initialKind={kind} onExitToGrid={() => onViewChange('grid')} />
        )}
      </div>
    </div>
  )
}
