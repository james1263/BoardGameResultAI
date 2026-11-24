import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { LibraryGame } from '../lib/libraryTypes'
import '../styles/explore-home.css'
import '../styles/latest-discussions.css'

const FETCH_LIMIT = 30
const SHOW_COUNT = 5
const SNIPPET_CHARS = 40

type PublicNoteRow = {
  id: string
  bgg_name: string
  game_name: string | null
  nickname: string | null
  content: string | null
  posted_on: string | null
}

type Item = {
  id: string
  game: LibraryGame
  nickname: string
  snippet: string
  dateLabel: string
}

function makeSnippet(text: string): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  const chars = Array.from(flat)
  return chars.length > SNIPPET_CHARS ? `${chars.slice(0, SNIPPET_CHARS).join('')}…` : flat
}

// posted_on 是 YYYY-MM-DD（台北日期）→ M/D
function makeDateLabel(value: string | null): string {
  if (!value) return ''
  const match = /^\d{4}-(\d{2})-(\d{2})/.exec(value)
  if (!match) return ''
  return `${Number(match[1])}/${Number(match[2])}`
}

// 首頁「最新桌遊討論」：只給 VIP／管理者；只讀公開留言（get_public_gathering_notes），不碰私人心得。
// games 要傳入已排除垃圾桶與「僅供參考」的清單（App 的 statGames）；找不到對應遊戲的留言會被略過。
export default function LatestDiscussions({
  enabled,
  games,
  reloadKey,
  onOpenGame,
  onViewAll,
}: {
  enabled: boolean
  games: LibraryGame[]
  reloadKey: number
  onOpenGame: (game: LibraryGame) => void
  onViewAll: () => void
}) {
  const [rows, setRows] = useState<PublicNoteRow[]>([])

  useEffect(() => {
    if (!enabled) {
      setRows([])
      return
    }
    let cancelled = false
    void (async () => {
      try {
        const { data, error } = await supabase.rpc('get_public_gathering_notes', {
          p_bgg_name: null,
          p_limit: FETCH_LIMIT,
        })
        if (cancelled) return
        if (error || !Array.isArray(data)) {
          setRows([])
          return
        }
        setRows(data as PublicNoteRow[])
      } catch {
        if (!cancelled) setRows([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [enabled, reloadKey])

  const items = useMemo<Item[]>(() => {
    const byName = new Map<string, LibraryGame>()
    for (const game of games) byName.set(game.bggName, game)
    const list: Item[] = []
    for (const row of rows) {
      const game = byName.get(row.bgg_name)
      if (!game) continue
      const snippet = makeSnippet(row.content ?? '')
      if (!snippet) continue
      list.push({
        id: row.id,
        game,
        nickname: row.nickname ?? '（未命名）',
        snippet,
        dateLabel: makeDateLabel(row.posted_on),
      })
      if (list.length >= SHOW_COUNT) break
    }
    return list
  }, [rows, games])

  if (!enabled || items.length === 0) return null

  return (
    <section className="explore-home ld-section" aria-label="最新桌遊討論">
      <div className="ld-inner">
        <div className="ld-head">
          <h2 className="explore-title ld-title">最新桌遊討論</h2>
          <button type="button" className="ld-all" onClick={onViewAll}>
            查看全部 →
          </button>
        </div>
        <ul className="ld-list">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="ld-row"
                aria-label={`開啟 ${item.game.name} 的討論`}
                onClick={() => onOpenGame(item.game)}
              >
                <span className="ld-meta">
                  <span className="ld-game">{item.game.name}</span>
                  <span className="ld-who">
                    {item.nickname}
                    {item.dateLabel ? ` · ${item.dateLabel}` : ''}
                  </span>
                </span>
                <span className="ld-text">{item.snippet}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
