import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { sniffPdfLanguage, takeEmptyPageNote } from '../lib/extractPdfText'
import { defaultDocTitle, type DocScope, type UploadInput } from '../lib/useGameDocuments'
import { SCOPE_LABELS } from '../lib/docLabels'
import UploadModal from './UploadModal'

// 遊戲詳細視窗裡的「上傳 PDF」：沿用管理中心的上傳流程，但固定上傳到目前這款遊戲，
// 全部成功後自動關閉視窗。只有管理者看得到入口。
type Lang = 'zh' | 'en' | 'other'
type DocKind = 'rulebook' | 'faq' | 'errata'
type RowStatus = 'ready' | 'uploading' | 'done' | 'error'
type LangStatus = 'detecting' | 'detected' | 'unknown' | 'manual'

type Row = {
  id: string
  file: File
  docType: DocKind
  language: Lang
  langStatus: LangStatus
  langManual: boolean
  status: RowStatus
  message: string
  scope: DocScope
  expansionName: string
}

const LARGE_FILE_BYTES = 15 * 1024 * 1024
const STATUS_LABEL: Record<RowStatus, string> = {
  ready: '待上傳',
  uploading: '上傳中',
  done: '完成',
  error: '失敗',
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
  if (
    /player|fan[-_ ]?made|cheat|summary|reference|one[-_ ]?pag|quick[-_ ]?(ref|guide)|teach/i.test(fileName) ||
    /玩家整理|整理|懶人包|速查|摘要/.test(fileName)
  )
    return 'player_notes' as DocScope
  return 'main'
}

function langText(lang: string): string {
  if (lang === 'zh') return '中文'
  if (lang === 'en') return '英文'
  return '其他語言'
}

