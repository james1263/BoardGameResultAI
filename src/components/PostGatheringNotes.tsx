import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { BoardGame } from '../data/boardGames.generated'
import type { PersonalApi } from '../lib/personalApi'
import type { RatingsApi } from '../lib/useGameRatings'
import { useBackClose } from '../lib/useBackClose'
import { useSession } from '../lib/useSession'
import { useAllMyNotes } from '../lib/useGatheringNotes'
import { useMyGatherings } from '../lib/useMyGatherings'
import { useMyGatheringGames } from '../lib/useMyGatheringGames'
import { todayLocal } from '../lib/useGamePlaySessions'
import { NOTE_ASK_EVENT, markNoteAsked, wasNoteAsked, type NoteAskDetail } from '../lib/postGatheringNotes'
import CoverImage from './CoverImage'
import NoteForm from './NoteForm'
import '../styles/post-gathering-notes.css'

type ListedGame = BoardGame & { removedAt?: string | null }

type Item = { game: ListedGame; gid: string; date: string }

type Props = {
  boardGames: ListedGame[]
  personal: PersonalApi
  ratings: RatingsApi
  isAdmin: boolean
  canPublic: boolean
}

function Cover({ game }: { game: BoardGame }) {
  return (
    <CoverImage
      version={0}
      className="pg-cover-img"
      slug={game.coverSlug}
      alt={game.name}
      fallback={<span aria-hidden="true">🎲</span>}
    />
  )
}

function shortDate(date: string): string {
  const [, month, day] = date.split('-')
  return month && day ? `${Number(month)}/${Number(day)}` : date
}

