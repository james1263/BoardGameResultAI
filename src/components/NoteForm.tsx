import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { BoardGame } from '../data/boardGames.generated'
import type { PersonalApi } from '../lib/personalApi'
import type { RatingsApi } from '../lib/useGameRatings'
import { supabase } from '../lib/supabase'
import { todayLocal } from '../lib/useGamePlaySessions'
import { saveGatheringNote, useAllMyNotes } from '../lib/useGatheringNotes'
import { useMyGatherings } from '../lib/useMyGatherings'
import { useMyGatheringGames } from '../lib/useMyGatheringGames'
import { askConfirm } from '../lib/askConfirm'
import { confirmPublicPost } from '../lib/publicNoteNotice'
import NotePointsFields from './NotePointsFields'
import PublicNoteHint from './PublicNoteHint'
import '../styles/note-form.css'
import '../styles/note-form-b2.css'

type ListedGame = BoardGame & { removedAt?: string | null }
export type NoteKind = 'public' | 'private'

// 我自己的遊戲公開留言（沒標場次的那種）；從發表紀錄點進來時，用 id 找出要修改的那一則
export type MyGameNote = {
  id: string
  bgg_name: string
  content: string | null
  created_at: string
  like_point: string | null
  dislike_point: string | null
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '')
}

function explainAdd(message: string): string {
  if (message.includes('not played')) return '請先標記已玩或評分這款，才能留言。'
  if (message.includes('too long')) return '留言最多 200 字，喜歡／不喜歡的點各最多 100 字。'
  if (message.includes('too many')) return '這款你最多只能留 10 則，請先刪除舊的。'
  if (message.includes('empty')) return '請先輸入留言內容。'
  if (message.includes('not vip')) return '只有 VIP 可以留言。'
  return '儲存失敗：' + message
}

