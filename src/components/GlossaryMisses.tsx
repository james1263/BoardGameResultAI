import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'
import { askConfirm, showNotice } from '../lib/askConfirm'
import { searchRulebook } from '../lib/useRulebookSearch'
import { searchErrata } from '../lib/useGameErrata'
import { toSimplified } from '../lib/toSimplified'
import { useBackClose } from '../lib/useBackClose'
import { buildAnswerPrompt, copyText, saveFeedbackCtx, type FeedbackCtx } from '../lib/aiAnswer'
import AiFeedbackBox from './AiFeedbackBox'
import '../styles/rb-docs-tidy.css'
import '../styles/errata.css'
import '../styles/glossary-ask.css'

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

type SourceCount = { user: number; admin: number }
type ZeroRow = { bgg_name: string; zh_term: string; user: number; admin: number; last_seen: string }

type Candidate = { bgg_name: string; zh_term: string; en_term: string; status: string }
type AskState = { bggName: string; zh: string; en: string[]; ctx: FeedbackCtx }

// 複製成功後跳出的投稿視窗（疊在管理中心上面；返回鍵／✕ 只關這一層）
function AskModal({ state, onClose }: { state: AskState; onClose: () => void }) {
  useBackClose(onClose, true)
  return createPortal(
    <div className="gma-backdrop" onClick={onClose}>
      <div className="gma-sheet" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="gma-head">
          <strong>
            {state.bggName}｜{state.zh}
          </strong>
          <button type="button" className="gma-close" aria-label="關閉" onClick={onClose}>
            ✕
          </button>
        </div>
        <p className="gma-hint">
          已複製給 AI 的內容（搜尋詞：{[state.zh, ...state.en].join('、')}）。貼給 AI 後，把它回覆最後的回饋區塊貼在下面投稿；管理員投稿會直接核准。
        </p>
        <AiFeedbackBox key={state.ctx.code} bggName={state.bggName} ctx={state.ctx} onDismiss={onClose} />
      </div>
    </div>,
    document.body,
  )
}

function buildTxt(rows: MissRow[]): string {
  return rows.map((r) => `${r.bgg_name}｜${r.zh_term}｜${r.hit_count}`).join('\n')
}

function sourceLabel(s?: SourceCount): string {
  if (!s) return ''
  const parts: string[] = []
  if (s.user) parts.push(`玩家 ${s.user}`)
  if (s.admin) parts.push(`管理員 ${s.admin}`)
  return parts.join('・')
}

// 複製給 AI 的說明＋清單（快速版，沒有附規則書原文）；AI 回覆的格式剛好可以貼進詞庫「新增詞庫」視窗
// 想連規則書原文一起給 AI 分析，用下方「匯出給 AI 分析」
const AI_PROMPT = [
  '這是桌遊規則助手的「找不到英文的詞」清單。清單每行格式：遊戲英文名｜玩家輸入的中文詞｜出現次數。',
  '請依該遊戲「英文規則書」實際使用的術語，替每個中文詞找最可能的英文對應詞，單複數與大小寫照規則書用法。',
  '回覆只輸出純文字，每行一筆，格式固定為：遊戲英文名｜中文詞｜英文對應詞',
  '範例：Skymines｜股份｜Shares',
  '不要加編號、標題、說明、備註或程式碼框，也不要輸出出現次數。',
  '下列情況請直接略過該行，不要輸出：沒把握的詞、太泛用的詞（例如「行動」「能力」）、明顯不屬於該遊戲的詞、本身已是英文的詞。',
  '每個中文詞只給一個最適合的英文對應詞。',
  '',
  '（以下是清單）',
].join('\n')

const EXPORT_APPENDIX_LIMIT = 60000

