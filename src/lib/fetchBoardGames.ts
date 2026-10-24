import { supabase } from './supabase'
import type { LibraryGame } from './libraryTypes'

type BoardGameRow = {
  bgg_name: string
  created_at?: string | null
  removed_at?: string | null
  removed_reason?: string | null
  description?: string | null
  name: string
  cover_slug: string
  link_bgg: string
  link_rulebook_zh: string
  link_rulebook_en: string
  link_faq: string
  category: string[]
  bgg_score: number | null
  bgg_difficulty: number | null
  bgg_time: number | null
  min_players: number | null
  max_players: number | null
  best_players: number[]
  recommend_players: number[]
  ranking_engine: number | null
  classic_game_ranking: number | null
  score_rank: number | null
  player_impact_ranking: number | null
  change_ranking: number | null
  unique_ranking: number | null
  communication_ranking: number | null
  like_degree: number | null
  change_degree: number | null
  communication_degree: number | null
  player_impact_degree: number | null
  unique_degree: number | null
  complexity_degree: number | null
  like_emoji: string
  speed_emoji: string
  communication_emoji: string
  unique_emoji: string
  player_impact_emoji: string
  complexity_emoji: string
  change_emoji: string
}

function rowToGame(row: BoardGameRow, index: number): LibraryGame {
  return {
    id: index + 1,
    name: row.name,
    bggName: row.bgg_name,
    createdAt: row.created_at,
    removedAt: row.removed_at,
    removedReason: row.removed_reason,
    description: row.description ?? '',
    slug: `game-${index + 1}`,
    coverSlug: row.cover_slug,
    links: {
      bgg: row.link_bgg,
      rulebookZh: row.link_rulebook_zh,
      rulebookEn: row.link_rulebook_en,
      faq: row.link_faq,
    },
    category: row.category,
    bggScore: row.bgg_score,
    maxPlayers: row.max_players,
    minPlayers: row.min_players,
    bggTime: row.bgg_time,
    bggDifficulty: row.bgg_difficulty,
    bestPlayers: row.best_players,
    recommendPlayers: row.recommend_players,
    rankingEngine: row.ranking_engine,
    classicGameRanking: row.classic_game_ranking,
    scoreRank: row.score_rank,
    playerImpactRanking: row.player_impact_ranking,
    changeRanking: row.change_ranking,
    uniqueRanking: row.unique_ranking,
    communicationRanking: row.communication_ranking,
    likeDegree: row.like_degree,
    changeDegree: row.change_degree,
    communicationDegree: row.communication_degree,
    playerImpactDegree: row.player_impact_degree,
    uniqueDegree: row.unique_degree,
    complexityDegree: row.complexity_degree,
    likeEmoji: row.like_emoji,
    speedEmoji: row.speed_emoji,
    communicationEmoji: row.communication_emoji,
    uniqueEmoji: row.unique_emoji,
    playerImpactEmoji: row.player_impact_emoji,
    complexityEmoji: row.complexity_emoji,
    changeEmoji: row.change_emoji,
  }
}

export async function fetchBoardGames(): Promise<LibraryGame[]> {
  const { data, error } = await supabase
    .from('board_games')
    .select('*')
    .order('ranking_engine', { ascending: true, nullsFirst: false })

  if (error) throw error
  return (data as BoardGameRow[]).map(rowToGame)
}
