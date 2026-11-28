import type { ReviewSection } from './risingSun'

export type QuickReviewData = { bggName: string; draftNote: string; sections: ReviewSection[] }

type Loader = () => Promise<QuickReviewData>

// 快速複習改成「點到那一款才載入那一個檔」。新增一款：照 risingSun.ts 格式新增檔案，再在下面登記一行（遊戲名稱要和 bggName 完全一致）
const LOADERS: Record<string, Loader> = {
  "Rising Sun": () => import('./risingSun').then((m) => m.RISING_SUN_REVIEW),
  "Tzolk'in: The Mayan Calendar": () => import('./tzolkin').then((m) => m.TZOLKIN_REVIEW),
  "Pax Pamir: Second Edition": () => import('./paxPamir').then((m) => m.PAX_PAMIR_REVIEW),
  "Gaia Project": () => import('./gaiaProject').then((m) => m.GAIA_PROJECT_REVIEW),
  "Great Western Trail: Argentina": () => import('./greatWesternTrailArgentina').then((m) => m.GREAT_WESTERN_TRAIL_ARGENTINA_REVIEW),
  "Kanban EV": () => import('./kanbanEv').then((m) => m.KANBAN_EV_REVIEW),
  "Carnegie": () => import('./carnegie').then((m) => m.CARNEGIE_REVIEW),
  "Shackleton Base: A Journey to the Moon": () => import('./shackletonBase').then((m) => m.SHACKLETON_BASE_REVIEW),
  "Darwin's Journey": () => import('./darwinsJourney').then((m) => m.DARWINS_JOURNEY_REVIEW),
  "Brass: Birmingham": () => import('./brassBirmingham').then((m) => m.BRASS_BIRMINGHAM_REVIEW),
  "A Feast for Odin": () => import('./feastForOdin').then((m) => m.FEAST_FOR_ODIN_REVIEW),
  "Cuzco": () => import('./cuzco').then((m) => m.CUZCO_REVIEW),
  "Skymines": () => import('./skymines').then((m) => m.SKYMINES_REVIEW),
  "Federation": () => import('./federation').then((m) => m.FEDERATION_REVIEW),
  "Lorenzo il Magnifico: Big Box": () => import('./lorenzo').then((m) => m.LORENZO_REVIEW),
  "Nippon: Zaibatsu": () => import('./nippon').then((m) => m.NIPPON_REVIEW),
  "Alchemists": () => import('./alchemists').then((m) => m.ALCHEMISTS_REVIEW),
  "Tiletum": () => import('./tiletum').then((m) => m.TILETUM_REVIEW),
  "Pulsar 2849": () => import('./pulsar2849').then((m) => m.PULSAR_2849_REVIEW),
  "Sidereal Confluence": () => import('./siderealConfluence').then((m) => m.SIDEREAL_CONFLUENCE_REVIEW),
  "Dead Reckoning": () => import('./deadReckoning').then((m) => m.DEAD_RECKONING_REVIEW),
  "Marrakesh": () => import('./marrakesh').then((m) => m.MARRAKESH_REVIEW),
  "Clans of Caledonia": () => import('./clansOfCaledonia').then((m) => m.CLANS_OF_CALEDONIA_REVIEW),
  "Everdell Silverfrost": () => import('./everdellSilverfrost').then((m) => m.EVERDELL_SILVERFROST_REVIEW),
  "Crescent Moon": () => import('./crescentMoon').then((m) => m.CRESCENT_MOON_REVIEW),
  "Bruxelles 1893: Belle Époque": () => import('./bruxelles1893').then((m) => m.BRUXELLES_1893_REVIEW),
  "Viticulture Essential Edition": () => import('./viticulture').then((m) => m.VITICULTURE_REVIEW),
  "Deal with the Devil": () => import('./dealWithTheDevil').then((m) => m.DEAL_WITH_THE_DEVIL_REVIEW),
  "Praga Caput Regni": () => import('./pragaCaputRegni').then((m) => m.PRAGA_CAPUT_REGNI_REVIEW),
  "Ayar: Children of the Sun": () => import('./ayar').then((m) => m.AYAR_REVIEW),
  "The White Castle": () => import('./whiteCastle').then((m) => m.WHITE_CASTLE_REVIEW),
  "Dune: Imperium – Uprising": () => import('./duneImperiumUprising').then((m) => m.DUNE_IMPERIUM_UPRISING_REVIEW),
  "Keyflower": () => import('./keyflower').then((m) => m.KEYFLOWER_REVIEW),
  "Heaven & Ale": () => import('./heavenAndAle').then((m) => m.HEAVEN_AND_ALE_REVIEW),
  "Underwater Cities": () => import('./underwaterCities').then((m) => m.UNDERWATER_CITIES_REVIEW),
  "878 Vikings: Invasions of England": () => import('./vikings878').then((m) => m.VIKINGS_878_REVIEW),
  "Undaunted 2200: Callisto": () => import('./undauntedCallisto').then((m) => m.UNDAUNTED_CALLISTO_REVIEW),
  "Mind MGMT: The Psychic Espionage “Game”": () => import('./mindMgmt').then((m) => m.MIND_MGMT_REVIEW),
  "Kronologic: Paris 1920": () => import('./kronologic').then((m) => m.KRONOLOGIC_PARIS_1920_REVIEW),
  "Bier Pioniere": () => import('./bierPioniere').then((m) => m.BIER_PIONIERE_REVIEW),
  "Kemet: Blood and Sand": () => import('./kemet').then((m) => m.KEMET_REVIEW),
  "Wallenstein Big Box": () => import('./wallenstein').then((m) => m.WALLENSTEIN_REVIEW),
  "Luna Maris": () => import('./lunaMaris').then((m) => m.LUNA_MARIS_REVIEW),
  "Tragedy Looper": () => import('./tragedyLooper').then((m) => m.TRAGEDY_LOOPER_REVIEW),
  "In the Hall of the Mountain King": () => import('./mountainKing').then((m) => m.MOUNTAIN_KING_REVIEW),
  "Mansions of Madness: Second Edition": () => import('./mansionsOfMadness').then((m) => m.MANSIONS_OF_MADNESS_REVIEW),
  "Quartermaster General WW2: 2nd Edition": () => import('./qmgWw2').then((m) => m.QMG_WW2_REVIEW),
  "Rock Swap Flip-Flop": () => import('./rockSwapFlipFlop').then((m) => m.ROCK_SWAP_FLIP_FLOP_REVIEW),
  "Wandering Towers": () => import('./wanderingTowers').then((m) => m.WANDERING_TOWERS_REVIEW),
  "Dead Man's Draw": () => import('./deadMansDraw').then((m) => m.DEAD_MANS_DRAW_REVIEW),
  "Sekigahara: The Unification of Japan": () => import('./sekigahara').then((m) => m.SEKIGAHARA_REVIEW),
  "Hansa Teutonica: Big Box": () => import('./hansaTeutonica').then((m) => m.HANSA_TEUTONICA_REVIEW),
  "Camel Up (Second Edition)": () => import('./camelUp').then((m) => m.CAMEL_UP_REVIEW),
  "Inis: Legendary Edition": () => import('./inis').then((m) => m.INIS_REVIEW),
  "Lure": () => import('./lure').then((m) => m.LURE_REVIEW),
  "Rurik: Second Edition": () => import('./rurik').then((m) => m.RURIK_REVIEW),
  "For the Gods!": () => import('./forTheGods').then((m) => m.FOR_THE_GODS_REVIEW),
  "Viking See-Saw": () => import('./vikingSeeSaw').then((m) => m.VIKING_SEE_SAW_REVIEW),
  "Joyride: Turbo": () => import('./joyrideTurbo').then((m) => m.JOYRIDE_TURBO_REVIEW),
  "The Resistance: Avalon": () => import('./avalon').then((m) => m.AVALON_REVIEW),
  "YINSH": () => import('./yinsh').then((m) => m.YINSH_REVIEW),
  "Bohnanza": () => import('./bohnanza').then((m) => m.BOHNANZA_REVIEW),
  "Ra": () => import('./ra').then((m) => m.RA_REVIEW),
  "It's a Wonderful World": () => import('./itsAWonderfulWorld').then((m) => m.ITS_A_WONDERFUL_WORLD_REVIEW),
  "The Message": () => import('./theMessage').then((m) => m.THE_MESSAGE_REVIEW),
  "Feed the Kraken": () => import('./feedTheKraken').then((m) => m.FEED_THE_KRAKEN_REVIEW),
  "Secret Hitler": () => import('./secretHitler').then((m) => m.SECRET_HITLER_REVIEW),
  "Welcome to the Moon": () => import('./welcomeToTheMoon').then((m) => m.WELCOME_TO_THE_MOON_REVIEW),
  "Startups": () => import('./startups').then((m) => m.STARTUPS_REVIEW),
  "Magical athlete": () => import('./magicalAthlete').then((m) => m.MAGICAL_ATHLETE_REVIEW),
  "Wits & Wagers": () => import('./witsAndWagers').then((m) => m.WITS_AND_WAGERS_REVIEW),
  "War Chest": () => import('./warChest').then((m) => m.WAR_CHEST_REVIEW),
  "Don't Get Got!": () => import('./dontGetGot').then((m) => m.DONT_GET_GOT_REVIEW),
  "Cascadia": () => import('./cascadia').then((m) => m.CASCADIA_REVIEW),
  "Tornado Splash": () => import('./tornadoSplash').then((m) => m.TORNADO_SPLASH_REVIEW),
  "冷たい彼女が目覚める前に (Embalming Girl)": () => import('./embalmingGirl').then((m) => m.EMBALMING_GIRL_REVIEW),
  "The Quacks of Quedlinburg": () => import('./quacks').then((m) => m.QUACKS_REVIEW),
  "Death Note 人狼": () => import('./deathNoteJinro').then((m) => m.DEATH_NOTE_JINRO_REVIEW),
  "Doodle Dash": () => import('./doodleDash').then((m) => m.DOODLE_DASH_REVIEW),
  "Take Time": () => import('./takeTime').then((m) => m.TAKE_TIME_REVIEW),
  "Salem 1692": () => import('./salem1692').then((m) => m.SALEM_1692_REVIEW),
  "Modern Art": () => import('./modernArt').then((m) => m.MODERN_ART_REVIEW),
  "Heart of Crown": () => import('./heartOfCrown').then((m) => m.HEART_OF_CROWN_REVIEW),
  "The Rich and the Good": () => import('./theRichAndTheGood').then((m) => m.THE_RICH_AND_THE_GOOD_REVIEW),
  "Northgard: Uncharted Lands": () => import('./northgard').then((m) => m.NORTHGARD_REVIEW),
  "Witch's Brew": () => import('./witchsBrew').then((m) => m.WITCHS_BREW_REVIEW),
  "Decrypto": () => import('./decrypto').then((m) => m.DECRYPTO_REVIEW),
  "Taiwan Night Market": () => import('./taiwanNightMarket').then((m) => m.TAIWAN_NIGHT_MARKET_REVIEW),
  "Joraku": () => import('./joraku').then((m) => m.JORAKU_REVIEW),
  "Spectral": () => import('./spectral').then((m) => m.SPECTRAL_REVIEW),
  "Living Forest": () => import('./livingForest').then((m) => m.LIVING_FOREST_REVIEW),
  "Manila": () => import('./manila').then((m) => m.MANILA_REVIEW),
  "Betrayal at House on the Hill: 3rd Edition": () => import('./betrayalHouseOnHill').then((m) => m.BETRAYAL_3RD_REVIEW),
  "Harmonies": () => import('./harmonies').then((m) => m.HARMONIES_REVIEW),
  "Scout": () => import('./scout').then((m) => m.SCOUT_REVIEW),
  "Eternal Sevens": () => import('./eternalSevens').then((m) => m.ETERNAL_SEVENS_REVIEW),
  "Bable": () => import('./bable').then((m) => m.BABLE_REVIEW),
  "Detective: City of Angels": () => import('./detectiveCityOfAngels').then((m) => m.DETECTIVE_CITY_OF_ANGELS_REVIEW),
  "Moon Colony Bloodbath": () => import('./moonColonyBloodbath').then((m) => m.MOON_COLONY_BLOODBATH_REVIEW),
  "Spicy": () => import('./spicy').then((m) => m.SPICY_REVIEW),
  "Pirates of Maracaibo": () => import('./piratesOfMaracaibo').then((m) => m.PIRATES_OF_MARACAIBO_REVIEW),
  "onward": () => import('./onward').then((m) => m.ONWARD_REVIEW),
}

