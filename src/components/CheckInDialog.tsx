import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { BoardGame } from '../data/boardGames.generated'
import { supabase } from '../lib/supabase'
import { PROFILE_SAVED_EVENT } from '../lib/googleLogin'
import { useSession } from '../lib/useSession'
import { VIP_CHANGED_EVENT } from '../lib/useVip'
import { RATING_FIELDS, type RatingsApi } from '../lib/useGameRatings'
import { useBackClose } from '../lib/useBackClose'
import CoverImage from './CoverImage'
import RatingSection from './RatingSection'
import '../styles/checkin-pick.css'

type JoinRow = { result_status: string; result_date: string | null }
type DayInfo = { exempt: boolean; games: string[]; error: string }

const MESSAGES: Record<string, string> = {
  joined: '報到成功！你已經列入今天的出席名單，也成為 VIP 朋友了。',
  already: '你已經報到過了。',
  closed: '這場聚會目前沒有開放報到，請找管理者。',
  not_started: '這場聚會還沒開始，聚會當天才能報到。',
  ended:
    '這個連結已過期，只在聚會當天有效。如果你已經報到過，請直接按底部的「集點卡」。',
  full: '這場聚會已經額滿，請找管理者幫你加入。',
  no_profile: '請先設定暱稱（右上角的暱稱選單），填完會自動報到。',
  no_contact:
    '請先填寫 LINE／FB 名字（右上角暱稱選單 → 修改暱稱與聯絡方式），填完會自動報到。',
  invalid: '這個報到連結無效，可能已被管理者更換，請向管理者索取新的連結。',
  not_logged_in: '請先用 Google 登入。',
}

const RETRYABLE = new Set(['no_profile', 'no_contact', 'not_logged_in'])
const SUCCESS = new Set(['joined', 'already'])

