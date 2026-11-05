export type ExtractedChunk = { page: number; title: string; content: string }

export type ExtractedPdf = {
  pageCount: number
  chunks: ExtractedChunk[]
  fileHash: string
}

export class PdfExtractError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
  }
}

const MAX_CHUNK_CHARS = 800
// 問題（Q:）和它的答案（A:）、標題和它底下的第一句，盡量留在同一段；綁在一起最多放寬到這個長度
const MAX_BOUND_CHARS = 1200
// 下一段開頭帶上一段結尾的句子，讓答案不會被切在兩段之間
const OVERLAP_CHARS = 150
const OVERLAP_MAX_SINGLE = 300
const MAX_CHUNKS = 3000
// 最近一次擷取時「幾乎沒有文字」的頁碼，上傳成功後讓畫面提醒（只提醒，不阻擋）
let lastEmptyPages: number[] = []

export function takeEmptyPageNote(): string {
  const pages = lastEmptyPages
  lastEmptyPages = []
  if (pages.length === 0) return ''
  const shown = pages.slice(0, 10).join('、')
  const more = pages.length > 10 ? `…（共 ${pages.length} 頁）` : ''
  return `提醒：第 ${shown} 頁${more}沒有文字，這幾頁搜不到。若內容重要，請先 OCR 再重傳（封面或空白頁可忽略）。`
}

const CJK = /[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff\uff00-\uffef\u3000-\u303f]/

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

// 把一頁的文字項目接成「行」。中日文之間不加空格，英文之間補空格。
function itemsToLines(
  items: Array<{ str?: string; hasEOL?: boolean }>,
): string[] {
  const lines: string[] = []
  let line = ''

  for (const item of items) {
    if (typeof item.str !== 'string') continue
    const text = item.str

    if (text) {
      const needSpace =
        line !== '' &&
        !/\s$/.test(line) &&
        !/^\s/.test(text) &&
        !CJK.test(line.slice(-1)) &&
        !CJK.test(text[0])
      line += (needSpace ? ' ' : '') + text
    }

    if (item.hasEOL) {
      lines.push(line)
      line = ''
    }
  }
  if (line) lines.push(line)

  return lines.map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean)
}

// 兩段文字相接時要不要補空格（中日文之間不補）
function joinSep(a: string, b: string): string {
  if (!a || !b) return ''
  if (CJK.test(a.slice(-1)) || CJK.test(b[0])) return ''
  return ' '
}

type Unit = { text: string; newPara: boolean; keepWithNext?: boolean }

