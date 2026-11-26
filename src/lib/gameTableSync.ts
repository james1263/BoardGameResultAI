import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from './supabase'
import { parseRows, type SheetRow } from './scoreSheet'
import {
  ALL_TOOLS,
  clampValue,
  type Draft,
  type GameTableData,
  type TablePlayer,
  type TableTool,
  type ValueMap,
} from './gameTable'

// 遊戲桌同步版（4b-1）：讀 game_tables／game_table_players／game_table_values，
// 寫入一律走資料庫函式（game_table_*），用 Supabase Realtime 讓每支手機即時看到變動。
// 數字（資源、計分、持有）是「先改畫面、再寫資料庫」，連點時只送最新的一次，不會倒退。

export type ValueKind = 'res' | 'score' | 'hold'

type TableRow = {
  id: string
  gathering_id: string
  title: string
  bgg_name: string | null
  phase: string
  closed: boolean
  tools: string[]
  disabled: string[]
  res_rows: unknown
  score_rows: unknown
  hold_sets: string[]
  created_at: string
}
type PlayerRow = { id: string; table_id: string; name: string; user_id: string | null; sort_order: number }
type ValueRow = { table_id: string; player_id: string; kind: ValueKind; item_id: string; value: number }

type Pending = { value: number; table: string; player: string; kind: ValueKind; item: string }

export type SetupPatch = Partial<{
  closed: boolean
  tools: TableTool[]
  disabled: TableTool[]
  resRows: SheetRow[]
  scoreRows: SheetRow[]
  holdSets: string[]
}>

export type RoomTablesApi = {
  tables: GameTableData[]
  loaded: boolean
  error: string
  clearError: () => void
  setValue: (playerId: string, kind: ValueKind, item: string, value: number) => void
  createFromDraft: (d: Draft) => Promise<{ id: string | null; message: string }>
  saveSetup: (t: GameTableData, patch: SetupPatch) => Promise<boolean>
  addPlayer: (tableId: string, name: string, userId: string | null) => Promise<boolean>
  updatePlayer: (p: TablePlayer, patch: { name?: string; userId?: string | null }) => Promise<boolean>
  removePlayer: (playerId: string) => Promise<boolean>
  deleteTable: (tableId: string) => Promise<boolean>
}

function keyOf(player: string, kind: string, item: string): string {
  return `${player}|${kind}|${item}`
}

function explain(message: string): string {
  if (message.includes('table closed')) return '這桌已經結束，不能再改了。'
  if (message.includes('not your slot')) return '這一格不是你的，只有管理者或本人能改。'
  if (message.includes('admin only')) return '只有管理者能做這個操作。'
  if (message.includes('not signed in')) return '請先登入。'
  if (message.includes('too many tables')) return '這場聚會的遊戲桌已達 10 桌上限。'
  if (message.includes('too many players')) return '這桌玩家已達 12 位上限。'
  if (message.includes('user not in gathering')) return '這位不在這場聚會的出席名單上。'
  if (message.includes('bad title')) return '遊戲名稱要 1～40 個字。'
  if (message.includes('bad name')) return '玩家名稱要 1～20 個字。'
  if (message.includes('duplicate key')) return '這個帳號已經綁在這桌的另一格了。'
  return '操作失敗，請稍後再試。'
}

function toolList(raw: unknown): TableTool[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((x): x is TableTool => ALL_TOOLS.includes(x as TableTool))
}

