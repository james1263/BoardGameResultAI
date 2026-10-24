import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

export type DocType = 'rulebook' | 'faq' | 'errata' | 'intro' | 'other'
export type DocLanguage = 'zh' | 'en' | 'other'

export type GameDocument = {
  id: string
  bgg_name: string
  doc_type: DocType
  language: DocLanguage
  title: string
  source_type: 'external' | 'upload'
  external_url: string
  storage_path: string
}

export function isSafeUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

export function useGameDocuments(bggName: string) {
  const [docs, setDocs] = useState<GameDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    supabase
      .from('game_documents')
      .select('*')
      .eq('bgg_name', bggName)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setLoadError('讀取文件失敗：' + error.message)
        } else {
          setLoadError('')
          setDocs((data ?? []) as GameDocument[])
        }
        setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [bggName, reloadKey])

  // 回傳錯誤訊息；成功回傳 null
  const addDoc = useCallback(
    async (input: {
      docType: DocType
      language: DocLanguage
      title: string
      url: string
    }): Promise<string | null> => {
      const url = input.url.trim()
      if (!isSafeUrl(url)) return '網址必須以 http:// 或 https:// 開頭。'

      const { error } = await supabase.from('game_documents').insert({
        bgg_name: bggName,
        doc_type: input.docType,
        language: input.language,
        title: input.title.trim(),
        source_type: 'external',
        external_url: url,
        storage_path: '',
      })
      if (error) return '新增失敗：' + error.message

      setReloadKey((current) => current + 1)
      return null
    },
    [bggName],
  )

  const deleteDoc = useCallback(
    async (doc: GameDocument): Promise<string | null> => {
      const { error } = await supabase
        .from('game_documents')
        .delete()
        .eq('id', doc.id)
      if (error) return '刪除失敗：' + error.message

      setReloadKey((current) => current + 1)
      return null
    },
    [],
  )

  return { docs, isLoading, loadError, addDoc, deleteDoc }
}

export type GameDocumentsApi = ReturnType<typeof useGameDocuments>