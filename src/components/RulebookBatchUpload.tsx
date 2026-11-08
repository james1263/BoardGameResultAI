import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { askConfirm, askInput } from '../lib/askConfirm'
import { takeEmptyPageNote } from '../lib/extractPdfText'
import {
  defaultDocTitle,
  isSafeUrl,
  uploadPdfDocument,
  useGameDocuments,
  type DocLanguage,
  type DocScope,
  updateDocScope,
  type DocType,
  type GameDocument,
} from '../lib/useGameDocuments'
import { docIcon, docLabel, indexSuffix, scopeLabel, SCOPE_LABELS } from '../lib/docLabels'
import '../styles/rb-docs.css'
import '../styles/rb-docs-tidy.css'
import '../styles/rb-admin-v2.css'
import ErrataAdmin from './ErrataAdmin'
import GlossaryAdmin from './GlossaryAdmin'
import GlossaryMisses from './GlossaryMisses'
import PendingBadge from './PendingBadge'
import SubmissionsAdmin from './SubmissionsAdmin'
import { reviewSubmission, useAdminSubmissions, type AdminSubmission } from '../lib/useRuleSubmissions'

type GameOption = {
  bgg_name: string
  name: string
  removed_at?: string | null
  reference_only?: boolean | null
}
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
  scope: DocScope
  expansionName: string
}
type StorageUsage = {
  buckets: { bucket_id: string; file_count: number; total_bytes: number }[]
  files: { name: string; size: number }[]
}

