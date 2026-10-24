import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'
import { useSession } from './useSession'

export type PersonalEntry = {
    wantToPlay: boolean
    played: boolean
    note: string
    playCount: number
}

export type PersonalCollection = Record<string, PersonalEntry>

// guest：未登入　loading：讀取雲端中　ready：可使用　error：讀取失敗
export type CloudStatus = 'guest' | 'loading' | 'ready' | 'error'
export type MergeStatus = 'idle' | 'merging' | 'error'

type StatusRow = {
    bgg_name: string
    want_to_play: boolean
    played: boolean
    note: string
    play_count: number | null
}

const STORAGE_KEY = 'boardgame-personal-collection'
const TABLE = 'user_game_status'
const NOTE_MAX = 500
const PLAY_COUNT_MAX = 999

const EMPTY_ENTRY: PersonalEntry = {
    wantToPlay: false,
    played: false,
    note: '',
    playCount: 0,
}

function clampCount(value: unknown): number {
    const number = typeof value === 'number' ? Math.floor(value) : 0
    if (!Number.isFinite(number)) return 0
    return Math.min(PLAY_COUNT_MAX, Math.max(0, number))
}

function isEmptyEntry(entry: PersonalEntry): boolean {
    return (
        !entry.wantToPlay &&
        !entry.played &&
        entry.note === '' &&
        entry.playCount === 0
    )
}

function normalizeEntry(entry: PersonalEntry): PersonalEntry {
    return {
        ...entry,
        note: entry.note.slice(0, NOTE_MAX),
        playCount: clampCount(entry.playCount),
    }
}

// 回傳新的收藏；四項都沒有內容時，就不留紀錄
function withEntry(
    collection: PersonalCollection,
    bggName: string,
    entry: PersonalEntry,
): PersonalCollection {
    const next = { ...collection }
    if (isEmptyEntry(entry)) {
        delete next[bggName]
    } else {
        next[bggName] = entry
    }
    return next
}

// 以 bggName 當鍵（不用 id，因為 id 會隨資料順序改變）
function loadLocal(): PersonalCollection {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return {}

        const parsed: unknown = JSON.parse(raw)
        if (typeof parsed !== 'object' || parsed === null) return {}

        const result: PersonalCollection = {}
        for (const [key, value] of Object.entries(parsed)) {
            if (typeof value !== 'object' || value === null) continue
            const entry = value as Partial<PersonalEntry>
            const clean = normalizeEntry({
                wantToPlay: entry.wantToPlay === true,
                played: entry.played === true,
                note: typeof entry.note === 'string' ? entry.note : '',
                playCount: clampCount(entry.playCount),
            })
            if (!isEmptyEntry(clean)) result[key] = clean
        }
        return result
    } catch {
        return {}
    }
}

function saveLocal(collection: PersonalCollection) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(collection))
    } catch {
        // 儲存失敗也不影響使用
    }
}

// 勾「已玩」時，如果次數還是 0，就設成 1；其他情況不動次數
function applyPlayedRule(
    previous: PersonalEntry,
    changes: Partial<PersonalEntry>,
    merged: PersonalEntry,
): PersonalEntry {
    if (
        changes.played === true &&
        !previous.played &&
        merged.playCount === 0
    ) {
        return { ...merged, playCount: 1 }
    }
    return merged
}

