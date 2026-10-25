import { useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'

type JoinRow = { result_status: string; result_date: string | null }

const MESSAGES: Record<string, string> = {
  joined: '報到成功！你已經列入今天的出席名單。',
  already: '你已經報到過了。',
  closed: '這場聚會目前沒有開放報到，請找管理者。',
  not_started: '這場聚會還沒開始，聚會當天才能報到。',
  ended: '這場聚會已經結束，無法再報到。',
  full: '這場聚會已經額滿，請找管理者幫你加入。',
  no_profile: '請先設定暱稱（右上角的暱稱選單），再按一次「我來了」。',
  no_contact:
    '請先填寫 LINE／FB 名字（右上角暱稱選單 → 修改暱稱與聯絡方式），再按一次「我來了」。',
  invalid: '這個報到連結無效，可能已被管理者更換，請向管理者索取新的連結。',
  not_logged_in: '請先用 Google 登入。',
}

const RETRYABLE = new Set(['no_profile', 'no_contact', 'not_logged_in'])
const SUCCESS = new Set(['joined', 'already'])

export default function CheckInDialog({
  token,
  onDone,
  onClose,
}: {
  token: string
  onDone: (date: string | null) => void
  onClose: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [date, setDate] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleJoin() {
    setBusy(true)
    setError('')
    const { data, error: rpcError } = await supabase.rpc('join_gathering', {
      p_token: token,
    })
    setBusy(false)

    if (rpcError) {
      setError('報到失敗：' + rpcError.message)
      return
    }
    const row = (data as JoinRow[] | null)?.[0]
    if (!row) {
      setError('報到失敗：沒有收到結果，請再試一次。')
      return
    }
    setStatus(row.result_status)
    setDate(row.result_date)
  }

  const succeeded = status !== null && SUCCESS.has(status)
  const canRetry = status === null || RETRYABLE.has(status)

  return createPortal(
    <div className="modal-backdrop checkin-backdrop">
      <div
        className="admin-modal player-dialog"
        role="dialog"
        aria-label="桌遊聚會報到"
      >
        <h2>桌遊聚會報到</h2>

        {status === null ? (
          <p className="pd-text">
            按下「我來了」，管理者就會在今天的出席名單看到你。
          </p>
        ) : (
          <p className={`pd-text ${succeeded ? 'pd-ok' : 'pd-warn'}`}>
            {MESSAGES[status] ?? '發生未知的狀況，請找管理者。'}
          </p>
        )}

        {error && <p className="pd-error">{error}</p>}

        {succeeded ? (
          <button
            className="pd-save"
            type="button"
            onClick={() => onDone(date)}
          >
            打開我的集點卡
          </button>
        ) : canRetry ? (
          <>
            <button
              className="pd-save"
              type="button"
              disabled={busy}
              onClick={handleJoin}
            >
              {busy ? '報到中…' : '我來了'}
            </button>
            <div className="pd-secondary">
              <button type="button" onClick={onClose}>
                取消
              </button>
            </div>
          </>
        ) : (
          <button className="pd-save" type="button" onClick={onClose}>
            關閉
          </button>
        )}
      </div>
    </div>,
    document.body,
  )
}
