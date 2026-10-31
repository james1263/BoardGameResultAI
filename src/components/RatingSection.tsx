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

type Draft = {
    overall: number | null
    scores: Record<RatingKey, number | null>
}

// 細評收合區：除了「適合留下來程度」以外的五項（選填）
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

function hasOptionalDetail(draft: Draft): boolean {
    return OPTIONAL_FIELDS.some((f) => draft.scores[f.key] != null)
}

function filledCount(draft: Draft): number {
    const detail = RATING_FIELDS.filter((f) => draft.scores[f.key] != null).length
    return detail + (draft.overall != null ? 1 : 0)
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
    const [showDetail, setShowDetail] = useState(() =>
        hasOptionalDetail(toDraft(mine)),
    )

    const isGuest = api.status === 'guest'
    const canEdit = api.status === 'ready' && !api.busy
    const dirty = !sameAsSaved(draft, mine)
    const requiredDone = draft.overall != null && draft.scores.keep != null
    const vip = useVip()

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
        await api.saveRating(bggName, { overall: draft.overall, ...draft.scores })
    }

    async function handleDelete() {
        if (!(await askConfirm('確定要刪除你對這款遊戲的評分嗎？'))) return
        if (await api.deleteRating(bggName)) {
            setDraft(toDraft(null))
            setShowDetail(false)
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

                        <p className="rate-label">
                            {KEEP_LABEL}（1～5，必填）
                            <InfoHint text={RATING_HINTS_BY_KEY.keep} />
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

                        <button
                            type="button"
                            className="rate-toggle"
                            onClick={() => setShowDetail((open) => !open)}
                        >
                            {showDetail ? '收合其他五項細評 ▴' : '填寫其他五項細評（選填）▾'}
                        </button>

                        {showDetail &&
                            OPTIONAL_FIELDS.map((field) => (
                                <div className="rate-row" key={field.key}>
                                    <p className="rate-label">
                                        {field.label}
                                        {RATING_HINTS_BY_KEY[field.key] && (
                                            <InfoHint text={RATING_HINTS_BY_KEY[field.key]} />
                                        )}
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

                        <div className="rate-actions">
                            <button
                                type="button"
                                className="rate-save"
                                disabled={!canEdit || !requiredDone || !dirty}
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