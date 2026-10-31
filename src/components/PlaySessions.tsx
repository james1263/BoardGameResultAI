import { useState, type FormEvent } from 'react'
import type { PersonalApi } from '../lib/personalApi'
import { todayLocal, type PlaySessionsApi } from '../lib/useGamePlaySessions'
import { askConfirm, showNotice } from '../lib/askConfirm'

export default function PlaySessions({
  bggName,
  personal,
  api,
}: {
  bggName: string
  personal: PersonalApi
  api: PlaySessionsApi
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [date, setDate] = useState(todayLocal)
  const [players, setPlayers] = useState('')
  const [note, setNote] = useState('')
  const list = api.getSessions(bggName)

  if (!personal.isLoggedIn) {
    return (
      <p className="personal-hint">登入後可記錄每次遊玩的日期、人數與心得</p>
    )
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const count = players.trim() === '' ? null : Number(players)
    if (count !== null && (!Number.isInteger(count) || count < 1 || count > 99)) {
      void showNotice('玩家人數請填 1～99 的整數，或留空。')
      return
    }
    if (!date || date > todayLocal()) {
      void showNotice('請選擇今天或更早的日期。')
      return
    }

    const ok = await api.addSession(bggName, {
      playedOn: date,
      playerCount: count,
      note: note.trim(),
    })
    if (!ok) return

    // 有紀錄就一定玩過；略過「次數 0 時設為 1」的規則，避免總次數多算
    if (!personal.getEntry(bggName).played) {
      personal.updateEntry(bggName, { played: true }, { skipPlayedRule: true })
    }

    setDate(todayLocal())
    setPlayers('')
    setNote('')
    setIsOpen(false)
  }

  async function handleDelete(id: string) {
    const ok = await askConfirm('確定要刪除這筆遊玩紀錄嗎？', {
      confirmText: '刪除',
      cancelText: '取消',
      danger: true,
    })
    if (!ok) return
    void api.deleteSession(id)
  }

  return (
    <div className="play-sessions">
      {!isOpen ? (
        <button
          type="button"
          className="play-sessions-add"
          disabled={!personal.canEdit || api.status !== 'ready'}
          onClick={() => setIsOpen(true)}
        >
          ＋ 記錄一次遊玩
        </button>
      ) : (
        <form className="play-sessions-form" onSubmit={handleSubmit}>
          <label>
            <span>日期</span>
            <input
              type="date"
              value={date}
              max={todayLocal()}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>
          <label>
            <span>玩家人數（選填）</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={99}
              value={players}
              onChange={(event) => setPlayers(event.target.value)}
            />
          </label>
          <label>
            <span>心得（選填，200 字內）</span>
            <textarea
              rows={2}
              maxLength={200}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
          <div className="play-sessions-actions">
            <button type="submit" disabled={api.busy}>
              {api.busy ? '儲存中…' : '儲存'}
            </button>
            <button
              type="button"
              className="secondary"
              disabled={api.busy}
              onClick={() => setIsOpen(false)}
            >
              取消
            </button>
          </div>
        </form>
      )}

      {api.status === 'loading' && (
        <p className="personal-hint">讀取遊玩紀錄中…</p>
      )}
      {api.status === 'error' && (
        <p className="personal-hint">
          讀取遊玩紀錄失敗。
          <button type="button" className="play-sessions-link" onClick={api.reload}>
            重試
          </button>
        </p>
      )}

      {list.length > 0 && (
        <ul className="play-sessions-list">
          {list.map((item) => (
            <li key={item.id}>
              <div className="play-sessions-main">
                <strong>{item.playedOn.replaceAll('-', '/')}</strong>
                {item.playerCount != null && <span>{item.playerCount} 人</span>}
                <button
                  type="button"
                  className="play-sessions-link"
                  disabled={api.busy}
                  onClick={() => void handleDelete(item.id)}
                >
                  刪除
                </button>
              </div>
              {item.note && <p>{item.note}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}