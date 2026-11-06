import { useState } from 'react'
import { askConfirm, askInput } from '../lib/askConfirm'
import { reviewSubmission, type AdminSubmission } from '../lib/useRuleSubmissions'

// 管理中心「規則書」→「投稿審核」：玩家投稿的規則連結／詞庫
export default function SubmissionsAdmin({
  rows,
  error,
  onChanged,
  onUseLink,
}: {
  rows: AdminSubmission[]
  error: string
  onChanged: () => void
  onUseLink: (row: AdminSubmission) => void
}) {
  const [message, setMessage] = useState('')

  async function approveGlossary(row: AdminSubmission) {
    if (!(await askConfirm(`核准後會直接加入《${row.game_name}》詞庫：${row.title} → ${row.value}`))) return
    const result = await reviewSubmission(row.id, true)
    setMessage(result ?? '已核准並加入詞庫。')
    onChanged()
  }

  async function reject(row: AdminSubmission) {
    const reason = await askInput('退回原因（會顯示給投稿者）', { placeholder: '例如：網址打不開' })
    if (reason === null) return
    const result = await reviewSubmission(row.id, false, reason)
    setMessage(result ?? '已退回。')
    onChanged()
  }

  return (
    <div className="er-board" style={{ marginTop: 10 }}>
      <h4 className="er-list-title">待審的連結／詞庫投稿（{rows.length}）</h4>
      {error && <p className="admin-error">{error}</p>}
      {message && <p className="er-note">{message}</p>}
      {rows.length === 0 && !error && <p className="er-note">目前沒有待審的投稿。</p>}
      <ul className="er-list">
        {rows.map((row) => (
          <li key={row.id}>
            <div className="er-title">
              《{row.game_name}》{row.kind === 'link' ? '規則連結' : '詞庫'}
              <small className="er-src">
                {' '}・{row.nickname || '（未設暱稱）'}
                {row.contact_name ? `（${row.contact_name}）` : ''}
              </small>
            </div>
            {row.kind === 'link' ? (
              <p className="er-body">
                {row.title}
                <br />
                <a href={row.value} target="_blank" rel="noopener noreferrer">
                  {row.value}
                </a>
              </p>
            ) : (
              <p className="er-body">
                {row.title} → {row.value}
              </p>
            )}
            {row.note && <small className="er-src">備註：{row.note}</small>}
            <div className="rb-actions">
              {row.kind === 'link' ? (
                <button type="button" className="ma-btn" onClick={() => onUseLink(row)}>
                  帶入「貼連結」表單
                </button>
              ) : (
                <button type="button" className="ma-btn" onClick={() => void approveGlossary(row)}>
                  核准並加入詞庫
                </button>
              )}
              <button type="button" className="admin-link" onClick={() => void reject(row)}>
                退回
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
