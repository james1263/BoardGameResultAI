import { supabase } from './supabase'

// 更新（或清空）一款遊戲的簡介；回傳是否真的有寫進資料庫
export async function updateDescription(
  bggName: string,
  text: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('board_games')
    .update({ description: text.trim().slice(0, 300) })
    .eq('bgg_name', bggName)
    .select('bgg_name')

  if (error || !data || data.length === 0) {
    window.alert('儲存失敗：' + (error?.message ?? '沒有權限或找不到這款遊戲'))
    return false
  }
  return true
}