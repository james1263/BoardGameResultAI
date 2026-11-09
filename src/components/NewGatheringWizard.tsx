import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'
import { askConfirm } from '../lib/askConfirm'
import { todayLocal } from '../lib/useLoyalty'
import { announcePlayed } from '../lib/useGamePlaySessions'
import { useBackClose } from '../lib/useBackClose'
import '../styles/new-gathering.css'

type GameOption = { bggName: string; name: string; referenceOnly?: boolean }
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
  const [adminId, setAdminId] = useState<string | null>(null)
  const [attempted, setAttempted] = useState(false)
  const [playersOpen, setPlayersOpen] = useState(false)
  const adminInit = useRef(false)
  const sec1Ref = useRef<HTMLElement | null>(null)
  const sec2Ref = useRef<HTMLElement | null>(null)
  const sec4Ref = useRef<HTMLElement | null>(null)

  // 管理者（目前登入者）預設在出席名單並免評分；之後可自行取消勾選
  useEffect(() => {
    let alive = true
    void supabase.auth.getSession().then(({ data }) => {
      const id = data.session?.user.id ?? null
      if (!alive || !id || adminInit.current) return
      adminInit.current = true
      setAdminId(id)
      setPicked((current) => (current.includes(id) ? current : [id, ...current]))
      setExempt((current) => (current.includes(id) ? current : [...current, id]))
    })
    return () => {
      alive = false
    }
  }, [])

  // 管理者沒有暱稱資料時也要出現在清單；管理者永遠排最上面
  const allPlayers = useMemo<Player[]>(() => {
    if (!adminId) return players
    const mine = players.find((player) => player.id === adminId)
    const rest = players.filter((player) => player.id !== adminId)
    return [mine ?? { id: adminId, nickname: '管理者（我）' }, ...rest]
  }, [players, adminId])

  const otherPicked = useMemo(
    () => picked.filter((id) => id !== adminId),
    [picked, adminId],
  )

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
          !game.referenceOnly &&
          !games.includes(game.bggName) &&
          (normalize(game.name).includes(query) || normalize(game.bggName).includes(query)),
      )
      .slice(0, 8)
  }, [allGames, games, gameSearch])

  const shownPlayers = useMemo(() => {
    const query = normalize(playerSearch)
    if (!query) return allPlayers
    return allPlayers.filter(
      (player) =>
        normalize(player.nickname).includes(query) ||
        normalize(contacts[player.id] ?? '').includes(query),
    )
  }, [allPlayers, contacts, playerSearch])

  // 想玩這款的人：已選參加者排前面
  function wanters(
    bggName: string,
  ): { id: string; name: string; contact: string; picked: boolean }[] {
    if (!wantMap) return []
    return allPlayers
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
    const turningOn = !picked.includes(userId)
    setPicked((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    )
    // 取消勾選就清掉免評分；管理者再勾回來時自動免評分
    setExempt((current) => {
      const without = current.filter((id) => id !== userId)
      return turningOn && userId === adminId ? [...without, userId] : without
    })
  }

  const capValueNow = Number(capacity.trim())

  // 必填步驟的檢查（1 基本資料、2 指定遊戲、4 連結設定有勾才檢查）
  const stepErrors = useMemo(() => {
    const result: { 1?: string; 2?: string; 4?: string } = {}
    if (!date) result[1] = '請選擇聚會日期。'
    else if (!title.trim()) result[1] = '請填場次名稱（例如：早場、晚場）。'
    if (games.length === 0) result[2] = '請至少指定一款遊戲。'
    if (linkOn) {
      if (
        capacity.trim() === '' ||
        !Number.isInteger(capValueNow) ||
        capValueNow < 1 ||
        capValueNow > 500
      ) {
        result[4] = '要建立聚會連結，請先填人數上限（1～500 的整數）。'
      } else if (picked.length >= capValueNow) {
        result[4] = `出席名單已有 ${picked.length} 人（含管理者），已達人數上限（${capValueNow}），沒有名額留給聚會連結。請提高人數上限，或取消部分參加者。`
      }
    }
    return result
  }, [date, title, games, linkOn, capacity, capValueNow, picked.length])

  // 有填過任何東西才算「有內容」；管理者預設勾選不算
  // 測試場：場次名稱以「測試」開頭（資料庫依這個規則略過已玩次數與遊戲紀錄）
  const isTest = title.trim().startsWith('測試')
  function toggleTest(checked: boolean) {
    if (checked) {
      setTitle((prev) => (prev.trim().startsWith('測試') ? prev : `測試${prev.trim()}`.slice(0, 20)))
    } else {
      setTitle((prev) => prev.trim().replace(/^測試\s*/, ''))
    }
  }

  const dirty =
    title.trim() !== '' ||
    note.trim() !== '' ||
    games.length > 0 ||
    otherPicked.length > 0 ||
    capacity.trim() !== ''

  function unfilledSteps(): string[] {
    const list: string[] = []
    if (!title.trim()) list.push('1 基本資料（場次名稱）')
    if (games.length === 0) list.push('2 指定遊戲')
    if (otherPicked.length === 0) list.push('3 參加者')
    if (linkAllowed && !linkOn) list.push('4 聚會連結')
    else if (linkOn && capacity.trim() === '') list.push('4 人數上限')
    return list
  }

  async function requestClose() {
    if (busy) return
    if (done || !dirty) {
      onClose()
      return
    }
    const missing = unfilledSteps()
    const ok = await askConfirm(
      `要放棄這次填寫嗎？${missing.length > 0 ? `還沒填的步驟：${missing.join('、')}。` : ''}關閉後已填的內容不會保留。`,
      { confirmText: '放棄', cancelText: '繼續填寫', danger: true },
    )
    if (ok) onClose()
  }

  useBackClose(() => void requestClose(), true)

  function scrollToFirstError(errors: { 1?: string; 2?: string; 4?: string }) {
    const target = errors[1] ? sec1Ref : errors[2] ? sec2Ref : sec4Ref
    target.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function submit() {
    setError('')
    setAttempted(true)
    if (Object.keys(stepErrors).length > 0) {
      scrollToFirstError(stepErrors)
      return
    }
    const capValue = capValueNow

    const parts: string[] = []
    if (otherPicked.length > 0) {
      parts.push(
        `將有 ${otherPicked.length} 位玩家加入出席名單，他們會自動成為 VIP 並計入集點。`,
      )
    }
    const skipped: string[] = []
    if (otherPicked.length === 0) skipped.push('參加者')
    if (linkAllowed && !linkOn) skipped.push('聚會連結')
    if (skipped.length > 0) parts.push(`這次沒有設定：${skipped.join('、')}。`)
    if (
      parts.length > 0 &&
      !(await askConfirm(`${parts.join('')}確定建立聚會嗎？`, {
        confirmText: '建立聚會',
        danger: false,
      }))
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
    let gamesSaved = false

    if (games.length > 0) {
      const result = await supabase
        .from('gathering_games')
        .insert(games.map((bggName) => ({ gathering_id: id, bgg_name: bggName })))
      if (result.error) warnings.push('指定遊戲沒有存成功：' + result.error.message)
      else gamesSaved = true
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
    // 資料庫已自動替管理者記一次已玩（聚會日到了才記）：讓畫面上的「已玩」打勾同步
    if (gamesSaved && date <= todayLocal()) announcePlayed(games)
    if (warnings.length === 0) onCreated(id)
    else setDone({ id, warnings })
  }

  return createPortal(
    <div className="ngw-backdrop" role="dialog" aria-label="新增聚會">
      <div className="ngw-panel">
        <div className="ngw-header">
          <h2>新增聚會</h2>
          <label className="ngw-testbox">
            <input
              type="checkbox"
              checked={isTest}
              onChange={(event) => toggleTest(event.target.checked)}
            />
            測試場
          </label>
          <button
            type="button"
            className="ngw-close"
            aria-label="關閉"
            onClick={() => void requestClose()}
          >
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
              <section className="ngw-sec" ref={sec1Ref}>
                <h3>1. 基本資料</h3>
                {attempted && stepErrors[1] && <p className="ngw-error">{stepErrors[1]}</p>}
                <label className="ngw-field">
                  <span>日期</span>
                  <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
                </label>
                <label className="ngw-field">
                  <span>場次名稱（必填，例如：早場、晚場）</span>
                  <input
                    type="text"
                    maxLength={20}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </label>
                {isTest && (
                  <p className="ngw-hint ngw-test-hint">
                    測試場：不增加任何人的已玩次數，也不會出現在遊戲詳細資料的「紀錄」。名稱需以「測試」開頭。測完請記得刪除這一場。
                  </p>
                )}
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

              <section className="ngw-sec" ref={sec2Ref}>
                <h3>2. 指定遊戲</h3>
                {attempted && stepErrors[2] && <p className="ngw-error">{stepErrors[2]}</p>}
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
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>

              <section className="ngw-sec">
                <h3>3. 參加者（可跳過）</h3>
                <p className="ngw-hint">
                  管理者預設已在名單上並免評分（可自行取消）。勾選的玩家會直接加入出席名單，並自動成為 VIP、計入集點。也可以只用聚會連結讓大家自己報到。
                </p>
                <button
                  type="button"
                  className="ngw-wantbtn"
                  aria-expanded={playersOpen}
                  onClick={() => setPlayersOpen((current) => !current)}
                  style={{ width: '100%', textAlign: 'left', padding: '8px 10px' }}
                >
                  已選 {picked.length} 人 {playersOpen ? '▴ 收合' : '▾ 展開選人'}
                </button>
                {picked.length > 0 && (
                  <p className="ngw-hint" style={{ margin: '6px 0 0' }}>
                    {picked
                      .map((id) => {
                        const found = allPlayers.find((player) => player.id === id)
                        const label = found?.nickname || '（未設暱稱）'
                        return id === adminId ? `${label}（管理者）` : label
                      })
                      .join('、')}
                  </p>
                )}
                {playersOpen && (
                  <input
                    type="search"
                    className="ngw-search"
                    placeholder="搜尋暱稱或 LINE／FB 名字"
                    value={playerSearch}
                    onChange={(event) => setPlayerSearch(event.target.value)}
                  />
                )}
                {playersOpen && (
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
                            <b>
                              {player.nickname || '（未設暱稱）'}
                              {player.id === adminId ? '（管理者）' : ''}
                            </b>
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
                )}
              </section>

              <section className="ngw-sec" ref={sec4Ref}>
                <h3>4. 聚會連結與人數上限</h3>
                {attempted && stepErrors[4] && <p className="ngw-error">{stepErrors[4]}</p>}
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
                    <span>人數上限（含出席名單上的人與管理者，1～500）</span>
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
                    連結可用名額＝人數上限 − 出席名單人數（含管理者）。建立後到「近期聚會」展開這一場就能複製連結。
                  </p>
                )}
              </section>

              {error && <p className="ngw-error">{error}</p>}
            </div>

            <div className="ngw-footer">
              <button
                type="button"
                className="ngw-cancel"
                disabled={busy}
                onClick={() => void requestClose()}
              >
                取消
              </button>
              <button type="button" className="ngw-primary" disabled={busy} onClick={() => void submit()}>
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
