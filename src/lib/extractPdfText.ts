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
const MAX_CHUNKS = 3000
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

// 同一頁內切成小段，絕不跨頁（頁碼才準）
function chunkLines(lines: string[], page: number): ExtractedChunk[] {
  const out: ExtractedChunk[] = []
  let buffer = ''

  function flush() {
    const text = buffer.trim()
    if (text) out.push({ page, title: '', content: text })
    buffer = ''
  }

  for (const raw of lines) {
    let line = raw
    while (line.length > MAX_CHUNK_CHARS) {
      flush()
      out.push({ page, title: '', content: line.slice(0, MAX_CHUNK_CHARS) })
      line = line.slice(MAX_CHUNK_CHARS)
    }
    if (buffer && buffer.length + line.length + 1 > MAX_CHUNK_CHARS) flush()
    buffer += (buffer ? '\n' : '') + line
  }
  flush()

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

  const pdf = await loadingTask.promise.catch(() => {
    throw new PdfExtractError(
      'PDF_READ_ERROR',
      '無法讀取這個 PDF（檔案可能損毀或有密碼保護）。',
    )
  })

  const totalPages = pdf.numPages
  const chunks: ExtractedChunk[] = []
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
      chunks.push(...chunkLines(lines, pageNo))
      page.cleanup()
      onProgress?.(pageNo, totalPages)
    }
  } finally {
    await loadingTask.destroy()
  }

  if (textChars < 200 || textPages / totalPages < 0.3) {
    throw new PdfExtractError(
      'NO_TEXT',
      '這個 PDF 幾乎沒有可擷取的文字（可能是掃描圖片）。第一版不支援 OCR，請換成文字版 PDF。',
    )
  }
  if (chunks.length > MAX_CHUNKS) {
    throw new PdfExtractError(
      'TOO_LARGE',
      `這份文件切出 ${chunks.length} 段，超過上限 ${MAX_CHUNKS} 段。`,
    )
  }

  return { pageCount: totalPages, chunks, fileHash }
}