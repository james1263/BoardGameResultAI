import {
    useEffect,
    useState,
    type ChangeEvent,
    type FormEvent,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { parseBoardGamesCsv, type ParsedGame } from './lib/parseCsv'

type ImportPreview = {
    fileName: string
    total: number
    newCount: number
    updateCount: number
    notInCsvCount: number
    duplicateNames: string[]
    sample: ParsedGame[]
}

export default function AdminPanel() {
    const [session, setSession] = useState<Session | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [isImportOpen, setIsImportOpen] = useState(false)
    const [importError, setImportError] = useState('')
    const [isParsing, setIsParsing] = useState(false)
    const [preview, setPreview] = useState<ImportPreview | null>(null)
    const [pendingGames, setPendingGames] = useState<ParsedGame[]>([])
    const [isImporting, setIsImporting] = useState(false)
    const [importResult, setImportResult] = useState('')

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => setSession(data.session))

        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, newSession) => setSession(newSession),
        )

        return () => listener.subscription.unsubscribe()
    }, [])

    async function handleLogin(event: FormEvent) {
        event.preventDefault()
        setErrorMessage('')
        setIsSubmitting(true)

        const { error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        })

        setIsSubmitting(false)

        if (error) {
            setErrorMessage('登入失敗，請檢查 email 與密碼。')
            return
        }

        setPassword('')
        setIsOpen(false)
    }

    async function handleLogout() {
        await supabase.auth.signOut()
    }

    function closeImport() {
        setIsImportOpen(false)
        setImportError('')
        setImportResult('')
        setPreview(null)
        setPendingGames([])
    }

    function toRow(game: ParsedGame) {
        return {
            bgg_name: game.bggName,
            name: game.name,
            cover_slug: game.coverSlug,
            link_bgg: game.links.bgg,
            category: game.category,
            bgg_score: game.bggScore,
            bgg_difficulty: game.bggDifficulty,
            bgg_time: game.bggTime,
            min_players: game.minPlayers,
            max_players: game.maxPlayers,
            best_players: game.bestPlayers,
            recommend_players: game.recommendPlayers,
            ranking_engine: game.rankingEngine,
            classic_game_ranking: game.classicGameRanking,
            score_rank: game.scoreRank,
            player_impact_ranking: game.playerImpactRanking,
            change_ranking: game.changeRanking,
            unique_ranking: game.uniqueRanking,
            communication_ranking: game.communicationRanking,
            like_degree: game.likeDegree,
            change_degree: game.changeDegree,
            communication_degree: game.communicationDegree,
            player_impact_degree: game.playerImpactDegree,
            unique_degree: game.uniqueDegree,
            complexity_degree: game.complexityDegree,
            like_emoji: game.likeEmoji,
            speed_emoji: game.speedEmoji,
            communication_emoji: game.communicationEmoji,
            unique_emoji: game.uniqueEmoji,
            player_impact_emoji: game.playerImpactEmoji,
            complexity_emoji: game.complexityEmoji,
            change_emoji: game.changeEmoji,
        }
    }

    async function handleConfirmImport() {
        if (!preview || pendingGames.length === 0) return

        const ok = window.confirm(
            `確定要匯入 ${preview.total} 款桌遊嗎？\n新增 ${preview.newCount} 款、更新 ${preview.updateCount} 款（不會刪除任何遊戲）。`,
        )
        if (!ok) return

        setImportError('')
        setImportResult('')
        setIsImporting(true)

        const { error } = await supabase
            .from('board_games')
            .upsert(pendingGames.map(toRow), { onConflict: 'bgg_name' })

        setIsImporting(false)

        if (error) {
            setImportError('匯入失敗：' + error.message)
            return
        }

        setImportResult(
            `匯入完成：新增 ${preview.newCount} 款、更新 ${preview.updateCount} 款。請重新整理網頁查看。`,
        )
        setPreview(null)
        setPendingGames([])
    }

    async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file) return

        setImportError('')
        setImportResult('')
        setPreview(null)
        setPendingGames([])
        setIsParsing(true)

        try {
            const text = await file.text()
            const { games, duplicateNames } = parseBoardGamesCsv(text)

            const { data, error } = await supabase
                .from('board_games')
                .select('bgg_name')

            if (error) throw new Error('讀取資料庫失敗：' + error.message)

            const existing = new Set((data ?? []).map((r) => r.bgg_name as string))
            const incoming = new Set(games.map((g) => g.bggName))

            const updateCount = games.filter((g) => existing.has(g.bggName)).length
            const notInCsvCount = [...existing].filter((n) => !incoming.has(n)).length

            setPendingGames(games)
            setPreview({
                fileName: file.name,
                total: games.length,
                newCount: games.length - updateCount,
                updateCount,
                notInCsvCount,
                duplicateNames,
                sample: games.slice(0, 3),
            })
        } catch (error) {
            setImportError(error instanceof Error ? error.message : '解析失敗')
        } finally {
            setIsParsing(false)
        }
    }

    if (session) {
        return (
            <>
                <span className="admin-status">
                    管理者模式
                    <button
                        className="admin-link"
                        type="button"
                        onClick={() => setIsImportOpen(true)}
                    >
                        匯入 CSV
                    </button>
                    <button className="admin-link" type="button" onClick={handleLogout}>
                        登出
                    </button>
                </span>

                {isImportOpen && (
                    <div className="modal-backdrop" onClick={closeImport}>
                        <div
                            className="admin-modal"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <h2>匯入 CSV（預覽）</h2>

                            <input
                                type="file"
                                accept=".csv,text/csv"
                                onChange={handleFileChange}
                            />

                            {isParsing && <p>解析中…</p>}
                            {importResult && <p>{importResult}</p>}

                            {importError && (
                                <p className="admin-error" style={{ whiteSpace: 'pre-wrap' }}>
                                    {importError}
                                </p>
                            )}

                            {preview && (
                                <div>
                                    <p>檔案：{preview.fileName}</p>
                                    <p>解析出：{preview.total} 款</p>
                                    <p>新增：{preview.newCount} 款</p>
                                    <p>更新：{preview.updateCount} 款</p>
                                    <p>
                                        資料庫有、但 CSV 沒有：{preview.notInCsvCount} 款（不會刪除）
                                    </p>
                                    {preview.duplicateNames.length > 0 && (
                                        <p>
                                            提醒：中文名稱重複：{preview.duplicateNames.join('、')}
                                        </p>
                                    )}
                                    <p>前 3 款檢查：</p>
                                    <ul>
                                        {preview.sample.map((game) => (
                                            <li key={game.bggName}>
                                                {game.name}｜{game.bggName}｜喜歡度：
                                                {game.likeEmoji || '未提供'}｜快速性：
                                                {game.speedEmoji || '未提供'}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        className="rule-button"
                                        type="button"
                                        onClick={handleConfirmImport}
                                        disabled={isImporting}
                                    >
                                        {isImporting ? '匯入中…' : '確認匯入'}
                                    </button>
                                </div>
                            )}

                            <button
                                className="admin-cancel"
                                type="button"
                                onClick={closeImport}
                            >
                                關閉
                            </button>
                        </div>
                    </div>
                )}
            </>
        )
    }

    return (
        <>
            <button
                className="admin-link"
                type="button"
                onClick={() => setIsOpen(true)}
            >
                管理者登入
            </button>

            {isOpen && (
                <div className="modal-backdrop" onClick={() => setIsOpen(false)}>
                    <form
                        className="admin-modal"
                        onClick={(event) => event.stopPropagation()}
                        onSubmit={handleLogin}
                    >
                        <h2>管理者登入</h2>

                        <label className="admin-field">
                            <span>Email</span>
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                autoComplete="username"
                                required
                            />
                        </label>

                        <label className="admin-field">
                            <span>密碼</span>
                            <input
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                autoComplete="current-password"
                                required
                            />
                        </label>

                        {errorMessage && <p className="admin-error">{errorMessage}</p>}

                        <button
                            className="rule-button"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? '登入中…' : '登入'}
                        </button>
                        <button
                            className="admin-cancel"
                            type="button"
                            onClick={() => setIsOpen(false)}
                        >
                            取消
                        </button>
                    </form>
                </div>
            )}
        </>
    )
}