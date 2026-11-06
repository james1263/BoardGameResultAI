import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { PENDING_CHANGED_EVENT } from './useAdminPending'

export type SubKind = 'link' | 'glossary'
export type SubStatus = 'pending' | 'approved' | 'rejected'

export type MySubmission = {
  id: string
  kind: SubKind
  bgg_name: string
  game_name: string
  title: string
  value: string
  note: string
  status: SubStatus
  reject_reason: string
  created_at: string
}

export type MyErrataRow = {
  id: string
  bgg_name: string
  game_name: string
  title: string
  status: SubStatus
  reject_reason: string
  updated_at: string
}

export type AdminSubmission = {
  id: string
  kind: SubKind
  bgg_name: string
  game_name: string
  title: string
  value: string
  note: string
  nickname: string
  contact_name: string
  created_at: string
}

export const SUB_LIMITS = { linkTitle: 60, url: 300, zh: 30, en: 60, note: 100 }

function errorText(message: string): string {
  if (message.includes('too many pending')) return '這款遊戲你已經有 3 則待審的投稿，等管理者審核後再投。'
  if (message.includes('too many')) return '你的待審投稿已達 10 則，等管理者審核後再投。'
  if (message.includes('bad url')) return '網址要以 http:// 或 https:// 開頭。'
  if (message.includes('too long')) return '有欄位超過字數上限。'
  if (message.includes('empty')) return '必填欄位不能空白。'
  if (message.includes('game not found')) return '找不到這款遊戲（或這款不開放投稿）。'
  if (message.includes('not vip')) return '只有 VIP 可以投稿。'
  if (message.includes('not logged in')) return '請先登入。'
  if (message.includes('not found')) return '找不到這筆投稿（可能已被審核）。'
  return `操作失敗：${message}`
}

export async function submitRuleSubmission(input: {
  id: string | null
  kind: SubKind
  bggName: string
  title: string
  value: string
  note: string
}): Promise<string | null> {
  const { error } = await supabase.rpc('submit_rule_submission', {
    p_id: input.id,
    p_kind: input.kind,
    p_bgg_name: input.bggName,
    p_title: input.title,
    p_value: input.value,
    p_note: input.note,
  })
  if (error) return errorText(error.message)
  window.dispatchEvent(new Event(PENDING_CHANGED_EVENT))
  return null
}

export async function deleteMySubmission(id: string): Promise<string | null> {
  const { error } = await supabase.rpc('delete_my_rule_submission', { p_id: id })
  if (error) return errorText(error.message)
  window.dispatchEvent(new Event(PENDING_CHANGED_EVENT))
  return null
}

export function useMySubmissions(enabled: boolean) {
  const [subs, setSubs] = useState<MySubmission[]>([])
  const [errata, setErrata] = useState<MyErrataRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    const [a, b] = await Promise.all([
      supabase.rpc('get_my_rule_submissions'),
      supabase.rpc('get_my_errata'),
    ])
    setLoading(false)
    if (a.error || b.error) {
      setError(`讀取投稿失敗：${(a.error ?? b.error)?.message ?? ''}`)
      return
    }
    setError('')
    setSubs((a.data ?? []) as MySubmission[])
    setErrata((b.data ?? []) as MyErrataRow[])
  }, [enabled])

  useEffect(() => {
    void reload()
  }, [reload])

  return { subs, errata, loading, error, reload }
}

export function useAdminSubmissions(enabled: boolean) {
  const [rows, setRows] = useState<AdminSubmission[]>([])
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    if (!enabled) return
    const { data, error: err } = await supabase.rpc('admin_get_rule_submissions')
    if (err) {
      setError(`讀取待審投稿失敗：${err.message}`)
      return
    }
    setError('')
    setRows((data ?? []) as AdminSubmission[])
  }, [enabled])

  useEffect(() => {
    void reload()
  }, [reload])

  return { rows, error, reload }
}

export async function reviewSubmission(id: string, approve: boolean, reason = ''): Promise<string | null> {
  const { error } = await supabase.rpc('admin_review_rule_submission', {
    p_id: id,
    p_approve: approve,
    p_reason: reason,
  })
  if (error) return error.message.includes('reason required') ? '退回要寫原因。' : errorText(error.message)
  window.dispatchEvent(new Event(PENDING_CHANGED_EVENT))
  return null
}
