import { useEffect, useMemo, useRef, useState } from 'react'
import type { LibraryGame } from '../lib/libraryTypes'
import type { PersonalApi } from '../lib/personalApi'
import type { RatingsApi } from '../lib/useGameRatings'
import type { PlaySessionsApi } from '../lib/useGamePlaySessions'
import { useBackClose } from '../lib/useBackClose'
import {
    LEVEL_LABELS,
    filterCandidates,
    levelIndex,
    pickBatch,
    type PickContext,
    type PickFilters,
    type PickResult,
} from '../lib/todayPick'
import CoverImage from './CoverImage'
import '../styles/today-picker.css'

const PLAYER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8]
const TIME_OPTIONS = [30, 60, 90, 120, 180]

// 一般朋友最熟的三個詞，加一句白話說明（想改字就改這裡）
const CATEGORY_HINTS: Record<string, string> = {
    派對: '熱鬧、規則簡單',
    陣營: '分隊或藏身分互相猜',
    策略: '動腦規劃、玩得比較久',
}
const CATEGORY_OPTIONS = ['派對', '陣營', '策略']

const NO_FILTERS: PickFilters = { players: null, maxTime: null, levels: [], categories: [] }

function describe(f: PickFilters): string {
    const parts: string[] = []
    if (f.players !== null) parts.push(`${f.players} 人`)
    if (f.maxTime !== null) parts.push(`${f.maxTime} 分鐘內`)
    if (f.categories.length > 0) parts.push(f.categories.join('、'))
    if (f.levels.length > 0) parts.push(f.levels.map((i) => LEVEL_LABELS[i]).join('、'))
    return parts.length > 0 ? parts.join('・') : '都可以（不限條件）'
}

function toggle<T>(list: T[], item: T): T[] {
    return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}

