import { supabase } from './supabase'

export type RulebookChunk = {
  doc_id: string
  doc_title: string
  doc_kind: string
  doc_lang: string
  page_number: number | null
  section_title: string | null
  content: string
  score: number
}

export async function hasRulebookIndex(bggName: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('rulebook_has_index', {
    p_bgg_name: bggName,
  })
  return !error && data === true
}

// 回傳 null＝不限次數（管理者）；失敗回傳 undefined
export async function getRulebookRemaining(): Promise<number | null | undefined> {
  const { data, error } = await supabase.rpc('rulebook_search_remaining')
  if (error) return undefined
  return data as number | null
}

export async function searchRulebook(
  bggName: string,
  query: string,
): Promise<{ chunks: RulebookChunk[]; error: string }> {
  const { data, error } = await supabase.rpc('search_rulebook_chunks', {
    p_bgg_name: bggName,
    p_query: query,
  })
  if (error) {
    const text = error.message ?? ''
    if (text.includes('DAILY_LIMIT')) {
      return { chunks: [], error: '今天的搜尋次數用完了，台北時間凌晨 0 點重置。' }
    }
    if (text.includes('NOT_VIP')) {
      return { chunks: [], error: '只有 VIP 可以使用規則助手。' }
    }
    if (text.includes('EMPTY_QUERY')) {
      return { chunks: [], error: '請先輸入關鍵字。' }
    }
    return { chunks: [], error: '搜尋失敗，請稍後再試（這次不會扣次數）。' }
  }
  return { chunks: (data ?? []) as RulebookChunk[], error: '' }
}

export async function getIndexedGames(): Promise<string[]> {
  const { data, error } = await supabase.rpc('rulebook_indexed_games')
  if (error || !data) return []
  return data as string[]
}