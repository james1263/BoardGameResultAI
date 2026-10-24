import {
    useEffect,
    useState,
    type ChangeEvent,
    type FormEvent,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import {
    parseBoardGamesCsv,
    makeCoverSlug,
    type ParsedGame,
} from './lib/parseCsv'
import { uploadCover } from './lib/uploadCover'
import { useIsAdmin } from './lib/useIsAdmin'

type RemovedGame = {
    bggName: string
    name: string
    coverSlug: string
}

type ImportPreview = {
    fileName: string
    total: number
    newCount: number
    updateCount: number
    newNames: string[]
    removed: RemovedGame[]
    alreadyTrashed: RemovedGame[]
    trashedInCsv: RemovedGame[]
    duplicateNames: string[]
    sample: ParsedGame[]
}

type CoverMatch = {
    matched: { file: File; game: ParsedGame }[]
    ambiguous: { fileName: string; candidates: string[] }[]
    unmatched: string[]
}

function stripParentheses(text: string): string {
    return text.replace(/[(（][^)）]*[)）]/g, ' ')
}

// 依檔名找對應的遊戲：完全相同 → 去掉括號／中文名相同 → 名稱開頭相同
function matchCovers(games: ParsedGame[], files: File[]): CoverMatch {
    const entries = games.map((game) => ({
        game,
        exact: game.coverSlug,
        base: makeCoverSlug(stripParentheses(game.bggName)),
        zh: makeCoverSlug(game.name),
    }))

    const matchedBySlug = new Map<string, { file: File; game: ParsedGame }>()
    const ambiguous: CoverMatch['ambiguous'] = []
    const unmatched: string[] = []

    for (const file of files) {
        const fileSlug = makeCoverSlug(file.name.replace(/\.[^.]+$/, ''))

        if (!fileSlug) {
            unmatched.push(file.name)
            continue
        }

        const tiers = [
            entries.filter((entry) => entry.exact === fileSlug),
            entries.filter(
                (entry) => entry.base === fileSlug || entry.zh === fileSlug,
            ),
            entries.filter((entry) => entry.exact.startsWith(fileSlug + '-')),
        ]
        const candidates = tiers.find((tier) => tier.length > 0)

        if (!candidates) {
            unmatched.push(file.name)
        } else if (candidates.length > 1) {
            ambiguous.push({
                fileName: file.name,
                candidates: candidates.map((entry) => entry.game.name),
            })
        } else {
            matchedBySlug.set(candidates[0].game.coverSlug, {
                file,
                game: candidates[0].game,
            })
        }
    }

    return {
        matched: [...matchedBySlug.values()],
        ambiguous,
        unmatched,
    }
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
    const [coverFiles, setCoverFiles] = useState<File[]>([])
    const isAdmin = useIsAdmin()

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
        setCoverFiles([])
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

        const { matched } = matchCovers(pendingGames, coverFiles)
        const removed = preview.removed

        let confirmText = `確定要匯入 ${preview.total} 款桌遊嗎？\n新增 ${preview.newCount} 款、更新 ${preview.updateCount} 款。\n將上傳 ${matched.length} 張封面。`

        if (removed.length > 0) {
            confirmText +=
                `\n\n🗑️ 有 ${removed.length} 款在資料庫裡、但 CSV 沒有，將移到垃圾桶（資料與封面都保留，可以還原）：\n` +
                removed.map((item) => `・${item.name}（${item.bggName}）`).join('\n')
        }

        if (!window.confirm(confirmText)) return

        if (removed.length > 5) {
            const typed = window.prompt(
                `這次會把 ${removed.length} 款遊戲移到垃圾桶，請輸入「移除」兩個字確認：`,
            )
            if (typed?.trim() !== '移除') return
        }

        setImportError('')
        setImportResult('')
        setIsImporting(true)

        const { error } = await supabase
            .from('board_games')
            .upsert(pendingGames.map(toRow), { onConflict: 'bgg_name' })

        if (error) {
            setIsImporting(false)
            setImportError('匯入失敗：' + error.message)
            return
        }

        const problems: string[] = []

        // 1. 上傳封面
        let uploaded = 0
        const failedFiles: string[] = []
        for (const { file, game } of matched) {
            try {
                await uploadCover(game.coverSlug, file)
                uploaded++
            } catch {
                failedFiles.push(file.name)
            }
        }
        if (failedFiles.length > 0) {
            problems.push(
                `以下封面上傳失敗，請之後在遊戲詳細視窗補上：${failedFiles.join('、')}`,
            )
        }

        // 2. 把 CSV 裡沒有的遊戲移到垃圾桶（不刪資料、不刪封面，之後可還原）
        let trashedGames = 0

        if (removed.length > 0) {
            const { data: trashedRows, error: trashError } = await supabase
                .from('board_games')
                .update({ removed_at: new Date().toISOString() })
                .in(
                    'bgg_name',
                    removed.map((item) => item.bggName),
                )
                .is('removed_at', null)
                .select('bgg_name')

            if (trashError) {
                problems.push('移到垃圾桶失敗：' + trashError.message)
            } else {
                trashedGames = trashedRows?.length ?? 0
                if (trashedGames < removed.length) {
                    problems.push(
                        `有 ${removed.length - trashedGames} 款沒有被移到垃圾桶。`,
                    )
                }
            }
        }

        setIsImporting(false)

        let message = `匯入完成：新增 ${preview.newCount} 款、更新 ${preview.updateCount} 款，上傳封面 ${uploaded} 張。`
        if (removed.length > 0) {
            message += `\n已移到垃圾桶 ${trashedGames} 款遊戲（封面保留，可在頁面最下方的垃圾桶還原）。`
        }
        if (problems.length > 0) {
            message += '\n' + problems.join('\n')
        }
        message += '\n請重新整理網頁查看。'

        setImportResult(message)
        setPreview(null)
        setPendingGames([])
        setCoverFiles([])
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
                .select('bgg_name, name, cover_slug, removed_at')

            if (error) throw new Error('讀取資料庫失敗：' + error.message)

            const existingRows = (data ?? []) as {
                bgg_name: string
                name: string
                cover_slug: string
                removed_at: string | null
            }[]
            const existing = new Set(existingRows.map((row) => row.bgg_name))
            const incoming = new Set(games.map((game) => game.bggName))

            const newGames = games.filter((game) => !existing.has(game.bggName))
            const toRemoved = (row: {
                bgg_name: string
                name: string
                cover_slug: string
            }): RemovedGame => ({
                bggName: row.bgg_name,
                name: row.name,
                coverSlug: row.cover_slug,
            })
            // 資料庫正常、CSV 沒有 → 這次會移到垃圾桶
            const removed = existingRows
                .filter((row) => !incoming.has(row.bgg_name) && !row.removed_at)
                .map(toRemoved)
            // 已在垃圾桶、CSV 也沒有 → 維持原狀
            const alreadyTrashed = existingRows
                .filter((row) => !incoming.has(row.bgg_name) && row.removed_at)
                .map(toRemoved)
            // 已在垃圾桶、但 CSV 有 → 資料更新，但仍留在垃圾桶
            const trashedInCsv = existingRows
                .filter((row) => incoming.has(row.bgg_name) && row.removed_at)
                .map(toRemoved)

            setPendingGames(games)
            setPreview({
                fileName: file.name,
                total: games.length,
                newCount: newGames.length,
                updateCount: games.length - newGames.length,
                newNames: newGames.map((game) => game.name),
                removed,
                alreadyTrashed,
                trashedInCsv,
                duplicateNames,
                sample: games.slice(0, 3),
            })
        } catch (error) {
            setImportError(error instanceof Error ? error.message : '解析失敗')
        } finally {
            setIsParsing(false)
        }
    }

    const coverMatch = matchCovers(pendingGames, coverFiles)

    if (session && !isAdmin) return null
    if (session) {
        return (
            <>
                <span className="admin-status">
                    {isAdmin ? '管理者模式' : '已登入'}
                    {isAdmin && (
                        <button
                            className="admin-link"
                            type="button"
                            onClick={() => setIsImportOpen(true)}
                        >
                            匯入 CSV
                        </button>
                    )}
                    <button className="admin-link" type="button" onClick={handleLogout}>
                        登出
                    </button>
                </span>

                {isAdmin && isImportOpen && (
                    <div className="modal-backdrop" onClick={closeImport}>
                        <div
                            className="admin-modal"
                            style={{ maxHeight: '90vh', overflowY: 'auto' }}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <h2>匯入 CSV（預覽）</h2>

                            <input
                                type="file"
                                accept=".csv,text/csv"
                                onChange={handleFileChange}
                            />

                            {isParsing && <p>解析中…</p>}

                            {importError && (
                                <p className="admin-error" style={{ whiteSpace: 'pre-wrap' }}>
                                    {importError}
                                </p>
                            )}

                            {importResult && (
                                <p style={{ whiteSpace: 'pre-wrap' }}>{importResult}</p>
                            )}

                            {preview && (
                                <div>
                                    <p>檔案：{preview.fileName}</p>
                                    <p>解析出：{preview.total} 款</p>
                                    <p>新增：{preview.newCount} 款</p>
                                    {preview.newNames.length > 0 &&
                                        preview.newNames.length <= 10 && (
                                            <p>新增的遊戲：{preview.newNames.join('、')}</p>
                                        )}
                                    <p>更新：{preview.updateCount} 款</p>

                                    <p>資料庫有、但 CSV 沒有：{preview.removed.length} 款</p>
                                    {preview.removed.length > 0 && (
                                        <>
                                            <p className="admin-error">
                                                按「確認匯入」後，這些遊戲會被移到垃圾桶（資料與封面都保留，可以還原）：
                                            </p>
                                            <ul>
                                                {preview.removed.map((item) => (
                                                    <li key={item.bggName}>
                                                        {item.name}（{item.bggName}）
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                    {preview.trashedInCsv.length > 0 && (
                                        <p>
                                            提醒：CSV 裡有、但目前在垃圾桶的遊戲（資料會更新，仍留在垃圾桶，要放回請到頁面最下方按「還原」）：
                                            {preview.trashedInCsv.map((item) => item.name).join('、')}
                                        </p>
                                    )}
                                    {preview.alreadyTrashed.length > 0 && (
                                        <p>
                                            垃圾桶裡本來就有、CSV 也沒有的遊戲：{preview.alreadyTrashed.length} 款（維持原狀，不會被刪除）。
                                        </p>
                                    )}
                                    {preview.newCount > 0 && preview.removed.length > 0 && (
                                        <p>
                                            提醒：如果是在 Notion 改了 bggName，舊名稱那筆會被移到垃圾桶、
                                            新名稱那筆會當成新遊戲，封面需要重新上傳。
                                        </p>
                                    )}

                                    {preview.duplicateNames.length > 0 && (
                                        <p>
                                            提醒：中文名稱重複：{preview.duplicateNames.join('、')}
                                        </p>
                                    )}

                                    <p>
                                        <strong>
                                            封面圖片（可不選，之後也能在遊戲詳細視窗補上傳）
                                        </strong>
                                    </p>
                                    <ul>
                                        <li>
                                            檔名請用遊戲名稱，英文或中文都可以，例如「Ark
                                            Nova.jpg」或「方舟動物園.jpg」
                                        </li>
                                        <li>
                                            不用寫完整，例如不用加 Second
                                            Edition；如果同時符合多款遊戲，會請你把檔名寫完整
                                        </li>
                                        <li>
                                            對應不到的圖片只留在你的瀏覽器，不會上傳，也不佔雲端空間
                                        </li>
                                    </ul>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(event) =>
                                            setCoverFiles(Array.from(event.target.files ?? []))
                                        }
                                    />

                                    {coverFiles.length > 0 && (
                                        <>
                                            <p>
                                                已選 {coverFiles.length} 張，可對應到遊戲：
                                                {coverMatch.matched.length} 張
                                            </p>
                                            {coverMatch.matched.length > 0 && (
                                                <ul>
                                                    {coverMatch.matched.map(({ file, game }) => (
                                                        <li key={game.bggName}>
                                                            {file.name} → {game.name}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {coverMatch.ambiguous.map((item) => (
                                                <p key={item.fileName}>
                                                    ⚠️ {item.fileName} 符合多款遊戲（會略過，請把檔名寫完整）：
                                                    {item.candidates.join('、')}
                                                </p>
                                            ))}
                                            {coverMatch.unmatched.length > 0 && (
                                                <p>
                                                    找不到對應遊戲（不會上傳）：
                                                    {coverMatch.unmatched.join('、')}
                                                </p>
                                            )}
                                        </>
                                    )}

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