export default function GlossaryMisses({ onCopied }: { onCopied?: () => void }) {
  const [rows, setRows] = useState<MissRow[]>([])
  const [searchMisses, setSearchMisses] = useState<SearchMissRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [askBusy, setAskBusy] = useState('')
  const [ask, setAsk] = useState<AskState | null>(null)
  const [exportGame, setExportGame] = useState('')
  const [withAppendix, setWithAppendix] = useState(true)
  const [exporting, setExporting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const [missRes, searchRes] = await Promise.all([
      supabase.rpc('admin_get_glossary_misses', { p_bgg_name: null }),
      supabase.rpc('admin_get_search_misses', { p_bgg_name: null }),
    ])
    const err = missRes.error ?? searchRes.error
    if (err) setError('讀取失敗：' + err.message)
    setRows(missRes.error ? [] : ((missRes.data ?? []) as MissRow[]))
    setSearchMisses(searchRes.error ? [] : ((searchRes.data ?? []) as SearchMissRow[]))
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  // 「找不到英文的詞」每列旁邊顯示來源（玩家／管理員各幾次）
  const sourceOf = useMemo(() => {
    const map = new Map<string, SourceCount>()
    for (const m of searchMisses) {
      if (m.kind !== 'glossary_miss') continue
      const key = m.bgg_name + '|' + m.zh_term
      const cur = map.get(key) ?? { user: 0, admin: 0 }
      if (m.source === 'admin') cur.admin += m.hit_count
      else cur.user += m.hit_count
      map.set(key, cur)
    }
    return map
  }, [searchMisses])

  // 搜尋零結果：同一個詞把玩家與管理員合成一列
  const zeroRows = useMemo(() => {
    const map = new Map<string, ZeroRow>()
    for (const m of searchMisses) {
      if (m.kind !== 'search_zero_result') continue
      const key = m.bgg_name + '|' + m.zh_term
      const cur = map.get(key) ?? {
        bgg_name: m.bgg_name,
        zh_term: m.zh_term,
        user: 0,
        admin: 0,
        last_seen: m.last_seen,
      }
      if (m.source === 'admin') cur.admin += m.hit_count
      else cur.user += m.hit_count
      if (m.last_seen > cur.last_seen) cur.last_seen = m.last_seen
      map.set(key, cur)
    }
    return [...map.values()].sort(
      (a, b) =>
        a.bgg_name.localeCompare(b.bgg_name) ||
        b.user + b.admin - (a.user + a.admin) ||
        a.zh_term.localeCompare(b.zh_term),
    )
  }, [searchMisses])

  const exportGames = useMemo(
    () =>
      [...new Set([...rows.map((r) => r.bgg_name), ...zeroRows.map((r) => r.bgg_name)])].sort((a, b) =>
        a.localeCompare(b),
      ),
    [rows, zeroRows],
  )
  const pickedGame = exportGames.includes(exportGame) ? exportGame : ''

  async function copyTxt() {
    const text = AI_PROMPT + '\n' + buildTxt(rows)
    try {
      await navigator.clipboard.writeText(text)
      await showNotice(
        '已複製（含給 AI 的說明），貼給 AI 後，把它的回覆貼進接下來的「新增詞庫」視窗。AI 沒回的詞表示沒把握，之後仍會留在這份清單裡。',
      )
      onCopied?.()
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

  // 呼叫資料庫匯出函式，產生「未命中詞＋詞庫＋候選段落＋原文附錄＋AI 分析任務」的整份文字
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
      return data
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
      `已複製《${pickedGame}》的 AI 分析資料（約 ${text.length.toLocaleString()} 字元）。貼給 AI 後，把它回覆「第二部分」的清單貼進接下來的「新增詞庫」視窗。`,
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

  // 用「中文詞＋這款遊戲累積過的英文候選詞」以管理者身分搜尋，複製給 AI 並開投稿視窗
  async function askAi(r: MissRow) {
    const key = r.bgg_name + '|' + r.zh_term
    if (askBusy) return
    setAskBusy(key)
    setError('')
    try {
      const { data } = await supabase.rpc('admin_get_term_candidates')
      const en = Array.from(
        new Set(
          ((data ?? []) as Candidate[])
            .filter((c) => c.bgg_name === r.bgg_name && c.zh_term === r.zh_term && c.status !== 'rejected')
            .map((c) => c.en_term),
        ),
      )
      const q = [r.zh_term, ...en].join(' ')
      const simp = await toSimplified(q)
      const result = await searchRulebook(r.bgg_name, q, simp !== q ? simp : undefined)
      if (result.error) {
        setError(result.error)
        return
      }
      if (result.chunks.length === 0) {
        await showNotice('沒有找到相關段落，所以沒有複製。')
        return
      }
      const errata = (await searchErrata(r.bgg_name, q)).items
      const { text, ctx } = buildAnswerPrompt({
        gameName: r.bgg_name,
        question: `「${r.zh_term}」在這款遊戲的規則裡是什麼意思？怎麼運作？`,
        chunks: result.chunks,
        errata,
      })
      if (!(await copyText(text))) {
        setError('複製失敗，請稍後再試。')
        return
      }
      saveFeedbackCtx(r.bgg_name, ctx)
      setAsk({ bggName: r.bgg_name, zh: r.zh_term, en, ctx })
    } finally {
      setAskBusy('')
    }
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
    if (!(await askConfirm('確定要清空「找不到英文的詞」整份清單嗎？（不影響詞庫與搜尋零結果清單）'))) return
    const { error: err } = await supabase.rpc('admin_clear_glossary_misses')
    if (err) setError('清空失敗：' + err.message)
    else setRows([])
  }

  async function removeZero(r: ZeroRow) {
    const { error: err } = await supabase.rpc('admin_delete_search_miss', {
      p_bgg_name: r.bgg_name,
      p_zh_term: r.zh_term,
      p_kind: 'search_zero_result',
    })
    if (err) {
      setError('刪除失敗：' + err.message)
      return
    }
    setSearchMisses((prev) =>
      prev.filter(
        (x) => !(x.kind === 'search_zero_result' && x.bgg_name === r.bgg_name && x.zh_term === r.zh_term),
      ),
    )
  }

  async function clearZero() {
    if (!(await askConfirm('確定要清空「搜尋零結果」整份清單嗎？（不影響詞庫與「找不到英文的詞」）'))) return
    const { error: err } = await supabase.rpc('admin_clear_search_misses')
    if (err) setError('清空失敗：' + err.message)
    else setSearchMisses((prev) => prev.filter((x) => x.kind !== 'search_zero_result'))
  }

  const byGame = new Map<string, MissRow[]>()
  for (const r of rows) {
    const list = byGame.get(r.bgg_name) ?? []
    list.push(r)
    byGame.set(r.bgg_name, list)
  }

  const zeroByGame = new Map<string, ZeroRow[]>()
  for (const r of zeroRows) {
    const list = zeroByGame.get(r.bgg_name) ?? []
    list.push(r)
    zeroByGame.set(r.bgg_name, list)
  }

  return (
    <div className="gm-box">
      <h4>找不到英文的詞（{rows.length}）</h4>
      <p className="gm-hint">
        玩家或管理員在規則助手輸入、但詞庫沒有對應英文的中文詞，會自動記在這裡（只記詞與次數，不記是誰、也不記完整問題）。
        把清單匯出給 AI 整理成「遊戲名｜中文詞｜英文對應詞」，再貼進詞庫的「新增詞庫」視窗；已進詞庫的詞會自動從這裡消失。
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
            {list.map((r) => {
              const label = sourceLabel(sourceOf.get(r.bgg_name + '|' + r.zh_term))
              return (
                <li key={r.zh_term} className="gm-row">
                  <span className="gm-term">{r.zh_term}</span>
                  <span className="gm-count">
                    {r.hit_count} 次{label ? `（${label}）` : ''}
                  </span>
                  <button
                    type="button"
                    className="gm-ask"
                    disabled={askBusy !== ''}
                    onClick={() => void askAi(r)}
                  >
                    {askBusy === r.bgg_name + '|' + r.zh_term ? '搜尋中…' : '複製給我的 AI'}
                  </button>
                  <button
                    type="button"
                    className="gm-x"
                    aria-label={`刪除 ${r.zh_term}`}
                    onClick={() => void removeOne(r)}
                  >
                    ×
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}

      <h4 style={{ marginTop: 18 }}>搜尋零結果的詞（{zeroRows.length}）</h4>
      <p className="gm-hint">
        玩家或管理員搜尋後「完全沒有找到規則書段落」的詞（只記詞與次數，不記是誰、也不記完整問題；90 天沒再出現會自動清除）。
        原因可能是詞庫缺詞、簡繁用字不同、規則書沒寫這件事，或規則書文字品質不佳；用下方「匯出給 AI 分析」可以一起判斷。
      </p>
      <div className="gm-actions">
        <button type="button" className="gm-btn danger" disabled={!zeroRows.length} onClick={clearZero}>
          清空
        </button>
      </div>
      {!loading && !error && zeroRows.length === 0 && (
        <p className="gm-hint">目前沒有搜尋零結果的詞。</p>
      )}
      {[...zeroByGame.entries()].map(([game, list]) => (
        <div key={game}>
          <div className="gm-game">{game}</div>
          <ul className="gm-list">
            {list.map((r) => (
              <li key={r.zh_term} className="gm-row">
                <span className="gm-term">{r.zh_term}</span>
                <span className="gm-count">
                  {r.user + r.admin} 次（{sourceLabel({ user: r.user, admin: r.admin })}）
                </span>
                <button
                  type="button"
                  className="gm-x"
                  aria-label={`刪除 ${r.zh_term}`}
                  onClick={() => void removeZero(r)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <h4 style={{ marginTop: 18 }}>匯出給 AI 分析</h4>
      <p className="gm-hint">
        選一款遊戲，產生一份文字：未命中詞、現有詞庫、候選原文段落（含頁碼與前後文）、規則書原文附錄，最後附給 AI 的分析任務。
        不含玩家帳號與完整搜尋問句；規則書文字只給你自己分析用，請勿公開轉貼。
      </p>
      {exportGames.length === 0 && <p className="gm-hint">目前沒有可匯出的遊戲（還沒有未命中詞）。</p>}
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
          <p className="gm-hint">
            <label>
              <input
                type="checkbox"
                checked={withAppendix}
                onChange={(event) => setWithAppendix(event.target.checked)}
              />{' '}
              附上規則書原文（上限 {EXPORT_APPENDIX_LIMIT.toLocaleString()} 字元，超過會依頁碼從前面取並註明）
            </label>
          </p>
          <div className="gm-actions">
            <button
              type="button"
              className="gm-btn primary"
              disabled={!pickedGame || exporting}
              onClick={() => void copyExport()}
            >
              {exporting ? '產生中…' : '複製給 AI'}
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
        </>
      )}
      {ask && <AskModal state={ask} onClose={() => setAsk(null)} />}
    </div>
  )
}
