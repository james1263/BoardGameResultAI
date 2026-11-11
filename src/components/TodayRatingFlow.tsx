import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { BoardGame } from '../data/boardGames.generated'
import { RATING_FIELDS, type RatingsApi } from '../lib/useGameRatings'
import { useBackClose } from '../lib/useBackClose'
import CoverImage from './CoverImage'
import RatingSection from './RatingSection'
import RewardDialog from './RewardDialog'
import { useSession } from '../lib/useSession'
import { supabase } from '../lib/supabase'
import { ATTENDANCE_CONFIRMED_EVENT } from '../lib/useTodayTask'
import { requestNoteAsk } from '../lib/postGatheringNotes'
import { todayLocal } from '../lib/useLoyalty'
import { announcePlayed } from '../lib/useGamePlaySessions'
import {
  detectReward,
  fetchLoyaltySnap,
  isRewardOff,
  markRewardSeen,
  wasRewardSeen,
  type LoyaltySnap,
  type RewardKind,
} from '../lib/rewardNotice'
import '../styles/checkin-pick.css'
import '../styles/today-flow.css'

type Props = {
  // 今天指定的遊戲（bgg_name）
  games: string[]
  boardGames: BoardGame[]
  ratings: RatingsApi
  finishLabel: string
  onFinish: () => void
  // 報到前先查好的集點狀態（報到當下可能就已經拿到點或券）
  beforeSnap?: Promise<LoyaltySnap | null>
}

