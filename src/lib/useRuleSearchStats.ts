import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export type HotKeyword = { keyword: string; count: number }
export type RuleStatGame = { bggName: string; count: number }
export type RuleStatKeyword = { keyword: string; count: number; games: number }
export type RuleStatPeriod = 'all' | 'month' | 'quarter' | 'year'

// 單款遊戲的熱搜關鍵字（規則助手首頁用；失敗就當作沒有）
export function useHotKeywords(bggName: string, enabled: boolean) {
  const [items, setItems] = useState<HotKeyword[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!enabled || !bggName) {
      setItems([])
      setLoaded(false)
      return
    }
    let cancelled = false
    setLoaded(false)
    supabase
      .rpc('get_rule_hot_keywords', { p_bgg_name: bggName, p_days: 30, p_limit: 5 })
      .then(({ data, error }) => {
        if (cancelled) return
        setLoaded(true)
        if (error) {
          setItems([])
          return
        }
        setItems(
          ((data ?? []) as { keyword: string; search_count: number | string }[]).map((row) => ({
            keyword: row.keyword,
            count: Number(row.search_count),
          })),
        )
      })
    return () => {
      cancelled = true
    }
  }, [bggName, enabled])

  return { items, loaded }
}

// 統計中心「規則助手」頁：最常被問的遊戲、最熱門關鍵字
export function useRuleStats(period: RuleStatPeriod, enabled: boolean) {
  const [games, setGames] = useState<RuleStatGame[]>([])
  const [keywords, setKeywords] = useState<RuleStatKeyword[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setStatus('loading')
    Promise.all([
      supabase.rpc('get_rule_stats_games', { p_period: period }),
      supabase.rpc('get_rule_stats_keywords', { p_period: period }),
    ]).then(([g, k]) => {
      if (cancelled) return
      if (g.error || k.error) {
        setStatus('error')
        return
      }
      setGames(
        ((g.data ?? []) as { bgg_name: string; search_count: number | string }[]).map((row) => ({
          bggName: row.bgg_name,
          count: Number(row.search_count),
        })),
      )
      setKeywords(
        ((k.data ?? []) as {
          keyword: string
          search_count: number | string
          game_count: number | string
        }[]).map((row) => ({
          keyword: row.keyword,
          count: Number(row.search_count),
          games: Number(row.game_count),
        })),
      )
      setStatus('ready')
    })
    return () => {
      cancelled = true
    }
  }, [period, enabled])

  return { games, keywords, status }
}
