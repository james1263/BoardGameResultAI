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

function formatAvg(value: number | null): string {
  return value == null ? '累積中' : value.toFixed(1)
}

export default function RatingSection({
  bggName,
  api,
}: {
  bggName: string
  api: RatingsApi
}) {
  const summary = api.getSummary(bggName)
  const mine = api.getMine(bggName)
  const [draft, setDraft] = useState<Draft>(() => toDraft(mine))

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
    await api.saveRating(bggName, {
      overall: draft.overall,
      ...draft.scores,
    })
  }

  async function handleDelete() {
    if (!window.confirm('確定要刪除你對這款遊戲的評分嗎？')) return
    if (await api.deleteRating(bggName)) setDraft(toDraft(null))
  }

  return (
    <div className="rating-section">
      <div className="rating-community">
        <p className="rating-subtitle">大家的評分</p>
        {summary.overallAvg == null ? (
          <p className="rating-pending">
            {summary.count === 0
              ? '還沒有人評分'
              : `評分累積中（${summary.count} 人）`}
          </p>
        ) : (
          <>
            <p className="rating-overall">
              <strong>{summary.overallAvg.toFixed(1)}</strong>
              <span> / 10 · {summary.count} 人評分</span>
            </p>
            <div className="rating-avg-grid">
              {RATING_FIELDS.map((field) => (
                <div className="rating-avg-item" key={field.key}>
                  <span>{field.label}</span>
                  <strong>{formatAvg(summary.avgs[field.key])}</strong>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="rating-mine">
        <p className="rating-subtitle">我的評分</p>

        {isGuest && <p className="rating-hint">登入後即可評分</p>}
        {api.status === 'loading' && <p className="rating-hint">讀取中…</p>}
        {api.status === 'error' && (
          <p className="rating-hint">讀取評分失敗，請重新整理頁面。</p>
        )}

        {api.status === 'ready' && (
          <>
            <p className="rating-label">整體評分（1～10，必填）</p>
            <div className="rating-scale rating-scale-10">
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

            {RATING_FIELDS.map((field) => (
              <div className="rating-row" key={field.key}>
                <span className="rating-label">{field.label}（選填）</span>
                <div className="rating-scale rating-scale-5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={draft.scores[field.key] === n ? 'is-selected' : ''}
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

            <div className="rating-actions">
              <button
                type="button"
                className="rating-save"
                disabled={!canEdit || draft.overall == null || !dirty}
                onClick={handleSave}
              >
                {api.busy ? '處理中…' : mine ? '更新評分' : '送出評分'}
              </button>
              {mine && (
                <button
                  type="button"
                  className="rating-delete"
                  disabled={!canEdit}
                  onClick={handleDelete}
                >
                  刪除我的評分
                </button>
              )}
            </div>
            <p className="rating-hint">
              公開的只有彙總平均，你個別的評分只有你自己看得到。
            </p>
          </>
        )}
      </div>
    </div>
  )
}