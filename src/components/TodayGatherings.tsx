import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { BoardGame } from '../data/boardGames.generated'
import { supabase } from '../lib/supabase'
import { useSession } from '../lib/useSession'
import { todayLocal } from '../lib/useLoyalty'
import { ATTENDANCE_CONFIRMED_EVENT } from '../lib/useTodayTask'
import type { RatingsApi } from '../lib/useGameRatings'
import { useBackClose } from '../lib/useBackClose'
import CoverImage from './CoverImage'
import { TodayRatingModal } from './TodayRatingFlow'
import '../styles/today-room.css'

// 今日聚會：我的俱樂部最上面的卡片＋房間視窗（第一版）
// 一律以聚會 id 為準（同一天可能有好幾場）；資料來自 get_my_gatherings（管理者看全部、玩家只看自己出席的）
// 與 get_gathering_detail（出席者與指定遊戲，名稱已依隱藏規則處理）。純前端、不新增資料表。

type TodayRow = {
  id: string
  gathered_on: string
  title: string | null
  attendee_count: number | string
}
type Person = { n: string; me: boolean; c?: string | null }
type RoomGame = { b: string; n: string | null }
type Detail = { attendees: Person[]; games: RoomGame[] }

function rowLabel(row: TodayRow, index: number, total: number): string {
  const title = (row.title ?? '').trim()
  if (title) return title
  return total > 1 ? `今天的聚會（第 ${index + 1} 場）` : '今天的聚會'
}

function RoomDialog({
  label,
  detail,
  isAdmin,
  gameByName,
  onClose,
  onRate,
}: {
  label: string
  detail: Detail | null
  isAdmin: boolean
  gameByName: Map<string, BoardGame>
  onClose: () => void
  onRate: (games: string[]) => void
}) {
  useBackClose(onClose)
  const people = detail?.attendees ?? []
  const games = detail?.games ?? []

  return createPortal(
    <div className="tr-backdrop tr-backdrop-x" onClick={onClose}>
      <div
        className="tr-sheet tr-sheet-x"
        role="dialog"
        aria-modal="true"
        aria-label="今日聚會"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="tr-sheet-head">
          <div>
            <p className="tr-kicker">今日聚會</p>
            <p className="tr-sheet-title">{label}</p>
          </div>
          <button type="button" className="tr-x" aria-label="關閉" onClick={onClose}>
            ✕
          </button>
        </div>

        {!detail ? (
          <p className="tr-muted">讀取中，或你不在這場的出席名單上。</p>
        ) : (
          <>
            <p className="tr-section">今天的遊戲（{games.length}）</p>
            {games.length === 0 ? (
              <p className="tr-muted">這場還沒有指定遊戲。</p>
            ) : (
              <ul className="tr-games">
                {games.map((game) => {
                  const info = gameByName.get(game.b)
                  return (
                    <li key={game.b}>
                      <span className="tr-cover">
                        {info ? (
                          <CoverImage
                            version={0}
                            className="tr-cover-img"
                            slug={info.coverSlug}
                            alt={info.name}
                            fallback={<span aria-hidden="true">🎲</span>}
                          />
                        ) : (
                          <span aria-hidden="true">🎲</span>
                        )}
                      </span>
                      <span className="tr-gname">{info?.name ?? game.n ?? game.b}</span>
                    </li>
                  )
                })}
              </ul>
            )}

            <p className="tr-section">出席（{people.length}）</p>
            <ul className="tr-chips">
              {people.map((person, index) => (
                <li key={index} className={person.me ? 'me' : ''}>
                  {person.n}
                  {isAdmin && person.c && person.c !== person.n ? <small>{person.c}</small> : null}
                </li>
              ))}
            </ul>

            {!isAdmin && games.length > 0 && (
              <button
                type="button"
                className="tr-primary"
                onClick={() => onRate(games.map((game) => game.b))}
              >
                評分今天玩的遊戲
              </button>
            )}
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}

export default function TodayGatherings({
  boardGames,
  ratings,
  isAdmin,
}: {
  boardGames: BoardGame[]
  ratings: RatingsApi
  isAdmin: boolean
}) {
  const session = useSession()
  const userId = session?.user?.id ?? null
  const [rows, setRows] = useState<TodayRow[]>([])
  const [details, setDetails] = useState<Record<string, Detail | null>>({})
  const [roomId, setRoomId] = useState<string | null>(null)
  const [rateGames, setRateGames] = useState<string[] | null>(null)
  const timerRef = useRef<number | null>(null)

  const gameByName = useMemo(() => {
    const map = new Map<string, BoardGame>()
    for (const game of boardGames) map.set(game.bggName, game)
    return map
  }, [boardGames])

  const load = useCallback(async () => {
    if (!userId) {
      setRows([])
      return
    }
    const today = todayLocal()
    const res = await supabase.rpc('get_my_gatherings')
    if (res.error) return
    const list = ((res.data ?? []) as TodayRow[])
      .filter((row) => row.gathered_on === today)
      .reverse()
    const next: Record<string, Detail | null> = {}
    await Promise.all(
      list.map(async (row) => {
        const d = await supabase.rpc('get_gathering_detail', { p_gathering: row.id })
        next[row.id] = d.error ? null : ((d.data as Detail | null) ?? null)
      }),
    )
    setRows(list)
    setDetails(next)
  }, [userId])

  useEffect(() => {
    void load()
    function handleVisible() {
      if (document.visibilityState === 'visible') void load()
    }
    function handleConfirmed() {
      void load()
    }
    document.addEventListener('visibilitychange', handleVisible)
    window.addEventListener(ATTENDANCE_CONFIRMED_EVENT, handleConfirmed)
    return () => {
      document.removeEventListener('visibilitychange', handleVisible)
      window.removeEventListener(ATTENDANCE_CONFIRMED_EVENT, handleConfirmed)
    }
  }, [load])

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    },
    [],
  )

  const roomIndex = roomId ? rows.findIndex((row) => row.id === roomId) : -1
  const room = roomIndex >= 0 ? rows[roomIndex] : null

  // 兩個視窗接力：先關房間視窗，稍等一下再開評分視窗，避免同時改瀏覽紀錄
  function startRate(games: string[]) {
    setRoomId(null)
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setRateGames(games), 350)
  }

  return (
    <>
      {userId && rows.length > 0 && (
        <div className="tr-card tr-card-x">
          <p className="tr-card-title">今日聚會</p>
          <div className="tr-card-list">
            {rows.map((row, index) => {
              const detail = details[row.id] ?? null
              const count = detail ? detail.attendees.length : Number(row.attendee_count)
              const gameCount = detail ? detail.games.length : 0
              return (
                <button
                  key={row.id}
                  type="button"
                  className="tr-card-item"
                  onClick={() => setRoomId(row.id)}
                >
                  <span className="tr-card-text">
                    <b>{rowLabel(row, index, rows.length)}</b>
                    <span>
                      {count} 人出席・{gameCount} 款遊戲
                    </span>
                  </span>
                  <span className="tr-card-go" aria-hidden="true">
                    進入 ›
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
      {room && (
        <RoomDialog
          label={rowLabel(room, roomIndex, rows.length)}
          detail={details[room.id] ?? null}
          isAdmin={isAdmin}
          gameByName={gameByName}
          onClose={() => setRoomId(null)}
          onRate={startRate}
        />
      )}
      {rateGames && (
        <TodayRatingModal
          games={rateGames}
          boardGames={boardGames}
          ratings={ratings}
          onClose={() => {
            setRateGames(null)
            void load()
          }}
        />
      )}
    </>
  )
}
