import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { askConfirm, showNotice } from '../lib/askConfirm'
import { searchRulebook } from '../lib/useRulebookSearch'
import { copyText } from '../lib/aiAnswer'
import '../styles/rb-docs-tidy.css'
import '../styles/errata.css'
import '../styles/glossary-ask.css'
import '../styles/glossary-tabs.css'

type MissRow = {
  bgg_name: string
  zh_term: string
  hit_count: number
  last_seen: string
}

// admin_get_search_misses：含兩種類型（glossary_miss／search_zero_result）與兩種來源（user／admin）
type SearchMissRow = {
  bgg_name: string
  zh_term: string
  kind: string
  source: string
  hit_count: number
  last_seen: string
}

type Candidate = {
  id: string
  bgg_name: string
  zh_term: string
  en_term: string
  pick_count: number
  status: string
}

type Item = { key: string; bgg_name: string; zh_term: string; kind: 'miss' | 'zero'; count: number }

const EXPORT_APPENDIX_LIMIT = 60000

// 附在匯出文字最後，讓 AI 另外輸出可直接貼進詞庫的清單
function exportFooter(game: string): string {
  return [
    '',
    '',
    '【輸出要求】',
    '請在上面的分析之後，另外輸出「可匯入詞庫的清單」：只放你有把握的 A 類（中英對應）與 B 類（同義詞）。',
    `每行一筆，格式固定為：${game}｜中文詞｜對應詞`,
    '不要加編號、標題、說明或程式碼框。太泛用的詞（例如「行動」「能力」）與沒把握的詞請略過。',
  ].join('\n')
}

