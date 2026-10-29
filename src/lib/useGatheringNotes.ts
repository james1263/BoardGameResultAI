import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

export type MyNote = {
  privateNote: string
  publicNote: string
  publicStatus: 'visible' | 'hidden'
}

type NoteRow = {
  gathering_id: string
  bgg_name: string
  private_note: string | null
  public_note: string | null
  public_status: string | null
}

// 某一場聚會中，我自己寫的心得（含私人留言），以遊戲 bgg_name 對應
export function useMyGatheringNotes(gatheringId: string | null) {
  const [state, setState] = useState<{
    id: string
    map: Record<string, MyNote>
    error: boolean
  } | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!gatheringId) return
    let cancelled = false
    supabase
      .rpc('get_my_gathering_notes', { p_gathering: gatheringId })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error('讀取場次心得失敗：', error)
          setState({ id: gatheringId, map: {}, error: true })
          return
        }
        const map: Record<string, MyNote> = {}
        for (const row of (data ?? []) as NoteRow[]) {
          map[row.bgg_name] = {
            privateNote: row.private_note ?? '',
            publicNote: row.public_note ?? '',
            publicStatus: row.public_status === 'hidden' ? 'hidden' : 'visible',
          }
        }
        setState({ id: gatheringId, map, error: false })
      })
    return () => {
      cancelled = true
    }
  }, [gatheringId, reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  // 切換場次時，舊場次的結果不會被當成新場次的
  const current = gatheringId !== null && state && state.id === gatheringId ? state : null

  const get = useCallback(
    (bggName: string): MyNote | null => current?.map[bggName] ?? null,
    [current],
  )

  return {
    loading: gatheringId !== null && current === null,
    error: current?.error ?? false,
    get,
    reload,
  }
}

export type NoteStatus = { gameCount: number; doneCount: number }

// 「待填」：我出席過、已經到的場次（最近 30 天），指定遊戲數與我已寫幾款
export function useNoteStatus() {
  const [map, setMap] = useState<Record<string, NoteStatus>>({})
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    supabase.rpc('get_gathering_note_status').then(({ data, error }) => {
      if (cancelled) return
      if (error) {
        console.error('讀取待填狀態失敗：', error)
        return
      }
      const next: Record<string, NoteStatus> = {}
      for (const row of (data ?? []) as {
        gathering_id: string
        game_count: number | string
        done_count: number | string
      }[]) {
        next[row.gathering_id] = {
          gameCount: Number(row.game_count),
          doneCount: Number(row.done_count),
        }
      }
      setMap(next)
    })
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const get = useCallback(
    (gatheringId: string): NoteStatus | null => map[gatheringId] ?? null,
    [map],
  )
  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { get, reload }
}

// 儲存；兩欄都空＝刪除自己的這一則
export async function saveGatheringNote(
  gatheringId: string,
  bggName: string,
  privateNote: string,
  publicNote: string,
): Promise<{ ok: boolean; message: string }> {
  const { error } = await supabase.rpc('save_gathering_note', {
    p_gathering: gatheringId,
    p_bgg_name: bggName,
    p_private: privateNote,
    p_public: publicNote,
  })
  if (!error) return { ok: true, message: '' }

  const text = error.message ?? ''
  if (text.includes('gathering not started')) {
    return { ok: false, message: '這場聚會還沒到，聚會當天或之後才能寫心得。' }
  }
  if (text.includes('not attendee')) {
    return { ok: false, message: '你不在這場聚會的出席名單上，所以不能寫心得。' }
  }
  if (text.includes('game not in gathering')) {
    return {
      ok: false,
      message: '這款不是這場聚會的指定遊戲，請聯絡管理者把它加進去。',
    }
  }
  if (text.includes('too long')) {
    return { ok: false, message: '每一欄最多 200 字。' }
  }
  if (text.includes('not logged in')) {
    return { ok: false, message: '請先登入。' }
  }
  return { ok: false, message: '儲存失敗：' + (text || '請稍後再試。') }
}
