import type { BoardGame } from '../data/boardGames.generated'

export type ParsedGame = Omit<BoardGame, 'id' | 'slug'>

export type ParseResult = {
  games: ParsedGame[]
  duplicateNames: string[]
}

const REQUIRED_COLUMNS = [
  '屬性', 'bggName', '類型', 'bgg網站', 'BGG分數', 'BGG時間', 'BGG難度',
  'Ranking engine', '分數_排名', '人數上限', '人數下限', '推薦人數',
  '最佳人數', '喜歡度', '快速性', '溝通性', '獨特性', '玩家影響性',
  '複雜性', '變化性',
]

function cleanText(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

function getNumber(value: unknown): number | null {
  const text = cleanText(value).replace(/,/g, '')
  if (!text) return null
  const number = Number(text)
  return Number.isFinite(number) ? number : null
}

function getPlayerList(value: unknown): number[] {
  const text = cleanText(value)
  if (!text) return []
  const result = new Set<number>()
  for (const part of text.split(/[,，、;/；\s]+/)) {
    if (!part) continue
    const number = getNumber(part)
    if (number !== null && number > 0 && Number.isInteger(number)) {
      result.add(number)
    }
  }
  return [...result].sort((a, b) => a - b)
}

function getCategories(value: unknown): string[] {
  const text = cleanText(value)
  if (!text) return []
  const parts = text
    .split(/[,，、;；]+/)
    .map((part) => part.trim())
    .filter(Boolean)
  return [...new Set(parts)]
}


export function makeCoverSlug(text: string): string {
  return cleanText(text)
    .normalize('NFKD')
    .toLowerCase()
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}_]+/gu, '-')
    .replace(/^-+|-+$/g, '')
}

// 把 CSV 文字切成「列 × 欄」（支援引號、欄位內換行、BOM）
function splitCsv(input: string): string[][] {
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      field = ''
      rows.push(row)
      row = []
    } else {
      field += ch
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows.filter((r) => !(r.length === 1 && r[0] === ''))
}

export function parseBoardGamesCsv(csvText: string): ParseResult {
  const table = splitCsv(csvText)
  if (table.length === 0) throw new Error('CSV 沒有欄位標題。')

  const headers = table[0].map(cleanText)
  const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c))
  if (missing.length > 0) {
    throw new Error(
      'CSV 缺少必要欄位：' + missing.join('、') + '。請確認標題列是否正確。',
    )
  }

  const dataRows = table.slice(1)
  if (dataRows.length === 0) throw new Error('CSV 中沒有任何桌遊資料。')

  const games: ParsedGame[] = dataRows.map((cells, index) => {
    const row: Record<string, string> = {}
    headers.forEach((header, i) => {
      row[header] = cells[i] ?? ''
    })

    const text = (col: string) => cleanText(row[col])
    const num = (col: string) => getNumber(row[col])

    const name = text('屬性')
    const bggName = text('bggName')
    if (!name) throw new Error(`CSV 第 ${index + 2} 列的「屬性」欄位是空白。`)
    if (!bggName) throw new Error(`CSV 第 ${index + 2} 列的「bggName」欄位是空白。`)

    return {
      name,
      bggName,
      coverSlug: makeCoverSlug(bggName),
      links: {
        bgg: text('bgg網站'),
        rulebookZh: '',
        rulebookEn: '',
        faq: '',
      },
      category: getCategories(row['類型']),
      bggScore: num('BGG分數'),
      maxPlayers: num('人數上限'),
      minPlayers: num('人數下限'),
      bggTime: num('BGG時間'),
      bggDifficulty: num('BGG難度'),
      bestPlayers: getPlayerList(row['最佳人數']),
      recommendPlayers: getPlayerList(row['推薦人數']),
      rankingEngine: num('Ranking engine'),
      classicGameRanking: num('老遊戲想玩綜合評分'),
      scoreRank: num('分數_排名'),
      playerImpactRanking: num('玩家影響性排名'),
      changeRanking: num('變化排名'),
      uniqueRanking: num('獨特排名'),
      communicationRanking: num('溝通排名'),
      likeDegree: num('喜歡程度'),
      changeDegree: num('變化程度'),
      communicationDegree: num('溝通互動'),
      playerImpactDegree: num('玩家影響程度（在意操作+下一步限制）'),
      uniqueDegree: num('獨特程度'),
      complexityDegree: num('複雜度'),
      likeEmoji: text('喜歡度'),
      speedEmoji: text('快速性'),
      communicationEmoji: text('溝通性'),
      uniqueEmoji: text('獨特性'),
      playerImpactEmoji: text('玩家影響性'),
      complexityEmoji: text('複雜性'),
      changeEmoji: text('變化性'),
    }
  })

  // 驗證：bggName、封面代號不能重複
  const findDuplicates = (values: string[]) =>
    [...new Set(values.filter((v, i) => values.indexOf(v) !== i))].sort()

  const dupBgg = findDuplicates(games.map((g) => g.bggName))
  if (dupBgg.length > 0) {
    throw new Error('bggName 有重複值：\n' + dupBgg.join('\n'))
  }
  const dupSlug = findDuplicates(games.map((g) => g.coverSlug))
  if (dupSlug.length > 0) {
    throw new Error('圖片檔名有重複，請確認 bggName：\n' + dupSlug.join('\n'))
  }

  return {
    games,
    duplicateNames: findDuplicates(games.map((g) => g.name)),
  }
}