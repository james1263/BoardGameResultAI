import { useRef, useState, type ChangeEvent } from 'react'
import { askConfirm, askInput } from '../lib/askConfirm'
import {
  MAX_LINKS,
  MAX_NOTE,
  expansionImageUrl,
  linkLabel,
  linksToLines,
  parseLinkLines,
  useGameExpansions,
  type GameExpansion,
} from '../lib/useGameExpansions'
import '../styles/game-expansions.css'

const MAX_NAME = 60

export type GameExpansionsApi = ReturnType<typeof useGameExpansions>

export default function GameExpansions({
  bggName,
  isAdmin,
  embedded = false,
  api: sharedApi,
}: {
  bggName: string
  isAdmin: boolean
  // 底部彈窗用：不畫自己的收合標題與外框
  embedded?: boolean
  // 外面已讀好的資料（入口卡片的數量與彈窗共用同一份）
  api?: GameExpansionsApi
}) {
  const ownApi = useGameExpansions(bggName, !sharedApi)
  const api = sharedApi ?? ownApi
  const [newName, setNewName] = useState('')
  const [newFile, setNewFile] = useState<File | null>(null)
  const [newLinks, setNewLinks] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [openLinksId, setOpenLinksId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editLinks, setEditLinks] = useState('')
  const [editNote, setEditNote] = useState('')
  const newFileRef = useRef<HTMLInputElement | null>(null)
  const replaceRef = useRef<HTMLInputElement | null>(null)
  const replaceId = useRef<string | null>(null)

  // 一般人沒有擴充就不顯示這個區塊
  if (!isAdmin && (api.loading || api.rows.length === 0)) return null

  async function run(task: () => Promise<string>) {
    setBusy(true)
    setMessage('')
    try {
      setMessage(await task())
    } finally {
      setBusy(false)
    }
  }

  async function handleAdd() {
    const name = newName.trim()
    if (name === '') {
      setMessage('請輸入擴充名稱。')
      return
    }
    if (name.length > MAX_NAME) {
      setMessage(`名稱最多 ${MAX_NAME} 字。`)
      return
    }
    // 連結選填：有填才檢查格式
    const parsed = parseLinkLines(newLinks)
    if (parsed.error) {
      setMessage(parsed.error)
      return
    }
    await run(async () => {
      const result = await api.add(name, newFile, parsed.links)
      setNewName('')
      setNewFile(null)
      setNewLinks('')
      if (newFileRef.current) newFileRef.current.value = ''
      return result
    })
  }

  async function handleRename(id: string, current: string) {
    const input = await askInput('擴充名稱', {
      defaultValue: current,
      confirmText: '儲存',
    })
    if (input === null) return
    const name = input.trim()
    if (name === '' || name.length > MAX_NAME) {
      setMessage(`名稱要 1～${MAX_NAME} 字。`)
      return
    }
    if (name === current) return
    await run(() => api.rename(id, name))
  }

  async function handleRemove(id: string, name: string) {
    const ok = await askConfirm(`要刪除擴充「${name}」嗎？`, { danger: true })
    if (!ok) return
    await run(() => api.remove(id))
  }

  function pickReplace(id: string) {
    replaceId.current = id
    replaceRef.current?.click()
  }

  async function handleReplaceFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    const id = replaceId.current
    event.target.value = ''
    replaceId.current = null
    if (!file || !id) return
    await run(() => api.replaceImage(id, file))
  }

  function startEdit(row: GameExpansion) {
    if (editId === row.id) {
      setEditId(null)
      return
    }
    setMessage('')
    setEditId(row.id)
    setEditLinks(linksToLines(row.links))
    setEditNote(row.note)
  }

  async function saveEdit(id: string) {
    const parsed = parseLinkLines(editLinks)
    if (parsed.error) {
      setMessage(parsed.error)
      return
    }
    const note = editNote.trim()
    if (note.length > MAX_NOTE) {
      setMessage(`備註最多 ${MAX_NOTE} 字。`)
      return
    }
    await run(async () => {
      const result = await api.updateDetails(id, parsed.links, note)
      if (result === '') setEditId(null)
      return result
    })
  }

  function renderName(row: GameExpansion) {
    if (row.links.length === 1) {
      return (
        <a
          className="ge-name ge-name-link"
          href={row.links[0].url}
          target="_blank"
          rel="noreferrer"
        >
          {row.name} <span aria-hidden="true">↗</span>
        </a>
      )
    }
    if (row.links.length > 1) {
      const open = openLinksId === row.id
      return (
        <button
          type="button"
          className="ge-name ge-name-link"
          aria-expanded={open}
          onClick={() => setOpenLinksId(open ? null : row.id)}
        >
          {row.name} <span aria-hidden="true">{open ? '▴' : '▾'}</span>
        </button>
      )
    }
    return <span className="ge-name">{row.name}</span>
  }

  const body = (
    <>
          {api.error && <p className="ge-msg">{api.error}</p>}

          {api.rows.length === 0 && isAdmin && (
            <p className="ge-empty">還沒有登錄擴充。</p>
          )}

          {api.rows.length > 0 && (
            <ul className="ge-list">
              {api.rows.map((row) => (
                <li key={row.id} className="ge-item">
                  <div className="ge-thumb">
                    {row.imagePath ? (
                      <img
                        src={expansionImageUrl(row.imagePath, api.imgTick)}
                        alt={row.name}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <span aria-hidden="true">🎲</span>
                    )}
                  </div>
                  <div className="ge-main">
                    {renderName(row)}
                    {row.note && <span className="ge-note">{row.note}</span>}

                    {row.links.length > 1 && openLinksId === row.id && (
                      <ul className="ge-links">
                        {row.links.map((link) => (
                          <li key={link.url}>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {linkLabel(link)} <span aria-hidden="true">↗</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}

                    {isAdmin && (
                      <div className="ge-actions">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void handleRename(row.id, row.name)}
                        >
                          改名
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => pickReplace(row.id)}
                        >
                          {row.imagePath ? '換圖' : '加圖'}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => startEdit(row)}
                        >
                          連結
                        </button>
                        <button
                          type="button"
                          className="ge-danger"
                          disabled={busy}
                          onClick={() => void handleRemove(row.id, row.name)}
                        >
                          刪除
                        </button>
                      </div>
                    )}

                    {isAdmin && editId === row.id && (
                      <div className="ge-editor">
                        <p className="ge-hint">
                          連結：每行一個，格式「標籤 網址」（網址放最後，最多{' '}
                          {MAX_LINKS} 個，沒填標籤就直接顯示網址）
                        </p>
                        <textarea
                          className="ge-input"
                          rows={4}
                          value={editLinks}
                          disabled={busy}
                          placeholder="Rising Sun: Daimyo Box https://boardgamegeek.com/..."
                          onChange={(event) => setEditLinks(event.target.value)}
                        />
                        <p className="ge-hint">備註（選填，{MAX_NOTE} 字內）</p>
                        <input
                          type="text"
                          className="ge-input"
                          maxLength={MAX_NOTE}
                          value={editNote}
                          disabled={busy}
                          placeholder="例如：收錄三個擴充／中文集資版"
                          onChange={(event) => setEditNote(event.target.value)}
                        />
                        <div className="ge-actions">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void saveEdit(row.id)}
                          >
                            {busy ? '處理中…' : '儲存'}
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => setEditId(null)}
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {isAdmin && (
            <div className="ge-form">
              <input
                type="text"
                className="ge-input"
                placeholder="擴充名稱"
                maxLength={MAX_NAME}
                value={newName}
                disabled={busy}
                onChange={(event) => setNewName(event.target.value)}
              />
              <label className="ge-file">
                {newFile ? `圖片：${newFile.name}` : '選擇圖片（選填）'}
                <input
                  ref={newFileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={busy}
                  onChange={(event) =>
                    setNewFile(event.target.files?.[0] ?? null)
                  }
                />
              </label>
              <textarea
                className="ge-input"
                rows={3}
                value={newLinks}
                disabled={busy}
                placeholder={`連結（選填，最多 ${MAX_LINKS} 個）\n每行「標籤 網址」，沒填標籤就直接顯示網址`}
                onChange={(event) => setNewLinks(event.target.value)}
              />
              <button
                type="button"
                className="ge-add"
                disabled={busy}
                onClick={() => void handleAdd()}
              >
                {busy ? '處理中…' : '＋ 新增擴充'}
              </button>
              <input
                ref={replaceRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => void handleReplaceFile(event)}
              />
            </div>
          )}

          {message && <p className="ge-msg">{message}</p>}
    </>
  )

  if (embedded) return <div className="ge-embedded">{body}</div>

  return (
    <div className="modal-section">
      <details className="ov-fold">
        <summary>
          擴充{api.rows.length > 0 ? `（${api.rows.length}）` : ''}
        </summary>
        <div className="ov-fold-body">{body}</div>
      </details>
    </div>
  )
}
