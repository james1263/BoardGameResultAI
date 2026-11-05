import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { cleanLinks, toStoredLinks, type ExpansionLink } from './useGameExpansions'

export const MAX_BACKGROUND = 5000
export const MAX_SOURCE_NOTE = 100
export const MAX_LINKS = 10

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
          links: toStoredLinks(links),
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
