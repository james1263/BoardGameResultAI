import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
    getRulebookRemaining,
    searchRulebook,
    type RulebookChunk,
} from '../lib/useRulebookSearch'
import { suggestKeywords } from '../lib/zhEnGlossary'
import InfoHint from './InfoHint'
import { errataTag, searchErrata, type Errata } from '../lib/useGameErrata'
import { cleanOcrText } from '../lib/cleanOcrText'
import { useHotKeywords } from '../lib/useRuleSearchStats'
import { useBackClose } from '../lib/useBackClose'
import { toSimplified } from '../lib/toSimplified'
import { expandSynonyms } from '../lib/zhSynonyms'
import { faqSubtitle, searchFaq, type FaqHit } from '../lib/faqSearch'
import '../styles/errata.css'
import '../styles/ra-compact.css'
import { supabase } from '../lib/supabase'
import AiFeedbackBox from './AiFeedbackBox'
import {
    buildAnswerPrompt,
    chunkScope,
    copyText,
    langTag,
    loadFeedbackCtx,
    saveFeedbackCtx,
    type FeedbackCtx,
} from '../lib/aiAnswer'

type ScopedChunk = RulebookChunk & { doc_scope?: string; doc_expansion?: string }

// 網址編碼後太長，部分瀏覽器可能開不起來，超過就請使用者改用「複製片段」
const TRANSLATE_URL_LIMIT = 1800

function buildTranslateUrl(text: string): string {
    return `https://translate.google.com/?sl=auto&tl=zh-TW&op=translate&text=${encodeURIComponent(text)}`
}

// 中文問句裡的問句用語，搜尋前先拿掉；單字虛字（的、不、被…）交給資料庫處理，避免把詞庫詞切碎
const ZH_STOP = /請問|可不可以|可以|是不是|有沒有|什麼|甚麼|怎麼|如何|為什麼|還是|或者|的話|嗎|呢|吧/g

function prepareQuery(text: string): string {
    return text.replace(ZH_STOP, ' ').replace(/[?？!！。，,、；;：:]/g, ' ').replace(/\s+/g, ' ').trim()
}

// 中文關鍵字：把問句用語拿掉、依「的、是、了、在、和、跟、或」切開，留下 2～8 字的詞
const ZH_CHIP_STOP = /請問|可不可以|可以|是不是|有沒有|什麼|甚麼|怎麼|如何|為什麼|還是|或者|的話|嗎|呢|吧/g
function zhChipsFor(q: string): string[] {
    const out: string[] = []
    for (const seg of q.replace(ZH_CHIP_STOP, ' ').split(/[的了是在和跟或]|[^\u4e00-\u9fff]+/)) {
        const t = seg.trim()
        if (t.length >= 2 && t.length <= 8 && !out.includes(t)) out.push(t)
    }
    return out.slice(0, 5)
}

// 結果顯示順序：中文規則書優先 → FAQ → 擴充 → 主遊戲 → 玩家整理；同組內維持原本（分數）順序
const SCOPE_ORDER: Record<string, number> = { faq: 0, expansion: 1, main: 2, player_notes: 3 }
function zhFirst<T extends { doc_lang?: string; doc_scope?: string }>(items: T[]): T[] {
    return items
        .map((c, i) => ({ c, i }))
        .sort(
            (a, b) =>
                Number(b.c.doc_lang === 'zh') - Number(a.c.doc_lang === 'zh') ||
                (SCOPE_ORDER[a.c.doc_scope ?? 'main'] ?? 2) - (SCOPE_ORDER[b.c.doc_scope ?? 'main'] ?? 2) ||
                a.i - b.i,
        )
        .map(({ c }) => c)
}