export default function GlossaryMisses({ onCopied }: { onCopied?: () => void }) {
  const [rows, setRows] = useState<MissRow[]>([])
  const [searchMisses, setSearchMisses] = useState<SearchMissRow[]>([])
  const [cands, setCands] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exportGame, setExportGame] = useState('')
  const [withAppendix, setWithAppendix] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [candBusy, setCandBusy] = useState('')
  const [verify, setVerify] = useState<Record<string, string>>({})
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'miss' | 'cand'>('miss')
  const [showHelp, setShowHelp] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const [missRes, searchRes, candRes] = await Promise.all([
      supabase.rpc('admin_get_glossary_misses', { p_bgg_name: null }),
      supabase.rpc('admin_get_search_misses', { p_bgg_name: null }),
      supabase.rpc('admin_get_term_candidates'),
    ])
    const err = missRes.error ?? searchRes.error ?? candRes.error
    if (err) setError('讀取失敗：' + err.message)
    setRows(missRes.error ? [] : ((missRes.data ?? []) as MissRow[]))
    setSearchMisses(searchRes.error ? [] : ((searchRes.data ?? []) as SearchMissRow[]))
    setCands(candRes.error ? [] : ((candRes.data ?? []) as Candidate[]))
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  // 「找不到英文」與「搜尋零結果」合成一份清單，只顯示次數
  const items = useMemo(() => {
    const list: Item[] = rows.map((r) => ({
      key: 'm|' + r.bgg_name + '|' + r.zh_term,
      bgg_name: r.bgg_name,
      zh_term: r.zh_term,
      kind: 'miss',
      count: r.hit_count,
    }))
    const zero = new Map<string, Item>()
    for (const m of searchMisses) {
      if (m.kind !== 'search_zero_result') continue
      const key = 'z|' + m.bgg_name + '|' + m.zh_term
      const cur = zero.get(key) ?? { key, bgg_name: m.bgg_name, zh_term: m.zh_term, kind: 'zero' as const, count: 0 }
      cur.count += m.hit_count
      zero.set(key, cur)
    }
    return [...list, ...zero.values()]
  }, [rows, searchMisses])

  const exportGames = useMemo(
    () => [...new Set(items.map((i) => i.bgg_name))].sort((a, b) => a.localeCompare(b)),
    [items],
  )
  const pickedGame = exportGames.includes(exportGame) ? exportGame : (exportGames[0] ?? '')
  const shown = items
    .filter((i) => i.bgg_name === pickedGame)
    .sort((a, b) => (a.kind === b.kind ? b.count - a.count : a.kind === 'miss' ? -1 : 1))

  const pendingCands = cands.filter((c) => c.status === 'pending')

  // 呼叫資料庫匯出函式，結尾附上「輸出要求」
  async function buildExport(): Promise<string | null> {
    if (!pickedGame || exporting) return null
    setExporting(true)
    setError('')
    try {
      const { data, error: err } = await supabase.rpc('admin_export_miss_analysis', {
        p_bgg_name: pickedGame,
        p_include_appendix: withAppendix,
        p_appendix_limit: EXPORT_APPENDIX_LIMIT,
      })
      if (err) {
        setError('匯出失敗：' + err.message)
        return null
      }
      if (typeof data !== 'string' || !data) {
        setError('匯出沒有內容。')
        return null
      }
      return data + exportFooter(pickedGame)
    } finally {
      setExporting(false)
    }
  }

  async function copyExport() {
    const text = await buildExport()
    if (!text) return
    if (!(await copyText(text))) {
      setError('複製失敗，請改用「下載 .txt」。')
      return
    }
    await showNotice(
      `已複製《${pickedGame}》的 AI 分析資料（約 ${text.length.toLocaleString()} 字元）。貼給 AI 後，把它最後輸出的清單貼進接下來的「新增詞庫」視窗。`,
    )
    onCopied?.()
  }

  async function downloadExport() {
    const text = await buildExport()
    if (!text) return
    const blob = new Blob(['\ufeff' + text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `miss_analysis_${pickedGame.replace(/[^\w-]+/g, '_')}_${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  async function removeItem(it: Item) {
    if (it.kind === 'miss') {
      const { error: err } = await supabase.rpc('admin_delete_glossary_miss', {
        p_bgg_name: it.bgg_name,
        p_zh_term: it.zh_term,
      })
      if (err) setError('刪除失敗：' + err.message)
      else setRows((prev) => prev.filter((x) => !(x.bgg_name === it.bgg_name && x.zh_term === it.zh_term)))
      return
    }
    const { error: err } = await supabase.rpc('admin_delete_search_miss', {
      p_bgg_name: it.bgg_name,
      p_zh_term: it.zh_term,
      p_kind: 'search_zero_result',
    })
    if (err) {
      setError('刪除失敗：' + err.message)
      return
    }
    setSearchMisses((prev) =>
      prev.filter(
        (x) => !(x.kind === 'search_zero_result' && x.bgg_name === it.bgg_name && x.zh_term === it.zh_term),
      ),
    )
  }

  async function clearKind(kind: 'miss' | 'zero') {
    const text =
      kind === 'miss'
        ? '確定要清空「找不到英文」的所有詞嗎？（不影響詞庫與零結果）'
        : '確定要清空「零結果」的所有詞嗎？（不影響詞庫與找不到英文）'
    if (!(await askConfirm(text))) return
    const { error: err } = await supabase.rpc(kind === 'miss' ? 'admin_clear_glossary_misses' : 'admin_clear_search_misses')
    if (err) setError('清空失敗：' + err.message)
    else if (kind === 'miss') setRows([])
    else setSearchMisses((prev) => prev.filter((x) => x.kind !== 'search_zero_result'))
  }

  // 驗證：用英文詞搜該遊戲規則書，看有沒有段落含這個詞（用管理者身分，不扣次數）
  async function verifyCand(c: Candidate) {
    setVerify((prev) => ({ ...prev, [c.id]: '查詢中…' }))
    const result = await searchRulebook(c.bgg_name, c.en_term)
    const msg = result.error
      ? '查詢失敗'
      : result.chunks.length === 0
        ? '規則書找不到這個英文詞，不建議核准'
        : `規則書有 ${result.chunks.length} 段含這個詞`
    setVerify((prev) => ({ ...prev, [c.id]: msg }))
  }

  // 核准：先寫進詞庫（已確認），成功才把候選標成核准；詞庫寫入失敗就不改狀態
  async function approveCand(c: Candidate) {
    if (candBusy) return
    if (
      !(await askConfirm(
        `要把「${c.zh_term} → ${c.en_term}」寫進《${c.bgg_name}》的詞庫嗎？寫錯可以隨時到「全部詞庫」刪除。`,
      ))
    )
      return
    setCandBusy(c.id)
    setError('')
    try {
      const { error: saveErr } = await supabase.rpc('admin_save_glossary', {
        p_id: null,
        p_bgg_name: c.bgg_name,
        p_zh: c.zh_term,
        p_en: c.en_term,
        p_note: '',
        p_confirmed: true,
      })
      if (saveErr) {
        setError('寫入詞庫失敗：' + saveErr.message)
        return
      }
      const { error: stErr } = await supabase.rpc('admin_set_term_candidate_status', {
        p_id: c.id,
        p_status: 'approved',
      })
      if (stErr) setError('已寫入詞庫，但候選狀態更新失敗：' + stErr.message)
      void load()
    } finally {
      setCandBusy('')
    }
  }

  async function rejectCand(c: Candidate) {
    if (candBusy) return
    setCandBusy(c.id)
    setError('')
    try {
      const { error: stErr } = await supabase.rpc('admin_set_term_candidate_status', {
        p_id: c.id,
        p_status: 'rejected',
      })
      if (stErr) setError('退回失敗：' + stErr.message)
      else setCands((prev) => prev.filter((x) => x.id !== c.id))
    } finally {
      setCandBusy('')
    }
  }

  const candByGame = new Map<string, Candidate[]>()
  for (const c of pendingCands) {
    const list = candByGame.get(c.bgg_name) ?? []
    list.push(c)
    candByGame.set(c.bgg_name, list)
  }

  const helpText =
    tab === 'miss'
      ? '玩家搜尋時「詞庫沒有對應英文」或「完全搜不到」的詞會記在這裡（只記詞與次數，不記是誰；90 天沒再出現會自動清除）。做法：選一款遊戲 → 複製給 AI 分析 → 把 AI 最後輸出的清單貼進上方「＋」的「貼上 AI 回覆」。「找不到英文」是詞庫缺對應詞；「零結果」是整句沒搜到任何規則書段落。'
      : '玩家在規則助手點選「可能的英文詞」並搜尋到結果後，會累積在這裡（不記是誰）。核准前先按「驗證」：規則書找不到這個英文詞就不要核准。核准只是在詞庫多一筆，之後可以到「全部詞庫」刪除。'

  return (
    <div className="gm-box gmt">
      <button type="button" className="gm-btn gmt-toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {open ? '▾' : '▸'} 未命中分析（待處理 {items.length}・候選 {pendingCands.length}）
      </button>

      {open && (
        <>
          <div className="gmt-bar">
            <div className="gmt-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'miss'}
                className={'gmt-tab' + (tab === 'miss' ? ' active' : '')}
                onClick={() => setTab('miss')}
              >
                未命中的詞（{items.length}）
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'cand'}
                className={'gmt-tab' + (tab === 'cand' ? ' active' : '')}
                onClick={() => setTab('cand')}
              >
                英文詞候選（{pendingCands.length}）
              </button>
            </div>
            <button
              type="button"
              className={'gmt-help' + (showHelp ? ' on' : '')}
              aria-label="顯示或隱藏說明"
              aria-pressed={showHelp}
              onClick={() => setShowHelp((v) => !v)}
            >
              ⓘ
            </button>
          </div>
          {showHelp && <p className="gm-hint gmt-hint">{helpText}</p>}
          {loading && <p className="gm-hint">讀取中…</p>}
          {error && <p className="admin-error">{error}</p>}

          {tab === 'miss' && (
            <>
              {exportGames.length === 0 && !loading && <p className="gm-hint">目前沒有未命中的詞。</p>}
              {exportGames.length > 0 && (
                <>
                  <div className="gm-actions">
                    {exportGames.map((game) => (
                      <button
                        key={game}
                        type="button"
                        className={'gm-btn' + (pickedGame === game ? ' primary' : '')}
                        aria-pressed={pickedGame === game}
                        onClick={() => setExportGame(game)}
                      >
                        {game}
                      </button>
                    ))}
                  </div>
                  <div className="gm-actions">
                    <button
                      type="button"
                      className="gm-btn primary"
                      disabled={!pickedGame || exporting}
                      onClick={() => void copyExport()}
                    >
                      {exporting ? '產生中…' : '複製給 AI 分析'}
                    </button>
                    <button
                      type="button"
                      className="gm-btn"
                      disabled={!pickedGame || exporting}
                      onClick={() => void downloadExport()}
                    >
                      下載 .txt
                    </button>
                  </div>
                  <p className="gm-hint">
                    <label>
                      <input
                        type="checkbox"
                        checked={withAppendix}
                        onChange={(event) => setWithAppendix(event.target.checked)}
                      />{' '}
                      附上規則書原文（上限 {EXPORT_APPENDIX_LIMIT.toLocaleString()} 字元）
                    </label>
                  </p>
                  <ul className="gm-list">
                    {shown.map((it) => (
                      <li key={it.key} className="gm-row">
                        <span className="gm-term">{it.zh_term}</span>
                        <span className="gm-count">
                          {it.kind === 'miss' ? '找不到英文' : '零結果'}・{it.count} 次
                        </span>
                        <button
                          type="button"
                          className="gm-x"
                          aria-label={`刪除 ${it.zh_term}`}
                          onClick={() => void removeItem(it)}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="gm-actions">
                    <button type="button" className="gm-btn" onClick={() => void load()}>
                      重新整理
                    </button>
                    <button type="button" className="gm-btn danger" disabled={!rows.length} onClick={() => void clearKind('miss')}>
                      清空找不到英文
                    </button>
                    <button
                      type="button"
                      className="gm-btn danger"
                      disabled={!items.some((i) => i.kind === 'zero')}
                      onClick={() => void clearKind('zero')}
                    >
                      清空零結果
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {tab === 'cand' && (
            <>
              {!loading && pendingCands.length === 0 && <p className="gm-hint">目前沒有待審的候選。</p>}
              {[...candByGame.entries()].map(([game, list]) => (
                <div key={game}>
                  <div className="gm-game">{game}</div>
                  <ul className="gm-list">
                    {list.map((c) => (
                      <li key={c.id} className="gm-row">
                        <span className="gm-term">
                          {c.zh_term} → {c.en_term}
                        </span>
                        <span className="gm-count">{verify[c.id] ?? `${c.pick_count} 次`}</span>
                        <button
                          type="button"
                          className="gm-ask"
                          disabled={candBusy !== ''}
                          onClick={() => void verifyCand(c)}
                        >
                          驗證
                        </button>
                        <button
                          type="button"
                          className="gm-ask"
                          disabled={candBusy !== ''}
                          onClick={() => void approveCand(c)}
                        >
                          核准
                        </button>
                        <button
                          type="button"
                          className="gm-x"
                          aria-label={`退回 ${c.zh_term} → ${c.en_term}`}
                          disabled={candBusy !== ''}
                          onClick={() => void rejectCand(c)}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  )
}