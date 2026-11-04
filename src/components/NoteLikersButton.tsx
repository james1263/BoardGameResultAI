import { useState } from 'react'
import { getNoteLikers, type Liker } from '../lib/noteLikes'
import '../styles/note-likes.css'

// 管理者專用：點開看這則留言是誰按的讚
export default function NoteLikersButton({
  noteId,
  count,
}: {
  noteId: string
  count: number
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [list, setList] = useState<Liker[]>([])

  async function toggle() {
    if (open) {
      setOpen(false)
      return
    }
    setOpen(true)
    setLoading(true)
    setError('')
    try {
      setList(await getNoteLikers(noteId))
    } catch {
      setError('讀取按讚名單失敗')
    }
    setLoading(false)
  }

  return (
    <div className="nlk">
      <button type="button" className="gb-action" onClick={() => void toggle()}>
        按讚名單（{count}）{open ? ' ▴' : ' ▾'}
      </button>
      {open && (
        <ul className="nlk-list">
          {loading && <li>讀取中…</li>}
          {error && <li>{error}</li>}
          {!loading &&
            !error &&
            list.map((person, index) => (
              <li key={index}>
                {person.nickname}
                {person.contact_name ? `（${person.contact_name}）` : ''}
              </li>
            ))}
          {!loading && !error && list.length === 0 && <li>目前沒有人按讚</li>}
        </ul>
      )}
    </div>
  )
}
