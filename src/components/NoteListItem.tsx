import type { ReactNode } from 'react'
import '../styles/note-list.css'

// 清單式留言列：收合時只顯示 名字・日期・遊戲・前兩行內容（太長以 … 結尾），
// 點一下展開看全文與操作按鈕。
export default function NoteListItem({
  name,
  mine = false,
  date,
  gameName,
  onOpenGame,
  content,
  open,
  onToggle,
  children,
}: {
  name: string
  mine?: boolean
  date?: string
  gameName?: string
  onOpenGame?: () => void
  content: string
  open: boolean
  onToggle: () => void
  children?: ReactNode
}) {
  return (
    <li className={`nl-item${open ? ' is-open' : ''}`}>
      <div
        className="nl-row"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onToggle()
          }
        }}
      >
        <div className="nl-top">
          <b className="nl-name">{name}</b>
          {mine && <span className="gb-mine">我的</span>}
          {date && <span className="nl-date">{date}</span>}
          <span className="nl-caret" aria-hidden="true">
            {open ? '▴' : '▾'}
          </span>
        </div>
        {gameName &&
          (onOpenGame ? (
            <button
              type="button"
              className="nl-game"
              onClick={(event) => {
                event.stopPropagation()
                onOpenGame()
              }}
            >
              {gameName} ›
            </button>
          ) : (
            <span className="nl-game nl-game-off">{gameName}</span>
          ))}
        <p className={`nl-text${open ? ' full' : ''}`}>{content}</p>
      </div>
      {open && children ? <div className="nl-actions">{children}</div> : null}
    </li>
  )
}
