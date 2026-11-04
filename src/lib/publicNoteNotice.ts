import { askConfirm } from './askConfirm'

const ACK_KEY = 'boardgame-public-note-ack'

export const PUBLIC_NOTE_HINT =
  '發布後會公開到留言板，VIP 與管理者都看得到（顯示你的暱稱；隱藏暱稱者顯示「匿名玩家」）。'

// 第一次發布公開內容時確認一次；按過「確定」就記在這個瀏覽器，之後不再跳
// 修改已發布的留言不需要呼叫這個函式
export async function confirmPublicPost(): Promise<boolean> {
  try {
    if (window.localStorage.getItem(ACK_KEY) === '1') return true
  } catch {
    // 讀不到就當作還沒確認過
  }
  const ok = await askConfirm(PUBLIC_NOTE_HINT + '\n確定要發布嗎？', { danger: false })
  if (ok) {
    try {
      window.localStorage.setItem(ACK_KEY, '1')
    } catch {
      // 存不了也沒關係，下次再問一次
    }
  }
  return ok
}