// 英文 OCR 亂碼過濾（只用在顯示；複製與提示詞仍用原文）
const COMMON_SHORT = new Set([
    'a', 'i', 'an', 'as', 'at', 'be', 'by', 'do', 'go', 'if', 'in', 'is', 'it', 'me', 'my', 'no', 'of',
    'on', 'or', 'so', 'to', 'up', 'us', 'we', 'vs', 'and', 'any', 'are', 'can', 'did', 'for', 'get',
    'has', 'her', 'him', 'his', 'how', 'its', 'may', 'not', 'one', 'our', 'out', 'per', 'the', 'too',
    'two', 'use', 'was', 'who', 'why', 'you', 'all', 'add', 'buy', 'pay', 'run', 'set', 'she', 'sun',
    'tap', 'win', 'yes', 'war', 'new', 'old', 'off', 'own', 'put', 'see', 'top', 'ten', 'six', 'end',
    'tie', 'via', 'nor', 'yet', 'but', 'few', 'let', 'die', 'act', 'try', 'way', 'now', 'map', 'bid',
    'day', 'key', 'box', 'age', 'ask', 'big', 'low', 'far', 'due', 'row', 'tab', 'ally', 'vp',
])
const CAPS_OK = new Set(['VP', 'OR', 'IF', 'TO', 'OF', 'IN', 'ON', 'NO', 'US', 'AI', 'AT', 'BY', 'IS', 'IT', 'AS', 'AN'])
const BULLETS = new Set(['¢', '«', '»', '+', '*', '•', '·', '■', '□', '●', '○'])

