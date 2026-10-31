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
  badge,
  thumb,
  hideText = false,
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
  badge?: ReactNode // 日期後面的小徽章（例如公開／私人）
  thumb?: ReactNode // 左側小縮圖（例如遊戲封面）
  hideText?: boolean // 編輯中不顯示內文，改由 children 放輸入框
  children?: ReactNode
}) {
  return (
    <li className={`nl-item${open ? ' is-open' : ''}${thumb ? ' has-thumb' : ''}`}>
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
        {thumb ? <div className="nl-thumb">{thumb}</div> : null}
        <div className="nl-main">
        <div className="nl-top">
          <b className="nl-name">{name}</b>
          {mine && <span className="gb-mine">我的</span>}
          {date && <span className="nl-date">{date}</span>}
          {badge}
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
        {hideText ? null : <p className={`nl-text${open ? ' full' : ''}`}>{content}</p>}
        </div>
      </div>
      {open && children ? <div className="nl-actions">{children}</div> : null}
    </li>
  )
}
