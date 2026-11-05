import { useState } from 'react'
import { askConfirm } from '../lib/askConfirm'
import {
  deleteMyErrata,
  ERRATA_MAX_CONTENT,
  ERRATA_MAX_PAGE,
  ERRATA_MAX_SOURCE,
  ERRATA_MAX_TITLE,
  submitErrata,
  useGameErrata,
  type Errata,
} from '../lib/useGameErrata'
import '../styles/errata.css'

// 遊戲詳細資料概覽：可收合的「玩錯紀錄（N）」，只有 VIP／管理者會掛這個元件
// 已核准的紀錄人人（VIP）看得到；VIP 可投稿，審核中／被退回的只有本人與管理者看得到
export default function GameErrata({
  bggName,
  isAdmin,
}: {
  bggName: string
  isAdmin: boolean
}) {
  const { items, loading, error, reload } = useGameErrata(bggName, true)
  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [source, setSource] = useState('')
  const [page, setPage] = useState('')
  const [verified, setVerified] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [formError, setFormError] = useState('')

  const approved = items.filter((item) => !item.status || item.status === 'approved')
  const mine = items.filter(
    (item) => item.is_mine && (item.status === 'pending' || item.status === 'rejected'),
  )

  function resetForm() {
    setEditId(null)
    setTitle('')
    setContent('')
    setSource('')
    setPage('')
    setVerified(false)
    setFormError('')
  }

  function startEdit(item: Errata) {
    setEditId(item.id)
    setTitle(item.title)
    setContent(item.content)
    setSource(item.source_note)
    setPage(item.page_ref ?? '')
    setVerified(!!item.verified)
    setFormError('')
    setMessage('')
    setFormOpen(true)
  }

  async function submit() {
    setFormError('')
    setMessage('')
    if (!title.trim() || !content.trim()) {
      setFormError('問題與答案都要填。')
      return
    }
    setBusy(true)
    const result = await submitErrata({
      id: editId,
      bggName,
      title: title.trim(),
      content: content.trim(),
      sourceNote: source.trim(),
      pageRef: page.trim(),
      verified,
    })
    setBusy(false)
    if (result) {
      setFormError(result)
      return
    }
    setMessage('已送出，管理者審核通過後才會公開。')
    resetForm()
    setFormOpen(false)
    reload()
  }

  async function removeMine(item: Errata) {
    if (!(await askConfirm(`確定要刪除你的投稿「${item.title}」嗎？無法復原。`))) return
    const result = await deleteMyErrata(item.id)
    if (result) {
      setMessage(result)
      return
    }
    setMessage('已刪除。')
    reload()
  }

  return (
    <details className="ov-fold er-fold">
      <summary>玩錯紀錄（{approved.length}）</summary>
      <div className="ov-fold-body">
        <p className="er-note">
          管理者記錄或玩家整理（管理者審核後公開）的玩錯經驗，不是官方規則；與規則書衝突時，以規則書為準。
        </p>
        {loading && <p className="er-note">載入中…</p>}
        {error && <p className="er-note">{error}</p>}
        {!loading && !error && approved.length === 0 && (
          <p className="er-note">
            {isAdmin
              ? '還沒有紀錄。到管理中心「規則書」→「＋ 玩錯紀錄」新增。'
              : '這款還沒有玩錯紀錄。'}
          </p>
        )}
        <ul className="er-list">
          {approved.map((item) => (
            <li key={item.id}>
              <div className="er-title">
                {item.title}
                {item.from_player && (
                  <small className="er-src"> ・玩家整理・已審核{item.verified ? '' : '・【未驗證】'}</small>
                )}
              </div>
              <p className="er-body">{item.content}</p>
              {item.page_ref && <small className="er-src">參考頁碼：{item.page_ref}　</small>}
              {item.source_note && (
                <small className="er-src">來源：{item.source_note}</small>
              )}
            </li>
          ))}
        </ul>

        {mine.length > 0 && (
          <>
            <h4 className="er-list-title">我的投稿（只有你和管理者看得到）</h4>
            <ul className="er-list">
              {mine.map((item) => (
                <li key={item.id}>
                  <div className="er-title">
                    {item.title}
                    <small className="er-src">
                      {' '}・{item.status === 'pending' ? '審核中' : '已退回'}
                    </small>
                  </div>
                  <p className="er-body">{item.content}</p>
                  {item.status === 'rejected' && item.reject_reason && (
                    <small className="er-src">退回原因：{item.reject_reason}</small>
                  )}
                  <div className="rb-actions">
                    <button type="button" className="admin-link" onClick={() => startEdit(item)}>
                      {item.status === 'rejected' ? '修改後重新送審' : '修改'}
                    </button>
                    <button type="button" className="admin-link" onClick={() => void removeMine(item)}>
                      刪除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {message && <p className="er-note">{message}</p>}

        {!isAdmin && !formOpen && (
          <div className="rb-actions">
            <button
              type="button"
              className="admin-link"
              onClick={() => {
                resetForm()
                setMessage('')
                setFormOpen(true)
              }}
            >
              ＋ 我要投稿
            </button>
          </div>
        )}

        {!isAdmin && formOpen && (
          <div className="er-form">
            <p className="er-note">
              投稿要經管理者審核才會公開，公開時不顯示你的名字。請盡量對照規則書後再投稿。
            </p>
            <label className="admin-field">
              <span>問題（{title.length}/{ERRATA_MAX_TITLE}）</span>
              <input
                type="text"
                value={title}
                maxLength={ERRATA_MAX_TITLE}
                placeholder="例如：下一季的起始玩家是誰？"
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <label className="admin-field">
              <span>答案（{content.length}/{ERRATA_MAX_CONTENT}）</span>
              <textarea
                rows={6}
                value={content}
                maxLength={ERRATA_MAX_CONTENT}
                placeholder="正確的規則是什麼、之前怎麼玩錯"
                onChange={(event) => setContent(event.target.value)}
              />
            </label>
            <label className="admin-field">
              <span>參考頁碼（選填，{page.length}/{ERRATA_MAX_PAGE}）</span>
              <input
                type="text"
                value={page}
                maxLength={ERRATA_MAX_PAGE}
                placeholder="例如：規則書第 7 頁"
                onChange={(event) => setPage(event.target.value)}
              />
            </label>
            <label className="admin-field">
              <span>來源說明（選填，{source.length}/{ERRATA_MAX_SOURCE}）</span>
              <input
                type="text"
                value={source}
                maxLength={ERRATA_MAX_SOURCE}
                placeholder="例如：2026/11 聚會"
                onChange={(event) => setSource(event.target.value)}
              />
            </label>
            <label className="er-src" style={{ display: 'block', margin: '6px 0' }}>
              <input
                type="checkbox"
                checked={verified}
                onChange={(event) => setVerified(event.target.checked)}
              />{' '}
              我已對照規則書確認
            </label>
            {formError && <p className="admin-error">{formError}</p>}
            <div className="rb-actions">
              <button type="button" className="ma-btn" disabled={busy} onClick={() => void submit()}>
                {busy ? '送出中…' : editId ? '送出修改' : '送出投稿'}
              </button>
              <button
                type="button"
                className="admin-link"
                onClick={() => {
                  resetForm()
                  setFormOpen(false)
                }}
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </details>
  )
}
