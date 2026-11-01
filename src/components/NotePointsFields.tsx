import { useState } from 'react'
import '../styles/note-points.css'

// 留言的選填欄位：「喜歡的點」「不喜歡的點」，按一下按鈕才展開輸入框
export default function NotePointsFields({
  like,
  dislike,
  onLike,
  onDislike,
}: {
  like: string
  dislike: string
  onLike: (value: string) => void
  onDislike: (value: string) => void
}) {
  const [showLike, setShowLike] = useState(like !== '')
  const [showDislike, setShowDislike] = useState(dislike !== '')

  return (
    <div className="np-fields">
      <div className="np-btns">
        <button
          type="button"
          className={`np-btn ${showLike ? 'on' : ''}`}
          aria-pressed={showLike}
          onClick={() => {
            if (showLike) onLike('')
            setShowLike(!showLike)
          }}
        >
          {showLike ? '－' : '＋'} 喜歡的點
        </button>
        <button
          type="button"
          className={`np-btn ${showDislike ? 'on' : ''}`}
          aria-pressed={showDislike}
          onClick={() => {
            if (showDislike) onDislike('')
            setShowDislike(!showDislike)
          }}
        >
          {showDislike ? '－' : '＋'} 不喜歡的點
        </button>
      </div>
      {showLike && (
        <div className="np-box">
          <textarea
            className="gb-textarea nl-short"
            rows={1}
            maxLength={100}
            value={like}
            placeholder="喜歡的點（選填，最多 100 字）"
            onChange={(event) => onLike(event.target.value)}
          />
          <span className="np-count">{like.length} / 100</span>
        </div>
      )}
      {showDislike && (
        <div className="np-box">
          <textarea
            className="gb-textarea nl-short"
            rows={1}
            maxLength={100}
            value={dislike}
            placeholder="不喜歡的點（選填，最多 100 字）"
            onChange={(event) => onDislike(event.target.value)}
          />
          <span className="np-count">{dislike.length} / 100</span>
        </div>
      )}
    </div>
  )
}
