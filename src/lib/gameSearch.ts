// 主畫面搜尋：同時比對中文名（name）與英文名（bggName），
// 忽略大小寫、空格與標點（rising sun、Rising-Sun、risingsun 都找得到）。

function normalize(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '')
}

export function matchesGameSearch(
  game: { name: string; bggName: string },
  rawSearch: string,
): boolean {
  const raw = rawSearch.trim().toLocaleLowerCase()
  if (raw === '') return true

  // 原樣比對（保留舊行為）
  if (
    game.name.toLocaleLowerCase().includes(raw) ||
    game.bggName.toLocaleLowerCase().includes(raw)
  ) {
    return true
  }

  // 忽略空格與標點的比對；如果輸入全是標點就不再放寬
  const query = normalize(raw)
  if (query === '') return false
  return (
    normalize(game.name).includes(query) ||
    normalize(game.bggName).includes(query)
  )
}
