import { useState, type ChangeEvent, type ReactNode } from 'react'
import { askConfirm } from '../lib/askConfirm'
import {
  deleteErrata,
  ERRATA_MAX_CONTENT,
  ERRATA_MAX_SOURCE,
  ERRATA_MAX_TITLE,
  saveErrata,
  useGameErrata,
  type Errata,
} from '../lib/useGameErrata'
import '../styles/errata.css'

// 管理中心「規則書」分頁 →「＋ 玩錯紀錄」：直接打字，或讀入 .txt 後修改再儲存
export default function ErrataAdmin({
  renderPicker,
  onChanged,
}: {
  renderPicker: (value: string, onChange: (bggName: string) => void) => ReactNode
  onChanged?: () => void
}) {
  const [bggName, setBggName] = useState('')
  const api = useGameErrata(bggName, bggName !== '')
  const [editId, setEditId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [source, setSource] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const over = content.length > ERRATA_MAX_CONTENT

  function resetForm() {
    setEditId(null)
    setTitle('')
    setContent('')
    setSource('')
  }

  async function readFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError('')
    setMessage('')
    if (!/\.txt$/i.test(file.name) && file.type !== 'text/plain') {
      setError('請選擇 .txt 文字檔。')
      return
    }
    if (file.size > 200 * 1024) {
      setError('檔案太大了，玩錯紀錄請拆成短的文字檔。')
      return
    }
    const text = (await file.text()).replace(/^\uFEFF/, '').trim()
    setContent(text)
    if (!title.trim()) {
      setTitle(file.name.replace(/\.txt$/i, '').slice(0, ERRATA_MAX_TITLE))
    }
    if (text.length > ERRATA_MAX_CONTENT) {
      setError(
        `內容有 ${text.length} 字，超過 ${ERRATA_MAX_CONTENT} 字，請刪減或拆成多筆再儲存。`,
      )
    } else {
      setMessage('已讀入文字框，可以修改後再儲存。（檔案請存成 UTF-8，否則會變亂碼）')
    }
  }

  async function save() {
    setError('')
    setMessage('')
    if (!bggName) {
      setError('請先選擇遊戲。')
      return
    }
    if (!title.trim() || !content.trim()) {
      setError('標題與內容都要填。')
      return
    }
    if (over) {
      setError(`內容超過 ${ERRATA_MAX_CONTENT} 字，請拆成多筆。`)
      return
    }
    setBusy(true)
    const result = await saveErrata({
      id: editId,
      bggName,
      title: title.trim(),
      content: content.trim(),
      sourceNote: source.trim(),
    })
    setBusy(false)
    if (result) {
      setError(result)
      return
    }
    setMessage(editId ? '已更新。' : '已新增。')
    onChanged?.()
    resetForm()
    api.reload()
  }

  function startEdit(item: Errata) {
    setEditId(item.id)
    setTitle(item.title)
    setContent(item.content)
    setSource(item.source_note)
    setError('')
    setMessage('')
  }

  async function remove(item: Errata) {
    if (!(await askConfirm(`確定要刪除「${item.title}」嗎？無法復原。`))) return
    setError('')
    const result = await deleteErrata(item.id)
    if (result) {
      setError(result)
      return
    }
    if (editId === item.id) resetForm()
    setMessage('已刪除。')
      onChanged?.()
    api.reload()
  }

  return (
    <>
      <h3>玩錯紀錄</h3>
      <p className="rb-hint">
        記錄玩家玩錯過的規則。VIP 與管理者能在遊戲詳細資料與規則助手看到，一律標示為「管理者記錄、非官方規則」，不會和規則書混在一起。
        一筆內容最多 {ERRATA_MAX_CONTENT} 字；一個 .txt 檔就是一筆。
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
            <span>標題（{title.length}/{ERRATA_MAX_TITLE}）</span>
            <input
              type="text"
              value={title}
              maxLength={ERRATA_MAX_TITLE}
              placeholder="例如：下一季的起始玩家"
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>

          <label className="admin-field">
            <span>
              內容{' '}
              <span className={over ? 'er-count over' : 'er-count'}>
                {content.length}/{ERRATA_MAX_CONTENT}
              </span>
            </span>
            <textarea
              rows={7}
              value={content}
              placeholder="正確的規則是什麼、之前怎麼玩錯、對應規則書第幾頁（若知道）"
              onChange={(event) => setContent(event.target.value)}
            />
          </label>

          <label className="admin-field">
            <span>來源說明（選填，{source.length}/{ERRATA_MAX_SOURCE}）</span>
            <input
              type="text"
              value={source}
              maxLength={ERRATA_MAX_SOURCE}
              placeholder="例如：規則書 v1.2 第 7 頁、2026/11 聚會"
              onChange={(event) => setSource(event.target.value)}
            />
          </label>

          <label className="rb-pick">
            <span>從 .txt 檔讀入內容（選填）</span>
            <input type="file" accept=".txt,text/plain" onChange={readFile} />
          </label>

          {error && <p className="admin-error">{error}</p>}
          {message && <p className="rb-msg">{message}</p>}

          <div className="rb-actions">
            <button
              type="button"
              className="ma-btn"
              disabled={busy || over}
              onClick={() => void save()}
            >
              {busy ? '儲存中…' : editId ? '更新這筆' : '儲存'}
            </button>
            {(editId || title || content || source) && (
              <button type="button" className="admin-link" onClick={resetForm}>
                {editId ? '取消編輯' : '清空'}
              </button>
            )}
          </div>

          <h4 className="er-list-title">這款已有的玩錯紀錄（{api.items.length}）</h4>
          {api.loading && <p className="rb-hint">載入中…</p>}
          {api.error && <p className="admin-error">{api.error}</p>}
          <ul className="er-list">
            {api.items.map((item) => (
              <li key={item.id}>
                <div className="er-title">{item.title}</div>
                <p className="er-body">{item.content}</p>
                {item.source_note && (
                  <small className="er-src">來源：{item.source_note}</small>
                )}
                <div className="rb-actions">
                  <button
                    type="button"
                    className="admin-link"
                    onClick={() => startEdit(item)}
                  >
                    編輯
                  </button>
                  <button
                    type="button"
                    className="admin-link"
                    onClick={() => void remove(item)}
                  >
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
