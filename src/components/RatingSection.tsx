import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useVip } from '../lib/useVip'
import VipLock from './VipLock'
import InfoHint from './InfoHint'
import { RATING_HINTS_BY_KEY } from '../lib/ratingHints'
import {
    RATING_FIELDS,
    type MyRating,
    type RatingKey,
    type RatingsApi,
} from '../lib/useGameRatings'
import { askConfirm } from '../lib/askConfirm'
import { personLabel, type RatingPerson } from '../lib/useGamePeople'
import { useMyLoyalty, todayLocal } from '../lib/useLoyalty'
import { useSession } from '../lib/useSession'
import { supabase } from '../lib/supabase'
import { announcePlayed } from '../lib/useGamePlaySessions'

type Draft = {
    overall: number | null
    scores: Record<RatingKey, number | null>
}

// 細評五項：除了「整體」與「適合留下來程度」以外（平常選填；要集點時必填）
const OPTIONAL_FIELDS = RATING_FIELDS.filter((field) => field.key !== 'keep')
const KEEP_LABEL =
    RATING_FIELDS.find((field) => field.key === 'keep')?.label ?? '適合留下來程度'

function toDraft(mine: MyRating | null): Draft {
    return {
        overall: mine?.overall ?? null,
        scores: {
            like: mine?.like ?? null,
            playerImpact: mine?.playerImpact ?? null,
            communication: mine?.communication ?? null,
            change: mine?.change ?? null,
            unique: mine?.unique ?? null,
            keep: mine?.keep ?? null,
        },
    }
}

function sameAsSaved(draft: Draft, mine: MyRating | null): boolean {
    if (!mine) return false
    if (draft.overall !== mine.overall) return false
    return RATING_FIELDS.every((f) => draft.scores[f.key] === mine[f.key])
}

function filledCount(draft: Draft): number {
    const detail = RATING_FIELDS.filter((f) => draft.scores[f.key] != null).length
    return detail + (draft.overall != null ? 1 : 0)
}

type LoyaltySnapshot = { monthPoints: number; earned: number; redeemed: number }

async function readLoyalty(): Promise<LoyaltySnapshot | null> {
    const { data, error } = await supabase.rpc('get_my_loyalty_summary')
    const row = (
        data as { month_points: number; earned_vouchers: number; redeemed: number }[] | null
    )?.[0]
    if (error || !row) return null
    return { monthPoints: row.month_points, earned: row.earned_vouchers, redeemed: row.redeemed }
}

