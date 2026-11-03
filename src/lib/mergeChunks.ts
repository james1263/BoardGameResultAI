// 搜尋結果合併：同一份文件、同一頁、前後段有重疊的結果，合成一段顯示，
// 避免重疊段佔掉前 5 名的名額。只改顯示用的陣列，不動資料庫。

type MergeableChunk = {
  doc_id: string
  page_number: number | null
  content: string
  score: number
}

// 重疊太短可能只是巧合（例如標題），不合併
const MIN_OVERLAP = 20

// a 的結尾 = b 的開頭，回傳重疊的字數，沒有就回 0
function overlapLength(a: string, b: string): number {
  const max = Math.min(a.length, b.length)
  for (let len = max; len >= MIN_OVERLAP; len -= 1) {
    if (a.endsWith(b.slice(0, len))) return len
  }
  return 0
}

function mergeText(a: string, b: string): string | null {
  if (a.includes(b)) return a
  if (b.includes(a)) return b
  const ab = overlapLength(a, b)
  if (ab > 0) return a + b.slice(ab)
  const ba = overlapLength(b, a)
  if (ba > 0) return b + a.slice(ba)
  return null
}

type Item<T> = { chunk: T; index: number }

function findMergeable<T extends MergeableChunk>(
  items: Item<T>[],
): { i: number; j: number; text: string } | null {
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      const a = items[i].chunk
      const b = items[j].chunk
      if (a.doc_id !== b.doc_id || a.page_number !== b.page_number) continue
      const text = mergeText(a.content, b.content)
      if (text !== null) return { i, j, text }
    }
  }
  return null
}

export function mergeOverlappingChunks<T extends MergeableChunk>(chunks: T[]): T[] {
  const items: Item<T>[] = chunks.map((chunk, index) => ({ chunk, index }))

  let pair = findMergeable(items)
  while (pair) {
    const { i, j, text } = pair
    const a = items[i]
    const b = items[j]
    items[i] = {
      chunk: { ...a.chunk, content: text, score: Math.max(a.chunk.score, b.chunk.score) },
      index: Math.min(a.index, b.index),
    }
    items.splice(j, 1)
    pair = findMergeable(items)
  }

  return items.sort((x, y) => x.index - y.index).map((item) => item.chunk)
}