// 統一表單：留言（公開）＝別人看得到；心得（私人）＝只有自己看得到。
// 「這是哪一場？」場次標籤（選填，單選）。存放位置（沿用現有的表）：
//   公開、沒選場次 → 遊戲留言（game_notes，每次新增一則，每款最多 10 則）
//   公開、選場次   → 該場聚會的公開欄（同人同場同款只有一則，會更新原留言）
//   私人、選場次   → 該場聚會的私人欄
//   私人、沒選場次 → 我的整體心得（每款一則，再存會取代）
// 文字框預設是空的；只有「選了場次且那場已有紀錄」或「從發表紀錄點進來」才會載入舊內容。
// 可以先寫字、再選遊戲；要選好遊戲才能儲存。
// 沒玩過、沒評分過的遊戲：只能寫私人心得，公開留言上鎖（管理者不受限）。
export default function NoteForm({
  games,
  personal,
  ratings,
  isAdmin,
  canPublic,
  initialGame = null,
  initialGatheringId = null,
  initialKind = 'private',
  initialNoteId = null,
  initialOverall = false,
  myGameNotes,
  renderCover,
  onSaved,
  onCancel,
}: {
  games: ListedGame[]
  personal: PersonalApi
  ratings: RatingsApi
  isAdmin: boolean
  canPublic: boolean
  initialGame?: ListedGame | null
  // 從「我的場次」進來：上方列出這場玩過的遊戲封面，點封面代入遊戲，場次標籤自動選好
  initialGatheringId?: string | null
  initialKind?: NoteKind
  // 從發表紀錄點進來：指定要編輯哪一則一般留言／這款的整體心得
  initialNoteId?: string | null
  initialOverall?: boolean
  myGameNotes?: { loading: boolean; rows: MyGameNote[] }
  renderCover?: (game: BoardGame) => ReactNode
  onSaved: () => void
  onCancel?: () => void
}) {
  const allNotes = useAllMyNotes()
  const gatherings = useMyGatherings()
  const gatheringGames = useMyGatheringGames()
  const lockedGid = initialGatheringId

  const startGame = initialGame && !initialGame.removedAt ? initialGame : null
  const [pickSearch, setPickSearch] = useState('')
  const [picked, setPicked] = useState<ListedGame | null>(startGame)
  const [kindState, setKindState] = useState<NoteKind>(canPublic ? initialKind : 'private')
  const [gid, setGid] = useState(startGame && lockedGid ? lockedGid : '')
  const [pub, setPub] = useState('')
  const [priv, setPriv] = useState(() =>
    startGame && !lockedGid && initialOverall ? (personal.getEntry(startGame.bggName).note ?? '') : '',
  )
  const [like, setLike] = useState('')
  const [dislike, setDislike] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const hydrated = useRef(false)
  // 正在修改的那則一般公開留言（從發表紀錄點進來才有）
  const [editingId, setEditingId] = useState<string | null>(null)
  const noteLoaded = useRef(false)
  // 正在修改這款的整體心得（從發表紀錄點進來，或剛存過）
  const [editOverall, setEditOverall] = useState(
    () =>
      !!startGame &&
      !lockedGid &&
      initialOverall &&
      (personal.getEntry(startGame.bggName).note ?? '').trim() !== '',
  )
  // 目前文字框的內容是不是從舊紀錄載入的（換場次時才知道要不要清掉）
  const textLoaded = useRef(!!startGame && !lockedGid && initialOverall)
  const gameNoteRows = myGameNotes?.rows

  const noteMap = useMemo(() => {
    const map = new Map<string, (typeof allNotes.rows)[number]>()
    for (const row of allNotes.rows) map.set(`${row.gatheringId}|${row.bggName}`, row)
    return map
  }, [allNotes.rows])

  // 沒玩過、沒評分過的遊戲不能公開留言（管理者例外）
  const isPlayed = picked
    ? personal.getEntry(picked.bggName).played || ratings.getMine(picked.bggName) !== null
    : true
  const publicLocked = canPublic && !!picked && !isAdmin && !isPlayed
  const kind: NoteKind = publicLocked || !canPublic ? 'private' : kindState

  // 一開始就帶著場次進來：等心得讀好再把那場的內容填進去（只做一次）
  useEffect(() => {
    if (hydrated.current) return
    if (!picked || !gid || allNotes.loading) return
    hydrated.current = true
    textLoaded.current = true
    const note = noteMap.get(`${gid}|${picked.bggName}`)
    setPub(note?.publicNote ?? '')
    setPriv(note?.privateNote ?? '')
    setLike(note?.likePoint ?? '')
    setDislike(note?.dislikePoint ?? '')
  }, [picked, gid, allNotes.loading, noteMap])

  // 可以選的遊戲：所有遊戲（沒玩過的只能寫私人心得）
  const matches = useMemo(() => {
    const query = normalize(pickSearch)
    if (!query) return []
    return games
      .filter(
        (game) =>
          !game.removedAt &&
          (normalize(game.name).includes(query) || normalize(game.bggName).includes(query)),
      )
      .slice(0, 8)
  }, [games, pickSearch])

  // 場次標籤：我出席過、聚會日已到、當天指定遊戲包含這款
  const gatheringOptions = useMemo(() => {
    if (!picked) return []
    const today = todayLocal()
    return gatherings.rows
      .filter(
        (row) =>
          row.gatheredOn <= today &&
          (gatheringGames.games.get(row.id) ?? []).includes(picked.bggName),
      )
      .sort((a, b) => b.gatheredOn.localeCompare(a.gatheredOn))
  }, [picked, gatherings.rows, gatheringGames.games])

  // 從我的場次進來時，上方的遊戲封面
  const contextGathering = lockedGid ? (gatherings.rows.find((row) => row.id === lockedGid) ?? null) : null
  const contextGames = useMemo(() => {
    if (!lockedGid) return []
    const names = gatheringGames.games.get(lockedGid) ?? []
    return names
      .map((name) => games.find((game) => game.bggName === name))
      .filter((game): game is ListedGame => !!game)
  }, [lockedGid, gatheringGames.games, games])

  const existing = picked && gid ? noteMap.get(`${gid}|${picked.bggName}`) : undefined
  const willUpdatePublic = kind === 'public' && gid !== '' && (existing?.publicNote ?? '').trim() !== ''
  const overallNote = kind === 'private' && gid === ''
  const maxLen = overallNote ? 500 : 200
  const text = kind === 'public' ? pub : priv

  // 從發表紀錄點進來的一般公開留言：等留言清單讀好，把那一則的內容放進文字框（只做一次）
  useEffect(() => {
    if (noteLoaded.current || !initialNoteId || !picked) return
    const row = (gameNoteRows ?? []).find((item) => item.id === initialNoteId)
    if (!row) return
    noteLoaded.current = true
    textLoaded.current = true
    setEditingId(row.id)
    setPub(row.content ?? '')
    setLike(row.like_point ?? '')
    setDislike(row.dislike_point ?? '')
  }, [initialNoteId, picked, gameNoteRows])

  // 目前這個欄位有沒有「已存在、正在修改」的內容（有的話，清空後按鈕會變成「刪除」）
  const hasExisting =
    !!picked &&
    (kind === 'public'
      ? gid !== ''
        ? (existing?.publicNote ?? '').trim() !== ''
        : editingId !== null
      : gid !== ''
        ? (existing?.privateNote ?? '').trim() !== ''
        : editOverall)
  const deleting = text.trim() === '' && hasExisting

  // 換場次或換遊戲時：那場已有紀錄就載入；沒有紀錄就保留已經打的字（只清掉從舊紀錄載入的）
  function loadFor(game: ListedGame, target: string) {
    setEditingId(null)
    setEditOverall(false)
    const note = target ? noteMap.get(`${target}|${game.bggName}`) : undefined
    if (note) {
      textLoaded.current = true
      setPub(note.publicNote)
      setPriv(note.privateNote)
      setLike(note.likePoint)
      setDislike(note.dislikePoint)
    } else if (textLoaded.current) {
      textLoaded.current = false
      setPub('')
      setPriv('')
      setLike('')
      setDislike('')
    }
  }

  function pickGame(game: ListedGame) {
    hydrated.current = true
    const target =
      lockedGid && (gatheringGames.games.get(lockedGid) ?? []).includes(game.bggName) ? lockedGid : ''
    setPicked(game)
    setPickSearch('')
    setGid(target)
    loadFor(game, target)
    setError('')
    setInfo('')
  }

  function changeGathering(next: string) {
    if (!picked) return
    hydrated.current = true
    setGid(next)
    setError('')
    setInfo('')
    loadFor(picked, next)
  }

  // 複製到另一個編輯框（還不會儲存）
  async function copyOver() {
    const fromPublic = kind === 'public'
    const source = fromPublic ? pub : priv
    if (source.trim() === '') return
    if (!fromPublic && publicLocked) return
    const targetHas = (fromPublic ? priv : pub).trim() !== ''
    const message = fromPublic
      ? '要把留言（公開）複製到心得（私人）嗎？複製後還不會儲存，可以先修改。'
      : '要把心得（私人）複製到留言（公開）嗎？複製後還不會儲存；儲存後 VIP 都看得到。'
    const warn = targetHas ? `\n${fromPublic ? '心得（私人）' : '留言（公開）'}欄目前有內容，會被覆蓋。` : ''
    if (!(await askConfirm(message + warn, { danger: false }))) return
    if (fromPublic) setPriv(source)
    else setPub(source.slice(0, 200))
    setKindState(fromPublic ? 'private' : 'public')
    setError('')
    setInfo(`已複製到${fromPublic ? '心得（私人）' : '留言（公開）'}，檢查後按儲存。`)
  }

  // 內容清空後按「刪除」：只刪目前這個欄位（留言或心得）
  async function remove() {
    if (!picked || !hasExisting) return
    const label = kind === 'public' ? '留言' : '心得'
    if (!(await askConfirm(`要刪除這則${label}嗎？刪除後無法復原。`))) return
    setSaving(true)
    setError('')
    setInfo('')
    try {
      if (kind === 'public') {
        if (gid) {
          const result = await saveGatheringNote(gid, picked.bggName, existing?.privateNote ?? '', '', '', '')
          if (!result.ok) {
            setError(result.message)
            return
          }
        } else if (editingId) {
          const { error: rpcError } = await supabase.rpc('delete_my_public_note', {
            p_note: editingId,
          })
          if (rpcError) {
            setError('刪除失敗：' + rpcError.message)
            return
          }
          setEditingId(null)
        }
        setPub('')
        setLike('')
        setDislike('')
      } else if (gid) {
        const result = await saveGatheringNote(
          gid,
          picked.bggName,
          '',
          existing?.publicNote ?? '',
          existing?.likePoint ?? '',
          existing?.dislikePoint ?? '',
        )
        if (!result.ok) {
          setError(result.message)
          return
        }
        setPriv('')
      } else {
        if (!personal.canEdit) {
          setError('目前無法刪除，請稍後再試。')
          return
        }
        personal.updateEntry(picked.bggName, { note: '' })
        setPriv('')
        setEditOverall(false)
      }
      setInfo(`已刪除這則${label}。`)
      allNotes.reload()
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  async function save() {
    setError('')
    setInfo('')
    if (!picked) {
      setError('請先選擇遊戲，才能儲存。')
      return
    }
    if (text.trim() === '') {
      if (hasExisting) {
        await remove()
        return
      }
      setError(kind === 'public' ? '請先輸入留言內容。' : '請先輸入心得內容。')
      return
    }
    setSaving(true)
    try {
      if (kind === 'public') {
        const firstPublic = gid === '' ? editingId === null : (existing?.publicNote ?? '').trim() === ''
        if (firstPublic && !(await confirmPublicPost())) return
        if (gid) {
          const result = await saveGatheringNote(
            gid,
            picked.bggName,
            existing?.privateNote ?? '',
            pub,
            like,
            dislike,
          )
          if (!result.ok) {
            setError(result.message)
            return
          }
        } else if (editingId) {
          const { error: rpcError } = await supabase.rpc('update_my_game_note', {
            p_note: editingId,
            p_content: pub,
            p_like: like,
            p_dislike: dislike,
          })
          if (rpcError) {
            setError(explainAdd(rpcError.message))
            return
          }
        } else {
          const { error: rpcError } = await supabase.rpc('add_game_note', {
            p_bgg_name: picked.bggName,
            p_content: pub,
            p_like: like,
            p_dislike: dislike,
          })
          if (rpcError) {
            setError(explainAdd(rpcError.message))
            return
          }
          // 發表完清空文字框，下一次儲存會再新增一則（每款最多 10 則）
          setPub('')
          setLike('')
          setDislike('')
        }
        setInfo(
          gid
            ? willUpdatePublic
              ? '已更新這場的公開留言。'
              : '已發表。'
            : editingId
              ? '已更新這則公開留言。'
              : '已發表。',
        )
      } else if (gid) {
        const result = await saveGatheringNote(
          gid,
          picked.bggName,
          priv,
          existing?.publicNote ?? '',
          existing?.likePoint ?? '',
          existing?.dislikePoint ?? '',
        )
        if (!result.ok) {
          setError(result.message)
          return
        }
        setInfo('已儲存這場的私人心得。')
      } else {
        if (!personal.canEdit) {
          setError('目前無法儲存，請稍後再試。')
          return
        }
        if (!editOverall && (personal.getEntry(picked.bggName).note ?? '').trim() !== '') {
          if (
            !(await askConfirm('這款已經有整體心得（每款一則），儲存後會取代原本的內容。要繼續嗎？', {
              danger: false,
            }))
          )
            return
        }
        personal.updateEntry(picked.bggName, { note: priv.trim() })
        setEditOverall(true)
        setInfo('已儲存為這款的整體心得。')
      }
      allNotes.reload()
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="nf">
      {lockedGid && (
        <div className="nf-ctx">
          <p className="nf-taglabel">
            {contextGathering
              ? `${contextGathering.gatheredOn.replaceAll('-', '/')}　${contextGathering.title}`
              : '這場聚會'}
            ・點一款遊戲來寫
          </p>
          {contextGames.length === 0 ? (
            <p className="nf-hint">{gatheringGames.loading ? '讀取中…' : '這場沒有指定遊戲。'}</p>
          ) : (
            <div className="nf-covers">
              {contextGames.map((game) => (
                <button
                  type="button"
                  key={game.bggName}
                  className={`nf-cover${picked?.bggName === game.bggName ? ' on' : ''}`}
                  onClick={() => pickGame(game)}
                >
                  <span className="nf-cover-img">{renderCover ? renderCover(game) : '🎲'}</span>
                  <span className="nf-cover-name">{game.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {picked ? (
        <p className="nf-picked">
          <b>{picked.name}</b>
          {!lockedGid && (
            <button
              type="button"
              className="nf-link"
              onClick={() => {
                setPicked(null)
                setEditingId(null)
                setEditOverall(false)
                setGid('')
                setError('')
                setInfo('')
              }}
            >
              換一款
            </button>
          )}
        </p>
      ) : (
        !lockedGid && (
          <>
            <input
              type="search"
              className="nf-input"
              placeholder="輸入遊戲名稱（中文或英文）"
              value={pickSearch}
              onChange={(event) => setPickSearch(event.target.value)}
            />
            {matches.length > 0 && (
              <ul className="nf-list">
                {matches.map((game) => (
                  <li key={game.bggName}>
                    <button type="button" onClick={() => pickGame(game)}>
                      {game.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {pickSearch.trim() !== '' && matches.length === 0 && (
              <p className="nf-hint">找不到符合的遊戲。</p>
            )}
          </>
        )
      )}

      {canPublic && (
        <div className="nf-tabs" role="tablist" aria-label="留言或心得">
          <button
            type="button"
            role="tab"
            aria-selected={kind === 'public'}
            disabled={publicLocked}
            className={`nf-tab${kind === 'public' ? ' on' : ''}${publicLocked ? ' locked' : ''}`}
            onClick={() => setKindState('public')}
          >
            {publicLocked ? '🔒' : '👥'} 留言（公開）
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={kind === 'private'}
            className={`nf-tab${kind === 'private' ? ' on' : ''}`}
            onClick={() => setKindState('private')}
          >
            📝 心得（私人）
          </button>
        </div>
      )}
      {publicLocked && (
        <p className="nf-hint">標記已玩或評分過這款，才能發公開留言；現在只能寫私人心得。</p>
      )}

      {picked && gatheringOptions.length > 0 && (
        <div className="nf-tagbox">
          <p className="nf-taglabel">
            這是哪一場？（選填；不選就是一般{kind === 'public' ? '留言' : '整體心得'}）
          </p>
          <div className="nf-chips">
            {gatheringOptions.map((row) => (
              <button
                type="button"
                key={row.id}
                aria-pressed={gid === row.id}
                className={`nf-chip${gid === row.id ? ' on' : ''}`}
                onClick={() => changeGathering(gid === row.id ? '' : row.id)}
              >
                🏷 {row.gatheredOn.replaceAll('-', '/')}　{row.title}
              </button>
            ))}
          </div>
        </div>
      )}
      {picked && gatheringOptions.length === 0 && !gatherings.loading && !lockedGid && (
        <p className="nf-hint">這款沒有你出席過、而且指定了它的聚會，所以沒有場次標籤可選。</p>
      )}

      {willUpdatePublic && (
        <p className="nf-warn">這場聚會你已經有這款的公開留言，儲存後將更新原留言。</p>
      )}

      <textarea
        className="nf-textarea"
        rows={kind === 'public' ? 3 : 4}
        maxLength={maxLen}
        aria-label={kind === 'public' ? '留言（公開）' : '心得（私人）'}
        placeholder={
          kind === 'public'
            ? '想跟大家說什麼？（公開給 VIP，最多 200 字）'
            : overallNote
              ? '這款遊戲的整體心得（只有你看得到，最多 500 字）'
              : '這場的心得（只有你看得到，最多 200 字）'
        }
        value={text}
        disabled={saving}
        onChange={(event) =>
          kind === 'public' ? setPub(event.target.value) : setPriv(event.target.value)
        }
      />

      {kind === 'public' ? (
        <>
          <PublicNoteHint />
          {gid === '' && editingId === null && (
            <p className="nf-hint">每款遊戲最多可以發表 10 則公開留言；要修改舊的，請到「發表紀錄」點那一則。</p>
          )}
          <NotePointsFields
            key={`${picked?.bggName ?? ''}:${gid}`}
            like={like}
            dislike={dislike}
            onLike={setLike}
            onDislike={setDislike}
          />
        </>
      ) : (
        <p className="nf-hint">
          {overallNote
            ? '只有你看得到。沒有選場次時，會存成這款遊戲的「整體心得」（每款一則，再存會取代原本的）。要修改舊的，請到「發表紀錄」點那一則。'
            : '只有你看得到，管理者在網站上也看不到。'}
        </p>
      )}

      {!picked && !lockedGid && text.trim() !== '' && (
        <p className="nf-hint">已經先寫了也沒關係，記得在上面選好遊戲再按儲存。</p>
      )}
      {error && <p className="nf-error">{error}</p>}
      {info && <p className="nf-info">{info}</p>}

      <div className="nf-actions">
        <span className="nf-count">
          {text.length} / {maxLen}
        </span>
        <div className="nf-btns">
          {canPublic && !publicLocked && (
            <button
              type="button"
              className="nf-copy"
              disabled={saving || text.trim() === ''}
              onClick={() => void copyOver()}
            >
              {kind === 'public' ? '⇅ 複製到心得' : '⇅ 複製到留言'}
            </button>
          )}
          {onCancel && (
            <button type="button" className="nf-cancel" disabled={saving} onClick={onCancel}>
              收起
            </button>
          )}
          <button
            type="button"
            className={`nf-save${deleting ? ' danger' : ''}`}
            disabled={saving || (text.trim() === '' && !hasExisting)}
            onClick={() => void save()}
          >
            {saving ? (deleting ? '刪除中…' : '儲存中…') : deleting ? '刪除' : '儲存'}
          </button>
        </div>
      </div>
    </div>
  )
}
