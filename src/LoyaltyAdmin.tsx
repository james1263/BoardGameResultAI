import { useEffect, useMemo, useState } from 'react'
import { supabase } from './lib/supabase'
import { askConfirm, askInput, showNotice } from './lib/askConfirm'
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
import NewGatheringWizard from './components/NewGatheringWizard'
import './styles/lga-manage.css'
import './styles/lga-list.css'
import './styles/lga-status-list.css'

type Gathering = { id: string; gatheredOn: string; title: string; note: string }
type Player = { id: string; nickname: string }
type GameOption = { bggName: string; name: string; referenceOnly?: boolean }
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
    // 自動／補記的遊玩紀錄；null＝讀取失敗
    autoSessions: AutoSession[] | null
}
type AutoSession = { playedOn: string; bggName: string; source: string }
type Checkin = { token: string; isOpen: boolean; capacity: number | null }
type VoucherUse = {
    id: string
    userId: string
    usedOn: string | null
    redeemedAt: string
}
type AdjustRow = {
    id: string
    userId: string
    kind: 'point' | 'voucher'
    delta: number
    createdAt: string
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

function adjustText(item: { kind: 'point' | 'voucher'; delta: number }): string {
    const verb = item.delta > 0 ? '贈送' : '扣除'
    const amount = Math.abs(item.delta)
    return item.kind === 'voucher' ? `${verb}免費券 ${amount} 張` : `${verb}點數 ${amount} 點`
}

function gatheringName(g: Gathering): string {
    return g.title ? `${formatDay(g.gatheredOn)} ${g.title}` : formatDay(g.gatheredOn)
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
    const [wizardOpen, setWizardOpen] = useState(false)
    const [gameSearch, setGameSearch] = useState('')
    // 已被「軟移除」的指定遊戲（資料還在，只是標記）；重新加回時用更新
    const [removedGames, setRemovedGames] = useState<Record<string, string[]>>({})
    // 更換：記下要被取代的舊遊戲，下一次加入新遊戲時自動移除它
    const [replacing, setReplacing] = useState<{ gatheringId: string; bggName: string } | null>(null)
    const [gameMessage, setGameMessage] = useState('')
    const [playerSearch, setPlayerSearch] = useState('')
    const [checkins, setCheckins] = useState<Record<string, Checkin>>({})
    const [selfAttendees, setSelfAttendees] = useState<Record<string, string[]>>({})
    const [capacityDraft, setCapacityDraft] = useState('')
    const [detail, setDetail] = useState<Detail | null>(null)
    const [onlyWithPoints, setOnlyWithPoints] = useState(false)
    const [statusSearch, setStatusSearch] = useState('')
    // 所有 VIP 的帳號 id（沒有點數、沒有券的 VIP 也要能搜尋到）
    const [vipIds, setVipIds] = useState<Set<string>>(new Set())
    const [voucherUses, setVoucherUses] = useState<VoucherUse[]>([])
    const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({})
    const [historyOpen, setHistoryOpen] = useState(false)
    const [adjusts, setAdjusts] = useState<AdjustRow[]>([])
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

    const gameNameMap = useMemo(
        () => new Map(allGames.map((game) => [game.bggName, game.name])),
        [allGames],
    )

    async function loadVoucherUses(): Promise<string> {
        const [u, ad] = await Promise.all([
            supabase
                .from('loyalty_redemptions')
                .select('id, user_id, used_on, redeemed_at')
                .order('redeemed_at', { ascending: false })
                .limit(300),
            supabase.rpc('admin_get_adjustments'),
        ])
        if (u.error) return u.error.message
        if (ad.error) return ad.error.message
        setAdjusts(
            (
                (ad.data ?? []) as {
                    id: string
                    user_id: string
                    kind: string
                    delta: number
                    created_at: string
                }[]
            ).map((row) => ({
                id: row.id,
                userId: row.user_id,
                kind: row.kind === 'point' ? 'point' : 'voucher',
                delta: row.delta,
                createdAt: row.created_at,
            })),
        )
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
            supabase.from('gathering_games').select('gathering_id, bgg_name, removed_at'),
            supabase
                .from('board_games')
                .select('bgg_name, name, reference_only')
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
        const removedMap: Record<string, string[]> = {}
        for (const row of (gg.data ?? []) as {
            gathering_id: string
            bgg_name: string
            removed_at: string | null
        }[]) {
            if (row.removed_at) (removedMap[row.gathering_id] ??= []).push(row.bgg_name)
            else (gameMap[row.gathering_id] ??= []).push(row.bgg_name)
        }
        setGatheringGames(gameMap)
        setRemovedGames(removedMap)

        setAllGames(
            ((bg.data ?? []) as {
                bgg_name: string
                name: string
                reference_only: boolean | null
            }[]).map((row) => ({
                bggName: row.bgg_name,
                name: row.name,
                referenceOnly: row.reference_only === true,
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
        const vp = await supabase.from('vip_members').select('user_id')
        if (!vp.error) {
            setVipIds(new Set(((vp.data ?? []) as { user_id: string }[]).map((row) => row.user_id)))
        }
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

    async function deleteGathering(gathering: Gathering) {
        if (
            !(await askConfirm(
                `確定刪除 ${gatheringName(gathering)} 的聚會嗎？這場的參加名單、遊戲清單都會一起刪除，玩家的點數會跟著重新計算。`,
            ))
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
            !(await askConfirm(
                `這場聚會的人數上限是 ${capacity} 人，目前已經滿了。要由你手動加入、超過上限嗎？`,
            ))
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
            !(await askConfirm(
                `目前已有 ${current} 人出席，比新的上限 ${value} 多。已在名單上的人不受影響，但新的人無法再報到。確定嗎？`,
            ))
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
            !(await askConfirm(
                '重設後，舊的報到連結會立刻失效（已經報到的人不受影響）。確定要重設嗎？',
            ))
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
            await showNotice('請長按下面的網址複製，傳給今天來玩的人：\n\n' + link)
        }
    }

    async function addGame(gatheringId: string, bggName: string) {
        setBusy(true)
        setMessage('')
        setGameMessage('')
        const wasRemoved = (removedGames[gatheringId] ?? []).includes(bggName)
        // 已被移除過的遊戲：清掉移除標記就等於加回來（主鍵是 場次＋遊戲，不能再新增一列）
        const { error } = wasRemoved
            ? await supabase
                  .from('gathering_games')
                  .update({ removed_at: null })
                  .eq('gathering_id', gatheringId)
                  .eq('bgg_name', bggName)
            : await supabase
                  .from('gathering_games')
                  .insert({ gathering_id: gatheringId, bgg_name: bggName })

        if (error) {
            setGameMessage('新增遊戲失敗：' + error.message)
        } else {
            setGatheringGames((current) => ({
                ...current,
                [gatheringId]: [...(current[gatheringId] ?? []), bggName],
            }))
            if (wasRemoved) {
                setRemovedGames((current) => ({
                    ...current,
                    [gatheringId]: (current[gatheringId] ?? []).filter((name) => name !== bggName),
                }))
            }
            setGameSearch('')
            const old = replacing && replacing.gatheringId === gatheringId ? replacing.bggName : null
            setReplacing(null)
            if (old && old !== bggName) {
                await softRemoveGame(gatheringId, old, true)
            }
            await refreshOverview()
        }
        setBusy(false)
    }

    // 標記為已移除（不刪資料）：已經因這款得到點數的人，點數保留
    async function softRemoveGame(gatheringId: string, bggName: string, fromReplace = false) {
        const { error } = await supabase
            .from('gathering_games')
            .update({ removed_at: new Date().toISOString() })
            .eq('gathering_id', gatheringId)
            .eq('bgg_name', bggName)

        if (error) {
            setGameMessage('移除遊戲失敗：' + error.message)
            return false
        }
        setGatheringGames((current) => ({
            ...current,
            [gatheringId]: (current[gatheringId] ?? []).filter((item) => item !== bggName),
        }))
        setRemovedGames((current) => ({
            ...current,
            [gatheringId]: [...(current[gatheringId] ?? []), bggName],
        }))
        setGameMessage(
            fromReplace
                ? '已更換指定遊戲。已經得到點數的人點數不受影響，出席的玩家會在集點卡看到通知。'
                : '已移除。已經得到點數的人點數不受影響，出席的玩家會在集點卡看到通知。',
        )
        return true
    }

    async function removeGame(gatheringId: string, bggName: string) {
        setGameMessage('')
        if ((gatheringGames[gatheringId] ?? []).length <= 1 && checkins[gatheringId]) {
            setGameMessage(
                '這一場已經有聚會連結，至少要保留一款遊戲。想換遊戲請按該款旁邊的「更換」，再搜尋選新的。',
            )
            return
        }
        const name = gameNameMap.get(bggName) ?? bggName
        if (
            !(await askConfirm(
                `確定從這一場移除「${name}」嗎？已經因為評分得到點數的人，點數會保留。`,
            ))
        )
            return

        setBusy(true)
        setMessage('')
        const ok = await softRemoveGame(gatheringId, bggName)
        if (ok) await refreshOverview()
        setBusy(false)
    }

    async function showDetail(row: OverviewRow) {
        setBusy(true)
        setMessage('')
        const [d, r, a] = await Promise.all([
            supabase.rpc('admin_get_loyalty_days', { p_user: row.userId }),
            supabase
                .from('loyalty_redemptions')
                .select('id, redeemed_at, used_on')
                .eq('user_id', row.userId)
                .order('redeemed_at', { ascending: false }),
            supabase.rpc('admin_get_auto_sessions', { p_user: row.userId }),
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
                autoSessions: a.error
                    ? null
                    : (
                        (a.data ?? []) as {
                            played_on: string
                            bgg_name: string
                            source: string
                        }[]
                    ).map((item) => ({
                        playedOn: item.played_on,
                        bggName: item.bgg_name,
                        source: item.source,
                    })),
            })
        }
        setBusy(false)
    }

    // 贈送／扣除 券或點數：先問數量，再確認，最後寫入（每次都留紀錄）
    async function adjustLoyalty(
        row: OverviewRow,
        kind: 'point' | 'voucher',
        sign: 1 | -1,
    ) {
        const unit = kind === 'voucher' ? '張免費券' : '點'
        const verb = sign > 0 ? '贈送' : '扣除'
        const input = await askInput(
            `要${verb}幾${unit}${sign > 0 ? '給' : '：'}「${row.nickname}」？（1～50）`,
            { defaultValue: '1', placeholder: '1～50' },
        )
        if (input === null) return
        const qty = Number(input)
        if (!Number.isInteger(qty) || qty < 1 || qty > 50) {
            setMessage('數量請填 1～50 的整數。')
            return
        }
        const now =
            kind === 'voucher'
                ? `目前可用 ${row.availableVouchers} 張`
                : `目前本月 ${row.monthPoints}/2、總 ${row.totalPoints} 點`
        if (
            !(await askConfirm(
                `確定${verb} ${qty} ${unit}嗎？\n玩家：${row.nickname}\n${now}\n（會留下紀錄，之後可以撤銷。）`,
                { confirmText: verb, danger: sign < 0 },
            ))
        )
            return
        setBusy(true)
        setMessage('')
        const { error } = await supabase.rpc('admin_adjust_loyalty', {
            p_user: row.userId,
            p_kind: kind,
            p_delta: sign * qty,
        })
        if (error) {
            setMessage(`${verb}失敗：` + error.message)
        } else {
            setMessage(`已${verb}「${row.nickname}」${qty} ${unit}。`)
            await refreshOverview()
            if (detail?.userId === row.userId) await showDetail(row)
        }
        setBusy(false)
    }

    async function revokeAdjust(item: AdjustRow, nickname: string) {
        if (
            !(await askConfirm(
                `確定撤銷這筆調整嗎？\n玩家：${nickname}\n內容：${adjustText(item)}\n時間：${formatDateTime(item.createdAt)}\n（如果撤銷會讓已使用的券變成不夠，系統會拒絕。）`,
                { confirmText: '撤銷', danger: true },
            ))
        )
            return
        setBusy(true)
        setMessage('')
        const { error } = await supabase.rpc('admin_revoke_adjustment', {
            p_id: item.id,
        })
        if (error) {
            setMessage('撤銷失敗：' + error.message)
        } else {
            setMessage(`已撤銷「${nickname}」的調整（${adjustText(item)}）。`)
            await loadVoucherUses()
            await refreshOverview()
        }
        setBusy(false)
    }

    const selected = gatherings.find((g) => g.id === selectedId) ?? null
    // 明細裡用：這位玩家的調整紀錄（可以撤銷）
    const detailAdjusts = detail ? adjusts.filter((item) => item.userId === detail.userId) : []
    // 尚未結束：今天或未來的聚會；其餘是歷史
    const isOpenGathering = (g: Gathering) => g.gatheredOn >= todayLocal()
    const openList = gatherings
        .filter(isOpenGathering)
        .sort(
            (x, y) =>
                x.gatheredOn.localeCompare(y.gatheredOn) ||
                (x.title ?? '').localeCompare(y.title ?? ''),
        )
    const historyList = gatherings.filter((g) => !isOpenGathering(g))
    const monthKeys = Array.from(
        new Set(historyList.map((g) => g.gatheredOn.slice(0, 7))),
    )
    function statusOf(g: Gathering): string {
        const base = dayStatus(g.gatheredOn)
        if (base === '進行中') return '今天'
        return base
    }
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
    // 已勾選出席的玩家排最前面（其餘維持原順序）
    const matchedPlayers = playerQuery
        ? players.filter(
            (player) =>
                player.nickname.toLocaleLowerCase().includes(playerQuery) ||
                (contacts[player.id] ?? '').toLocaleLowerCase().includes(playerQuery),
        )
        : players
    const visiblePlayers = [...matchedPlayers].sort(
        (x, y) =>
            Number(selectedAttendees.includes(y.id)) - Number(selectedAttendees.includes(x.id)),
    )

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
    // 想玩這款的人：預設收合，點「▾」才列出「暱稱（LINE／FB）」；已選參加者排前面並標 ✓
    const renderWanters = (bggName: string, scope: string) => {
        if (!wantMap) return null
        const people = wantersOf(bggName)
        // 想玩的人沒有暱稱（例如還沒設定暱稱的管理者）時，名單上找不到他
        const unnamed = wantInCommunity(bggName) - people.length
        if (people.length === 0 && unnamed <= 0) return null
        const key = `${scope}:${bggName}`
        const open = !!wantersOpen[key]
        return (
            <span className="lgp-wanters">
                <button
                    type="button"
                    className="lgp-more"
                    aria-expanded={open}
                    onClick={() =>
                        setWantersOpen((current) => ({ ...current, [key]: !open }))
                    }
                >
                    {open ? '▴' : '▾'}
                </button>
                {open && (
                    <small
                        style={{
                            display: 'block',
                            marginTop: 4,
                            color: '#6b5a3c',
                            lineHeight: 1.6,
                        }}
                    >
                        {[
                            ...people.map((p) => {
                                const contact = (contacts[p.id] ?? '').trim()
                                return `${selectedAttendees.includes(p.id) ? '✓ ' : ''}${
                                    p.nickname || '（未設暱稱）'
                                }${contact ? `（${contact}）` : ''}`
                            }),
                            ...(unnamed > 0 ? [`另有 ${unnamed} 人（未設暱稱）`] : []),
                        ].join('、')}
                    </small>
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
                    !game.referenceOnly &&
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

    // 集點狀況：聚會名單裡的人，加上還沒被列入任何聚會的 VIP（點數與券都是 0）
    const overviewIds = new Set(overview.map((row) => row.userId))
    const extraRows: OverviewRow[] = players
        .filter((p) => vipIds.has(p.id) && !overviewIds.has(p.id))
        .map((p) => ({
            userId: p.id,
            nickname: p.nickname,
            totalPoints: 0,
            monthPoints: 0,
            earnedVouchers: 0,
            redeemed: 0,
            availableVouchers: 0,
            overRedeemed: false,
        }))
    const statusQuery = statusSearch.trim().toLowerCase()
    // 有券、有點數的人排最上面
    const rankedOverview = [...overview, ...extraRows]
        .filter(
            (row) =>
                (!onlyWithPoints || row.totalPoints > 0 || row.availableVouchers > 0) &&
                (!statusQuery ||
                    row.nickname.toLowerCase().includes(statusQuery) ||
                    (contacts[row.userId] ?? '').toLowerCase().includes(statusQuery)),
        )
        .sort(
            (x, y) =>
                y.availableVouchers - x.availableVouchers ||
                y.monthPoints - x.monthPoints ||
                y.totalPoints - x.totalPoints ||
                x.nickname.localeCompare(y.nickname, 'zh-Hant'),
        )

    function renderGathering(g: Gathering) {
            const [, month, day] = g.gatheredOn.split('-')
            const status = statusOf(g)
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
{renderWanters(game.bggName, 'search')}
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
                            onClick={() => {
                                setGameMessage('')
                                setReplacing(
                                    replacing?.bggName === bggName
                                        ? null
                                        : { gatheringId: selected.id, bggName },
                                )
                            }}
                        >
                            {replacing?.bggName === bggName ? '取消更換' : '更換'}
                        </button>
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
                    {renderWanters(bggName, 'picked')}
                </li>
            )
        })}
    </ul>
)}
                            {replacing && replacing.gatheringId === selected.id && (
                                <p className="loy-admin-note">
                                    更換中：請在上方搜尋並加入新遊戲，加入後會自動移除「
                                    {gameNameMap.get(replacing.bggName) ?? replacing.bggName}」。
                                </p>
                            )}
                            {gameMessage && <p className="loy-admin-message">{gameMessage}</p>}
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
    }

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
                    {wizardOpen && (
                        <NewGatheringWizard
                            allGames={allGames}
                            players={players}
                            contacts={contacts}
                            wantMap={wantMap}
                            onClose={() => setWizardOpen(false)}
                            onCreated={(id) => {
                                setWizardOpen(false)
                                void loadAll().then(() => setSelectedId(id))
                            }}
                        />
                    )}

                    <section className="lga-section lga-manage">
                        <div className="lga-manage-head">
                            <h3 className="lga-title">聚會管理</h3>
                            <button
                                className="lga-primary lga-add"
                                type="button"
                                onClick={() => setWizardOpen(true)}
                            >
                                ＋ 新增聚會
                            </button>
                        </div>
                        {gatherings.length === 0 ? (
                            <p className="loy-admin-note">還沒有聚會日。</p>
                        ) : (
                            <>
                                <p className="lga-group-label">
                                    尚未結束
                                    <small>{openList.length} 場</small>
                                </p>
                                {openList.length === 0 ? (
                                    <p className="loy-admin-note">目前沒有尚未結束的聚會。</p>
                                ) : (
                                    <ul className="lga-list">{openList.map(renderGathering)}</ul>
                                )}

                                <button
                                    type="button"
                                    className="lga-hist-head"
                                    aria-expanded={historyOpen}
                                    onClick={() => setHistoryOpen((current) => !current)}
                                >
                                    <span>歷史聚會</span>
                                    <small>{historyList.length} 場</small>
                                    <span className="lga-month-arrow" aria-hidden="true">
                                        {historyOpen ? '▴' : '▾'}
                                    </span>
                                </button>
                                {historyOpen &&
                                    (historyList.length === 0 ? (
                                        <p className="loy-admin-note">還沒有已結束的聚會。</p>
                                    ) : (
                                        monthKeys.map((monthKey) => {
                                            const monthItems = historyList.filter((g) =>
                                                g.gatheredOn.startsWith(monthKey),
                                            )
                                            const isOpen =
                                                openMonths[monthKey] ?? monthKey === monthKeys[0]
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
                                                            {monthItems.map(renderGathering)}
                                                        </ul>
                                                    )}
                                                </div>
                                            )
                                        })
                                    ))}
                            </>
                        )}
                    </section>
                </>
            )}

            {tab === 'status' && (
                <>
                    <h3 className="lga-step">
                        <span>★</span>大家的集點狀況（對帳用）
                    </h3>
                    {overview.length + extraRows.length === 0 ? (
                        <p>還沒有任何人被列入聚會名單。</p>
                    ) : (
                        <>
                            <div className="lgs-tools">
                                <input
                                    className="lgs-search"
                                    type="search"
                                    placeholder="搜尋暱稱或 LINE／FB 名字"
                                    value={statusSearch}
                                    onChange={(event) => setStatusSearch(event.target.value)}
                                />
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
                            </div>
                            {rankedOverview.length === 0 ? (
                                <p className="loy-admin-note">找不到符合的玩家。</p>
                            ) : (
                                <ul className="lgs-list">
                                    {rankedOverview.map((row) => {
                                        const empty =
                                            row.totalPoints === 0 && row.availableVouchers === 0
                                        return (
                                            <li
                                                key={row.userId}
                                                className={`lgs-row ${empty ? 'dim' : ''}`}
                                            >
                                                <div className="lgs-main">
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
                                                    <small>
                                                        {contacts[row.userId] ?? '未填聯絡方式'}
                                                    </small>
                                                </div>
                                                <div className="lgs-stats">
                                                    <span>本月 {row.monthPoints}/2</span>
                                                    <span>總 {row.totalPoints} 點</span>
                                                    <span
                                                        className={
                                                            row.availableVouchers > 0 ? 'ticket' : ''
                                                        }
                                                    >
                                                        🎟 {row.availableVouchers}
                                                    </span>
                                                    <span>已用 {row.redeemed}</span>
                                                </div>
                                                <div className="lgs-act">
                                                    <button
                                                        type="button"
                                                        className="admin-link"
                                                        disabled={busy}
                                                        onClick={() =>
                                                            detail?.userId === row.userId
                                                                ? setDetail(null)
                                                                : showDetail(row)
                                                        }
                                                    >
                                                        {detail?.userId === row.userId ? '收起' : '明細'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="admin-link"
                                                        disabled={busy}
                                                        onClick={() => adjustLoyalty(row, 'voucher', 1)}
                                                    >
                                                        贈送券
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="admin-link"
                                                        disabled={busy}
                                                        onClick={() => adjustLoyalty(row, 'voucher', -1)}
                                                    >
                                                        扣除券
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="admin-link"
                                                        disabled={busy}
                                                        onClick={() => adjustLoyalty(row, 'point', 1)}
                                                    >
                                                        贈送點
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="admin-link"
                                                        disabled={busy}
                                                        onClick={() => adjustLoyalty(row, 'point', -1)}
                                                    >
                                                        扣除點
                                                    </button>
                                                </div>
                                                {detail?.userId === row.userId && (
                                                    <div className="lgs-detail">

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
                            <p>管理者調整紀錄（點數／券）：{detailAdjusts.length === 0 ? '無' : ''}</p>
                            {detailAdjusts.length > 0 && (
                                <ul>
                                    {detailAdjusts.map((item) => (
                                        <li key={item.id}>
                                            {formatDateTime(item.createdAt)} {adjustText(item)}
                                            <button
                                                type="button"
                                                className="admin-link"
                                                style={{ marginLeft: 8 }}
                                                disabled={busy}
                                                onClick={() => revokeAdjust(item, detail.nickname)}
                                            >
                                                撤銷
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <p>
                                自動記錄的遊玩：
                                {detail.autoSessions === null
                                    ? '讀取失敗'
                                    : detail.autoSessions.length === 0
                                        ? '無'
                                        : `${detail.autoSessions.length} 筆`}
                            </p>
                            {detail.autoSessions && detail.autoSessions.length > 0 && (
                                <ul>
                                    {detail.autoSessions.map((item) => (
                                        <li key={`${item.playedOn}|${item.bggName}|${item.source}`}>
                                            {formatDay(item.playedOn)}　
                                            {gameNameMap.get(item.bggName) ?? item.bggName}（
                                            {item.source === 'rating'
                                                ? '評分得點'
                                                : item.source === 'admin_gathering'
                                                    ? '管理者聚會'
                                                    : item.source === 'admin_backfill'
                                                        ? '補記'
                                                        : item.source}
                                            ）
                                        </li>
                                    ))}
                                </ul>
                            )}
                                                    </div>
                                                )}
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
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
                        <span>🛠</span>管理者調整紀錄（點數／券）
                    </h3>
                    {adjusts.length === 0 ? (
                        <p className="loy-admin-note">還沒有調整過點數或免費券。</p>
                    ) : (
                        <div className="loy-admin-tablewrap">
                            <table className="loy-admin-table">
                                <thead>
                                    <tr>
                                        <th>玩家</th>
                                        <th>內容</th>
                                        <th>時間</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {adjusts.map((item) => {
                                        const nick =
                                            players.find((p) => p.id === item.userId)?.nickname ??
                                            '（未知）'
                                        return (
                                            <tr key={item.id}>
                                                <td>{nick}</td>
                                                <td>{adjustText(item)}</td>
                                                <td>{formatDateTime(item.createdAt)}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="admin-link"
                                                        disabled={busy}
                                                        onClick={() => revokeAdjust(item, nick)}
                                                    >
                                                        撤銷
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