async function countSessions(userId: string, bggName: string): Promise<number | null> {
    const { count, error } = await supabase
        .from('game_play_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('bgg_name', bggName)
    return error ? null : (count ?? 0)
}

async function latestPlayedOn(userId: string, bggName: string): Promise<string | null> {
    const { data } = await supabase
        .from('game_play_sessions')
        .select('played_on')
        .eq('user_id', userId)
        .eq('bgg_name', bggName)
        .order('created_at', { ascending: false })
        .limit(1)
    const row = (data as { played_on?: string }[] | null)?.[0]
    return row?.played_on ?? null
}

// 評分前後比較：得到 1 點、換成免費券、或自動用券
function describePoints(
    before: LoyaltySnapshot | null,
    after: LoyaltySnapshot | null,
): string | null {
    if (!before || !after) return null
    if (after.redeemed > before.redeemed) {
        return '你有可用的免費券，已自動使用 1 張（今天不集點）。'
    }
    if (after.earned > before.earned) {
        return '獲得 1 點！本月集滿 2 點，已轉換成免費券 1 張（明天起可以使用）。'
    }
    if (after.monthPoints > before.monthPoints) {
        return `獲得 1 點！本月累積 ${after.monthPoints} 點，集滿 2 點就換免費券 1 張。`
    }
    return null
}

// 評分說明：第一次評分的人直接展開，之後收成「!」
function HintFor({ hintKey, expanded }: { hintKey: RatingKey; expanded: boolean }) {
    const text = RATING_HINTS_BY_KEY[hintKey]
    if (!text) return null
    if (!expanded) return <InfoHint text={text} />
    return (
        <span
            style={{
                display: 'block',
                fontSize: '0.85em',
                color: '#6b5a3c',
                lineHeight: 1.6,
                margin: '2px 0 6px',
                fontWeight: 400,
            }}
        >
            {text}
        </span>
    )
}

const RATER_COLUMNS: { label: string; field: keyof RatingPerson }[] = [
    { label: '整體', field: 'o' },
    { label: '喜歡', field: 'l' },
    { label: '玩家影響', field: 'pi' },
    { label: '溝通', field: 'cm' },
    { label: '變化', field: 'ch' },
    { label: '獨特', field: 'u' },
    { label: '留下來', field: 'k' },
]

// 只有管理者：每個人各自給的分數
function RaterList({ raters }: { raters: RatingPerson[] }) {
    return (
        <details style={{ marginTop: 10 }}>
            <summary
                style={{ cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#456b50' }}
            >
                每個人的評分（{raters.length} 人，只有管理者看得到）
            </summary>
            <ul style={{ listStyle: 'none', margin: '6px 0 0', padding: 0 }}>
                {raters.map((person, index) => (
                    <li
                        key={`${person.n}-${index}`}
                        style={{ padding: '6px 0', borderTop: '1px dashed #e3d9c4' }}
                    >
                        <strong style={{ fontSize: 14 }}>{personLabel(person, true)}</strong>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 4 }}>
                            {RATER_COLUMNS.map((col) => {
                                const value = person[col.field] as number | null
                                return (
                                    <span
                                        key={col.field}
                                        style={{
                                            fontSize: 12,
                                            padding: '2px 8px',
                                            borderRadius: 999,
                                            background: '#efe7d3',
                                            color: '#34463c',
                                        }}
                                    >
                                        {col.label} {value ?? '—'}
                                    </span>
                                )
                            })}
                        </div>
                    </li>
                ))}
            </ul>
        </details>
    )
}

export function CommunitySummary({
    bggName,
    api,
    detailed,
    raters,
}: {
    bggName: string
    api: RatingsApi
    detailed: boolean
    // 選填：只有管理者傳入，會多一個「每個人的評分」可展開
    raters?: RatingPerson[]
}) {
    const vip = useVip()
    const summary = api.getSummary(bggName)
    const raterList = raters && raters.length > 0 ? <RaterList raters={raters} /> : null

    if (vip.checked && !vip.isVip) {
        return <VipLock compact feature="大家的評分" />
    }

    if (summary.overallAvg == null) {
        return (
            <div>
                <p className="rate-note">
                    {summary.count === 0
                        ? '還沒有人評分'
                        : `評分累積中（${summary.count} 人）`}
                </p>
                {raterList}
            </div>
        )
    }

    return (
        <div>
            <p className="rate-overall">
                <strong>{summary.overallAvg.toFixed(1)}</strong> / 10 · {summary.count}{' '}
                人評分
            </p>
            {detailed && (
                <div className="rate-grid">
                    {RATING_FIELDS.map((field) => {
                        const value = summary.avgs[field.key]
                        return (
                            <div className="rate-grid-item" key={field.key}>
                                <span>
                                    {field.label}
                                    {RATING_HINTS_BY_KEY[field.key] && (
                                        <InfoHint text={RATING_HINTS_BY_KEY[field.key]} />
                                    )}
                                </span>
                                <strong>{value == null ? '累積中' : value.toFixed(1)}</strong>
                            </div>
                        )
                    })}
                </div>
            )}
            {raterList}
        </div>
    )
}

export default function RatingSection({
    bggName,
    api,
    beforeSave,
    onReward,
    hideCommunity = false,
    requireFull = false,
    flow,
}: {
    bggName: string
    api: RatingsApi
    // 選填：儲存前的確認（回傳 false 就不儲存），「我的評分」頁對還沒玩過的遊戲用
    beforeSave?: () => Promise<boolean>
    // 選填：有傳的話，得點與自動 +1 已玩的說明交給外面顯示（報到流程用），不彈出這裡的視窗
    onReward?: (lines: string[]) => void
    // 選填：不顯示「大家的評分」摘要（報到流程用）
    hideCommunity?: boolean
    // 選填：不管有沒有集點，七項都必填（今日遊玩任務用）
    requireFull?: boolean
    // 選填：今日遊玩任務的底部按鈕（上一款／下一款）；有傳就取代「送出評分」「刪除」
    flow?: {
        nextLabel: string
        prevLabel: string
        onPrev: () => void
        onNext: () => void
    }
}) {
    const mine = api.getMine(bggName)
    const [draft, setDraft] = useState<Draft>(() => toDraft(mine))
    const loyalty = useMyLoyalty()
    const session = useSession()
    const [reward, setReward] = useState<string[] | null>(null)

    const isGuest = api.status === 'guest'
    const canEdit = api.status === 'ready' && !api.busy
    const dirty = !sameAsSaved(draft, mine)
    const requiredDone = draft.overall != null && draft.scores.keep != null
    const vip = useVip()

    const firstTime = api.status === 'ready' && !api.hasAny
    const missingLabels = [
        ...(draft.overall == null ? ['整體評分'] : []),
        ...RATING_FIELDS.filter((f) => draft.scores[f.key] == null).map((f) => f.label),
    ]
    const complete = missingLabels.length === 0

    // 這款遊戲是不是「我出席、還沒集到點」的聚會指定遊戲：是的話，七項填完整才能送出
    const isFull = (name: string) => {
        const m = api.getMine(name)
        return !!m && m.overall > 0 && RATING_FIELDS.every((f) => m[f.key] != null)
    }
    const today = todayLocal()
    const attended = new Set(loyalty.days.map((day) => day.date))
    const stamped = new Set(loyalty.days.filter((day) => day.qualified).map((day) => day.date))
    const voucherDays = new Set(
        loyalty.redemptions.flatMap((item) => (item.usedOn ? [item.usedOn] : [])),
    )
    const needFull =
        requireFull ||
        loyalty.gatherings.some(
        (item) =>
            item.date <= today &&
            item.games.includes(bggName) &&
            attended.has(item.date) &&
            !stamped.has(item.date) &&
            !voucherDays.has(item.date) &&
            !loyalty.gatherings
                .filter((other) => other.date === item.date)
                .some((other) => other.games.some(isFull)),
    )
    const savingBlocked = loyalty.loading || (needFull && !complete)
    const labelStyle = (empty: boolean) =>
        needFull && empty ? { color: '#b5483a', fontWeight: 700 } : undefined

    function setOverall(value: number) {
        setDraft((d) => ({ ...d, overall: value }))
    }

    function setScore(key: RatingKey, value: number) {
        setDraft((d) => ({
            ...d,
            // 再按一次同一個分數＝清空（只有選填項目可以清空）
            scores: {
                ...d.scores,
                [key]: key !== 'keep' && d.scores[key] === value ? null : value,
            },
        }))
    }

    async function handleSave(): Promise<boolean> {
        if (draft.overall == null || draft.scores.keep == null) return false
        if (needFull && !complete) return false
        if (beforeSave && !(await beforeSave())) return false
        const overall = draft.overall
        const userId = session?.user?.id ?? null

        // 這次儲存會讓這款第一次「七項完整」：之後要告訴使用者得點與自動記已玩
        const becomesComplete = complete && !isFull(bggName)
        let beforeLoyalty: LoyaltySnapshot | null = null
        let beforeCount: number | null = null
        if (becomesComplete && userId) {
            const [loyaltyBefore, countBefore] = await Promise.all([
                readLoyalty(),
                countSessions(userId, bggName),
            ])
            beforeLoyalty = loyaltyBefore
            beforeCount = countBefore
        }

        const ok = await api.saveRating(bggName, { overall, ...draft.scores })
        if (!ok || !becomesComplete || !userId) return ok

        const [afterLoyalty, afterCount] = await Promise.all([
            readLoyalty(),
            countSessions(userId, bggName),
        ])
        const lines: string[] = []
        const pointLine = describePoints(beforeLoyalty, afterLoyalty)
        if (pointLine) lines.push(pointLine)
        if (beforeCount != null && afterCount != null && afterCount > beforeCount) {
            const date = await latestPlayedOn(userId, bggName)
            lines.push(
                `這款遊戲的已玩次數已自動 +1${
                    date ? `，記錄日期：${date.replaceAll('-', '/')}（聚會當天）` : ''
                }。`,
            )
            announcePlayed([bggName])
        }
        loyalty.reload()
        if (lines.length > 0) {
            if (onReward) onReward(lines)
            else setReward(lines)
        }
        return true
    }

    // 今日遊玩任務：沒送出的先送出（成功才往下），已送出的直接往下
    async function handleFlowNext() {
        if (!flow || !complete) return
        if (dirty && !(await handleSave())) return
        flow.onNext()
    }

    async function handleDelete() {
        if (!(await askConfirm('確定要刪除你對這款遊戲的評分嗎？'))) return
        if (await api.deleteRating(bggName)) {
            setDraft(toDraft(null))
        }
    }

    if (vip.checked && !vip.isVip) {
        return (
            <div className="rate-section">
                <VipLock feature="評分" />
            </div>
        )
    }

    return (
        <div className="rate-section">
            {!hideCommunity && (
                <div>
                    <p className="rate-subtitle">大家的評分</p>
                    <CommunitySummary bggName={bggName} api={api} detailed />
                </div>
            )}

            <div>
                <p className="rate-subtitle">我的評分</p>

                {isGuest && <p className="rate-note">登入後即可評分</p>}
                {api.status === 'loading' && <p className="rate-note">讀取中…</p>}
                {api.status === 'error' && (
                    <p className="rate-note">讀取評分失敗，請重新整理頁面。</p>
                )}

                {api.status === 'ready' && (
                    <>
                        <p className="rate-label">整體評分（1～10，必填）</p>
                        <div className="rate-scale rate-scale-10">
                            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    className={draft.overall === n ? 'is-selected' : ''}
                                    aria-pressed={draft.overall === n}
                                    disabled={!canEdit}
                                    onClick={() => setOverall(n)}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>

                        <p className="rate-label" style={labelStyle(draft.scores.keep == null)}>
                            {KEEP_LABEL}（1～5，必填）
                            <HintFor hintKey="keep" expanded={firstTime} />
                        </p>
                        <div className="rate-scale rate-scale-5">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    className={draft.scores.keep === n ? 'is-selected' : ''}
                                    aria-pressed={draft.scores.keep === n}
                                    disabled={!canEdit}
                                    onClick={() => setScore('keep', n)}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>

                        {OPTIONAL_FIELDS.map((field) => (
                                <div className="rate-row" key={field.key}>
                                    <p
                                        className="rate-label"
                                        style={labelStyle(draft.scores[field.key] == null)}
                                    >
                                        {field.label}
                                        {needFull ? '（集點必填，1～5）' : '（選填，1～5）'}
                                        <HintFor hintKey={field.key} expanded={firstTime} />
                                    </p>
                                    <div className="rate-scale rate-scale-5">
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <button
                                                key={n}
                                                type="button"
                                                className={
                                                    draft.scores[field.key] === n ? 'is-selected' : ''
                                                }
                                                aria-pressed={draft.scores[field.key] === n}
                                                disabled={!canEdit}
                                                onClick={() => setScore(field.key, n)}
                                            >
                                                {n}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}

                        <p className="rate-note" style={{ marginTop: 10 }}>
                            已填 {filledCount(draft)} / 7 項
                            {filledCount(draft) === 7 ? '（完整評分）' : ''}
                        </p>
                        {needFull && !complete && (
                            <p className="rate-note" style={{ color: '#b5483a', fontWeight: 700 }}>
                                {flow
                                    ? '此項為必填，請完成評分。還沒填：'
                                    : '這款是你出席聚會的遊戲，七項都填完才能送出並得到點數。還沒填：'}
                                {missingLabels.join('、')}
                            </p>
                        )}

                        {flow && mine && complete && !dirty && (
                            <p className="rate-note">
                                這是你之前的評分，沒問題可以直接按「{flow.nextLabel}」，想調整也可以改完再按。
                            </p>
                        )}

                        {flow ? (
                            <div className="tf-flow-actions">
                                <button
                                    type="button"
                                    className="tf-prev"
                                    disabled={api.busy}
                                    onClick={flow.onPrev}
                                >
                                    {flow.prevLabel}
                                </button>
                                <button
                                    type="button"
                                    className="tf-next"
                                    disabled={!canEdit || !complete || savingBlocked}
                                    onClick={() => void handleFlowNext()}
                                >
                                    {api.busy ? '處理中…' : flow.nextLabel}
                                </button>
                            </div>
                        ) : (
                            <div className="rate-actions">
                                <button
                                    type="button"
                                    className="rate-save"
                                    disabled={!canEdit || !requiredDone || !dirty || savingBlocked}
                                    onClick={handleSave}
                                >
                                    {api.busy ? '處理中…' : mine ? '更新評分' : '送出評分'}
                                </button>
                                {mine && (
                                    <button
                                        type="button"
                                        className="rate-delete"
                                        disabled={!canEdit}
                                        onClick={handleDelete}
                                    >
                                        刪除我的評分
                                    </button>
                                )}
                            </div>
                        )}
                        <p className="rate-note">
                            公開的只有彙總平均，你個別的評分只有你自己看得到。
                        </p>
                    </>
                )}
            </div>
            {reward &&
                createPortal(
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="評分完成"
                        onClick={() => setReward(null)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 100000,
                            background: 'rgba(0,0,0,0.45)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 16,
                        }}
                    >
                        <div
                            onClick={(event) => event.stopPropagation()}
                            style={{
                                background: '#fffdf7',
                                borderRadius: 16,
                                padding: '20px 18px',
                                maxWidth: 360,
                                width: '100%',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
                            }}
                        >
                            <h3 style={{ margin: '0 0 10px', fontSize: '1.1rem' }}>評分完成 🎉</h3>
                            {reward.map((line) => (
                                <p key={line} style={{ margin: '6px 0', lineHeight: 1.6 }}>
                                    {line}
                                </p>
                            ))}
                            <button
                                type="button"
                                onClick={() => setReward(null)}
                                style={{
                                    marginTop: 12,
                                    width: '100%',
                                    padding: '10px',
                                    border: 'none',
                                    borderRadius: 10,
                                    background: '#4a7c59',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                }}
                            >
                                知道了
                            </button>
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    )
}