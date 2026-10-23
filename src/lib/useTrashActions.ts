import { useState } from 'react'
import { supabase } from './supabase'
import type { LibraryGame } from './libraryTypes'

type GameRef = Pick<LibraryGame, 'bggName' | 'name'>
type GamesUpdater = (updater: (games: LibraryGame[]) => LibraryGame[]) => void

export function useTrashActions(
  allGames: LibraryGame[],
  onGamesChange: GamesUpdater,
) {
  const [busyName, setBusyName] = useState<string | null>(null)

  async function setRemovedAt(
    game: GameRef,
    removedAt: string | null,
  ): Promise<boolean> {
    setBusyName(game.bggName)
    const { data, error } = await supabase
      .from('board_games')
      .update({ removed_at: removedAt })
      .eq('bgg_name', game.bggName)
      .select('bgg_name')
    setBusyName(null)

    if (error || !data || data.length === 0) {
      window.alert(
        '操作失敗：' + (error?.message ?? '沒有權限，或找不到這款遊戲。'),
      )
      return false
    }

    onGamesChange((list) =>
      list.map((item) =>
        item.bggName === game.bggName ? { ...item, removedAt } : item,
      ),
    )
    return true
  }

  async function trashGame(game: GameRef): Promise<boolean> {
    if (
      !window.confirm(
        `確定要把「${game.name}」移到垃圾桶嗎？\n之後可以在頁面最下方還原。`,
      )
    ) {
      return false
    }
    return setRemovedAt(game, new Date().toISOString())
  }

  async function restoreGame(game: GameRef): Promise<boolean> {
    return setRemovedAt(game, null)
  }

  async function deleteForever(game: LibraryGame): Promise<boolean> {
    if (
      !window.confirm(
        `確定要永久刪除「${game.name}」嗎？\n遊戲資料與雲端封面會被刪除，無法復原。`,
      )
    ) {
      return false
    }

    setBusyName(game.bggName)
    const { data, error } = await supabase
      .from('board_games')
      .delete()
      .eq('bgg_name', game.bggName)
      .select('bgg_name')

    if (error || !data || data.length === 0) {
      setBusyName(null)
      window.alert(
        '刪除失敗：' + (error?.message ?? '沒有權限，或找不到這款遊戲。'),
      )
      return false
    }

    // 其他遊戲還在用同一個封面代號時，不刪封面。
    const coverInUse = allGames.some(
      (item) =>
        item.bggName !== game.bggName && item.coverSlug === game.coverSlug,
    )
    if (game.coverSlug && !coverInUse) {
      const { error: removeError } = await supabase.storage
        .from('covers')
        .remove([`${game.coverSlug}.webp`])
      if (removeError) {
        window.alert('遊戲已刪除，但雲端封面刪除失敗：' + removeError.message)
      }
    }

    setBusyName(null)
    onGamesChange((list) =>
      list.filter((item) => item.bggName !== game.bggName),
    )
    return true
  }

  return { busyName, trashGame, restoreGame, deleteForever }
}
