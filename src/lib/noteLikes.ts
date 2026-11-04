import { supabase } from './supabase'

export type LikeResult = { liked: boolean; count: number }

// 按讚／取消讚。失敗時丟出 Error（訊息是資料庫的錯誤文字）
export async function toggleNoteLike(noteId: string): Promise<LikeResult> {
  const { data, error } = await supabase.rpc('toggle_note_like', { p_note: noteId })
  if (error) throw new Error(error.message)
  const result = (data ?? {}) as Partial<LikeResult>
  return { liked: !!result.liked, count: Number(result.count ?? 0) }
}

export type Liker = { nickname: string; contact_name: string | null }

// 按讚名單（只有管理者）
export async function getNoteLikers(noteId: string): Promise<Liker[]> {
  const { data, error } = await supabase.rpc('admin_get_note_likers', { p_note: noteId })
  if (error) throw new Error(error.message)
  return (data ?? []) as Liker[]
}

export function likeErrorText(message: string): string {
  if (message.includes('own note')) return '不能對自己的留言按讚。'
  if (message.includes('not vip')) return '只有 VIP 可以按讚。'
  if (message.includes('note not found')) return '找不到這則留言，可能已被刪除或隱藏。'
  if (message.includes('not logged in')) return '請先登入。'
  return '按讚失敗：' + message
}
