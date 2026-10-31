import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { askConfirm } from '../lib/askConfirm'
import {
  defaultDocTitle,
  isSafeUrl,
  uploadPdfDocument,
  useGameDocuments,
  type DocLanguage,
  type DocType,
  type GameDocument,
} from '../lib/useGameDocuments'
import { docIcon, docLabel, indexSuffix } from '../lib/docLabels'

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
  status: RowStatus
  message: string
  guessed: boolean
}
type StorageUsage = {
  buckets: { bucket_id: string; file_count: number; total_bytes: number }[]
  files: { name: string; size: number }[]
}

type UploadedDoc = {
  id: string
  bgg_name: string
  title: string | null
  doc_type: string
  created_at: string
  storage_path: string | null
}

// 免費方案的檔案儲存額度。請對照 Supabase 後台 Usage，數字不對就改這裡
const STORAGE_LIMIT_BYTES = 1024 * 1024 * 1024

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

    if (chinese.length >= 2 && base.includes(chinese)) {
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

function UsageBar({
  usage,
  error,
}: {
  usage: StorageUsage | null
  error: string
}) {
  if (error) return <p className="admin-error">{error}</p>
  if (!usage) return <p className="rb-hint">讀取容量中…</p>
  const rulebooks = usage.buckets.find((b) => b.bucket_id === 'rulebooks')
  const total = usage.buckets.reduce((sum, b) => sum + b.total_bytes, 0)
  const percent = Math.min(100, Math.round((total / STORAGE_LIMIT_BYTES) * 100))
  const left = Math.max(0, STORAGE_LIMIT_BYTES - total)
  return (
    <div className="rb-usage">
      <p>
        檔案儲存：已用 {formatMb(total)} / {formatMb(STORAGE_LIMIT_BYTES)}，
        剩餘 {formatMb(left)}
      </p>
      <div className="rb-usage-bar" aria-hidden="true">
        <div style={{ width: `${percent}%` }} />
      </div>
      <small>
        規則書 {rulebooks?.file_count ?? 0} 份、{formatMb(rulebooks?.total_bytes ?? 0)}（封面等其他檔案也算在總量內）
      </small>
    </div>
  )
}

const LARGE_FILE_BYTES = 15 * 1024 * 1024

const STATUS_LABEL: Record<RowStatus, string> = {
  ready: '待上傳',
  uploading: '上傳中',
  done: '完成',
  error: '失敗',
}

// 語言只是顯示用的標記（檢索不看語言）：影片＝其他、中文介紹＝中文、其餘看標題有沒有中文字
function guessLinkLanguage(type: DocType, title: string): DocLanguage {
  if (type === 'video') return 'other'
  if (type === 'intro') return 'zh'
  return /[\u4e00-\u9fff]/.test(title) ? 'zh' : 'en'
}

// 影片網站的連結：貼上時自動把類型選成「影片」
function isVideoUrl(url: string): boolean {
  return /^https?:\/\/([a-z0-9-]+\.)*(youtube\.com|youtu\.be|bilibili\.com|b23\.tv|vimeo\.com)\//i.test(
    url.trim(),
  )
}

// ── 遊戲選擇（輸入就自動列出符合的遊戲，點一下就選好） ──────────

function gameLabel(game: GameOption): string {
  return game.name ? `${game.name}（${game.bgg_name}）` : game.bgg_name
}

