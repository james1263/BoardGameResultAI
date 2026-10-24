import { useState } from 'react'
import {
  RATING_FIELDS,
  type MyRating,
  type RatingKey,
  type RatingsApi,
} from '../lib/useGameRatings'

type Draft = {
  overall: number | null
  scores: Record<RatingKey, number | null>
}

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

function hasAnyDetail(draft: Draft): boolean {
  return RATING_FIELDS.some((f) => draft.scores[f.key] != null)
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
  const summary = api.getSummary(bggName)

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
                <span>{field.label}</span>
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
  const [showDetail, setShowDetail] = useState(() => hasAnyDetail(toDraft(mine)))

  const isGuest = api.status === 'guest'
  const canEdit = api.status === 'ready' && !api.busy
  const dirty = !sameAsSaved(draft, mine)

  function setOverall(value: number) {
    setDraft((d) => ({ ...d, overall: value }))
  }

  function setScore(key: RatingKey, value: number) {
    setDraft((d) => ({
      ...d,
      // 再按一次同一個分數＝清空（六項選填）
      scores: { ...d.scores, [key]: d.scores[key] === value ? null : value },
    }))
  }

  async function handleSave() {
    if (draft.overall == null) return
    await api.saveRating(bggName, { overall: draft.overall, ...draft.scores })
  }

  async function handleDelete() {
    if (!window.confirm('確定要刪除你對這款遊戲的評分嗎？')) return
    if (await api.deleteRating(bggName)) {
      setDraft(toDraft(null))
      setShowDetail(false)
    }
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

            <button
              type="button"
              className="rate-toggle"
              onClick={() => setShowDetail((open) => !open)}
            >
              {showDetail ? '收合六項細評 ▴' : '填寫六項細評（選填）▾'}
            </button>

            {showDetail &&
              RATING_FIELDS.map((field) => (
                <div className="rate-row" key={field.key}>
                  <p className="rate-label">{field.label}</p>
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

            <div className="rate-actions">
              <button
                type="button"
                className="rate-save"
                disabled={!canEdit || draft.overall == null || !dirty}
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