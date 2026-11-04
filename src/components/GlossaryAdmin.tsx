import { useCallback, useEffect, useState, type ChangeEvent, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { askConfirm } from '../lib/askConfirm'

type Entry = { id: string; zh_term: string; en_term: string; note: string }

// 管理中心「規則書」分頁 →「＋ 詞庫」：每款遊戲的中文詞 → 英文搜尋詞
export default function GlossaryAdmin({
  renderPicker,
  onChanged,
}: {
  renderPicker: (value: string, onChange: (bggName: string) => void) => ReactNode
  onChanged?: () => void
}) {
  const [bggName, setBggName] = useState('')
  const [items, setItems] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [zh, setZh] = useState('')
  const [en, setEn] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!bggName) {
      setItems([])
      return
    }
    setLoading(true)
    const { data, error: err } = await supabase.rpc('admin_get_glossary', {
      p_bgg_name: bggName,
    })
    setLoading(false)
    if (err) setError('讀取詞庫失敗：' + err.message)
    else setItems((data ?? []) as Entry[])
  }, [bggName])

  useEffect(() => {
    void load()
  }, [load])

  function resetForm() {
    setEditId(null)
    setZh('')
    setEn('')
    setNote('')
  }

  async function save() {
    setError('')
    setMessage('')
    if (!bggName) return setError('請先選擇遊戲。')
    if (!zh.trim() || !en.trim()) return setError('中文詞與英文詞都要填。')
    setBusy(true)
    const { error: err } = await supabase.rpc('admin_save_glossary', {
      p_id: editId,
      p_bgg_name: bggName,
      p_zh: zh.trim(),
      p_en: en.trim(),
      p_note: note.trim(),
    })
    setBusy(false)
    if (err) return setError('儲存失敗：' + err.message)
    setMessage(editId ? '已更新。' : '已新增。')
    resetForm()
    await load()
    onChanged?.()
  }

  async function remove(item: Entry) {
    if (!(await askConfirm(`確定要刪除「${item.zh_term} → ${item.en_term}」嗎？`))) return
    setError('')
    const { error: err } = await supabase.rpc('admin_delete_glossary', { p_id: item.id })
    if (err) return setError('刪除失敗：' + err.message)
    if (editId === item.id) resetForm()
    await load()
    onChanged?.()
  }

  // .txt：每行「中文=英文」（也接受 ＝、Tab、逗號）
  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !bggName) return
    setError('')
    setMessage('')
    const text = (await file.text()).replace(/^﻿/, '')
    const pairs: [string, string][] = []
    for (const line of text.split(/\r?\n/)) {
      const m = line.trim().match(/^(.+?)\s*[=＝\t,，]\s*(.+)$/)
      if (m) pairs.push([m[1].trim(), m[2].trim()])
    }
    if (pairs.length === 0) return setError('沒有讀到任何「中文=英文」的行。')
    if (pairs.length > 200) return setError('一次最多 200 行。')
    if (!(await askConfirm(`要匯入 ${pairs.length} 組詞嗎？重複的會略過或更新備註。`))) return
    setBusy(true)
    let failed = 0
    for (const [a, b] of pairs) {
      const { error: err } = await supabase.rpc('admin_save_glossary', {
        p_id: null,
        p_bgg_name: bggName,
        p_zh: a,
        p_en: b,
        p_note: '',
      })
      if (err) failed += 1
    }
    setBusy(false)
    setMessage(`匯入完成：成功 ${pairs.length - failed} 組${failed ? `、失敗 ${failed} 組（字數超過限制？）` : ''}。`)
    await load()
    onChanged?.()
  }

  return (
    <>
      <h3>詞庫</h3>
      <p className="rb-hint">
        每款遊戲各自的「中文詞 → 英文搜尋詞」。玩家在規則助手輸入中文口語（例如「生兵」），系統會自動加上對應的英文詞去搜尋規則書。
        同一個中文詞可以對應多個英文詞，口語與規則書用詞不同的也請都記下。詞庫只幫忙搜尋，不會顯示成規則內容。
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
            <span>英文搜尋詞（最多 60 字）</span>
            <input type="text" value={en} maxLength={60} placeholder="例如：Recruit" onChange={(e) => setEn(e.target.value)} />
          </label>
          <label className="admin-field">
            <span>備註（選填）</span>
            <input type="text" value={note} maxLength={100} onChange={(e) => setNote(e.target.value)} />
          </label>

          {error && <p className="admin-error">{error}</p>}
          {message && <p className="rb-msg">{message}</p>}

          <div className="rb-actions">
            <button type="button" className="ma-btn" disabled={busy} onClick={() => void save()}>
              {busy ? '處理中…' : editId ? '更新這組' : '新增'}
            </button>
            {(editId || zh || en || note) && (
              <button type="button" className="admin-link" onClick={resetForm}>
                {editId ? '取消編輯' : '清空'}
              </button>
            )}
          </div>

          <label className="rb-pick">
            <span>從 .txt 匯入（每行「中文=英文」，UTF-8）</span>
            <input type="file" accept=".txt,text/plain" disabled={busy} onChange={importFile} />
          </label>

          <h4 className="er-list-title">這款的詞庫（{items.length}）</h4>
          {loading && <p className="rb-hint">載入中…</p>}
          <ul className="er-list">
            {items.map((item) => (
              <li key={item.id}>
                <div className="er-title">
                  {item.zh_term} → {item.en_term}
                </div>
                {item.note && <small className="er-src">{item.note}</small>}
                <div className="rb-actions">
                  <button
                    type="button"
                    className="admin-link"
                    onClick={() => {
                      setEditId(item.id)
                      setZh(item.zh_term)
                      setEn(item.en_term)
                      setNote(item.note)
                      setError('')
                      setMessage('')
                    }}
                  >
                    編輯
                  </button>
                  <button type="button" className="admin-link" onClick={() => void remove(item)}>
                    刪除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
