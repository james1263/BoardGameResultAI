import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

export type BoardNote = {
  id: string
  nickname: string
  content: string
  isMine: boolean
}

type PublicRow = {
  id: string
  nickname: string
  content: string
  is_mine: boolean
}
type HiddenRow = { id: string; nickname: string; content: string }
type MineRow = { content: string; status: string }

// 某款遊戲的公開留言（只有 VIP／管理者讀得到；管理者另外可看到已隱藏的並可隱藏／恢復）
export function useGameNotesBoard(
  bggName: string,
  enabled: boolean,
  isAdmin: boolean,
) {
  const [notes, setNotes] = useState<BoardNote[]>([])
  const [hiddenNotes, setHiddenNotes] = useState<BoardNote[]>([])
  const [myContent, setMyContent] = useState('')
  const [myHidden, setMyHidden] = useState(false)
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
      })),
    )

    const mineResult = await supabase.rpc('get_my_game_note', {
      p_bgg_name: bggName,
    })
    if (!mineResult.error) {
      const row = ((mineResult.data ?? []) as MineRow[])[0]
      setMyContent(row?.content ?? '')
      setMyHidden(row?.status === 'hidden')
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

  // 儲存自己的留言；空字串＝刪除。回傳錯誤訊息，成功回傳空字串
  async function saveMine(content: string): Promise<string> {
    setSaving(true)
    const { error: rpcError } = await supabase.rpc('save_game_note', {
      p_bgg_name: bggName,
      p_content: content,
    })
    setSaving(false)
    if (rpcError) {
      const text = rpcError.message
      if (text.includes('not played')) return '請先標記已玩或評分這款，才能留言。'
      if (text.includes('too long')) return '留言最多 200 字。'
      if (text.includes('not vip')) return '只有 VIP 可以留言。'
      return '儲存失敗：' + text
    }
    await load()
    return ''
  }

  return {
    notes,
    hiddenNotes,
    myContent,
    myHidden,
    loading,
    error,
    busyId,
    saving,
    setHidden,
    saveMine,
  }
}