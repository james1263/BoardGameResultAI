import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { extractPdfChunks, PdfExtractError } from './extractPdfText'

export type DocType = 'rulebook' | 'faq' | 'errata' | 'intro' | 'video' | 'other'
export type DocLanguage = 'zh' | 'en' | 'other'
export type IndexStatus =
  | 'none'
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'

export type GameDocument = {
  id: string
  bgg_name: string
  doc_type: DocType
  language: DocLanguage
  title: string
  source_type: 'external' | 'upload'
  external_url: string
  storage_path: string
  ai_indexed: boolean
  index_status: IndexStatus
  index_error_code: string
  page_count: number | null
  edition: string
  source_note: string
}

export function isSafeUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

const MAX_PDF_BYTES = 50 * 1024 * 1024
const MAX_PAYLOAD_CHARS = 3_000_000
const INDEXABLE: DocType[] = ['rulebook', 'faq', 'errata']

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

  // 管理者上傳 PDF：先擷取文字，成功才上傳；任何一步失敗都會復原
  const uploadDoc = useCallback(
    async (input: {
      file: File
      docType: DocType
      language: DocLanguage
      title: string
      edition: string
      sourceNote: string
      onProgress?: (text: string) => void
    }): Promise<string | null> => {
      const { file } = input
      const progress = input.onProgress ?? (() => {})

      if (!INDEXABLE.includes(input.docType)) {
        return '只有規則書、FAQ、勘誤可以建立索引。'
      }
      if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') {
        return '請選擇 PDF 檔。'
      }
      if (file.size > MAX_PDF_BYTES) return '檔案超過 50 MB。'
      if (input.sourceNote.trim().length > 200) {
        return '來源說明不能超過 200 字。'
      }

      let extracted
      try {
        progress('讀取 PDF 文字…')
        extracted = await extractPdfChunks(file, (done, total) =>
          progress(`讀取文字：第 ${done} / ${total} 頁`),
        )
      } catch (error) {
        if (error instanceof PdfExtractError) return error.message
        return (
          '讀取 PDF 失敗：' +
          (error instanceof Error ? error.message : '未知錯誤')
        )
      }

      const payload = extracted.chunks.map((chunk) => ({
        page: chunk.page,
        title: chunk.title,
        content: chunk.content,
      }))
      if (JSON.stringify(payload).length > MAX_PAYLOAD_CHARS) {
        return '這份文件的文字量太大，無法一次建立索引。'
      }

      const docId = crypto.randomUUID()
      const path = `${docId}.pdf`
      const title =
        input.title.trim() || file.name.replace(/\.pdf$/i, '').slice(0, 80)

      progress('上傳 PDF…')
      const upload = await supabase.storage
        .from('rulebooks')
        .upload(path, file, { contentType: 'application/pdf', upsert: false })
      if (upload.error) return '上傳失敗：' + upload.error.message

      const insert = await supabase.from('game_documents').insert({
        id: docId,
        bgg_name: bggName,
        doc_type: input.docType,
        language: input.language,
        title,
        source_type: 'upload',
        external_url: '',
        storage_path: path,
        ai_indexed: false,
        index_status: 'processing',
        edition: input.edition.trim(),
        source_note: input.sourceNote.trim(),
      })
      if (insert.error) {
        await supabase.storage.from('rulebooks').remove([path])
        return '新增文件失敗：' + insert.error.message
      }

      progress('建立索引…')
      const replace = await supabase.rpc('admin_replace_rulebook_chunks', {
        p_document: docId,
        p_chunks: payload,
        p_page_count: extracted.pageCount,
        p_file_hash: extracted.fileHash,
      })
      if (replace.error) {
        // 全部復原，不留下半成品
        await supabase.from('game_documents').delete().eq('id', docId)
        await supabase.storage.from('rulebooks').remove([path])
        return '建立索引失敗，已復原：' + replace.error.message
      }

      setReloadKey((current) => current + 1)
      return null
    },
    [bggName],
  )

  const deleteDoc = useCallback(
    async (doc: GameDocument): Promise<string | null> => {
      // 上傳的文件：先刪 PDF 原檔，再刪資料列（切塊會跟著 cascade 刪除）
      if (doc.source_type === 'upload' && doc.storage_path) {
        const removed = await supabase.storage
          .from('rulebooks')
          .remove([doc.storage_path])
        if (removed.error) return '刪除 PDF 失敗：' + removed.error.message
      }

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

  return { docs, isLoading, loadError, addDoc, uploadDoc, deleteDoc }
}

export type GameDocumentsApi = ReturnType<typeof useGameDocuments>