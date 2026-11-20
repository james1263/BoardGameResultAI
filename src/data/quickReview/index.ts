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
import { CLANS_OF_CALEDONIA_REVIEW } from './clansOfCaledonia'
import { EVERDELL_SILVERFROST_REVIEW } from './everdellSilverfrost'
import { CRESCENT_MOON_REVIEW } from './crescentMoon'
import { BRUXELLES_1893_REVIEW } from './bruxelles1893'
import { VITICULTURE_REVIEW } from './viticulture'
import { DEAL_WITH_THE_DEVIL_REVIEW } from './dealWithTheDevil'
import { PRAGA_CAPUT_REGNI_REVIEW } from './pragaCaputRegni'
import { AYAR_REVIEW } from './ayar'
import { WHITE_CASTLE_REVIEW } from './whiteCastle'
import { DUNE_IMPERIUM_UPRISING_REVIEW } from './duneImperiumUprising'
import { KEYFLOWER_REVIEW } from './keyflower'
import { FURUYONI_NEW_ACT_REVIEW } from './furuyoniNewAct'
import { HEAVEN_AND_ALE_REVIEW } from './heavenAndAle'
import { UNDERWATER_CITIES_REVIEW } from './underwaterCities'
import { VIKINGS_878_REVIEW } from './vikings878'
import { UNDAUNTED_CALLISTO_REVIEW } from './undauntedCallisto'
import { MIND_MGMT_REVIEW } from './mindMgmt'
import { KRONOLOGIC_PARIS_1920_REVIEW } from './kronologic'
import { BIER_PIONIERE_REVIEW } from './bierPioniere'
import { KEMET_REVIEW } from './kemet'
import { WALLENSTEIN_REVIEW } from './wallenstein'
import { LUNA_MARIS_REVIEW } from './lunaMaris'
import { TRAGEDY_LOOPER_REVIEW } from './tragedyLooper'
import { MOUNTAIN_KING_REVIEW } from './mountainKing'
import { MANSIONS_OF_MADNESS_REVIEW } from './mansionsOfMadness'
import { QMG_WW2_REVIEW } from './qmgWw2'
import { ROCK_SWAP_FLIP_FLOP_REVIEW } from './rockSwapFlipFlop'
import { WANDERING_TOWERS_REVIEW } from './wanderingTowers'
import { DEAD_MANS_DRAW_REVIEW } from './deadMansDraw'
import { SEKIGAHARA_REVIEW } from './sekigahara'
import { HANSA_TEUTONICA_REVIEW } from './hansaTeutonica'
import { CAMEL_UP_REVIEW } from './camelUp'
import { INIS_REVIEW } from './inis'

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
  , CLANS_OF_CALEDONIA_REVIEW
  , EVERDELL_SILVERFROST_REVIEW
  , CRESCENT_MOON_REVIEW
  , BRUXELLES_1893_REVIEW
  , VITICULTURE_REVIEW
  , DEAL_WITH_THE_DEVIL_REVIEW
  , PRAGA_CAPUT_REGNI_REVIEW
  , AYAR_REVIEW
  , WHITE_CASTLE_REVIEW
  , DUNE_IMPERIUM_UPRISING_REVIEW
  , KEYFLOWER_REVIEW
  , FURUYONI_NEW_ACT_REVIEW
  , HEAVEN_AND_ALE_REVIEW
  , UNDERWATER_CITIES_REVIEW
  , VIKINGS_878_REVIEW
  , UNDAUNTED_CALLISTO_REVIEW
  , MIND_MGMT_REVIEW
  , KRONOLOGIC_PARIS_1920_REVIEW
  , BIER_PIONIERE_REVIEW
  , KEMET_REVIEW
  , WALLENSTEIN_REVIEW
  , LUNA_MARIS_REVIEW
  , TRAGEDY_LOOPER_REVIEW
  , MOUNTAIN_KING_REVIEW
  , MANSIONS_OF_MADNESS_REVIEW
  , QMG_WW2_REVIEW
  , ROCK_SWAP_FLIP_FLOP_REVIEW
  , WANDERING_TOWERS_REVIEW
  , DEAD_MANS_DRAW_REVIEW
  , SEKIGAHARA_REVIEW
  , HANSA_TEUTONICA_REVIEW
  , CAMEL_UP_REVIEW
  , INIS_REVIEW
]

export function getQuickReview(bggName: string): QuickReviewData | undefined {
  return REVIEWS.find((item) => item.bggName === bggName)
}