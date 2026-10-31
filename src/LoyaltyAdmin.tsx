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
import PlannedGatheringsAdmin from './components/PlannedGatheringsAdmin'
import './styles/lga-list.css'

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
type VoucherUse = {
    id: string
    userId: string
    usedOn: string | null
    redeemedAt: string
}
type GrantRow = {
    id: string
    userId: string
    quantity: number
    grantedAt: string
}
type AdminTab = 'setup' | 'status' | 'vouchers'

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
    const [onlyWithPoints, setOnlyWithPoints] = useState(false)
    const [voucherUses, setVoucherUses] = useState<VoucherUse[]>([])
    const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({})
    const [grants, setGrants] = useState<GrantRow[]>([])
    // 管理者專用：每位 VIP／管理者想玩的遊戲（user_id -> 遊戲 bgg_name 集合）
    const [wantMap, setWantMap] = useState<Map<string, Set<string>> | null>(null)
    const [expandedWant, setExpandedWant] = useState<string | null>(null)
    // 指定遊戲旁的想玩名單太長時，是否展開全部（bgg_name -> 是否展開）
    const [wantersOpen, setWantersOpen] = useState<Record<string, boolean>>({})

    useEffect(() => {
        let cancelled = false
        void supabase.rpc('admin_get_want_to_play').then(({ data, error }) => {
            if (cancelled || error || !data) return
            setWantMap(
                new Map(
                    (data as { user_id: string; games: string[] | null }[]).map(
                        (row) =>
                            [row.user_id, new Set(row.games ?? [])] as [string, Set<string>],
                    ),
                ),
            )
        })
        return () => {
            cancelled = true
        }
    }, [])

    const [playStatus, setPlayStatus] = useState<{
        id: string
        map: Record<string, string | null>
    } | null>(null)

    // 讀取目前選中聚會各款遊戲的「開團確認狀態」
    useEffect(() => {
        if (!selectedId) return
        let cancelled = false
        void supabase
            .rpc('admin_get_gathering_game_status', { p_gathering: selectedId })
            .then(({ data }) => {
                if (cancelled || !data) return
                const map: Record<string, string | null> = {}
                for (const row of data as {
                    bgg_name: string
                    play_status: string | null
                }[]) {
                    map[row.bgg_name] = row.play_status
                }
                setPlayStatus({ id: selectedId, map })
            })
        return () => {
            cancelled = true
        }
    }, [selectedId, gatheringGames])

    const gameNameMap = useMemo(
        () => new Map(allGames.map((game) => [game.bggName, game.name])),
        [allGames],
    )

    async function loadVoucherUses(): Promise<string> {
        const [u, gr] = await Promise.all([
            supabase
                .from('loyalty_redemptions')
                .select('id, user_id, used_on, redeemed_at')
                .order('redeemed_at', { ascending: false })
                .limit(300),
            supabase
                .from('loyalty_grants')
                .select('id, user_id, quantity, granted_at')
                .order('granted_at', { ascending: false })
                .limit(300),
        ])
        if (u.error) return u.error.message
        if (gr.error) return gr.error.message
        setVoucherUses(
            (
                (u.data ?? []) as {
                    id: string
                    user_id: string
                    used_on: string | null
                    redeemed_at: string
                }[]
            ).map((row) => ({
                id: row.id,
                userId: row.user_id,
                usedOn: row.used_on,
                redeemedAt: row.redeemed_at,
            })),
        )
        setGrants(
            (
                (gr.data ?? []) as {
                    id: string
                    user_id: string
                    quantity: number
                    granted_at: string
                }[]
            ).map((row) => ({
                id: row.id,
                userId: row.user_id,
                quantity: row.quantity,
                grantedAt: row.granted_at,
            })),
        )
        return ''
    }

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

        const usesError = await loadVoucherUses()
        const failed =
            g.error ?? a.error ?? p.error ?? o.error ?? gg.error ?? bg.error ?? ct.error ?? ck.error
        setMessage(
            failed
                ? '讀取失敗：' + failed.message
                : usesError
                    ? '讀取免費券紀錄失敗：' + usesError
                    : '',
        )

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
        await loadVoucherUses()
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
                `確定刪除 ${gatheringName(gathering)} 的聚會嗎？這場的參加名單、遊戲清單都會一起刪除，玩家的點數會跟著重新計算。`,
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
        const manual =
            (attendees[gatheringId] ?? []).length -
            (selfAttendees[gatheringId] ?? []).length
        if (manual >= value) {
            setMessage(
                `手動加入的人數（${manual}）已經達到人數上限（${value}），沒有名額留給聚會連結，所以不能建立連結。請提高人數上限，或取消部分手動加入。`,
            )
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

    async function setGameStatus(
        gatheringId: string,
        bggName: string,
        status: 'played' | 'cancelled' | null,
    ) {
        setBusy(true)
        setMessage('')
        const { error } = await supabase.rpc('admin_set_game_play_status', {
            p_gathering: gatheringId,
            p_bgg_name: bggName,
            p_status: status,
        })
        if (error) {
            setMessage('設定開團狀態失敗：' + error.message)
        } else {
            setPlayStatus((current) =>
                current && current.id === gatheringId
                    ? { id: gatheringId, map: { ...current.map, [bggName]: status } }
                    : current,
            )
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
                .select('id, redeemed_at, used_on')
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
                    (r.data ?? []) as {
                        id: string
                        redeemed_at: string
                        used_on: string | null
                    }[]
                ).map(toRedemption),
            })
        }
        setBusy(false)
    }

    async function grantVoucher(row: OverviewRow) {
        const input = window.prompt(
            `要贈送幾張免費券給「${row.nickname}」？（1～5 張）`,
            '1',
        )
        if (input === null) return
        const qty = Number(input)
        if (!Number.isInteger(qty) || qty < 1 || qty > 5) {
            setMessage('張數請填 1～5 的整數。')
            return
        }
        setBusy(true)
        setMessage('')
        const { error } = await supabase.rpc('admin_grant_voucher', {
            p_user: row.userId,
            p_qty: qty,
        })
        if (error) {
            setMessage('贈送失敗：' + error.message)
        } else {
            setMessage(`已贈送 ${qty} 張免費券給「${row.nickname}」。`)
            await refreshOverview()
        }
        setBusy(false)
    }
    async function redeem(row: OverviewRow) {
        if (
            !window.confirm(
                `確定為「${row.nickname}」補登 1 張免費券使用嗎？\n（有券又有來的人系統會自動用券，這個按鈕只用來補登現場已經給過的券。）\n目前累積可用 ${row.availableVouchers} 張，補登後無法復原。`,
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
            setMessage(`已為「${row.nickname}」補登 1 張，剩下 ${data ?? 0} 張可用。`)
            await refreshOverview()
            if (detail?.userId === row.userId) await showDetail(row)
        }
        setBusy(false)
    }

    const selected = gatherings.find((g) => g.id === selectedId) ?? null
    const monthKeys = Array.from(
        new Set(gatherings.map((g) => g.gatheredOn.slice(0, 7))),
    )
    const selectedAttendees = selected ? (attendees[selected.id] ?? []) : []
    const selectedExempts = selected ? (exempts[selected.id] ?? []) : []
    const selectedGames = selected ? (gatheringGames[selected.id] ?? []) : []
    const selectedSelf = selected ? (selfAttendees[selected.id] ?? []) : []
    const selectedCheckin = selected ? (checkins[selected.id] ?? null) : null
    const manualCount = selectedAttendees.length - selectedSelf.length
    const draftCapacity =
        capacityDraft.trim() !== '' && Number.isInteger(Number(capacityDraft))
            ? Number(capacityDraft)
            : null
    const effectiveCapacity = selectedCheckin?.capacity ?? draftCapacity
    const linkSlots =
        effectiveCapacity !== null
            ? Math.max(0, effectiveCapacity - selectedAttendees.length)
            : null

    // 連結名額＝人數上限－手動加入的人數；手動加入已滿就不能建立連結
    const linkQuota =
        effectiveCapacity !== null ? Math.max(0, effectiveCapacity - manualCount) : null
    const linkBlocked =
        effectiveCapacity !== null && manualCount >= effectiveCapacity

    const playerQuery = playerSearch.trim().toLocaleLowerCase()
    const visiblePlayers = playerQuery
        ? players.filter(
            (player) =>
                player.nickname.toLocaleLowerCase().includes(playerQuery) ||
                (contacts[player.id] ?? '').toLocaleLowerCase().includes(playerQuery),
        )
        : players

    // 想玩提示（只是參考，不自動選人或選遊戲）
    const hasSelectedAttendees = selectedAttendees.length > 0
    const wantAmongSelected = (bggName: string) =>
        selectedAttendees.filter((id) => wantMap?.get(id)?.has(bggName)).length
    const wantInCommunity = (bggName: string) =>
        wantMap ? [...wantMap.values()].filter((set) => set.has(bggName)).length : 0
    const wantHint = (bggName: string): string => {
        if (!wantMap) return ''
        return hasSelectedAttendees
            ? `已選玩家中有 ${wantAmongSelected(bggName)} 人想玩`
            : `社群有 ${wantInCommunity(bggName)} 人想玩`
    }
    const wantCountOf = (userId: string) =>
        [...(wantMap?.get(userId) ?? [])].filter((name) => gameNameMap.has(name)).length
    // 某位玩家想玩的遊戲（本場指定的排最前面）
    const wantGamesOf = (userId: string) => {
        const names = [...(wantMap?.get(userId) ?? [])].filter((name) =>
            gameNameMap.has(name),
        )
        const inGathering = (name: string) => selectedGames.includes(name)
        return [
            ...names.filter(inGathering),
            ...names.filter((name) => !inGathering(name)),
        ].map((name) => ({
            bggName: name,
            name: gameNameMap.get(name) ?? name,
            inGathering: inGathering(name),
        }))
    }
    // 想玩某款遊戲的人（已選參加者排前面）
    const wantersOf = (bggName: string) => {
        const list = players.filter((p) => wantMap?.get(p.id)?.has(bggName))
        return [
            ...list.filter((p) => selectedAttendees.includes(p.id)),
            ...list.filter((p) => !selectedAttendees.includes(p.id)),
        ]
    }
    const renderWanters = (bggName: string) => {
        if (!wantMap) return null
        const people = wantersOf(bggName)
        // 想玩的人沒有暱稱（例如還沒設定暱稱的管理者）時，名單上找不到他
        const unnamed = wantInCommunity(bggName) - people.length
        if (people.length === 0 && unnamed <= 0) return null
        const open = !!wantersOpen[bggName]
        const shown = open ? people : people.slice(0, 5)
        return (
            <span className="lgp-wanters">
                {shown.map((p) => (
                    <span
                        key={p.id}
                        className={`lgp-tag ${selectedAttendees.includes(p.id) ? 'on' : ''}`}
                    >
                        {p.nickname}
                    </span>
                ))}
                {people.length > 5 && (
                    <button
                        type="button"
                        className="lgp-more"
                        onClick={() =>
                            setWantersOpen((current) => ({
                                ...current,
                                [bggName]: !open,
                            }))
                        }
                    >
                        {open ? '收合 ▴' : `還有 ${people.length - 5} 人 ▾`}
                    </button>
                )}
                {unnamed > 0 && (
                    <span className="lgp-unnamed">另有 {unnamed} 人（未設暱稱）</span>
                )}
            </span>
        )
    }
    const wantHintStyle = { marginLeft: 8, fontSize: '0.8em', color: '#8a6d46' }

    const searchText = gameSearch.trim().toLocaleLowerCase()
    const gameMatches = searchText
        ? allGames
            .filter(
                (game) =>
                    !selectedGames.includes(game.bggName) &&
                    (game.name.toLocaleLowerCase().includes(searchText) ||
                        game.bggName.toLocaleLowerCase().includes(searchText)),
            )
            .sort((x, y) =>
                hasSelectedAttendees
                    ? wantAmongSelected(y.bggName) - wantAmongSelected(x.bggName)
                    : 0,
            )
            .slice(0, 8)
        : []

    // 有券、有點數的人排最上面
    const rankedOverview = [...overview]
        .filter(
            (row) =>
                !onlyWithPoints || row.totalPoints > 0 || row.availableVouchers > 0,
        )
        .sort(
            (x, y) =>
                y.availableVouchers - x.availableVouchers ||
                y.monthPoints - x.monthPoints ||
                y.totalPoints - x.totalPoints ||
                x.nickname.localeCompare(y.nickname, 'zh-Hant'),
        )

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
                <button
                    type="button"
                    role="tab"
                    aria-selected={tab === 'vouchers'}
                    className={`loy-tab ${tab === 'vouchers' ? 'active' : ''}`}
                    onClick={() => setTab('vouchers')}
                >
                    免費券紀錄
                </button>
            </div>

            {tab === 'setup' && (
                <>
                    <PlannedGatheringsAdmin
                        allGames={allGames}
                        gatherings={gatherings.map((g) => ({
                            id: g.id,
                            label: gatheringName(g),
                            gatheredOn: g.gatheredOn,
                        }))}
                    />
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
                            當天出席任何一場，並把任一款指定遊戲的七項評分填完整（或被設為免評分）就得 1 點。
                        </p>
                    </section>

                    <section className="lga-section">
                        <h3 className="lga-step">
                            <span>2</span>近期聚會
                        </h3>
                        {gatherings.length === 0 ? (
                            <p className="loy-admin-note">還沒有聚會日。</p>
                        ) : (
                            monthKeys.map((monthKey) => {
                                const monthItems = gatherings.filter((g) =>
                                    g.gatheredOn.startsWith(monthKey),
                                )
                                const isOpen =
                                    openMonths[monthKey] ??
                                    (monthKey === monthKeys[0] ||
                                        monthKey === todayLocal().slice(0, 7))
                                const [yearText, monthText] = monthKey.split('-')
                                return (
                                    <div className="lga-month" key={monthKey}>
                                        <button
                                            type="button"
                                            className="lga-month-head"
                                            aria-expanded={isOpen}
                                            onClick={() =>
                                                setOpenMonths((current) => ({
                                                    ...current,
                                                    [monthKey]: !isOpen,
                                                }))
                                            }
                                        >
                                            <span>
                                                {yearText} 年 {Number(monthText)} 月
                                            </span>
                                            <small>{monthItems.length} 場</small>
                                            <span className="lga-month-arrow" aria-hidden="true">
                                                {isOpen ? '▴' : '▾'}
                                            </span>
                                        </button>
                                        {isOpen && (
                                            <ul className="lga-list">
                                                {monthItems.map((g) => {
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
                                                            {g.id === selectedId && selected && (
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

                                                                    <h4 className="lga-sub">① 指定遊戲（{selectedGames.length} 款）</h4>
                                                                    <p className="loy-admin-note">
                                                                        報到的人會依這份清單評分：任一款評分完整就得 1 點，評分可以在家補。
                                                                        建立連結前至少要有一款。
                                                                    </p>
                                                                    {wantMap && (
                                                                        <p className="loy-admin-note">
                                                                            想玩人數只統計 VIP 玩家，僅供參考，想玩不等於會來。
                                                                        </p>
                                                                    )}
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
                                                                                    <span>
                                                                                            {game.name}
                                                                                            {wantHint(game.bggName) && (
                                                                                                <small style={wantHintStyle}>{wantHint(game.bggName)}</small>
                                                                                            )}
{renderWanters(game.bggName)}
                                                                                        </span>
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
    <ul className="lgp-games">
        {selectedGames.map((bggName) => {
            const status =
                playStatus && playStatus.id === selected.id
                    ? (playStatus.map[bggName] ?? null)
                    : null
            const past = selected.gatheredOn <= todayLocal()
            return (
                <li key={bggName} className="lgp-game">
                    <div className="lgp-game-head">
                        <span className="lgp-game-name">
                            {gameNameMap.get(bggName) ?? bggName}
                        </span>
                        <button
                            type="button"
                            className="loy-mini-btn"
                            disabled={busy}
                            onClick={() => removeGame(selected.id, bggName)}
                        >
                            移除
                        </button>
                    </div>
                    {wantHint(bggName) && (
                        <small className="lgp-hint">{wantHint(bggName)}</small>
                    )}
                    {renderWanters(bggName)}
                    {(past || status !== null) && (
                        <div className="lgp-status">
                            <span
                                className={`lgp-state ${status ?? 'warn'}`}
                            >
                                {status === 'played'
                                    ? '✅ 實際開團'
                                    : status === 'cancelled'
                                        ? '✖ 已取消'
                                        : '⚠ 待確認'}
                            </span>
                            {status !== 'played' && (
                                <button
                                    type="button"
                                    className="loy-mini-btn"
                                    disabled={busy}
                                    onClick={() => setGameStatus(selected.id, bggName, 'played')}
                                >
                                    實際開團
                                </button>
                            )}
                            {status !== 'cancelled' && (
                                <button
                                    type="button"
                                    className="loy-mini-btn"
                                    disabled={busy}
                                    onClick={() => setGameStatus(selected.id, bggName, 'cancelled')}
                                >
                                    取消
                                </button>
                            )}
                            {status !== null && (
                                <button
                                    type="button"
                                    className="loy-mini-btn"
                                    disabled={busy}
                                    onClick={() => setGameStatus(selected.id, bggName, null)}
                                >
                                    改回未確認
                                </button>
                            )}
                        </div>
                    )}
                </li>
            )
        })}
    </ul>
)}
{selectedGames.length > 0 && selected.gatheredOn <= todayLocal() && (
    <p className="loy-admin-note">
        標記每款有沒有真的開：只有「實際開團」會出現在遊戲詳情的「紀錄」並計入次數，不影響集點。
    </p>
)}
                                                                    <h4 className="lga-sub">② 人數上限</h4>
                                                                    <p className="loy-admin-note">
                                                                        上限包含你手動加入的人。連結可報到的名額 ＝ 上限 － 目前出席人數。
                                                                        {!selectedCheckin && '建立連結時會一起儲存這個數字。'}
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
                                                                        {selectedCheckin && (
                                                                            <button
                                                                                type="button"
                                                                                className="lga-outline"
                                                                                disabled={busy}
                                                                                onClick={() => saveCapacity(selected.id)}
                                                                            >
                                                                                儲存上限
                                                                            </button>
                                                                        )}
                                                                    </div>

                                                                    <h4 className="lga-sub">
                                                                        ③ 手動加入參加者（{selectedAttendees.length} / {players.length}）
                                                                    </h4>
                                                                    <p className="loy-admin-note">
                                                                        點名字即可勾選出席，立即儲存。被你加入的人會自動成為 VIP，
                                                                        集點卡出現紅點，點開就能去評分。出席的人下方有「免評分」，開啟後這一天直接算 1 點。
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
                                                                        <>
                                                                        <ul className="lgp-list">
    {visiblePlayers.map((player) => {
        const attending = selectedAttendees.includes(player.id)
        const exempt = selectedExempts.includes(player.id)
        const wantOpen = expandedWant === player.id
        const wants = wantOpen ? wantGamesOf(player.id) : []
        return (
            <li
                key={player.id}
                className={`lgp-row ${attending ? 'on' : ''}`}
            >
                <div className="lgp-line">
                    <button
                        type="button"
                        className="lgp-pick"
                        disabled={busy}
                        aria-pressed={attending}
                        onClick={() =>
                            toggleAttendee(selected.id, player.id, !attending)
                        }
                    >
                        <span className="lgp-check" aria-hidden="true">
                            {attending ? '✓' : ''}
                        </span>
                        <span className="lgp-avatar">
                            {initialOf(player.nickname)}
                        </span>
                        <span className="lgp-text">
                            <span className="lgp-name">{player.nickname}</span>
                            <span className="lgp-sub">
                                {contacts[player.id] ?? '未填聯絡方式'}
                                {selectedSelf.includes(player.id) ? '・自己報到' : ''}
                            </span>
                        </span>
                    </button>
                    {wantMap?.has(player.id) && (
                        <button
                            type="button"
                            className="lgp-want"
                            aria-expanded={wantOpen}
                            onClick={() =>
                                setExpandedWant((current) =>
                                    current === player.id ? null : player.id,
                                )
                            }
                        >
                            想玩 {wantCountOf(player.id)} 款 {wantOpen ? '▴' : '▾'}
                        </button>
                    )}
                </div>
                {wantOpen && (
                    <div className="lgp-wants">
                        {wants.length === 0 ? (
                            <span className="lgp-unnamed">沒有標想玩的遊戲</span>
                        ) : (
                            wants.map((game) => (
                                <span
                                    key={game.bggName}
                                    className={`lgp-tag ${game.inGathering ? 'on' : ''}`}
                                >
                                    {game.name}
                                    {game.inGathering ? '・本場指定' : ''}
                                </span>
                            ))
                        )}
                    </div>
                )}
                {attending && (
                    <button
                        type="button"
                        className={`lga-exempt lgp-exempt ${exempt ? 'on' : ''}`}
                        disabled={busy}
                        aria-pressed={exempt}
                        onClick={() => toggleExempt(selected.id, player.id, !exempt)}
                    >
                        {exempt ? '✓ 免評分（已給點）' : '免評分'}
                    </button>
                )}
            </li>
        )
    })}
</ul>
                                                                        </>
                                                                    )}

                                                                    <h4 className="lga-sub">④ 聚會連結（報到＋集點卡）</h4>
                                                                    {linkSlots !== null && (
                                                                        <p className="loy-admin-note">
                                                                            上限 {effectiveCapacity} 人・手動加入 {manualCount} 人・連結名額 {linkQuota} 人
                                                                            （已報到 {selectedSelf.length} 人）・<b>還可報到 {linkSlots} 人</b>
                                                                        </p>
                                                                    )}
                                                                    <p className="loy-admin-note">
                                                                        連結只在聚會當天有效（有效至 {formatDay(selected.gatheredOn)} 23:59，台北時間），
                                                                        隔天起所有人點都會顯示已過期。用連結報到的人會自動成為 VIP。
                                                                    </p>
                                                                    {!selectedCheckin ? (
                                                                        <>
                                                                            {(selectedGames.length === 0 || draftCapacity === null) && (
                                                                                <p className="loy-admin-note">
                                                                                    請先完成 ① 指定遊戲、② 人數上限，才能建立連結。
                                                                                </p>
                                                                            )}
                                                                            {linkBlocked && (
                                                                                <p className="loy-admin-note">
                                                                                    手動加入的人數已達人數上限，沒有名額留給聚會連結，所以不能建立連結。
                                                                                </p>
                                                                            )}
                                                                            <button
                                                                                type="button"
                                                                                className="lga-outline"
                                                                                disabled={
                                                                                    busy ||
                                                                                    selectedGames.length === 0 ||
                                                                                    draftCapacity === null ||
                                                                                    linkBlocked
                                                                                }
                                                                                onClick={() => createCheckin(selected.id)}
                                                                            >
                                                                                ＋ 建立聚會連結
                                                                            </button>
                                                                        </>
                                                                    ) : (
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
                                                                    )}
                                                                </section>
                                                            )}
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        )}
                                    </div>
                                )
                            })
                        )}
                    </section>
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
                        <>
                            <label className="lga-filter">
                                <input
                                    type="checkbox"
                                    checked={onlyWithPoints}
                                    onChange={(event) =>
                                        setOnlyWithPoints(event.target.checked)
                                    }
                                />
                                只顯示有點數或有券的人
                            </label>
                            <ul className="lga-players">
                                {rankedOverview.map((row) => {
                                    const empty =
                                        row.totalPoints === 0 && row.availableVouchers === 0
                                    return (
                                        <li
                                            key={row.userId}
                                            className={`lga-pcard ${empty ? 'dim' : ''} ${row.availableVouchers > 0 ? 'has-ticket' : ''}`}
                                        >
                                            <span className="lga-avatar">
                                                {initialOf(row.nickname)}
                                            </span>
                                            <div className="lga-pinfo">
                                                <strong>
                                                    {row.nickname}
                                                    {row.overRedeemed && (
                                                        <span
                                                            className="loy-flag"
                                                            title="已使用超過目前累積"
                                                        >
                                                            ⚠
                                                        </span>
                                                    )}
                                                </strong>
                                                <small className="lga-contact">
                                                    {contacts[row.userId] ?? '未填聯絡方式'}
                                                </small>
                                            </div>
                                            <div className="lga-pstats">
                                                <span className="lga-pill">
                                                    本月 {row.monthPoints} / 2 點
                                                </span>
                                                <span className="lga-pill">
                                                    總 {row.totalPoints} 點
                                                </span>
                                                <span
                                                    className={`lga-pill ${row.availableVouchers > 0 ? 'ticket' : ''}`}
                                                >
                                                    🎟 可用 {row.availableVouchers}
                                                </span>
                                                <span className="lga-pill">
                                                    已使用 {row.redeemed}
                                                </span>
                                            </div>
                                            <div className="loy-admin-actions">
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
                                                    補登
                                                </button>
                                                <button
                                                    type="button"
                                                    className="admin-link"
                                                    disabled={busy}
                                                    onClick={() => grantVoucher(row)}
                                                >
                                                    贈送
                                                </button>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        </>
                    )}
                    <p className="loy-admin-note">
                        ⚠ 代表「已使用的張數 &gt; 目前累積」，通常是玩家用券後改了評分或取消了標記。有券又有來的人，評分完成後系統會自動用券（當天不集點），不用另外處理。
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
                                            {detail.redemptions.some(
                                                (item) => item.usedOn === day.date,
                                            )
                                                ? '🎟 使用免費券（這天不集點）'
                                                : day.qualified
                                                    ? '✓ 得 1 點'
                                                    : !day.hasSession
                                                        ? '還沒有標記玩過的遊戲（或沒有當天遊玩紀錄）'
                                                        : `評分完整 ${day.ratedCount} / ${day.gameCount} 款`}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <p>
                                免費券使用紀錄：
                                {detail.redemptions.length === 0
                                    ? '無'
                                    : detail.redemptions
                                        .map((item) =>
                                            item.usedOn
                                                ? `${formatDay(item.usedOn)} 用券（${formatDateTime(item.redeemedAt)}）`
                                                : `${formatDateTime(item.redeemedAt)}（補登）`,
                                        )
                                        .join('、')}
                            </p>
                        </div>
                    )}
                </>
            )}

            {tab === 'vouchers' && (
                <>
                    <h3 className="lga-step">
                        <span>🎟</span>免費券使用紀錄
                    </h3>
                    {voucherUses.length === 0 ? (
                        <p className="loy-admin-note">還沒有人使用過免費券。</p>
                    ) : (
                        <div className="loy-admin-tablewrap">
                            <table className="loy-admin-table">
                                <thead>
                                    <tr>
                                        <th>玩家</th>
                                        <th>用在哪一天</th>
                                        <th>使用時間</th>
                                        <th>來源</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {voucherUses.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                {players.find((p) => p.id === item.userId)
                                                    ?.nickname ?? '（未知）'}
                                                <small className="lga-contact">
                                                    {contacts[item.userId] ?? '未填聯絡方式'}
                                                </small>
                                            </td>
                                            <td>
                                                {item.usedOn ? formatDay(item.usedOn) : '—'}
                                            </td>
                                            <td>{formatDateTime(item.redeemedAt)}</td>
                                            <td>
                                                {item.usedOn ? '系統自動使用' : '管理者補登'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <h3 className="lga-step" style={{ marginTop: 18 }}>
                        <span>🎁</span>管理者贈送紀錄
                    </h3>
                    {grants.length === 0 ? (
                        <p className="loy-admin-note">還沒有贈送過免費券。</p>
                    ) : (
                        <div className="loy-admin-tablewrap">
                            <table className="loy-admin-table">
                                <thead>
                                    <tr>
                                        <th>玩家</th>
                                        <th>張數</th>
                                        <th>贈送時間</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {grants.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                {players.find((p) => p.id === item.userId)
                                                    ?.nickname ?? '（未知）'}
                                            </td>
                                            <td>{item.quantity}</td>
                                            <td>{formatDateTime(item.grantedAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
