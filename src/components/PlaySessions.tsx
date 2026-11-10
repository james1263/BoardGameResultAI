import { useState, type FormEvent } from 'react'
import type { PersonalApi } from '../lib/personalApi'
import { todayLocal, type PlaySessionsApi } from '../lib/useGamePlaySessions'
import { askConfirm, showNotice } from '../lib/askConfirm'

export default function PlaySessions({
  bggName,
  personal,
  api,
  onWriteNote,
}: {
  bggName: string
  personal: PersonalApi
  api: PlaySessionsApi
  // 補完日期後使用者選「好」：帶著遊戲、日期、日期紀錄 id 去寫這天的心得
  onWriteNote?: (info: { bggName: string; playedOn: string; sessionId: string }) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [date, setDate] = useState(todayLocal)
  const list = api.getSessions(bggName)
  const autoCount = list.filter((item) => item.source !== 'manual').length
  const manualCount = list.length - autoCount
  // 還沒指定日期的次數：補日期只是把其中一次換成有日期，總次數不變
  const undated = personal.getEntry(bggName).playCount

  if (!personal.isLoggedIn) {
    return <p className="personal-hint">登入後可記錄每次遊玩的日期</p>
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!date || date > todayLocal()) {
      void showNotice('請選擇今天或更早的日期。')
      return
    }
    const result = await api.addPlayDate(bggName, date)
    if (!result) return

    // 資料庫已把無日期次數 −1，這裡只同步畫面（跳過「次數 0 時設為 1」的規則）
    personal.updateEntry(bggName, { playCount: result.playCount }, { skipPlayedRule: true })

    const playedOn = date
    setDate(todayLocal())
    setIsOpen(false)

    if (onWriteNote) {
      const ok = await askConfirm('要不要寫這天的心得？', {
        confirmText: '好',
        cancelText: '稍後再說',
      })
      if (ok) onWriteNote({ bggName, playedOn, sessionId: result.id })
    }
  }

  async function handleDelete(id: string) {
    const ok = await askConfirm(
      '確定要刪除這筆日期嗎？\n總次數不變，這次會變回「沒有日期的次數」。這天的心得也會一併刪除。',
      { confirmText: '刪除', cancelText: '取消', danger: true },
    )
    if (!ok) return
    const count = await api.deletePlayDate(id)
    if (count !== null) {
      personal.updateEntry(bggName, { playCount: count }, { skipPlayedRule: true })
    }
  }

  const canAdd = personal.canEdit && api.status === 'ready' && undated > 0

  return (
    <div className="play-sessions">
      {!isOpen ? (
        <>
          <button
            type="button"
            className="play-sessions-add"
            disabled={!canAdd}
            onClick={() => setIsOpen(true)}
          >
            ＋ 補一個日期
          </button>
          <p className="personal-hint">
            {undated > 0
              ? `還有 ${undated} 次沒有日期，可以補上日期（總次數不變）。`
              : '目前每一次都有日期了。要再補，請先按「＋」增加次數。'}
          </p>
        </>
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

      {api.status === 'loading' && <p className="personal-hint">讀取遊玩紀錄中…</p>}
      {api.status === 'error' && (
        <p className="personal-hint">
          讀取遊玩紀錄失敗。
          <button type="button" className="play-sessions-link" onClick={api.reload}>
            重試
          </button>
        </p>
      )}

      {list.length > 0 && (
        <details className="play-sessions-fold">
          <summary style={{ cursor: 'pointer', margin: '8px 0 4px' }}>
            所有已玩日期 {list.length} 筆（手動 {manualCount}・自動 {autoCount}）
          </summary>
          <ul className="play-sessions-list">
            {list.map((item) => (
              <li key={item.id}>
                <div className="play-sessions-main">
                  <strong>{item.playedOn.replaceAll('-', '/')}</strong>
                  {item.source !== 'manual' && (
                    <span
                      style={{
                        fontSize: '0.75em',
                        background: '#e6efe8',
                        color: '#3d6b4c',
                        borderRadius: 999,
                        padding: '1px 8px',
                      }}
                    >
                      自動
                    </span>
                  )}
                  {item.playerCount != null && <span>{item.playerCount} 人</span>}
                  {item.source === 'manual' && (
                    <button
                      type="button"
                      className="play-sessions-link"
                      disabled={api.busy}
                      onClick={() => void handleDelete(item.id)}
                    >
                      刪除
                    </button>
                  )}
                </div>
                {item.note && <p>{item.note}</p>}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
