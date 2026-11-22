// 「BGG 討論・非官方 FAQ」的登記表（key＝資料庫裡的 bggName）。
// 這些內容不是官方 FAQ：是玩家整理的設計師回覆或討論串結論，用自己的話摘要並附來源。
// 網頁（GameFaq.tsx）與規則助手（faqSearch.ts）都從這裡讀，新增一款只要在這裡登記一次。
// 資料與官方規則衝突時，以規則書與官方 FAQ 為準。

import type { GameFaqData } from './types'
import { SHACKLETON_BASE_UNOFFICIAL_FAQ } from './unofficial/shackletonBase'
import { TZOLKIN_UNOFFICIAL_FAQ } from './unofficial/tzolkinFaq'
import { PAX_PAMIR_FAQ } from './unofficial/paxPamirFaq'
import { DARWINS_JOURNEY_FAQ } from './unofficial/darwinsJourneyFaq'
import { BRASS_BIRMINGHAM_UNOFFICIAL_FAQ } from './unofficial/brassBirminghamUnofficial'
import { FEAST_FOR_ODIN_UNOFFICIAL_FAQ } from './unofficial/feastForOdinUnofficial'
import { NIPPON_UNOFFICIAL_FAQ } from './unofficial/nipponUnofficial'
import { ALCHEMISTS_UNOFFICIAL_FAQ } from './unofficial/alchemistsUnofficial'
import { EVERDELL_SILVERFROST_UNOFFICIAL_FAQ } from './unofficial/everdellSilverfrostUnofficial'
import { KEYFLOWER_UNOFFICIAL_FAQ } from './unofficial/keyflowerUnofficial'
import { FURUYONI_NEW_ACT_UNOFFICIAL_FAQ } from './unofficial/furuyoniNewActUnofficial'
import { KEMET_UNOFFICIAL_FAQ } from './unofficial/kemetUnofficial'
import { SEKIGAHARA_UNOFFICIAL_FAQ } from './unofficial/sekigaharaUnofficial'
import { PIRATES_OF_MARACAIBO_UNOFFICIAL_FAQ } from './unofficial/piratesOfMaracaiboUnofficial'
import { INIS_UNOFFICIAL_FAQ } from './unofficial/inisUnofficial'
import { GAIA_PROJECT_UNOFFICIAL_FAQ } from './unofficial/gaiaProjectUnofficial'
import { RISING_SUN_UNOFFICIAL_FAQ } from './unofficial/risingSunUnofficial'

export const UNOFFICIAL_FAQ_BY_GAME: Record<string, GameFaqData> = {
  'Shackleton Base: A Journey to the Moon': SHACKLETON_BASE_UNOFFICIAL_FAQ,
  "Tzolk'in: The Mayan Calendar": TZOLKIN_UNOFFICIAL_FAQ,
  'Pax Pamir: Second Edition': PAX_PAMIR_FAQ,
  "Darwin's Journey": DARWINS_JOURNEY_FAQ,
  'Brass: Birmingham': BRASS_BIRMINGHAM_UNOFFICIAL_FAQ,
  'A Feast for Odin': FEAST_FOR_ODIN_UNOFFICIAL_FAQ,
  'Nippon: Zaibatsu': NIPPON_UNOFFICIAL_FAQ,
  'Alchemists': ALCHEMISTS_UNOFFICIAL_FAQ,
  'Everdell Silverfrost': EVERDELL_SILVERFROST_UNOFFICIAL_FAQ,
  'Keyflower': KEYFLOWER_UNOFFICIAL_FAQ,
  '新幕 桜降る代に決闘を 基本セット (A Duel for Falling Cherry Blossoms: New Act – Basic Set)': FURUYONI_NEW_ACT_UNOFFICIAL_FAQ,
  'Kemet: Blood and Sand': KEMET_UNOFFICIAL_FAQ,
  'Sekigahara: The Unification of Japan': SEKIGAHARA_UNOFFICIAL_FAQ,
  'Pirates of Maracaibo': PIRATES_OF_MARACAIBO_UNOFFICIAL_FAQ,
  'Inis: Legendary Edition': INIS_UNOFFICIAL_FAQ,
  'Gaia Project': GAIA_PROJECT_UNOFFICIAL_FAQ,
  'Rising Sun': RISING_SUN_UNOFFICIAL_FAQ,
}

export function getUnofficialFaq(bggName: string): GameFaqData | null {
  return UNOFFICIAL_FAQ_BY_GAME[bggName] ?? null
}