function formatMb(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

export default function GamePdfUpload({
  bggName,
  onClose,
  upload,
}: {
  bggName: string
  onClose: () => void
  // 用 useGameDocuments 的 uploadDoc：上傳成功後清單會自動重讀
  upload: (input: UploadInput) => Promise<string | null>
}) {
  const [rows, setRows] = useState<Row[]>([])
  const [running, setRunning] = useState(false)
  const [notice, setNotice] = useState('')
  const [pickerKey, setPickerKey] = useState(0)

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  async function detectLanguages(list: Row[]) {
    for (const item of list) {
      const result = await sniffPdfLanguage(item.file)
      setRows((current) =>
        current.map((row) => {
          if (row.id !== item.id || row.langManual) return row
          return result.lang
            ? { ...row, language: result.lang, langStatus: 'detected' }
            : { ...row, langStatus: 'unknown' }
        }),
      )
    }
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
      added.push({
        id: crypto.randomUUID(),
        file,
        docType: guessDocType(file.name),
        language: guessLanguage(file.name),
        langStatus: 'detecting',
        langManual: false,
        status: 'ready',
        message: '',
        scope: guessScope(file.name),
        expansionName: '',
      })
    }
    if (added.length > 0) {
      setRows((current) => [...added, ...current])
      void detectLanguages(added)
    }
    if (skipped.length > 0) setNotice('已略過（不是 PDF 或已在清單中）：' + skipped.join('、'))
    setPickerKey((n) => n + 1)
  }

  async function uploadAll() {
    if (running) return
    const targets = rows.filter((r) => r.status === 'ready' || r.status === 'error')
    if (targets.length === 0) return
    setNotice('')
    setRunning(true)
    let failed = 0

    for (const row of targets) {
      updateRow(row.id, { status: 'uploading', message: '準備中…' })
      try {
        const title = defaultDocTitle(row.file)
        const check = await supabase
          .from('game_documents')
          .select('id')
          .eq('bgg_name', bggName)
          .eq('title', title)
          .eq('source_type', 'upload')
          .limit(1)
        if (check.error) {
          failed++
          updateRow(row.id, { status: 'error', message: '檢查重複失敗：' + check.error.message })
          continue
        }
        if (check.data && check.data.length > 0) {
          failed++
          updateRow(row.id, {
            status: 'error',
            message: '這款已有同名的上傳文件。要更新請先刪除舊的。',
          })
          continue
        }

        takeEmptyPageNote()
        const message = await upload({
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
          failed++
          updateRow(row.id, { status: 'error', message })
        } else {
          const note = takeEmptyPageNote()
          let detected = row.language as string
          if (!row.langManual) {
            try {
              const res = await supabase.rpc('admin_auto_doc_language', {
                p_bgg_name: bggName,
                p_title: title,
              })
              if (!res.error && typeof res.data === 'string') detected = res.data
            } catch {
              /* 語言校正失敗不影響上傳 */
            }
          }
          updateRow(row.id, {
            status: 'done',
            message: `已上傳並建立索引。語言：${langText(detected)}。${note}`,
          })
        }
      } catch (error) {
        failed++
        updateRow(row.id, {
          status: 'error',
          message: '發生錯誤：' + (error instanceof Error ? error.message : '未知錯誤'),
        })
      }
    }

    setRunning(false)
    // 全部成功才自動關閉；有失敗就留著讓管理者看訊息、重試
    if (failed === 0) onClose()
  }

  const pending = rows.filter((r) => r.status === 'ready' || r.status === 'error')
  const errorCount = rows.filter((r) => r.status === 'error').length

  return (
    <UploadModal title="上傳 PDF" locked={running} onClose={onClose}>
      <p className="rb-hint">
        會上傳到這款遊戲。選文字版 PDF（每個最大 50 MB），檔名含 faq 或 errata／勘誤會自動歸類。
        上傳的 PDF 只有管理者看得到。
      </p>

      <label className="rb-pick">
        <span>選擇 PDF（可多選）</span>
        <input
          key={pickerKey}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          disabled={running}
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
                        onClick={() => setRows((cur) => cur.filter((r) => r.id !== row.id))}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {row.status !== 'done' && (
                    <div className="rb-fields">
                      <select
                        value={row.language}
                        disabled={locked}
                        onChange={(event) =>
                          updateRow(row.id, {
                            language: event.target.value as Lang,
                            langStatus: 'manual',
                            langManual: true,
                          })
                        }
                      >
                        <option value="zh">語言：中文（繁體／簡體）</option>
                        <option value="en">語言：英文</option>
                        <option value="other">語言：其他（德文、波蘭文…）</option>
                      </select>
                      <small className="rb-guess">
                        {row.langStatus === 'detecting' && '正在讀 PDF 內容判斷語言…'}
                        {row.langStatus === 'detected' && '語言是依 PDF 內容判斷的，不對可以直接改'}
                        {row.langStatus === 'unknown' &&
                          '讀不到足夠的文字（可能是掃描檔），語言先依檔名猜，請自己確認'}
                        {row.langStatus === 'manual' && '語言已手動指定'}
                      </small>
                      <select
                        value={row.scope}
                        disabled={locked}
                        onChange={(event) => updateRow(row.id, { scope: event.target.value as DocScope })}
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
                          onChange={(event) => updateRow(row.id, { expansionName: event.target.value })}
                        />
                      )}
                    </div>
                  )}

                  {row.file.size > LARGE_FILE_BYTES && row.status !== 'done' && (
                    <p className="rb-warn">
                      檔案偏大（{formatMb(row.file.size)}）。仍可上傳，但若官方有 Lo-res／Compact 版，建議改用較小的檔案。
                    </p>
                  )}

                  {row.message && (
                    <p className={row.status === 'error' ? 'admin-error rb-msg' : 'rb-msg'}>{row.message}</p>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="rb-actions">
            <button
              type="button"
              className="ma-btn"
              disabled={running || pending.length === 0 || rows.some((r) => r.langStatus === 'detecting')}
              onClick={() => void uploadAll()}
            >
              {running
                ? '上傳中，請不要關閉視窗…'
                : errorCount > 0 && pending.length === errorCount
                  ? `重試失敗的 ${errorCount} 份`
                  : `上傳（${pending.length} 份）`}
            </button>
          </div>
        </>
      )}
    </UploadModal>
  )
}
