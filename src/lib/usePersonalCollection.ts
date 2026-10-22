import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'
import { useSession } from './useSession'

export type PersonalEntry = {
  wantToPlay: boolean
  played: boolean
  note: string
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
}

const STORAGE_KEY = 'boardgame-personal-collection'
const TABLE = 'user_game_status'
const NOTE_MAX = 500

const EMPTY_ENTRY: PersonalEntry = {
  wantToPlay: false,
  played: false,
  note: '',
}

function isEmptyEntry(entry: PersonalEntry): boolean {
  return !entry.wantToPlay && !entry.played && entry.note === ''
}

function normalizeEntry(entry: PersonalEntry): PersonalEntry {
  return { ...entry, note: entry.note.slice(0, NOTE_MAX) }
}

// 回傳新的收藏；三項都沒有內容時，就不留紀錄
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
      .select('bgg_name, want_to_play, played, note')
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
          next[row.bgg_name] = {
            wantToPlay: row.want_to_play,
            played: row.played,
            note: row.note,
          }
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
    (bggName: string, changes: Partial<PersonalEntry>) => {
      // 訪客：只改本機
      if (!userId) {
        setLocal((current) =>
          withEntry(
            current,
            bggName,
            normalizeEntry({ ...EMPTY_ENTRY, ...current[bggName], ...changes }),
          ),
        )
        return
      }

      // 登入：雲端還沒讀完就不能改，避免蓋掉雲端資料
      if (status !== 'ready') return

      const previous = cloudRef.current[bggName] ?? EMPTY_ENTRY
      const merged = normalizeEntry({ ...previous, ...changes })

      // 先更新畫面，再寫雲端；失敗時還原
      cloudRef.current = withEntry(cloudRef.current, bggName, merged)
      setCloud(cloudRef.current)

      void (async () => {
        const { error } = isEmptyEntry(merged)
          ? await supabase
              .from(TABLE)
              .delete()
              .eq('user_id', userId)
              .eq('bgg_name', bggName)
          : await supabase.from(TABLE).upsert(
              {
                user_id: userId,
                bgg_name: bggName,
                want_to_play: merged.wantToPlay,
                played: merged.played,
                note: merged.note,
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

  // 兩邊聯集：想玩／已玩任一邊有勾就有；備註雲端已有就保留雲端的
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