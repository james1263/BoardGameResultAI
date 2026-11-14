import { useState, type ChangeEvent, type ReactNode } from 'react'
import { askConfirm, askInput } from '../lib/askConfirm'
import {
  deleteErrata,
  ERRATA_MAX_CONTENT,
  ERRATA_MAX_SOURCE,
  ERRATA_MAX_REASON,
  ERRATA_MAX_TITLE,
  reviewErrata,
  saveErrata,
  useGameErrata,
  usePendingErrata,
  useAllErrata,
  type PendingErrata,
  type AdminErrataRow,
  type Errata,
} from '../lib/useGameErrata'
import { PENDING_CHANGED_EVENT } from '../lib/useAdminPending'
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
  const pending = usePendingErrata(true)
  const all = useAllErrata(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [source, setSource] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [rowEditId, setRowEditId] = useState<string | null>(null)
  const [rowTitle, setRowTitle] = useState('')
  const [rowContent, setRowContent] = useState('')
  const [rowSource, setRowSource] = useState('')
  const [rowBusy, setRowBusy] = useState(false)

  const over = content.length > ERRATA_MAX_CONTENT
  const listItems = api.items.filter((item) => item.status !== 'pending')

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
    all.reload()
  }

  async function review(item: PendingErrata, approve: boolean) {
    setError('')
    setMessage('')
    let reason = ''
    if (!approve) {
      const input = await askInput('請寫退回原因（投稿者看得到，最多 ' + ERRATA_MAX_REASON + ' 字）', {
        placeholder: '例如：和規則書第 7 頁不符',
        confirmText: '退回',
      })
      if (input === null) return
      reason = input.trim().slice(0, ERRATA_MAX_REASON)
      if (!reason) {
        setError('退回時必須寫原因。')
        return
      }
    }
    const result = await reviewErrata(item.id, approve, reason)
    if (result) {
      setError(result)
      return
    }
    setMessage(approve ? '已核准，之後會出現在規則助手與遊戲詳細資料。' : '已退回。')
    window.dispatchEvent(new Event(PENDING_CHANGED_EVENT))
    onChanged?.()
    pending.reload()
    api.reload()
    all.reload()
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
    all.reload()
  }

  async function removeRow(row: AdminErrataRow) {
    if (!(await askConfirm(`確定要刪除「${row.title}」嗎？無法復原。`))) return
    setError('')
    const result = await deleteErrata(row.id)
    if (result) {
      setError(result)
      return
    }
    setMessage('已刪除。')
    window.dispatchEvent(new Event(PENDING_CHANGED_EVENT))
    onChanged?.()
    pending.reload()
    api.reload()
    all.reload()
  }

  function startRowEdit(row: AdminErrataRow) {
    setRowEditId(row.id)
    setRowTitle(row.title)
    setRowContent(row.content)
    setRowSource(row.source_note)
    setError('')
    setMessage('')
  }

  async function saveRowEdit(row: AdminErrataRow) {
    setError('')
    setMessage('')
    if (!rowTitle.trim() || !rowContent.trim()) {
      setError('標題與內容都要填。')
      return
    }
    if (rowContent.length > ERRATA_MAX_CONTENT) {
      setError(`內容超過 ${ERRATA_MAX_CONTENT} 字，請拆成多筆。`)
      return
    }
    setRowBusy(true)
    const result = await saveErrata({
      id: row.id,
      bggName: row.bgg_name,
      title: rowTitle.trim(),
      content: rowContent.trim(),
      sourceNote: rowSource.trim(),
    })
    setRowBusy(false)
    if (result) {
      setError(result)
      return
    }
    setMessage('已更新。')
    setRowEditId(null)
    onChanged?.()
    api.reload()
    all.reload()
  }

  const keyword = q.trim().toLowerCase()
  const shownRows = keyword
    ? all.items.filter((row) =>
        `${row.game_name ?? ''} ${row.bgg_name} ${row.title} ${row.content}`
          .toLowerCase()
          .includes(keyword),
      )
    : all.items
  const grouped = new Map<string, AdminErrataRow[]>()
  for (const row of shownRows) {
    const key = row.bgg_name
    grouped.set(key, [...(grouped.get(key) ?? []), row])
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

      <details
        key={pending.items.length > 0 ? 'has-pending' : 'no-pending'}
        className="ov-fold"
        open={pending.items.length > 0}
      >
        <summary>待審核的玩家投稿（{pending.items.length}）</summary>
      {pending.loading && <p className="rb-hint">載入中…</p>}
      {pending.error && <p className="admin-error">{pending.error}</p>}
      {!pending.loading && !pending.error && pending.items.length === 0 && (
        <p className="rb-hint">目前沒有待審的投稿。</p>
      )}
      <ul className="er-list">
        {pending.items.map((item) => (
          <li key={item.id}>
            <div className="er-title">
              《{item.game_name || item.bgg_name}》{item.title}
              {item.kind === 'ai_answer' && (
                <small className="er-src"> ・AI 回饋（請回規則書核對頁碼與答案）</small>
              )}
            </div>
            <p className="er-body">{item.content}</p>
            <small className="er-src">
              投稿者：{item.nickname || '（未設暱稱）'}
              {item.contact_name ? `（${item.contact_name}）` : ''}
              {item.page_ref ? `　頁碼：${item.page_ref}` : ''}
              {item.source_note ? `　來源：${item.source_note}` : ''}
              {item.verified ? '　已對照規則書' : '　未對照規則書'}
            </small>
            <div className="rb-actions">
              <button type="button" className="admin-link" onClick={() => void review(item, true)}>
                核准
              </button>
              <button type="button" className="admin-link" onClick={() => void review(item, false)}>
                退回
              </button>
            </div>
          </li>
        ))}
      </ul>
      </details>

      <h4 className="er-list-title">全部玩錯紀錄（{all.items.length}）</h4>
      {all.items.length > 0 && (
        <input
          type="search"
          className="admin-input"
          style={{ width: '100%', fontSize: 16, margin: '4px 0 8px' }}
          value={q}
          placeholder="搜尋遊戲、標題或內容"
          onChange={(event) => setQ(event.target.value)}
        />
      )}
      {all.loading && <p className="rb-hint">載入中…</p>}
      {all.error && <p className="admin-error">{all.error}</p>}
      {!all.loading && !all.error && all.items.length === 0 && (
        <p className="rb-hint">目前還沒有任何玩錯紀錄。</p>
      )}
      {keyword && shownRows.length === 0 && all.items.length > 0 && (
        <p className="rb-hint">找不到符合的玩錯紀錄。</p>
      )}
      {[...grouped.entries()].map(([name, rows]) => (
        <details key={name + (keyword ? '-s' : '')} className="ov-fold" open={keyword !== ''}>
          <summary>
            {rows[0].game_name || name}（{rows.length}）
          </summary>
          <ul className="er-list">
            {rows.map((row) => (
              <li key={row.id}>
                {rowEditId === row.id ? (
                  <div className="er-form">
                    <label className="admin-field">
                      <span>標題（{rowTitle.length}/{ERRATA_MAX_TITLE}）</span>
                      <input
                        type="text"
                        value={rowTitle}
                        maxLength={ERRATA_MAX_TITLE}
                        onChange={(event) => setRowTitle(event.target.value)}
                      />
                    </label>
                    <label className="admin-field">
                      <span>
                        內容{' '}
                        <span className={rowContent.length > ERRATA_MAX_CONTENT ? 'er-count over' : 'er-count'}>
                          {rowContent.length}/{ERRATA_MAX_CONTENT}
                        </span>
                      </span>
                      <textarea
                        rows={6}
                        value={rowContent}
                        onChange={(event) => setRowContent(event.target.value)}
                      />
                    </label>
                    <label className="admin-field">
                      <span>來源說明（選填，{rowSource.length}/{ERRATA_MAX_SOURCE}）</span>
                      <input
                        type="text"
                        value={rowSource}
                        maxLength={ERRATA_MAX_SOURCE}
                        onChange={(event) => setRowSource(event.target.value)}
                      />
                    </label>
                    <div className="rb-actions">
                      <button
                        type="button"
                        className="ma-btn"
                        disabled={rowBusy || rowContent.length > ERRATA_MAX_CONTENT}
                        onClick={() => void saveRowEdit(row)}
                      >
                        {rowBusy ? '儲存中…' : '儲存'}
                      </button>
                      <button type="button" className="admin-link" onClick={() => setRowEditId(null)}>
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="er-title">
                      {row.title}
                      <small className="er-src">
                        {' '}・{row.from_player ? (row.kind === 'ai_answer' ? '玩家投稿（AI 回饋）' : '玩家投稿') : '管理者記錄'}・
                        {row.status === 'pending' ? '待審核' : row.status === 'rejected' ? '已退回' : '已核准'}
                      </small>
                    </div>
                    <p className="er-body">{row.content}</p>
                    <small className="er-src">
                      {row.nickname ? `投稿者：${row.nickname}　` : ''}
                      {row.page_ref ? `頁碼：${row.page_ref}　` : ''}
                      {row.source_note ? `來源：${row.source_note}　` : ''}
                      {row.status === 'rejected' && row.reject_reason ? `退回原因：${row.reject_reason}` : ''}
                    </small>
                    <div className="rb-actions">
                      <button type="button" className="admin-link" onClick={() => startRowEdit(row)}>
                        編輯
                      </button>
                      <button type="button" className="admin-link" onClick={() => void removeRow(row)}>
                        刪除
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </details>
      ))}

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

          <h4 className="er-list-title">這款已有的玩錯紀錄（{listItems.length}）</h4>
          {api.loading && <p className="rb-hint">載入中…</p>}
          {api.error && <p className="admin-error">{api.error}</p>}
          <ul className="er-list">
            {listItems.map((item) => (
              <li key={item.id}>
                <div className="er-title">
                  {item.title}
                  {item.from_player && (
                    <small className="er-src">
                      {' '}・玩家投稿{item.kind === 'ai_answer' ? '・AI 回饋' : ''}（{item.status === 'rejected' ? '已退回' : '已核准'}）
                    </small>
                  )}
                </div>
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
