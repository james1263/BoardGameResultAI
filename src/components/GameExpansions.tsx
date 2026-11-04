import { useRef, useState, type ChangeEvent } from 'react'
import { askConfirm, askInput } from '../lib/askConfirm'
import { expansionImageUrl, useGameExpansions } from '../lib/useGameExpansions'
import '../styles/game-expansions.css'

const MAX_NAME = 60

export default function GameExpansions({
  bggName,
  isAdmin,
}: {
  bggName: string
  isAdmin: boolean
}) {
  const api = useGameExpansions(bggName)
  const [newName, setNewName] = useState('')
  const [newFile, setNewFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
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
    await run(async () => {
      const result = await api.add(name, newFile)
      setNewName('')
      setNewFile(null)
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

  return (
    <div className="modal-section">
      <details className="ov-fold">
        <summary>
          擴充{api.rows.length > 0 ? `（${api.rows.length}）` : ''}
        </summary>
        <div className="ov-fold-body">
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
                    <span className="ge-name">{row.name}</span>
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
                          className="ge-danger"
                          disabled={busy}
                          onClick={() => void handleRemove(row.id, row.name)}
                        >
                          刪除
                        </button>
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
        </div>
      </details>
    </div>
  )
}