export default function CheckInDialog({
  token,
  boardGames,
  ratings,
  onDone,
  onClose,
}: {
  token: string
  boardGames: BoardGame[]
  ratings: RatingsApi
  onDone: (date: string | null) => void
  onClose: () => void
}) {
  // 手機返回鍵／右滑：關閉報到視窗（疊在上面的遊戲評分視窗會先關）
  useBackClose(onClose)

  const session = useSession()
  const userId = session?.user?.id ?? null

  const [busy, setBusy] = useState(true)
  const [status, setStatus] = useState<string | null>(null)
  const [date, setDate] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [info, setInfo] = useState<DayInfo | null>(null)
  const [wasNeeded, setWasNeeded] = useState<boolean | null>(null)
  // 評分流程：先勾今天玩了哪些 → 一款一款評 → 完成
  const [phase, setPhase] = useState<'pick' | 'rate' | 'finish'>('pick')
  const [picked, setPicked] = useState<string[]>([])
  const [step, setStep] = useState(0)
  const [rewardLines, setRewardLines] = useState<string[]>([])
  const statusRef = useRef<string | null>(null)
  const startedRef = useRef(false)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  const handleJoin = useCallback(async () => {
    setBusy(true)
    setError('')
    const { data, error: rpcError } = await supabase.rpc('join_gathering', {
      p_token: token,
    })
    setBusy(false)

    if (rpcError) {
      setError('報到失敗：' + rpcError.message)
      return
    }
    const row = (data as JoinRow[] | null)?.[0]
    if (!row) {
      setError('報到失敗：沒有收到結果，請再試一次。')
      return
    }
    statusRef.current = row.result_status
    setStatus(row.result_status)
    setDate(row.result_date)
    if (row.result_status === 'joined' || row.result_status === 'already') {
      // 報到後資料庫已自動升成 VIP，通知畫面重新檢查
      window.dispatchEvent(new Event(VIP_CHANGED_EVENT))
    }
  }, [token])

  // 視窗一打開就自動報到
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    void handleJoin()
  }, [handleJoin])

  // 玩家剛填完暱稱與聯絡方式：自動接著報到
  useEffect(() => {
    function handleSaved() {
      if (statusRef.current === 'joined' || statusRef.current === 'already') return
      void handleJoin()
    }
    window.addEventListener(PROFILE_SAVED_EVENT, handleSaved)
    return () => window.removeEventListener(PROFILE_SAVED_EVENT, handleSaved)
  }, [handleJoin])

  const succeeded = status !== null && SUCCESS.has(status)
  const canRetry = status === null || RETRYABLE.has(status)

  // 報到成功後，讀取我在這一天被列入的聚會：指定遊戲、是否免評分
  useEffect(() => {
    if (!succeeded || !date || !userId) return
    let cancelled = false

    async function loadDay(day: string, uid: string) {
      const g = await supabase
        .from('gatherings')
        .select('id')
        .eq('gathered_on', day)
      const allIds = ((g.data ?? []) as { id: string }[]).map((row) => row.id)
      if (g.error || allIds.length === 0) {
        if (!cancelled) {
          setInfo({ exempt: false, games: [], error: g.error?.message ?? '' })
        }
        return
      }

      const a = await supabase
        .from('gathering_attendees')
        .select('gathering_id, exempt')
        .eq('user_id', uid)
        .in('gathering_id', allIds)
      const mine = (
        (a.data ?? []) as { gathering_id: string; exempt: boolean }[]
      )
      const myIds = mine.map((row) => row.gathering_id)

      const gg =
        myIds.length > 0
          ? await supabase
            .from('gathering_games')
            .select('gathering_id, bgg_name')
            .in('gathering_id', myIds)
            .is('removed_at', null)
          : { data: [], error: null }

      if (cancelled) return
      const games = Array.from(
        new Set(
          ((gg.data ?? []) as { bgg_name: string }[]).map((row) => row.bgg_name),
        ),
      )
      setInfo({
        exempt: mine.some((row) => row.exempt),
        games,
        error: a.error?.message ?? gg.error?.message ?? '',
      })
    }

    void loadDay(date, userId)
    return () => {
      cancelled = true
    }
  }, [succeeded, date, userId])

  const ratingsReady = ratings.status === 'ready'

  // 七項評分都填了才算完整（跟集點卡同一個標準）
  function isComplete(bggName: string): boolean {
    const mine = ratings.getMine(bggName)
    if (!mine || !(mine.overall > 0)) return false
    return RATING_FIELDS.every((field) => mine[field.key] != null)
  }

  const resolved = info !== null && ratingsReady
  const doneCount = info ? info.games.filter(isComplete).length : 0
  const needRating =
    info !== null &&
    !info.error &&
    !info.exempt &&
    info.games.length > 0 &&
    doneCount === 0

  // 第一次算出結果時記住「一開始需不需要評分」
  useEffect(() => {
    if (resolved && wasNeeded === null) setWasNeeded(needRating)
  }, [resolved, wasNeeded, needRating])

  const showRate = resolved && (wasNeeded ?? needRating)

  // 一開始就不用評分（免評分、以前評過、沒有指定遊戲）：稍等一下直接到集點卡
  useEffect(() => {
    if (!resolved || wasNeeded !== false) return
    const timer = window.setTimeout(() => onDoneRef.current(date), 1200)
    return () => window.clearTimeout(timer)
  }, [resolved, wasNeeded, date])

  const gameMap = new Map(boardGames.map((game) => [game.bggName, game]))
  // 勾選的遊戲，照指定遊戲原本的順序
  const pickedGames = info ? info.games.filter((name) => picked.includes(name)) : []
  const currentName = pickedGames[step] ?? null
  const currentGame = currentName ? gameMap.get(currentName) : undefined
  const isLastStep = step >= pickedGames.length - 1

  function togglePick(bggName: string) {
    setPicked((list) =>
      list.includes(bggName) ? list.filter((name) => name !== bggName) : [...list, bggName],
    )
  }

  function addRewardLines(lines: string[]) {
    setRewardLines((prev) => [...prev, ...lines.filter((line) => !prev.includes(line))])
  }

  return createPortal(
    <div className="modal-backdrop checkin-backdrop">
      <div
        className="admin-modal player-dialog"
        role="dialog"
        aria-label="桌遊聚會報到"
      >
        <h2>桌遊聚會報到</h2>

        {status === null ? (
          <p className="pd-text">
            {busy ? '正在幫你報到…' : '按下「我來了」，管理者就會在今天的出席名單看到你。'}
          </p>
        ) : (
          <p className={`pd-text ${succeeded ? 'pd-ok' : 'pd-warn'}`}>
            {MESSAGES[status] ?? '發生未知的狀況，請找管理者。'}
          </p>
        )}

        {error && <p className="pd-error">{error}</p>}

        {succeeded && !resolved && <p className="pd-text">正在準備評分…</p>}

        {succeeded && resolved && !showRate && (
          <p className="pd-text">正在帶你到集點卡…</p>
        )}

        {succeeded && showRate && phase === 'pick' && (
          <div className="ci-rate">
            <p className="pd-text">
              <b>今天玩了哪些遊戲？</b>
              <br />
              <span className="cp-sub">至少選一款，點封面打勾</span>
            </p>

            <div className="cp-grid">
              {info!.games.map((bggName) => {
                const game = gameMap.get(bggName)
                const on = picked.includes(bggName)
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
                  </button>
                )
              })}
            </div>

            <button
              className="pd-save"
              type="button"
              disabled={picked.length === 0}
              onClick={() => {
                setStep(0)
                setPhase('rate')
              }}
            >
              {picked.length === 0 ? '至少選一款才能確認' : `確認（已選 ${picked.length} 款）`}
            </button>
          </div>
        )}

        {succeeded && showRate && phase === 'rate' && currentName && (
          <div className="ci-rate">
            <p className="pd-text">
              <b>
                第 {step + 1} / {pickedGames.length} 款：{currentGame?.name ?? currentName}
              </b>
              <br />
              <span className="cp-sub">
                七項評分都填完、按「送出評分」後，才能按「{isLastStep ? '完成' : '下一步'}」
              </span>
            </p>

            <div className="cp-rate-box">
              <RatingSection
                key={currentName}
                bggName={currentName}
                api={ratings}
                onReward={addRewardLines}
                hideCommunity
              />
            </div>

            <button
              className="pd-save"
              type="button"
              disabled={!isComplete(currentName)}
              onClick={() => {
                if (isLastStep) setPhase('finish')
                else setStep((value) => value + 1)
              }}
            >
              {isComplete(currentName)
                ? isLastStep
                  ? '完成'
                  : '下一步'
                : '七項都送出後才能繼續'}
            </button>
            {step === 0 && (
              <div className="pd-secondary">
                <button type="button" onClick={() => setPhase('pick')}>
                  ← 重新選遊戲
                </button>
              </div>
            )}
          </div>
        )}

        {succeeded && showRate && phase === 'finish' && (
          <div className="ci-rate">
            <p className="pd-text pd-ok">
              <b>全部評完了 🎉</b>
            </p>
            {rewardLines.length > 0 ? (
              rewardLines.map((line) => (
                <p className="pd-text" key={line}>
                  {line}
                </p>
              ))
            ) : (
              <p className="pd-text">評分完成，點數已更新，到集點卡看看。</p>
            )}
            <button className="pd-save" type="button" onClick={() => onDone(date)}>
              前往集點卡
            </button>
          </div>
        )}

        {!succeeded &&
          (canRetry ? (
            <>
              <button
                className="pd-save"
                type="button"
                disabled={busy}
                onClick={handleJoin}
              >
                {busy ? '報到中…' : '我來了'}
              </button>
              <div className="pd-secondary">
                <button type="button" onClick={onClose}>
                  取消
                </button>
              </div>
            </>
          ) : (
            <button className="pd-save" type="button" onClick={onClose}>
              關閉
            </button>
          ))}
      </div>
    </div>,
    document.body,
  )
}