type AllDoc = {
  id: string
  bgg_name: string
  title: string | null
  source_type: string
  storage_path: string | null
  doc_type?: string | null
  ai_indexed?: boolean | null
  index_status?: string | null
  page_count?: number | null
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
  /\b(rulebook|rulebooks|rules|rule|faq|errata|manual|english|chinese|en|zh|cn|tw|v\d+|final|web|print|compressed|ocr|pager|teach|aid)\b/g

// 遊戲名稱裡的版本字（Second Edition、2e…），比對時不當成名稱的一部分
const EDITION_WORDS = new Set([
  'the', 'a', 'an', 'of', 'and', 'edition', 'ed', 'second', 'first', 'third',
  '1st', '2nd', '3rd', '1e', '2e', '3e',
])

function coreName(text: string): string {
  return normalize(text.replace(/\(.*?\)/g, ' '))
    .split(' ')
    .filter((t) => t && !EDITION_WORDS.has(t))
    .join('')
}

function guessGame(fileName: string, games: GameOption[]): string {
  const base = fileName.replace(/\.pdf$/i, '')
  const fileCompact = normalize(base).replace(NOISE, ' ').replace(/ /g, '')

  let bestScore = 0
  let bestNames: string[] = []

  for (const game of games) {
    const english = coreName(game.bgg_name)
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

function guessScope(fileName: string): DocScope {
  const lower = fileName.toLowerCase()
  if (lower.includes('faq') || lower.includes('errata') || fileName.includes('勘誤')) return 'faq'
  if (lower.includes('expansion') || fileName.includes('擴充')) return 'expansion'
  // 玩家整理的檔案（非官方）：預設猜「玩家整理」，猜錯可在文件列改範圍
  if (
    /player|fan[-_ ]?made|cheat|summary|reference|one[-_ ]?pag|quick[-_ ]?(ref|guide)|teach/i.test(fileName) ||
    /玩家整理|整理|懶人包|速查|摘要/.test(fileName)
  )
    return 'player_notes' as DocScope
  return 'main'
}

function formatMb(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

type CoverRow = {
  game: GameOption
  uploads: number
  indexed: number
  links: number
  pages: number
}
type YesNo = 'all' | 'yes' | 'no'

function buildCoverRows(games: GameOption[], docs: AllDoc[]): CoverRow[] {
  const byGame = new Map<string, AllDoc[]>()
  for (const d of docs) {
    const list = byGame.get(d.bgg_name)
    if (list) list.push(d)
    else byGame.set(d.bgg_name, [d])
  }
  const rank = (r: CoverRow) =>
    r.uploads === 0 && r.links === 0 ? 0 : r.uploads === 0 ? 1 : r.links === 0 ? 2 : 3
  return games
    .filter((g) => !g.removed_at && !g.reference_only)
    .map((game) => {
      const list = byGame.get(game.bgg_name) ?? []
      const uploads = list.filter((d) => d.source_type === 'upload')
      const indexed = uploads.filter((d) => d.ai_indexed && d.index_status === 'completed')
      const links = list.filter((d) => d.source_type !== 'upload')
      const pages = indexed.reduce((sum, d) => sum + (d.page_count ?? 0), 0)
      return { game, uploads: uploads.length, indexed: indexed.length, links: links.length, pages }
    })
    .sort(
      (a, b) =>
        rank(a) - rank(b) ||
        (a.game.name || a.game.bgg_name).localeCompare(b.game.name || b.game.bgg_name, 'zh-Hant'),
    )
}

// ── 統計卡（可點：直接套用下方篩選）─────────────────────────
function OverviewCards({
  usage,
  error,
  rows,
  loaded,
  onApply,
}: {
  usage: StorageUsage | null
  error: string
  rows: CoverRow[]
  loaded: boolean
  onApply: (pdf: YesNo, link: YesNo, pendingOnly: boolean) => void
}) {
  const total = usage ? usage.buckets.reduce((sum, b) => sum + b.total_bytes, 0) : 0
  const percent = Math.min(100, Math.round((total / STORAGE_LIMIT_BYTES) * 100))
  const uploaded = rows.filter((r) => r.uploads > 0).length
  const pending = rows.filter((r) => r.uploads > 0 && r.indexed === 0).length
  const linked = rows.filter((r) => r.links > 0).length
  const none = rows.filter((r) => r.uploads === 0 && r.links === 0).length
  const dash = (value: string | number) => (loaded ? value : '—')
  return (
    <div className="rbv-cards">
      <button type="button" className="rbv-card" onClick={() => onApply('yes', 'all', false)}>
        <span className="rbv-card-label">已上傳規則書</span>
        <span className="rbv-card-num">
          {dash(uploaded)}
          <small> / {dash(rows.length)}</small>
        </span>
        <span className="rbv-card-sub">
          {pending > 0 ? (
            <span
              role="button"
              tabIndex={0}
              className="rbv-card-link"
              onClick={(event) => {
                event.stopPropagation()
                onApply('yes', 'all', true)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.stopPropagation()
                  onApply('yes', 'all', true)
                }
              }}
            >
              索引未完成 {pending}
            </span>
          ) : (
            '索引都完成'
          )}
        </span>
      </button>
      <button type="button" className="rbv-card" onClick={() => onApply('all', 'yes', false)}>
        <span className="rbv-card-label">有連結的遊戲</span>
        <span className="rbv-card-num">{dash(linked)}</span>
        <span className="rbv-card-sub">未連結 {dash(rows.length - linked)}</span>
      </button>
      <button type="button" className="rbv-card rbv-card-warn" onClick={() => onApply('no', 'no', false)}>
        <span className="rbv-card-label">什麼都沒有</span>
        <span className="rbv-card-num">{dash(none)}</span>
        <span className="rbv-card-sub">沒 PDF、沒連結</span>
      </button>
      <div className="rbv-card rbv-card-static">
        <span className="rbv-card-label">檔案用量</span>
        {error ? (
          <span className="rbv-card-sub">{error}</span>
        ) : !usage ? (
          <span className="rbv-card-sub">讀取中…</span>
        ) : (
          <>
            <span className="rbv-card-num rbv-card-num-sm">
              {formatMb(total)}
              <small> / {formatMb(STORAGE_LIMIT_BYTES)}</small>
            </span>
            <span className="rbv-bar" aria-hidden="true">
              <span style={{ width: `${percent}%` }} />
            </span>
          </>
        )}
      </div>
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

// ── 文件列表裡，單一遊戲展開後的文件 ───────────────────────

function GameDocGroup({
  bggName,
  sizeByName,
  onDeleted,
  onChanged,
  filter,
}: {
  bggName: string
  sizeByName: Map<string, number>
  onDeleted: () => void
  onChanged: () => void
  filter: (doc: GameDocument) => boolean
}) {
  const docsApi = useGameDocuments(bggName)
  const [error, setError] = useState('')

  async function remove(doc: GameDocument) {
    const text =
      doc.source_type === 'upload'
        ? '確定要刪除這份文件嗎？PDF 原檔與搜尋索引都會一起刪除，無法復原。'
        : '確定要刪除這份文件連結嗎？'
    if (!(await askConfirm(text))) return
    setError('')
    const message = await docsApi.deleteDoc(doc)
    if (message) setError(message)
    else onDeleted()
  }

  async function changeScope(doc: GameDocument, scope: DocScope) {
    let name = doc.expansion_name ?? ''
    if (scope === 'expansion') {
      const input = await askInput('擴充名稱（例如 Kami Unbound）', {
        placeholder: 'Kami Unbound',
        defaultValue: name,
      })
      if (input === null) return
      name = input.trim()
    }
    const message = await updateDocScope(doc.id, scope, name)
    if (message) setError(message)
    else onChanged()
  }

  return (
    <div className="rbd-body">
      {docsApi.isLoading && <p className="rb-hint">載入文件中…</p>}
      {docsApi.loadError && <p className="admin-error">{docsApi.loadError}</p>}
      {error && <p className="admin-error">{error}</p>}
      <ul>
        {docsApi.docs.filter(filter).map((doc) => {
          const size =
            doc.source_type === 'upload' ? sizeByName.get(`${doc.id}.pdf`) : undefined
          return (
            <li key={doc.id} className="rb-docitem">
              {doc.source_type === 'external' && isSafeUrl(doc.external_url) ? (
                <a
                  className="bgg-link"
                  href={doc.external_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {docIcon(doc)} {docLabel(doc)} ↗
                </a>
              ) : (
                <span className="rbd-docname">
                  {docIcon(doc)} {docLabel(doc)}
                  {indexSuffix(doc)}
                  {size != null && <span className="rbd-size">　{formatMb(size)}</span>}
                </span>
              )}
              <div className="rbd-actions">
              {doc.source_type === 'upload' && (
                <select
                  className="rbd-scope"
                  title={scopeLabel(doc.content_scope, doc.expansion_name)}
                  value={doc.content_scope ?? 'main'}
                  onChange={(event) =>
                    void changeScope(doc, event.target.value as DocScope)
                  }
                >
                  {(Object.keys(SCOPE_LABELS) as DocScope[]).map((key) => (
                    <option key={key} value={key}>
                      {SCOPE_LABELS[key]}
                    </option>
                  ))}
                </select>
              )}
              <button
                type="button"
                className="rbd-del"
                onClick={() => remove(doc)}
              >
                刪除
              </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ── 元件 ─────────────────────────────────────────────

// ── 規則書清單：雙重篩選（規則書狀態 × 連結狀態）＋每列雙徽章 ───────

function FilterChips({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: YesNo
  options: { key: YesNo; text: string; n: number }[]
  onChange: (value: YesNo) => void
}) {
  return (
    <div className="rbv-filter">
      <span className="rbv-filter-label">{label}</span>
      <div className="rbv-chips" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            aria-pressed={value === o.key}
            className={`rbv-chip ${value === o.key ? 'active' : ''}`}
            onClick={() => onChange(o.key)}
          >
            {o.text}
            <small>{o.n}</small>
          </button>
        ))}
      </div>
    </div>
  )
}

function RulebookOverviewList({
  rows,
  loaded,
  pdfFilter,
  setPdfFilter,
  linkFilter,
  setLinkFilter,
  pendingOnly,
  setPendingOnly,
  query,
  setQuery,
  openIds,
  onToggle,
  sizeByName,
  listTick,
  onChanged,
  onDeleted,
  onAddLink,
}: {
  rows: CoverRow[]
  loaded: boolean
  pdfFilter: YesNo
  setPdfFilter: (v: YesNo) => void
  linkFilter: YesNo
  setLinkFilter: (v: YesNo) => void
  pendingOnly: boolean
  setPendingOnly: (v: boolean) => void
  query: string
  setQuery: (v: string) => void
  openIds: string[]
  onToggle: (bggName: string) => void
  sizeByName: Map<string, number>
  listTick: number
  onChanged: () => void
  onDeleted: () => void
  onAddLink: (bggName: string) => void
}) {
  const [listOpen, setListOpen] = useState(false)
  const q = query.trim().toLocaleLowerCase()
  const shown = rows.filter((r) => {
    if (pdfFilter === 'yes' && r.uploads === 0) return false
    if (pdfFilter === 'no' && r.uploads > 0) return false
    if (linkFilter === 'yes' && r.links === 0) return false
    if (linkFilter === 'no' && r.links > 0) return false
    if (pendingOnly && !(r.uploads > 0 && r.indexed === 0)) return false
    if (q && !r.game.name.toLocaleLowerCase().includes(q) && !r.game.bgg_name.toLocaleLowerCase().includes(q)) {
      return false
    }
    return true
  })
  const upN = rows.filter((r) => r.uploads > 0).length
  const lkN = rows.filter((r) => r.links > 0).length
  const pendingN = rows.filter((r) => r.uploads > 0 && r.indexed === 0).length
  const filtered = pdfFilter !== 'all' || linkFilter !== 'all' || pendingOnly || q !== ''

  return (
    <section className="rbv-list">
      <button
        type="button"
        className="rbv-list-head rbv-list-toggle"
        aria-expanded={listOpen}
        onClick={() => setListOpen((v) => !v)}
      >
        <h3>規則書清單 {listOpen ? '▾' : '▸'}</h3>
        <small>
          {loaded
            ? `已上傳 ${upN}／${rows.length}・已連結 ${lkN}${pendingN > 0 ? `・索引未完成 ${pendingN}` : ''}`
            : '讀取中…'}
        </small>
      </button>

      {listOpen && (
      <>
      <div className="rbv-filters">
        <FilterChips
          label="規則書"
          value={pdfFilter}
          onChange={setPdfFilter}
          options={[
            { key: 'all', text: '全部', n: rows.length },
            { key: 'yes', text: '已上傳', n: upN },
            { key: 'no', text: '未上傳', n: rows.length - upN },
          ]}
        />
        <FilterChips
          label="連結"
          value={linkFilter}
          onChange={setLinkFilter}
          options={[
            { key: 'all', text: '全部', n: rows.length },
            { key: 'yes', text: '已連結', n: lkN },
            { key: 'no', text: '未連結', n: rows.length - lkN },
          ]}
        />
        <div className="rbv-filter">
          <span className="rbv-filter-label">索引</span>
          <div className="rbv-chips">
            <button
              type="button"
              aria-pressed={pendingOnly}
              className={`rbv-chip ${pendingOnly ? 'active' : ''}`}
              onClick={() => setPendingOnly(!pendingOnly)}
            >
              只看索引未完成<small>{pendingN}</small>
            </button>
          </div>
        </div>
      </div>

      <div className="rbv-searchrow">
        <input
          className="rbv-search"
          type="search"
          placeholder="搜尋遊戲名稱"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {filtered && (
          <button
            type="button"
            className="rbv-clear"
            onClick={() => {
              setPdfFilter('all')
              setLinkFilter('all')
              setPendingOnly(false)
              setQuery('')
            }}
          >
            清除篩選
          </button>
        )}
      </div>
      <p className="rbv-count">
        顯示 {shown.length} / {rows.length} 款
        {pdfFilter !== 'all' || linkFilter !== 'all' ? '（兩組篩選同時生效）' : ''}
      </p>

      <p className="rbv-note">
        「已上傳」不等於可搜尋：要看到「已建立索引」才表示規則助手搜得到。垃圾桶與「僅供參考」的遊戲不列入。
      </p>

      {!loaded ? (
        <p className="rb-hint">讀取中…</p>
      ) : shown.length === 0 ? (
        <p className="rb-hint">沒有符合的遊戲。</p>
      ) : (
        <ul className="rbv-rows">
          {shown.map((r) => {
            const id = r.game.bgg_name
            const open = openIds.includes(id)
            const pdfBadge =
              r.uploads === 0
                ? { cls: 'bad', text: '規則書：未上傳' }
                : r.indexed > 0
                  ? { cls: 'ok', text: `規則書：已索引${r.pages > 0 ? `・${r.pages} 頁` : ''}` }
                  : { cls: 'warn', text: '規則書：已上傳・索引未完成' }
            const linkBadge =
              r.links > 0
                ? { cls: 'ok', text: `連結：已連結 ${r.links}` }
                : { cls: 'muted', text: '連結：未連結' }
            return (
              <li key={id} className={`rbv-row ${open ? 'open' : ''}`}>
                <button
                  type="button"
                  className="rbv-row-head"
                  aria-expanded={open}
                  onClick={() => onToggle(id)}
                >
                  <span className="rbv-row-name">{r.game.name || id}</span>
                  <span className="rbv-badges">
                    <span className={`rbv-badge ${pdfBadge.cls}`}>{pdfBadge.text}</span>
                    <span className={`rbv-badge ${linkBadge.cls}`}>{linkBadge.text}</span>
                  </span>
                  <span className="rbv-arrow" aria-hidden="true">
                    {open ? '▴' : '▾'}
                  </span>
                </button>
                {open && (
                  <div className="rbv-row-body">
                    <div className="rbv-row-actions">
                      <button type="button" className="rbv-mini" onClick={() => onAddLink(id)}>
                        ＋ 貼這款的連結
                      </button>
                      <span className="rbv-row-tip">
                        上傳 PDF 請用上方「＋ 上傳 PDF」，遊戲選這一款。
                      </span>
                    </div>
                    {r.uploads === 0 && r.links === 0 && (
                      <p className="rb-hint">這款還沒有任何規則書或連結。</p>
                    )}
                    <GameDocGroup
                      key={`${id}-${listTick}`}
                      bggName={id}
                      sizeByName={sizeByName}
                      filter={() => true}
                      onChanged={onChanged}
                      onDeleted={onDeleted}
                    />
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
      </>
      )}
    </section>
  )
}

export default function RulebookBatchUpload({
  pendingErrata = 0,
}: {
  pendingErrata?: number
}) {
  const [mode, setMode] = useState<'pdf' | 'link' | 'errata' | 'glossary' | null>(null)
  const subs = useAdminSubmissions(true)
  const linkPending = subs.rows.filter((row) => row.kind === 'link').length
  const glossaryPending = subs.rows.filter((row) => row.kind === 'glossary').length
  // 從玩家投稿帶進「貼連結」表單時，記下投稿 id，新增成功後才標成已核准
  const [linkFromSub, setLinkFromSub] = useState<string | null>(null)
  const [usage, setUsage] = useState<StorageUsage | null>(null)
  const [usageError, setUsageError] = useState('')
  const [allDocs, setAllDocs] = useState<AllDoc[]>([])
  const [docsLoaded, setDocsLoaded] = useState(false)
  const [listSearch, setListSearch] = useState('')
  const [openGames, setOpenGames] = useState<string[]>([])
  const [listTick, setListTick] = useState(0)
  const [sortBySize, setSortBySize] = useState(false)
  const [clearingGame, setClearingGame] = useState('')
  const [orphanMsg, setOrphanMsg] = useState('')
  const [errataCounts, setErrataCounts] = useState<Map<string, number>>(new Map())

  const loadUsage = useCallback(async () => {
    const [usageResult, docsResult] = await Promise.all([
      supabase.rpc('admin_rulebook_storage_usage'),
      supabase
        .from('game_documents')
        .select('id, bgg_name, title, source_type, storage_path, doc_type, ai_indexed, index_status, page_count')
        .order('created_at', { ascending: false }),
    ])
    if (usageResult.error) {
      setUsageError('讀取容量失敗：' + usageResult.error.message)
    } else {
      setUsageError('')
      setUsage(usageResult.data as StorageUsage)
    }
    if (!docsResult.error) {
      setAllDocs((docsResult.data ?? []) as AllDoc[])
      setDocsLoaded(true)
    }
    const errataResult = await supabase.rpc('admin_count_game_errata')
    if (!errataResult.error) {
      setErrataCounts(
        new Map(
          ((errataResult.data ?? []) as { bgg_name: string; n: number }[]).map(
            (r) => [r.bgg_name, Number(r.n)],
          ),
        ),
      )
    }
  }, [])

  useEffect(() => {
    void loadUsage()
  }, [loadUsage, mode])
  const [games, setGames] = useState<GameOption[]>([])
  const [gamesError, setGamesError] = useState('')
  const activeGames = games.filter((g) => !g.removed_at)
  const coverRows = useMemo(() => buildCoverRows(games, allDocs), [games, allDocs])
  const [pdfFilter, setPdfFilter] = useState<YesNo>('all')
  const [linkFilter, setLinkFilter] = useState<YesNo>('all')
  const [pendingOnly, setPendingOnly] = useState(false)
  const [ovQuery, setOvQuery] = useState('')
  const [ovOpen, setOvOpen] = useState<string[]>([])

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
      .select('bgg_name, name, removed_at, reference_only')
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

      const guess = guessGame(file.name, activeGames)
      added.push({
        id: crypto.randomUUID(),
        file,
        bggName: guess,
        docType: guessDocType(file.name),
        language: guessLanguage(file.name),
        status: 'ready',
        message: '',
        guessed: guess !== '',
        scope: guessScope(file.name),
        expansionName: '',
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
            message: '這款已有同名的上傳文件。要更新請先在下方文件列表刪除舊的。',
          })
          continue
        }

        takeEmptyPageNote()
        const message = await uploadPdfDocument(row.bggName, {
          file: row.file,
          docType: row.docType,
          language: row.language,
          title: '',
          edition: '',
          sourceNote: '',
          scope: row.scope,
          expansionName: row.expansionName,
          onProgress: (text) => updateRow(row.id, { message: text }),
        })

        if (message) {
          updateRow(row.id, { status: 'error', message })
        } else {
          const note = takeEmptyPageNote()
          updateRow(row.id, {
            status: 'done',
            message: note ? `已上傳並建立索引。${note}` : '已上傳並建立索引',
          })
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
    setListTick((n) => n + 1)
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
    setLinkDone('已新增連結，可在下方文件列表看到。')
    if (linkFromSub) {
      const reviewMessage = await reviewSubmission(linkFromSub, true)
      if (reviewMessage) setLinkError(`連結已新增，但標記核准失敗：${reviewMessage}`)
      setLinkFromSub(null)
      void subs.reload()
    }
    void loadUsage()
    setListTick((n) => n + 1)
  }

  const pending = rows.filter((r) => r.status === 'ready' || r.status === 'error')
  const doneCount = rows.filter((r) => r.status === 'done').length
  const errorCount = rows.filter((r) => r.status === 'error').length
  const missingGame = pending.filter((r) => !r.bggName).length
  const sizeByName = new Map((usage?.files ?? []).map((f) => [f.name, f.size]))
  const listQuery = compact(listSearch)
  function buildGroups(docs: AllDoc[]) {
    const byGame = new Map<string, AllDoc[]>()
    for (const doc of docs) {
      const list = byGame.get(doc.bgg_name) ?? []
      list.push(doc)
      byGame.set(doc.bgg_name, list)
    }
    return [...byGame.entries()]
      .map(([bggName, list]) => {
        const info = games.find((g) => g.bgg_name === bggName)
        const name = info?.name || bggName
        const bytes = list.reduce((sum, d) => {
          if (d.source_type !== 'upload') return sum
          return sum + (sizeByName.get(d.storage_path || `${d.id}.pdf`) ?? 0)
        }, 0)
        return { bggName, name, docs: list, bytes, trashed: Boolean(info?.removed_at) }
      })
      .filter((group) => {
        if (!listQuery) return true
        const text = compact(
          `${group.bggName} ${group.name} ${group.docs.map((d) => d.title ?? '').join(' ')}`,
        )
        return text.includes(listQuery)
      })
      .sort((x, y) =>
        sortBySize && x.bytes !== y.bytes
          ? y.bytes - x.bytes
          : x.name.localeCompare(y.name, 'zh-Hant'),
      )
  }
  const pdfDocs = allDocs.filter((d) => d.source_type === 'upload')
  const linkDocs = allDocs.filter((d) => d.source_type !== 'upload')
  const errataTotal = [...errataCounts.values()].reduce((sum, n) => sum + n, 0)

  // 清掉某款遊戲的所有文件（PDF 原檔＋索引＋連結）；遊戲本身不動
  async function clearGameDocs(group: { bggName: string; name: string; docs: AllDoc[]; bytes: number }) {
    const paths = group.docs
      .filter((d) => d.source_type === 'upload')
      .map((d) => d.storage_path || `${d.id}.pdf`)
    const ok = await askConfirm(
      `確定要清掉「${group.name}」的 ${group.docs.length} 份文件嗎？\n` +
        `PDF 原檔與搜尋索引都會刪除（約釋放 ${formatMb(group.bytes)}），無法復原。\n` +
        `遊戲本身不會被刪除。`,
    )
    if (!ok) return
    setClearingGame(group.bggName)
    if (paths.length > 0) {
      const removed = await supabase.storage.from('rulebooks').remove(paths)
      if (removed.error) {
        setClearingGame('')
        await askConfirm('刪除 PDF 失敗，沒有繼續：' + removed.error.message)
        return
      }
    }
    const { error } = await supabase
      .from('game_documents')
      .delete()
      .eq('bgg_name', group.bggName)
    setClearingGame('')
    if (error) {
      await askConfirm('PDF 已刪除，但文件列刪除失敗：' + error.message)
    }
    setOpenGames((current) => current.filter((n) => n !== group.bggName))
    void loadUsage()
    setListTick((n) => n + 1)
  }

  // 孤兒檔：Storage 裡有 PDF，但資料庫已經沒有對應的文件列
  const knownPdfNames = new Set(
    allDocs.filter((d) => d.source_type === 'upload').flatMap((d) => [`${d.id}.pdf`, d.storage_path ?? '']),
  )
  const orphanFiles = (usage?.files ?? []).filter(
    (f) => /\.pdf$/i.test(f.name) && !knownPdfNames.has(f.name),
  )
  const orphanBytes = orphanFiles.reduce((sum, f) => sum + f.size, 0)

  async function clearOrphans() {
    if (orphanFiles.length === 0 || running) return
    const ok = await askConfirm(
      `找到 ${orphanFiles.length} 個沒有對應文件列的 PDF，共 ${formatMb(orphanBytes)}。\n` +
        `這些檔案在網站上看不到、也搜不到，確定要刪除嗎？無法復原。`,
    )
    if (!ok) return
    const removed = await supabase.storage
      .from('rulebooks')
      .remove(orphanFiles.map((f) => f.name))
    if (removed.error) {
      setOrphanMsg('刪除失敗：' + removed.error.message)
      return
    }
    setOrphanMsg(`已刪除 ${orphanFiles.length} 個孤兒檔，釋放約 ${formatMb(orphanBytes)}。`)
    void loadUsage()
  }

  function renderDocList(
    label: string,
    docs: AllDoc[],
    filter: (doc: GameDocument) => boolean,
  ) {
    const groups = buildGroups(docs)
    const trashedGroups = buildGroups(docs).filter((g) => g.trashed && g.bytes > 0)
    const trashedBytes = trashedGroups.reduce((sum, g) => sum + g.bytes, 0)
    const trashedGroupCount = trashedGroups.length
    return (
      <>
        <div className="rbd-title">
          <h3>已上傳的{label}</h3>
          <small>共 {docs.length} 份</small>
        </div>
        <input
          type="search"
          className="rb-search"
          placeholder="搜尋遊戲名稱或文件名"
          value={listSearch}
          onChange={(event) => setListSearch(event.target.value)}
        />
        {label === 'PDF' && (
          <>
            <p className="rb-hint">
              <button type="button" className="admin-link" onClick={() => setSortBySize((v) => !v)}>
                排序：{sortBySize ? '依大小（大 → 小）' : '依名稱'}（點一下切換）
              </button>
            </p>
            {trashedBytes > 0 && (
              <p className="rb-warn">
                垃圾桶裡的遊戲還有 {trashedGroupCount} 款留著規則書，共 {formatMb(trashedBytes)}。
                在下方找到有「🗑 垃圾桶」標記的遊戲，可以清掉它們的規則書。
              </p>
            )}
            {orphanFiles.length > 0 && (
              <p className="rb-warn">
                有 {orphanFiles.length} 個沒有對應文件列的 PDF 孤兒檔（共 {formatMb(orphanBytes)}）。{' '}
                <button type="button" className="admin-link" onClick={() => void clearOrphans()}>
                  清掉孤兒檔
                </button>
              </p>
            )}
            {orphanMsg && <p className="rb-msg">{orphanMsg}</p>}
          </>
        )}
        {groups.length === 0 ? (
          <p className="rb-hint">
            {docs.length === 0 ? `還沒有任何${label}。` : '沒有符合的文件。'}
          </p>
        ) : (
          <ul className="rbd-list">
            {groups.map((group) => {
              const open = openGames.includes(group.bggName)
              return (
                <li className="rbd-group" key={group.bggName}>
                  <button
                    type="button"
                    className="rbd-head"
                    aria-expanded={open}
                    onClick={() => toggleGame(group.bggName)}
                  >
                    <span className="rbd-name">
                      {group.trashed ? '🗑 ' : ''}
                      {group.name}
                    </span>
                    <span className="rbd-count">
                      {group.docs.length} 份
                      {group.bytes > 0 ? `・${formatMb(group.bytes)}` : ''}
                    </span>
                    <span className="rbd-arrow" aria-hidden="true">
                      {open ? '▴' : '▾'}
                    </span>
                  </button>
                  {open && group.trashed && (
                    <p className="rb-warn">
                      這款遊戲已在垃圾桶。{' '}
                      <button
                        type="button"
                        className="rbd-del"
                        disabled={clearingGame === group.bggName}
                        onClick={() => void clearGameDocs(group)}
                      >
                        {clearingGame === group.bggName
                          ? '清除中…'
                          : `清掉這款的規則書（釋放 ${formatMb(group.bytes)}）`}
                      </button>
                    </p>
                  )}
                  {open && (
                    <GameDocGroup
                      key={`${group.bggName}-${listTick}`}
                      bggName={group.bggName}
                      sizeByName={sizeByName}
                      filter={filter}
                      onChanged={() => setListTick((n) => n + 1)}
                      onDeleted={() => void loadUsage()}
                    />
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </>
    )
  }
  function toggleGame(bggName: string) {
    setOpenGames((current) =>
      current.includes(bggName)
        ? current.filter((n) => n !== bggName)
        : [...current, bggName],
    )
  }

  return (
    <div className="rb">
      <OverviewCards
        usage={usage}
        error={usageError}
        rows={coverRows}
        loaded={docsLoaded && games.length > 0}
        onApply={(pdf, link, pending) => {
          setPdfFilter(pdf)
          setLinkFilter(link)
          setPendingOnly(pending)
          setOvQuery('')
        }}
      />
      <div className="rb-seg" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <button
          type="button"
          aria-pressed={mode === 'pdf'}
          className={mode === 'pdf' ? 'active' : ''}
          disabled={running}
          onClick={() => setMode(mode === 'pdf' ? null : 'pdf')}
        >
          ＋ 上傳 PDF
        </button>
        <button
          type="button"
          aria-pressed={mode === 'link'}
          className={mode === 'link' ? 'active' : ''}
          disabled={running}
          onClick={() => setMode(mode === 'link' ? null : 'link')}
        >
          ＋ 貼連結
          <PendingBadge count={linkPending} />
        </button>
        <button
          type="button"
          aria-pressed={mode === 'errata'}
          className={mode === 'errata' ? 'active' : ''}
          disabled={running}
          onClick={() => setMode(mode === 'errata' ? null : 'errata')}
        >
          ＋ 玩錯紀錄
          <PendingBadge count={Math.max(0, pendingErrata - subs.rows.length)} />
        </button>
        <button
          type="button"
          aria-pressed={mode === 'glossary'}
          className={mode === 'glossary' ? 'active' : ''}
          disabled={running}
          onClick={() => setMode(mode === 'glossary' ? null : 'glossary')}
        >
          ＋ 詞庫
          <PendingBadge count={glossaryPending} />
        </button>
      </div>

      {gamesError && <p className="admin-error">{gamesError}</p>}

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
                            games={activeGames}
                            value={row.bggName}
                            disabled={locked}
                            onChange={(bggName) =>
                              updateRow(row.id, { bggName, guessed: false })
                            }
                          />
                          {row.guessed && row.bggName && (
                            <small className="rb-guess">遊戲是從檔名猜的，請確認</small>
                          )}
                          <select
                            value={row.scope}
                            disabled={locked}
                            onChange={(event) =>
                              updateRow(row.id, { scope: event.target.value as DocScope })
                            }
                          >
                            {(Object.keys(SCOPE_LABELS) as DocScope[]).map((key) => (
                              <option key={key} value={key}>
                                範圍：{SCOPE_LABELS[key]}
                              </option>
                            ))}
                          </select>
                          {row.scope === 'expansion' && (
                            <input
                              type="text"
                              maxLength={60}
                              disabled={locked}
                              placeholder="擴充名稱，例如：Kami Unbound"
                              value={row.expansionName}
                              onChange={(event) =>
                                updateRow(row.id, { expansionName: event.target.value })
                              }
                            />
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
          <h3>貼連結</h3>
          <p className="rb-hint">
            先選遊戲，再貼影片或網頁連結。網址是 YouTube、bilibili、vimeo 會自動當影片，其他當網頁。
            新增後會出現在下方文件列表。
          </p>

          <SubmissionsAdmin
            kind="link"
            rows={subs.rows}
            error={subs.error}
            onChanged={() => void subs.reload()}
            onUseLink={(row: AdminSubmission) => {
              setLinkFromSub(row.id)
              setLinkGame(row.bgg_name)
              setLinkTitle(row.title)
              setLinkUrl(row.value)
              setLinkError('')
              setLinkDone('')
            }}
          />

          <form className="rb-fields rb-linkform" onSubmit={submitLink}>
            <GamePicker
              games={activeGames}
              value={linkGame}
              onChange={(bggName) => {
                setLinkGame(bggName)
                setLinkError('')
                setLinkDone('')
              }}
            />

            {linkGame && (
              <>
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

      {mode === 'errata' && (
        <ErrataAdmin onChanged={() => void loadUsage()}
          renderPicker={(value, onChange) => (
            <GamePicker games={activeGames} value={value} onChange={onChange} />
          )}
        />
      )}

      {mode === 'glossary' && (
        <SubmissionsAdmin
          kind="glossary"
          rows={subs.rows}
          error={subs.error}
          onChanged={() => void subs.reload()}
          onUseLink={() => {}}
        />
      )}

      {mode === 'glossary' && (
        <GlossaryAdmin
          renderPicker={(value, onChange) => (
            <GamePicker games={activeGames} value={value} onChange={onChange} />
          )}
        />
      )}

      {mode === 'glossary' && <GlossaryMisses />}

      <RulebookOverviewList
        rows={coverRows}
        loaded={docsLoaded && games.length > 0}
        pdfFilter={pdfFilter}
        setPdfFilter={setPdfFilter}
        linkFilter={linkFilter}
        setLinkFilter={setLinkFilter}
        pendingOnly={pendingOnly}
        setPendingOnly={setPendingOnly}
        query={ovQuery}
        setQuery={setOvQuery}
        openIds={ovOpen}
        onToggle={(id) =>
          setOvOpen((cur) => (cur.includes(id) ? cur.filter((n) => n !== id) : [...cur, id]))
        }
        sizeByName={sizeByName}
        listTick={listTick}
        onChanged={() => setListTick((n) => n + 1)}
        onDeleted={() => void loadUsage()}
        onAddLink={(id) => {
          setLinkGame(id)
          setLinkDone('')
          setLinkError('')
          setMode('link')
        }}
      />

      {mode === 'pdf' &&
        renderDocList('PDF', pdfDocs, (d) => d.source_type === 'upload')}
      {mode === 'link' &&
        renderDocList('連結', linkDocs, (d) => d.source_type !== 'upload')}
      {mode === 'errata' && (
        <p className="rb-hint">
          玩錯紀錄共 {errataTotal} 份（{errataCounts.size} 款遊戲）。
        </p>
      )}
    </div>
  )
}
