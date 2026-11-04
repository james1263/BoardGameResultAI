import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { MAX_LINKS, isSafeUrl, type ExpansionLink } from './useGameExpansions'

export const MAX_BACKGROUND = 2000
export const MAX_SOURCE_NOTE = 100
export { MAX_LINKS }

export type GameBackground = {
  content: string
  links: ExpansionLink[]
  sourceNote: string
}

type Row = {
  content: string | null
  links: unknown
  source_note: string | null
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

// 讀資料庫時一律再過濾一次，不信任資料內容
function cleanLinks(raw: unknown): ExpansionLink[] {
  if (!Array.isArray(raw)) return []
  const out: ExpansionLink[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const { label, url } = item as { label?: unknown; url?: unknown }
    if (typeof url !== 'string' || !isSafeUrl(url)) continue
    out.push({
      label: typeof label === 'string' && label.trim() !== '' ? label.trim() : hostOf(url),
      url,
    })
  }
  return out
}

export function useGameBackground(bggName: string) {
  const [data, setData] = useState<GameBackground | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    const { data: row, error: err } = await supabase
      .from('game_backgrounds')
      .select('content, links, source_note')
      .eq('bgg_name', bggName)
      .maybeSingle()
    if (err) {
      setError('背景資料讀取失敗：' + err.message)
      setData(null)
    } else {
      setError('')
      const r = row as Row | null
      setData(
        r
          ? {
              content: r.content ?? '',
              links: cleanLinks(r.links),
              sourceNote: r.source_note ?? '',
            }
          : null,
      )
    }
    setLoading(false)
  }, [bggName])

  useEffect(() => {
    setLoading(true)
    void reload()
  }, [reload])

  // 回傳空字串＝成功，否則是錯誤訊息。全部留空＝刪除這筆
  async function save(
    content: string,
    links: ExpansionLink[],
    sourceNote: string,
  ): Promise<string> {
    if (content === '' && links.length === 0 && sourceNote === '') {
      const { error: err } = await supabase
        .from('game_backgrounds')
        .delete()
        .eq('bgg_name', bggName)
      if (err) return '刪除失敗：' + err.message
    } else {
      const { error: err } = await supabase.from('game_backgrounds').upsert(
        {
          bgg_name: bggName,
          content,
          links,
          source_note: sourceNote,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'bgg_name' },
      )
      if (err) return '儲存失敗：' + err.message
    }
    await reload()
    return ''
  }

  return { data, loading, error, save }
}
