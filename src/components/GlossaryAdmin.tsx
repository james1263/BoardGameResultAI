import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { askConfirm } from '../lib/askConfirm'

type Entry = {
  id: string
  bgg_name: string
  game_name: string
  zh_term: string
  en_term: string
  note: string
  confirmed: boolean
}

// 管理中心「上傳檔案」→「詞庫」分頁：每款遊戲的中文詞 → 英文（或中文同義詞）搜尋詞
// 上方新增，下方是全部詞庫（依遊戲分組、原地編輯、AI 建議的詞可一鍵確認）
export default function GlossaryAdmin({
  renderPicker,
  onChanged,
}: {
  renderPicker: (value: string, onChange: (bggName: string) => void) => ReactNode
  onChanged?: () => void
}) {
  const [bggName, setBggName] = useState('')
  const [all, setAll] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)
  const [zh, setZh] = useState('')
  const [en, setEn] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [onlyPending, setOnlyPending] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [dZh, setDZh] = useState('')
  const [dEn, setDEn] = useState('')
  const [dNote, setDNote] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase.rpc('admin_get_all_glossary')
    setLoading(false)
    if (err) setError('讀取詞庫失敗：' + err.message)
    else setAll((data ?? []) as Entry[])
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const pendingTotal = all.filter((item) => !item.confirmed).length
  const keyword = query.trim().toLowerCase()

  const groups = useMemo(() => {
    const map = new Map<string, { bgg_name: string; game_name: string; items: Entry[] }>()
    for (const item of all) {
      if (onlyPending && item.confirmed) continue
      if (
        keyword &&
        !`${item.game_name} ${item.bgg_name} ${item.zh_term} ${item.en_term}`
          .toLowerCase()
          .includes(keyword)
      ) {
        continue
      }
      const group = map.get(item.bgg_name) ?? {
        bgg_name: item.bgg_name,
        game_name: item.game_name,
        items: [],
      }
      group.items.push(item)
      map.set(item.bgg_name, group)
    }
    return [...map.values()]
  }, [all, onlyPending, keyword])

  function resetForm() {
    setZh('')
    setEn('')
    setNote('')
  }

  async function saveRpc(
    id: string | null,
    game: string,
    zhTerm: string,
    enTerm: string,
    noteText: string,
    confirmed: boolean,
  ) {
    return supabase.rpc('admin_save_glossary', {
      p_id: id,
      p_bgg_name: game,
      p_zh: zhTerm,
      p_en: enTerm,
      p_note: noteText,
      p_confirmed: confirmed,
    })
  }

  async function save() {
    setError('')
    setMessage('')
    if (!bggName) return setError('請先選擇遊戲。')
    if (!zh.trim() || !en.trim()) return setError('中文詞與對應詞都要填。')
    setBusy(true)
    const { error: err } = await saveRpc(null, bggName, zh.trim(), en.trim(), note.trim(), true)
    setBusy(false)
    if (err) return setError('儲存失敗：' + err.message)
    setMessage('已新增。')
    resetForm()
    await load()
    onChanged?.()
  }

  function startEdit(item: Entry) {
    setEditId(item.id)
    setDZh(item.zh_term)
    setDEn(item.en_term)
    setDNote(item.note)
    setError('')
    setMessage('')
  }

  async function saveEdit(item: Entry) {
    setError('')
    if (!dZh.trim() || !dEn.trim()) return setError('中文詞與對應詞都要填。')
    setBusy(true)
    // 人工改過就視為已確認
    const { error: err } = await saveRpc(item.id, item.bgg_name, dZh.trim(), dEn.trim(), dNote.trim(), true)
    setBusy(false)
    if (err) return setError('儲存失敗：' + err.message)
    setEditId(null)
    setMessage('已更新。')
    await load()
    onChanged?.()
  }

  async function confirmItem(item: Entry) {
    setError('')
    setMessage('')
    const { error: err } = await saveRpc(item.id, item.bgg_name, item.zh_term, item.en_term, item.note, true)
    if (err) return setError('確認失敗：' + err.message)
    await load()
  }

  async function confirmAllOf(game: string, gameName: string, count: number) {
    if (!(await askConfirm(`要把《${gameName}》的 ${count} 組 AI 建議詞全部標為已確認嗎？`))) return
    setError('')
    setMessage('')
    let failed = 0
    for (const item of all) {
      if (item.bgg_name !== game || item.confirmed) continue
      const { error: err } = await saveRpc(item.id, item.bgg_name, item.zh_term, item.en_term, item.note, true)
      if (err) failed += 1
    }
    if (failed) setError(`有 ${failed} 組確認失敗。`)
    await load()
  }

  async function remove(item: Entry) {
    if (!(await askConfirm(`確定要刪除「${item.zh_term} → ${item.en_term}」嗎？`))) return
    setError('')
    const { error: err } = await supabase.rpc('admin_delete_glossary', { p_id: item.id })
    if (err) return setError('刪除失敗：' + err.message)
    if (editId === item.id) setEditId(null)
    await load()
    onChanged?.()
  }

  // .txt：每行「中文=對應詞」（也接受 ＝、Tab、逗號）；匯入的一律標為「AI 建議」，等你確認
  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !bggName) return
    setError('')
    setMessage('')
    const text = (await file.text()).replace(/^\uFEFF/, '')
    const pairs: [string, string][] = []
    for (const line of text.split(/\r?\n/)) {
      const m = line.trim().match(/^(.+?)\s*[=＝\t,，]\s*(.+)$/)
      if (m) pairs.push([m[1].trim(), m[2].trim()])
    }
    if (pairs.length === 0) return setError('沒有讀到任何「中文=對應詞」的行。')
    if (pairs.length > 200) return setError('一次最多 200 行。')
    if (!(await askConfirm(`要匯入 ${pairs.length} 組詞嗎？會標為「AI 建議」待你確認；重複的會略過或更新備註。`))) return
    setBusy(true)
    let failed = 0
    for (const [a, b] of pairs) {
      const { error: err } = await saveRpc(null, bggName, a, b, '', false)
      if (err) failed += 1
    }
    setBusy(false)
    setMessage(`匯入完成：成功 ${pairs.length - failed} 組${failed ? `、失敗 ${failed} 組（字數超過限制？）` : ''}。已標為「AI 建議」，請在下方確認。`)
    await load()
    onChanged?.()
  }

  return (
    <>
      <h3>詞庫</h3>
      <p className="rb-hint">
        每款遊戲各自的「中文詞 → 對應搜尋詞」。玩家在規則助手輸入中文口語（例如「生兵」），系統會自動加上對應詞去搜尋規則書。
        英文規則書填英文，中文規則書填規則書實際用的中文（例如 股票=股份）。詞庫只幫忙搜尋，不會顯示成規則內容。
        從 .txt 匯入的詞會標為「AI 建議」，不影響搜尋，只是提醒你還沒人工確認。
      </p>

      {renderPicker(bggName, (next) => {
        setBggName(next)
        resetForm()
        setError('')
        setMessage('')
      })}

      {bggName && (
        <div className="er-form">
          <label className="admin-field">
            <span>中文詞（最多 30 字）</span>
            <input type="text" value={zh} maxLength={30} placeholder="例如：生兵" onChange={(e) => setZh(e.target.value)} />
          </label>
          <label className="admin-field">
            <span>對應詞：英文，或規則書用的中文同義詞（最多 60 字）</span>
            <input type="text" value={en} maxLength={60} placeholder="例如：Recruit（中文規則書可填：股份）" onChange={(e) => setEn(e.target.value)} />
          </label>
          <label className="admin-field">
            <span>備註（選填）</span>
            <input type="text" value={note} maxLength={100} onChange={(e) => setNote(e.target.value)} />
          </label>

          <div className="rb-actions">
            <button type="button" className="ma-btn" disabled={busy} onClick={() => void save()}>
              {busy ? '處理中…' : '新增'}
            </button>
            {(zh || en || note) && (
              <button type="button" className="admin-link" onClick={resetForm}>
                清空
              </button>
            )}
          </div>

          <label className="rb-pick">
            <span>從 .txt 匯入（每行「中文=對應詞」，UTF-8）</span>
            <input type="file" accept=".txt,text/plain" disabled={busy} onChange={importFile} />
          </label>
        </div>
      )}

      {error && <p className="admin-error">{error}</p>}
      {message && <p className="rb-msg">{message}</p>}

      <h4 className="er-list-title">
        全部詞庫（{all.length}）{pendingTotal > 0 ? `・AI 建議待確認 ${pendingTotal}` : ''}
      </h4>
      <input
        type="search"
        className="rb-search"
        placeholder="搜尋遊戲、中文詞或對應詞"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {pendingTotal > 0 && (
        <p className="rb-hint">
          <button type="button" className="admin-link" onClick={() => setOnlyPending((v) => !v)}>
            {onlyPending ? '顯示全部' : `只看 AI 建議待確認（${pendingTotal}）`}
          </button>
        </p>
      )}
      {loading && <p className="rb-hint">載入中…</p>}
      {!loading && groups.length === 0 && (
        <p className="rb-hint">{all.length === 0 ? '還沒有任何詞庫。' : '沒有符合的詞。'}</p>
      )}
      {groups.map((group) => {
        const pending = group.items.filter((item) => !item.confirmed).length
        return (
          <details
            key={group.bgg_name}
            className="ov-fold"
            open={onlyPending || keyword !== '' || group.bgg_name === bggName}
          >
            <summary>
              {group.game_name}（{group.items.length}）{pending > 0 ? `・待確認 ${pending}` : ''}
            </summary>
            {pending > 0 && (
              <p className="rb-hint">
                <button
                  type="button"
                  className="admin-link"
                  onClick={() => void confirmAllOf(group.bgg_name, group.game_name, pending)}
                >
                  這款的 AI 建議全部確認
                </button>
              </p>
            )}
            <ul className="er-list">
              {group.items.map((item) => (
                <li key={item.id}>
                  {editId === item.id ? (
                    <div className="er-form">
                      <label className="admin-field">
                        <span>中文詞</span>
                        <input type="text" value={dZh} maxLength={30} onChange={(e) => setDZh(e.target.value)} />
                      </label>
                      <label className="admin-field">
                        <span>對應詞</span>
                        <input type="text" value={dEn} maxLength={60} onChange={(e) => setDEn(e.target.value)} />
                      </label>
                      <label className="admin-field">
                        <span>備註</span>
                        <input type="text" value={dNote} maxLength={100} onChange={(e) => setDNote(e.target.value)} />
                      </label>
                      <div className="rb-actions">
                        <button type="button" className="ma-btn" disabled={busy} onClick={() => void saveEdit(item)}>
                          {busy ? '處理中…' : '儲存'}
                        </button>
                        <button type="button" className="admin-link" onClick={() => setEditId(null)}>
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="er-title">
                        {item.zh_term} → {item.en_term}
                        {!item.confirmed && <small className="er-src"> ・AI 建議（待確認）</small>}
                      </div>
                      {item.note && <small className="er-src">{item.note}</small>}
                      <div className="rb-actions">
                        {!item.confirmed && (
                          <button type="button" className="admin-link" onClick={() => void confirmItem(item)}>
                            確認
                          </button>
                        )}
                        <button type="button" className="admin-link" onClick={() => startEdit(item)}>
                          編輯
                        </button>
                        <button type="button" className="admin-link" onClick={() => void remove(item)}>
                          刪除
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </details>
        )
      })}
    </>
  )
}
