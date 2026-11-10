// 聚會評分流程走完後，問玩家要不要順便寫今天的心得／留言
// 評分流程（TodayRatingFlow）只負責送出這個事件；詢問卡、選擇視窗由 PostGatheringNotes 在 App 層處理，
// 這樣評分視窗關掉之後，詢問卡還在。
export const NOTE_ASK_EVENT = 'boardgame-note-ask'

export type NoteAskDetail = { games: string[] }

// games：今天評分完整的遊戲（bgg_name）
export function requestNoteAsk(games: string[]) {
  if (games.length === 0) return
  window.dispatchEvent(new CustomEvent<NoteAskDetail>(NOTE_ASK_EVENT, { detail: { games } }))
}

const keyOf = (userId: string) => `boardgame-note-ask:${userId}`

function readAsked(userId: string): string[] {
  try {
    const raw = localStorage.getItem(keyOf(userId))
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

// 每場聚會只自動問一次
export function wasNoteAsked(userId: string, gatheringId: string): boolean {
  return readAsked(userId).includes(gatheringId)
}

export function markNoteAsked(userId: string, gatheringId: string) {
  try {
    const list = readAsked(userId)
    if (list.includes(gatheringId)) return
    localStorage.setItem(keyOf(userId), JSON.stringify([...list, gatheringId].slice(-50)))
  } catch {
    // 存不了就算了
  }
}
