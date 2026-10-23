export function formatPlayers(players: number[]): string {
  if (players.length === 0) return '未提供'
  if (players.length === 1) return `${players[0]} 人`

  const sortedPlayers = [...players].sort((a, b) => b - a)
  const isContinuous = sortedPlayers.every(
    (player, index) =>
      index === 0 || sortedPlayers[index - 1] - player === 1,
  )

  if (isContinuous) {
    return `${sortedPlayers[sortedPlayers.length - 1]}–${sortedPlayers[0]} 人`
  }

  return `${players.join('、')} 人`
}

export function formatNumber(value: number | null | undefined): string {
  return value == null ? '未提供' : String(value)
}

export function getPlayerSortValue(players: number[]): number | null {
  return players.length > 0 ? Math.min(...players) : null
}

export function compareNullableNumbers(
  a: number | null,
  b: number | null,
  direction: number,
): number {
  // 缺失資料固定排最後，不受升冪或降冪影響。
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  return (a - b) * direction
}

// 同一個 emoji 重複 N 次 → 圓點數 = 符號個數。
// 用 Array.from 以字元計算，並忽略變體選擇符與空白，避免 ❤️ 被算成 2。
export function countRatingSymbols(text?: string | null): number {
  if (!text) return 0
  return Array.from(text).filter(
    (ch) => ch.trim() !== '' && ch !== '\uFE0F' && ch !== '\u200D',
  ).length
}
