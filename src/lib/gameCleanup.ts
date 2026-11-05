import { supabase } from './supabase'

// 遊戲進垃圾桶（或永久刪除）時，清掉這款遊戲的附屬資料，只留封面與基本資料。
// 會刪除：規則書／FAQ 的 PDF 與搜尋索引、貼的連結、擴充（含圖片與連結）、背景介紹、詞庫與未對應詞。
// 不會動：玩家自己的想玩／已玩、評分、心得、遊玩紀錄、聚會資料（那是玩家的紀錄）。
// 玩錯紀錄也會一併刪除。
export type CleanupResult = {
  // 嚴重：檔案沒刪成功（會變成孤兒檔），呼叫端應該提醒
  errors: string[]
  // 次要：其他資料沒清乾淨，可以之後再清
  warnings: string[]
}

type DocRow = { id: string; storage_path: string | null; source_type: string }
type ExpansionRow = { id: string; image_path: string | null }

export async function cleanupGameData(bggName: string): Promise<CleanupResult> {
  const errors: string[] = []
  const warnings: string[] = []

  // 1. 規則書文件：先刪 PDF 原檔，成功才刪資料列（索引會跟著 cascade 刪除）
  try {
    const docs = await supabase
      .from('game_documents')
      .select('id, storage_path, source_type')
      .eq('bgg_name', bggName)
    if (docs.error) {
      errors.push('讀取規則書文件失敗：' + docs.error.message)
    } else {
      const rows = (docs.data ?? []) as DocRow[]
      const paths = rows
        .filter((row) => row.source_type === 'upload')
        .map((row) => row.storage_path || `${row.id}.pdf`)
      let canDelete = true
      if (paths.length > 0) {
        const removed = await supabase.storage.from('rulebooks').remove(paths)
        if (removed.error) {
          errors.push('刪除規則書 PDF 失敗：' + removed.error.message)
          canDelete = false
        }
      }
      if (canDelete && rows.length > 0) {
        const del = await supabase.from('game_documents').delete().eq('bgg_name', bggName)
        if (del.error) errors.push('刪除規則書文件列失敗：' + del.error.message)
      }
    }
  } catch (error) {
    errors.push('清理規則書時發生錯誤：' + (error instanceof Error ? error.message : '未知'))
  }

  // 2. 擴充：先刪圖片，成功才刪資料列
  try {
    const exp = await supabase
      .from('game_expansions')
      .select('id, image_path')
      .eq('bgg_name', bggName)
    if (exp.error) {
      warnings.push('讀取擴充失敗：' + exp.error.message)
    } else {
      const rows = (exp.data ?? []) as ExpansionRow[]
      const paths = Array.from(
        new Set(
          rows
            .flatMap((row) => [row.image_path ?? '', `expansions/${row.id}.webp`])
            .filter(Boolean),
        ),
      )
      let canDelete = true
      if (paths.length > 0) {
        const removed = await supabase.storage.from('covers').remove(paths)
        if (removed.error) {
          errors.push('刪除擴充圖片失敗：' + removed.error.message)
          canDelete = false
        }
      }
      if (canDelete && rows.length > 0) {
        const del = await supabase.from('game_expansions').delete().eq('bgg_name', bggName)
        if (del.error) warnings.push('刪除擴充資料列失敗：' + del.error.message)
      }
    }
  } catch (error) {
    warnings.push('清理擴充時發生錯誤：' + (error instanceof Error ? error.message : '未知'))
  }

  // 3. 背景介紹
  try {
    const del = await supabase.from('game_backgrounds').delete().eq('bgg_name', bggName)
    if (del.error) warnings.push('刪除背景介紹失敗：' + del.error.message)
  } catch (error) {
    warnings.push('清理背景介紹時發生錯誤：' + (error instanceof Error ? error.message : '未知'))
  }

  // 4. 詞庫（只能走管理者函式）；先刪詞庫，未對應詞清單才會完整列出
  try {
    const list = await supabase.rpc('admin_get_glossary', { p_bgg_name: bggName })
    if (list.error) {
      warnings.push('讀取詞庫失敗：' + list.error.message)
    } else {
      for (const row of (list.data ?? []) as { id: string }[]) {
        const del = await supabase.rpc('admin_delete_glossary', { p_id: row.id })
        if (del.error) {
          warnings.push('刪除詞庫失敗：' + del.error.message)
          break
        }
      }
    }
  } catch (error) {
    warnings.push('清理詞庫時發生錯誤：' + (error instanceof Error ? error.message : '未知'))
  }

  // 5. 找不到英文的詞（未對應詞）
  try {
    const list = await supabase.rpc('admin_get_glossary_misses', { p_bgg_name: bggName })
    if (list.error) {
      warnings.push('讀取未對應詞失敗：' + list.error.message)
    } else {
      for (const row of (list.data ?? []) as { zh_term: string }[]) {
        const del = await supabase.rpc('admin_delete_glossary_miss', {
          p_bgg_name: bggName,
          p_zh_term: row.zh_term,
        })
        if (del.error) {
          warnings.push('刪除未對應詞失敗：' + del.error.message)
          break
        }
      }
    }
  } catch (error) {
    warnings.push('清理未對應詞時發生錯誤：' + (error instanceof Error ? error.message : '未知'))
  }
    // 6. 玩錯紀錄
  try {
    const list = await supabase.rpc('get_game_errata', { p_bgg_name: bggName })
    if (list.error) {
      warnings.push('讀取玩錯紀錄失敗：' + list.error.message)
    } else {
      for (const row of (list.data ?? []) as { id: string }[]) {
        const del = await supabase.rpc('admin_delete_game_errata', { p_id: row.id })
        if (del.error) {
          warnings.push('刪除玩錯紀錄失敗：' + del.error.message)
          break
        }
      }
    }
  } catch (error) {
    warnings.push('清理玩錯紀錄時發生錯誤：' + (error instanceof Error ? error.message : '未知'))
  }

  return { errors, warnings }
}

export function cleanupMessage(name: string, result: CleanupResult): string {
  const lines: string[] = []
  if (result.errors.length > 0) lines.push(...result.errors)
  if (result.warnings.length > 0) lines.push(...result.warnings)
  return lines.length === 0 ? '' : `「${name}」的附屬資料沒有完全清乾淨：\n` + lines.join('\n')
}