function GamePicker({
  games,
  value,
  onChange,
  disabled,
}: {
  games: GameOption[]
  value: string
  onChange: (bggName: string) => void
  disabled?: boolean
}) {
  const [query, setQuery] = useState('')
  const selected = games.find((g) => g.bgg_name === value)

  // 已選好：顯示名稱＋「更換」
  if (selected) {
    return (
      <div className="rb-picked">
        <span>{gameLabel(selected)}</span>
        <button
          type="button"
          className="admin-link"
          disabled={disabled}
          onClick={() => {
            onChange('')
            setQuery('')
          }}
        >
          更換
        </button>
      </div>
    )
  }

  const q = compact(query)
  const matches = q
    ? games
      .filter(
        (g) =>
          compact(g.bgg_name).includes(q) || compact(g.name).includes(q),
      )
      .sort((x, y) => {
        const xs =
          compact(x.bgg_name).startsWith(q) || compact(x.name).startsWith(q)
        const ys =
          compact(y.bgg_name).startsWith(q) || compact(y.name).startsWith(q)
        return Number(ys) - Number(xs)
      })
      .slice(0, 8)
    : []

  return (
    <div className="rb-combo">
      <input
        type="search"
        className="rb-search rb-missing"
        placeholder="輸入遊戲名稱（英文或中文），會自動列出符合的遊戲"
        value={query}
        disabled={disabled}
        onChange={(event) => setQuery(event.target.value)}
      />
      {q && matches.length > 0 && (
        <ul className="rb-suggest">
          {matches.map((game) => (
            <li key={game.bgg_name}>
              <button
                type="button"
                onClick={() => {
                  onChange(game.bgg_name)
                  setQuery('')
                }}
              >
                {gameLabel(game)}
              </button>
            </li>
          ))}
        </ul>
      )}
      {q && matches.length === 0 && (
        <p className="rb-hint">找不到符合的遊戲，換個關鍵字試試。</p>
      )}
    </div>
  )
}

// ── 元件 ─────────────────────────────────────────────

