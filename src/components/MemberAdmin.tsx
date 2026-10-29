import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

type Member = {
    user_id: string
    nickname: string
    contact_name: string | null
    is_vip: boolean
    vip_source: string | null
    vip_joined_at: string | null
    created_at: string
}

const SOURCE_LABEL: Record<string, string> = {
    password: '輸入密碼',
    checkin: '聚會報到',
    admin: '管理者授予',
}

type MemberFilter = 'all' | 'vip' | 'normal'
const FILTER_ORDER: MemberFilter[] = ['all', 'vip', 'normal']
const FILTER_LABEL: Record<MemberFilter, string> = {
    all: '全部',
    vip: 'VIP',
    normal: '一般',
}

export default function MemberAdmin() {
    const [members, setMembers] = useState<Member[]>([])
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<MemberFilter>('all')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [busyId, setBusyId] = useState<string | null>(null)
    const [newCode, setNewCode] = useState('')
    const [codeMessage, setCodeMessage] = useState('')
    const [lockCount, setLockCount] = useState(0)

    const load = useCallback(async () => {
        setLoading(true)
        const [m, l] = await Promise.all([
            supabase.rpc('admin_list_members'),
            supabase.rpc('admin_vip_lock_info'),
        ])
        setLoading(false)
        if (m.error) {
            setMessage('讀取失敗：' + m.error.message)
            return
        }
        setMessage('')
        setMembers((m.data ?? []) as Member[])
        setLockCount(l.error ? 0 : Number(l.data ?? 0))
    }, [])

    useEffect(() => {
        void load()
    }, [load])

    const vipCount = members.filter((m) => m.is_vip).length

    const shown = useMemo(() => {
        const keyword = search.trim().toLocaleLowerCase()
        return members.filter((m) => {
            if (filter === 'vip' && !m.is_vip) return false
            if (filter === 'normal' && m.is_vip) return false
            if (!keyword) return true
            return (
                m.nickname.toLocaleLowerCase().includes(keyword) ||
                (m.contact_name ?? '').toLocaleLowerCase().includes(keyword)
            )
        })
    }, [members, search, filter])

    async function toggleVip(member: Member) {
        const next = !member.is_vip
        if (!next && !window.confirm(`確定要移除「${member.nickname}」的 VIP 資格嗎？`)) {
            return
        }
        setBusyId(member.user_id)
        const { error } = await supabase.rpc('admin_set_vip', {
            p_user: member.user_id,
            p_on: next,
        })
        setBusyId(null)
        if (error) {
            setMessage('更新失敗：' + error.message)
            return
        }
        await load()
    }

    async function deleteMember(member: Member) {
        const typed = window.prompt(
            `這會永久刪除「${member.nickname}」的帳號、評分、遊玩紀錄與集點兌換紀錄，無法復原。\n\n請輸入暱稱 ${member.nickname} 確認：`,
        )
        if (typed === null) return
        if (typed.trim() !== member.nickname) {
            setMessage('暱稱輸入不符，已取消刪除。')
            return
        }
        setBusyId(member.user_id)
        const { error } = await supabase.rpc('admin_delete_member', {
            p_user: member.user_id,
        })
        setBusyId(null)
        if (error) {
            setMessage('刪除失敗：' + error.message)
            return
        }
        setMessage('')
        await load()
    }

    async function saveCode(event: FormEvent) {
        event.preventDefault()
        const code = newCode.trim()
        if (code.length < 4) {
            setCodeMessage('密碼至少 4 個字。')
            return
        }
        if (
            !window.confirm(
                '換密碼後，舊密碼立刻失效（已經是 VIP 的人不受影響）。確定嗎？',
            )
        ) {
            return
        }
        const { error } = await supabase.rpc('admin_set_vip_code', { p_code: code })
        if (error) {
            setCodeMessage('更改失敗：' + error.message)
            return
        }
        setNewCode('')
        setCodeMessage('密碼已更新。')
    }

    async function clearLock() {
        if (!window.confirm('要清除所有人的輸入錯誤紀錄、解除鎖定嗎？')) return
        const { error } = await supabase.rpc('admin_clear_vip_lock')
        if (error) {
            setMessage('解除失敗：' + error.message)
            return
        }
        await load()
    }

    return (
        <div className="ma-body">
            <p className="ma-summary">
                已設定暱稱的玩家 {members.length} 位，其中 VIP {vipCount} 位。
            </p>

            <div className="cls-searchbox">
                <input
                    type="search"
                    className="cls-search-input"
                    placeholder="搜尋暱稱或 LINE／FB 名字"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
                <button
                    type="button"
                    className={`search-filter-btn ${filter !== 'all' ? 'on' : ''}`}
                    aria-label={`篩選：${FILTER_LABEL[filter]}，點一下切換`}
                    onClick={() =>
                        setFilter(
                            (current) =>
                                FILTER_ORDER[(FILTER_ORDER.indexOf(current) + 1) % FILTER_ORDER.length],
                        )
                    }
                >
                    <span aria-hidden="true">☰</span>
                    <span>{FILTER_LABEL[filter]}</span>
                </button>
            </div>

            {message && <p className="pd-error">{message}</p>}
            {loading && <p className="ma-note">載入中…</p>}

            <ul className="ma-list">
                {shown.map((m) => (
                    <li key={m.user_id} className="ma-row">
                        <div className="ma-who">
                            <strong>{m.nickname}</strong>
                            <span>{m.contact_name || '（未填聯絡方式）'}</span>
                        </div>
                        <div className="ma-status">
                            {m.is_vip ? (
                                <span className="vip-tag">
                                    VIP · {SOURCE_LABEL[m.vip_source ?? ''] ?? '—'}
                                </span>
                            ) : (
                                <span className="ma-normal">一般會員</span>
                            )}
                        </div>
                        <button
                            type="button"
                            className="ma-btn"
                            disabled={busyId === m.user_id}
                            onClick={() => void toggleVip(m)}
                        >
                            {m.is_vip ? '移除 VIP' : '設為 VIP'}
                        </button>
                        <button
                            type="button"
                            className="ma-btn"
                            disabled={busyId === m.user_id}
                            onClick={() => void deleteMember(m)}
                        >
                            刪除帳號
                        </button>
                    </li>
                ))}
                {!loading && shown.length === 0 && (
                    <li className="ma-note">沒有符合的成員。</li>
                )}
            </ul>

            <div className="ma-code">
                <h3>VIP 通關密碼</h3>
                <p className={`ma-note ${lockCount >= 10 ? 'ma-warn' : ''}`}>
                    最近 15 分鐘全站輸入錯誤 {lockCount} 次
                    {lockCount >= 10 ? '（已全站鎖定）' : '（滿 10 次會全站鎖定 15 分鐘）'}。
                </p>
                {lockCount > 0 && (
                    <button type="button" className="ma-btn" onClick={() => void clearLock()}>
                        解除鎖定
                    </button>
                )}
                <form onSubmit={saveCode}>
                    <div className="ma-code-row">
                        <input
                            type="text"
                            value={newCode}
                            onChange={(event) => setNewCode(event.target.value)}
                            placeholder="新密碼（至少 4 個字）"
                            autoComplete="off"
                            maxLength={40}
                        />
                        <button type="submit" className="ma-btn">
                            更換密碼
                        </button>
                    </div>
                    {codeMessage && <p className="ma-note">{codeMessage}</p>}
                </form>
            </div>
        </div>
    )
}