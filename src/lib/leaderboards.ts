// 排名：同分並列（例如 1、1、3），只保留名次在 maxRank 以內的項目
export function rankGames<E extends { value: number; name: string }>(
  entries: E[],
  maxRank = 10,
): (E & { rank: number })[] {
  const sorted = [...entries].sort(
    (a, b) => b.value - a.value || a.name.localeCompare(b.name, 'zh-Hant'),
  )

  const result: (E & { rank: number })[] = []
  let rank = 0
  sorted.forEach((entry, index) => {
    if (index === 0 || entry.value !== sorted[index - 1].value) {
      rank = index + 1
    }
    if (rank <= maxRank) result.push({ ...entry, rank })
  })
  return result
}