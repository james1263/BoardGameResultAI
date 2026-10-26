import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useSession } from './useSession'
import { VIP_CHANGED_EVENT } from './useVip'

export type RatingKey =
    | 'like'
    | 'playerImpact'
    | 'communication'
    | 'change'
    | 'unique'
    | 'keep'

export const RATING_FIELDS: { key: RatingKey; label: string }[] = [
    { key: 'like', label: '喜歡度' },
    { key: 'playerImpact', label: '玩家影響性' },
    { key: 'communication', label: '溝通性' },
    { key: 'change', label: '變化性' },
    { key: 'unique', label: '獨特性' },
    { key: 'keep', label: '適合留下來程度' },
]

export type MyRating = { overall: number } & Record<RatingKey, number | null>

export type RatingSummary = {
    count: number
    overallAvg: number | null
    avgs: Record<RatingKey, number | null>
}

export type RatingsStatus = 'guest' | 'loading' | 'ready' | 'error'

const TABLE = 'game_ratings'

const SCORE_COLUMNS: Record<RatingKey, string> = {
    like: 'like_score',
    playerImpact: 'player_impact_score',
    communication: 'communication_score',
    change: 'change_score',
    unique: 'unique_score',
    keep: 'keep_score',
}

const AVG_COLUMNS: Record<RatingKey, string> = {
    like: 'like_avg',
    playerImpact: 'player_impact_avg',
    communication: 'communication_avg',
    change: 'change_avg',
    unique: 'unique_avg',
    keep: 'keep_avg',
}

const MY_COLUMNS =
    'bgg_name, overall, like_score, player_impact_score, communication_score, change_score, unique_score, keep_score'

const EMPTY_SUMMARY: RatingSummary = {
    count: 0,
    overallAvg: null,
    avgs: {
        like: null,
        playerImpact: null,
        communication: null,
        change: null,
        unique: null,
        keep: null,
    },
}

type Row = Record<string, unknown>

function num(value: unknown): number | null {
    if (value == null) return null
    const n = Number(value)
    return Number.isFinite(n) ? n : null
}

function rowToMine(row: Row): MyRating {
    const result = { overall: num(row.overall) ?? 0 } as MyRating
    for (const field of RATING_FIELDS) {
        result[field.key] = num(row[SCORE_COLUMNS[field.key]])
    }
    return result
}

function rowToSummary(row: Row): RatingSummary {
    const avgs = { ...EMPTY_SUMMARY.avgs }
    for (const field of RATING_FIELDS) {
        avgs[field.key] = num(row[AVG_COLUMNS[field.key]])
    }
    return {
        count: num(row.rating_count) ?? 0,
        overallAvg: num(row.overall_avg),
        avgs,
    }
}

// 在 Library 呼叫一次：公開彙總（所有人）＋自己的評分（登入後）
export function useGameRatings() {
    const session = useSession()
    const userId = session?.user?.id ?? null

    const [summaries, setSummaries] = useState<Record<string, RatingSummary>>({})
    const [summaryKey, setSummaryKey] = useState(0)
    const [mine, setMine] = useState<Record<string, MyRating>>({})
    const [status, setStatus] = useState<RatingsStatus>('guest')
    const [busy, setBusy] = useState(false)
    const [vipKey, setVipKey] = useState(0)

    // 剛加入 VIP（或被移除）後，重新讀取彙總與自己的評分
    useEffect(() => {
        const handler = () => {
            setSummaryKey((current) => current + 1)
            setVipKey((current) => current + 1)
        }
        window.addEventListener(VIP_CHANGED_EVENT, handler)
        return () => window.removeEventListener(VIP_CHANGED_EVENT, handler)
    }, [])

    // 公開彙總：訪客也讀得到（門檻 5 人由資料庫判斷）
    useEffect(() => {
        let cancelled = false
        supabase.rpc('get_rating_summaries').then(({ data, error }) => {
            if (cancelled) return
            if (error) {
                console.error('讀取評分彙總失敗：', error)
                return
            }
            const map: Record<string, RatingSummary> = {}
            for (const row of (data ?? []) as Row[]) {
                map[String(row.bgg_name)] = rowToSummary(row)
            }
            setSummaries(map)
        })
        return () => {
            cancelled = true
        }
    }, [summaryKey])

    // 自己的評分：登入後讀一次
    useEffect(() => {
        setMine({})
        if (!userId) {
            setStatus('guest')
            return
        }

        let cancelled = false
        setStatus('loading')

        supabase
            .from(TABLE)
            .select(MY_COLUMNS)
            .eq('user_id', userId)
            .then(({ data, error }) => {
                if (cancelled) return
                if (error) {
                    setStatus('error')
                    return
                }
                const map: Record<string, MyRating> = {}
                for (const row of (data ?? []) as Row[]) {
                    map[String(row.bgg_name)] = rowToMine(row)
                }
                setMine(map)
                setStatus('ready')
            })

        return () => {
            cancelled = true
        }
    }, [userId, vipKey])

    const getSummary = useCallback(
        (bggName: string): RatingSummary => summaries[bggName] ?? EMPTY_SUMMARY,
        [summaries],
    )

    const getMine = useCallback(
        (bggName: string): MyRating | null => mine[bggName] ?? null,
        [mine],
    )

    const saveRating = useCallback(
        async (bggName: string, input: MyRating): Promise<boolean> => {
            if (!userId || status !== 'ready') return false
            setBusy(true)

            const payload: Row = {
                user_id: userId,
                bgg_name: bggName,
                overall: input.overall,
            }
            for (const field of RATING_FIELDS) {
                payload[SCORE_COLUMNS[field.key]] = input[field.key]
            }

            const { data, error } = await supabase
                .from(TABLE)
                .upsert(payload, { onConflict: 'user_id,bgg_name' })
                .select(MY_COLUMNS)
                .single()
            setBusy(false)

            if (error || !data) {
                window.alert('儲存失敗：' + (error?.message ?? '請稍後再試'))
                return false
            }

            setMine((current) => ({
                ...current,
                [bggName]: rowToMine(data as Row),
            }))
            setSummaryKey((current) => current + 1)
            return true
        },
        [userId, status],
    )

    const deleteRating = useCallback(
        async (bggName: string): Promise<boolean> => {
            if (!userId) return false
            setBusy(true)
            const { data, error } = await supabase
                .from(TABLE)
                .delete()
                .eq('user_id', userId)
                .eq('bgg_name', bggName)
                .select('bgg_name')
            setBusy(false)

            if (error || !data || data.length === 0) {
                window.alert('刪除失敗：' + (error?.message ?? '找不到這筆評分'))
                return false
            }

            setMine((current) => {
                const next = { ...current }
                delete next[bggName]
                return next
            })
            setSummaryKey((current) => current + 1)
            return true
        },
        [userId],
    )

    return { status, busy, getSummary, getMine, saveRating, deleteRating }
}

export type RatingsApi = ReturnType<typeof useGameRatings>