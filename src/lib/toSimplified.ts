// 繁體 → 簡體（搜尋簡體規則書用）。第一次用到才載入，失敗就回傳原文字。
let converter: ((text: string) => string) | null = null
let failed = false

export async function toSimplified(text: string): Promise<string> {
  if (failed) return text
  try {
    if (!converter) {
      const mod = await import('opencc-js')
      converter = mod.Converter({ from: 'tw', to: 'cn' })
    }
    return converter(text)
  } catch {
    failed = true
    return text
  }
}
