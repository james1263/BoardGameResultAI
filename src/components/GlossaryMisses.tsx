import { useCallback, useEffect, useState } from 'react'
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

// 複製給 AI 的說明＋清單；AI 回覆的格式剛好可以貼進詞庫「新增詞庫」視窗
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

export default function GlossaryMisses({ onCopied }: { onCopied?: () => void }) {
  const [rows, setRows] = useState<MissRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [askBusy, setAskBusy] = useState('')
  const [ask, setAsk] = useState<AskState | null>(null)

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
            ))}
          </ul>
        </div>
      ))}
      {ask && <AskModal state={ask} onClose={() => setAsk(null)} />}
    </div>
  )
}
