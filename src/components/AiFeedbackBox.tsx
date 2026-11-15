import { useEffect, useMemo, useRef, useState } from 'react'
import { submitErrata } from '../lib/useGameErrata'
import { useIsAdmin } from '../lib/useIsAdmin'
import { clearFeedbackCtx, parseFeedback, type FeedbackCtx } from '../lib/aiAnswer'

// AI 回饋投稿：貼上 AI 回覆最後的回饋區塊，檢查核對碼與頁碼後送出待審核。
// 規則助手與詞庫頁共用；管理者與 VIP 都可以投稿。
export default function AiFeedbackBox({
    bggName,
    ctx,
    onDismiss,
}: {
    bggName: string
    ctx: FeedbackCtx
    onDismiss: () => void
}) {
    const isAdmin = useIsAdmin()
    const [text, setText] = useState('')
    const [verified, setVerified] = useState(false)
    const [busy, setBusy] = useState(false)
    const [err, setErr] = useState('')
    const [sent, setSent] = useState(false)
    const boxRef = useRef<HTMLDivElement | null>(null)
    const parsed = useMemo(() => (text.trim() ? parseFeedback(text, ctx) : null), [text, ctx])

    useEffect(() => {
        const id = window.setTimeout(
            () => boxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }),
            150,
        )
        return () => window.clearTimeout(id)
    }, [])

    async function submit() {
        if (!parsed || !parsed.ok) return
        setErr('')
        setBusy(true)
        const d = parsed.data
        const result = await submitErrata({
            id: null,
            bggName,
            title: d.title,
            content: d.content,
            sourceNote: 'AI 回饋（規則助手）',
            pageRef: d.pageText,
            verified,
            kind: 'ai_answer',
            autoApprove: isAdmin,
        })
        setBusy(false)
        if (result) {
            setErr(result)
            return
        }
        clearFeedbackCtx(bggName)
        setSent(true)
        setText('')
        setVerified(false)
    }

    function dismiss() {
        clearFeedbackCtx(bggName)
        onDismiss()
    }

    return (
        <div className="er-box ra2-fb" ref={boxRef}>
            <p className="er-box-title">AI 回饋投稿</p>
            {sent ? (
                <p className="er-note">
                    {isAdmin ? '已直接核准並公開。' : '已送出，管理者審核通過後才會公開。謝謝你分享！'}
                </p>
            ) : (
                <>
                    <p className="er-note">
                        AI 回答得不錯嗎？把 AI 回覆最後面那段「===規則助手回饋 v1===」到「===結束===」整段貼在下面，就能投稿給大家參考。管理者審核後才會公開，公開時不顯示你的名字。不是照「複製給我的 AI」產生的格式，無法投稿。
                    </p>
                    <textarea
                        rows={6}
                        value={text}
                        className="ra2-fb-text"
                        placeholder="貼上 AI 回覆最後的回饋區塊"
                        onChange={(event) => setText(event.target.value)}
                    />
                    {parsed && !parsed.ok && <p className="admin-error">{parsed.reason}</p>}
                    {parsed && parsed.ok && (
                        <div>
                            <p className="er-note">將投稿的內容（請確認）：</p>
                            <div className="er-title">{parsed.data.title}</div>
                            <p className="er-body">{parsed.data.answer}</p>
                            <small className="er-src">依據：{parsed.data.pageText}</small>
                            <label className="er-src ra2-fb-check">
                                <input
                                    type="checkbox"
                                    checked={verified}
                                    onChange={(event) => setVerified(event.target.checked)}
                                />{' '}
                                我已對照規則書確認（沒勾會標【未驗證】）
                            </label>
                        </div>
                    )}
                    {err && <p className="admin-error">{err}</p>}
                    <div className="rb-actions">
                        <button
                            type="button"
                            className="ma-btn"
                            disabled={busy || !parsed || !parsed.ok}
                            onClick={() => void submit()}
                        >
                            {busy ? '送出中…' : '送出投稿'}
                        </button>
                        <button type="button" className="admin-link" onClick={dismiss}>
                            收起，不投稿
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