// 名稱太長、只記了開頭的款（開頭一致就算）
const PREFIX_LOADERS: Array<[string, Loader]> = [
  ["新幕 桜降る代に決闘を 基本セット", () => import('./furuyoniNewAct').then((m) => m.FURUYONI_NEW_ACT_REVIEW)],
]

function pick(bggName: string): Loader | undefined {
  const exact = LOADERS[bggName]
  if (exact) return exact
  return PREFIX_LOADERS.find(([head]) => bggName.startsWith(head))?.[1]
}

const cache = new Map<string, QuickReviewData>()

// 有沒有這一款的快速複習（不用下載內容，詳細視窗決定要不要顯示入口用）
export function hasQuickReview(bggName: string): boolean {
  return pick(bggName) !== undefined
}

// 已經載入過的內容（沒載入過回傳 undefined）
export function getCachedQuickReview(bggName: string): QuickReviewData | undefined {
  return cache.get(bggName)
}

// 點到那一款才下載
export async function loadQuickReview(bggName: string): Promise<QuickReviewData | undefined> {
  const cached = cache.get(bggName)
  if (cached) return cached
  const loader = pick(bggName)
  if (!loader) return undefined
  try {
    const data = await loader()
    cache.set(bggName, data)
    return data
  } catch {
    return undefined
  }
}
