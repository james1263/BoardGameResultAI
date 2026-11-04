import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { askConfirm, showNotice } from '../lib/askConfirm'
import '../styles/rb-docs-tidy.css'

type MissRow = {
  bgg_name: string
  zh_term: string
  hit_count: number
  last_seen: string
}

function buildTxt(rows: MissRow[]): string {
  return rows.map((r) => `${r.bgg_name}｜${r.zh_term}｜${r.hit_count}`).join('\n')
}

export default function GlossaryMisses() {
  const [rows, setRows] = useState<MissRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase.rpc('admin_get_glossary_misses', {
      p_bgg_name: null,
    })
    if (err) setError('讀取失敗：' + err.message)
    else setRows((data ?? []) as MissRow[])
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function copyTxt() {
    const text = buildTxt(rows)
    try {
      await navigator.clipboard.writeText(text)
      await showNotice('已複製，直接貼給 AI 就可以了。')
    } catch {
      await showNotice('複製失敗，請改用「下載 .txt」。')
    }
  }

  function downloadTxt() {
    const blob = new Blob(['\ufeff' + buildTxt(rows)], {
      type: 'text/plain;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `glossary_misses_${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  async function removeOne(r: MissRow) {
    const { error: err } = await supabase.rpc('admin_delete_glossary_miss', {
      p_bgg_name: r.bgg_name,
      p_zh_term: r.zh_term,
    })
    if (err) setError('刪除失敗：' + err.message)
    else setRows((prev) => prev.filter((x) => x !== r))
  }

  async function clearAll() {
    if (!(await askConfirm('確定要清空整份清單嗎？（不影響詞庫）'))) return
    const { error: err } = await supabase.rpc('admin_clear_glossary_misses')
    if (err) setError('清空失敗：' + err.message)
    else setRows([])
  }

  const byGame = new Map<string, MissRow[]>()
  for (const r of rows) {
    const list = byGame.get(r.bgg_name) ?? []
    list.push(r)
    byGame.set(r.bgg_name, list)
  }

  return (
    <div className="gm-box">
      <h4>找不到英文的詞（{rows.length}）</h4>
      <p className="gm-hint">
        玩家在規則助手輸入、但詞庫沒有對應英文的中文詞，會自動記在這裡（只記詞與次數，不記是誰、也不記完整問題）。
        把清單匯出給 AI 整理成「中文=英文」，再用上方的 .txt 匯入加進詞庫；已進詞庫的詞會自動從這裡消失。
      </p>
      <div className="gm-actions">
        <button type="button" className="gm-btn primary" disabled={!rows.length} onClick={copyTxt}>
          複製清單
        </button>
        <button type="button" className="gm-btn" disabled={!rows.length} onClick={downloadTxt}>
          下載 .txt
        </button>
        <button type="button" className="gm-btn" onClick={() => void load()}>
          重新整理
        </button>
        <button type="button" className="gm-btn danger" disabled={!rows.length} onClick={clearAll}>
          清空
        </button>
      </div>
      {loading && <p className="gm-hint">讀取中…</p>}
      {error && <p className="admin-error">{error}</p>}
      {!loading && !error && rows.length === 0 && (
        <p className="gm-hint">目前沒有未對應的詞。</p>
      )}
      {[...byGame.entries()].map(([game, list]) => (
        <div key={game}>
          <div className="gm-game">{game}</div>
          <ul className="gm-list">
            {list.map((r) => (
              <li key={r.zh_term} className="gm-row">
                <span className="gm-term">{r.zh_term}</span>
                <span className="gm-count">{r.hit_count} 次</span>
                <button
                  type="button"
                  className="gm-x"
                  aria-label={`刪除 ${r.zh_term}`}
                  onClick={() => void removeOne(r)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
