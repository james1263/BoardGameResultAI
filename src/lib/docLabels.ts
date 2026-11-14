import type { DocLanguage, DocScope, DocType, GameDocument } from './useGameDocuments'

export const DOC_TYPE_LABELS: Record<DocType, string> = {
  rulebook: '規則書',
  faq: 'FAQ',
  errata: '勘誤',
  intro: '中文介紹',
  video: '影片',
  other: '網頁',
}

export const LANGUAGE_LABELS: Record<DocLanguage, string> = {
  zh: '中文',
  en: '英文',
  other: '其他語言',
}

// 文件範圍：主遊戲／擴充／FAQ／玩家整理
export const SCOPE_LABELS: Record<DocScope, string> = {
  main: '主遊戲',
  expansion: '擴充',
  faq: 'FAQ／勘誤',
  player_notes: '玩家整理',
}

export function scopeLabel(scope: string | undefined, expansion?: string): string {
  const key = (scope ?? 'main') as DocScope
  const base = SCOPE_LABELS[key] ?? '主遊戲'
  const name = (expansion ?? '').trim()
  return key === 'expansion' && name ? `${base}：${name}` : base
}

// 畫面上只分三種：PDF（上傳、僅管理者）、影片、網頁
export type DocKind3 = 'pdf' | 'video' | 'web'

export function docKind(doc: GameDocument): DocKind3 {
  if (doc.source_type === 'upload') return 'pdf'
  if (doc.doc_type === 'video') return 'video'
  return 'web'
}

export function docIcon(doc: GameDocument): string {
  const kind = docKind(doc)
  return kind === 'pdf' ? '📄' : kind === 'video' ? '▶' : '🔗'
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

// 有填標題就以標題為主；沒有標題才用來源網站或舊的「類型（語言）」
export function docLabel(doc: GameDocument): string {
  const title = (doc.title ?? '').trim()
  if (title) return title
  const host = hostOf(doc.external_url)
  if (doc.doc_type === 'video') return host ? `影片（${host}）` : '影片'
  if (doc.doc_type === 'other') return host ? `網頁（${host}）` : '網頁'
  if (doc.doc_type === 'intro') return '中文介紹'
  return `${DOC_TYPE_LABELS[doc.doc_type]}（${LANGUAGE_LABELS[doc.language]}）`
}

// 只給管理者看：上傳文件的索引狀態
export function indexSuffix(doc: GameDocument): string {
  if (doc.source_type !== 'upload') return ''
  const edition = doc.edition ? `・${doc.edition}` : ''
  if (doc.index_status === 'completed') {
    return `｜已索引 ${doc.page_count ?? '?'} 頁${edition}`
  }
  if (doc.index_status === 'failed') {
    return `｜索引失敗${doc.index_error_code ? '（' + doc.index_error_code + '）' : ''}`
  }
  if (doc.index_status === 'processing') return '｜索引中'
  return '｜尚未索引'
}