function buildTables(
  tableRows: TableRow[],
  playerRows: PlayerRow[],
  valueRows: Record<string, ValueRow>,
): GameTableData[] {
  const playersBy = new Map<string, PlayerRow[]>()
  for (const p of playerRows) {
    const list = playersBy.get(p.table_id)
    if (list) list.push(p)
    else playersBy.set(p.table_id, [p])
  }
  const valuesBy = new Map<string, ValueRow[]>()
  for (const v of Object.values(valueRows)) {
    const list = valuesBy.get(v.table_id)
    if (list) list.push(v)
    else valuesBy.set(v.table_id, [v])
  }
  return tableRows
    .slice()
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((t): GameTableData => {
      const players: TablePlayer[] = (playersBy.get(t.id) ?? [])
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id))
        .map((p) => ({ id: p.id, name: p.name, left: false, userId: p.user_id, sort: p.sort_order }))
      const res: ValueMap = {}
      const scores: ValueMap = {}
      const holdings: ValueMap = {}
      for (const v of valuesBy.get(t.id) ?? []) {
        if (v.kind === 'hold' && v.value <= 0) continue
        const target = v.kind === 'res' ? res : v.kind === 'score' ? scores : holdings
        const bucket = target[v.player_id] ?? (target[v.player_id] = {})
        bucket[v.item_id] = v.value
      }
      return {
        id: t.id,
        title: t.title,
        bggName: t.bgg_name,
        createdAt: new Date(t.created_at).getTime(),
        phase: t.phase === 'play' ? 'play' : 'setup',
        closed: t.closed,
        tools: toolList(t.tools),
        disabled: toolList(t.disabled),
        players,
        resRows: parseRows(t.res_rows),
        scoreRows: parseRows(t.score_rows),
        res,
        scores,
        holdings,
        holdSets: Array.isArray(t.hold_sets) ? t.hold_sets.filter((x) => typeof x === 'string') : [],
      }
    })
}