function isHeading(line: string): boolean {
  return line.length < 40 && /^[A-Z0-9 '’&\-:,]+$/.test(line) && /[A-Z]/.test(line)
}

function splitSentences(text: string): string[] {
  const matched = text.match(/[^.!?。！？]+[.!?。！？]+["”’)」』]*\s*|[^.!?。！？]+$/g)
  return (matched ?? [text]).map((s) => s.trim()).filter(Boolean)
}

// 把 PDF 的「行」接成句子：同一句被換行拆開的會接回來
function linesToUnits(lines: string[]): Unit[] {
  const units: Unit[] = []
  let para = ''
  let paraIsQuestion = false

  // keepWithNext：這一段的句子不要和「下一個單元」被切到不同段（問題接答案、標題接內文）
  function flushPara(keepWithNext: boolean) {
    const text = para.trim()
    para = ''
    if (!text) return
    splitSentences(text).forEach((sentence, i) => {
      units.push({ text: sentence, newPara: i === 0, keepWithNext })
    })
  }

  for (const line of lines) {
    if (isHeading(line)) {
      flushPara(paraIsQuestion)
      paraIsQuestion = false
      para = line
      flushPara(true)
      continue
    }
    // FAQ 的 Q: / A: 各自另起一段
    if (/^(Q|A)\s*:/.test(line)) {
      flushPara(paraIsQuestion)
      paraIsQuestion = /^Q\s*:/.test(line)
    }
    para += joinSep(para, line) + line
  }
  flushPara(paraIsQuestion)

  return units
}

function render(units: Unit[]): string {
  let out = ''
  units.forEach((u, i) => {
    if (i === 0) out = u.text
    else out += (u.newPara ? '\n' : joinSep(out, u.text)) + u.text
  })
  return out
}

// 同一頁內依句子邊界切段，絕不跨頁（頁碼才準）；相鄰段有少量重疊
function chunkUnits(units: Unit[], page: number): ExtractedChunk[] {
  const out: ExtractedChunk[] = []
  let buf: Unit[] = []
  let size = 0
  let fresh = 0 // 這一段裡「不是重疊帶來的」句子數
  let prevKeep = false // 上一個放進來的單元要不要和下一個綁在一起

  function takeOverlap(): Unit[] {
    const carry: Unit[] = []
    let total = 0
    for (let i = buf.length - 1; i >= 0; i -= 1) {
      const len = buf[i].text.length + 1
      if (carry.length === 0) {
        if (len > OVERLAP_MAX_SINGLE) break
      } else if (total + len > OVERLAP_CHARS) {
        break
      }
      carry.unshift(buf[i])
      total += len
    }
    return carry
  }

  function flush(keepOverlap: boolean) {
    if (fresh > 0) {
      const text = render(buf).trim()
      if (text) out.push({ page, title: '', content: text })
    }
    buf = keepOverlap && fresh > 0 ? takeOverlap() : []
    size = buf.reduce((sum, u) => sum + u.text.length + 1, 0)
    fresh = 0
  }

  for (const unit of units) {
    const len = unit.text.length + 1

    // 單一句子就超過上限（例如整頁沒有標點）：硬切
    if (unit.text.length > MAX_CHUNK_CHARS) {
      flush(false)
      prevKeep = false
      for (let i = 0; i < unit.text.length; i += MAX_CHUNK_CHARS) {
        out.push({ page, title: '', content: unit.text.slice(i, i + MAX_CHUNK_CHARS) })
      }
      continue
    }

    // 上一個單元要和這一個綁在一起，且加上去還沒超過放寬後的上限：不在這裡切
    const bound = prevKeep && size + len <= MAX_BOUND_CHARS
    if (!bound) {
      if (fresh > 0 && size + len > MAX_CHUNK_CHARS) flush(true)
      // 重疊再加這句還是太長：放棄重疊
      if (size + len > MAX_CHUNK_CHARS) {
        buf = []
        size = 0
      }
    }
    buf.push(unit)
    size += len
    fresh += 1
    prevKeep = Boolean(unit.keepWithNext)
  }
  flush(false)

  return out
}

export async function extractPdfChunks(
  file: File,
  onProgress?: (done: number, total: number) => void,
): Promise<ExtractedPdf> {
  const buffer = await file.arrayBuffer()
  // 先算雜湊：pdf.js 會把傳進去的資料「搬走」，之後就不能再用了
  const fileHash = await sha256Hex(buffer)

  // 只有管理者上傳時才載入 pdf.js，不影響一般訪客的載入速度
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString()

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer.slice(0)),
  })

  const pdf = await loadingTask.promise.catch((error: unknown) => {
    const rawName = (error as { name?: unknown } | null)?.name
    const name = typeof rawName === 'string' ? rawName : ''
    let reason = `無法讀取這個 PDF（${name || '原因不明'}）。請先確認用瀏覽器能正常開啟。`
    if (name === 'PasswordException') {
      reason = '這個 PDF 有密碼保護，無法讀取。請先移除密碼再上傳。'
    } else if (name === 'InvalidPDFException') {
      reason = '這個 PDF 格式錯誤或已損毀，無法讀取。請重新下載或換一份。'
    }
    throw new PdfExtractError('PDF_READ_ERROR', reason)
  })

  const totalPages = pdf.numPages
  const chunks: ExtractedChunk[] = []
  const emptyPages: number[] = []
  lastEmptyPages = []
  let textChars = 0
  let textPages = 0

  try {
    for (let pageNo = 1; pageNo <= totalPages; pageNo += 1) {
      const page = await pdf.getPage(pageNo)
      const content = await page.getTextContent()
      const lines = itemsToLines(
        content.items as Array<{ str?: string; hasEOL?: boolean }>,
      )
      const pageChars = lines.reduce((sum, l) => sum + l.length, 0)

      textChars += pageChars
      if (pageChars >= 20) textPages += 1
      else emptyPages.push(pageNo)
      chunks.push(...chunkUnits(linesToUnits(lines), pageNo))
      page.cleanup()
      onProgress?.(pageNo, totalPages)
    }
  } finally {
    await loadingTask.destroy()
  }

  if (textChars < 200 || textPages / totalPages < 0.3) {
    throw new PdfExtractError(
      'NO_TEXT',
      '這個 PDF 幾乎沒有可擷取的文字（可能是掃描圖片）。請先確認用瀏覽器開啟時能用滑鼠選取文字或按 Ctrl+F 搜尋；掃描圖片請先在自己的電腦用 OCR 工具轉成文字版（例如把 PDF 拖曳到 ocr_zh.bat 或 ocr_en.bat），再重新上傳。網站本身不做 OCR。',
    )
  }
  if (chunks.length > MAX_CHUNKS) {
    throw new PdfExtractError(
      'TOO_LARGE',
      `這份文件切出 ${chunks.length} 段，超過上限 ${MAX_CHUNKS} 段。`,
    )
  }

  lastEmptyPages = emptyPages
  return { pageCount: totalPages, chunks, fileHash }
}
