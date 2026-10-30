import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

export type BoardNote = {
  id: string
  nickname: string
  content: string
  isMine: boolean
  postedOn: string // YYYY-MM-DD，沒有時為空字串
}

// 自己在這款遊戲「別處玩過」類型的留言（可編輯；含被隱藏的）
export type MyNote = {
  id: string
  content: string
  hidden: boolean
}

export const MAX_NOTES_PER_GAME = 10

type PublicRow = {
  id: string
  nickname: string
  content: string
  is_mine: boolean
  posted_on: string | null
}
type HiddenRow = { id: string; nickname: string; content: string }
type MineRow = { id: string; content: string; status: string }

function explain(message: string): string {
  if (message.includes('not played')) return '請先標記已玩或評分這款，才能留言。'
  if (message.includes('too long')) return '留言最多 200 字。'
  if (message.includes('too many'))
    return `這款你最多只能留 ${MAX_NOTES_PER_GAME} 則，請先刪除舊的。`
  if (message.includes('empty')) return '請先輸入留言內容。'
  if (message.includes('not vip')) return '只有 VIP 可以留言。'
  if (message.includes('note not found')) return '找不到這則留言，可能已被刪除。'
  return '操作失敗：' + message
}

// 某款遊戲的公開留言（只有 VIP／管理者讀得到；一人可留多則；管理者另外可看到已隱藏的並可隱藏／恢復）
export function useGameNotesBoard(
  bggName: string,
  enabled: boolean,
  isAdmin: boolean,
) {
  const [notes, setNotes] = useState<BoardNote[]>([])
  const [hiddenNotes, setHiddenNotes] = useState<BoardNote[]>([])
  const [myNotes, setMyNotes] = useState<MyNote[]>([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (!enabled) return
    const publicResult = await supabase.rpc('get_public_gathering_notes', {
      p_bgg_name: bggName,
      p_limit: 100,
    })
    if (publicResult.error) {
      setError('讀取留言失敗，請稍後再試。')
      setLoading(false)
      return
    }
    setError('')
    setNotes(
      ((publicResult.data ?? []) as PublicRow[]).map((row) => ({
        id: row.id,
        nickname: row.nickname,
        content: row.content,
        isMine: row.is_mine,
        postedOn: row.posted_on ?? '',
      })),
    )

    const mineResult = await supabase.rpc('get_my_game_notes', {
      p_bgg_name: bggName,
    })
    if (!mineResult.error) {
      setMyNotes(
        ((mineResult.data ?? []) as MineRow[]).map((row) => ({
          id: row.id,
          content: row.content,
          hidden: row.status === 'hidden',
        })),
      )
    }

    if (isAdmin) {
      const hiddenResult = await supabase.rpc('admin_get_hidden_gathering_notes', {
        p_bgg_name: bggName,
      })
      if (!hiddenResult.error) {
        setHiddenNotes(
          ((hiddenResult.data ?? []) as HiddenRow[]).map((row) => ({
            id: row.id,
            nickname: row.nickname,
            content: row.content,
            isMine: false,
            postedOn: '',
          })),
        )
      }
    }
    setLoading(false)
  }, [bggName, enabled, isAdmin])

  useEffect(() => {
    void load()
  }, [load])

  async function setHidden(noteId: string, hide: boolean): Promise<string> {
    setBusyId(noteId)
    const { error: rpcError } = await supabase.rpc('admin_hide_gathering_note', {
      p_note: noteId,
      p_hide: hide,
    })
    setBusyId(null)
    if (rpcError) return '操作失敗：' + rpcError.message
    await load()
    return ''
  }

  // 刪除自己的公開留言（聚會心得的公開欄、遊戲留言都可以）
  async function deleteMine(noteId: string): Promise<string> {
    setBusyId(noteId)
    const { error: rpcError } = await supabase.rpc('delete_my_public_note', {
      p_note: noteId,
    })
    setBusyId(null)
    if (rpcError) return '刪除失敗：' + rpcError.message
    await load()
    return ''
  }

  // 新增一則留言。回傳錯誤訊息，成功回傳空字串
  async function addNote(content: string): Promise<string> {
    setSaving(true)
    const { error: rpcError } = await supabase.rpc('add_game_note', {
      p_bgg_name: bggName,
      p_content: content,
    })
    setSaving(false)
    if (rpcError) return explain(rpcError.message)
    await load()
    return ''
  }

  // 修改自己的一則留言
  async function updateNote(noteId: string, content: string): Promise<string> {
    setBusyId(noteId)
    const { error: rpcError } = await supabase.rpc('update_my_game_note', {
      p_note: noteId,
      p_content: content,
    })
    setBusyId(null)
    if (rpcError) return explain(rpcError.message)
    await load()
    return ''
  }

  return {
    notes,
    hiddenNotes,
    myNotes,
    loading,
    error,
    busyId,
    saving,
    setHidden,
    deleteMine,
    addNote,
    updateNote,
  }
}
