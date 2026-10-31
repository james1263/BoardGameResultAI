import { useMemo, useState, type FormEvent } from 'react'
import type { BoardGame } from '../data/boardGames.generated'
import type { PersonalApi } from '../lib/personalApi'
import { supabase } from '../lib/supabase'
import { todayLocal, type PlaySessionsApi } from '../lib/useGamePlaySessions'
import { askConfirm, showNotice } from '../lib/askConfirm'

type PlayableGame = BoardGame & { removedAt?: string | null }

// 比對時忽略大小寫、空白與標點
function normalize(text: string): string {
  return text.toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '')
}

export default function AddPlayLog({
  boardGames,
  personal,
  playSessions,
  canShare = false,
  onBack,
  onClose,
}: {
  boardGames: PlayableGame[]
  personal: PersonalApi
  playSessions: PlaySessionsApi
  // VIP／管理者才能把心得同時發表到這款遊戲的討論
  canShare?: boolean
  onBack: () => void
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<PlayableGame | null>(null)
  const [date, setDate] = useState(todayLocal)
  const [players, setPlayers] = useState('')
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')
  const [warning, setWarning] = useState('')
  const [share, setShare] = useState(false)
  const [sharing, setSharing] = useState(false)

  // 勾了分享、而且心得有字，才會真的發表
  const shareNow = canShare && share && note.trim() !== ''

  // 輸入就列出最多 8 款：開頭相符排前面，其次是包含
  const matches = useMemo(() => {
    const q = normalize(query)
    if (!q) return []
    const found: { game: PlayableGame; rank: number }[] = []
    for (const game of boardGames) {
      const names = [normalize(game.name), normalize(game.bggName)]
      if (names.some((name) => name.startsWith(q))) found.push({ game, rank: 0 })
      else if (names.some((name) => name.includes(q))) found.push({ game, rank: 1 })
    }
    found.sort((a, b) => a.rank - b.rank)
    return found.slice(0, 8).map((item) => item.game)
  }, [query, boardGames])

  const canSave =
    personal.canEdit &&
    playSessions.status === 'ready' &&
    !playSessions.busy &&
    !sharing

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!selected) {
      await showNotice('請先選擇遊戲。')
      return
    }

    const count = players.trim() === '' ? null : Number(players)
    if (count !== null && (!Number.isInteger(count) || count < 1 || count > 99)) {
      await showNotice('玩家人數請填 1～99 的整數，或留空。')
      return
    }
    if (!date || date > todayLocal()) {
      await showNotice('請選擇今天或更早的日期。')
      return
    }

    const duplicated = playSessions
      .getSessions(selected.bggName)
      .some((item) => item.playedOn === date)
    if (
      duplicated &&
      !(await askConfirm('這天已經有這款遊戲的紀錄了，還要再記一筆嗎？', { danger: false }))
    ) {
      return
    }

    const ok = await playSessions.addSession(selected.bggName, {
      playedOn: date,
      playerCount: count,
      note: note.trim(),
    })
    if (!ok) return

    // 有紀錄就一定玩過；略過「次數 0 時設為 1」的規則，避免總次數多算
    if (!personal.getEntry(selected.bggName).played) {
      personal.updateEntry(
        selected.bggName,
        { played: true },
        { skipPlayedRule: true },
      )
    }

    // 遊玩紀錄已存好；要分享的話再發表到討論，失敗不影響紀錄
    let shareResult = ''
    if (shareNow) {
      setSharing(true)
      shareResult = await postToDiscussion(selected.bggName, note.trim())
      setSharing(false)
    }

    setMessage(
      `已記錄：${selected.name}（${date.replaceAll('-', '/')}）` +
        (shareNow && shareResult === '' ? '，也已發表到討論' : ''),
    )
    setWarning(shareResult)
    setSelected(null)
    setQuery('')
    setPlayers('')
    setNote('')
    setShare(false)
  }

  // 發表到這款遊戲的討論；成功回傳空字串，失敗回傳要顯示的說明
  async function postToDiscussion(bggName: string, content: string): Promise<string> {
    async function attempt() {
      return supabase.rpc('add_game_note', {
        p_bgg_name: bggName,
        p_content: content,
      })
    }
    let { error } = await attempt()
    if (error && !error.message.includes('too many')) {
      // 剛標成已玩，資料庫可能還沒更新：稍等一下再試一次
      await new Promise((resolve) => window.setTimeout(resolve, 800))
      ;({ error } = await attempt())
    }
    if (!error) return ''
    if (error.message.includes('too many')) {
      return '遊玩紀錄已儲存，但這款遊戲的討論你已留滿 10 則，沒有發表。'
    }
    return '遊玩紀錄已儲存，但發表到討論失敗，可以之後到這款遊戲的「討論」分頁再發。'
  }

  return (
    <>
      <div className="mylist-backdrop" onClick={onClose} />
      <aside className="mylist-drawer" role="dialog" aria-label="補記遊玩">
        <div className="mylist-header">
          <h2>補記遊玩</h2>
          <button
            className="mylist-close"
            type="button"
            aria-label="關閉"
            onClick={onBack}
          >
            ×
          </button>
        </div>

        <div className="mylist-body">
          <p className="mg-muted">
            補記過去玩過的遊戲。每記一筆，該遊戲的總遊玩次數會自動 +1，並標成已玩。
          </p>

          {message && <p className="ap-ok">{message}</p>}
          {warning && <p className="mg-muted">{warning}</p>}

          {!personal.isLoggedIn ? (
            <p className="mylist-empty">登入後才能記錄遊玩。</p>
          ) : (
            <form className="play-sessions-form" onSubmit={handleSubmit}>
              <div className="ap-field">
                <span className="ap-label">遊戲</span>
                {selected ? (
                  <div className="ap-picked">
                    <b>{selected.name}</b>
                    {selected.removedAt && (
                      <span className="ap-removed">已移除</span>
                    )}
                    <button
                      type="button"
                      className="play-sessions-link"
                      onClick={() => {
                        setSelected(null)
                        setMessage('')
                        setWarning('')
                      }}
                    >
                      更換
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      className="ap-search"
                      placeholder="輸入遊戲名稱（中文或英文）"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                    />
                    {query.trim() !== '' && matches.length === 0 && (
                      <p className="mg-muted">找不到符合的遊戲。</p>
                    )}
                    {matches.length > 0 && (
                      <ul className="ap-results">
                        {matches.map((game) => (
                          <li key={game.bggName}>
                            <button
                              type="button"
                              className="ap-result"
                              onClick={() => {
                                setSelected(game)
                                setMessage('')
                                setWarning('')
                              }}
                            >
                              {game.name}
                              {game.removedAt && (
                                <span className="ap-removed">已移除</span>
                              )}
                              {game.bggName !== game.name && (
                                <small>{game.bggName}</small>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>

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
              {canShare && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    id="ap-share"
                    type="checkbox"
                    checked={share}
                    disabled={note.trim() === ''}
                    onChange={(event) => setShare(event.target.checked)}
                  />
                  <label
                    htmlFor="ap-share"
                    style={{ display: 'inline', margin: 0, fontSize: 14 }}
                  >
                    同時發表到這款遊戲的討論（VIP 都看得到，心得要有字才能勾）
                  </label>
                </div>
              )}
              <div className="play-sessions-actions">
                <button type="submit" disabled={!canSave || !selected}>
                  {playSessions.busy || sharing ? '儲存中…' : '儲存'}
                </button>
              </div>
            </form>
          )}
        </div>
      </aside>
    </>
  )
}