export function useRoomTables(gatheringId: string): RoomTablesApi {
  const [tableRows, setTableRows] = useState<TableRow[]>([])
  const [playerRows, setPlayerRows] = useState<PlayerRow[]>([])
  const [valueRows, setValueRows] = useState<Record<string, ValueRow>>({})
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  const pending = useRef(new Map<string, Pending>())
  const idsRef = useRef(new Set<string>())
  const playerTable = useRef(new Map<string, string>())
  const seq = useRef(0)

  useEffect(() => {
    playerTable.current = new Map(playerRows.map((p) => [p.id, p.table_id]))
  }, [playerRows])

  const load = useCallback(async () => {
    const mine = (seq.current += 1)
    const tr = await supabase
      .from('game_tables')
      .select('*')
      .eq('gathering_id', gatheringId)
      .order('created_at', { ascending: true })
    if (mine !== seq.current) return
    if (tr.error) {
      setError('讀取遊戲桌失敗，請稍後再試。')
      setLoaded(true)
      return
    }
    const trs = (tr.data ?? []) as TableRow[]
    const ids = trs.map((t) => t.id)
    let prs: PlayerRow[] = []
    const vmap: Record<string, ValueRow> = {}
    if (ids.length > 0) {
      const pr = await supabase.from('game_table_players').select('*').in('table_id', ids)
      if (mine !== seq.current) return
      if (pr.error) {
        setError('讀取遊戲桌失敗，請稍後再試。')
        setLoaded(true)
        return
      }
      prs = (pr.data ?? []) as PlayerRow[]
      for (let from = 0; ; from += 1000) {
        const vr = await supabase
          .from('game_table_values')
          .select('*')
          .in('table_id', ids)
          .order('player_id')
          .order('kind')
          .order('item_id')
          .range(from, from + 999)
        if (mine !== seq.current) return
        if (vr.error) {
          setError('讀取遊戲桌失敗，請稍後再試。')
          setLoaded(true)
          return
        }
        const rows = (vr.data ?? []) as ValueRow[]
        for (const v of rows) vmap[keyOf(v.player_id, v.kind, v.item_id)] = v
        if (rows.length < 1000) break
      }
    }
    // 還沒送出去的本機數字優先，免得讀回來的舊值蓋掉剛按的
    for (const [key, e] of pending.current) {
      vmap[key] = { table_id: e.table, player_id: e.player, kind: e.kind, item_id: e.item, value: e.value }
    }
    idsRef.current = new Set(ids)
    setTableRows(trs)
    setPlayerRows(prs)
    setValueRows(vmap)
    setError('')
    setLoaded(true)
  }, [gatheringId])

  useEffect(() => {
    void load()
    const channel = supabase
      .channel(`game-tables-${gatheringId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_tables' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const id = (payload.old as { id?: string }).id
          if (!id || !idsRef.current.has(id)) return
          idsRef.current.delete(id)
          setTableRows((cur) => cur.filter((t) => t.id !== id))
          setPlayerRows((cur) => cur.filter((p) => p.table_id !== id))
          setValueRows((cur) => {
            const next: Record<string, ValueRow> = {}
            for (const [k, v] of Object.entries(cur)) if (v.table_id !== id) next[k] = v
            return next
          })
          return
        }
        const row = payload.new as unknown as TableRow
        if (row.gathering_id !== gatheringId) return
        idsRef.current.add(row.id)
        // 用「合併」而不是整列取代：資料庫有時不會把沒改的長欄位再傳一次
        setTableRows((cur) =>
          cur.some((t) => t.id === row.id) ? cur.map((t) => (t.id === row.id ? { ...t, ...row } : t)) : [...cur, row],
        )
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_table_players' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const id = (payload.old as { id?: string }).id
          if (!id) return
          setPlayerRows((cur) => cur.filter((p) => p.id !== id))
          setValueRows((cur) => {
            const next: Record<string, ValueRow> = {}
            for (const [k, v] of Object.entries(cur)) if (v.player_id !== id) next[k] = v
            return next
          })
          return
        }
        const row = payload.new as unknown as PlayerRow
        if (!idsRef.current.has(row.table_id)) return
        setPlayerRows((cur) =>
          cur.some((p) => p.id === row.id) ? cur.map((p) => (p.id === row.id ? { ...p, ...row } : p)) : [...cur, row],
        )
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_table_values' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const old = payload.old as Partial<ValueRow>
          if (!old.player_id || !old.kind || !old.item_id) return
          const key = keyOf(old.player_id, old.kind, old.item_id)
          if (pending.current.has(key)) return
          setValueRows((cur) => {
            if (!(key in cur)) return cur
            const next = { ...cur }
            delete next[key]
            return next
          })
          return
        }
        const row = payload.new as unknown as ValueRow
        if (!idsRef.current.has(row.table_id)) return
        const key = keyOf(row.player_id, row.kind, row.item_id)
        if (pending.current.has(key)) return
        setValueRows((cur) => ({ ...cur, [key]: row }))
      })
      .subscribe((status) => {
        // 連上（或斷線重連）時補讀一次，避免漏掉中間的變動
        if (status === 'SUBSCRIBED') void load()
      })
    function handleVisible() {
      if (document.visibilityState === 'visible') void load()
    }
    document.addEventListener('visibilitychange', handleVisible)
    return () => {
      document.removeEventListener('visibilitychange', handleVisible)
      void supabase.removeChannel(channel)
    }
  }, [gatheringId, load])

  const setValue = useCallback(
    (playerId: string, kind: ValueKind, item: string, value: number) => {
      const tableId = playerTable.current.get(playerId)
      if (!tableId) return
      const v = clampValue(value)
      const key = keyOf(playerId, kind, item)
      setValueRows((cur) => ({
        ...cur,
        [key]: { table_id: tableId, player_id: playerId, kind, item_id: item, value: v },
      }))
      const queued = pending.current.get(key)
      if (queued) {
        queued.value = v
        return
      }
      const entry: Pending = { value: v, table: tableId, player: playerId, kind, item }
      pending.current.set(key, entry)
      void (async () => {
        for (;;) {
          const sent = entry.value
          const res = await supabase.rpc('game_table_set_value', {
            p_player: playerId,
            p_kind: kind,
            p_item: item,
            p_value: sent,
          })
          if (res.error) {
            pending.current.delete(key)
            setError(explain(res.error.message))
            void load()
            return
          }
          if (entry.value === sent) {
            pending.current.delete(key)
            return
          }
        }
      })()
    },
    [load],
  )

  const createFromDraft = useCallback(
    async (d: Draft): Promise<{ id: string | null; message: string }> => {
      const c = await supabase.rpc('game_table_create', {
        p_gathering: gatheringId,
        p_title: d.title.trim(),
        p_bgg: d.bggName,
      })
      if (c.error || typeof c.data !== 'string') {
        return { id: null, message: explain(c.error?.message ?? '') }
      }
      const id = c.data
      let failed = ''
      for (const p of d.players) {
        const r = await supabase.rpc('game_table_add_player', {
          p_table: id,
          p_name: p.name.trim(),
          p_user: p.userId,
        })
        if (r.error) {
          failed = explain(r.error.message)
          break
        }
      }
      if (!failed) {
        const s = await supabase.rpc('game_table_save_setup', {
          p_table: id,
          p_phase: 'play',
          p_closed: false,
          p_tools: d.tools,
          p_disabled: [],
          p_res_rows: d.resRows,
          p_score_rows: d.scoreRows,
          p_hold_sets: [],
        })
        if (s.error) failed = explain(s.error.message)
      }
      if (failed) {
        // 中途失敗：把這桌整個刪掉，不留下半成品
        await supabase.rpc('game_table_delete', { p_table: id })
        return { id: null, message: failed }
      }
      await load()
      return { id, message: '' }
    },
    [gatheringId, load],
  )

  const saveSetup = useCallback(
    async (t: GameTableData, patch: SetupPatch): Promise<boolean> => {
      const next = {
        closed: patch.closed ?? t.closed,
        tools: patch.tools ?? t.tools,
        disabled: patch.disabled ?? t.disabled,
        resRows: patch.resRows ?? t.resRows,
        scoreRows: patch.scoreRows ?? t.scoreRows,
        holdSets: patch.holdSets ?? t.holdSets,
      }
      setTableRows((cur) =>
        cur.map((r) =>
          r.id === t.id
            ? {
                ...r,
                closed: next.closed,
                tools: next.tools,
                disabled: next.disabled,
                res_rows: next.resRows,
                score_rows: next.scoreRows,
                hold_sets: next.holdSets,
              }
            : r,
        ),
      )
      const r = await supabase.rpc('game_table_save_setup', {
        p_table: t.id,
        p_phase: 'play',
        p_closed: next.closed,
        p_tools: next.tools,
        p_disabled: next.disabled,
        p_res_rows: next.resRows,
        p_score_rows: next.scoreRows,
        p_hold_sets: next.holdSets,
      })
      if (r.error) {
        setError(explain(r.error.message))
        void load()
        return false
      }
      return true
    },
    [load],
  )

  const addPlayer = useCallback(
    async (tableId: string, name: string, userId: string | null): Promise<boolean> => {
      const r = await supabase.rpc('game_table_add_player', {
        p_table: tableId,
        p_name: name.trim(),
        p_user: userId,
      })
      if (r.error) {
        setError(explain(r.error.message))
        return false
      }
      await load()
      return true
    },
    [load],
  )

  const updatePlayer = useCallback(
    async (p: TablePlayer, patch: { name?: string; userId?: string | null }): Promise<boolean> => {
      const r = await supabase.rpc('game_table_update_player', {
        p_player: p.id,
        p_name: (patch.name ?? p.name).trim(),
        p_user: patch.userId === undefined ? p.userId : patch.userId,
        p_sort: p.sort,
      })
      if (r.error) {
        setError(explain(r.error.message))
        await load()
        return false
      }
      await load()
      return true
    },
    [load],
  )

  const removePlayer = useCallback(
    async (playerId: string): Promise<boolean> => {
      const r = await supabase.rpc('game_table_remove_player', { p_player: playerId })
      if (r.error) {
        setError(explain(r.error.message))
        return false
      }
      await load()
      return true
    },
    [load],
  )

  const deleteTable = useCallback(
    async (tableId: string): Promise<boolean> => {
      const r = await supabase.rpc('game_table_delete', { p_table: tableId })
      if (r.error) {
        setError(explain(r.error.message))
        return false
      }
      await load()
      return true
    },
    [load],
  )

  const tables = useMemo(() => buildTables(tableRows, playerRows, valueRows), [tableRows, playerRows, valueRows])
  const clearError = useCallback(() => setError(''), [])

  return {
    tables,
    loaded,
    error,
    clearError,
    setValue,
    createFromDraft,
    saveSetup,
    addPlayer,
    updatePlayer,
    removePlayer,
    deleteTable,
  }
}
