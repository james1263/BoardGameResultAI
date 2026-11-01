import { useState } from 'react'
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
import { useMyLoyalty, todayLocal } from '../lib/useLoyalty'

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

export function CommunitySummary({
    bggName,
    api,
    detailed,
}: {
    bggName: string
    api: RatingsApi
    detailed: boolean
}) {
    const vip = useVip()
    const summary = api.getSummary(bggName)

    if (vip.checked && !vip.isVip) {
        return <VipLock compact feature="大家的評分" />
    }

    if (summary.overallAvg == null) {
        return (
            <p className="rate-note">
                {summary.count === 0
                    ? '還沒有人評分'
                    : `評分累積中（${summary.count} 人）`}
            </p>
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
        </div>
    )
}

export default function RatingSection({
    bggName,
    api,
}: {
    bggName: string
    api: RatingsApi
}) {
    const mine = api.getMine(bggName)
    const [draft, setDraft] = useState<Draft>(() => toDraft(mine))
    const loyalty = useMyLoyalty()

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
    const needFull = loyalty.gatherings.some(
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

    async function handleSave() {
        if (draft.overall == null || draft.scores.keep == null) return
        if (needFull && !complete) return
        await api.saveRating(bggName, { overall: draft.overall, ...draft.scores })
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
            <div>
                <p className="rate-subtitle">大家的評分</p>
                <CommunitySummary bggName={bggName} api={api} detailed />
            </div>

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
                                這款是你出席聚會的遊戲，七項都填完才能送出並得到點數。還沒填：
                                {missingLabels.join('、')}
                            </p>
                        )}

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
                        <p className="rate-note">
                            公開的只有彙總平均，你個別的評分只有你自己看得到。
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}