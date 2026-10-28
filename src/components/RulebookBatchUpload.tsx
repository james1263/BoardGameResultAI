import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { defaultDocTitle, uploadPdfDocument } from '../lib/useGameDocuments'

type GameOption = { bgg_name: string; name: string }
type DocKind = 'rulebook' | 'faq' | 'errata'
type Lang = 'zh' | 'en'
type RowStatus = 'ready' | 'uploading' | 'done' | 'error'

type Row = {
  id: string
  file: File
  bggName: string
  docType: DocKind
  language: Lang
  query: string
  status: RowStatus
  message: string
  guessed: boolean
}

// ── 從檔名猜遊戲／類型／語言 ──────────────────────────────

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, ' ')
    .trim()
}

function compact(text: string): string {
  return normalize(text).replace(/ /g, '')
}

// 檔名裡常見、但不屬於遊戲名稱的字
const NOISE =
  /\b(rulebook|rulebooks|rules|rule|faq|errata|manual|english|chinese|en|zh|cn|tw|v\d+|final|web|print)\b/g

function guessGame(fileName: string, games: GameOption[]): string {
  const base = fileName.replace(/\.pdf$/i, '')
  const fileCompact = normalize(base).replace(NOISE, ' ').replace(/ /g, '')
  const fileRaw = base

  let bestScore = 0
  let bestNames: string[] = []

  for (const game of games) {
    const english = compact(game.bgg_name.replace(/\(.*?\)/g, ' '))
    const chinese = game.name.trim()
    let score = 0

    if (english && fileCompact && english === fileCompact) {
      score = 1000
    } else if (english.length >= 4 && fileCompact.includes(english)) {
      score = 500 + english.length
    }

    if (chinese.length >= 2 && fileRaw.includes(chinese)) {
      score = Math.max(score, 400 + chinese.length)
    }

    if (score === 0) continue
    if (score > bestScore) {
      bestScore = score
      bestNames = [game.bgg_name]
    } else if (score === bestScore) {
      bestNames.push(game.bgg_name)
    }
  }

  // 只有唯一最佳才採用；有多款同分就不猜，讓使用者自己選
  return bestNames.length === 1 ? bestNames[0] : ''
}

function guessDocType(fileName: string): DocKind {
  const lower = fileName.toLowerCase()
  if (lower.includes('faq')) return 'faq'
  if (lower.includes('errata') || fileName.includes('勘誤')) return 'errata'
  return 'rulebook'
}

function guessLanguage(fileName: string): Lang {
  if (/[\u4e00-\u9fff]/.test(fileName)) return 'zh'
  if (/(^|[^a-z])(zh|cn|tw|chinese)([^a-z]|$)/i.test(fileName)) return 'zh'
  return 'en'
}

