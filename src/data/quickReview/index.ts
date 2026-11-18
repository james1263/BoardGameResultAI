import { RISING_SUN_REVIEW } from './risingSun'
import { TZOLKIN_REVIEW } from './tzolkin'
import { PAX_PAMIR_REVIEW } from './paxPamir'
import { GAIA_PROJECT_REVIEW } from './gaiaProject'
import type { ReviewSection } from './risingSun'
import { GREAT_WESTERN_TRAIL_ARGENTINA_REVIEW } from './greatWesternTrailArgentina'
import { KANBAN_EV_REVIEW } from './kanbanEv'
import { CARNEGIE_REVIEW } from './carnegie'
import { SHACKLETON_BASE_REVIEW } from './shackletonBase'

export type QuickReviewData = { bggName: string; draftNote: string; sections: ReviewSection[] }

// 新增別款快速複習：照 risingSun.ts／tzolkin.ts 格式新增檔案，再在這裡登記一行
const REVIEWS: QuickReviewData[] = [RISING_SUN_REVIEW, TZOLKIN_REVIEW, PAX_PAMIR_REVIEW, GAIA_PROJECT_REVIEW, GREAT_WESTERN_TRAIL_ARGENTINA_REVIEW
  , KANBAN_EV_REVIEW
  , CARNEGIE_REVIEW
  , SHACKLETON_BASE_REVIEW
]

export function getQuickReview(bggName: string): QuickReviewData | undefined {
  return REVIEWS.find((item) => item.bggName === bggName)
}