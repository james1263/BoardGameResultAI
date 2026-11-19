import { RISING_SUN_REVIEW } from './risingSun'
import { TZOLKIN_REVIEW } from './tzolkin'
import { PAX_PAMIR_REVIEW } from './paxPamir'
import { GAIA_PROJECT_REVIEW } from './gaiaProject'
import type { ReviewSection } from './risingSun'
import { GREAT_WESTERN_TRAIL_ARGENTINA_REVIEW } from './greatWesternTrailArgentina'
import { KANBAN_EV_REVIEW } from './kanbanEv'
import { CARNEGIE_REVIEW } from './carnegie'
import { SHACKLETON_BASE_REVIEW } from './shackletonBase'
import { DARWINS_JOURNEY_REVIEW } from './darwinsJourney'
import { BRASS_BIRMINGHAM_REVIEW } from './brassBirmingham'
import { FEAST_FOR_ODIN_REVIEW } from './feastForOdin'
import { CUZCO_REVIEW } from './cuzco'
import { SKYMINES_REVIEW } from './skymines'
import { FEDERATION_REVIEW } from './federation'
import { LORENZO_REVIEW } from './lorenzo'
import { NIPPON_REVIEW } from './nippon'
import { ALCHEMISTS_REVIEW } from './alchemists'
import { TILETUM_REVIEW } from './tiletum'
import { PULSAR_2849_REVIEW } from './pulsar2849'
import { SIDEREAL_CONFLUENCE_REVIEW } from './siderealConfluence'
import { DEAD_RECKONING_REVIEW } from './deadReckoning'
import { MARRAKESH_REVIEW } from './marrakesh'
  

export type QuickReviewData = { bggName: string; draftNote: string; sections: ReviewSection[] }

// 新增別款快速複習：照 risingSun.ts／tzolkin.ts 格式新增檔案，再在這裡登記一行
const REVIEWS: QuickReviewData[] = [
  RISING_SUN_REVIEW
  , TZOLKIN_REVIEW
  , PAX_PAMIR_REVIEW
  , GAIA_PROJECT_REVIEW
  , GREAT_WESTERN_TRAIL_ARGENTINA_REVIEW
  , KANBAN_EV_REVIEW
  , CARNEGIE_REVIEW
  , SHACKLETON_BASE_REVIEW
  , DARWINS_JOURNEY_REVIEW
  , BRASS_BIRMINGHAM_REVIEW
  , FEAST_FOR_ODIN_REVIEW
  , CUZCO_REVIEW
  , SKYMINES_REVIEW
  , FEDERATION_REVIEW
  , LORENZO_REVIEW
  , NIPPON_REVIEW
   , ALCHEMISTS_REVIEW
   , TILETUM_REVIEW
   , PULSAR_2849_REVIEW
   , SIDEREAL_CONFLUENCE_REVIEW
   , DEAD_RECKONING_REVIEW
   , MARRAKESH_REVIEW
]

export function getQuickReview(bggName: string): QuickReviewData | undefined {
  return REVIEWS.find((item) => item.bggName === bggName)
}