function formatMb(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

const STATUS_LABEL: Record<RowStatus, string> = {
  ready: '待上傳',
  uploading: '上傳中',
  done: '完成',
  error: '失敗',
}

// ── 元件 ─────────────────────────────────────────────

export default function RulebookBatchUpload() {
  const [games, setGames] = useState<GameOption[]>([])
  const [gamesError, setGamesError] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [running, setRunning] = useState(false)
  const [notice, setNotice] = useState('')
  const [pickerKey, setPickerKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('board_games')
      .select('bgg_name, name')
      .order('bgg_name', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setGamesError('讀取遊戲清單失敗：' + error.message)
        } else {
          setGames((data ?? []) as GameOption[])
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    )
  }

  function removeRow(id: string) {
    setRows((current) => current.filter((row) => row.id !== id))
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList) return
    setNotice('')

    const added: Row[] = []
    const skipped: string[] = []

    for (const file of Array.from(fileList)) {
      const isPdf = /\.pdf$/i.test(file.name) || file.type === 'application/pdf'
      const duplicate =
        rows.some((r) => r.file.name === file.name && r.file.size === file.size) ||
        added.some((r) => r.file.name === file.name && r.file.size === file.size)
      if (!isPdf || duplicate) {
        skipped.push(file.name)
        continue
      }

      const guess = guessGame(file.name, games)
      added.push({
        id: crypto.randomUUID(),
        file,
        bggName: guess,
        docType: guessDocType(file.name),
        language: guessLanguage(file.name),
        query: '',
        status: 'ready',
        message: '',
        guessed: guess !== '',
      })
    }

    if (added.length > 0) setRows((current) => [...current, ...added])
    if (skipped.length > 0) {
      setNotice('已略過（不是 PDF 或已在清單中）：' + skipped.join('、'))
    }
    setPickerKey((current) => current + 1)
  }

  async function uploadAll() {
    if (running) return
    const targets = rows.filter((r) => r.status === 'ready' || r.status === 'error')
    if (targets.length === 0) return
    if (targets.some((r) => !r.bggName)) {
      setNotice('還有檔案沒有選遊戲，請先選好再上傳。')
      return
    }

    setNotice('')
    setRunning(true)

    for (const row of targets) {
      updateRow(row.id, { status: 'uploading', message: '準備中…' })

      try {
        // 同一款已有同名的上傳文件就不重複上傳
        const title = defaultDocTitle(row.file)
        const check = await supabase
          .from('game_documents')
          .select('id')
          .eq('bgg_name', row.bggName)
          .eq('title', title)
          .eq('source_type', 'upload')
          .limit(1)

        if (check.error) {
          updateRow(row.id, {
            status: 'error',
            message: '檢查重複失敗：' + check.error.message,
          })
          continue
        }
        if (check.data && check.data.length > 0) {
          updateRow(row.id, {
            status: 'error',
            message:
              '這款已有同名的上傳文件。要更新請先到該遊戲的「規則」分頁刪除舊的。',
          })
          continue
        }

        const message = await uploadPdfDocument(row.bggName, {
          file: row.file,
          docType: row.docType,
          language: row.language,
          title: '',
          edition: '',
          sourceNote: '',
          onProgress: (text) => updateRow(row.id, { message: text }),
        })

        if (message) {
          updateRow(row.id, { status: 'error', message })
        } else {
          updateRow(row.id, { status: 'done', message: '已上傳並建立索引' })
        }
      } catch (error) {
        updateRow(row.id, {
          status: 'error',
          message:
            '發生錯誤：' + (error instanceof Error ? error.message : '未知錯誤'),
        })
      }
    }

    setRunning(false)
  }

  function clearDone() {
    setRows((current) => current.filter((r) => r.status !== 'done'))
  }

  function optionsFor(row: Row): GameOption[] {
    const q = row.query.trim().toLowerCase()
    return games.filter(
      (g) =>
        g.bgg_name === row.bggName ||
        !q ||
        g.bgg_name.toLowerCase().includes(q) ||
        g.name.toLowerCase().includes(q),
    )
  }

  const pending = rows.filter((r) => r.status === 'ready' || r.status === 'error')
  const doneCount = rows.filter((r) => r.status === 'done').length
  const errorCount = rows.filter((r) => r.status === 'error').length
  const missingGame = pending.filter((r) => !r.bggName).length

  return (
    <div className="rb">
      <h3>批次上傳規則書</h3>
      <p className="rb-hint">
        一次選多個 PDF（文字版，每個最大 50 MB）。系統會從檔名猜遊戲、類型與語言，猜不到的請自己選。
        確認後按「全部上傳」，會一份一份處理，失敗不影響其他檔。上傳的 PDF 只有管理者看得到。
      </p>

      {gamesError && <p className="admin-error">{gamesError}</p>}

      <label className="rb-pick">
        <span>選擇 PDF（可多選）</span>
        <input
          key={pickerKey}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          disabled={running || games.length === 0}
          onChange={(event) => addFiles(event.target.files)}
        />
      </label>

      {notice && <p className="admin-error">{notice}</p>}

      {rows.length > 0 && (
        <>
          <ul className="rb-list">
            {rows.map((row) => {
              const locked = running || row.status === 'uploading' || row.status === 'done'
              return (
                <li className={`rb-row rb-${row.status}`} key={row.id}>
                  <div className="rb-row-head">
                    <span className="rb-file">
                      {row.file.name}
                      <small>　{formatMb(row.file.size)}</small>
                    </span>
                    <span className="rb-chip">{STATUS_LABEL[row.status]}</span>
                    {!locked && (
                      <button
                        type="button"
                        className="rb-x"
                        aria-label="移除這個檔案"
                        onClick={() => removeRow(row.id)}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {row.status !== 'done' && (
                    <div className="rb-fields">
                      <input
                        type="search"
                        className="rb-search"
                        placeholder="搜尋遊戲（英文或中文名）"
                        value={row.query}
                        disabled={locked}
                        onChange={(event) =>
                          updateRow(row.id, { query: event.target.value })
                        }
                      />
                      <select
                        className={row.bggName ? '' : 'rb-missing'}
                        value={row.bggName}
                        disabled={locked}
                        onChange={(event) =>
                          updateRow(row.id, {
                            bggName: event.target.value,
                            guessed: false,
                          })
                        }
                      >
                        <option value="">請選擇遊戲</option>
                        {optionsFor(row).map((game) => (
                          <option key={game.bgg_name} value={game.bgg_name}>
                            {game.name
                              ? `${game.name}（${game.bgg_name}）`
                              : game.bgg_name}
                          </option>
                        ))}
                      </select>
                      <div className="rb-two">
                        <select
                          value={row.docType}
                          disabled={locked}
                          onChange={(event) =>
                            updateRow(row.id, {
                              docType: event.target.value as DocKind,
                            })
                          }
                        >
                          <option value="rulebook">規則書</option>
                          <option value="faq">FAQ</option>
                          <option value="errata">勘誤</option>
                        </select>
                        <select
                          value={row.language}
                          disabled={locked}
                          onChange={(event) =>
                            updateRow(row.id, {
                              language: event.target.value as Lang,
                            })
                          }
                        >
                          <option value="en">英文</option>
                          <option value="zh">中文</option>
                        </select>
                      </div>
                      {row.guessed && row.bggName && (
                        <small className="rb-guess">遊戲是從檔名猜的，請確認</small>
                      )}
                    </div>
                  )}

                  {row.message && (
                    <p
                      className={
                        row.status === 'error' ? 'admin-error rb-msg' : 'rb-msg'
                      }
                    >
                      {row.message}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="rb-actions">
            <button
              type="button"
              className="ma-btn"
              disabled={running || pending.length === 0 || missingGame > 0}
              onClick={uploadAll}
            >
              {running
                ? '上傳中，請不要關閉視窗…'
                : errorCount > 0 && pending.length === errorCount
                  ? `重試失敗的 ${errorCount} 份`
                  : `全部上傳（${pending.length} 份）`}
            </button>
            {doneCount > 0 && !running && (
              <button type="button" className="admin-link" onClick={clearDone}>
                清除已完成的 {doneCount} 筆
              </button>
            )}
          </div>
          {missingGame > 0 && (
            <p className="rb-hint">還有 {missingGame} 份沒選遊戲。</p>
          )}
        </>
      )}
    </div>
  )
}