export default function RulebookBatchUpload() {
  const [mode, setMode] = useState<'pdf' | 'link' | 'files'>('pdf')
  const [usage, setUsage] = useState<StorageUsage | null>(null)
  const [usageError, setUsageError] = useState('')
  const [uploaded, setUploaded] = useState<UploadedDoc[]>([])
  const [fileSearch, setFileSearch] = useState('')

  const loadUsage = useCallback(async () => {
    const [usageResult, docsResult] = await Promise.all([
      supabase.rpc('admin_rulebook_storage_usage'),
      supabase
        .from('game_documents')
        .select('id, bgg_name, title, doc_type, created_at, storage_path')
        .eq('source_type', 'upload')
        .order('created_at', { ascending: false }),
    ])
    if (usageResult.error) {
      setUsageError('讀取容量失敗：' + usageResult.error.message)
    } else {
      setUsageError('')
      setUsage(usageResult.data as StorageUsage)
    }
    if (!docsResult.error) setUploaded((docsResult.data ?? []) as UploadedDoc[])
  }, [])

  useEffect(() => {
    void loadUsage()
  }, [loadUsage, mode])
  const [games, setGames] = useState<GameOption[]>([])
  const [gamesError, setGamesError] = useState('')

  // 批次上傳 PDF
  const [rows, setRows] = useState<Row[]>([])
  const [running, setRunning] = useState(false)
  const [notice, setNotice] = useState('')
  const [pickerKey, setPickerKey] = useState(0)

  // 貼連結
  const [linkGame, setLinkGame] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkBusy, setLinkBusy] = useState(false)
  const [linkError, setLinkError] = useState('')
  const [linkDone, setLinkDone] = useState('')
  const [titleLoading, setTitleLoading] = useState(false)
  const docsApi = useGameDocuments(linkGame)

  // 貼 YouTube 連結時，自動試著抓影片名稱填進標題（抓不到就維持空白，可自己填）
  useEffect(() => {
    const url = linkUrl.trim()
    if (!/^https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//i.test(url)) {
      setTitleLoading(false)
      return
    }
    let cancelled = false
    setTitleLoading(true)
    const timer = window.setTimeout(() => {
      fetch(
        'https://www.youtube.com/oembed?format=json&url=' +
        encodeURIComponent(url),
      )
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (cancelled) return
          const title = data && typeof data.title === 'string' ? data.title : ''
          if (title) setLinkTitle((current) => current || title)
        })
        .catch(() => { })
        .finally(() => {
          if (!cancelled) setTitleLoading(false)
        })
    }, 500)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [linkUrl])

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
        status: 'ready',
        message: '',
        guessed: guess !== '',
      })
    }

    if (added.length > 0) setRows((current) => [...added, ...current])
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
            message: '這款已有同名的上傳文件。要更新請先在「貼連結」分頁選這款遊戲，刪除舊的。',
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
    void loadUsage()
  }

  function clearDone() {
    setRows((current) => current.filter((r) => r.status !== 'done'))
  }

  async function submitLink(event: FormEvent) {
    event.preventDefault()
    setLinkError('')
    setLinkDone('')
    if (!linkGame) {
      setLinkError('請先選擇遊戲。')
      return
    }
    const linkType: DocType = isVideoUrl(linkUrl) ? 'video' : 'other'
    setLinkBusy(true)
    const message = await docsApi.addDoc({
      docType: linkType,
      language: guessLinkLanguage(linkType, linkTitle),
      title: linkTitle,
      url: linkUrl,
    })

    setLinkBusy(false)

    if (message) {
      setLinkError(message)
      return
    }
    setLinkTitle('')
    setLinkUrl('')
    setLinkDone('已新增連結。')
  }

  async function deleteLinkDoc(doc: GameDocument) {
    const text =
      doc.source_type === 'upload'
        ? '確定要刪除這份文件嗎？PDF 原檔與搜尋索引都會一起刪除，無法復原。'
        : '確定要刪除這份文件連結嗎？'
    if (!(await askConfirm(text))) return
    setLinkError('')
    setLinkDone('')
    const message = await docsApi.deleteDoc(doc)
    if (message) setLinkError(message)
    else void loadUsage()
  }

  const pending = rows.filter((r) => r.status === 'ready' || r.status === 'error')
  const doneCount = rows.filter((r) => r.status === 'done').length
  const errorCount = rows.filter((r) => r.status === 'error').length
  const missingGame = pending.filter((r) => !r.bggName).length
  const sizeByName = new Map((usage?.files ?? []).map((f) => [f.name, f.size]))
  const fileQuery = compact(fileSearch)
  const shownUploaded = uploaded.filter((doc) => {
    const game = games.find((g) => g.bgg_name === doc.bgg_name)
    const text = compact(`${doc.bgg_name} ${game?.name ?? ''} ${doc.title ?? ''}`)
    return !fileQuery || text.includes(fileQuery)
  })

  return (
    <div className="rb">
      <UsageBar usage={usage} error={usageError} />
      <div className="rb-seg" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'pdf'}
          className={mode === 'pdf' ? 'active' : ''}
          disabled={running}
          onClick={() => setMode('pdf')}
        >
          上傳 PDF
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'link'}
          className={mode === 'link' ? 'active' : ''}
          disabled={running}
          onClick={() => setMode('link')}
        >
          貼連結／管理文件
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'files'}
          className={mode === 'files' ? 'active' : ''}
          disabled={running}
          onClick={() => setMode('files')}
        >
          已上傳
        </button>
      </div>

      {gamesError && <p className="admin-error">{gamesError}</p>}

      {mode === 'files' && (
        <>
          <h3>已上傳的規則書</h3>
          <input
            type="search"
            className="rb-search"
            placeholder="搜尋遊戲名稱或檔名"
            value={fileSearch}
            onChange={(event) => setFileSearch(event.target.value)}
          />
          {shownUploaded.length === 0 ? (
            <p className="rb-hint">沒有符合的上傳文件。</p>
          ) : (
            <ul className="rb-list">
              {shownUploaded.map((doc) => {
                const game = games.find((g) => g.bgg_name === doc.bgg_name)
                const size = sizeByName.get(doc.storage_path ?? `${doc.id}.pdf`)
                return (
                  <li className="rb-row" key={doc.id}>
                    <div className="rb-row-head">
                      <span className="rb-file">
                        {game?.name || doc.bgg_name}
                        <small>
                          {doc.title ?? ''}
                          {size != null ? `　${formatMb(size)}` : ''}
                        </small>
                      </span>
                      <button
                        type="button"
                        className="admin-link"
                        onClick={() => {
                          setLinkGame(doc.bgg_name)
                          setLinkError('')
                          setLinkDone('')
                          setMode('link')
                        }}
                      >
                        前往刪除
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}

      {mode === 'pdf' && (
        <>
          <h3>批次上傳規則書</h3>
          <p className="rb-hint">
            一次選多個 PDF（文字版，每個最大 50 MB）。用瀏覽器開啟能選取文字或按 Ctrl+F 搜尋，才算可用的文字版。系統會從檔名猜遊戲，猜不到的請自己選。
            檔名含 faq 或 errata／勘誤會自動歸類，其餘當規則書。確認後按「全部上傳」，
            會一份一份處理，失敗不影響其他檔。上傳的 PDF 只有管理者看得到。
          </p>

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
                  const locked =
                    running || row.status === 'uploading' || row.status === 'done'
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
                          <GamePicker
                            games={games}
                            value={row.bggName}
                            disabled={locked}
                            onChange={(bggName) =>
                              updateRow(row.id, { bggName, guessed: false })
                            }
                          />
                          {row.guessed && row.bggName && (
                            <small className="rb-guess">遊戲是從檔名猜的，請確認</small>
                          )}
                        </div>
                      )}

                      {row.file.size > LARGE_FILE_BYTES &&
                        row.status !== 'done' && (
                          <p className="rb-warn">
                            檔案偏大（{formatMb(row.file.size)}）。仍可上傳，但若官方有
                            Lo-res／Compact 版，建議改用較小的檔案。
                          </p>
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
        </>
      )}

      {mode === 'link' && (
        <>
          <h3>貼連結／管理文件</h3>
          <p className="rb-hint">
            先選遊戲，下面會列出這款已有的文件（可刪除），也可以新增影片或網頁連結。
            網址是 YouTube、bilibili、vimeo 會自動當影片，其他當網頁。
          </p>

          <form className="rb-fields rb-linkform" onSubmit={submitLink}>
            <GamePicker
              games={games}
              value={linkGame}
              onChange={(bggName) => {
                setLinkGame(bggName)
                setLinkError('')
                setLinkDone('')
              }}
            />

            {linkGame && (
              <>
                <div className="rb-doclist">
                  {docsApi.isLoading && <p className="rb-hint">載入文件中…</p>}
                  {docsApi.loadError && (
                    <p className="admin-error">{docsApi.loadError}</p>
                  )}
                  {!docsApi.isLoading &&
                    !docsApi.loadError &&
                    docsApi.docs.length === 0 && (
                      <p className="rb-hint">這款還沒有任何文件。</p>
                    )}
                  <ul>
                    {docsApi.docs.map((doc) => (
                      <li key={doc.id} className="rb-docitem">
                        {doc.source_type === 'external' &&
                          isSafeUrl(doc.external_url) ? (
                          <a
                            className="bgg-link"
                            href={doc.external_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {docIcon(doc)} {docLabel(doc)} ↗
                          </a>
                        ) : (
                          <span>
                            {docIcon(doc)} {docLabel(doc)}
                            {indexSuffix(doc)}
                          </span>
                        )}
                        <button
                          type="button"
                          className="admin-link"
                          onClick={() => deleteLinkDoc(doc)}
                        >
                          刪除
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <strong>新增連結</strong>
                <label className="admin-field">
                  <span>
                    標題（選填，例如：官方 FAQ）
                    {titleLoading && '　正在讀取影片名稱…'}
                  </span>
                  <input
                    type="text"
                    value={linkTitle}
                    onChange={(event) => setLinkTitle(event.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>網址</span>
                  <input
                    type="url"
                    placeholder="https://"
                    value={linkUrl}
                    onChange={(event) => setLinkUrl(event.target.value)}
                  />
                </label>
                {linkUrl.trim() !== '' && (
                  <p className="rb-hint">
                    將新增為：{isVideoUrl(linkUrl) ? '▶ 影片' : '🔗 網頁'}
                  </p>
                )}

                {linkError && <p className="admin-error">{linkError}</p>}
                {linkDone && <p className="rb-msg">{linkDone}</p>}

                <button className="ma-btn" type="submit" disabled={linkBusy}>
                  {linkBusy ? '新增中…' : '新增連結'}
                </button>
              </>
            )}
          </form>
        </>
      )}
    </div>
  )
}
