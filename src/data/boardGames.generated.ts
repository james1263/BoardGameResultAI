export type BoardGame = {
  id: number
  name: string
  bggName: string
  slug: string
  coverSlug: string
  links: {
    bgg: string
    rulebookZh: string
    rulebookEn: string
    faq: string
  }
  category: string[]
  bggScore: number | null
  maxPlayers: number | null
  minPlayers: number | null
  bggTime: number | null
  bggDifficulty: number | null
  bestPlayers: number[]
  recommendPlayers: number[]
  rankingEngine: number | null
  classicGameRanking: number | null
  scoreRank: number | null
  playerImpactRanking: number | null
  changeRanking: number | null
  uniqueRanking: number | null
  communicationRanking: number | null
  likeDegree: number | null
  changeDegree: number | null
  communicationDegree: number | null
  playerImpactDegree: number | null
  uniqueDegree: number | null
  complexityDegree: number | null
  likeEmoji: string
  speedEmoji: string
  communicationEmoji: string
  uniqueEmoji: string
  playerImpactEmoji: string
  complexityEmoji: string
  changeEmoji: string
}

export const boardGames: BoardGame[] = [
  {
    "id": 1,
    "name": "瘋狂詭宅（含擴）",
    "bggName": "Mansions of Madness: Second Edition",
    "slug": "game-1",
    "coverSlug": "mansions-of-madness-second-edition",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/205059/mansions-of-madness-second-edition",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "合作",
      "房間探險",
      "策略",
      "美式劇情"
    ],
    "bggScore": 8.6,
    "maxPlayers": 5,
    "minPlayers": 2,
    "bggTime": 180,
    "bggDifficulty": 2.8,
    "bestPlayers": [
      3,
      4
    ],
    "recommendPlayers": [
      3,
      4,
      5
    ],
    "rankingEngine": 6,
    "classicGameRanking": 26,
    "scoreRank": 120,
    "playerImpactRanking": 78,
    "changeRanking": 1,
    "uniqueRanking": 1,
    "communicationRanking": 7,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 3,
    "uniqueDegree": 5,
    "complexityDegree": 3,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 2,
    "name": "駱駝大賽",
    "bggName": "Camel Up (Second Edition)",
    "slug": "game-2",
    "coverSlug": "camel-up-second-edition",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/260605/camel-up-second-edition",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "派對",
      "賽車",
      "骰子"
    ],
    "bggScore": 7.6,
    "maxPlayers": 8,
    "minPlayers": 3,
    "bggTime": 45,
    "bggDifficulty": 1.5,
    "bestPlayers": [
      5,
      6
    ],
    "recommendPlayers": [
      4,
      5,
      6
    ],
    "rankingEngine": 81,
    "classicGameRanking": 21,
    "scoreRank": 434,
    "playerImpactRanking": 81,
    "changeRanking": 79,
    "uniqueRanking": 75,
    "communicationRanking": 18,
    "likeDegree": 3,
    "changeDegree": 3,
    "communicationDegree": 5,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 1,
    "likeEmoji": "❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 3,
    "name": "郎中闖江湖(含擴)",
    "bggName": "The Quacks of Quedlinburg",
    "slug": "game-3",
    "coverSlug": "the-quacks-of-quedlinburg",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/244521/quacks",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "策略",
      "袋抽"
    ],
    "bggScore": 8,
    "maxPlayers": 5,
    "minPlayers": 2,
    "bggTime": 45,
    "bggDifficulty": 2,
    "bestPlayers": [
      3,
      4,
      5
    ],
    "recommendPlayers": [
      2,
      3,
      4,
      5
    ],
    "rankingEngine": 28,
    "classicGameRanking": 22,
    "scoreRank": 219,
    "playerImpactRanking": 87,
    "changeRanking": 27,
    "uniqueRanking": 5,
    "communicationRanking": 23,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 3,
    "uniqueDegree": 5,
    "complexityDegree": 2,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 4,
    "name": "阿瓦隆",
    "bggName": "The Resistance: Avalon",
    "slug": "game-4",
    "coverSlug": "the-resistance-avalon",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/128882/the-resistance-avalon?utm_source=chatgpt.com",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "嘴砲",
      "陣營"
    ],
    "bggScore": 7.5,
    "maxPlayers": 10,
    "minPlayers": 5,
    "bggTime": 30,
    "bggDifficulty": 1.7,
    "bestPlayers": [
      7,
      8
    ],
    "recommendPlayers": [
      7,
      8,
      9
    ],
    "rankingEngine": 68,
    "classicGameRanking": 12,
    "scoreRank": 356,
    "playerImpactRanking": 57,
    "changeRanking": 63,
    "uniqueRanking": 88,
    "communicationRanking": 5,
    "likeDegree": 4,
    "changeDegree": 4,
    "communicationDegree": 5,
    "playerImpactDegree": 4,
    "uniqueDegree": 3,
    "complexityDegree": 2,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆"
  },
  {
    "id": 5,
    "name": "心靈特工",
    "bggName": "Mind MGMT: The Psychic Espionage “Game”",
    "slug": "game-5",
    "coverSlug": "mind-mgmt-the-psychic-espionage-game",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/284653/mind-mgmt-the-psychic-espionage-game",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "推理",
      "策略",
      "非對稱"
    ],
    "bggScore": 7.9,
    "maxPlayers": 3,
    "minPlayers": 2,
    "bggTime": 60,
    "bggDifficulty": 2.9,
    "bestPlayers": [
      2,
      3
    ],
    "recommendPlayers": [
      2,
      3
    ],
    "rankingEngine": 16,
    "classicGameRanking": 10,
    "scoreRank": 159,
    "playerImpactRanking": 11,
    "changeRanking": 28,
    "uniqueRanking": 15,
    "communicationRanking": 51,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 4,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 6,
    "name": "風聲再臨",
    "bggName": "The Message",
    "slug": "game-6",
    "coverSlug": "the-message",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/67919/the-message/ratings?rated=1&comment=1",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "卡牌驅動",
      "陣營"
    ],
    "bggScore": 7,
    "maxPlayers": 7,
    "minPlayers": 3,
    "bggTime": 60,
    "bggDifficulty": 2.4,
    "bestPlayers": [
      5,
      6
    ],
    "recommendPlayers": [
      4,
      5,
      6
    ],
    "rankingEngine": 4,
    "classicGameRanking": 5,
    "scoreRank": 262,
    "playerImpactRanking": 58,
    "changeRanking": 43,
    "uniqueRanking": 81,
    "communicationRanking": 28,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 5,
    "playerImpactDegree": 4,
    "uniqueDegree": 3,
    "complexityDegree": 3,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆"
  },
  {
    "id": 7,
    "name": "獵巫鎮",
    "bggName": "Salem 1692",
    "slug": "game-7",
    "coverSlug": "salem-1692",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/175549/salem-1692",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "卡牌驅動",
      "陣營"
    ],
    "bggScore": 7.1,
    "maxPlayers": 12,
    "minPlayers": 4,
    "bggTime": 35,
    "bggDifficulty": 2,
    "bestPlayers": [
      7,
      8
    ],
    "recommendPlayers": [
      7,
      8,
      9,
      10
    ],
    "rankingEngine": 85,
    "classicGameRanking": 25,
    "scoreRank": 377,
    "playerImpactRanking": 65,
    "changeRanking": 58,
    "uniqueRanking": 74,
    "communicationRanking": 12,
    "likeDegree": 3,
    "changeDegree": 4,
    "communicationDegree": 5,
    "playerImpactDegree": 4,
    "uniqueDegree": 3,
    "complexityDegree": 2,
    "likeEmoji": "❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆"
  },
  {
    "id": 8,
    "name": "揭密希特勒",
    "bggName": "Secret Hitler",
    "slug": "game-8",
    "coverSlug": "secret-hitler",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/188834/secret-hitler",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "嘴砲",
      "陣營"
    ],
    "bggScore": 7.5,
    "maxPlayers": 10,
    "minPlayers": 7,
    "bggTime": 45,
    "bggDifficulty": 1.7,
    "bestPlayers": [
      8,
      10
    ],
    "recommendPlayers": [
      7,
      8,
      9,
      10
    ],
    "rankingEngine": 63,
    "classicGameRanking": 41,
    "scoreRank": 410,
    "playerImpactRanking": 62,
    "changeRanking": 76,
    "uniqueRanking": 62,
    "communicationRanking": 30,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 5,
    "playerImpactDegree": 4,
    "uniqueDegree": 4,
    "complexityDegree": 2,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 9,
    "name": "聖域：血與沙(含擴)",
    "bggName": "Kemet: Blood and Sand",
    "slug": "game-9",
    "coverSlug": "kemet-blood-and-sand",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/297562/kemet-blood-and-sand",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "區控",
      "引擎構築",
      "策略"
    ],
    "bggScore": 8.2,
    "maxPlayers": 5,
    "minPlayers": 2,
    "bggTime": 120,
    "bggDifficulty": 3,
    "bestPlayers": [
      4
    ],
    "recommendPlayers": [
      3,
      4,
      5,
      6
    ],
    "rankingEngine": 2,
    "classicGameRanking": 24,
    "scoreRank": 97,
    "playerImpactRanking": 8,
    "changeRanking": 6,
    "uniqueRanking": 18,
    "communicationRanking": 33,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 4,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 10,
    "name": "蒼天之死",
    "bggName": "蒼天之死 (Death of Heaven)",
    "slug": "game-10",
    "coverSlug": "蒼天之死-death-of-heaven",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/342409/cang-tian-zhi-si-death-of-heaven",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "卡牌構築",
      "策略",
      "談判"
    ],
    "bggScore": 7.5,
    "maxPlayers": 6,
    "minPlayers": 4,
    "bggTime": 90,
    "bggDifficulty": 3,
    "bestPlayers": [
      5,
      6
    ],
    "recommendPlayers": [
      4,
      5,
      6
    ],
    "rankingEngine": 3,
    "classicGameRanking": 2,
    "scoreRank": 103,
    "playerImpactRanking": 46,
    "changeRanking": 11,
    "uniqueRanking": 27,
    "communicationRanking": 3,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 4,
    "uniqueDegree": 5,
    "complexityDegree": 4,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 11,
    "name": "翠嶼秘境大盒版",
    "bggName": "Inis: Legendary Edition",
    "slug": "game-11",
    "coverSlug": "inis-legendary-edition",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/447305/inis-legendary-edition",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "區控",
      "卡牌驅動",
      "策略",
      "輪抽"
    ],
    "bggScore": 8.2,
    "maxPlayers": 5,
    "minPlayers": 2,
    "bggTime": 90,
    "bggDifficulty": 3,
    "bestPlayers": [
      3,
      4,
      5
    ],
    "recommendPlayers": [
      3,
      4,
      5
    ],
    "rankingEngine": 37,
    "classicGameRanking": 8,
    "scoreRank": 250,
    "playerImpactRanking": 32,
    "changeRanking": 31,
    "uniqueRanking": 82,
    "communicationRanking": 29,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 3,
    "complexityDegree": 4,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 12,
    "name": "皇冠之心（含擴）",
    "bggName": "Heart of Crown",
    "slug": "game-12",
    "coverSlug": "heart-of-crown",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/131904/heart-of-crown",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "卡牌構築",
      "策略"
    ],
    "bggScore": 8.3,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 40,
    "bggDifficulty": 2.5,
    "bestPlayers": [
      3,
      4
    ],
    "recommendPlayers": [
      2,
      3,
      4
    ],
    "rankingEngine": 5,
    "classicGameRanking": 7,
    "scoreRank": 202,
    "playerImpactRanking": 79,
    "changeRanking": 5,
    "uniqueRanking": 53,
    "communicationRanking": 48,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 4,
    "playerImpactDegree": 3,
    "uniqueDegree": 4,
    "complexityDegree": 3,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 13,
    "name": "太陽神RA",
    "bggName": "Ra",
    "slug": "game-13",
    "coverSlug": "ra",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/12/ra",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "成套蒐集",
      "競標",
      "策略",
      "袋抽"
    ],
    "bggScore": 7.6,
    "maxPlayers": 5,
    "minPlayers": 3,
    "bggTime": 60,
    "bggDifficulty": 2.3,
    "bestPlayers": [
      3,
      4
    ],
    "recommendPlayers": [
      3,
      4
    ],
    "rankingEngine": 7,
    "classicGameRanking": 3,
    "scoreRank": 162,
    "playerImpactRanking": 3,
    "changeRanking": 65,
    "uniqueRanking": 11,
    "communicationRanking": 8,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 3,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆"
  },
  {
    "id": 14,
    "name": "旭日戰魂錄（含擴）",
    "bggName": "Rising Sun",
    "slug": "game-14",
    "coverSlug": "rising-sun",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/205896/rising-sun",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "區控",
      "策略",
      "談判",
      "跟隨"
    ],
    "bggScore": 8.2,
    "maxPlayers": 6,
    "minPlayers": 4,
    "bggTime": 120,
    "bggDifficulty": 3.1,
    "bestPlayers": [
      4,
      5
    ],
    "recommendPlayers": [
      4,
      5
    ],
    "rankingEngine": 1,
    "classicGameRanking": 1,
    "scoreRank": 20,
    "playerImpactRanking": 1,
    "changeRanking": 3,
    "uniqueRanking": 9,
    "communicationRanking": 2,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 4,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 15,
    "name": "漢薩同盟大盒版",
    "bggName": "Hansa Teutonica: Big Box",
    "slug": "game-15",
    "coverSlug": "hansa-teutonica-big-box",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/286749/hansa-teutonica-big-box",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "工擺",
      "抽象棋",
      "策略"
    ],
    "bggScore": 8.4,
    "maxPlayers": 5,
    "minPlayers": 3,
    "bggTime": 90,
    "bggDifficulty": 3,
    "bestPlayers": [
      5
    ],
    "recommendPlayers": [
      4,
      5
    ],
    "rankingEngine": 32,
    "classicGameRanking": 39,
    "scoreRank": 242,
    "playerImpactRanking": 33,
    "changeRanking": 38,
    "uniqueRanking": 10,
    "communicationRanking": 52,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 4,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 16,
    "name": "馬尼拉",
    "bggName": "Manila",
    "slug": "game-16",
    "coverSlug": "manila",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/15817/manila",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "工擺",
      "派對",
      "競標",
      "股票",
      "骰子"
    ],
    "bggScore": 7,
    "maxPlayers": 5,
    "minPlayers": 3,
    "bggTime": 60,
    "bggDifficulty": 2,
    "bestPlayers": [
      4
    ],
    "recommendPlayers": [
      3,
      4,
      5
    ],
    "rankingEngine": 59,
    "classicGameRanking": 6,
    "scoreRank": 373,
    "playerImpactRanking": 56,
    "changeRanking": 77,
    "uniqueRanking": 78,
    "communicationRanking": 20,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 5,
    "playerImpactDegree": 4,
    "uniqueDegree": 3,
    "complexityDegree": 2,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 17,
    "name": "戰爭之匣（含擴）",
    "bggName": "War Chest",
    "slug": "game-17",
    "coverSlug": "war-chest",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/249259/war-chest",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "抽象棋",
      "策略",
      "袋抽"
    ],
    "bggScore": 8.3,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 60,
    "bggDifficulty": 2.3,
    "bestPlayers": [
      2
    ],
    "recommendPlayers": [
      2,
      3,
      4
    ],
    "rankingEngine": 35,
    "classicGameRanking": 4,
    "scoreRank": 179,
    "playerImpactRanking": 13,
    "changeRanking": 9,
    "uniqueRanking": 69,
    "communicationRanking": 40,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 4,
    "complexityDegree": 3,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 18,
    "name": "圈套棋",
    "bggName": "YINSH",
    "slug": "game-18",
    "coverSlug": "yinsh",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/7854/yinsh",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "抽象棋",
      "策略"
    ],
    "bggScore": 7.7,
    "maxPlayers": 2,
    "minPlayers": 2,
    "bggTime": 60,
    "bggDifficulty": 2.7,
    "bestPlayers": [
      2
    ],
    "recommendPlayers": [
      2
    ],
    "rankingEngine": 73,
    "classicGameRanking": 23,
    "scoreRank": 341,
    "playerImpactRanking": 2,
    "changeRanking": 73,
    "uniqueRanking": 37,
    "communicationRanking": 60,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 3,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 19,
    "name": "伯明翰",
    "bggName": "Brass: Birmingham",
    "slug": "game-19",
    "coverSlug": "brass-birmingham",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/224517/brass-birmingham",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "卡牌驅動",
      "爬軌",
      "策略",
      "經濟",
      "鐵路"
    ],
    "bggScore": 8.6,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 120,
    "bggDifficulty": 3.9,
    "bestPlayers": [
      3,
      4
    ],
    "recommendPlayers": [
      3,
      4
    ],
    "rankingEngine": 9,
    "classicGameRanking": 19,
    "scoreRank": 252,
    "playerImpactRanking": 25,
    "changeRanking": 55,
    "uniqueRanking": 25,
    "communicationRanking": 64,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆"
  },
  {
    "id": 20,
    "name": "星河交匯",
    "bggName": "Sidereal Confluence",
    "slug": "game-20",
    "coverSlug": "sidereal-confluence",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/202426/sidereal-confluence",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "引擎構築",
      "策略",
      "談判",
      "資源轉換"
    ],
    "bggScore": 7.8,
    "maxPlayers": 9,
    "minPlayers": 4,
    "bggTime": 180,
    "bggDifficulty": 3.5,
    "bestPlayers": [
      5,
      6
    ],
    "recommendPlayers": [
      5,
      6,
      7
    ],
    "rankingEngine": 41,
    "classicGameRanking": 46,
    "scoreRank": 162,
    "playerImpactRanking": 40,
    "changeRanking": 16,
    "uniqueRanking": 2,
    "communicationRanking": 1,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 21,
    "name": "惡夜殺機（含擴）",
    "bggName": "Terrorscape",
    "slug": "game-21",
    "coverSlug": "terrorscape",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/371433/terrorscape",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "推理",
      "策略",
      "非對稱"
    ],
    "bggScore": 8.4,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 45,
    "bggDifficulty": 2.2,
    "bestPlayers": [
      2,
      4
    ],
    "recommendPlayers": [
      2,
      4
    ],
    "rankingEngine": 83,
    "classicGameRanking": 35,
    "scoreRank": 254,
    "playerImpactRanking": 20,
    "changeRanking": 8,
    "uniqueRanking": 61,
    "communicationRanking": 39,
    "likeDegree": 3,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 4,
    "complexityDegree": 2,
    "likeEmoji": "❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 22,
    "name": "狼人真言",
    "bggName": "Werewords",
    "slug": "game-22",
    "coverSlug": "werewords",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/219215/werewords",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "派對",
      "猜謎"
    ],
    "bggScore": 7.1,
    "maxPlayers": 10,
    "minPlayers": 4,
    "bggTime": 10,
    "bggDifficulty": 1.2,
    "bestPlayers": [
      6,
      7
    ],
    "recommendPlayers": [
      5,
      6,
      7,
      8
    ],
    "rankingEngine": 100,
    "classicGameRanking": 100,
    "scoreRank": 700,
    "playerImpactRanking": 100,
    "changeRanking": 100,
    "uniqueRanking": 100,
    "communicationRanking": 100,
    "likeDegree": 3,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 1,
    "likeEmoji": "❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 23,
    "name": "地主",
    "bggName": "Tichu",
    "slug": "game-23",
    "coverSlug": "tichu",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/215/tichu",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "派對",
      "爬階"
    ],
    "bggScore": 7.6,
    "maxPlayers": 6,
    "minPlayers": 2,
    "bggTime": 20,
    "bggDifficulty": 2.3,
    "bestPlayers": [
      4
    ],
    "recommendPlayers": [
      3,
      4,
      6
    ],
    "rankingEngine": 100,
    "classicGameRanking": 100,
    "scoreRank": 700,
    "playerImpactRanking": 100,
    "changeRanking": 100,
    "uniqueRanking": 100,
    "communicationRanking": 100,
    "likeDegree": 3,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 3,
    "likeEmoji": "❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 24,
    "name": "大西部開拓者阿根廷",
    "bggName": "Great Western Trail: Argentina",
    "slug": "game-24",
    "coverSlug": "great-western-trail-argentina",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/364011/great-western-trail-argentina",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "卡牌構築",
      "爬軌",
      "策略",
      "路徑移動"
    ],
    "bggScore": 8.4,
    "maxPlayers": 4,
    "minPlayers": 1,
    "bggTime": 150,
    "bggDifficulty": 3.9,
    "bestPlayers": [
      3
    ],
    "recommendPlayers": [
      2,
      3,
      4
    ],
    "rankingEngine": 10,
    "classicGameRanking": 31,
    "scoreRank": 252,
    "playerImpactRanking": 22,
    "changeRanking": 56,
    "uniqueRanking": 14,
    "communicationRanking": 63,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆"
  },
  {
    "id": 25,
    "name": "險惡疑航",
    "bggName": "Feed the Kraken",
    "slug": "game-25",
    "coverSlug": "feed-the-kraken",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/271601/feed-the-kraken",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "嘴砲",
      "陣營"
    ],
    "bggScore": 7.9,
    "maxPlayers": 11,
    "minPlayers": 6,
    "bggTime": 90,
    "bggDifficulty": 2.1,
    "bestPlayers": [
      8,
      9,
      10,
      11
    ],
    "recommendPlayers": [
      7,
      8,
      9,
      10,
      11
    ],
    "rankingEngine": 19,
    "classicGameRanking": 29,
    "scoreRank": 216,
    "playerImpactRanking": 45,
    "changeRanking": 37,
    "uniqueRanking": 35,
    "communicationRanking": 14,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 4,
    "uniqueDegree": 5,
    "complexityDegree": 2,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 26,
    "name": "勇者無懼2200",
    "bggName": "Undaunted 2200: Callisto",
    "slug": "game-26",
    "coverSlug": "undaunted-2200-callisto",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/401978/undaunted-2200-callisto",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "卡牌構築",
      "戰棋",
      "策略",
      "骰子"
    ],
    "bggScore": 7.8,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 60,
    "bggDifficulty": 2.6,
    "bestPlayers": [
      2
    ],
    "recommendPlayers": [
      2
    ],
    "rankingEngine": 11,
    "classicGameRanking": 48,
    "scoreRank": 149,
    "playerImpactRanking": 5,
    "changeRanking": 4,
    "uniqueRanking": 32,
    "communicationRanking": 45,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 3,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 27,
    "name": "貓吃三辣",
    "bggName": "Spicy",
    "slug": "game-27",
    "coverSlug": "spicy",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/299169/spicy",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "吹牛",
      "派對"
    ],
    "bggScore": 7.2,
    "maxPlayers": 6,
    "minPlayers": 2,
    "bggTime": 20,
    "bggDifficulty": 1.4,
    "bestPlayers": [
      4,
      5
    ],
    "recommendPlayers": [
      3,
      4,
      5
    ],
    "rankingEngine": 71,
    "classicGameRanking": 14,
    "scoreRank": 398,
    "playerImpactRanking": 74,
    "changeRanking": 71,
    "uniqueRanking": 84,
    "communicationRanking": 13,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 5,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 1,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 28,
    "name": "水下都市（含擴）",
    "bggName": "Underwater Cities",
    "slug": "game-28",
    "coverSlug": "underwater-cities",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/247763/underwater-cities",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "卡牌驅動",
      "工擺",
      "引擎構築",
      "策略"
    ],
    "bggScore": 8.5,
    "maxPlayers": 4,
    "minPlayers": 1,
    "bggTime": 180,
    "bggDifficulty": 3.7,
    "bestPlayers": [
      2
    ],
    "recommendPlayers": [
      2,
      3,
      4
    ],
    "rankingEngine": 64,
    "classicGameRanking": 32,
    "scoreRank": 382,
    "playerImpactRanking": 69,
    "changeRanking": 29,
    "uniqueRanking": 73,
    "communicationRanking": 86,
    "likeDegree": 4,
    "changeDegree": 5,
    "communicationDegree": 3,
    "playerImpactDegree": 4,
    "uniqueDegree": 3,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 29,
    "name": "解碼戰",
    "bggName": "Decrypto",
    "slug": "game-29",
    "coverSlug": "decrypto",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/225694/decrypto",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "合作",
      "派對",
      "猜謎"
    ],
    "bggScore": 7.8,
    "maxPlayers": 8,
    "minPlayers": 3,
    "bggTime": 45,
    "bggDifficulty": 1.8,
    "bestPlayers": [
      4,
      6
    ],
    "recommendPlayers": [
      4,
      6
    ],
    "rankingEngine": 79,
    "classicGameRanking": 37,
    "scoreRank": 398,
    "playerImpactRanking": 60,
    "changeRanking": 66,
    "uniqueRanking": 54,
    "communicationRanking": 36,
    "likeDegree": 3,
    "changeDegree": 4,
    "communicationDegree": 5,
    "playerImpactDegree": 4,
    "uniqueDegree": 4,
    "complexityDegree": 2,
    "likeEmoji": "❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆"
  },
  {
    "id": 30,
    "name": "加勒多尼亞(含擴）",
    "bggName": "Clans of Caledonia",
    "slug": "game-30",
    "coverSlug": "clans-of-caledonia",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/216132/clans-of-caledonia",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "區控",
      "策略",
      "經濟",
      "資源轉換"
    ],
    "bggScore": 8.2,
    "maxPlayers": 4,
    "minPlayers": 1,
    "bggTime": 120,
    "bggDifficulty": 3.9,
    "bestPlayers": [
      4
    ],
    "recommendPlayers": [
      3,
      4
    ],
    "rankingEngine": 25,
    "classicGameRanking": 47,
    "scoreRank": 232,
    "playerImpactRanking": 27,
    "changeRanking": 23,
    "uniqueRanking": 31,
    "communicationRanking": 56,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 31,
    "name": "A Fake Artist Goes to New York",
    "bggName": "A Fake Artist Goes to New York",
    "slug": "game-31",
    "coverSlug": "a-fake-artist-goes-to-new-york",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/135779/a-fake-artist-goes-to-new-york",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "派對",
      "畫畫",
      "陣營"
    ],
    "bggScore": 7.1,
    "maxPlayers": 10,
    "minPlayers": 5,
    "bggTime": 20,
    "bggDifficulty": 1.1,
    "bestPlayers": [
      5,
      6,
      7
    ],
    "recommendPlayers": [
      6,
      7,
      8
    ],
    "rankingEngine": 100,
    "classicGameRanking": 100,
    "scoreRank": 700,
    "playerImpactRanking": 100,
    "changeRanking": 100,
    "uniqueRanking": 100,
    "communicationRanking": 100,
    "likeDegree": 3,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 1,
    "likeEmoji": "❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 32,
    "name": "種豆",
    "bggName": "Bohnanza",
    "slug": "game-32",
    "coverSlug": "bohnanza",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/11/bohnanza",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "成套蒐集",
      "派對",
      "談判"
    ],
    "bggScore": 7.1,
    "maxPlayers": 5,
    "minPlayers": 3,
    "bggTime": 45,
    "bggDifficulty": 1.7,
    "bestPlayers": [
      4,
      5
    ],
    "recommendPlayers": [
      4,
      5
    ],
    "rankingEngine": 61,
    "classicGameRanking": 15,
    "scoreRank": 386,
    "playerImpactRanking": 54,
    "changeRanking": 86,
    "uniqueRanking": 80,
    "communicationRanking": 4,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 5,
    "playerImpactDegree": 4,
    "uniqueDegree": 3,
    "complexityDegree": 2,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 33,
    "name": "維京蹺蹺板",
    "bggName": "Viking See-Saw",
    "slug": "game-33",
    "coverSlug": "viking-see-saw",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/351810/viking-see-saw",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "動作",
      "派對"
    ],
    "bggScore": 7.1,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 10,
    "bggDifficulty": 1,
    "bestPlayers": [
      2
    ],
    "recommendPlayers": [
      2,
      3,
      4
    ],
    "rankingEngine": 86,
    "classicGameRanking": 9,
    "scoreRank": 468,
    "playerImpactRanking": 64,
    "changeRanking": 89,
    "uniqueRanking": 87,
    "communicationRanking": 44,
    "likeDegree": 3,
    "changeDegree": 3,
    "communicationDegree": 4,
    "playerImpactDegree": 4,
    "uniqueDegree": 3,
    "complexityDegree": 1,
    "likeEmoji": "❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥",
    "complexityEmoji": "🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 34,
    "name": "死亡筆記本",
    "bggName": "Death Note 人狼",
    "slug": "game-34",
    "coverSlug": "death-note-人狼",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/350441/death-note-ren-lang",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "卡牌驅動",
      "陣營"
    ],
    "bggScore": 6.9,
    "maxPlayers": 7,
    "minPlayers": 4,
    "bggTime": 30,
    "bggDifficulty": 1.5,
    "bestPlayers": [
      6
    ],
    "recommendPlayers": [
      5,
      6
    ],
    "rankingEngine": 34,
    "classicGameRanking": 11,
    "scoreRank": 355,
    "playerImpactRanking": 59,
    "changeRanking": 75,
    "uniqueRanking": 67,
    "communicationRanking": 34,
    "likeDegree": 5,
    "changeDegree": 3,
    "communicationDegree": 5,
    "playerImpactDegree": 4,
    "uniqueDegree": 4,
    "complexityDegree": 1,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥",
    "complexityEmoji": "🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 35,
    "name": "和諧之森",
    "bggName": "Harmonies",
    "slug": "game-35",
    "coverSlug": "harmonies",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/414317/harmonies",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "拼圖",
      "策略"
    ],
    "bggScore": 8,
    "maxPlayers": 4,
    "minPlayers": 1,
    "bggTime": 45,
    "bggDifficulty": 2,
    "bestPlayers": [
      2,
      3
    ],
    "recommendPlayers": [
      2,
      3,
      4
    ],
    "rankingEngine": 57,
    "classicGameRanking": 20,
    "scoreRank": 416,
    "playerImpactRanking": 77,
    "changeRanking": 68,
    "uniqueRanking": 44,
    "communicationRanking": 82,
    "likeDegree": 4,
    "changeDegree": 4,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 4,
    "complexityDegree": 2,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆"
  },
  {
    "id": 36,
    "name": "Scout",
    "bggName": "Scout",
    "slug": "game-36",
    "coverSlug": "scout",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/291453/scout",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "爬階",
      "策略"
    ],
    "bggScore": 7.8,
    "maxPlayers": 5,
    "minPlayers": 2,
    "bggTime": 20,
    "bggDifficulty": 1.4,
    "bestPlayers": [
      4
    ],
    "recommendPlayers": [
      4,
      5
    ],
    "rankingEngine": 66,
    "classicGameRanking": 13,
    "scoreRank": 434,
    "playerImpactRanking": 73,
    "changeRanking": 78,
    "uniqueRanking": 71,
    "communicationRanking": 55,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 4,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 1,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 37,
    "name": "墨敵賽",
    "bggName": "Vote to Decide",
    "slug": "game-37",
    "coverSlug": "vote-to-decide",
    "links": {
      "bgg": "https://www.phantasia.tw/bg/home/4097",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "卡牌驅動",
      "成套蒐集",
      "派對"
    ],
    "bggScore": 7,
    "maxPlayers": 8,
    "minPlayers": 2,
    "bggTime": 60,
    "bggDifficulty": 1.5,
    "bestPlayers": [
      5
    ],
    "recommendPlayers": [
      4,
      5,
      6
    ],
    "rankingEngine": 80,
    "classicGameRanking": 42,
    "scoreRank": 413,
    "playerImpactRanking": 71,
    "changeRanking": 61,
    "uniqueRanking": 83,
    "communicationRanking": 15,
    "likeDegree": 3,
    "changeDegree": 4,
    "communicationDegree": 5,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠",
    "changeEmoji": "🎆🎆🎆🎆"
  },
  {
    "id": 38,
    "name": "腦洞量表",
    "bggName": "Top Ten",
    "slug": "game-38",
    "coverSlug": "top-ten",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/300905/top-ten",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "派對",
      "猜謎"
    ],
    "bggScore": 7.5,
    "maxPlayers": 9,
    "minPlayers": 4,
    "bggTime": 30,
    "bggDifficulty": 1.1,
    "bestPlayers": [
      6,
      7
    ],
    "recommendPlayers": [
      5,
      6,
      7
    ],
    "rankingEngine": 100,
    "classicGameRanking": 100,
    "scoreRank": 700,
    "playerImpactRanking": 100,
    "changeRanking": 100,
    "uniqueRanking": 100,
    "communicationRanking": 100,
    "likeDegree": 3,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 1,
    "likeEmoji": "❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 39,
    "name": "冥海航跡(含擴)",
    "bggName": "Dead Reckoning",
    "slug": "game-39",
    "coverSlug": "dead-reckoning",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/276182/dead-reckoning",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "4X",
      "卡牌構築",
      "策略"
    ],
    "bggScore": 8.5,
    "maxPlayers": 4,
    "minPlayers": 1,
    "bggTime": 150,
    "bggDifficulty": 3.4,
    "bestPlayers": [
      3
    ],
    "recommendPlayers": [
      3,
      4
    ],
    "rankingEngine": 27,
    "classicGameRanking": 33,
    "scoreRank": 219,
    "playerImpactRanking": 38,
    "changeRanking": 18,
    "uniqueRanking": 42,
    "communicationRanking": 43,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 4,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 40,
    "name": "亡者神抽",
    "bggName": "Dead Man's Draw",
    "slug": "game-40",
    "coverSlug": "dead-man-s-draw",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/149155/dead-mans-draw",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "派對",
      "賭博"
    ],
    "bggScore": 6.9,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 15,
    "bggDifficulty": 1.3,
    "bestPlayers": [
      4
    ],
    "recommendPlayers": [
      3,
      4
    ],
    "rankingEngine": 87,
    "classicGameRanking": 18,
    "scoreRank": 418,
    "playerImpactRanking": 86,
    "changeRanking": 69,
    "uniqueRanking": 52,
    "communicationRanking": 37,
    "likeDegree": 3,
    "changeDegree": 4,
    "communicationDegree": 5,
    "playerImpactDegree": 3,
    "uniqueDegree": 4,
    "complexityDegree": 1,
    "likeEmoji": "❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠",
    "changeEmoji": "🎆🎆🎆🎆"
  },
  {
    "id": 41,
    "name": "關原之戰",
    "bggName": "Sekigahara: The Unification of Japan",
    "slug": "game-41",
    "coverSlug": "sekigahara-the-unification-of-japan",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/25021/sekigahara-the-unification-of-japan",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "戰棋",
      "策略",
      "袋抽"
    ],
    "bggScore": 8,
    "maxPlayers": 2,
    "minPlayers": 2,
    "bggTime": 180,
    "bggDifficulty": 2.8,
    "bestPlayers": [
      2
    ],
    "recommendPlayers": [
      2
    ],
    "rankingEngine": 23,
    "classicGameRanking": 44,
    "scoreRank": 303,
    "playerImpactRanking": 15,
    "changeRanking": 62,
    "uniqueRanking": 43,
    "communicationRanking": 54,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 4,
    "complexityDegree": 3,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆"
  },
  {
    "id": 42,
    "name": "山中小屋第三版",
    "bggName": "Betrayal at House on the Hill: 3rd Edition",
    "slug": "game-42",
    "coverSlug": "betrayal-at-house-on-the-hill-3rd-edition",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/358504/betrayal-at-house-on-the-hill-3rd-edition",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "房間探險",
      "派對",
      "美式劇情",
      "非對稱"
    ],
    "bggScore": 7.3,
    "maxPlayers": 6,
    "minPlayers": 3,
    "bggTime": 60,
    "bggDifficulty": 2.4,
    "bestPlayers": [
      5
    ],
    "recommendPlayers": [
      4,
      5,
      6
    ],
    "rankingEngine": 67,
    "classicGameRanking": 30,
    "scoreRank": 290,
    "playerImpactRanking": 61,
    "changeRanking": 15,
    "uniqueRanking": 70,
    "communicationRanking": 32,
    "likeDegree": 4,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 4,
    "uniqueDegree": 4,
    "complexityDegree": 3,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 43,
    "name": "878維京人入侵（含擴）",
    "bggName": "878 Vikings: Invasions of England",
    "slug": "game-43",
    "coverSlug": "878-vikings-invasions-of-england",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/204516/878-vikings-invasions-of-england",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "卡牌驅動",
      "戰棋",
      "策略",
      "骰子"
    ],
    "bggScore": 7.5,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 120,
    "bggDifficulty": 2.6,
    "bestPlayers": [
      2,
      4
    ],
    "recommendPlayers": [
      2,
      4
    ],
    "rankingEngine": 26,
    "classicGameRanking": 36,
    "scoreRank": 199,
    "playerImpactRanking": 9,
    "changeRanking": 33,
    "uniqueRanking": 46,
    "communicationRanking": 16,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 4,
    "complexityDegree": 3,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 44,
    "name": "Startups",
    "bggName": "Startups",
    "slug": "game-44",
    "coverSlug": "startups",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/223770/startups",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "成套蒐集",
      "策略",
      "股票"
    ],
    "bggScore": 7.2,
    "maxPlayers": 7,
    "minPlayers": 3,
    "bggTime": 20,
    "bggDifficulty": 1.6,
    "bestPlayers": [
      4
    ],
    "recommendPlayers": [
      3,
      4,
      5
    ],
    "rankingEngine": 60,
    "classicGameRanking": 38,
    "scoreRank": 356,
    "playerImpactRanking": 36,
    "changeRanking": 80,
    "uniqueRanking": 36,
    "communicationRanking": 26,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 1,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 45,
    "name": "慘劇輪迴（含擴）",
    "bggName": "Tragedy Looper",
    "slug": "game-45",
    "coverSlug": "tragedy-looper",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/148319/tragedy-looper",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "推理",
      "策略",
      "非對稱"
    ],
    "bggScore": 8.4,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 120,
    "bggDifficulty": 3.6,
    "bestPlayers": [
      4
    ],
    "recommendPlayers": [
      4
    ],
    "rankingEngine": 74,
    "classicGameRanking": 59,
    "scoreRank": 208,
    "playerImpactRanking": 17,
    "changeRanking": 2,
    "uniqueRanking": 16,
    "communicationRanking": 38,
    "likeDegree": 4,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 46,
    "name": "時空神探（含擴）",
    "bggName": "Kronologic: Paris 1920",
    "slug": "game-46",
    "coverSlug": "kronologic-paris-1920",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/402111/kronologic-paris-1920",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "推理",
      "策略"
    ],
    "bggScore": 7.8,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 30,
    "bggDifficulty": 2.6,
    "bestPlayers": [
      3
    ],
    "recommendPlayers": [
      3,
      4
    ],
    "rankingEngine": 62,
    "classicGameRanking": 17,
    "scoreRank": 274,
    "playerImpactRanking": 89,
    "changeRanking": 7,
    "uniqueRanking": 20,
    "communicationRanking": 72,
    "likeDegree": 4,
    "changeDegree": 5,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 5,
    "complexityDegree": 3,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 47,
    "name": "沙丘帝國：起義（含擴）",
    "bggName": "Dune: Imperium – Uprising",
    "slug": "game-47",
    "coverSlug": "dune-imperium-uprising",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/397598/dune-imperium-uprising",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "卡牌構築",
      "工擺",
      "爬軌",
      "策略"
    ],
    "bggScore": 8.7,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 120,
    "bggDifficulty": 3.7,
    "bestPlayers": [
      4
    ],
    "recommendPlayers": [
      3,
      4
    ],
    "rankingEngine": 53,
    "classicGameRanking": 52,
    "scoreRank": 316,
    "playerImpactRanking": 48,
    "changeRanking": 22,
    "uniqueRanking": 58,
    "communicationRanking": 61,
    "likeDegree": 4,
    "changeDegree": 5,
    "communicationDegree": 4,
    "playerImpactDegree": 4,
    "uniqueDegree": 4,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 48,
    "name": "Magical athlete",
    "bggName": "Magical athlete",
    "slug": "game-48",
    "coverSlug": "magical-athlete",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/454103/magical-athlete",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "派對",
      "賽車",
      "骰子"
    ],
    "bggScore": 7.9,
    "maxPlayers": 6,
    "minPlayers": 2,
    "bggTime": 30,
    "bggDifficulty": 1.2,
    "bestPlayers": [
      5,
      6
    ],
    "recommendPlayers": [
      4,
      5,
      6
    ],
    "rankingEngine": 76,
    "classicGameRanking": 54,
    "scoreRank": 364,
    "playerImpactRanking": 70,
    "changeRanking": 35,
    "uniqueRanking": 77,
    "communicationRanking": 17,
    "likeDegree": 3,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 4,
    "uniqueDegree": 3,
    "complexityDegree": 1,
    "likeEmoji": "❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥",
    "complexityEmoji": "🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 49,
    "name": "飛塔巫師",
    "bggName": "Wandering Towers",
    "slug": "game-49",
    "coverSlug": "wandering-towers",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/355483/wandering-towers",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "派對",
      "記憶"
    ],
    "bggScore": 7.3,
    "maxPlayers": 6,
    "minPlayers": 2,
    "bggTime": 30,
    "bggDifficulty": 1.6,
    "bestPlayers": [
      4,
      5
    ],
    "recommendPlayers": [
      4,
      5
    ],
    "rankingEngine": 88,
    "classicGameRanking": 57,
    "scoreRank": 427,
    "playerImpactRanking": 72,
    "changeRanking": 70,
    "uniqueRanking": 49,
    "communicationRanking": 21,
    "likeDegree": 3,
    "changeDegree": 4,
    "communicationDegree": 5,
    "playerImpactDegree": 3,
    "uniqueDegree": 4,
    "complexityDegree": 1,
    "likeEmoji": "❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠",
    "changeEmoji": "🎆🎆🎆🎆"
  },
  {
    "id": 50,
    "name": "掌握時刻",
    "bggName": "Take Time",
    "slug": "game-50",
    "coverSlug": "take-time",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/440540/take-time",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "合作",
      "策略"
    ],
    "bggScore": 7.8,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 30,
    "bggDifficulty": 1.8,
    "bestPlayers": [
      3,
      4
    ],
    "recommendPlayers": [
      3,
      4
    ],
    "rankingEngine": 84,
    "classicGameRanking": 34,
    "scoreRank": 248,
    "playerImpactRanking": 55,
    "changeRanking": 13,
    "uniqueRanking": 30,
    "communicationRanking": 19,
    "likeDegree": 3,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 4,
    "uniqueDegree": 5,
    "complexityDegree": 2,
    "likeEmoji": "❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 51,
    "name": "一智千金",
    "bggName": "Wits & Wagers",
    "slug": "game-51",
    "coverSlug": "wits-wagers",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/20100/wits-and-wagers",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "派對",
      "猜謎",
      "賭博"
    ],
    "bggScore": 6.9,
    "maxPlayers": 7,
    "minPlayers": 3,
    "bggTime": 25,
    "bggDifficulty": 1.2,
    "bestPlayers": [
      6,
      7
    ],
    "recommendPlayers": [
      4,
      5,
      6,
      7
    ],
    "rankingEngine": 52,
    "classicGameRanking": 16,
    "scoreRank": 332,
    "playerImpactRanking": 82,
    "changeRanking": 83,
    "uniqueRanking": 7,
    "communicationRanking": 9,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 5,
    "playerImpactDegree": 3,
    "uniqueDegree": 5,
    "complexityDegree": 1,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 52,
    "name": "姬路城（含擴）",
    "bggName": "The White Castle",
    "slug": "game-52",
    "coverSlug": "the-white-castle",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/371942/the-white-castle",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "引擎構築",
      "爬軌",
      "策略",
      "骰放"
    ],
    "bggScore": 8.4,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 110,
    "bggDifficulty": 3.3,
    "bestPlayers": [
      2,
      3
    ],
    "recommendPlayers": [
      2,
      3
    ],
    "rankingEngine": 29,
    "classicGameRanking": 51,
    "scoreRank": 352,
    "playerImpactRanking": 43,
    "changeRanking": 39,
    "uniqueRanking": 72,
    "communicationRanking": 79,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 3,
    "playerImpactDegree": 4,
    "uniqueDegree": 3,
    "complexityDegree": 4,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 53,
    "name": "女巫的佳釀",
    "bggName": "Witch's Brew",
    "slug": "game-53",
    "coverSlug": "witch-s-brew",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/34084/witchs-brew",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "撞車",
      "派對"
    ],
    "bggScore": 7,
    "maxPlayers": 5,
    "minPlayers": 3,
    "bggTime": 60,
    "bggDifficulty": 1.9,
    "bestPlayers": [
      5
    ],
    "recommendPlayers": [
      4,
      5
    ],
    "rankingEngine": 77,
    "classicGameRanking": 28,
    "scoreRank": 357,
    "playerImpactRanking": 31,
    "changeRanking": 88,
    "uniqueRanking": 34,
    "communicationRanking": 11,
    "likeDegree": 3,
    "changeDegree": 3,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 2,
    "likeEmoji": "❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 54,
    "name": "上洛",
    "bggName": "Joraku",
    "slug": "game-54",
    "coverSlug": "joraku",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/180901/joraku",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "區控",
      "吃墩",
      "策略"
    ],
    "bggScore": 7.2,
    "maxPlayers": 4,
    "minPlayers": 3,
    "bggTime": 60,
    "bggDifficulty": 2.2,
    "bestPlayers": [
      4
    ],
    "recommendPlayers": [
      3,
      4
    ],
    "rankingEngine": 47,
    "classicGameRanking": 67,
    "scoreRank": 358,
    "playerImpactRanking": 26,
    "changeRanking": 72,
    "uniqueRanking": 21,
    "communicationRanking": 53,
    "likeDegree": 5,
    "changeDegree": 3,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 2,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 55,
    "name": "仙境幽谷 銀霜國度",
    "bggName": "Everdell Silverfrost",
    "slug": "game-55",
    "coverSlug": "everdell-silverfrost",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/436821/everdell-silverfrost",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "卡牌驅動",
      "工擺",
      "引擎構築",
      "策略"
    ],
    "bggScore": 8.1,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 120,
    "bggDifficulty": 3.2,
    "bestPlayers": [
      3
    ],
    "recommendPlayers": [
      2,
      3
    ],
    "rankingEngine": 46,
    "classicGameRanking": 73,
    "scoreRank": 449,
    "playerImpactRanking": 75,
    "changeRanking": 46,
    "uniqueRanking": 79,
    "communicationRanking": 84,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 4,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆"
  },
  {
    "id": 56,
    "name": "王都布拉格",
    "bggName": "Praga Caput Regni",
    "slug": "game-56",
    "coverSlug": "praga-caput-regni",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/308765/praga-caput-regni",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "區控",
      "拼圖",
      "爬軌",
      "策略",
      "輪盤"
    ],
    "bggScore": 7.8,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 150,
    "bggDifficulty": 3.7,
    "bestPlayers": [
      3
    ],
    "recommendPlayers": [
      2,
      3,
      4
    ],
    "rankingEngine": 50,
    "classicGameRanking": 78,
    "scoreRank": 398,
    "playerImpactRanking": 44,
    "changeRanking": 49,
    "uniqueRanking": 60,
    "communicationRanking": 68,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 4,
    "playerImpactDegree": 4,
    "uniqueDegree": 4,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆"
  },
  {
    "id": 57,
    "name": "我與惡魔有個交易",
    "bggName": "Deal with the Devil",
    "slug": "game-57",
    "coverSlug": "deal-with-the-devil",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/367379/deal-with-the-devil",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "引擎構築",
      "策略",
      "表決",
      "談判",
      "資源轉換"
    ],
    "bggScore": 7.1,
    "maxPlayers": 4,
    "minPlayers": 4,
    "bggTime": 150,
    "bggDifficulty": 3.7,
    "bestPlayers": [
      4
    ],
    "recommendPlayers": [
      4
    ],
    "rankingEngine": 43,
    "classicGameRanking": 65,
    "scoreRank": 345,
    "playerImpactRanking": 49,
    "changeRanking": 59,
    "uniqueRanking": 24,
    "communicationRanking": 46,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 4,
    "playerImpactDegree": 4,
    "uniqueDegree": 5,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆"
  },
  {
    "id": 58,
    "name": "卓越的羅倫佐",
    "bggName": "Lorenzo il Magnifico: Big Box",
    "slug": "game-58",
    "coverSlug": "lorenzo-il-magnifico-big-box",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/338476/lorenzo-il-magnifico-big-box",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "引擎構築",
      "策略",
      "骰放"
    ],
    "bggScore": 8.4,
    "maxPlayers": 5,
    "minPlayers": 2,
    "bggTime": 120,
    "bggDifficulty": 3.4,
    "bestPlayers": [
      3,
      4
    ],
    "recommendPlayers": [
      2,
      3,
      4
    ],
    "rankingEngine": 12,
    "classicGameRanking": 49,
    "scoreRank": 279,
    "playerImpactRanking": 41,
    "changeRanking": 30,
    "uniqueRanking": 40,
    "communicationRanking": 77,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 3,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 4,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 59,
    "name": "天際礦脈",
    "bggName": "Skymines",
    "slug": "game-59",
    "coverSlug": "skymines",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/359438/skymines",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "區控",
      "爬軌",
      "策略",
      "編程",
      "股票"
    ],
    "bggScore": 7.9,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 150,
    "bggDifficulty": 3.9,
    "bestPlayers": [
      4
    ],
    "recommendPlayers": [
      3,
      4
    ],
    "rankingEngine": 51,
    "classicGameRanking": 76,
    "scoreRank": 336,
    "playerImpactRanking": 34,
    "changeRanking": 40,
    "uniqueRanking": 33,
    "communicationRanking": 62,
    "likeDegree": 4,
    "changeDegree": 5,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 60,
    "name": "馬拉開波海盜（含擴）",
    "bggName": "Pirates of Maracaibo",
    "slug": "game-60",
    "coverSlug": "pirates-of-maracaibo",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/397385/pirates-of-maracaibo",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "引擎構築",
      "策略",
      "股票",
      "路徑移動",
      "骰子"
    ],
    "bggScore": 8.5,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 110,
    "bggDifficulty": 3.1,
    "bestPlayers": [
      3
    ],
    "recommendPlayers": [
      2,
      3,
      4
    ],
    "rankingEngine": 33,
    "classicGameRanking": 55,
    "scoreRank": 299,
    "playerImpactRanking": 21,
    "changeRanking": 34,
    "uniqueRanking": 64,
    "communicationRanking": 58,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 4,
    "complexityDegree": 4,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 61,
    "name": "心領神繪",
    "bggName": "Doodle Dash",
    "slug": "game-61",
    "coverSlug": "doodle-dash",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/334379/doodle-dash",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "派對",
      "畫畫"
    ],
    "bggScore": 7.3,
    "maxPlayers": 7,
    "minPlayers": 3,
    "bggTime": 20,
    "bggDifficulty": 1,
    "bestPlayers": [
      5,
      6,
      7
    ],
    "recommendPlayers": [
      4,
      5,
      6,
      7
    ],
    "rankingEngine": 39,
    "classicGameRanking": 89,
    "scoreRank": 473,
    "playerImpactRanking": 85,
    "changeRanking": 84,
    "uniqueRanking": 86,
    "communicationRanking": 6,
    "likeDegree": 5,
    "changeDegree": 3,
    "communicationDegree": 5,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 1,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 62,
    "name": "月球南極基地",
    "bggName": "Shackleton Base: A Journey to the Moon",
    "slug": "game-62",
    "coverSlug": "shackleton-base-a-journey-to-the-moon",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/408180/shackleton-base-a-journey-to-the-moon",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "區控",
      "卡牌驅動",
      "工擺",
      "爬軌",
      "策略"
    ],
    "bggScore": 8,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 120,
    "bggDifficulty": 3.9,
    "bestPlayers": [
      3
    ],
    "recommendPlayers": [
      3
    ],
    "rankingEngine": 20,
    "classicGameRanking": 66,
    "scoreRank": 262,
    "playerImpactRanking": 28,
    "changeRanking": 14,
    "uniqueRanking": 45,
    "communicationRanking": 75,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 3,
    "playerImpactDegree": 5,
    "uniqueDegree": 4,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 63,
    "name": "馬拉喀什",
    "bggName": "Marrakesh",
    "slug": "game-63",
    "coverSlug": "marrakesh",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/342810/marrakesh",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "爬軌",
      "策略",
      "編程"
    ],
    "bggScore": 8.1,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 120,
    "bggDifficulty": 3.5,
    "bestPlayers": [
      3
    ],
    "recommendPlayers": [
      3
    ],
    "rankingEngine": 14,
    "classicGameRanking": 61,
    "scoreRank": 334,
    "playerImpactRanking": 39,
    "changeRanking": 57,
    "uniqueRanking": 23,
    "communicationRanking": 83,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 3,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆"
  },
  {
    "id": 64,
    "name": "冷冷的她在醒來之前",
    "bggName": "冷たい彼女が目覚める前に (Embalming Girl)",
    "slug": "game-64",
    "coverSlug": "冷たい彼女か目覚める前に-embalming-girl",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/326054/leng-taibi-nu-gamu-jue-meruqian-ni-embalming-girl/ratings?comment=1",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "卡牌驅動",
      "陣營"
    ],
    "bggScore": 6.9,
    "maxPlayers": 6,
    "minPlayers": 3,
    "bggTime": 10,
    "bggDifficulty": 1.6,
    "bestPlayers": [
      5
    ],
    "recommendPlayers": [
      4,
      5,
      6
    ],
    "rankingEngine": 49,
    "classicGameRanking": 56,
    "scoreRank": 410,
    "playerImpactRanking": 63,
    "changeRanking": 74,
    "uniqueRanking": 59,
    "communicationRanking": 35,
    "likeDegree": 5,
    "changeDegree": 3,
    "communicationDegree": 5,
    "playerImpactDegree": 4,
    "uniqueDegree": 4,
    "complexityDegree": 1,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥",
    "complexityEmoji": "🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 65,
    "name": "新月戰記",
    "bggName": "Crescent Moon",
    "slug": "game-65",
    "coverSlug": "crescent-moon",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/348073/crescent-moon",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "卡牌驅動",
      "戰棋",
      "策略",
      "非對稱"
    ],
    "bggScore": 7.1,
    "maxPlayers": 5,
    "minPlayers": 4,
    "bggTime": 180,
    "bggDifficulty": 3.7,
    "bestPlayers": [
      5
    ],
    "recommendPlayers": [
      4,
      5
    ],
    "rankingEngine": 36,
    "classicGameRanking": 64,
    "scoreRank": 222,
    "playerImpactRanking": 14,
    "changeRanking": 32,
    "uniqueRanking": 19,
    "communicationRanking": 25,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 66,
    "name": "Lure",
    "bggName": "Lure",
    "slug": "game-66",
    "coverSlug": "lure",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/415780/lure",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "派對",
      "競標",
      "骰子"
    ],
    "bggScore": 6.8,
    "maxPlayers": 5,
    "minPlayers": 2,
    "bggTime": 15,
    "bggDifficulty": 1.2,
    "bestPlayers": [
      4
    ],
    "recommendPlayers": [
      3,
      4,
      5
    ],
    "rankingEngine": 78,
    "classicGameRanking": 27,
    "scoreRank": 456,
    "playerImpactRanking": 84,
    "changeRanking": 82,
    "uniqueRanking": 76,
    "communicationRanking": 27,
    "likeDegree": 3,
    "changeDegree": 3,
    "communicationDegree": 5,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 1,
    "likeEmoji": "❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 67,
    "name": "天堂與美酒大盒版",
    "bggName": "Heaven & Ale",
    "slug": "game-67",
    "coverSlug": "heaven-ale",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/227789/heaven-and-ale",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "拼圖",
      "爬軌",
      "策略",
      "路徑移動"
    ],
    "bggScore": 7.5,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 90,
    "bggDifficulty": 3.2,
    "bestPlayers": [
      4
    ],
    "recommendPlayers": [
      3,
      4
    ],
    "rankingEngine": 48,
    "classicGameRanking": 82,
    "scoreRank": 390,
    "playerImpactRanking": 24,
    "changeRanking": 60,
    "uniqueRanking": 38,
    "communicationRanking": 78,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 3,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 4,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆"
  },
  {
    "id": 68,
    "name": "onward(含擴)",
    "bggName": "onward",
    "slug": "game-68",
    "coverSlug": "onward",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/431929/onward",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "MOBA",
      "卡牌驅動",
      "策略"
    ],
    "bggScore": 8.5,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 90,
    "bggDifficulty": 3.1,
    "bestPlayers": [
      2
    ],
    "recommendPlayers": [
      2
    ],
    "rankingEngine": 50.5,
    "classicGameRanking": 90.5,
    "scoreRank": 593.5,
    "playerImpactRanking": 90.5,
    "changeRanking": 90.5,
    "uniqueRanking": 90.5,
    "communicationRanking": 90.5,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 4,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 69,
    "name": "for the gods!",
    "bggName": "For the Gods!",
    "slug": "game-69",
    "coverSlug": "for-the-gods",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/444234/for-the-gods",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "區控",
      "策略",
      "袋抽"
    ],
    "bggScore": 7.4,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 60,
    "bggDifficulty": 2.3,
    "bestPlayers": [
      3,
      4
    ],
    "recommendPlayers": [
      3,
      4
    ],
    "rankingEngine": 50.5,
    "classicGameRanking": 90.5,
    "scoreRank": 593.5,
    "playerImpactRanking": 90.5,
    "changeRanking": 90.5,
    "uniqueRanking": 90.5,
    "communicationRanking": 90.5,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 3,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 70,
    "name": "留里克(含擴)",
    "bggName": "Rurik: Second Edition",
    "slug": "game-70",
    "coverSlug": "rurik-second-edition",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/460097/rurik-second-edition",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "區控",
      "競標",
      "策略",
      "編程"
    ],
    "bggScore": 8.1,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 140,
    "bggDifficulty": 3.1,
    "bestPlayers": [
      3,
      4
    ],
    "recommendPlayers": [
      3,
      4
    ],
    "rankingEngine": 44,
    "classicGameRanking": 80,
    "scoreRank": 300,
    "playerImpactRanking": 10,
    "changeRanking": 47,
    "uniqueRanking": 22,
    "communicationRanking": 50,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 4,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆"
  },
  {
    "id": 71,
    "name": "北境之地（含擴）",
    "bggName": "Northgard: Uncharted Lands",
    "slug": "game-71",
    "coverSlug": "northgard-uncharted-lands",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/274124/northgard-uncharted-lands",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "4X",
      "卡牌構築",
      "策略"
    ],
    "bggScore": 8.2,
    "maxPlayers": 5,
    "minPlayers": 2,
    "bggTime": 90,
    "bggDifficulty": 2.8,
    "bestPlayers": [
      4
    ],
    "recommendPlayers": [
      3,
      4,
      5
    ],
    "rankingEngine": 58,
    "classicGameRanking": 71,
    "scoreRank": 326,
    "playerImpactRanking": 37,
    "changeRanking": 24,
    "uniqueRanking": 65,
    "communicationRanking": 47,
    "likeDegree": 4,
    "changeDegree": 5,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 4,
    "complexityDegree": 3,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 72,
    "name": "戰場軍需官 WW2(含擴)",
    "bggName": "Quartermaster General WW2: 2nd Edition",
    "slug": "game-72",
    "coverSlug": "quartermaster-general-ww2-2nd-edition",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/331979/quartermaster-general-ww2-2nd-edition",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "卡牌驅動",
      "戰棋",
      "策略"
    ],
    "bggScore": 8.2,
    "maxPlayers": 6,
    "minPlayers": 2,
    "bggTime": 120,
    "bggDifficulty": 3,
    "bestPlayers": [
      6
    ],
    "recommendPlayers": [
      6
    ],
    "rankingEngine": 17,
    "classicGameRanking": 40,
    "scoreRank": 187,
    "playerImpactRanking": 30,
    "changeRanking": 20,
    "uniqueRanking": 29,
    "communicationRanking": 31,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 4,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 73,
    "name": "期貨時代",
    "bggName": "The Rich and the Good",
    "slug": "game-73",
    "coverSlug": "the-rich-and-the-good",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/38863/the-rich-and-the-good",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "策略",
      "股票"
    ],
    "bggScore": 7.1,
    "maxPlayers": 5,
    "minPlayers": 3,
    "bggTime": 45,
    "bggDifficulty": 2.2,
    "bestPlayers": [
      4
    ],
    "recommendPlayers": [
      3,
      4,
      5
    ],
    "rankingEngine": 82,
    "classicGameRanking": 84,
    "scoreRank": 429,
    "playerImpactRanking": 23,
    "changeRanking": 81,
    "uniqueRanking": 56,
    "communicationRanking": 22,
    "likeDegree": 3,
    "changeDegree": 3,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 4,
    "complexityDegree": 2,
    "likeEmoji": "❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 74,
    "name": "看版EV",
    "bggName": "Kanban EV",
    "slug": "game-74",
    "coverSlug": "kanban-ev",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/284378/kanban-ev",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "工擺",
      "懲罰",
      "爬軌",
      "策略"
    ],
    "bggScore": 8.4,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 180,
    "bggDifficulty": 4.3,
    "bestPlayers": [
      3
    ],
    "recommendPlayers": [
      3,
      4
    ],
    "rankingEngine": 15,
    "classicGameRanking": 69,
    "scoreRank": 280,
    "playerImpactRanking": 18,
    "changeRanking": 50,
    "uniqueRanking": 4,
    "communicationRanking": 74,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 3,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆"
  },
  {
    "id": 75,
    "name": "卡內基(含擴)",
    "bggName": "Carnegie",
    "slug": "game-75",
    "coverSlug": "carnegie",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/310873/carnegie",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "區控",
      "引擎構築",
      "爬軌",
      "策略",
      "跟隨"
    ],
    "bggScore": 3.8,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 180,
    "bggDifficulty": 3.8,
    "bestPlayers": [
      4
    ],
    "recommendPlayers": [
      3,
      4
    ],
    "rankingEngine": 18,
    "classicGameRanking": 50,
    "scoreRank": 219,
    "playerImpactRanking": 4,
    "changeRanking": 36,
    "uniqueRanking": 8,
    "communicationRanking": 67,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 76,
    "name": "Pulsar 2849",
    "bggName": "Pulsar 2849",
    "slug": "game-76",
    "coverSlug": "pulsar-2849",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/228341/pulsar-2849",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "區控",
      "策略",
      "骰放"
    ],
    "bggScore": 7.6,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 90,
    "bggDifficulty": 3.3,
    "bestPlayers": [
      4
    ],
    "recommendPlayers": [
      3,
      4
    ],
    "rankingEngine": 24,
    "classicGameRanking": 63,
    "scoreRank": 350,
    "playerImpactRanking": 42,
    "changeRanking": 41,
    "uniqueRanking": 66,
    "communicationRanking": 73,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 3,
    "playerImpactDegree": 5,
    "uniqueDegree": 4,
    "complexityDegree": 4,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 77,
    "name": "財閥（含擴）",
    "bggName": "Nippon: Zaibatsu",
    "slug": "game-77",
    "coverSlug": "nippon-zaibatsu",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/434367/nippon-zaibatsu",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "區控",
      "工擺",
      "爬軌",
      "策略"
    ],
    "bggScore": 8.6,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 120,
    "bggDifficulty": 3.6,
    "bestPlayers": [
      4
    ],
    "recommendPlayers": [
      3,
      4
    ],
    "rankingEngine": 50.5,
    "classicGameRanking": 90.5,
    "scoreRank": 593.5,
    "playerImpactRanking": 90.5,
    "changeRanking": 90.5,
    "uniqueRanking": 90.5,
    "communicationRanking": 90.5,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 78,
    "name": "Cuzco",
    "bggName": "Cuzco",
    "slug": "game-78",
    "coverSlug": "cuzco",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/368975/cuzco",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "工擺",
      "成套蒐集",
      "策略",
      "骰放"
    ],
    "bggScore": 7.8,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 120,
    "bggDifficulty": 3.5,
    "bestPlayers": [
      3
    ],
    "recommendPlayers": [
      3
    ],
    "rankingEngine": 8,
    "classicGameRanking": 45,
    "scoreRank": 247,
    "playerImpactRanking": 16,
    "changeRanking": 53,
    "uniqueRanking": 6,
    "communicationRanking": 66,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆"
  },
  {
    "id": 79,
    "name": "華倫斯坦大盒版",
    "bggName": "Wallenstein Big Box",
    "slug": "game-79",
    "coverSlug": "wallenstein-big-box",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/206236/wallenstein-big-box",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "戰棋",
      "競標",
      "策略",
      "編程"
    ],
    "bggScore": 7.8,
    "maxPlayers": 5,
    "minPlayers": 3,
    "bggTime": 120,
    "bggDifficulty": 3.5,
    "bestPlayers": [
      5
    ],
    "recommendPlayers": [
      4,
      5
    ],
    "rankingEngine": 55,
    "classicGameRanking": 62,
    "scoreRank": 353,
    "playerImpactRanking": 35,
    "changeRanking": 51,
    "uniqueRanking": 57,
    "communicationRanking": 42,
    "likeDegree": 4,
    "changeDegree": 4,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 4,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆"
  },
  {
    "id": 80,
    "name": "塞西亞掠奪者",
    "bggName": "Raiders of Scythia",
    "slug": "game-80",
    "coverSlug": "raiders-of-scythia",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/301880/raiders-of-scythia",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "卡牌驅動",
      "工擺",
      "引擎構築",
      "策略",
      "資源轉換"
    ],
    "bggScore": 7.7,
    "maxPlayers": 4,
    "minPlayers": 3,
    "bggTime": 80,
    "bggDifficulty": 2.8,
    "bestPlayers": [
      3
    ],
    "recommendPlayers": [
      2,
      3
    ],
    "rankingEngine": 69,
    "classicGameRanking": 58,
    "scoreRank": 426,
    "playerImpactRanking": 67,
    "changeRanking": 52,
    "uniqueRanking": 63,
    "communicationRanking": 65,
    "likeDegree": 4,
    "changeDegree": 4,
    "communicationDegree": 4,
    "playerImpactDegree": 4,
    "uniqueDegree": 4,
    "complexityDegree": 3,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆"
  },
  {
    "id": 81,
    "name": "大五月花號(含擴)",
    "bggName": "Keyflower",
    "slug": "game-81",
    "coverSlug": "keyflower",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/122515/keyflower",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "工擺",
      "拼圖",
      "競標",
      "策略",
      "資源轉換"
    ],
    "bggScore": 8,
    "maxPlayers": 6,
    "minPlayers": 2,
    "bggTime": 120,
    "bggDifficulty": 3.3,
    "bestPlayers": [
      2,
      4
    ],
    "recommendPlayers": [
      2,
      3,
      4
    ],
    "rankingEngine": 45,
    "classicGameRanking": 70,
    "scoreRank": 231,
    "playerImpactRanking": 7,
    "changeRanking": 17,
    "uniqueRanking": 26,
    "communicationRanking": 49,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 4,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 82,
    "name": "蓋亞計劃（含擴）",
    "bggName": "Gaia Project",
    "slug": "game-82",
    "coverSlug": "gaia-project",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/220308/gaia-project",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "區控",
      "爬軌",
      "策略",
      "資源轉換"
    ],
    "bggScore": 8.9,
    "maxPlayers": 4,
    "minPlayers": 3,
    "bggTime": 150,
    "bggDifficulty": 4.5,
    "bestPlayers": [
      3,
      4
    ],
    "recommendPlayers": [
      3,
      4
    ],
    "rankingEngine": 21,
    "classicGameRanking": 68,
    "scoreRank": 254,
    "playerImpactRanking": 52,
    "changeRanking": 10,
    "uniqueRanking": 17,
    "communicationRanking": 76,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 3,
    "playerImpactDegree": 4,
    "uniqueDegree": 5,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 83,
    "name": "奧丁的盛宴(含擴)",
    "bggName": "A Feast for Odin",
    "slug": "game-83",
    "coverSlug": "a-feast-for-odin",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/177736/a-feast-for-odin",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "卡牌驅動",
      "工擺",
      "引擎構築",
      "拼圖",
      "策略"
    ],
    "bggScore": 8.9,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 120,
    "bggDifficulty": 4,
    "bestPlayers": [
      2,
      3
    ],
    "recommendPlayers": [
      2,
      3
    ],
    "rankingEngine": 22,
    "classicGameRanking": 72,
    "scoreRank": 302,
    "playerImpactRanking": 66,
    "changeRanking": 21,
    "uniqueRanking": 13,
    "communicationRanking": 87,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 3,
    "playerImpactDegree": 4,
    "uniqueDegree": 5,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 84,
    "name": "Rock swap flip flop",
    "bggName": "Rock Swap Flip-Flop",
    "slug": "game-84",
    "coverSlug": "rock-swap-flip-flop",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/448476/rock-swap-flip-flop",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "動作",
      "派對"
    ],
    "bggScore": 6.2,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 15,
    "bggDifficulty": 1,
    "bestPlayers": [
      3,
      4
    ],
    "recommendPlayers": [
      3,
      4
    ],
    "rankingEngine": 89,
    "classicGameRanking": 43,
    "scoreRank": 438,
    "playerImpactRanking": 83,
    "changeRanking": 87,
    "uniqueRanking": 39,
    "communicationRanking": 10,
    "likeDegree": 3,
    "changeDegree": 3,
    "communicationDegree": 5,
    "playerImpactDegree": 3,
    "uniqueDegree": 5,
    "complexityDegree": 1,
    "likeEmoji": "❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 85,
    "name": "葡萄酒莊園(含擴)",
    "bggName": "Viticulture Essential Edition",
    "slug": "game-85",
    "coverSlug": "viticulture-essential-edition",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/183394/viticulture-essential-edition",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "區控",
      "卡牌驅動",
      "工擺",
      "策略",
      "資源轉換"
    ],
    "bggScore": 8.6,
    "maxPlayers": 6,
    "minPlayers": 2,
    "bggTime": 120,
    "bggDifficulty": 3.3,
    "bestPlayers": [
      4
    ],
    "recommendPlayers": [
      3,
      4
    ],
    "rankingEngine": 54,
    "classicGameRanking": 86,
    "scoreRank": 387,
    "playerImpactRanking": 47,
    "changeRanking": 26,
    "uniqueRanking": 68,
    "communicationRanking": 80,
    "likeDegree": 4,
    "changeDegree": 5,
    "communicationDegree": 3,
    "playerImpactDegree": 4,
    "uniqueDegree": 4,
    "complexityDegree": 4,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 86,
    "name": "卓爾金歷（含擴）",
    "bggName": "Tzolk'in: The Mayan Calendar",
    "slug": "game-86",
    "coverSlug": "tzolk-in-the-mayan-calendar",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/126163/tzolkin-the-mayan-calendar",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "工擺",
      "爬軌",
      "策略",
      "輪盤"
    ],
    "bggScore": 8.1,
    "maxPlayers": 5,
    "minPlayers": 2,
    "bggTime": 90,
    "bggDifficulty": 3.6,
    "bestPlayers": [
      3,
      4
    ],
    "recommendPlayers": [
      2,
      3,
      4
    ],
    "rankingEngine": 31,
    "classicGameRanking": 79,
    "scoreRank": 295,
    "playerImpactRanking": 51,
    "changeRanking": 25,
    "uniqueRanking": 3,
    "communicationRanking": 81,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 3,
    "playerImpactDegree": 4,
    "uniqueDegree": 5,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 87,
    "name": "月海礦場",
    "bggName": "Luna Maris",
    "slug": "game-87",
    "coverSlug": "luna-maris",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/319392/luna-maris",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "卡牌驅動",
      "策略",
      "資源轉換",
      "路徑移動"
    ],
    "bggScore": 7.7,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 120,
    "bggDifficulty": 3.5,
    "bestPlayers": [
      4
    ],
    "recommendPlayers": [
      2,
      3,
      4
    ],
    "rankingEngine": 56,
    "classicGameRanking": 74,
    "scoreRank": 442,
    "playerImpactRanking": 53,
    "changeRanking": 67,
    "uniqueRanking": 55,
    "communicationRanking": 70,
    "likeDegree": 4,
    "changeDegree": 4,
    "communicationDegree": 4,
    "playerImpactDegree": 4,
    "uniqueDegree": 4,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆"
  },
  {
    "id": 88,
    "name": "台灣夜市",
    "bggName": "Taiwan Night Market",
    "slug": "game-88",
    "coverSlug": "taiwan-night-market",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/367201/taiwan-night-market",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "競標",
      "策略"
    ],
    "bggScore": 7,
    "maxPlayers": 5,
    "minPlayers": 2,
    "bggTime": 80,
    "bggDifficulty": 2.4,
    "bestPlayers": [
      4
    ],
    "recommendPlayers": [
      3,
      4
    ],
    "rankingEngine": 42,
    "classicGameRanking": 81,
    "scoreRank": 345,
    "playerImpactRanking": 6,
    "changeRanking": 64,
    "uniqueRanking": 47,
    "communicationRanking": 41,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 4,
    "complexityDegree": 3,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆"
  },
  {
    "id": 89,
    "name": "太陽之子",
    "bggName": "Ayar: Children of the Sun",
    "slug": "game-89",
    "coverSlug": "ayar-children-of-the-sun",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/429438/ayar-children-of-the-sun",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "抽象棋",
      "策略",
      "路徑移動"
    ],
    "bggScore": 7.9,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 90,
    "bggDifficulty": 3.3,
    "bestPlayers": [
      3
    ],
    "recommendPlayers": [
      3,
      4
    ],
    "rankingEngine": 50.5,
    "classicGameRanking": 90.5,
    "scoreRank": 593.5,
    "playerImpactRanking": 90.5,
    "changeRanking": 90.5,
    "uniqueRanking": 90.5,
    "communicationRanking": 90.5,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 4,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 90,
    "name": "新墓散櫻亂舞再演(含擴)",
    "bggName": "新幕 桜降る代に決闘を 基本セット (A Duel for Falling Cherry Blossoms: New Act – Basic Set)",
    "slug": "game-90",
    "coverSlug": "新幕-桜降る代に決闘を-基本セット-a-duel-for-falling-cherry-blossoms-new-act-basic-set",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/304042/xin-mu-ying-jiang-rudai-nijue-dou-wo-ji-ben-setsut",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "卡牌驅動",
      "策略"
    ],
    "bggScore": 8.8,
    "maxPlayers": 2,
    "minPlayers": 2,
    "bggTime": 20,
    "bggDifficulty": 3.5,
    "bestPlayers": [
      2
    ],
    "recommendPlayers": [
      2
    ],
    "rankingEngine": 50.5,
    "classicGameRanking": 90.5,
    "scoreRank": 593.5,
    "playerImpactRanking": 90.5,
    "changeRanking": 90.5,
    "uniqueRanking": 90.5,
    "communicationRanking": 90.5,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 91,
    "name": "七大奇蹟對決(含擴)",
    "bggName": "7 Wonders Duel",
    "slug": "game-91",
    "coverSlug": "7-wonders-duel",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/173346/7-wonders-duel",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "引擎構築",
      "策略",
      "資源轉換"
    ],
    "bggScore": 8.1,
    "maxPlayers": 2,
    "minPlayers": 2,
    "bggTime": 30,
    "bggDifficulty": 2.9,
    "bestPlayers": [
      2
    ],
    "recommendPlayers": [
      2
    ],
    "rankingEngine": 75,
    "classicGameRanking": 87,
    "scoreRank": 407,
    "playerImpactRanking": 19,
    "changeRanking": 42,
    "uniqueRanking": 85,
    "communicationRanking": 57,
    "likeDegree": 4,
    "changeDegree": 5,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 3,
    "complexityDegree": 4,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 92,
    "name": "太空議會",
    "bggName": "Federation",
    "slug": "game-92",
    "coverSlug": "federation",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/345868/federation",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "工擺",
      "投票",
      "爬軌",
      "策略"
    ],
    "bggScore": 7.8,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 120,
    "bggDifficulty": 3.8,
    "bestPlayers": [
      4
    ],
    "recommendPlayers": [
      4
    ],
    "rankingEngine": 40,
    "classicGameRanking": 85,
    "scoreRank": 382,
    "playerImpactRanking": 29,
    "changeRanking": 54,
    "uniqueRanking": 51,
    "communicationRanking": 69,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 4,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆"
  },
  {
    "id": 93,
    "name": "達爾文之旅(含擴)",
    "bggName": "Darwin's Journey",
    "slug": "game-93",
    "coverSlug": "darwin-s-journey",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/322289/darwins-journey",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "工擺",
      "爬軌",
      "策略",
      "編程"
    ],
    "bggScore": 8.1,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 120,
    "bggDifficulty": 4.2,
    "bestPlayers": [
      3
    ],
    "recommendPlayers": [
      2,
      3
    ],
    "rankingEngine": 13,
    "classicGameRanking": 77,
    "scoreRank": 304,
    "playerImpactRanking": 50,
    "changeRanking": 19,
    "uniqueRanking": 41,
    "communicationRanking": 85,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 3,
    "playerImpactDegree": 4,
    "uniqueDegree": 5,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 94,
    "name": "帕米爾和平",
    "bggName": "Pax Pamir: Second Edition",
    "slug": "game-94",
    "coverSlug": "pax-pamir-second-edition",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/256960/pax-pamir-second-edition",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "區控",
      "卡牌驅動",
      "策略",
      "經濟"
    ],
    "bggScore": 8.1,
    "maxPlayers": 5,
    "minPlayers": 2,
    "bggTime": 120,
    "bggDifficulty": 3.8,
    "bestPlayers": [
      4
    ],
    "recommendPlayers": [
      3,
      4
    ],
    "rankingEngine": 70,
    "classicGameRanking": 60,
    "scoreRank": 284,
    "playerImpactRanking": 12,
    "changeRanking": 45,
    "uniqueRanking": 28,
    "communicationRanking": 24,
    "likeDegree": 4,
    "changeDegree": 4,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆"
  },
  {
    "id": 95,
    "name": "權力的遊戲(含擴)",
    "bggName": "A Game of Thrones: The Board Game (Second Edition)",
    "slug": "game-95",
    "coverSlug": "a-game-of-thrones-the-board-game-second-edition",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/103343/a-game-of-thrones-the-board-game-second-edition",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "區控",
      "卡牌驅動",
      "競標",
      "策略"
    ],
    "bggScore": 3.9,
    "maxPlayers": 8,
    "minPlayers": 3,
    "bggTime": 240,
    "bggDifficulty": 3.9,
    "bestPlayers": [
      6
    ],
    "recommendPlayers": [
      6,
      7,
      8
    ],
    "rankingEngine": 50.5,
    "classicGameRanking": 90.5,
    "scoreRank": 593.5,
    "playerImpactRanking": 90.5,
    "changeRanking": 90.5,
    "uniqueRanking": 90.5,
    "communicationRanking": 90.5,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 96,
    "name": "罪案疑雲",
    "bggName": "Detective: City of Angels",
    "slug": "game-96",
    "coverSlug": "detective-city-of-angels",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/218074/detective-city-of-angels",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "推理",
      "策略"
    ],
    "bggScore": 7.8,
    "maxPlayers": 5,
    "minPlayers": 2,
    "bggTime": 150,
    "bggDifficulty": 2.4,
    "bestPlayers": [
      3,
      4
    ],
    "recommendPlayers": [
      3,
      4
    ],
    "rankingEngine": 50.5,
    "classicGameRanking": 90.5,
    "scoreRank": 593.5,
    "playerImpactRanking": 90.5,
    "changeRanking": 90.5,
    "uniqueRanking": 90.5,
    "communicationRanking": 90.5,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 3,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 97,
    "name": "煉金術士(含擴)",
    "bggName": "Alchemists",
    "slug": "game-97",
    "coverSlug": "alchemists",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/161970/alchemists",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "推理",
      "策略"
    ],
    "bggScore": 8.4,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 120,
    "bggDifficulty": 4.6,
    "bestPlayers": [
      3,
      4
    ],
    "recommendPlayers": [
      2,
      3,
      4
    ],
    "rankingEngine": 50.5,
    "classicGameRanking": 90.5,
    "scoreRank": 593.5,
    "playerImpactRanking": 90.5,
    "changeRanking": 90.5,
    "uniqueRanking": 90.5,
    "communicationRanking": 90.5,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 98,
    "name": "歡迎來到月球",
    "bggName": "Welcome to the Moon",
    "slug": "game-98",
    "coverSlug": "welcome-to-the-moon",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/339789/welcome-to-the-moon",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "策略",
      "紙筆"
    ],
    "bggScore": 7.8,
    "maxPlayers": 6,
    "minPlayers": 2,
    "bggTime": 30,
    "bggDifficulty": 2.5,
    "bestPlayers": [
      2,
      3,
      4
    ],
    "recommendPlayers": [
      2,
      3,
      4
    ],
    "rankingEngine": 30,
    "classicGameRanking": 75,
    "scoreRank": 318,
    "playerImpactRanking": 88,
    "changeRanking": 12,
    "uniqueRanking": 12,
    "communicationRanking": 89,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 5,
    "complexityDegree": 3,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆🎆"
  },
  {
    "id": 99,
    "name": "美麗新世界（含擴）",
    "bggName": "It's a Wonderful World",
    "slug": "game-99",
    "coverSlug": "it-s-a-wonderful-world",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/271324/its-a-wonderful-world",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "引擎構築",
      "策略",
      "輪抽"
    ],
    "bggScore": 8.1,
    "maxPlayers": 7,
    "minPlayers": 2,
    "bggTime": 45,
    "bggDifficulty": 2.6,
    "bestPlayers": [
      3,
      4,
      5
    ],
    "recommendPlayers": [
      3,
      4,
      5
    ],
    "rankingEngine": 65,
    "classicGameRanking": 83,
    "scoreRank": 452,
    "playerImpactRanking": 80,
    "changeRanking": 44,
    "uniqueRanking": 48,
    "communicationRanking": 88,
    "likeDegree": 4,
    "changeDegree": 4,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 4,
    "complexityDegree": 3,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆"
  },
  {
    "id": 100,
    "name": "水族祭",
    "bggName": "Aquarium Festival",
    "slug": "game-100",
    "coverSlug": "aquarium-festival",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/470551/aquarium-festival",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "爬階",
      "策略"
    ],
    "bggScore": 7.3,
    "maxPlayers": 5,
    "minPlayers": 2,
    "bggTime": 30,
    "bggDifficulty": 1.4,
    "bestPlayers": [
      3,
      4
    ],
    "recommendPlayers": [
      3,
      4,
      5
    ],
    "rankingEngine": 72,
    "classicGameRanking": 88,
    "scoreRank": 554,
    "playerImpactRanking": 76,
    "changeRanking": 85,
    "uniqueRanking": 89,
    "communicationRanking": 59,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 4,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 1,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 101,
    "name": "蒂爾特之輝（含擴）",
    "bggName": "Tiletum",
    "slug": "game-101",
    "coverSlug": "tiletum",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/351913/tiletum",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "成套蒐集",
      "策略",
      "輪盤",
      "骰放"
    ],
    "bggScore": 8.2,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 100,
    "bggDifficulty": 3.9,
    "bestPlayers": [
      2,
      3
    ],
    "recommendPlayers": [
      3
    ],
    "rankingEngine": 50.5,
    "classicGameRanking": 90.5,
    "scoreRank": 593.5,
    "playerImpactRanking": 90.5,
    "changeRanking": 90.5,
    "uniqueRanking": 90.5,
    "communicationRanking": 90.5,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 5,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 102,
    "name": "血月秘寶",
    "bggName": "Spectral",
    "slug": "game-102",
    "coverSlug": "spectral",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/388476/spectral/images",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "區控",
      "推理",
      "策略"
    ],
    "bggScore": 7.2,
    "maxPlayers": 5,
    "minPlayers": 2,
    "bggTime": 30,
    "bggDifficulty": 2.2,
    "bestPlayers": [
      4
    ],
    "recommendPlayers": [
      3,
      4,
      5
    ],
    "rankingEngine": 50.5,
    "classicGameRanking": 90.5,
    "scoreRank": 593.5,
    "playerImpactRanking": 90.5,
    "changeRanking": 90.5,
    "uniqueRanking": 90.5,
    "communicationRanking": 90.5,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 2,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 103,
    "name": "啤酒先驅(含擴)",
    "bggName": "Bier Pioniere",
    "slug": "game-103",
    "coverSlug": "bier-pioniere",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/389102/bier-pioniere",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "卡牌驅動",
      "工擺",
      "策略"
    ],
    "bggScore": 8.2,
    "maxPlayers": 4,
    "minPlayers": 2,
    "bggTime": 100,
    "bggDifficulty": 3.3,
    "bestPlayers": [
      3
    ],
    "recommendPlayers": [
      2,
      3
    ],
    "rankingEngine": 50.5,
    "classicGameRanking": 90.5,
    "scoreRank": 593.5,
    "playerImpactRanking": 90.5,
    "changeRanking": 90.5,
    "uniqueRanking": 90.5,
    "communicationRanking": 90.5,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 4,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 104,
    "name": "激浪狂飆",
    "bggName": "Tornado Splash",
    "slug": "game-104",
    "coverSlug": "tornado-splash",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/444648/tornado-splash",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "卡牌構築",
      "派對",
      "賽車"
    ],
    "bggScore": 7.5,
    "maxPlayers": 5,
    "minPlayers": 2,
    "bggTime": 40,
    "bggDifficulty": 1.3,
    "bestPlayers": [
      4,
      5
    ],
    "recommendPlayers": [
      3,
      4,
      5
    ],
    "rankingEngine": 50.5,
    "classicGameRanking": 90.5,
    "scoreRank": 593.5,
    "playerImpactRanking": 90.5,
    "changeRanking": 90.5,
    "uniqueRanking": 90.5,
    "communicationRanking": 90.5,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 1,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 105,
    "name": "胡言築塔",
    "bggName": "Bable",
    "slug": "game-105",
    "coverSlug": "bable",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/404846/bable",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "合作",
      "派對"
    ],
    "bggScore": 6.9,
    "maxPlayers": 5,
    "minPlayers": 2,
    "bggTime": 45,
    "bggDifficulty": 2.1,
    "bestPlayers": [
      3,
      4
    ],
    "recommendPlayers": [
      2,
      3,
      4
    ],
    "rankingEngine": 50.5,
    "classicGameRanking": 90.5,
    "scoreRank": 593.5,
    "playerImpactRanking": 90.5,
    "changeRanking": 90.5,
    "uniqueRanking": 90.5,
    "communicationRanking": 90.5,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 2,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠🧠",
    "changeEmoji": "🎆🎆🎆"
  },
  {
    "id": 106,
    "name": "卡斯卡迪亞（含擴）",
    "bggName": "Cascadia",
    "slug": "game-106",
    "coverSlug": "cascadia",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/295947/cascadia",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "拼圖",
      "策略"
    ],
    "bggScore": 7.9,
    "maxPlayers": 6,
    "minPlayers": 2,
    "bggTime": 45,
    "bggDifficulty": 2.3,
    "bestPlayers": [
      2,
      3
    ],
    "recommendPlayers": [
      2,
      3,
      4
    ],
    "rankingEngine": 38,
    "classicGameRanking": 53,
    "scoreRank": 376,
    "playerImpactRanking": 68,
    "changeRanking": 48,
    "uniqueRanking": 50,
    "communicationRanking": 71,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 3,
    "playerImpactDegree": 4,
    "uniqueDegree": 4,
    "complexityDegree": 3,
    "likeEmoji": "❤️❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥🔥",
    "complexityEmoji": "🧠🧠🧠",
    "changeEmoji": "🎆🎆🎆🎆"
  },
  {
    "id": 107,
    "name": "賽馬大亨",
    "bggName": "Ready Set Bet",
    "slug": "game-107",
    "coverSlug": "ready-set-bet",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/351040/ready-set-bet",
      "rulebookZh": "",
      "rulebookEn": "",
      "faq": ""
    },
    "category": [
      "派對",
      "賭博",
      "賽車"
    ],
    "bggScore": 7.5,
    "maxPlayers": 9,
    "minPlayers": 2,
    "bggTime": 60,
    "bggDifficulty": 1.3,
    "bestPlayers": [
      6,
      7,
      8
    ],
    "recommendPlayers": [
      5,
      6,
      7,
      8
    ],
    "rankingEngine": 50.5,
    "classicGameRanking": 90.5,
    "scoreRank": 593.5,
    "playerImpactRanking": 90.5,
    "changeRanking": 90.5,
    "uniqueRanking": 90.5,
    "communicationRanking": 90.5,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 1,
    "likeEmoji": "❤️❤️❤️❤️",
    "speedEmoji": "🏎️🏎️🏎️🏎️",
    "communicationEmoji": "🗣️🗣️🗣️",
    "uniqueEmoji": "🐶🐶🐶",
    "playerImpactEmoji": "🔥🔥🔥",
    "complexityEmoji": "🧠",
    "changeEmoji": "🎆🎆🎆"
  }
];
