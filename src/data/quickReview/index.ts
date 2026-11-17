import { RISING_SUN_REVIEW } from './risingSun'
import { TZOLKIN_REVIEW } from './tzolkin'
import { PAX_PAMIR_REVIEW } from './paxPamir'
import type { ReviewSection } from './risingSun'

export type QuickReviewData = { bggName: string; draftNote: string; sections: ReviewSection[] }

// 新增別款快速複習：照 risingSun.ts／tzolkin.ts 格式新增檔案，再在這裡登記一行
const REVIEWS: QuickReviewData[] = [RISING_SUN_REVIEW, TZOLKIN_REVIEW, PAX_PAMIR_REVIEW]

export function getQuickReview(bggName: string): QuickReviewData | undefined {
  return REVIEWS.find((item) => item.bggName === bggName)
}