export function usePersonalCollection() {
    const session = useSession()
    const userId = session?.user?.id ?? null

    // 訪客紀錄（存在這個瀏覽器）與雲端紀錄（登入後使用）
    const [local, setLocal] = useState<PersonalCollection>(loadLocal)
    const [cloud, setCloud] = useState<PersonalCollection>({})
    const [status, setStatus] = useState<CloudStatus>('guest')
    const [reloadKey, setReloadKey] = useState(0)
    const [mergeStatus, setMergeStatus] = useState<MergeStatus>('idle')
    const [declinedUserId, setDeclinedUserId] = useState<string | null>(null)
    const [errorMessage, setErrorMessage] = useState('')
    const cloudRef = useRef<PersonalCollection>({})

    // 只有未登入時才寫 localStorage，避免登出後在共用電腦留下別人的紀錄
    useEffect(() => {
        if (!userId) saveLocal(local)
    }, [local, userId])

    // 登入後讀取自己的雲端紀錄
    useEffect(() => {
        if (!userId) {
            cloudRef.current = {}
            setCloud({})
            setStatus('guest')
            return
        }

        let cancelled = false
        setStatus('loading')

        supabase
            .from(TABLE)
            .select('bgg_name, want_to_play, played, note, play_count')
            .eq('user_id', userId)
            .then(({ data, error }) => {
                if (cancelled) return
                if (error) {
                    setStatus('error')
                    setErrorMessage('讀取你的紀錄失敗，請按「重試」。')
                    return
                }

                const next: PersonalCollection = {}
                for (const row of (data ?? []) as StatusRow[]) {
                    const entry: PersonalEntry = {
                        wantToPlay: row.want_to_play,
                        played: row.played,
                        note: row.note,
                        playCount: clampCount(row.play_count),
                    }
                    if (isEmptyEntry(entry)) continue
                    next[row.bgg_name] = entry
                }
                cloudRef.current = next
                setCloud(next)
                setStatus('ready')
            })

        return () => {
            cancelled = true
        }
    }, [userId, reloadKey])

    const entries = userId ? cloud : local
    const canEdit = !userId || status === 'ready'

    const getEntry = useCallback(
        (bggName: string): PersonalEntry => entries[bggName] ?? EMPTY_ENTRY,
        [entries],
    )

    const updateEntry = useCallback(
        (
            bggName: string,
            changes: Partial<PersonalEntry>,
            options?: { skipPlayedRule?: boolean },
        ) => {
            // 訪客：只改本機
            if (!userId) {
                setLocal((current) => {
                    const previous = current[bggName] ?? EMPTY_ENTRY
                    const merged = normalizeEntry({ ...previous, ...changes })
                    return withEntry(
                        current,
                        bggName,
                        options?.skipPlayedRule
                            ? merged
                            : applyPlayedRule(previous, changes, merged),
                    )
                })
                return
            }

            // 登入：雲端還沒讀完就不能改，避免蓋掉雲端資料
            if (status !== 'ready') return

            const previous = cloudRef.current[bggName] ?? EMPTY_ENTRY
            const base = normalizeEntry({ ...previous, ...changes })
            const merged = options?.skipPlayedRule
                ? base
                : applyPlayedRule(previous, changes, base)

            // 先更新畫面，再寫雲端；失敗時還原
            cloudRef.current = withEntry(cloudRef.current, bggName, merged)
            setCloud(cloudRef.current)

            void (async () => {
                const { error } = await supabase.from(TABLE).upsert(
                    {
                        user_id: userId,
                        bgg_name: bggName,
                        want_to_play: merged.wantToPlay,
                        played: merged.played,
                        note: merged.note,
                        play_count: merged.playCount,
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: 'user_id,bgg_name' },
                )

                if (error) {
                    cloudRef.current = withEntry(cloudRef.current, bggName, previous)
                    setCloud(cloudRef.current)
                    setErrorMessage('儲存失敗，已還原這一筆的變更，請稍後再試。')
                }
            })()
        },
        [userId, status],
    )
    
    // 首次合併：本機有紀錄、雲端讀取完成、而且使用者還沒選「不加入」
    const localCount = Object.keys(local).length
    const needsMerge =
        !!userId &&
        status === 'ready' &&
        localCount > 0 &&
        declinedUserId !== userId

    // 兩邊聯集：想玩／已玩任一邊有勾就有；備註雲端已有就保留雲端的；次數取較大值
    const mergeLocalIntoCloud = useCallback(async (): Promise<boolean> => {
        if (!userId) return false
        setMergeStatus('merging')

        const merged: PersonalCollection = { ...cloudRef.current }
        for (const [bggName, localEntry] of Object.entries(local)) {
            const cloudEntry = cloudRef.current[bggName]
            merged[bggName] = normalizeEntry({
                wantToPlay: localEntry.wantToPlay || cloudEntry?.wantToPlay === true,
                played: localEntry.played || cloudEntry?.played === true,
                note:
                    cloudEntry && cloudEntry.note !== ''
                        ? cloudEntry.note
                        : localEntry.note,
                playCount: Math.max(
                    localEntry.playCount,
                    cloudEntry?.playCount ?? 0,
                ),
            })
        }

        const now = new Date().toISOString()
        const rows = Object.keys(local)
            .filter((bggName) => !isEmptyEntry(merged[bggName]))
            .map((bggName) => ({
                user_id: userId,
                bgg_name: bggName,
                want_to_play: merged[bggName].wantToPlay,
                played: merged[bggName].played,
                note: merged[bggName].note,
                play_count: merged[bggName].playCount,
                updated_at: now,
            }))

        if (rows.length > 0) {
            const { error } = await supabase
                .from(TABLE)
                .upsert(rows, { onConflict: 'user_id,bgg_name' })

            if (error) {
                // 失敗：保留本機紀錄，允許重試
                setMergeStatus('error')
                setErrorMessage('同步失敗，你的本機紀錄還在，請按「重試」。')
                return false
            }
        }

        // 雲端寫入成功，才清掉本機紀錄
        cloudRef.current = merged
        setCloud(merged)
        setLocal({})
        saveLocal({})
        setMergeStatus('idle')
        return true
    }, [userId, local])

    const declineMerge = useCallback(() => {
        setDeclinedUserId(userId)
    }, [userId])

    const reload = useCallback(() => {
        setErrorMessage('')
        setReloadKey((current) => current + 1)
    }, [])

    const clearError = useCallback(() => setErrorMessage(''), [])

    return {
        entries,
        getEntry,
        updateEntry,
        isLoggedIn: !!userId,
        canEdit,
        status,
        errorMessage,
        clearError,
        reload,
        needsMerge,
        localCount,
        mergeStatus,
        mergeLocalIntoCloud,
        declineMerge,
    }
}