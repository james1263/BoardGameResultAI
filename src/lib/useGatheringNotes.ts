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

export type GameNote = { gatheringId: string; privateNote: string }

// 我在「這一款遊戲」各場聚會留下的私人心得（只讀，來源是原本的場次心得，不另存副本）
export function useMyGameNotes(bggName: string) {
  const [state, setState] = useState<{
    name: string
    notes: GameNote[]
    error: boolean
  } | null>(null)

  useEffect(() => {
    let cancelled = false
    supabase.rpc('get_my_gathering_notes').then(({ data, error }) => {
      if (cancelled) return
      if (error) {
        console.error('讀取這款遊戲的場次心得失敗：', error)
        setState({ name: bggName, notes: [], error: true })
        return
      }
      const notes = ((data ?? []) as NoteRow[])
        .filter((row) => row.bgg_name === bggName && (row.private_note ?? '').trim() !== '')
        .map((row) => ({
          gatheringId: row.gathering_id,
          privateNote: row.private_note ?? '',
        }))
      setState({ name: bggName, notes, error: false })
    })
    return () => {
      cancelled = true
    }
  }, [bggName])

  const current = state && state.name === bggName ? state : null
  return {
    loading: current === null,
    error: current?.error ?? false,
    notes: current?.notes ?? [],
  }
}

export type MyNoteRow = MyNote & { gatheringId: string; bggName: string }

// 我全部的場次心得（所有聚會、所有遊戲；含私人欄，只有本人讀得到）
export function useAllMyNotes() {
  const [state, setState] = useState<{ rows: MyNoteRow[]; error: boolean } | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    supabase.rpc('get_my_gathering_notes').then(({ data, error }) => {
      if (cancelled) return
      if (error) {
        console.error('讀取我的心得失敗：', error)
        setState({ rows: [], error: true })
        return
      }
      const rows = ((data ?? []) as NoteRow[]).map((row) => ({
        gatheringId: row.gathering_id,
        bggName: row.bgg_name,
        privateNote: row.private_note ?? '',
        publicNote: row.public_note ?? '',
        publicStatus: (row.public_status === 'hidden' ? 'hidden' : 'visible') as
          | 'visible'
          | 'hidden',
      }))
      setState({ rows, error: false })
    })
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])
  return {
    loading: state === null,
    error: state?.error ?? false,
    rows: state?.rows ?? [],
    reload,
  }
}
