import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

export const ERRATA_MAX_TITLE = 60
export const ERRATA_MAX_CONTENT = 1200
export const ERRATA_MAX_SOURCE = 100
export const ERRATA_MAX_PAGE = 30
export const ERRATA_MAX_REASON = 100

export type Errata = {
  id: string
  title: string
  content: string
  source_note: string
  updated_at: string
  // 以下欄位由新版資料庫函式回傳；舊版沒有時視為「管理者記錄、已核准」
  status?: 'pending' | 'approved' | 'rejected'
  from_player?: boolean
  page_ref?: string
  verified?: boolean
  reject_reason?: string
  is_mine?: boolean
}

export type PendingErrata = {
  id: string
  bgg_name: string
  game_name: string | null
  title: string
  content: string
  source_note: string
  page_ref: string
  verified: boolean
  nickname: string
  contact_name: string
  created_at: string
}

// 讀取某款遊戲的玩錯紀錄（VIP／管理者）
export function useGameErrata(bggName: string, enabled: boolean) {
  const [items, setItems] = useState<Errata[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!enabled || !bggName) {
      setItems([])
      setError('')
      return
    }
    let cancelled = false
    setLoading(true)
    supabase
      .rpc('get_game_errata', { p_bgg_name: bggName })
      .then(({ data, error: rpcError }) => {
        if (cancelled) return
        setLoading(false)
        if (rpcError) {
          setError('讀取玩錯紀錄失敗')
          setItems([])
          return
        }
        setError('')
        setItems((data ?? []) as Errata[])
      })
    return () => {
      cancelled = true
    }
  }, [bggName, enabled, tick])

  const reload = useCallback(() => setTick((n) => n + 1), [])
  return { items, loading, error, reload }
}

// 規則助手：搜尋玩錯紀錄（不扣每日次數，失敗就當作沒有）
export async function searchErrata(
  bggName: string,
  query: string,
): Promise<{ items: Errata[]; error: string }> {
  const { data, error } = await supabase.rpc('search_game_errata', {
    p_bgg_name: bggName,
    p_query: query,
  })
  if (error) return { items: [], error: '搜尋玩錯紀錄失敗' }
  return { items: (data ?? []) as Errata[], error: '' }
}

// 管理者：新增或修改（id 為 null＝新增）。成功回傳空字串，失敗回傳說明
export async function saveErrata(input: {
  id: string | null
  bggName: string
  title: string
  content: string
  sourceNote: string
}): Promise<string> {
  const { error } = await supabase.rpc('admin_save_game_errata', {
    p_id: input.id,
    p_bgg_name: input.bggName,
    p_title: input.title,
    p_content: input.content,
    p_source: input.sourceNote,
  })
  if (!error) return ''
  const text = error.message ?? ''
  if (text.includes('too long')) return '標題、內容或來源說明太長。'
  if (text.includes('empty')) return '請填寫遊戲、標題與內容。'
  if (text.includes('not found')) return '找不到這筆紀錄，可能已被刪除。'
  if (text.includes('not admin')) return '只有管理者可以儲存。'
  return '儲存失敗：' + text
}

export async function deleteErrata(id: string): Promise<string> {
  const { error } = await supabase.rpc('admin_delete_game_errata', {
    p_id: id,
  })
  if (!error) return ''
  return '刪除失敗：' + (error.message ?? '')
}

function errataErrorText(text: string): string {
  if (text.includes('too many pending')) return '這款遊戲你已有 3 則審核中的投稿，請等管理者審核後再投。'
  if (text.includes('too many')) return '這款遊戲你的投稿已達 10 則上限，可以刪除舊的再投。'
  if (text.includes('too long')) return '有欄位太長了，請縮短。'
  if (text.includes('empty')) return '問題與答案都要填。'
  if (text.includes('game not found')) return '找不到這款遊戲。'
  if (text.includes('not found')) return '找不到這筆投稿，可能已被審核或刪除。'
  if (text.includes('reason required')) return '退回時請寫原因。'
  if (text.includes('not vip')) return '只有 VIP 可以投稿。'
  if (text.includes('not admin')) return '只有管理者可以審核。'
  return '失敗：' + text
}

// VIP：投稿或修改自己審核中／被退回的投稿（id 為 null＝新增）。成功回傳空字串
export async function submitErrata(input: {
  id: string | null
  bggName: string
  title: string
  content: string
  sourceNote: string
  pageRef: string
  verified: boolean
}): Promise<string> {
  const { error } = await supabase.rpc('submit_game_errata', {
    p_id: input.id,
    p_bgg_name: input.bggName,
    p_title: input.title,
    p_content: input.content,
    p_source: input.sourceNote,
    p_page: input.pageRef,
    p_verified: input.verified,
  })
  return error ? errataErrorText(error.message ?? '') : ''
}

// VIP：刪除自己審核中／被退回的投稿
export async function deleteMyErrata(id: string): Promise<string> {
  const { error } = await supabase.rpc('delete_my_game_errata', { p_id: id })
  return error ? errataErrorText(error.message ?? '') : ''
}

// 管理者：核准或退回（退回要寫原因）
export async function reviewErrata(
  id: string,
  approve: boolean,
  reason: string,
): Promise<string> {
  const { error } = await supabase.rpc('admin_review_game_errata', {
    p_id: id,
    p_approve: approve,
    p_reason: reason,
  })
  return error ? errataErrorText(error.message ?? '') : ''
}

// 管理者：所有遊戲的待審投稿
export function usePendingErrata(enabled: boolean) {
  const [items, setItems] = useState<PendingErrata[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setLoading(true)
    supabase.rpc('admin_get_pending_errata').then(({ data, error: rpcError }) => {
      if (cancelled) return
      setLoading(false)
      if (rpcError) {
        setError('讀取待審投稿失敗：' + (rpcError.message ?? ''))
        setItems([])
        return
      }
      setError('')
      setItems((data ?? []) as PendingErrata[])
    })
    return () => {
      cancelled = true
    }
  }, [enabled, tick])

  const reload = useCallback(() => setTick((n) => n + 1), [])
  return { items, loading, error, reload }
}
