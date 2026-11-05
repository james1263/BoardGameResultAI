import { useState } from 'react'
import {
  MAX_BACKGROUND,
  MAX_LINKS,
  MAX_SOURCE_NOTE,
  useGameBackground,
} from '../lib/useGameBackground'
import { linkLabel, linksToLines, parseLinkLines } from '../lib/useGameExpansions'
import '../styles/game-expansions.css'
import '../styles/game-background.css'

export default function GameBackground({
  bggName,
  isAdmin,
}: {
  bggName: string
  isAdmin: boolean
}) {
  const api = useGameBackground(bggName)
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState('')
  const [linkText, setLinkText] = useState('')
  const [source, setSource] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const data = api.data
  const hasData = !!data && (data.content !== '' || data.links.length > 0)

  // 一般人沒有背景資料就不顯示這個區塊
  if (!isAdmin && (api.loading || !hasData)) return null

  function startEdit() {
    setText(data?.content ?? '')
    setLinkText(data ? linksToLines(data.links) : '')
    setSource(data?.sourceNote ?? '')
    setMessage('')
    setEditing(true)
  }

  async function handleSave() {
    const content = text.trim()
    const note = source.trim()
    if (content.length > MAX_BACKGROUND) {
      setMessage(`背景文字最多 ${MAX_BACKGROUND} 字。`)
      return
    }
    if (note.length > MAX_SOURCE_NOTE) {
      setMessage(`來源說明最多 ${MAX_SOURCE_NOTE} 字。`)
      return
    }
    const parsed = parseLinkLines(linkText, MAX_LINKS)
    if (parsed.error) {
      setMessage(parsed.error)
      return
    }
    setBusy(true)
    setMessage('')
    const result = await api.save(content, parsed.links, note)
    setBusy(false)
    if (result) {
      setMessage(result)
      return
    }
    setEditing(false)
  }

  return (
    <div className="modal-section">
      <details className="ov-fold">
        <summary>遊戲背景{hasData ? '' : '（尚未填寫）'}</summary>
        <div className="ov-fold-body">
          {api.error && <p className="ge-msg">{api.error}</p>}

          {hasData && data && !editing && (
            <>
              {data.content && <p className="gbg-text">{data.content}</p>}
              {data.links.length > 0 && (
                <ul className="ge-links">
                  {data.links.map((link) => (
                    <li key={link.url}>
                      <a href={link.url} target="_blank" rel="noreferrer">
                        {linkLabel(link)} <span aria-hidden="true">↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              {data.sourceNote && (
                <p className="ge-hint">來源：{data.sourceNote}</p>
              )}
              <p className="ge-hint">管理者整理，僅供參考。</p>
            </>
          )}

          {!hasData && isAdmin && !editing && (
            <p className="ge-empty">還沒有填寫這款的背景介紹。</p>
          )}

          {isAdmin && !editing && (
            <div className="ge-actions">
              <button type="button" onClick={startEdit}>
                {hasData ? '編輯' : '＋ 新增背景'}
              </button>
            </div>
          )}

          {isAdmin && editing && (
            <div className="ge-editor">
              <p className="ge-hint">
                背景文字（{MAX_BACKGROUND} 字內，可換行；AI 整理的內容可能有錯，請自行確認）
              </p>
              <textarea
                className="ge-input"
                rows={8}
                maxLength={MAX_BACKGROUND}
                value={text}
                disabled={busy}
                onChange={(event) => setText(event.target.value)}
              />
              <p className="ge-hint">{text.length} / {MAX_BACKGROUND}</p>
              <p className="ge-hint">
                連結：每行一個，格式「標籤 網址」（網址放最後，最多 {MAX_LINKS} 個，沒填標籤就直接顯示網址）
              </p>
              <textarea
                className="ge-input"
                rows={6}
                value={linkText}
                disabled={busy}
                placeholder="維基百科 https://zh.wikipedia.org/..."
                onChange={(event) => setLinkText(event.target.value)}
              />
              <p className="ge-hint">來源說明（選填，{MAX_SOURCE_NOTE} 字內）</p>
              <input
                type="text"
                className="ge-input"
                maxLength={MAX_SOURCE_NOTE}
                value={source}
                disabled={busy}
                placeholder="例如：AI 整理／維基百科"
                onChange={(event) => setSource(event.target.value)}
              />
              <p className="ge-hint">全部留空再儲存，會刪除這款的背景。</p>
              <div className="ge-actions">
                <button type="button" disabled={busy} onClick={() => void handleSave()}>
                  {busy ? '處理中…' : '儲存'}
                </button>
                <button type="button" disabled={busy} onClick={() => setEditing(false)}>
                  取消
                </button>
              </div>
            </div>
          )}

          {message && <p className="ge-msg">{message}</p>}
        </div>
      </details>
    </div>
  )
}
