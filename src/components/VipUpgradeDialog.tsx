import { useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'
import { VIP_CHANGED_EVENT } from '../lib/useVip'
import { useBackClose } from '../lib/useBackClose'
import '../styles/vip-upgrade.css'

// VIP 目前實際有的功能（只列網站已經做好的）
export const VIP_BENEFITS: { icon: string; text: string }[] = [
  { icon: '⭐', text: '替玩過的遊戲評分，並看到大家的評分摘要' },
  { icon: '🎟', text: '集點卡：參加聚會、評完指定遊戲得點，集滿 2 點換免費券' },
  { icon: '📅', text: '看未來聚會，按「我可以去」登記意願' },
  { icon: '🏆', text: '統計中心：看想玩／已玩名單、玩家榜與統計表' },
  { icon: '✦', text: '規則助手：搜尋規則書與玩錯紀錄，也能投稿' },
  { icon: '💬', text: '留言板：公開留言、寫心得、替別人的留言按讚' },
]

const MESSAGES: Record<string, string> = {
  wrong: '密碼不正確，請再試一次。',
  locked: '嘗試次數太多，請 15 分鐘後再試。',
  not_logged_in: '請先登入。',
  no_code: '管理者還沒有設定密碼。',
}

function Benefits() {
  return (
    <ul className="vu-list">
      {VIP_BENEFITS.map((item) => (
        <li key={item.text}>
          <span aria-hidden="true">{item.icon}</span>
          <span>{item.text}</span>
        </li>
      ))}
    </ul>
  )
}

const PRIVACY_NOTE =
  '成為 VIP 後，你的想玩／已玩會以暱稱顯示給 VIP 朋友看（管理者可看到完整名單），可以隨時在暱稱選單關閉。'

// offer：Google 登入後、還不是 VIP：列出好處，可輸入通關密碼升級
// granted：用聚會連結報到後自動升成 VIP：告知已解鎖哪些功能
export default function VipUpgradeDialog({
  mode,
  actionLabel = '我知道了',
  onClose,
}: {
  mode: 'offer' | 'granted'
  actionLabel?: string
  onClose: () => void
}) {
  useBackClose(onClose)

  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!code.trim()) return
    setBusy(true)
    setMessage('')
    const { data, error } = await supabase.rpc('redeem_vip_code', { p_code: code })
    setBusy(false)
    if (error) {
      setMessage('驗證失敗：' + error.message)
      return
    }
    if (data === 'ok' || data === 'already') {
      setDone(true)
      window.dispatchEvent(new Event(VIP_CHANGED_EVENT))
      return
    }
    setMessage(MESSAGES[data as string] ?? '發生未知錯誤，請稍後再試。')
  }

  return createPortal(
    <div className="vu-backdrop">
      <div className="vu-card" role="dialog" aria-modal="true" aria-label="VIP 會員">
        {mode === 'granted' ? (
          <>
            <div className="vu-ico" aria-hidden="true">🎉</div>
            <h2 className="vu-title">恭喜！已成功升級 VIP 會員</h2>
            <p className="vu-sub">你透過這次桌遊聚會取得了 VIP 資格，不用再輸入密碼。現在解鎖了：</p>
            <Benefits />
            <p className="vu-note">{PRIVACY_NOTE}</p>
            <button type="button" className="vu-primary" onClick={onClose}>
              {actionLabel}
            </button>
          </>
        ) : done ? (
          <>
            <div className="vu-ico" aria-hidden="true">🎉</div>
            <h2 className="vu-title">歡迎加入 VIP！</h2>
            <p className="vu-sub">上面這些功能都已經解鎖，現在就可以使用了。</p>
            <button type="button" className="vu-primary" onClick={onClose}>
              好的
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="vu-ico" aria-hidden="true">🔑</div>
            <h2 className="vu-title">升級 VIP，解鎖更多桌遊功能！</h2>
            <p className="vu-sub">VIP 可以使用：</p>
            <Benefits />
            <p className="vu-note">
              來玩過桌遊的朋友才能升級，請向管理者詢問通關密碼。{PRIVACY_NOTE}
            </p>
            <label className="vu-field">
              <span>通關密碼</span>
              <input
                type="password"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                autoComplete="off"
                maxLength={40}
              />
            </label>
            {message && <p className="vu-error">{message}</p>}
            <button type="submit" className="vu-primary" disabled={busy || !code.trim()}>
              {busy ? '驗證中…' : '驗證並升級'}
            </button>
            <button type="button" className="vu-secondary" onClick={onClose}>
              稍後再說
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body,
  )
}
