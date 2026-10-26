import { useEffect, useMemo, useState } from 'react'
import { supabase } from './lib/supabase'
import {
    toDay,
    toRedemption,
    formatDay,
    formatDateTime,
    todayLocal,
    type LoyaltyDay,
    type Redemption,
} from './lib/useLoyalty'

type Gathering = { id: string; gatheredOn: string; title: string; note: string }
type Player = { id: string; nickname: string }
type GameOption = { bggName: string; name: string }
type OverviewRow = {
    userId: string
    nickname: string
    totalPoints: number
    monthPoints: number
    earnedVouchers: number
    redeemed: number
    availableVouchers: number
    overRedeemed: boolean
}
type Detail = {
    userId: string
    nickname: string
    days: LoyaltyDay[]
    redemptions: Redemption[]
}
type Checkin = { token: string; isOpen: boolean; capacity: number | null }
type AdminTab = 'setup' | 'status'

type OverviewRaw = {
    user_id: string
    nickname: string
    total_points: number
    month_points: number
    earned_vouchers: number
    redeemed: number
    available_vouchers: number
    over_redeemed: boolean
}

function toOverview(row: OverviewRaw): OverviewRow {
    return {
        userId: row.user_id,
        nickname: row.nickname,
        totalPoints: row.total_points,
        monthPoints: row.month_points,
        earnedVouchers: row.earned_vouchers,
        redeemed: row.redeemed,
        availableVouchers: row.available_vouchers,
        overRedeemed: row.over_redeemed,
    }
}

function initialOf(name: string): string {
    return Array.from(name.trim())[0] ?? '?'
}

function dayStatus(date: string): string {
    const today = todayLocal()
    if (date === today) return '進行中'
    return date > today ? '尚未開始' : '已結束'
}

function gatheringName(g: Gathering): string {
    return g.title ? `${formatDay(g.gatheredOn)} ${g.title}` : formatDay(g.gatheredOn)
}

function sortGatherings(list: Gathering[]): Gathering[] {
    return [...list].sort(
        (x, y) =>
            y.gatheredOn.localeCompare(x.gatheredOn) ||
            x.title.localeCompare(y.title, 'zh-Hant'),
    )
}