// 今日遊玩任務：①勾選今天玩了哪些 → ②逐款評分（七項必填）→ ③完成、領集點
export default function TodayRatingFlow({ games, boardGames, ratings, finishLabel, onFinish, beforeSnap }: Props) {
  const [phase, setPhase] = useState<'pick' | 'rate' | 'finish'>('pick')
  const [picked, setPicked] = useState<string[]>([])
  const [step, setStep] = useState(0)
  const [maxStep, setMaxStep] = useState(0)
  const [rewardLines, setRewardLines] = useState<string[]>([])
  const boxRef = useRef<HTMLDivElement | null>(null)
  const session = useSession()
  const userId = session?.user?.id ?? null
  // 開始評分前先記下集點狀態，評完再比對才知道有沒有新的點或券
  const beforeRef = useRef<Promise<LoyaltySnap | null> | null>(null)
  const checkedRef = useRef(false)
  const [reward, setReward] = useState<RewardKind | null>(null)
  // 走完流程就向資料庫確認出席（管理者手動加入的人要確認後才得點、才會用免費券）
  const confirmRef = useRef<Promise<void> | null>(null)
  const [confirmError, setConfirmError] = useState('')
  // 走完流程後問要不要寫今天的心得（詢問卡在 App 層，評分視窗關掉後還在；只送一次）
  const phaseRef = useRef(phase)
  const doneGamesRef = useRef<string[]>([])
  const askedRef = useRef(false)

  const gameMap = new Map(boardGames.map((game) => [game.bggName, game]))

  function isComplete(bggName: string): boolean {
    const mine = ratings.getMine(bggName)
    if (!mine || !(mine.overall > 0)) return false
    return RATING_FIELDS.every((field) => mine[field.key] != null)
  }

  // 勾選的遊戲，照指定遊戲原本的順序
  const pickedGames = games.filter((name) => picked.includes(name))
  const total = pickedGames.length
  const currentName = pickedGames[step] ?? null
  const currentGame = currentName ? gameMap.get(currentName) : undefined
  const isLast = step >= total - 1
  const doneCount = pickedGames.filter(isComplete).length
  const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100)

  useEffect(() => {
    phaseRef.current = phase
    doneGamesRef.current = pickedGames.filter(isComplete)
  })

  function sendAsk() {
    if (askedRef.current) return
    askedRef.current = true
    requestNoteAsk(doneGamesRef.current)
  }

  // 在完成畫面直接關掉視窗（✕、手機返回）也一樣會問
  useEffect(
    () => () => {
      if (phaseRef.current === 'finish') sendAsk()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useEffect(() => {
    if (phase === 'rate' && boxRef.current) boxRef.current.scrollTop = 0
  }, [phase, step])

  useEffect(() => {
    if (phase !== 'finish' || confirmRef.current) return
    confirmRef.current = (async () => {
      const { error } = await supabase.rpc('confirm_my_attendance')
      if (error) {
        setConfirmError(error.message)
        return
      }
      window.dispatchEvent(new Event(ATTENDANCE_CONFIRMED_EVENT))
    })()
  }, [phase])

  useEffect(() => {
    if (phase !== 'finish' || !userId || checkedRef.current) return
    const beforePromise = beforeRef.current
    if (!beforePromise) return
    checkedRef.current = true
    const uid = userId
    void (async () => {
      const before = await beforePromise
      // 先等「確認出席」寫完，點數或免費券才會出現
      await confirmRef.current
      const after = await fetchLoyaltySnap()
      if (!after) return
      let kind: RewardKind | null = before ? detectReward(before, after) : null
      if (!kind) {
        // 沒有新增點數或券：看看今天是不是剛好自動用掉免費券
        const used = await supabase
          .from('loyalty_redemptions')
          .select('id')
          .eq('user_id', uid)
          .eq('used_on', todayLocal())
          .limit(1)
        if (!used.error && (used.data ?? []).length > 0) kind = 'used'
      }
      if (!kind || isRewardOff(uid)) return
      const key = `${kind}|${todayLocal()}`
      if (wasRewardSeen(uid, key)) return
      markRewardSeen(uid, key)
      setReward(kind)
    })()
  }, [phase, userId])

  // 這款評分存檔成功後：向資料庫登記「今天有玩」（已評完整的遊戲也會 +1 次；同一天同一款只記一筆）
  async function recordPlay(bggName: string) {
    const { data, error } = await supabase.rpc('record_gathering_play', { p_bgg_name: bggName })
    if (!error && data === true) announcePlayed([bggName])
  }

  function togglePick(bggName: string) {
    setPicked((list) =>
      list.includes(bggName) ? list.filter((name) => name !== bggName) : [...list, bggName],
    )
  }

  function addRewardLines(lines: string[]) {
    setRewardLines((prev) => [...prev, ...lines.filter((line) => !prev.includes(line))])
  }

  if (phase === 'pick') {
    return (
      <div className="tf">
        <p className="tf-title">今天玩了哪些遊戲？</p>
        <p className="tf-sub">點封面勾選今天玩過的遊戲（可以選多款），至少選一款。</p>
        <div className="cp-grid">
          {games.map((bggName) => {
            const game = gameMap.get(bggName)
            const on = picked.includes(bggName)
            const done = ratings.status === 'ready' && isComplete(bggName)
            return (
              <button
                key={bggName}
                type="button"
                className={`cp-item ${on ? 'on' : ''}`}
                aria-pressed={on}
                onClick={() => togglePick(bggName)}
              >
                <span className="cp-cover">
                  {game ? (
                    <CoverImage
                      version={0}
                      className="cp-cover-img"
                      slug={game.coverSlug}
                      alt={game.name}
                      fallback={<span aria-hidden="true">🎲</span>}
                    />
                  ) : (
                    <span aria-hidden="true">🎲</span>
                  )}
                  {on && (
                    <span className="cp-check" aria-hidden="true">
                      ☑
                    </span>
                  )}
                </span>
                <span className="cp-name">{game?.name ?? bggName}</span>
                {done && <span className="tf-done-tag">已評分</span>}
              </button>
            )
          })}
        </div>
        <p className="tf-count">已選擇 {picked.length} 款遊戲</p>
        <button
          type="button"
          className="tf-primary"
          disabled={picked.length === 0}
          onClick={() => {
            if (!beforeRef.current) beforeRef.current = beforeSnap ?? fetchLoyaltySnap()
            setStep(0)
            setMaxStep(0)
            setPhase('rate')
          }}
        >
          {picked.length === 0 ? '請先選擇遊戲' : '確認，開始評分'}
        </button>
      </div>
    )
  }

  if (phase === 'rate' && currentName) {
    // 走過的遊戲都保持掛載（只是隱藏），回上一款時沒送出的內容不會消失
    const mounted = pickedGames.slice(0, maxStep + 1)
    return (
      <div className="tf">
        <div className="tf-head">
          <span className="tf-thumb">
            {currentGame && (
              <CoverImage
                version={0}
                className="cp-cover-img"
                slug={currentGame.coverSlug}
                alt={currentGame.name}
                fallback={<span aria-hidden="true">🎲</span>}
              />
            )}
          </span>
          <div className="tf-head-text">
            <span className="tf-step">
              第 {step + 1} / {total} 款
            </span>
            <strong className="tf-gname">{currentGame?.name ?? currentName}</strong>
          </div>
        </div>
        <div className="tf-progress" aria-hidden="true">
          <span style={{ width: `${percent}%` }} />
        </div>
        <p className="tf-sub">
          已完成 {doneCount} / {total} 款・七項都必填，填完才能按「{isLast ? '完成評分' : '下一款'}」
        </p>

        <div className="tf-rate-box" ref={boxRef}>
          {mounted.map((name) => (
            <div key={name} style={{ display: name === currentName ? 'block' : 'none' }}>
              <RatingSection
                bggName={name}
                api={ratings}
                onReward={addRewardLines}
                hideCommunity
                requireFull
                flow={
                  name === currentName
                    ? {
                        nextLabel: isLast ? '完成評分，領取集點' : '下一款',
                        prevLabel: step === 0 ? '← 重選遊戲' : '上一款',
                        onPrev: () => {
                          if (step === 0) {
                            setPhase('pick')
                            setMaxStep(0)
                          } else setStep((value) => value - 1)
                        },
                        onNext: () => {
                          void recordPlay(name)
                          if (isLast) setPhase('finish')
                          else {
                            setStep((value) => value + 1)
                            setMaxStep((value) => Math.max(value, step + 1))
                          }
                        },
                      }
                    : undefined
                }
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="tf">
      <div className="tf-success">
        <span className="tf-success-ico" aria-hidden="true">
          🎉
        </span>
        <p className="tf-title">今日遊玩的遊戲已全部評分完成！</p>
        {rewardLines.length > 0 ? (
          rewardLines.map((line) => (
            <p className="tf-reward" key={line}>
              {line}
            </p>
          ))
        ) : (
          <p className="tf-reward">評分完成，點數已更新，到集點卡看看。</p>
        )}
        {confirmError && (
          <p className="tf-reward" style={{ color: '#b5483a' }}>
            出席確認失敗：{confirmError}。請關閉後重新操作一次，或找管理者。
          </p>
        )}
      </div>
      <button
        type="button"
        className="tf-primary"
        onClick={() => {
          sendAsk()
          onFinish()
        }}
      >
        {finishLabel}
      </button>
      {reward && userId && (
        <RewardDialog kind={reward} userId={userId} onClose={() => setReward(null)} />
      )}
    </div>
  )
}

// 從集點卡開啟的視窗版本
export function TodayRatingModal({
  games,
  boardGames,
  ratings,
  onClose,
  onFinished,
}: {
  games: string[]
  boardGames: BoardGame[]
  ratings: RatingsApi
  onClose: () => void
  // 按完「回到集點卡」：有給就用它（例如從俱樂部首頁開的，要真的切到集點卡）；沒給就只是關閉
  onFinished?: () => void
}) {
  useBackClose(onClose)
  return createPortal(
    <div className="tf-backdrop">
      <div className="tf-sheet" role="dialog" aria-modal="true" aria-label="今日遊戲評分">
        <div className="tf-sheet-head">
          <h3>今日遊戲評分</h3>
          <button type="button" className="tf-x" aria-label="關閉" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="tf-sheet-body">
          <TodayRatingFlow
            games={games}
            boardGames={boardGames}
            ratings={ratings}
            finishLabel="回到集點卡"
            onFinish={onFinished ?? onClose}
          />
        </div>
      </div>
    </div>,
    document.body,
  )
}
