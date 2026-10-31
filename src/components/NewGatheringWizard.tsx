import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'
import { todayLocal } from '../lib/useLoyalty'
import { useBackClose } from '../lib/useBackClose'
import '../styles/new-gathering.css'

type GameOption = { bggName: string; name: string }
type Player = { id: string; nickname: string }

function normalize(text: string): string {
  return text.toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '')
}

// 管理中心「新增聚會」：基本資料、指定遊戲、參加者、人數上限與連結，一次建立
export default function NewGatheringWizard({
  allGames,
  players,
  contacts,
  wantMap,
  onClose,
  onCreated,
}: {
  allGames: GameOption[]
  players: Player[]
  contacts: Record<string, string>
  wantMap: Map<string, Set<string>> | null
  onClose: () => void
  onCreated: (gatheringId: string) => void
}) {
  useBackClose(onClose, true)

  const [date, setDate] = useState(todayLocal)
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [games, setGames] = useState<string[]>([])
  const [gameSearch, setGameSearch] = useState('')
  const [picked, setPicked] = useState<string[]>([])
  const [exempt, setExempt] = useState<string[]>([])
  const [playerSearch, setPlayerSearch] = useState('')
  const [openWant, setOpenWant] = useState<string | null>(null)
  const [openWanters, setOpenWanters] = useState<Record<string, boolean>>({})
  const [makeLink, setMakeLink] = useState(true)
  const [capacity, setCapacity] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState<{ id: string; warnings: string[] } | null>(null)

  const gameName = useMemo(
    () => new Map(allGames.map((game) => [game.bggName, game.name])),
    [allGames],
  )

  const linkAllowed = date >= todayLocal() && games.length > 0
  const linkOn = makeLink && linkAllowed

  const gameMatches = useMemo(() => {
    const query = normalize(gameSearch)
    if (!query) return []
    return allGames
      .filter(
        (game) =>
          !games.includes(game.bggName) &&
          (normalize(game.name).includes(query) || normalize(game.bggName).includes(query)),
      )
      .slice(0, 8)
  }, [allGames, games, gameSearch])

  const shownPlayers = useMemo(() => {
    const query = normalize(playerSearch)
    if (!query) return players
    return players.filter(
      (player) =>
        normalize(player.nickname).includes(query) ||
        normalize(contacts[player.id] ?? '').includes(query),
    )
  }, [players, contacts, playerSearch])

  // 想玩這款的人：已選參加者排前面
  function wanters(
    bggName: string,
  ): { id: string; name: string; contact: string; picked: boolean }[] {
    if (!wantMap) return []
    return players
      .filter((player) => wantMap.get(player.id)?.has(bggName))
      .map((player) => ({
        id: player.id,
        name: player.nickname || '（未設暱稱）',
        contact: (contacts[player.id] ?? '').trim(),
        picked: picked.includes(player.id),
      }))
      .sort((a, b) => Number(b.picked) - Number(a.picked))
  }

  function wantedGamesOf(userId: string): string[] {
    const names = [...(wantMap?.get(userId) ?? [])].filter((name) => gameName.has(name))
    return names.sort(
      (a, b) => Number(games.includes(b)) - Number(games.includes(a)),
    )
  }

  function togglePlayer(userId: string) {
    setPicked((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    )
    setExempt((current) => current.filter((id) => id !== userId))
  }

  async function submit() {
    setError('')
    if (!date) {
      setError('請選擇聚會日期。')
      return
    }
    const capValue = Number(capacity.trim())
    if (linkOn) {
      if (capacity.trim() === '' || !Number.isInteger(capValue) || capValue < 1 || capValue > 500) {
        setError('要建立聚會連結，請先填人數上限（1～500 的整數）。')
        return
      }
      if (picked.length >= capValue) {
        setError(
          `手動加入的人數（${picked.length}）已經達到人數上限（${capValue}），沒有名額留給聚會連結。請提高人數上限，或取消部分參加者。`,
        )
        return
      }
    }
    if (
      picked.length > 0 &&
      !window.confirm(
        `將有 ${picked.length} 位玩家加入出席名單，他們會自動成為 VIP 並計入集點。確定建立聚會嗎？`,
      )
    )
      return

    setBusy(true)
    const { data, error: insertError } = await supabase
      .from('gatherings')
      .insert({ gathered_on: date, title: title.trim(), note: note.trim() })
      .select('id')
      .single()
    if (insertError || !data) {
      setBusy(false)
      setError(
        insertError?.code === '23505'
          ? '這一天已經有相同場次名稱的聚會了，請換一個場次名稱（例如：早場、下午場、晚場），或直接到「近期聚會」編輯那一場。'
          : '新增失敗：' + (insertError?.message ?? '請稍後再試'),
      )
      return
    }

    const id = data.id as string
    const warnings: string[] = []

    if (games.length > 0) {
      const result = await supabase
        .from('gathering_games')
        .insert(games.map((bggName) => ({ gathering_id: id, bgg_name: bggName })))
      if (result.error) warnings.push('指定遊戲沒有存成功：' + result.error.message)
    }

    if (picked.length > 0) {
      const result = await supabase.from('gathering_attendees').insert(
        picked.map((userId) => ({
          gathering_id: id,
          user_id: userId,
          exempt: exempt.includes(userId),
        })),
      )
      if (result.error) warnings.push('參加者沒有存成功：' + result.error.message)
    }

    if (linkOn) {
      if (warnings.length > 0) {
        warnings.push('因為上面有失敗，所以沒有建立聚會連結，請到「近期聚會」補設定。')
      } else {
        const result = await supabase
          .from('gathering_checkins')
          .insert({ gathering_id: id, is_open: true, capacity: capValue })
        if (result.error) warnings.push('聚會連結建立失敗：' + result.error.message)
      }
    }

    setBusy(false)
    if (warnings.length === 0) onCreated(id)
    else setDone({ id, warnings })
  }

  return createPortal(
    <div className="ngw-backdrop" role="dialog" aria-label="新增聚會">
      <div className="ngw-panel">
        <div className="ngw-header">
          <h2>新增聚會</h2>
          <button type="button" className="ngw-close" aria-label="關閉" onClick={onClose}>
            ×
          </button>
        </div>

        {done ? (
          <div className="ngw-body">
            <p className="ngw-title-ok">聚會已建立，但有部分沒有完成：</p>
            <ul className="ngw-warn">
              {done.warnings.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
            <p className="ngw-hint">請到「近期聚會」展開這一場補設定。</p>
            <div className="ngw-footer">
              <button type="button" className="ngw-primary" onClick={() => onCreated(done.id)}>
                前往這場聚會
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="ngw-body">
              <section className="ngw-sec">
                <h3>1. 基本資料</h3>
                <label className="ngw-field">
                  <span>日期</span>
                  <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
                </label>
                <label className="ngw-field">
                  <span>場次（選填，例如：早場、晚場）</span>
                  <input
                    type="text"
                    maxLength={20}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </label>
                <label className="ngw-field">
                  <span>備註（選填，200 字內）</span>
                  <input
                    type="text"
                    maxLength={200}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                  />
                </label>
                <p className="ngw-hint">
                  同一天可以新增多場（場次名稱不能重複）。集點是一天最多 1 點：出席並把任一款指定遊戲的七項評分填完整（或免評分）就得 1 點。
                </p>
              </section>

              <section className="ngw-sec">
                <h3>2. 指定遊戲</h3>
                <input
                  type="search"
                  className="ngw-search"
                  placeholder="搜尋遊戲名稱後加入"
                  value={gameSearch}
                  onChange={(event) => setGameSearch(event.target.value)}
                />
                {gameMatches.length > 0 && (
                  <ul className="ngw-results">
                    {gameMatches.map((game) => (
                      <li key={game.bggName}>
                        <button
                          type="button"
                          onClick={() => {
                            setGames((current) => [...current, game.bggName])
                            setGameSearch('')
                          }}
                        >
                          ＋ {game.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {gameSearch.trim() !== '' && gameMatches.length === 0 && (
                  <p className="ngw-hint">找不到符合的遊戲。</p>
                )}
                {games.length === 0 ? (
                  <p className="ngw-hint">
                    還沒指定遊戲。沒有指定遊戲就不能建立聚會連結，也沒有評分得點。
                  </p>
                ) : (
                  <ul className="ngw-games">
                    {games.map((bggName) => {
                      const list = wanters(bggName)
                      return (
                        <li key={bggName} className="ngw-game">
                          <div className="ngw-game-row">
                            <b>{gameName.get(bggName) ?? bggName}</b>
                            <button
                              type="button"
                              className="ngw-x"
                              onClick={() =>
                                setGames((current) => current.filter((name) => name !== bggName))
                              }
                            >
                              移除
                            </button>
                          </div>
                          {wantMap && (
                            <p className="ngw-wanters">
                              {list.length === 0 ? (
                                '目前沒有人標想玩'
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    aria-expanded={!!openWanters[bggName]}
                                    onClick={() =>
                                      setOpenWanters((current) => ({
                                        ...current,
                                        [bggName]: !current[bggName],
                                      }))
                                    }
                                    style={{
                                      padding: 0,
                                      border: 'none',
                                      background: 'none',
                                      color: 'inherit',
                                      font: 'inherit',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    社群有 {list.length} 人想玩 {openWanters[bggName] ? '▴' : '▾'}
                                  </button>
                                  {openWanters[bggName] && (
                                    <span style={{ display: 'block', marginTop: 4, lineHeight: 1.6 }}>
                                      {list.map((item, index) => (
                                        <span key={item.id} className={item.picked ? 'on' : ''}>
                                          {index > 0 ? '、' : ''}
                                          {item.picked ? '✓ ' : ''}
                                          {item.name}
                                          {item.contact ? `（${item.contact}）` : ''}
                                        </span>
                                      ))}
                                    </span>
                                  )}
                                </>
                              )}
                            </p>
                          )}
                            </p>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>

              <section className="ngw-sec">
                <h3>3. 參加者（可跳過）</h3>
                <p className="ngw-hint">
                  勾選的人會直接加入出席名單，並自動成為 VIP、計入集點。也可以之後只用聚會連結讓大家自己報到。
                </p>
                <input
                  type="search"
                  className="ngw-search"
                  placeholder="搜尋暱稱或 LINE／FB 名字"
                  value={playerSearch}
                  onChange={(event) => setPlayerSearch(event.target.value)}
                />
                <p className="ngw-count">已選 {picked.length} 人</p>
                <ul className="ngw-players">
                  {shownPlayers.map((player) => {
                    const isPicked = picked.includes(player.id)
                    const wanted = wantedGamesOf(player.id)
                    const open = openWant === player.id
                    return (
                      <li key={player.id} className={`ngw-player ${isPicked ? 'on' : ''}`}>
                        <div className="ngw-player-row">
                          <button
                            type="button"
                            className="ngw-check"
                            aria-pressed={isPicked}
                            onClick={() => togglePlayer(player.id)}
                          >
                            {isPicked ? '✓' : ''}
                          </button>
                          <span className="ngw-pname" onClick={() => togglePlayer(player.id)}>
                            <b>{player.nickname || '（未設暱稱）'}</b>
                            {contacts[player.id] && <small>{contacts[player.id]}</small>}
                          </span>
                          {wantMap && wanted.length > 0 && (
                            <button
                              type="button"
                              className="ngw-wantbtn"
                              aria-expanded={open}
                              onClick={() => setOpenWant(open ? null : player.id)}
                            >
                              想玩 {wanted.length} 款 {open ? '▴' : '▾'}
                            </button>
                          )}
                        </div>
                        {isPicked && (
                          <label className="ngw-exempt">
                            <input
                              type="checkbox"
                              checked={exempt.includes(player.id)}
                              onChange={(event) =>
                                setExempt((current) =>
                                  event.target.checked
                                    ? [...current, player.id]
                                    : current.filter((id) => id !== player.id),
                                )
                              }
                            />
                            免評分（直接算 1 點）
                          </label>
                        )}
                        {open && (
                          <p className="ngw-wantlist">
                            {wanted.map((name, index) => (
                              <span key={name} className={games.includes(name) ? 'on' : ''}>
                                {index > 0 ? '、' : ''}
                                {gameName.get(name) ?? name}
                                {games.includes(name) ? '（本場指定）' : ''}
                              </span>
                            ))}
                          </p>
                        )}
                      </li>
                    )
                  })}
                  {shownPlayers.length === 0 && <li className="ngw-hint">找不到符合的玩家。</li>}
                </ul>
              </section>

              <section className="ngw-sec">
                <h3>4. 聚會連結與人數上限</h3>
                <label className={`ngw-linkopt ${linkAllowed ? '' : 'off'}`}>
                  <input
                    type="checkbox"
                    checked={linkOn}
                    disabled={!linkAllowed}
                    onChange={(event) => setMakeLink(event.target.checked)}
                  />
                  建立聚會連結（讓大家自己報到）
                </label>
                {!linkAllowed && (
                  <p className="ngw-hint">
                    {games.length === 0
                      ? '要先指定至少一款遊戲才能建立連結。'
                      : '聚會連結只在聚會當天有效，補登過去的聚會不需要連結。'}
                  </p>
                )}
                {linkOn && (
                  <label className="ngw-field">
                    <span>人數上限（含手動加入的人，1～500）</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={500}
                      value={capacity}
                      onChange={(event) => setCapacity(event.target.value)}
                    />
                  </label>
                )}
                {linkOn && (
                  <p className="ngw-hint">
                    連結可用名額＝人數上限 − 手動加入人數。建立後到「近期聚會」展開這一場就能複製連結。
                  </p>
                )}
              </section>

              {error && <p className="ngw-error">{error}</p>}
            </div>

            <div className="ngw-footer">
              <button type="button" className="ngw-cancel" disabled={busy} onClick={onClose}>
                取消
              </button>
              <button type="button" className="ngw-primary" disabled={busy || !date} onClick={() => void submit()}>
                {busy ? '建立中…' : '建立聚會'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
