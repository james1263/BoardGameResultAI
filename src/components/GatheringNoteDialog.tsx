import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import type { BoardGame } from '../data/boardGames.generated'
import type { PersonalApi } from '../lib/personalApi'
import type { PlaySessionsApi } from '../lib/useGamePlaySessions'
import { useBackClose } from '../lib/useBackClose'
import { saveGatheringNote, type MyNote } from '../lib/useGatheringNotes'

const MAX = 200

export type NoteGame = {
  bggName: string
  name: string
  game: BoardGame | null
}

type Draft = { priv: string; pub: string; play: boolean }
type Base = { priv: string; pub: string; hidden: boolean }
type Pane = 'private' | 'public'

export default function GatheringNoteDialog({
  gatheringId,
  gatheringTitle,
  gatheredOn,
  attendeeCount,
  games,
  initialBggName,
  getNote,
  personal,
  playSessions,
  renderCover,
  onChanged,
  onClose,
}: {
  gatheringId: string
  gatheringTitle: string
  gatheredOn: string
  attendeeCount: number
  games: NoteGame[]
  initialBggName: string
  getNote: (bggName: string) => MyNote | null
  personal: PersonalApi
  playSessions: PlaySessionsApi
  renderCover: (game: BoardGame) => ReactNode
  onChanged: () => void
  onClose: () => void
}) {
  const [current, setCurrent] = useState(initialBggName)
  const [pane, setPane] = useState<Pane>('private')
  // 還沒儲存的文字（切換遊戲或分頁都不會丟）
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  // 這次開啟期間已儲存的內容（比重新讀取更即時）
  const [bases, setBases] = useState<Record<string, Base>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [leaving, setLeaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const baseOf = useCallback(
    (bggName: string): Base => {
      const override = bases[bggName]
      if (override) return override
      const note = getNote(bggName)
      const pub = note?.publicNote ?? ''
      return {
        priv: note?.privateNote ?? '',
        pub,
        hidden: note?.publicStatus === 'hidden' && pub !== '',
      }
    },
    [bases, getNote],
  )

  function draftOf(bggName: string): Draft {
    const existing = drafts[bggName]
    if (existing) return existing
    const base = baseOf(bggName)
    return { priv: base.priv, pub: base.pub, play: false }
  }

  function hasSession(bggName: string): boolean {
    return playSessions
      .getSessions(bggName)
      .some((item) => item.playedOn === gatheredOn)
  }

  function isDirty(bggName: string): boolean {
    const draft = draftOf(bggName)
    const base = baseOf(bggName)
    return (
      draft.priv !== base.priv ||
      draft.pub !== base.pub ||
      (draft.play && !hasSession(bggName))
    )
  }

  function patchDraft(bggName: string, patch: Partial<Draft>) {
    const base = draftOf(bggName)
    setDrafts((cur) => ({ ...cur, [bggName]: { ...base, ...patch } }))
    setInfo('')
  }

  const cur = games.find((g) => g.bggName === current) ?? games[0]
  const draft = draftOf(cur.bggName)
  const base = baseOf(cur.bggName)
  const dirtyNames = games.filter((g) => isDirty(g.bggName)).map((g) => g.bggName)
  const recorded = hasSession(cur.bggName)
  const canRecordPlay =
    personal.canEdit && playSessions.status === 'ready' && !playSessions.busy
  const privHas = draft.priv.trim() !== ''
  const pubHas = draft.pub.trim() !== ''
  const canCopy = privHas !== pubHas
  const hasSaved = base.priv !== '' || base.pub !== ''
  const dateText = gatheredOn.replaceAll('-', '/')

  // 儲存一款（心得＋勾選的遊玩紀錄）；成功回 true
  async function saveOne(bggName: string): Promise<boolean> {
    const d = draftOf(bggName)
    const b = baseOf(bggName)
    const noteChanged = d.priv !== b.priv || d.pub !== b.pub

    if (noteChanged) {
      const bothEmpty = d.priv.trim() === '' && d.pub.trim() === ''
      if (
        bothEmpty &&
        (b.priv !== '' || b.pub !== '') &&
        !window.confirm('兩欄都是空的，儲存會刪除這款在這場的心得，確定嗎？')
      ) {
        return false
      }
      const result = await saveGatheringNote(gatheringId, bggName, d.priv, d.pub)
      if (!result.ok) {
        setError(result.message)
        return false
      }
      setBases((c) => ({
        ...c,
        [bggName]: {
          priv: d.priv,
          pub: d.pub,
          hidden: b.hidden && d.pub.trim() !== '',
        },
      }))
      onChanged()
    }

    // 已有同一天、同一款的紀錄就沿用，不新增也不覆寫
    if (d.play && !hasSession(bggName)) {
      const ok = await playSessions.addSession(bggName, {
        playedOn: gatheredOn,
        playerCount: null,
        note: '',
      })
      if (!ok) {
        setError(
          noteChanged
            ? '心得已儲存，但新增遊玩紀錄失敗，請稍後再試。'
            : '新增遊玩紀錄失敗，請稍後再試。',
        )
        setDrafts((c) => ({
          ...c,
          [bggName]: { priv: d.priv, pub: d.pub, play: true },
        }))
        return false
      }
      // 有紀錄就一定玩過；略過「次數 0 時設為 1」的規則，避免總次數多算
      if (!personal.getEntry(bggName).played) {
        personal.updateEntry(bggName, { played: true }, { skipPlayedRule: true })
      }
    }

    setDrafts((c) => ({
      ...c,
      [bggName]: { priv: d.priv, pub: d.pub, play: false },
    }))
    return true
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setInfo('')
    const ok = await saveOne(cur.bggName)
    setSaving(false)
    if (ok) setInfo('已儲存。')
  }

  async function handleSaveAndLeave() {
    setSaving(true)
    setError('')
    for (const name of dirtyNames) {
      const ok = await saveOne(name)
      if (!ok) {
        setSaving(false)
        setLeaving(false)
        setCurrent(name)
        return
      }
    }
    setSaving(false)
    onClose()
  }

  async function handleDelete(kind: 'priv' | 'pub' | 'all') {
    const label =
      kind === 'priv'
        ? '私人留言'
        : kind === 'pub'
          ? '公開留言'
          : '這款在這場的心得（私人與公開）'
    if (!window.confirm(`確定要刪除${label}嗎？刪除後無法復原。`)) return

    const nextPriv = kind === 'pub' ? base.priv : ''
    const nextPub = kind === 'priv' ? base.pub : ''
    setSaving(true)
    setError('')
    setInfo('')
    const result = await saveGatheringNote(
      gatheringId,
      cur.bggName,
      nextPriv,
      nextPub,
    )
    setSaving(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setBases((c) => ({
      ...c,
      [cur.bggName]: {
        priv: nextPriv,
        pub: nextPub,
        hidden: base.hidden && nextPub !== '',
      },
    }))
    setDrafts((c) => ({
      ...c,
      [cur.bggName]: {
        priv: kind === 'pub' ? draft.priv : '',
        pub: kind === 'priv' ? draft.pub : '',
        play: draft.play,
      },
    }))
    setDeleting(false)
    setInfo('已刪除。')
    onChanged()
  }

  function requestClose() {
    if (saving) return
    if (dirtyNames.length > 0) {
      setLeaving(true)
      return
    }
    onClose()
  }

  // 手機返回鍵也走同一個流程；用 ref 確保拿到最新的狀態
  const closeRef = useRef(requestClose)
  useEffect(() => {
    closeRef.current = requestClose
  })
  const stableClose = useCallback(() => closeRef.current(), [])
  useBackClose(stableClose, true)

  function switchGame(bggName: string) {
    setCurrent(bggName)
    setError('')
    setInfo('')
    setDeleting(false)
  }

  function handleCopy() {
    if (privHas && !pubHas) patchDraft(cur.bggName, { pub: draft.priv })
    else if (pubHas && !privHas) patchDraft(cur.bggName, { priv: draft.pub })
  }

  const text = pane === 'private' ? draft.priv : draft.pub

  return createPortal(
    <div className="gn2-backdrop">
      <div className="gn2-dialog" role="dialog" aria-label="本場遊戲心得">
        <div className="gn2-head">
          <div className="gn2-head-text">
            <h2>本場遊戲心得</h2>
            <p className="gn2-meta">
              {gatheringTitle}・{dateText}・{attendeeCount} 人出席
            </p>
          </div>
          <button
            type="button"
            className="gn2-close"
            aria-label="關閉"
            onClick={requestClose}
          >
            ×
          </button>
        </div>

        <div className="gn2-body">
          <div className="gn2-game">
            <div className="gn2-cover">
              {cur.game ? renderCover(cur.game) : <span aria-hidden="true">🎲</span>}
            </div>
            <b>{cur.name}</b>
          </div>

          {games.length > 1 && (
            <div className="gn2-strip" aria-label="切換遊戲">
              {games.map((g) => (
                <button
                  key={g.bggName}
                  type="button"
                  className={`gn2-thumb${g.bggName === cur.bggName ? ' active' : ''}`}
                  title={g.name}
                  aria-label={g.name}
                  aria-pressed={g.bggName === cur.bggName}
                  onClick={() => switchGame(g.bggName)}
                >
                  {g.game ? renderCover(g.game) : <span aria-hidden="true">🎲</span>}
                  {isDirty(g.bggName) && <span className="gn2-dot" aria-hidden="true" />}
                </button>
              ))}
            </div>
          )}

          <div className="gn2-panes" role="tablist" aria-label="私人或公開">
            <button
              type="button"
              role="tab"
              aria-selected={pane === 'private'}
              className={`gn2-pane${pane === 'private' ? ' active' : ''}`}
              onClick={() => setPane('private')}
            >
              🔒 私人
              {privHas && <span className="gn2-pane-dot" aria-label="有內容" />}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={pane === 'public'}
              className={`gn2-pane${pane === 'public' ? ' active' : ''}`}
              onClick={() => setPane('public')}
            >
              👥 公開
              {pubHas && <span className="gn2-pane-dot" aria-label="有內容" />}
            </button>
          </div>

          <textarea
            className="gn2-textarea"
            aria-label={pane === 'private' ? '私人留言' : '公開留言'}
            maxLength={MAX}
            rows={4}
            disabled={saving}
            placeholder={
              pane === 'private'
                ? '記錄這場的策略、玩家表現或下次想調整的地方……'
                : '分享給其他玩家的心得……'
            }
            value={text}
            onChange={(event) =>
              patchDraft(
                cur.bggName,
                pane === 'private'
                  ? { priv: event.target.value }
                  : { pub: event.target.value },
              )
            }
          />
          <p className="gn2-count">
            {text.length} / {MAX} 字
          </p>
          <p className="gn2-hint">
            {pane === 'private'
              ? '只有你與有權限的管理者能看到。'
              : 'VIP 可以閱讀；依你的暱稱設定顯示名稱。清空公開欄再儲存，就會撤回公開留言（私人留言會保留）。公開留言的閱讀頁面還在準備中。'}
          </p>

          <button
            type="button"
            className="gn2-copy"
            disabled={!canCopy || saving}
            onClick={handleCopy}
          >
            {pubHas && !privHas
              ? '⇅ 複製到私人欄'
              : privHas && !pubHas
                ? '⇅ 複製到公開欄'
                : '⇅ 複製到另一欄'}
          </button>
          {privHas && pubHas && (
            <p className="gn2-hint">兩欄都有內容，請手動編輯。</p>
          )}

          {base.hidden && pane === 'public' && (
            <p className="gn2-warn">
              你的公開留言已被管理者隱藏，其他人看不到。修改內容不會自動恢復公開；清空公開欄並儲存可以撤回。
            </p>
          )}

          {recorded ? (
            <p className="gn2-played">✓ 這場已記錄遊玩（已算進你的遊玩次數）</p>
          ) : (
            <label className="gn2-check">
              <input
                type="checkbox"
                checked={draft.play}
                disabled={!canRecordPlay || saving}
                onChange={(event) =>
                  patchDraft(cur.bggName, { play: event.target.checked })
                }
              />
              <span>
                同時記一次遊玩（算進我的已玩次數）
                <small>日期＝這場聚會，玩家人數不填。</small>
              </span>
            </label>
          )}

          {hasSaved && (
            <div className="gn2-delete">
              <button
                type="button"
                className="gn2-del"
                disabled={saving}
                onClick={() => setDeleting((v) => !v)}
              >
                刪除…
              </button>
              {deleting && (
                <div className="gn2-delpanel">
                  {base.priv !== '' && base.pub !== '' ? (
                    <>
                      <button type="button" onClick={() => void handleDelete('priv')}>
                        只刪私人留言
                      </button>
                      <button type="button" onClick={() => void handleDelete('pub')}>
                        只刪公開留言
                      </button>
                      <button type="button" onClick={() => void handleDelete('all')}>
                        全部刪除
                      </button>
                    </>
                  ) : base.priv !== '' ? (
                    <button type="button" onClick={() => void handleDelete('priv')}>
                      刪除私人留言
                    </button>
                  ) : (
                    <button type="button" onClick={() => void handleDelete('pub')}>
                      刪除公開留言
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {error && <p className="gn2-error">{error}</p>}
          {info && <p className="gn2-info">{info}</p>}
        </div>

        <div className="gn2-foot">
          {leaving ? (
            <>
              <p className="gn2-leave-text">
                有 {dirtyNames.length} 款遊戲的內容還沒儲存。
              </p>
              <div className="gn2-leave-btns">
                <button
                  type="button"
                  className="gn2-save"
                  disabled={saving}
                  onClick={() => void handleSaveAndLeave()}
                >
                  {saving ? '儲存中…' : '儲存後離開'}
                </button>
                <button
                  type="button"
                  className="gn2-ghost"
                  disabled={saving}
                  onClick={onClose}
                >
                  捨棄變更
                </button>
                <button
                  type="button"
                  className="gn2-ghost"
                  disabled={saving}
                  onClick={() => setLeaving(false)}
                >
                  繼續編輯
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              className="gn2-save"
              disabled={saving || !isDirty(cur.bggName)}
              onClick={() => void handleSave()}
            >
              {saving ? '儲存中…' : '儲存心得'}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}