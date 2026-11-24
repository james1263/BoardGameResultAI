import { useState } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/join-by-code.css'

type ResolveRow = { result_status: string; result_token: string | null }

const MESSAGES: Record<string, string> = {
  not_logged_in: '請先用 Google 登入，才能輸入房號。',
  locked: '輸入錯誤次數太多，請 10 分鐘後再試，或請管理者傳報到連結給你。',
  busy: '房號功能暫時停用，請改用管理者傳的報到連結。',
  bad_code: '房號無效或已過期。',
}

// 「聚會」視窗最上面：輸入管理者在現場公布的四位數房號，查到當天的報到碼後交給報到視窗
export default function JoinByCode({
  isLoggedIn,
  onToken,
}: {
  isLoggedIn: boolean
  onToken: (token: string) => void
}) {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function submit() {
    if (busy) return
    if (!/^[0-9]{4}$/.test(code)) {
      setMessage('房號是 4 位數字。')
      return
    }
    setBusy(true)
    setMessage('')
    const { data, error } = await supabase.rpc('resolve_gathering_code', { p_code: code })
    setBusy(false)
    if (error) {
      setMessage('查詢失敗：' + error.message)
      return
    }
    const row = (data as ResolveRow[] | null)?.[0]
    if (!row) {
      setMessage('查詢失敗：沒有收到結果，請再試一次。')
      return
    }
    if (row.result_status === 'ok' && row.result_token) {
      setCode('')
      onToken(row.result_token)
      return
    }
    setMessage(MESSAGES[row.result_status] ?? MESSAGES.bad_code)
  }

  if (!isLoggedIn) {
    return (
      <div className="jbc jbc-box">
        <p className="jbc-hint">現場有房號嗎？先用 Google 登入，就能在這裡輸入房號加入聚會。</p>
      </div>
    )
  }

  return (
    <div className="jbc jbc-box">
      <label className="jbc-label" htmlFor="jbc-input">
        輸入房號加入聚會
      </label>
      <div className="jbc-row">
        <input
          id="jbc-input"
          className="jbc-input"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={4}
          placeholder="4 位數房號"
          value={code}
          onChange={(event) => {
            setCode(event.target.value.replace(/[^0-9]/g, '').slice(0, 4))
            setMessage('')
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void submit()
          }}
        />
        <button
          className="jbc-btn"
          type="button"
          disabled={busy || code.length !== 4}
          onClick={() => void submit()}
        >
          {busy ? '查詢中…' : '加入'}
        </button>
      </div>
      {message && <p className="jbc-msg">{message}</p>}
    </div>
  )
}
