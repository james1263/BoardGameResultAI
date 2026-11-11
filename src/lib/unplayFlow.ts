import { supabase } from './supabase'
import { askConfirm, showNotice } from './askConfirm'
import type { PersonalApi } from './personalApi'

// 評分資料有變動（刪評分、取消已玩）時，通知 useGameRatings 重新讀取
export const RATINGS_CHANGED_EVENT = 'boardgame-ratings-changed'

export function notifyRatingsChanged() {
  window.dispatchEvent(new Event(RATINGS_CHANGED_EVENT))
}

type PublicNote = { text: string }

// 取消「已玩」的共用流程（已玩「−」到 0、主畫面取消打勾都走這裡）。
// 回傳 true＝已取消已玩；false＝被擋下、使用者取消或失敗。
export async function runUnplayFlow(
  bggName: string,
  personal: PersonalApi,
): Promise<boolean> {
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user?.id
  if (!userId) {
    await showNotice('請先登入。')
    return false
  }

  // 1. 日期紀錄：有就不能取消
  const sessions = await supabase
    .from('game_play_sessions')
    .select('id, source')
    .eq('user_id', userId)
    .eq('bgg_name', bggName)
  if (sessions.error) {
    await showNotice('讀取遊玩紀錄失敗，請稍後再試。')
    return false
  }
  const rows = (sessions.data ?? []) as { id: string; source: string }[]
  if (rows.length > 0) {
    const hasAuto = rows.some((row) => row.source !== 'manual')
    await showNotice(
      hasAuto
        ? '這款有聚會的遊玩日期紀錄，不能取消已玩。'
        : '這款有你自己補的遊玩日期，請先到「我的統計→已玩→補日期」把日期刪除，再取消已玩。',
    )
    return false
  }

  // 2. 評分與公開留言
  const [rating, mine, gathering] = await Promise.all([
    supabase
      .from('game_ratings')
      .select('overall')
      .eq('user_id', userId)
      .eq('bgg_name', bggName)
      .maybeSingle(),
    supabase.rpc('get_my_game_notes', { p_bgg_name: bggName }),
    supabase.rpc('get_my_gathering_notes'),
  ])
  if (rating.error || mine.error || gathering.error) {
    await showNotice('讀取你的評分或留言失敗，請稍後再試。')
    return false
  }
  const hasRating = rating.data != null
  const publicNotes: PublicNote[] = []
  for (const row of (mine.data ?? []) as { public_note?: string | null; content?: string | null }[]) {
    const text = (row.public_note ?? row.content ?? '').trim()
    publicNotes.push({ text })
  }
  for (const row of (gathering.data ?? []) as { bgg_name: string; public_note: string | null }[]) {
    if (row.bgg_name === bggName && (row.public_note ?? '').trim() !== '') {
      publicNotes.push({ text: (row.public_note ?? '').trim() })
    }
  }

  // 3. 確認
  if (!hasRating && publicNotes.length === 0) {
    const ok = await askConfirm(
      '這款沒有評分，也沒有公開留言。\n取消會把它從「已玩」移除，主畫面的打勾也會取消。私人心得不受影響。確定嗎？',
      { confirmText: '移除已玩' },
    )
    if (!ok) return false
  } else {
    const lines: string[] = ['取消已玩會一併刪除：']
    if (hasRating) lines.push(`・你的評分（整體 ${rating.data?.overall ?? '—'} 分）`)
    publicNotes.forEach((note, index) => {
      const short = note.text.length > 30 ? note.text.slice(0, 30) + '…' : note.text
      lines.push(`・公開留言 ${index + 1}：${short || '（只有喜歡／不喜歡的點）'}`)
    })
    lines.push('', '私人心得會保留，已得的點數與免費券不受影響。刪除後無法復原。')
    const ok = await askConfirm(lines.join('\n'), { confirmText: '全部刪除', danger: true })
    if (!ok) return false
  }

  // 4. 資料庫一次做完
  const { data, error } = await supabase.rpc('unplay_game', { p_bgg_name: bggName })
  const result = data as { ok?: boolean; reason?: string } | null
  if (error || !result?.ok) {
    await showNotice(
      result?.reason === 'has_sessions'
        ? '這款有遊玩日期紀錄，不能取消已玩。'
        : '取消失敗，請稍後再試。',
    )
    return false
  }

  // 5. 更新本機畫面（同時調整想玩／已玩人數）與評分清單
  personal.updateEntry(bggName, { playCount: 0, played: false }, { skipPlayedRule: true })
  notifyRatingsChanged()
  return true
}