export default function LoyaltyAdmin() {
    const [tab, setTab] = useState<AdminTab>('setup')
    const [loading, setLoading] = useState(false)
    const [busy, setBusy] = useState(false)
    const [message, setMessage] = useState('')
    const [gatherings, setGatherings] = useState<Gathering[]>([])
    const [attendees, setAttendees] = useState<Record<string, string[]>>({})
    const [exempts, setExempts] = useState<Record<string, string[]>>({})
    const [gatheringGames, setGatheringGames] = useState<
        Record<string, string[]>
    >({})
    const [players, setPlayers] = useState<Player[]>([])
    const [contacts, setContacts] = useState<Record<string, string>>({})
    const [allGames, setAllGames] = useState<GameOption[]>([])
    const [overview, setOverview] = useState<OverviewRow[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [newDate, setNewDate] = useState(todayLocal)
    const [newTitle, setNewTitle] = useState('')
    const [newNote, setNewNote] = useState('')
    const [gameSearch, setGameSearch] = useState('')
    const [playerSearch, setPlayerSearch] = useState('')
    const [checkins, setCheckins] = useState<Record<string, Checkin>>({})
    const [selfAttendees, setSelfAttendees] = useState<Record<string, string[]>>({})
    const [capacityDraft, setCapacityDraft] = useState('')
    const [detail, setDetail] = useState<Detail | null>(null)

    const gameNameMap = useMemo(
        () => new Map(allGames.map((game) => [game.bggName, game.name])),
        [allGames],
    )

    async function loadAll() {
        setLoading(true)
        const [g, a, p, o, gg, bg, ct, ck] = await Promise.all([
            supabase
                .from('gatherings')
                .select('id, gathered_on, title, note')
                .order('gathered_on', { ascending: false })
                .order('title', { ascending: true }),
            supabase
                .from('gathering_attendees')
                .select('gathering_id, user_id, exempt, source'),
            supabase.from('player_profiles').select('id, nickname').order('nickname'),
            supabase.rpc('admin_get_loyalty_overview'),
            supabase.from('gathering_games').select('gathering_id, bgg_name'),
            supabase
                .from('board_games')
                .select('bgg_name, name')
                .is('removed_at', null)
                .order('name'),
            supabase.from('player_contacts').select('user_id, contact_name'),
            supabase
                .from('gathering_checkins')
                .select('gathering_id, token, is_open, capacity'),
        ])

        const failed =
            g.error ?? a.error ?? p.error ?? o.error ?? gg.error ?? bg.error ?? ct.error ?? ck.error
        setMessage(failed ? '讀取失敗：' + failed.message : '')

        setGatherings(
            (
                (g.data ?? []) as {
                    id: string
                    gathered_on: string
                    title: string
                    note: string
                }[]
            ).map((row) => ({
                id: row.id,
                gatheredOn: row.gathered_on,
                title: row.title ?? '',
                note: row.note,
            })),
        )

        const attendeeMap: Record<string, string[]> = {}
        const exemptMap: Record<string, string[]> = {}
        const selfMap: Record<string, string[]> = {}
        for (const row of (a.data ?? []) as {
            gathering_id: string
            user_id: string
            exempt: boolean
            source: string
        }[]) {
            ; (attendeeMap[row.gathering_id] ??= []).push(row.user_id)
            if (row.exempt) (exemptMap[row.gathering_id] ??= []).push(row.user_id)
            if (row.source === 'self') (selfMap[row.gathering_id] ??= []).push(row.user_id)
        }
        setAttendees(attendeeMap)
        setExempts(exemptMap)
        setSelfAttendees(selfMap)

        setCheckins(
            Object.fromEntries(
                (
                    (ck.data ?? []) as {
                        gathering_id: string
                        token: string
                        is_open: boolean
                        capacity: number | null
                    }[]
                ).map((row) => [
                    row.gathering_id,
                    { token: row.token, isOpen: row.is_open, capacity: row.capacity },
                ]),
            ),
        )

        const gameMap: Record<string, string[]> = {}
        for (const row of (gg.data ?? []) as {
            gathering_id: string
            bgg_name: string
        }[]) {
            ; (gameMap[row.gathering_id] ??= []).push(row.bgg_name)
        }
        setGatheringGames(gameMap)

        setAllGames(
            ((bg.data ?? []) as { bgg_name: string; name: string }[]).map((row) => ({
                bggName: row.bgg_name,
                name: row.name,
            })),
        )
        setPlayers((p.data ?? []) as Player[])
        setContacts(
            Object.fromEntries(
                ((ct.data ?? []) as { user_id: string; contact_name: string }[]).map(
                    (row) => [row.user_id, row.contact_name],
                ),
            ),
        )
        setOverview(((o.data ?? []) as OverviewRaw[]).map(toOverview))
        setLoading(false)
    }

    useEffect(() => {
        void loadAll()
        // 只在打開這個分頁時讀取一次
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function refreshOverview() {
        const { data, error } = await supabase.rpc('admin_get_loyalty_overview')
        if (error) {
            setMessage('更新總表失敗：' + error.message)
            return
        }
        setOverview(((data ?? []) as OverviewRaw[]).map(toOverview))
    }

    async function addGathering() {
        if (!newDate) return
        setBusy(true)
        setMessage('')
        const { data, error } = await supabase
            .from('gatherings')
            .insert({
                gathered_on: newDate,
                title: newTitle.trim(),
                note: newNote.trim(),
            })
            .select('id, gathered_on, title, note')
            .single()

        if (error) {
            setMessage(
                error.code === '23505'
                    ? '這一天已經有相同場次名稱的聚會了，請直接選它，或換一個場次名稱（例如：早場、下午場、晚場）。'
                    : '新增失敗：' + error.message,
            )
        } else if (data) {
            const created: Gathering = {
                id: data.id,
                gatheredOn: data.gathered_on,
                title: data.title ?? '',
                note: data.note,
            }
            setGatherings((current) => sortGatherings([created, ...current]))
            setSelectedId(created.id)
            setNewTitle('')
            setNewNote('')
        }
        setBusy(false)
    }

    async function deleteGathering(gathering: Gathering) {
        if (
            !window.confirm(
                `確定刪除 ${gatheringName(gathering)} 的聚會嗎？這場的參加名單、遊戲清單與玩家的「我玩了」標記都會一起刪除，玩家的點數會跟著重新計算。`,
            )
        )
            return

        setBusy(true)
        setMessage('')
        const { error } = await supabase
            .from('gatherings')
            .delete()
            .eq('id', gathering.id)

        if (error) {
            setMessage('刪除失敗：' + error.message)
        } else {
            setGatherings((current) => current.filter((g) => g.id !== gathering.id))
            setSelectedId(null)
            await refreshOverview()
        }
        setBusy(false)
    }

    async function toggleAttendee(
        gatheringId: string,
        userId: string,
        checked: boolean,
    ) {
        const capacity = checkins[gatheringId]?.capacity ?? null
        if (
            checked &&
            capacity !== null &&
            (attendees[gatheringId] ?? []).length >= capacity &&
            !window.confirm(
                `這場聚會的人數上限是 ${capacity} 人，目前已經滿了。要由你手動加入、超過上限嗎？`,
            )
        )
            return

        setBusy(true)
        setMessage('')

        const result = checked
            ? await supabase
                .from('gathering_attendees')
                .insert({ gathering_id: gatheringId, user_id: userId })
            : await supabase
                .from('gathering_attendees')
                .delete()
                .eq('gathering_id', gatheringId)
                .eq('user_id', userId)

        if (result.error) {
            setMessage('更新名單失敗：' + result.error.message)
        } else {
            setAttendees((current) => {
                const list = current[gatheringId] ?? []
                return {
                    ...current,
                    [gatheringId]: checked
                        ? [...list, userId]
                        : list.filter((id) => id !== userId),
                }
            })
            if (!checked) {
                setSelfAttendees((current) => ({
                    ...current,
                    [gatheringId]: (current[gatheringId] ?? []).filter(
                        (id) => id !== userId,
                    ),
                }))
                setExempts((current) => ({
                    ...current,
                    [gatheringId]: (current[gatheringId] ?? []).filter(
                        (id) => id !== userId,
                    ),
                }))
            }
            await refreshOverview()
        }
        setBusy(false)
    }

    // 例外：玩家有出席，但不用評分，直接算 1 點
    async function toggleExempt(
        gatheringId: string,
        userId: string,
        exempt: boolean,
    ) {
        setBusy(true)
        setMessage('')

        const { data, error } = await supabase
            .from('gathering_attendees')
            .update({ exempt })
            .eq('gathering_id', gatheringId)
            .eq('user_id', userId)
            .select('user_id')

        if (error) {
            setMessage('更新例外失敗：' + error.message)
        } else if (!data || data.length === 0) {
            setMessage('更新例外失敗：沒有權限或找不到這筆出席紀錄。')
        } else {
            setExempts((current) => {
                const list = current[gatheringId] ?? []
                return {
                    ...current,
                    [gatheringId]: exempt
                        ? [...list.filter((id) => id !== userId), userId]
                        : list.filter((id) => id !== userId),
                }
            })
            await refreshOverview()
        }
        setBusy(false)
    }

    // 自助報到：建立連結、開關、人數上限、重設連結
    async function createCheckin(gatheringId: string) {
        const raw = capacityDraft.trim()
        const value = Number(raw)
        if ((gatheringGames[gatheringId] ?? []).length === 0) {
            setMessage('請先在下方「指定遊戲」至少加入一款，才能建立聚會連結。')
            return
        }
        if (raw === '' || !Number.isInteger(value) || value < 1 || value > 500) {
            setMessage('請先填人數上限（1～500 的整數），才能建立聚會連結。')
            return
        }
        setBusy(true)
        setMessage('')
        const { data, error } = await supabase
            .from('gathering_checkins')
            .insert({ gathering_id: gatheringId, is_open: true, capacity: value })
            .select('gathering_id, token, is_open, capacity')
            .single()

        if (error) {
            setMessage('建立報到連結失敗：' + error.message)
        } else if (data) {
            setCheckins((current) => ({
                ...current,
                [gatheringId]: {
                    token: data.token,
                    isOpen: data.is_open,
                    capacity: data.capacity,
                },
            }))
        }
        setBusy(false)
    }
    async function updateCheckin(
        gatheringId: string,
        patch: { is_open?: boolean; capacity?: number | null; token?: string },
        doneMessage = '',
    ) {
        setBusy(true)
        setMessage('')
        const { data, error } = await supabase
            .from('gathering_checkins')
            .update(patch)
            .eq('gathering_id', gatheringId)
            .select('gathering_id, token, is_open, capacity')
            .single()

        if (error) {
            setMessage('更新報到設定失敗：' + error.message)
        } else if (data) {
            setCheckins((current) => ({
                ...current,
                [gatheringId]: {
                    token: data.token,
                    isOpen: data.is_open,
                    capacity: data.capacity,
                },
            }))
            if (doneMessage) setMessage(doneMessage)
        }
        setBusy(false)
    }

    async function saveCapacity(gatheringId: string) {
        const raw = capacityDraft.trim()
        const value = Number(raw)
        if (raw === '' || !Number.isInteger(value) || value < 1 || value > 500) {
            setMessage('人數上限一定要填，請填 1～500 的整數。')
            return
        }
        const current = (attendees[gatheringId] ?? []).length
        if (
            value < current &&
            !window.confirm(
                `目前已有 ${current} 人出席，比新的上限 ${value} 多。已在名單上的人不受影響，但新的人無法再報到。確定嗎？`,
            )
        ) {
            return
        }
        await updateCheckin(
            gatheringId,
            { capacity: value },
            `人數上限已設為 ${value} 人。`,
        )
    }

    async function resetCheckinToken(gatheringId: string) {
        if (
            !window.confirm(
                '重設後，舊的報到連結會立刻失效（已經報到的人不受影響）。確定要重設嗎？',
            )
        )
            return
        await updateCheckin(
            gatheringId,
            { token: crypto.randomUUID().replaceAll('-', '') },
            '已重設，請重新複製新的報到連結。',
        )
    }

    async function copyJoinLink(token: string) {
        const link = `${window.location.origin}/?join=${token}&openExternalBrowser=1`
        try {
            await navigator.clipboard.writeText(link)
            setMessage(`已複製聚會連結，可以傳給今天來玩的人：${link}`)
        } catch {
            window.prompt('請複製這個聚會連結：', link)
        }
    }

    async function addGame(gatheringId: string, bggName: string) {
        setBusy(true)
        setMessage('')
        const { error } = await supabase
            .from('gathering_games')
            .insert({ gathering_id: gatheringId, bgg_name: bggName })

        if (error) {
            setMessage('新增遊戲失敗：' + error.message)
        } else {
            setGatheringGames((current) => ({
                ...current,
                [gatheringId]: [...(current[gatheringId] ?? []), bggName],
            }))
            setGameSearch('')
            await refreshOverview()
        }
        setBusy(false)
    }

    async function removeGame(gatheringId: string, bggName: string) {
        if ((gatheringGames[gatheringId] ?? []).length <= 1 && checkins[gatheringId]) {
            setMessage('已經有聚會連結的場次，至少要保留一款遊戲。請先加入新的遊戲再移除這一款。')
            return
        }
        const name = gameNameMap.get(bggName) ?? bggName
        if (
            !window.confirm(
                `確定從這一場移除「${name}」嗎？`,
            )
        )
            return

        setBusy(true)
        setMessage('')
        const { error } = await supabase
            .from('gathering_games')
            .delete()
            .eq('gathering_id', gatheringId)
            .eq('bgg_name', bggName)

        if (error) {
            setMessage('移除遊戲失敗：' + error.message)
        } else {
            setGatheringGames((current) => ({
                ...current,
                [gatheringId]: (current[gatheringId] ?? []).filter(
                    (item) => item !== bggName,
                ),
            }))
            await refreshOverview()
        }
        setBusy(false)
    }

    async function showDetail(row: OverviewRow) {
        setBusy(true)
        setMessage('')
        const [d, r] = await Promise.all([
            supabase.rpc('admin_get_loyalty_days', { p_user: row.userId }),
            supabase
                .from('loyalty_redemptions')
                .select('id, redeemed_at')
                .eq('user_id', row.userId)
                .order('redeemed_at', { ascending: false }),
        ])

        const failed = d.error ?? r.error
        if (failed) {
            setMessage('讀取明細失敗：' + failed.message)
        } else {
            setDetail({
                userId: row.userId,
                nickname: row.nickname,
                days: (
                    (d.data ?? []) as {
                        day_date: string
                        game_count: number
                        rated_count: number
                        has_session: boolean
                        qualified: boolean
                    }[]
                ).map(toDay),
                redemptions: (
                    (r.data ?? []) as { id: string; redeemed_at: string }[]
                ).map(toRedemption),
            })
        }
        setBusy(false)
    }

    async function redeem(row: OverviewRow) {
        if (
            !window.confirm(
                `確定為「${row.nickname}」兌換 1 張免費券嗎？\n目前可用 ${row.availableVouchers} 張，兌換後無法復原。`,
            )
        )
            return

        setBusy(true)
        setMessage('')
        const { data, error } = await supabase.rpc('admin_redeem_voucher', {
            p_user: row.userId,
        })

        if (error) {
            setMessage('兌換失敗：' + error.message)
        } else {
            setMessage(`已為「${row.nickname}」兌換 1 張，剩下 ${data ?? 0} 張可用。`)
            await refreshOverview()
            if (detail?.userId === row.userId) await showDetail(row)
        }
        setBusy(false)
    }

    const selected = gatherings.find((g) => g.id === selectedId) ?? null
    const selectedAttendees = selected ? (attendees[selected.id] ?? []) : []
    const selectedExempts = selected ? (exempts[selected.id] ?? []) : []
    const selectedGames = selected ? (gatheringGames[selected.id] ?? []) : []
    const selectedSelf = selected ? (selfAttendees[selected.id] ?? []) : []
    const selectedCheckin = selected ? (checkins[selected.id] ?? null) : null

    const playerQuery = playerSearch.trim().toLocaleLowerCase()
    const visiblePlayers = playerQuery
        ? players.filter(
            (player) =>
                player.nickname.toLocaleLowerCase().includes(playerQuery) ||
                (contacts[player.id] ?? '').toLocaleLowerCase().includes(playerQuery),
        )
        : players

    const searchText = gameSearch.trim().toLocaleLowerCase()
    const gameMatches = searchText
        ? allGames
            .filter(
                (game) =>
                    !selectedGames.includes(game.bggName) &&
                    (game.name.toLocaleLowerCase().includes(searchText) ||
                        game.bggName.toLocaleLowerCase().includes(searchText)),
            )
            .slice(0, 8)
        : []

    return (
        <div className="loy-admin lga-embedded">
            {loading && <p className="loy-admin-note">讀取中…</p>}
            {message && <p className="loy-admin-message">{message}</p>}

            <div className="loy-tabs" role="tablist">
                <button
                    type="button"
                    role="tab"
                    aria-selected={tab === 'setup'}
                    className={`loy-tab ${tab === 'setup' ? 'active' : ''}`}
                    onClick={() => setTab('setup')}
                >
                    聚會設定
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={tab === 'status'}
                    className={`loy-tab ${tab === 'status' ? 'active' : ''}`}
                    onClick={() => setTab('status')}
                >
                    集點狀況
                </button>
            </div>

            {tab === 'setup' && (
                <>
                    <section className="lga-card">
                        <h3 className="lga-step">
                            <span>1</span>新增聚會
                        </h3>
                        <div className="lga-new">
                            <input
                                type="date"
                                value={newDate}
                                onChange={(event) => setNewDate(event.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="場次（選填，例如：早場、晚場）"
                                maxLength={20}
                                value={newTitle}
                                onChange={(event) => setNewTitle(event.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="備註（選填，200 字內）"
                                maxLength={200}
                                value={newNote}
                                onChange={(event) => setNewNote(event.target.value)}
                            />
                            <button
                                className="lga-primary"
                                type="button"
                                disabled={busy || !newDate}
                                onClick={addGathering}
                            >
                                ＋ 新增聚會
                            </button>
                        </div>
                        <p className="loy-admin-note">
                            同一天可以新增多場（場次名稱不能重複）。集點是「一天最多 1 點」：
                            當天出席任何一場，並把出席各場的指定遊戲都評完分（或被設為免評分）就得 1 點。
                        </p>
                    </section>

                    <section className="lga-section">
                        <h3 className="lga-step">
                            <span>2</span>近期聚會
                        </h3>
                        {gatherings.length === 0 ? (
                            <p className="loy-admin-note">還沒有聚會日。</p>
                        ) : (
                            <ul className="lga-list">
                                {gatherings.map((g) => {
                                    const [, month, day] = g.gatheredOn.split('-')
                                    const status = dayStatus(g.gatheredOn)
                                    return (
                                        <li key={g.id}>
                                            <button
                                                type="button"
                                                className={`lga-row ${g.id === selectedId ? 'active' : ''}`}
                                                onClick={() => {
                                                    setSelectedId(g.id === selectedId ? null : g.id)
                                                    setPlayerSearch('')
                                                    setCapacityDraft(String(checkins[g.id]?.capacity ?? ''))
                                                }}
                                            >
                                                <span className="lga-date">
                                                    <small>{Number(month)} 月</small>
                                                    <strong>{Number(day)}</strong>
                                                </span>
                                                <span className="lga-row-main">
                                                    <strong>
                                                        {[g.title, g.note].filter(Boolean).join('・') ||
                                                            '桌遊聚會'}
                                                    </strong>
                                                    <small>
                                                        {formatDay(g.gatheredOn)}・
                                                        {(attendees[g.id] ?? []).length} 人・
                                                        {(gatheringGames[g.id] ?? []).length} 款
                                                    </small>
                                                </span>
                                                <span
                                                    className={`lga-status ${status === '已結束' ? 'done' : ''}`}
                                                >
                                                    {status}
                                                </span>
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </section>

                    {selected && (
                        <section className="lga-card lga-detail">
                            <div className="lga-detail-head">
                                <h3>聚會詳情 — {gatheringName(selected)}</h3>
                                <div className="lga-detail-actions">
                                    <button
                                        type="button"
                                        className="lga-danger"
                                        disabled={busy}
                                        onClick={() => deleteGathering(selected)}
                                    >
                                        刪除這一場
                                    </button>
                                </div>
                            </div>

                            <h4 className="lga-sub">聚會連結（報到＋集點卡）</h4>
                            {selectedGames.length === 0 && (
                                <p className="loy-admin-note">
                                    請先到下方「指定遊戲」至少加入一款，才能建立或複製連結。
                                </p>
                            )}
                            {!selectedCheckin ? (
                                <>
                                    <p className="loy-admin-note">
                                        人數上限一定要填，避免連結被亂傳。只有聚會當天（台北時間）可以報到，
                                        已報到的人之後仍可用同一個連結回到集點卡。報到後還不是 VIP 的人，要輸入通關密碼。
                                    </p>
                                    <div className="lga-new lga-cap">
                                        <span>人數上限</span>
                                        <input
                                            type="number"
                                            min={1}
                                            max={500}
                                            placeholder="必填，例如 12"
                                            value={capacityDraft}
                                            onChange={(event) => setCapacityDraft(event.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="lga-outline"
                                            disabled={busy || selectedGames.length === 0}
                                            onClick={() => createCheckin(selected.id)}
                                        >
                                            ＋ 建立聚會連結
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="lga-checkin-row">
                                        <button
                                            type="button"
                                            className={`lga-toggle ${selectedCheckin.isOpen ? 'on' : ''}`}
                                            disabled={busy}
                                            aria-pressed={selectedCheckin.isOpen}
                                            onClick={() =>
                                                updateCheckin(selected.id, {
                                                    is_open: !selectedCheckin.isOpen,
                                                })
                                            }
                                        >
                                            {selectedCheckin.isOpen
                                                ? '● 報到開放中（按一下關閉）'
                                                : '○ 報到已關閉（按一下開放）'}
                                        </button>
                                        <button
                                            type="button"
                                            className="lga-outline"
                                            disabled={busy || selectedGames.length === 0}
                                            onClick={() => copyJoinLink(selectedCheckin.token)}
                                        >
                                            🔗 複製聚會連結
                                        </button>
                                        <button
                                            type="button"
                                            className="lga-danger"
                                            disabled={busy}
                                            onClick={() => resetCheckinToken(selected.id)}
                                        >
                                            重設連結
                                        </button>
                                    </div>
                                    <div className="lga-new lga-cap">
                                        <span>人數上限</span>
                                        <input
                                            type="number"
                                            min={1}
                                            max={500}
                                            placeholder="必填"
                                            value={capacityDraft}
                                            onChange={(event) => setCapacityDraft(event.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="lga-outline"
                                            disabled={busy}
                                            onClick={() => saveCapacity(selected.id)}
                                        >
                                            儲存上限
                                        </button>
                                    </div>
                                    <p className="loy-admin-note">
                                        目前 {selectedAttendees.length} 人出席（自己報到{' '}
                                        {selectedSelf.length} 人），上限 {selectedCheckin.capacity} 人。
                                        你手動加入時可以超過上限（會先跳確認）。填錯可以隨時改上限、增減遊戲。
                                    </p>
                                </>
                            )}

                            <h4 className="lga-sub">
                                參加者（{selectedAttendees.length} / {players.length}）
                            </h4>
                            <p className="loy-admin-note">
                                點名字即可勾選出席，立即儲存。出席的人下方有「免評分」：
                                適合中途離開、來不及評分的玩家，開啟後這一天直接算 1 點。
                                玩家只看得到自己的出席。
                            </p>
                            {players.length > 0 && (
                                <div className="lga-new lga-search">
                                    <input
                                        type="search"
                                        placeholder="搜尋玩家（暱稱、LINE／FB 名字）…"
                                        value={playerSearch}
                                        onChange={(event) => setPlayerSearch(event.target.value)}
                                    />
                                </div>
                            )}
                            {players.length === 0 ? (
                                <p className="loy-admin-note">還沒有玩家設定暱稱。</p>
                            ) : visiblePlayers.length === 0 ? (
                                <p className="loy-admin-note">找不到符合的玩家。</p>
                            ) : (
                                <ul className="lga-chips">
                                    {visiblePlayers.map((player) => {
                                        const attending = selectedAttendees.includes(player.id)
                                        const exempt = selectedExempts.includes(player.id)
                                        return (
                                            <li
                                                key={player.id}
                                                className={`lga-chip ${attending ? 'on' : ''}`}
                                            >
                                                <button
                                                    type="button"
                                                    className="lga-chip-main"
                                                    disabled={busy}
                                                    aria-pressed={attending}
                                                    onClick={() =>
                                                        toggleAttendee(selected.id, player.id, !attending)
                                                    }
                                                >
                                                    <span className="lga-avatar">
                                                        {initialOf(player.nickname)}
                                                    </span>
                                                    <span className="lga-chip-name">{player.nickname}</span>
                                                    {attending && <span className="lga-check">✓</span>}
                                                </button>
                                                <span className="lga-contact">
                                                    {contacts[player.id] ?? '未填聯絡方式'}
                                                </span>
                                                {selectedSelf.includes(player.id) && (
                                                    <span className="lga-self">自己報到</span>
                                                )}
                                                {attending && (
                                                    <button
                                                        type="button"
                                                        className={`lga-exempt ${exempt ? 'on' : ''}`}
                                                        disabled={busy}
                                                        aria-pressed={exempt}
                                                        onClick={() =>
                                                            toggleExempt(selected.id, player.id, !exempt)
                                                        }
                                                    >
                                                        {exempt ? '✓ 免評分（已給點）' : '免評分'}
                                                    </button>
                                                )}
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}

                            <h4 className="lga-sub">指定遊戲（{selectedGames.length} 款）</h4>
                            <p className="loy-admin-note">
                                收到連結並報到的人，會依這份清單評分：任一款評分完整就得 1 點，評分可以在家補。
                                建立連結前至少要有一款遊戲。
                            </p>
                            <div className="lga-new lga-search">
                                <input
                                    type="text"
                                    placeholder="搜尋遊戲名稱…"
                                    value={gameSearch}
                                    onChange={(event) => setGameSearch(event.target.value)}
                                />
                            </div>
                            {gameMatches.length > 0 && (
                                <ul className="loy-picker-results">
                                    {gameMatches.map((game) => (
                                        <li key={game.bggName}>
                                            <span>{game.name}</span>
                                            <button
                                                type="button"
                                                className="loy-mini-btn"
                                                disabled={busy}
                                                onClick={() => addGame(selected.id, game.bggName)}
                                            >
                                                ＋ 加入
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {searchText && gameMatches.length === 0 && (
                                <p className="loy-admin-note">找不到符合的遊戲。</p>
                            )}

                            {selectedGames.length === 0 ? (
                                <p className="loy-admin-note">還沒有選遊戲。</p>
                            ) : (
                                <ul className="loy-picked">
                                    {selectedGames.map((bggName) => (
                                        <li key={bggName}>
                                            <span>{gameNameMap.get(bggName) ?? bggName}</span>
                                            <button
                                                type="button"
                                                className="loy-mini-btn"
                                                disabled={busy}
                                                onClick={() => removeGame(selected.id, bggName)}
                                            >
                                                移除
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    )}
                </>
            )}

            {tab === 'status' && (
                <>
                    <h3 className="lga-step">
                        <span>★</span>大家的集點狀況（對帳用）
                    </h3>
                    {overview.length === 0 ? (
                        <p>還沒有任何人被列入聚會名單。</p>
                    ) : (
                        <div className="loy-admin-tablewrap">
                            <table className="loy-admin-table">
                                <thead>
                                    <tr>
                                        <th>暱稱</th>
                                        <th>本月</th>
                                        <th>總點數</th>
                                        <th>累積券</th>
                                        <th>已兌換</th>
                                        <th>可用</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {overview.map((row) => (
                                        <tr key={row.userId}>
                                            <td>
                                                {row.nickname}
                                                <small className="lga-contact">
                                                    {contacts[row.userId] ?? '未填聯絡方式'}
                                                </small>
                                                {row.overRedeemed && (
                                                    <span className="loy-flag" title="已兌換超過目前累積">
                                                        ⚠
                                                    </span>
                                                )}
                                            </td>
                                            <td>{row.monthPoints}</td>
                                            <td>{row.totalPoints}</td>
                                            <td>{row.earnedVouchers}</td>
                                            <td>{row.redeemed}</td>
                                            <td>{row.availableVouchers}</td>
                                            <td className="loy-admin-actions">
                                                <button
                                                    type="button"
                                                    className="admin-link"
                                                    disabled={busy}
                                                    onClick={() => showDetail(row)}
                                                >
                                                    明細
                                                </button>
                                                <button
                                                    type="button"
                                                    className="admin-link"
                                                    disabled={busy || row.availableVouchers < 1}
                                                    onClick={() => redeem(row)}
                                                >
                                                    兌換
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <p className="loy-admin-note">
                        ⚠ 代表「已兌換的張數 &gt; 目前累積」，通常是玩家領券後改了評分或取消了標記。
                    </p>
                    <button
                        className="loy-refresh"
                        type="button"
                        disabled={busy}
                        onClick={refreshOverview}
                    >
                        重新整理
                    </button>

                    {detail && (
                        <div className="loy-admin-detail">
                            <h3>{detail.nickname} 的明細</h3>
                            {detail.days.length === 0 ? (
                                <p>沒有被列入任何聚會日。</p>
                            ) : (
                                <ul>
                                    {detail.days.map((day) => (
                                        <li key={day.date}>
                                            {formatDay(day.date)}：
                                            {day.qualified
                                                ? '✓ 得 1 點'
                                                : !day.hasSession
                                                    ? '還沒有標記玩過的遊戲（或沒有當天遊玩紀錄）'
                                                    : `評分完整 ${day.ratedCount} / ${day.gameCount} 款`}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <p>
                                兌換紀錄：
                                {detail.redemptions.length === 0
                                    ? '無'
                                    : detail.redemptions
                                        .map((item) => formatDateTime(item.redeemedAt))
                                        .join('、')}
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}