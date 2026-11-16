// 通用中文同義詞表（規則助手搜尋用）
// 規則：只查表、一次展開、不遞迴；原詞一定保留（呼叫端自己保留原問句）；
// 同一組的詞互為同義，輸入其中任何一個，就把同組其他詞一起搜。
// 不改資料庫：展開結果由呼叫端併進 search_rulebook_chunks 的 p_alt 參數。
//
// 加詞前請先用管理者身分，兩個詞各搜一次，確認規則書真的有這樣寫。
// 只放「規則書常見的翻譯／用語差異」；遊戲專屬的對應請走詞庫，或用下面的 games 欄位限定遊戲。
// 每個詞建議 2～4 字；更長的詞請拆成兩組。

export type SynGroup = {
    terms: string[]
    // 省略＝通用；填 bggName（要和資料庫一字不差）＝只對那幾款遊戲有效
    games?: string[]
}

export const SYNONYM_GROUPS: SynGroup[] = [
    { terms: ['起始玩家', '先手玩家', '先手', '首家'] },
    { terms: ['指示物', '標示物', '標記'] },
    { terms: ['勝利點', '勝點'] },
    { terms: ['棄牌堆', '棄牌區', '棄牌庫'] },
    { terms: ['抽牌堆', '牌庫', '牌堆'] },
    { terms: ['平手', '同分', '平分'] },
    { terms: ['計分', '算分'] },
    { terms: ['洗牌', '重洗'] },
    { terms: ['結盟', '聯盟'] },
    { terms: ['擊殺', '殺死', '殺掉'] },
    // 遊戲專屬範例（先不啟用；bggName 要和資料庫一致，驗證過再打開）：
    { terms: ['神殿', '神廟', '神社'], games: ['Rising Sun'] },
]

const MAX_PER_GROUP = 3 // 每一組最多加入幾個同義詞
const MAX_TOTAL = 6 // 一次搜尋最多加入幾個同義詞

// 4 字以上的詞會被資料庫切成 2 字滑動詞，「玩家」「遊戲」這種到處都有的片段會讓每段都命中，
// 所以這裡先自己拆好，並丟掉太泛用的片段。
const GENERIC = new Set([
    '玩家', '遊戲', '回合', '行動', '效果', '規則', '卡牌', '資源', '分數', '結束', '可以', '使用', '進行',
])

function toTokens(term: string): string[] {
    if (term.length <= 3) return [term]
    const out: string[] = []
    for (let i = 0; i < term.length - 1; i++) {
        const w = term.slice(i, i + 2)
        if (!GENERIC.has(w)) out.push(w)
    }
    return out
}

// 回傳「要額外搜尋的詞」（不含原問句）；沒有可展開的詞就回傳空陣列
export function expandSynonyms(q: string, bggName: string): string[] {
    const tokens: string[] = []
    let members = 0
    for (const g of SYNONYM_GROUPS) {
        if (g.games && !g.games.includes(bggName)) continue
        if (!g.terms.some((t) => q.includes(t))) continue
        let added = 0
        for (const t of g.terms) {
            if (added >= MAX_PER_GROUP || members >= MAX_TOTAL) break
            if (q.includes(t)) continue
            for (const tok of toTokens(t)) {
                if (!q.includes(tok) && !tokens.includes(tok)) tokens.push(tok)
            }
            added++
            members++
        }
    }
    return tokens
}
