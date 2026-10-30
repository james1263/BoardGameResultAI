import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

export type PlannedStatus = 'open' | 'cancelled' | 'converted'

export type PlannedGathering = {
  id: string
  plannedOn: string
  startTime: string | null
  title: string
  note: string
  status: PlannedStatus
  gatheringId: string | null
  games: string[]
  goingCount: number
  iAmGoing: boolean
}

export type PlannedRaw = {
  id: string
  planned_on: string
  start_time: string | null
  title: string
  note: string
  status: string
  gathering_id: string | null
  games: string[] | null
  going_count: number
  i_am_going?: boolean
}

export function toPlanned(row: PlannedRaw): PlannedGathering {
  return {
    id: row.id,
    plannedOn: row.planned_on,
    startTime: row.start_time,
    title: row.title,
    note: row.note ?? '',
    status:
      row.status === 'cancelled' || row.status === 'converted' ? row.status : 'open',
    gatheringId: row.gathering_id,
    games: row.games ?? [],
    goingCount: row.going_count ?? 0,
    iAmGoing: row.i_am_going ?? false,
  }
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

// 例：11/7（六） 19:00（沒填時間就不顯示時間）
export function formatPlannedWhen(iso: string, time: string | null): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  const weekday = WEEKDAYS[new Date(y, m - 1, d).getDay()]
  const clock = time ? ` ${time.slice(0, 5)}` : ''
  return `${m}/${d}（${weekday}）${clock}`
}

export function plannedStatusLabel(status: PlannedStatus): string {
  if (status === 'cancelled') return '已取消'
  if (status === 'converted') return '已轉為正式聚會'
  return '開放登記'
}

export function plannedErrorText(message: string): string {
  if (message.includes('not open')) return '這場聚會已取消或已轉為正式聚會，不能再更改。'
  if (message.includes('expired')) return '這場聚會的日期已經過了。'
  if (message.includes('not vip')) return '只有 VIP 可以登記。'
  if (message.includes('not logged in')) return '請先登入。'
  if (message.includes('not found')) return '找不到這場聚會，可能已被管理者刪除。'
  return '操作失敗：' + message
}

async function fetchUpcoming(): Promise<{ rows: PlannedGathering[]; error: string }> {
  const { data, error } = await supabase.rpc('get_upcoming_gatherings')
  if (error) return { rows: [], error: error.message }
  return { rows: ((data ?? []) as PlannedRaw[]).map(toPlanned), error: '' }
}

// VIP／管理者看的近期聚會；enabled 為 false 時不讀取
export function useUpcomingGatherings(enabled: boolean) {
  const [rows, setRows] = useState<PlannedGathering[]>([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    void fetchUpcoming().then((result) => {
      if (cancelled) return
      setRows(result.rows)
      setError(result.error)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [enabled, reloadKey])

  const reload = useCallback(() => {
    setLoading(true)
    setReloadKey((key) => key + 1)
  }, [])

  // 成功回傳空字串，失敗回傳要顯示的中文訊息
  const setGoing = useCallback(async (id: string, going: boolean): Promise<string> => {
    const { error: rpcError } = await supabase.rpc('set_my_availability', {
      p_planned: id,
      p_going: going,
    })
    if (rpcError) return plannedErrorText(rpcError.message)
    // 先立刻更新畫面，再在背景讀一次最新人數
    setRows((current) =>
      current.map((row) =>
        row.id !== id || row.iAmGoing === going
          ? row
          : {
              ...row,
              iAmGoing: going,
              goingCount: Math.max(0, row.goingCount + (going ? 1 : -1)),
            },
      ),
    )
    const fresh = await fetchUpcoming()
    if (!fresh.error) setRows(fresh.rows)
    return ''
  }, [])

  return { rows, loading, error, reload, setGoing }
}