function isPlausibleWord(tok: string): boolean {
    const w = tok.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, '')
    if (!w) return false
    if (/\d/.test(w)) return true
    if (/^[QA]$/.test(w) && /[.:]$/.test(tok)) return true
    if (w.length >= 4 && /^[A-Za-z'’-]+$/.test(w)) return /[aeiouyAEIOUY]/.test(w)
    if (COMMON_SHORT.has(w.toLowerCase())) return true
    if (/^[A-Z][a-z]{1,2}$/.test(w)) return true
    if (/^[A-Z]{3,4}$/.test(w)) return true
    return CAPS_OK.has(w)
}

function cleanEnglishOcr(text: string): string {
    const base = text
        .replace(/[\uE000-\uF8FF\uFFFD@§©®™€£¥]/g, ' ')
    const out: string[] = []
    for (const rawLine of base.split('\n')) {
        let toks = rawLine.split(/\s+/).filter((t) => t.length > 0)
        // 項目符號、孤立符號、孤立單字母
        const mapped: string[] = []
        toks.forEach((t, idx) => {
            if (t === '|') {
                mapped.push('I')
            } else if (BULLETS.has(t)) {
                if (mapped.length === 0 && idx === 0) mapped.push('•')
            } else if (!/[A-Za-z0-9]/.test(t)) {
                if (/^[-—–&/]$/.test(t)) mapped.push(t)
            } else if (/^[A-Za-z]$/.test(t) && !/^[aAI]$/.test(t)) {
                // 孤立單字母（圖示被讀成字）
            } else {
                mapped.push(t)
            }
        })
        toks = mapped
        const words = toks.filter((t) => /[A-Za-z0-9]/.test(t))
        if (words.length === 0) continue
        const alnum = words.join('').replace(/[^A-Za-z0-9]/g, '')
        if (alnum.length <= 2 || /^\d+$/.test(alnum)) continue
        // 短的全大寫標題列（例如 SEASONAL INCOME）前後混入的小寫雜字
        const capsCount = words.filter((w) => /^[A-Z]{4,}[:.]?$/.test(w)).length
        if (words.length <= 6 && capsCount >= 2) {
            toks = toks.filter((x) => !/^[a-z]/.test(x) || COMMON_SHORT.has(x.toLowerCase().replace(/[^a-z]/g, '')))
        }
        const good = words.filter(isPlausibleWord).length
        const ratio = good / words.length
        if (words.length >= 3 && ratio < 0.5) continue
        if (words.length >= 2 && ratio < 0.75) {
            toks = toks.filter((t) => !/[A-Za-z0-9]/.test(t) || isPlausibleWord(t))
        }
        const line = toks.join(' ').trim()
        if (line) out.push(line)
    }
    return out.join('\n')
}

function cleanFor(lang: string, text: string): string {
    if (lang === 'zh') return cleanOcrText(text)
    if (lang === 'en') return cleanEnglishOcr(text)
    return text
}

const FONT_KEY = 'boardgame-ra-font'
type FontSize = 'normal' | 'large' | 'xl'
const FONT_PX: Record<FontSize, number> = { normal: 16, large: 18, xl: 21 }
const FONT_LABEL: Record<FontSize, string> = { normal: 'A 標準', large: 'A 大', xl: 'A 特大' }

function loadFont(): FontSize {
    try {
        const v = localStorage.getItem(FONT_KEY)
        if (v === 'normal' || v === 'large' || v === 'xl') return v
    } catch {
        /* ignore */
    }
    return 'normal'
}

// 從搜尋內容抽出要標黃底、並用來挑重點句的詞
function buildTerms(q: string, extra: string[]): string[] {
    const set = new Set<string>()
    for (const w of `${q} ${extra.join(' ')}`.split(/[^A-Za-z0-9\u00C0-\u024F]+/)) {
        if (w.length >= 3) set.add(w.toLowerCase())
    }
    for (const run of q.match(/[\u4e00-\u9fff]+/g) ?? []) {
        if (run.length <= 3) {
            if (run.length >= 2 && !/^[的了是會能有在和跟或要我你他這那個被把就都也不]+$/.test(run)) set.add(run)
        } else {
            for (let i = 0; i < run.length - 1; i++) {
                const two = run.slice(i, i + 2)
                if (!/[的了嗎呢吧]/.test(two)) set.add(two)
            }
        }
    }
    return Array.from(set)
}

function escapeRegex(t: string): string {
    return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function highlight(text: string, terms: string[]): ReactNode {
    if (terms.length === 0) return text
    const sorted = [...terms].sort((a, b) => b.length - a.length)
    const re = new RegExp(`(${sorted.map(escapeRegex).join('|')})`, 'gi')
    return text.split(re).map((part, i) =>
        i % 2 === 1 ? (
            <mark key={i} className="ra-mark">
                {part}
            </mark>
        ) : (
            <Fragment key={i}>{part}</Fragment>
        ),
    )
}

function clampSentence(s: string, terms: string[]): string {
    if (s.length <= 240) return s
    const lower = s.toLowerCase()
    let idx = -1
    for (const t of terms) {
        const p = lower.indexOf(t)
        if (p >= 0 && (idx < 0 || p < idx)) idx = p
    }
    const start = Math.max(0, (idx < 0 ? 0 : idx) - 80)
    return `${start > 0 ? '…' : ''}${s.slice(start, start + 240)}…`
}

// 挑出命中詞最多的 2 句（不是 AI 摘要，只是依命中詞挑句子）
function pickSnippet(text: string, terms: string[]): { text: string; partial: boolean } {
    const sentences = (text.match(/[^.!?。！？\n]+[.!?。！？]*/g) ?? [])
        .map((x) => x.trim())
        .filter((x) => x.length > 0)
    if (sentences.length <= 2 || text.length < 160) return { text, partial: false }
    const scored = sentences.map((x, i) => {
        const lower = x.toLowerCase()
        const compact = lower.replace(/\s+/g, '')
        let n = 0
        for (const t of terms) if (lower.includes(t) || compact.includes(t)) n++
        return { i, n }
    })
    const max = Math.max(...scored.map((x) => x.n))
    let chosen: number[] =
        max === 0
            ? [0, 1]
            : [...scored]
                .filter((x) => x.n > 0)
                .sort((a, b) => b.n - a.n || a.i - b.i)
                .slice(0, 2)
                .map((x) => x.i)
    // 問題（Q:）要連同它的答案（A:）一起顯示
    for (const i of [...chosen]) {
        if (/^Q[.:]/.test(sentences[i]) && i + 1 < sentences.length && /^A[.:]/.test(sentences[i + 1])) {
            chosen.push(i + 1)
        }
    }
    chosen = Array.from(new Set(chosen)).sort((a, b) => a - b)
    return { text: chosen.map((i) => clampSentence(sentences[i], terms)).join('\n'), partial: true }
}

export default function RulebookAssistant({
    bggName,
    gameName,
}: {
    bggName: string
    gameName: string
    onGoSubmit?: () => void
}) {
    const [query, setQuery] = useState('')
    const [chunks, setChunks] = useState<RulebookChunk[] | null>(null)
    const [activeLabel, setActiveLabel] = useState('')
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')
    const [lastQuery, setLastQuery] = useState('')
    const [errata, setErrata] = useState<Errata[]>([])
    const [faqHits, setFaqHits] = useState<FaqHit[]>([])
    const [showRaw, setShowRaw] = useState(false)
    const [fontSize, setFontSize] = useState<FontSize>(loadFont)
    const [searchTerms, setSearchTerms] = useState<string[]>([])
    const [openSet, setOpenSet] = useState<Set<string>>(new Set())
    const [remaining, setRemaining] = useState<number | null | undefined>(undefined)
    const cache = useRef<Map<string, RulebookChunk[]>>(new Map())
    const hot = useHotKeywords(bggName, true)
    const [fullQuery, setFullQuery] = useState('')
    const [fb, setFb] = useState<FeedbackCtx | null>(() => loadFeedbackCtx(bggName))
    const [fbShown, setFbShown] = useState(false)
    const [langFilter, setLangFilter] = useState<'all' | 'zh' | 'en'>('all')
    const [drawerOpen, setDrawerOpen] = useState(false)
    const zhChips = useMemo(() => {
        const chips = zhChipsFor(fullQuery)
        return chips.length === 1 && chips[0] === fullQuery ? [] : chips
    }, [fullQuery])
    useBackClose(() => setDrawerOpen(false), drawerOpen)

    useEffect(() => {
        let cancelled = false
        getRulebookRemaining().then((value) => {
            if (!cancelled) setRemaining(value)
        })
        return () => {
            cancelled = true
        }
    }, [])

    // 輸入內容的英文關鍵字建議（來自內建對照表）
    const suggestions = useMemo(() => suggestKeywords(query), [query])

    // 搜尋框下方的英文詞建議：點一下加入／移除搜尋框內容，不會自動搜尋、不扣次數
    const findWord = (text: string, word: string) => {
        const tokens = text.split(/\s+/).filter(Boolean)
        const target = word.toLowerCase().split(/\s+/).filter(Boolean)
        if (target.length === 0) return { tokens, at: -1, len: 0 }
        for (let i = 0; i + target.length <= tokens.length; i++) {
            if (target.every((t, k) => tokens[i + k].toLowerCase() === t)) {
                return { tokens, at: i, len: target.length }
            }
        }
        return { tokens, at: -1, len: target.length }
    }

    useEffect(() => {
        setOpenSet(new Set())
    }, [chunks])

    function changeFont(size: FontSize) {
        setFontSize(size)
        try {
            localStorage.setItem(FONT_KEY, size)
        } catch {
            /* ignore */
        }
    }

    async function loadErrata(q: string) {
        const result = await searchErrata(bggName, q)
        setErrata(result.items)
    }

    // 玩家點了英文詞 chip 並搜尋到結果：只匿名回報「中文詞＋英文詞」，失敗不影響搜尋
    async function reportPicks(rawQuery: string) {
        try {
            const zhWords = zhChipsFor(rawQuery)
            const enWords = suggestions.filter((w) => findWord(rawQuery, w).at >= 0)
            if (zhWords.length === 0 || enWords.length === 0) return
            const pairs: { zh: string; en: string }[] = []
            for (const en of enWords) {
                for (const zh of zhWords) {
                    if (suggestKeywords(zh).includes(en)) pairs.push({ zh, en })
                }
            }
            for (const p of pairs.slice(0, 5)) {
                await supabase.rpc('report_term_pick', {
                    p_bgg_name: bggName,
                    p_zh: p.zh,
                    p_en: p.en,
                })
            }
        } catch {
            /* ignore */
        }
    }
    async function run(rawQuery: string, label: string) {
        setError('')
        setNotice('')
        setFbShown(false)
        setLangFilter('all')
        const q = prepareQuery(rawQuery)
        if (!q) {
            setError('請先輸入要查的內容。')
            return
        }
        // 繁體問句同時轉成簡體一起查（找簡體規則書）；轉換失敗就只查原問句
        const extra = label === '全部輸入內容' ? expandSynonyms(q, bggName) : []
        const withSyn = extra.length > 0 ? `${q} ${extra.join(' ')}` : q
        const simp = await toSimplified(withSyn)
        const alt = simp !== q ? simp : undefined
        setActiveLabel(label)
        setSearchTerms(buildTerms(alt ? `${withSyn} ${alt}` : withSyn, label === '全部輸入內容' ? suggestions : []))
        // 官方 FAQ 中文翻譯：前端直接比對，不扣次數
        setFaqHits(searchFaq(bggName, buildTerms(withSyn, [])))
        if (label === '全部輸入內容') setFullQuery(q)
        const key = q.toLowerCase()
        const cached = cache.current.get(key)
        if (cached) {
            setChunks(zhFirst(cached))
            void loadErrata(q)
            if (cached.length === 0) setNotice('沒有找到相關段落。')
            return
        }
        setBusy(true)
        const result = await searchRulebook(bggName, q, alt)
        setBusy(false)
        if (result.error) {
            setError(result.error)
            return
        }
        cache.current.set(key, result.chunks)
        void loadErrata(q)
        setChunks(zhFirst(result.chunks))
        if (label === '全部輸入內容' && result.chunks.length > 0) {
            void reportPicks(rawQuery)
        }
        if (
            /擴充|擴展|擴/.test(rawQuery) &&
            !result.chunks.some((c) => (c as ScopedChunk).doc_scope === 'expansion')
        ) {
            setNotice('你的問題可能屬於擴充規則，但目前沒有收錄這款的擴充規則書，下面的結果都來自其他範圍，請不要當成擴充規則。')
        }
        if (result.chunks.length === 0) {
            setNotice(
                suggestions.length > 0
                    ? '沒有找到相關段落，換個說法，或到「縮小搜尋範圍」點英文關鍵字試試（這次不會扣次數）。'
                    : '沒有找到相關段落，換個說法試試；中文詞找不到時，請直接輸入英文關鍵字（這次不會扣次數）。',
            )
        }
        getRulebookRemaining().then(setRemaining)
    }

    function handleSearch() {
        void run(query, '全部輸入內容')
    }

    function handleChip(word: string) {
        void run(word, word)
    }

    async function copyChunk(c: RulebookChunk) {
        setError('')
        const text = `遊戲：${gameName}\n來源：${c.doc_title || '規則書'}【${chunkScope(c)}】${c.page_number ? `，第 ${c.page_number} 頁` : ''}\n\n${c.content}`
        setNotice(
            (await copyText(text))
                ? '已複製這段規則片段（含遊戲名稱、書名與頁碼）。'
                : '複製失敗，請手動選取文字複製。',
        )
    }

    async function copyAnswerPrompt() {
        if (!chunks || chunks.length === 0) return
        const { text, ctx } = buildAnswerPrompt({ gameName, question: query, chunks, errata })
        setError('')
        const copied = await copyText(text)
        if (copied) {
            saveFeedbackCtx(bggName, ctx)
            setFb(ctx)
            setFbShown(true)
        }
        setNotice(
            copied
                ? '已複製。注意：內容會被送到你自己選的外部 AI 服務，不會留在本站。' +
                'AI 回答得不錯的話，把它最後的回饋區塊貼到下方「AI 回饋投稿」，就能分享給大家。'
                : '複製失敗，請手動複製。',
        )
    }

    const allChunks = chunks ?? []
    const hasChunks = allChunks.length > 0
    const visible = allChunks
        .map((c, i) => ({ c, i }))
        .filter(({ c }) => langFilter === 'all' || c.doc_lang === langFilter)
    const zhCount = allChunks.filter((c) => c.doc_lang === 'zh').length
    const enCount = allChunks.filter((c) => c.doc_lang === 'en').length
    const hasZhVisible = visible.some(({ c }) => c.doc_lang === 'zh')
    const keyOf = (c: RulebookChunk, i: number) => `${c.doc_id}-${c.page_number}-${i}`
    const visibleKeys = visible.map(({ c, i }) => keyOf(c, i))
    const allOpen = visibleKeys.length > 0 && visibleKeys.every((k) => openSet.has(k))
    const canNarrow = activeLabel !== ''

    function pickChip(word: string) {
        setDrawerOpen(false)
        handleChip(word)
    }

    const drawer =
        drawerOpen && typeof document !== 'undefined'
            ? createPortal(
                <div className="ra2-backdrop" onClick={() => setDrawerOpen(false)}>
                    <div
                        className="ra2-sheet"
                        role="dialog"
                        aria-label="縮小搜尋範圍"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="ra2-sheet-head">
                            <strong>縮小搜尋範圍</strong>
                            <button
                                type="button"
                                className="ra2-x"
                                aria-label="關閉"
                                onClick={() => setDrawerOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="ra2-sec">
                            <div className="ra2-sec-title">結果語言（只是篩選畫面，不扣次數）</div>
                            <div className="ra-chips">
                                {(
                                    [
                                        ['all', `全部（${allChunks.length}）`],
                                        ['zh', `中文（${zhCount}）`],
                                        ['en', `英文（${enCount}）`],
                                    ] as const
                                ).map(([key, label]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        className="ra-chip"
                                        aria-pressed={langFilter === key}
                                        onClick={() => setLangFilter(key)}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="ra2-sec">
                            <div className="ra2-sec-title">
                                只搜某個關鍵字（會重新搜尋，找到結果才扣次數）
                            </div>
                            <div className="ra-chips">
                                <button
                                    type="button"
                                    className="ra-chip"
                                    disabled={busy}
                                    aria-pressed={activeLabel === '全部輸入內容'}
                                    onClick={() => {
                                        setDrawerOpen(false)
                                        handleSearch()
                                    }}
                                >
                                    整句（預設）
                                </button>
                                {zhChips.map((word) => (
                                    <button
                                        key={`zh-${word}`}
                                        type="button"
                                        className="ra-chip"
                                        disabled={busy}
                                        aria-pressed={activeLabel === word}
                                        onClick={() => pickChip(word)}
                                    >
                                        {word}
                                    </button>
                                ))}
                                {suggestions.map((word) => (
                                    <button
                                        key={`en-${word}`}
                                        type="button"
                                        className="ra-chip"
                                        disabled={busy}
                                        aria-pressed={activeLabel === word}
                                        onClick={() => pickChip(word)}
                                    >
                                        {word}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <details className="ra2-sec ra2-set">
                            <summary>⚙ 顯示設定</summary>
                            {allChunks.some((c) => cleanFor(c.doc_lang, c.content) !== c.content) && (
                                <button
                                    className="ra-btn ra-btn-small"
                                    type="button"
                                    aria-pressed={showRaw}
                                    onClick={() => setShowRaw((v) => !v)}
                                >
                                    {showRaw ? '隱藏亂碼（顯示整理後文字）' : '顯示原始 OCR 文字'}
                                </button>
                            )}
                            <div className="ra2-set-row">
                                <span className="ra2-set-label">字體</span>
                                {(['normal', 'large', 'xl'] as FontSize[]).map((size) => (
                                    <button
                                        key={size}
                                        type="button"
                                        className="ra-btn ra-btn-small"
                                        aria-pressed={fontSize === size}
                                        onClick={() => changeFont(size)}
                                    >
                                        {FONT_LABEL[size]}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    className="ra-btn ra-btn-small"
                                    onClick={() => setOpenSet(allOpen ? new Set() : new Set(visibleKeys))}
                                >
                                    {allOpen ? '全部收合' : '全部展開'}
                                </button>
                            </div>
                        </details>
                    </div>
                </div>,
                document.body,
            )
            : null

    return (
        <div className="ra ra2">
            <div className="ra2-label">
                搜尋規則書
                <InfoHint text="可輸入中文或英文。中文會比對中文規則書，英文比對英文規則書；中文問題若有內建對照的英文詞，可在「縮小搜尋範圍」裡點一下只搜它。這是規則書段落檢索，不是 AI 回答。" />
            </div>
            <div className="ra2-row">
                <input
                    className="ra2-input"
                    type="text"
                    value={query}
                    maxLength={200}
                    onChange={(event) => setQuery(event.target.value)}
                    onBlur={() => {
                        const now = query.trim()
                        if (now !== lastQuery) {
                            setLastQuery(now)
                            setChunks(null)
                            setErrata([])
                            setFaqHits([])
                            setActiveLabel('')
                            setFbShown(false)
                            setLangFilter('all')
                            setNotice('')
                            setError('')
                        }
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') handleSearch()
                    }}
                    placeholder="例如：行動、結算、計分"
                />
                <button className="ra2-go" type="button" disabled={busy} onClick={handleSearch}>
                    {busy ? '搜尋中…' : '搜尋'}
                </button>
            </div>

            {activeLabel === '' && remaining !== undefined && remaining !== null && (
                <p className="ra2-small">今天還剩 {remaining} 次（找到結果才扣）</p>
            )}

            {chunks === null && activeLabel === '' && !busy && hot.loaded && (
                <div className="ra-hot">
                    <p className="ra-hot-title">大家最近常查</p>
                    <p className="ra-hot-sub">最近 30 天，點一下直接搜尋</p>
                    {hot.items.length === 0 ? (
                        <p className="ra-hot-empty">這款還沒有人搜尋過。</p>
                    ) : (
                        <ol className="ra-hot-list">
                            {hot.items.map((item, index) => (
                                <li key={item.keyword}>
                                    <button
                                        type="button"
                                        className="admin-link ra-hot-item"
                                        onClick={() => {
                                            setQuery(item.keyword)
                                            setLastQuery(item.keyword)
                                            void run(item.keyword, '全部輸入內容')
                                        }}
                                    >
                                        <span className="ra-hot-rank">{index + 1}</span>
                                        <span className="ra-hot-kw">{item.keyword}</span>
                                        <span className="ra-hot-count">{item.count} 次</span>
                                    </button>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            )}

            {canNarrow && (
                <div className="ra2-status">
                    <span>
                        {chunks === null
                            ? '搜尋中…'
                            : langFilter === 'all'
                                ? `找到 ${allChunks.length} 段`
                                : `顯示 ${visible.length} / ${allChunks.length} 段`}
                        {remaining !== undefined && remaining !== null ? `・今天剩 ${remaining} 次` : ''}
                    </span>
                    <span className="ra2-tools">
                        <button type="button" className="ra2-pill" onClick={() => setDrawerOpen(true)}>
                            縮小搜尋範圍 ▾
                        </button>
                        {hasChunks && (
                            <button type="button" className="ra2-pill" onClick={copyAnswerPrompt}>
                                複製給我的 AI
                            </button>
                        )}
                    </span>
                </div>
            )}

            {error && <p className="ra-error">{error}</p>}
            {notice && <p className="ra-notice">{notice}</p>}

            {fb && fbShown && (
                <AiFeedbackBox
                    key={fb.code}
                    bggName={bggName}
                    ctx={fb}
                    onDismiss={() => {
                        setFb(null)
                        setFbShown(false)
                    }}
                />
            )}

            {hasChunks && hasZhVisible && (
                <p className="ra2-ocr">中文結果是 OCR 辨識文字，可能有錯字，請回原頁面核對。</p>
            )}

            {hasChunks && visible.length === 0 && (
                <p className="ra-notice">這個語言沒有結果，請到「縮小搜尋範圍」改回全部。</p>
            )}

            {visible.length > 0 && (
                <ul className="ra2-list">
                    {visible.map(({ c, i }) => {
                        const isZh = c.doc_lang === 'zh'
                        const translateHref = buildTranslateUrl(c.content)
                        const rowKey = keyOf(c, i)
                        const isOpen = openSet.has(rowKey)
                        const fullText = showRaw ? c.content : cleanFor(c.doc_lang, c.content)
                        const snip = pickSnippet(fullText, searchTerms)
                        const shown = isOpen || !snip.partial ? fullText : snip.text
                        const canTranslate = !isZh && translateHref.length <= TRANSLATE_URL_LIMIT
                        return (
                            <li key={rowKey} data-scope={(c as ScopedChunk).doc_scope ?? 'main'}>
                                <div className="ra2-head">
                                    <span className="ra2-page">
                                        {c.page_number ? `第 ${c.page_number} 頁` : '頁碼不明'}
                                    </span>
                                    <span className="ra2-doc">{c.doc_title || '規則書'}</span>
                                    <span className="ra2-badges">
                                        <span className="ra2-badge">{langTag(c.doc_lang)}</span>
                                        <span
                                            className="ra2-badge ra2-badge-scope"
                                            data-scope={(c as ScopedChunk).doc_scope ?? 'main'}
                                        >
                                            {chunkScope(c)}
                                        </span>
                                    </span>
                                </div>
                                <p
                                    className="ra2-text"
                                    lang={isZh ? 'zh-Hant' : 'en'}
                                    style={{ fontSize: FONT_PX[fontSize] }}
                                >
                                    {highlight(shown, searchTerms)}
                                </p>
                                <div className="ra2-actions">
                                    {snip.partial && (
                                        <button
                                            className="ra2-link"
                                            type="button"
                                            aria-expanded={isOpen}
                                            onClick={() =>
                                                setOpenSet((prev) => {
                                                    const next = new Set(prev)
                                                    if (next.has(rowKey)) next.delete(rowKey)
                                                    else next.add(rowKey)
                                                    return next
                                                })
                                            }
                                        >
                                            {isOpen ? '收合 ▴' : '看完整段落 ▾'}
                                        </button>
                                    )}
                                    {canTranslate && (
                                        <a
                                            className="ra2-link"
                                            href={translateHref}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            翻譯成繁體中文
                                        </a>
                                    )}
                                    <button className="ra2-link" type="button" onClick={() => void copyChunk(c)}>
                                        複製規則片段
                                    </button>
                                </div>
                                {!isZh && !canTranslate && (
                                    <p className="ra2-small">這段太長，無法帶入翻譯網頁，請改用「複製規則片段」。</p>
                                )}
                            </li>
                        )
                    })}
                </ul>
            )}

            {faqHits.length > 0 && (
                <div className="er-box">
                    <p className="er-box-title">
                        官方 FAQ（{faqSubtitle(bggName)}，非中文規則書原文）・{faqHits.length} 筆
                    </p>
                    <ul className="er-list">
                        {faqHits.map((f) => (
                            <li key={f.key}>
                                <div className="er-title">
                                    {highlight(f.topic, searchTerms)}
                                    <small className="er-src"> ・{f.group}</small>
                                </div>
                                {f.q && <p className="er-body">Q：{highlight(f.q, searchTerms)}</p>}
                                <p className="er-body">{f.q ? 'A：' : ''}{highlight(f.a, searchTerms)}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {errata.length > 0 && (
                <div className="er-box">
                    <p className="er-box-title">
                        玩錯紀錄・AI 回饋（管理者記錄或玩家整理・已審核，非官方規則）・{errata.length} 筆
                    </p>
                    <ul className="er-list">
                        {errata.map((e) => (
                            <li key={e.id}>
                                <div className="er-title">
                                    {e.title}
                                    {e.from_player && <small className="er-src"> ・{errataTag(e)}</small>}
                                </div>
                                <p className="er-body">{e.content}</p>
                                {e.page_ref && <small className="er-src">參考頁碼：{e.page_ref}　</small>}
                                {e.source_note && <small className="er-src">來源：{e.source_note}</small>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {hasChunks && visible.some(({ c }) => c.doc_lang !== 'zh') && (
                <p className="ra2-small">
                    按「翻譯成繁體中文」會把這段文字傳到 Google 翻譯，請勿翻譯個人或機密內容。
                </p>
            )}

            {drawer}
        </div>
    )
}
