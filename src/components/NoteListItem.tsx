import type { ReactNode } from 'react'
import '../styles/note-list.css'
import '../styles/note-points.css'
import '../styles/note-likes.css'

// 清單式留言列：收合時只顯示 名字・日期・遊戲・前兩行內容（太長以 … 結尾），
// 點一下展開看全文與操作按鈕。
export default function NoteListItem({
  name,
  mine = false,
  date,
  gameName,
  tag,
  onOpenGame,
  content,
  open,
  onToggle,
  badge,
  thumb,
  hideText = false,
  like = '',
  dislike = '',
  likeCount,
  iLiked = false,
  canLike = false,
  likeBusy = false,
  onLike,
  onDelete,
  deleteBusy = false,
  children,
}: {
  name: string
  mine?: boolean
  date?: string
  gameName?: string
  tag?: string // 場次標籤（例如「11/11 聚會名稱」），沒標聚會就不傳
  onOpenGame?: () => void
  content: string
  open: boolean
  onToggle: () => void
  badge?: ReactNode // 日期後面的小徽章（例如公開／私人）
  thumb?: ReactNode // 左側小縮圖（例如遊戲封面）
  hideText?: boolean // 編輯中不顯示內文，改由 children 放輸入框
  like?: string // 喜歡的點（展開後才顯示）
  dislike?: string // 不喜歡的點（展開後才顯示）
  likeCount?: number // 按讚數（沒傳＝不顯示按讚）
  iLiked?: boolean
  canLike?: boolean // 可以按（不是自己的留言、且是 VIP／管理者）
  likeBusy?: boolean
  onLike?: () => void
  onDelete?: () => void // 有傳就在清單列底下顯示「刪除」鈕（不用點開）
  deleteBusy?: boolean
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
          {likeCount !== undefined &&
            (canLike ? (
              <button
                type="button"
                className={`nl-like${iLiked ? ' on' : ''}`}
                aria-pressed={iLiked}
                aria-label={iLiked ? '取消讚' : '按讚'}
                disabled={likeBusy}
                onClick={(event) => {
                  event.stopPropagation()
                  onLike?.()
                }}
              >
                👍 {likeCount}
              </button>
            ) : likeCount > 0 ? (
              <span className="nl-like off">👍 {likeCount}</span>
            ) : null)}
          <span className="nl-caret" aria-hidden="true">
            {open ? '▴' : '▾'}
          </span>
        </div>
        {(gameName || tag) && (
          <div className="nl-chips">
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
            {tag ? <span className="nl-tag">🏷 {tag}</span> : null}
          </div>
        )}
        {hideText ? null : <p className={`nl-text${open ? ' full' : ''}`}>{content}</p>}
        {open && !hideText && (like || dislike) ? (
          <div className="np-view">
            {like ? <p className="np-line np-like">👍 喜歡：{like}</p> : null}
            {dislike ? <p className="np-line np-dislike">👎 不喜歡：{dislike}</p> : null}
          </div>
        ) : null}
        {onDelete ? (
          <div className="nl-quick">
            <button
              type="button"
              className="nl-quick-del"
              disabled={deleteBusy}
              onClick={(event) => {
                event.stopPropagation()
                onDelete()
              }}
            >
              🗑 {deleteBusy ? '刪除中…' : '刪除'}
            </button>
          </div>
        ) : null}
        </div>
      </div>
      {open && children ? <div className="nl-actions">{children}</div> : null}
    </li>
  )
}