export default function TodayPicker({
    isOpen,
    onClose,
    games,
    personal,
    ratings,
    playSessions,
    coverVersions,
    onOpenGame,
}: {
    isOpen: boolean
    onClose: () => void
    games: LibraryGame[]
    personal: PersonalApi
    ratings: RatingsApi
    playSessions: PlaySessionsApi
    coverVersions: Record<string, number>
    onOpenGame: (game: LibraryGame) => void
}) {
    const [filters, setFilters] = useState<PickFilters>(NO_FILTERS)
    const [draft, setDraft] = useState<PickFilters>(NO_FILTERS)
    const [panelOpen, setPanelOpen] = useState(false)
    const [picks, setPicks] = useState<PickResult[]>([])
    const [stopped, setStopped] = useState<boolean[]>([true, true, true])
    const [tick, setTick] = useState(0)
    const [pulled, setPulled] = useState(false)
    const shownRef = useRef<Set<string>>(new Set())
    const timersRef = useRef<number[]>([])

    useBackClose(onClose, isOpen)

    const candidates = useMemo(() => filterCandidates(games, filters), [games, filters])
    const personalize = personal.isLoggedIn && personal.status === 'ready'
    const spinning = stopped.includes(false)

    function clearTimers() {
        timersRef.current.forEach((id) => window.clearTimeout(id))
        timersRef.current = []
    }

    function pull(fresh: boolean) {
        clearTimers()
        if (fresh) shownRef.current = new Set()
        const ctx: PickContext = personalize
            ? {
                personal,
                ratings: ratings.status === 'ready' ? ratings : null,
                playSessions,
                nowMs: Date.now(),
            }
            : null
        const result = pickBatch(candidates, filters, ctx, shownRef.current)
        if (result.wrapped) shownRef.current = new Set()
        for (const pick of result.picks) shownRef.current.add(pick.game.bggName)
        setPicks(result.picks)
        setStopped([false, false, false])
        setPulled(true)
        const ticker = window.setInterval(() => setTick((t) => t + 1), 90)
        timersRef.current.push(ticker)
        timersRef.current.push(window.setTimeout(() => setPulled(false), 450))
            ;[0, 1, 2].forEach((i) => {
                timersRef.current.push(
                    window.setTimeout(
                        () => setStopped((cur) => cur.map((v, k) => (k === i ? true : v))),
                        700 + i * 350,
                    ),
                )
            })
        timersRef.current.push(window.setTimeout(() => window.clearInterval(ticker), 700 + 2 * 350 + 50))
    }

    // 打開視窗就立刻抽一次
    useEffect(() => {
        if (isOpen) {
            setPanelOpen(false)
            pull(true)
        } else {
            clearTimers()
            setStopped([true, true, true])
        }
        return clearTimers
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen])

    // Esc：先收篩選面板，再關視窗；詳細視窗開著時不處理
    useEffect(() => {
        if (!isOpen) return
        function onKey(event: KeyboardEvent) {
            if (event.key !== 'Escape') return
            if (document.querySelector('.modal-backdrop')) return
            if (panelOpen) setPanelOpen(false)
            else onClose()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [isOpen, panelOpen, onClose])

    function openPanel() {
        setDraft(filters)
        setPanelOpen(true)
    }

    function applyPanel() {
        setFilters(draft)
        shownRef.current = new Set()
        setPanelOpen(false)
    }

    if (!isOpen) return null

    const draftCount = filterCandidates(games, draft).length

    return (
        <div className="tp-backdrop" onClick={onClose}>
            <section
                className="tp-sheet"
                role="dialog"
                aria-label="挑三款"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="tp-head">
                    <h2>🎰 挑三款</h2>
                    <button type="button" className="tp-close" aria-label="關閉" onClick={onClose}>
                        ×
                    </button>
                </header>

                <div className="tp-want">
                    <button type="button" className="tp-want-btn" onClick={openPanel}>
                        我想要…
                    </button>
                    <p className="tp-want-text">{describe(filters)}</p>
                </div>

                {panelOpen && (
                    <div className="tp-panel">
                        <div className="tp-row">
                            <label>
                                <span>人數</span>
                                <select
                                    value={draft.players ?? ''}
                                    onChange={(e) =>
                                        setDraft({ ...draft, players: e.target.value === '' ? null : Number(e.target.value) })
                                    }
                                >
                                    <option value="">不限</option>
                                    {PLAYER_OPTIONS.map((n) => (
                                        <option key={n} value={n}>
                                            {n} 人
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                <span>時間</span>
                                <select
                                    value={draft.maxTime ?? ''}
                                    onChange={(e) =>
                                        setDraft({ ...draft, maxTime: e.target.value === '' ? null : Number(e.target.value) })
                                    }
                                >
                                    <option value="">不限</option>
                                    {TIME_OPTIONS.map((n) => (
                                        <option key={n} value={n}>
                                            {n} 分鐘內
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="tp-block" role="group" aria-label="想玩哪一種">
                            <span className="tp-label">想玩哪一種（可複選，不選就是都可以）</span>
                            <div className="tp-cats">
                                {CATEGORY_OPTIONS.map((name) => (
                                    <button
                                        key={name}
                                        type="button"
                                        className={`tp-cat ${draft.categories.includes(name) ? 'active' : ''}`}
                                        aria-pressed={draft.categories.includes(name)}
                                        onClick={() => setDraft({ ...draft, categories: toggle(draft.categories, name) })}
                                    >
                                        <b>{name}</b>
                                        <small>{CATEGORY_HINTS[name]}</small>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="tp-levels" role="group" aria-label="難度">
                            <span className="tp-label">難度</span>
                            {LEVEL_LABELS.map((label, index) => (
                                <button
                                    key={label}
                                    type="button"
                                    className={`tp-chip ${draft.levels.includes(index) ? 'active' : ''}`}
                                    aria-pressed={draft.levels.includes(index)}
                                    onClick={() => setDraft({ ...draft, levels: toggle(draft.levels, index) })}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <p className="tp-count">符合條件的有 {draftCount} 款</p>
                        <button type="button" className="tp-ok" onClick={applyPanel}>
                            OK
                        </button>
                    </div>
                )}

                <div className="tp-machine">
                    <div className="tp-reels">
                        {[0, 1, 2].map((i) => {
                            const shown = stopped[i]
                                ? picks[i]?.game
                                : candidates.length > 0
                                    ? candidates[(tick * 7 + i * 13) % candidates.length]
                                    : undefined
                            const reason = stopped[i] ? picks[i]?.reason : ''
                            return (
                                <div className={`tp-reel ${stopped[i] ? '' : 'spin'}`} key={i}>
                                    <button
                                        type="button"
                                        className="tp-window"
                                        disabled={!stopped[i] || !shown}
                                        onClick={() => shown && onOpenGame(shown)}
                                        aria-label={shown ? shown.name : '空'}
                                    >
                                        {shown ? (
                                            <CoverImage
                                                key={`${shown.coverSlug}-${coverVersions[shown.coverSlug] ?? 0}`}
                                                version={coverVersions[shown.coverSlug] ?? 0}
                                                slug={shown.coverSlug}
                                                alt={shown.name}
                                                className="cover-image"
                                                fallback={<span aria-hidden="true">🎲</span>}
                                            />
                                        ) : (
                                            <span aria-hidden="true">？</span>
                                        )}
                                    </button>
                                    <div className="tp-caption">
                                        {stopped[i] && shown && (
                                            <>
                                                <b>{shown.name}</b>
                                                {(() => {
                                                    const level = levelIndex(shown.bggDifficulty)
                                                    return (
                                                        <small>
                                                            {shown.bggTime != null && `${shown.bggTime} 分`}
                                                            {level !== null && ` · ${LEVEL_LABELS[level]}`}
                                                        </small>
                                                    )
                                                })()}
                                                {reason && <small className="tp-reason">{reason}</small>}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <button
                        type="button"
                        className={`tp-lever ${pulled ? 'pulled' : ''}`}
                        aria-label="拉桿，再挑三款"
                        disabled={spinning || candidates.length === 0}
                        onClick={() => pull(false)}
                    >
                        <span className="tp-rod" />
                        <span className="tp-ball" />
                    </button>
                </div>

                {candidates.length === 0 ? (
                    <p className="tp-empty">沒有符合的遊戲，按「我想要…」放寬一點條件。</p>
                ) : (
                    <></>
                )}
                {!personalize && <p className="tp-tip">登入後會依你的想玩、已玩與評分排序。</p>}
            </section>
        </div>
    )
}