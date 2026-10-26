import { useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'
import { VIP_CHANGED_EVENT } from '../lib/useVip'

const MESSAGES: Record<string, string> = {
    wrong: '密碼不正確，請再試一次。',
    locked: '嘗試次數太多，請 15 分鐘後再試。',
    not_logged_in: '請先登入。',
    no_code: '管理者還沒有設定密碼。',
}

export default function VipJoinDialog({ onClose }: { onClose: () => void }) {
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
        <div className="modal-backdrop vip-join-backdrop" onClick={onClose}>
            <form
                className="admin-modal player-dialog"
                onClick={(event) => event.stopPropagation()}
                onSubmit={handleSubmit}
            >
                {done ? (
                    <>
                        <h2>歡迎加入 VIP 🎉</h2>
                        <p className="pd-hint">
                            現在可以使用評分、集點卡等朋友專屬功能了。
                        </p>
                        <button className="pd-save" type="button" onClick={onClose}>
                            好的
                        </button>
                    </>
                ) : (
                    <>
                        <h2>加入 VIP</h2>
                        <p className="pd-hint">
                            來玩過桌遊的朋友才能加入，請向管理者詢問通關密碼。
                            加入後，你的想玩／已玩會以暱稱顯示給 VIP 朋友看（管理者可看到完整名單），
                            可以隨時在暱稱選單關閉。
                        </p>
                        <label className="pd-field">
                            <span className="pd-label">通關密碼</span>
                            <input
                                type="password"
                                value={code}
                                onChange={(event) => setCode(event.target.value)}
                                autoComplete="off"
                                maxLength={40}
                                required
                            />
                        </label>
                        {message && <p className="pd-error">{message}</p>}
                        <button className="pd-save" type="submit" disabled={busy}>
                            {busy ? '驗證中…' : '驗證並加入'}
                        </button>
                        <div className="pd-secondary">
                            <button type="button" onClick={onClose}>
                                稍後再說
                            </button>
                        </div>
                    </>
                )}
            </form>
        </div>,
        document.body,
    )
}