// 選擇視窗＋寫作畫面共用一層（一次只佔一筆瀏覽歷史）
function Sheet({
  items,
  props,
  onDone,
  startWith,
}: {
  items: Item[]
  props: Props
  onDone: () => void
  startWith: Item | null
}) {
  useBackClose(onDone)
  const allNotes = useAllMyNotes()
  const [current, setCurrent] = useState<Item | null>(startWith)
  const [savedName, setSavedName] = useState('')
  const single = items.length === 1

  const noteMap = useMemo(() => {
    const map = new Map<string, (typeof allNotes.rows)[number]>()
    for (const row of allNotes.rows) map.set(`${row.gatheringId}|${row.bggName}`, row)
    return map
  }, [allNotes.rows])

  function canPublicFor(bggName: string): boolean {
    if (!props.canPublic) return false
    return (
      props.isAdmin ||
      props.personal.getEntry(bggName).played ||
      props.ratings.getMine(bggName) !== null
    )
  }

  if (current) {
    return (
      <div className="pg-backdrop">
        <div className="pg-sheet" role="dialog" aria-modal="true" aria-label="寫心得／留言">
          <div className="pg-head">
            <h3>{single ? '留下今天的遊戲紀錄' : '寫心得／留言'}</h3>
            <button
              type="button"
              className="pg-x"
              aria-label={single ? '關閉' : '回到選擇遊戲'}
              onClick={single ? onDone : () => setCurrent(null)}
            >
              ✕
            </button>
          </div>
          <div className="pg-body">
            <div className="pg-game">
              <span className="pg-thumb">
                <Cover game={current.game} />
              </span>
              <span className="pg-game-text">
                <b>{current.game.name}</b>
                <span className="pg-from">來自 {shortDate(current.date)} 聚會</span>
              </span>
            </div>
            <NoteForm
              key={`${current.gid}|${current.game.bggName}`}
              games={props.boardGames}
              personal={props.personal}
              ratings={props.ratings}
              isAdmin={props.isAdmin}
              canPublic={props.canPublic}
              initialGame={current.game}
              initialGatheringId={current.gid}
              initialKind="private"
              compact
              onSaved={() => {
                allNotes.reload()
                if (!single) {
                  setSavedName(current.game.name)
                  setCurrent(null)
                }
              }}
              onCancel={single ? onDone : () => setCurrent(null)}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pg-backdrop">
      <div className="pg-sheet" role="dialog" aria-modal="true" aria-label="留下今天的遊戲紀錄">
        <div className="pg-head">
          <h3>留下今天的遊戲紀錄</h3>
          <button type="button" className="pg-x" aria-label="關閉" onClick={onDone}>
            ✕
          </button>
        </div>
        <div className="pg-body">
          <p className="pg-sub">今天玩得如何？選擇想留下心得或留言的遊戲吧！</p>
          {savedName && <p className="pg-saved">已儲存《{savedName}》，可以繼續選其他遊戲。</p>}
          <ul className="pg-list">
            {items.map((item) => {
              const row = noteMap.get(`${item.gid}|${item.game.bggName}`)
              const note = (row?.privateNote ?? '').trim() !== ''
              const pub = (row?.publicNote ?? '').trim() !== ''
              const canPub = canPublicFor(item.game.bggName)
              const hint =
                note && (pub || !canPub)
                  ? '可以更新原有內容'
                  : !canPub
                    ? '僅能填寫私人心得'
                    : note || pub
                      ? '可以更新原有內容'
                      : '點擊填寫心得／留言'
              return (
                <li key={item.gid + item.game.bggName}>
                  <button
                    type="button"
                    className="pg-row"
                    onClick={() => {
                      setSavedName('')
                      setCurrent(item)
                    }}
                  >
                    <span className="pg-thumb">
                      <Cover game={item.game} />
                    </span>
                    <span className="pg-main">
                      <span className="pg-name">{item.game.name}</span>
                      <span className="pg-tags">
                        <span className={`pg-tag ${note ? 'ok' : 'todo'}`}>
                          {note ? '心得 ✓' : '心得未填'}
                        </span>
                        <span className={`pg-tag ${pub ? 'ok' : canPub ? 'todo' : 'off'}`}>
                          {pub ? '留言 ✓' : canPub ? '留言未填' : '不可留言'}
                        </span>
                      </span>
                      <span className="pg-hint">{hint}</span>
                    </span>
                    <span className="pg-go" aria-hidden="true">
                      ›
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          <button type="button" className="pg-leave" onClick={onDone}>
            暫時不寫，離開
          </button>
          <p className="pg-foot">選擇其中一款，儲存後返回這個選擇視窗。</p>
        </div>
      </div>
    </div>
  )
}

// 一次詢問：先問要不要寫 → 選擇視窗（只評一款就直接進寫作畫面）
function Session({ games, props, onDone }: { games: string[]; props: Props; onDone: () => void }) {
  const session = useSession()
  const userId = session?.user?.id ?? null
  const gatherings = useMyGatherings()
  const gatheringGames = useMyGatheringGames()
  const [stage, setStage] = useState<'wait' | 'ask' | 'sheet'>('wait')
  const decided = useRef(false)

  const items = useMemo<Item[]>(() => {
    const today = todayLocal()
    const list: Item[] = []
    for (const name of games) {
      const game = props.boardGames.find((item) => item.bggName === name)
      const row = gatherings.rows.find(
        (item) => item.gatheredOn === today && (gatheringGames.games.get(item.id) ?? []).includes(name),
      )
      if (game && row) list.push({ game, gid: row.id, date: row.gatheredOn })
    }
    return list
  }, [games, props.boardGames, gatherings.rows, gatheringGames.games])

  const ready = !gatherings.loading && !gatheringGames.loading && userId !== null

  useEffect(() => {
    if (!ready || decided.current) return
    decided.current = true
    if (items.length === 0) {
      onDone()
      return
    }
    const gids = Array.from(new Set(items.map((item) => item.gid)))
    if (userId && gids.every((gid) => wasNoteAsked(userId, gid))) {
      onDone()
      return
    }
    if (userId) for (const gid of gids) markNoteAsked(userId, gid)
    setStage('ask')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  // 詢問卡 15 秒沒按就收起（只是詢問，之後還能從「我的心得」補寫）
  useEffect(() => {
    if (stage !== 'ask') return
    const timer = window.setTimeout(onDone, 15000)
    return () => window.clearTimeout(timer)
  }, [stage, onDone])

  if (stage === 'wait') return null

  if (stage === 'ask') {
    return createPortal(
      <div className="pg-ask" role="dialog" aria-label="要寫今天的心得嗎">
        <p className="pg-ask-title">要順便留下今天的心得嗎？</p>
        <p className="pg-ask-sub">
          {items.length === 1
            ? `想為《${items[0].game.name}》寫下心得或留言嗎？`
            : `今天評分的 ${items.length} 款遊戲，可以挑想寫的寫。`}
        </p>
        <div className="pg-ask-actions">
          <button type="button" className="pg-ask-yes" onClick={() => setStage('sheet')}>
            好，來寫
          </button>
          <button type="button" className="pg-ask-no" onClick={onDone}>
            這次不寫
          </button>
        </div>
      </div>,
      document.body,
    )
  }

  return createPortal(
    <Sheet items={items} props={props} onDone={onDone} startWith={items.length === 1 ? items[0] : null} />,
    document.body,
  )
}

// 評分流程走完後（獎勵視窗之後）出現的「要不要寫今天的心得」詢問
export default function PostGatheringNotes(props: Props) {
  const [request, setRequest] = useState<{ games: string[]; nonce: number } | null>(null)
  const done = useCallback(() => setRequest(null), [])

  useEffect(() => {
    function handle(event: Event) {
      const detail = (event as CustomEvent<NoteAskDetail>).detail
      if (!detail || detail.games.length === 0) return
      setRequest((current) => ({ games: detail.games, nonce: (current?.nonce ?? 0) + 1 }))
    }
    window.addEventListener(NOTE_ASK_EVENT, handle)
    return () => window.removeEventListener(NOTE_ASK_EVENT, handle)
  }, [])

  if (!request) return null
  return (
    <Session
      key={request.nonce}
      games={request.games}
      props={props}
      onDone={done}
    />
  )
}
