import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { BoardGame } from '../data/boardGames.generated'
import { supabase } from '../lib/supabase'
import { useMyLoyalty, todayLocal } from '../lib/useLoyalty'
import { RATING_FIELDS, type RatingsApi } from '../lib/useGameRatings'

type Target = { gatheringId: string }

// 30 天前的日期（YYYY-MM-DD，本機時間）：跟「我的場次」心得提醒用同樣的範圍
function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function PromptCard({
  bggName,
  boardGames,
  onWriteNow,
  onClose,
}: {
  bggName: string
  boardGames: BoardGame[]
  onWriteNow: (gatheringId: string) => void
  onClose: () => void
}) {
  const loyalty = useMyLoyalty()
  const [target, setTarget] = useState<Target | null>(null)
  const game = boardGames.find((item) => item.bggName === bggName)

  // 找出「我出席過、聚會日已到、這款是當天指定遊戲、還沒寫過心得」的聚會
  useEffect(() => {
    if (loyalty.loading) return
    const today = todayLocal()
    const cutoff = daysAgo(30)
    const candidates = loyalty.gatherings
      .filter(
        (item) =>
          item.date <= today &&
          item.date >= cutoff &&
          item.games.includes(bggName),
      )
      .sort((a, b) => b.date.localeCompare(a.date))
    if (candidates.length === 0) {
      onClose()
      return
    }

    let cancelled = false
    void (async () => {
      for (const item of candidates) {
        const { data, error } = await supabase.rpc('get_my_gathering_notes', {
          p_gathering: item.id,
        })
        if (cancelled) return
        const rows = error ? [] : ((data ?? []) as { bgg_name?: string }[])
        if (!rows.some((row) => row.bgg_name === bggName)) {
          setTarget({ gatheringId: item.id })
          return
        }
      }
      onClose()
    })()
    return () => {
      cancelled = true
    }
  }, [loyalty.loading, loyalty.gatherings, bggName, onClose])

  // 不打擾：15 秒後自動收起
  useEffect(() => {
    if (!target) return
    const timer = window.setTimeout(onClose, 15000)
    return () => window.clearTimeout(timer)
  }, [target, onClose])

  if (!target) return null

  return createPortal(
    <div className="np-toast" role="status">
      <p className="np-text">
        評分完成！想為「{game?.name ?? bggName}」寫下這場聚會的心得嗎？
      </p>
      <div className="np-actions">
        <button
          type="button"
          className="np-now"
          onClick={() => {
            onWriteNow(target.gatheringId)
            onClose()
          }}
        >
          現在寫
        </button>
        <button type="button" className="np-later" onClick={onClose}>
          稍後再寫
        </button>
      </div>
    </div>,
    document.body,
  )
}

// 偵測「某款遊戲剛剛評到七項完整」→ 問要不要寫心得（不擋評分、不擋集點）
export default function NotePrompt({
  boardGames,
  ratings,
  onWriteNow,
}: {
  boardGames: BoardGame[]
  ratings: RatingsApi
  onWriteNow: (gatheringId: string) => void
}) {
  const [bggName, setBggName] = useState<string | null>(null)
  const beforeRef = useRef<Set<string> | null>(null)
  const close = useCallback(() => setBggName(null), [])

  useEffect(() => {
    if (ratings.status !== 'ready') {
      beforeRef.current = null
      return
    }
    const complete = new Set<string>()
    for (const game of boardGames) {
      const mine = ratings.getMine(game.bggName)
      if (
        mine &&
        mine.overall > 0 &&
        RATING_FIELDS.every((field) => mine[field.key] != null)
      ) {
        complete.add(game.bggName)
      }
    }
    const before = beforeRef.current
    beforeRef.current = complete
    if (before === null) return // 第一次讀到評分只當基準，不跳窗
    for (const name of complete) {
      if (!before.has(name)) setBggName(name)
    }
  }, [ratings.status, ratings.getMine, boardGames])

  if (!bggName) return null
  return (
    <PromptCard
      key={bggName}
      bggName={bggName}
      boardGames={boardGames}
      onWriteNow={onWriteNow}
      onClose={close}
    />
  )
}