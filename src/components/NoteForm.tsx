import { useMemo, useState } from 'react'
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

type ListedGame = BoardGame & { removedAt?: string | null }
export type NoteKind = 'public' | 'private'

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

// 統一表單：留言（公開）＝別人看得到；心得（私人）＝只有自己看得到。兩種都可以選填「關聯聚會」。
// 存放位置（沿用現有的表）：
//   公開、沒選聚會 → 遊戲留言（game_notes，新增一則）
//   公開、選聚會   → 該場聚會的公開欄（同人同場同款只有一則，會更新原留言）
//   私人、選聚會   → 該場聚會的私人欄
//   私人、沒選聚會 → 我的整體心得（每款一則）
export default function NoteForm({
  games,
  personal,
  ratings,
  isAdmin,
  canPublic,
  initialGame = null,
  initialKind = 'private',
  onSaved,
  onCancel,
}: {
  games: ListedGame[]
  personal: PersonalApi
  ratings: RatingsApi
  isAdmin: boolean
  canPublic: boolean
  initialGame?: ListedGame | null
  initialKind?: NoteKind
  onSaved: () => void
  onCancel?: () => void
}) {
  const allNotes = useAllMyNotes()
  const gatherings = useMyGatherings()
  const gatheringGames = useMyGatheringGames()

  const startGame = initialGame && !initialGame.removedAt ? initialGame : null
  const [pickSearch, setPickSearch] = useState('')
  const [picked, setPicked] = useState<ListedGame | null>(startGame)
  const [kind, setKind] = useState<NoteKind>(canPublic ? initialKind : 'private')
  const [gid, setGid] = useState('')
  const [pub, setPub] = useState('')
  const [priv, setPriv] = useState(() =>
    startGame ? (personal.getEntry(startGame.bggName).note ?? '') : '',
  )
  const [like, setLike] = useState('')
  const [dislike, setDislike] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const noteMap = useMemo(() => {
    const map = new Map<string, (typeof allNotes.rows)[number]>()
    for (const row of allNotes.rows) map.set(`${row.gatheringId}|${row.bggName}`, row)
    return map
  }, [allNotes.rows])

  // 可以寫的遊戲：管理者不限，其他人要已玩或評分過
  const matches = useMemo(() => {
    const query = normalize(pickSearch)
    if (!query) return []
    return games
      .filter(
        (game) =>
          !game.removedAt &&
          (isAdmin ||
            personal.getEntry(game.bggName).played ||
            ratings.getMine(game.bggName) !== null) &&
          (normalize(game.name).includes(query) || normalize(game.bggName).includes(query)),
      )
      .slice(0, 8)
  }, [games, pickSearch, isAdmin, personal, ratings])

  // 關聯聚會：我出席過、聚會日已到、當天指定遊戲包含這款
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

  const existing = picked && gid ? noteMap.get(`${gid}|${picked.bggName}`) : undefined
  const willUpdatePublic = kind === 'public' && gid !== '' && (existing?.publicNote ?? '').trim() !== ''
  const overallNote = kind === 'private' && gid === ''
  const maxLen = overallNote ? 500 : 200
  const text = kind === 'public' ? pub : priv

  function pickGame(game: ListedGame) {
    setPicked(game)
    setPickSearch('')
    setGid('')
    setPub('')
    setLike('')
    setDislike('')
    setPriv(personal.getEntry(game.bggName).note ?? '')
    setError('')
    setInfo('')
  }

  function changeGathering(next: string) {
    if (!picked) return
    setGid(next)
    setError('')
    setInfo('')
    if (next) {
      const note = noteMap.get(`${next}|${picked.bggName}`)
      setPub(note?.publicNote ?? '')
      setPriv(note?.privateNote ?? '')
      setLike(note?.likePoint ?? '')
      setDislike(note?.dislikePoint ?? '')
    } else {
      setPub('')
      setPriv(personal.getEntry(picked.bggName).note ?? '')
      setLike('')
      setDislike('')
    }
  }

  // 複製到另一個編輯框（還不會儲存）
  async function copyOver() {
    const fromPublic = kind === 'public'
    const source = fromPublic ? pub : priv
    if (source.trim() === '') return
    const targetHas = (fromPublic ? priv : pub).trim() !== ''
    const message = fromPublic
      ? '要把留言（公開）複製到心得（私人）嗎？複製後還不會儲存，可以先修改。'
      : '要把心得（私人）複製到留言（公開）嗎？複製後還不會儲存；儲存後 VIP 都看得到。'
    const warn = targetHas ? `\n${fromPublic ? '心得（私人）' : '留言（公開）'}欄目前有內容，會被覆蓋。` : ''
    if (!(await askConfirm(message + warn, { danger: false }))) return
    if (fromPublic) setPriv(source)
    else setPub(source.slice(0, 200))
    setKind(fromPublic ? 'private' : 'public')
    setError('')
    setInfo(`已複製到${fromPublic ? '心得（私人）' : '留言（公開）'}，檢查後按儲存。`)
  }

  async function save() {
    if (!picked) return
    setError('')
    setInfo('')
    if (text.trim() === '') {
      setError(kind === 'public' ? '請先輸入留言內容。' : '請先輸入心得內容。')
      return
    }
    setSaving(true)
    try {
      if (kind === 'public') {
        const firstPublic = gid === '' || (existing?.publicNote ?? '').trim() === ''
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
          setPub('')
          setLike('')
          setDislike('')
        }
        setInfo(willUpdatePublic ? '已更新這場的公開留言。' : '已發表。')
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
        personal.updateEntry(picked.bggName, { note: priv.trim() })
        setInfo('已儲存為這款的整體心得（可在「我的統計 → 紀錄與心得」看到）。')
      }
      allNotes.reload()
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="nf">
      {picked ? (
        <p className="nf-picked">
          <b>{picked.name}</b>
          <button
            type="button"
            className="nf-link"
            onClick={() => {
              setPicked(null)
              setGid('')
              setError('')
              setInfo('')
            }}
          >
            換一款
          </button>
        </p>
      ) : (
        <>
          <input
            type="search"
            className="nf-input"
            placeholder="輸入遊戲名稱（只能選你玩過或評分過的）"
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
            <p className="nf-hint">找不到符合的遊戲（要標記已玩或評分過才能寫）。</p>
          )}
        </>
      )}

      {canPublic && (
        <div className="nf-tabs" role="tablist" aria-label="留言或心得">
          <button
            type="button"
            role="tab"
            aria-selected={kind === 'public'}
            className={`nf-tab${kind === 'public' ? ' on' : ''}`}
            onClick={() => setKind('public')}
          >
            👥 留言（公開）
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={kind === 'private'}
            className={`nf-tab${kind === 'private' ? ' on' : ''}`}
            onClick={() => setKind('private')}
          >
            🔒 心得（私人）
          </button>
        </div>
      )}

      {picked && (
        <label className="nf-label">
          關聯聚會（選填）
          <select
            className="nf-select"
            value={gid}
            onChange={(event) => changeGathering(event.target.value)}
          >
            <option value="">不關聯聚會</option>
            {gatheringOptions.map((row) => (
              <option key={row.id} value={row.id}>
                {row.gatheredOn.replaceAll('-', '/')}　{row.title}
              </option>
            ))}
          </select>
        </label>
      )}
      {picked && gatheringOptions.length === 0 && !gatherings.loading && (
        <p className="nf-hint">沒有你出席過、而且指定了這款的聚會。</p>
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
            ? '只有你看得到。沒有關聯聚會時，會存成這款遊戲的「整體心得」（每款一則，再寫會取代）。'
            : '只有你看得到，管理者在網站上也看不到。'}
        </p>
      )}

      {error && <p className="nf-error">{error}</p>}
      {info && <p className="nf-info">{info}</p>}

      <div className="nf-actions">
        <span className="nf-count">
          {text.length} / {maxLen}
        </span>
        <div className="nf-btns">
          {canPublic && (
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
            className="nf-save"
            disabled={saving || !picked || text.trim() === ''}
            onClick={() => void save()}
          >
            {saving ? '儲存中…' : '儲存'}
          </button>
        </div>
      </div>
    </div>
  )
}
