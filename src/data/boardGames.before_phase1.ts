export type BoardGame = {
  id: number
  name: string
  slug: string
  links: {
    bgg: string
    rulebook: string
    tutorial: string
  }
  category: string[]
  bggScore: number
  maxPlayers: number
  minPlayers: number
  bggTime: number
  bggDifficulty: number
  bestPlayers: number[]
  recommendPlayers: number[]
  rankingEngine: number
  classicGameRanking: number
  playerImpactRanking?: number
  changeRanking?: number
  uniqueRanking?: number
  communicationRanking?: number
  likeDegree?: number
  changeDegree?: number
  communicationDegree?: number
  playerImpactDegree?: number
  uniqueDegree?: number
  complexityDegree?: number
}

export const boardGames: BoardGame[] = [
  {
    "id": 1,
    "name": "瘋狂詭宅（含擴）",
    "slug": "game-1",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 78,
    "changeRanking": 1,
    "uniqueRanking": 1,
    "communicationRanking": 7,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 3,
    "uniqueDegree": 5,
    "complexityDegree": 3
  },
  {
    "id": 2,
    "name": "駱駝大賽",
    "slug": "game-2",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 81,
    "changeRanking": 79,
    "uniqueRanking": 75,
    "communicationRanking": 18,
    "likeDegree": 3,
    "changeDegree": 3,
    "communicationDegree": 5,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 1
  },
  {
    "id": 3,
    "name": "郎中闖江湖(含擴)",
    "slug": "game-3",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 87,
    "changeRanking": 27,
    "uniqueRanking": 5,
    "communicationRanking": 23,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 3,
    "uniqueDegree": 5,
    "complexityDegree": 2
  },
  {
    "id": 4,
    "name": "阿瓦隆",
    "slug": "game-4",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 57,
    "changeRanking": 63,
    "uniqueRanking": 88,
    "communicationRanking": 5,
    "likeDegree": 4,
    "changeDegree": 4,
    "communicationDegree": 5,
    "playerImpactDegree": 4,
    "uniqueDegree": 3,
    "complexityDegree": 2
  },
  {
    "id": 5,
    "name": "心靈特工",
    "slug": "game-5",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 11,
    "changeRanking": 28,
    "uniqueRanking": 15,
    "communicationRanking": 51,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 4
  },
  {
    "id": 6,
    "name": "The Message",
    "slug": "game-6",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/67919/the-message/ratings?rated=1&comment=1",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 58,
    "changeRanking": 43,
    "uniqueRanking": 81,
    "communicationRanking": 28,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 5,
    "playerImpactDegree": 4,
    "uniqueDegree": 3,
    "complexityDegree": 3
  },
  {
    "id": 7,
    "name": "獵巫鎮",
    "slug": "game-7",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
      10,
      7,
      8,
      9
    ],
    "rankingEngine": 85,
    "classicGameRanking": 25,
    "playerImpactRanking": 65,
    "changeRanking": 58,
    "uniqueRanking": 74,
    "communicationRanking": 12,
    "likeDegree": 3,
    "changeDegree": 4,
    "communicationDegree": 5,
    "playerImpactDegree": 4,
    "uniqueDegree": 3,
    "complexityDegree": 2
  },
  {
    "id": 8,
    "name": "揭密希特勒",
    "slug": "game-8",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
      10,
      8
    ],
    "recommendPlayers": [
      10,
      7,
      8,
      9
    ],
    "rankingEngine": 63,
    "classicGameRanking": 41,
    "playerImpactRanking": 62,
    "changeRanking": 76,
    "uniqueRanking": 62,
    "communicationRanking": 30,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 5,
    "playerImpactDegree": 4,
    "uniqueDegree": 4,
    "complexityDegree": 2
  },
  {
    "id": 9,
    "name": "Kemet Rise Of The Gods",
    "slug": "game-9",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgameexpansion/419158/kemet-rise-of-the-gods",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 8,
    "changeRanking": 6,
    "uniqueRanking": 18,
    "communicationRanking": 33,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 4
  },
  {
    "id": 10,
    "name": "Cang Tian Zhi Si Death Of Heaven",
    "slug": "game-10",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/342409/cang-tian-zhi-si-death-of-heaven",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 46,
    "changeRanking": 11,
    "uniqueRanking": 27,
    "communicationRanking": 3,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 4,
    "uniqueDegree": 5,
    "complexityDegree": 4
  },
  {
    "id": 11,
    "name": "翠嶼秘境大盒版",
    "slug": "game-11",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 32,
    "changeRanking": 31,
    "uniqueRanking": 82,
    "communicationRanking": 29,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 3,
    "complexityDegree": 4
  },
  {
    "id": 12,
    "name": "Heart Of Crown",
    "slug": "game-12",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/131904/heart-of-crown",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 79,
    "changeRanking": 5,
    "uniqueRanking": 53,
    "communicationRanking": 48,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 4,
    "playerImpactDegree": 3,
    "uniqueDegree": 4,
    "complexityDegree": 3
  },
  {
    "id": 13,
    "name": "Ra",
    "slug": "game-13",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/12/ra",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 3,
    "changeRanking": 65,
    "uniqueRanking": 11,
    "communicationRanking": 8,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 3
  },
  {
    "id": 14,
    "name": "Rising Sun",
    "slug": "game-14",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/205896/rising-sun",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 1,
    "changeRanking": 3,
    "uniqueRanking": 9,
    "communicationRanking": 2,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 4
  },
  {
    "id": 15,
    "name": "漢薩同盟大盒版",
    "slug": "game-15",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 33,
    "changeRanking": 38,
    "uniqueRanking": 10,
    "communicationRanking": 52,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 4
  },
  {
    "id": 16,
    "name": "Manila",
    "slug": "game-16",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/15817/manila",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 56,
    "changeRanking": 77,
    "uniqueRanking": 78,
    "communicationRanking": 20,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 5,
    "playerImpactDegree": 4,
    "uniqueDegree": 3,
    "complexityDegree": 2
  },
  {
    "id": 17,
    "name": "戰爭之匣（含擴）",
    "slug": "game-17",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 13,
    "changeRanking": 9,
    "uniqueRanking": 69,
    "communicationRanking": 40,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 4,
    "complexityDegree": 3
  },
  {
    "id": 18,
    "name": "圈套棋",
    "slug": "game-18",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 2,
    "changeRanking": 73,
    "uniqueRanking": 37,
    "communicationRanking": 60,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 3
  },
  {
    "id": 19,
    "name": "Brass Birmingham",
    "slug": "game-19",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/224517/brass-birmingham",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 25,
    "changeRanking": 55,
    "uniqueRanking": 25,
    "communicationRanking": 64,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 5
  },
  {
    "id": 20,
    "name": "星河交匯",
    "slug": "game-20",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 40,
    "changeRanking": 16,
    "uniqueRanking": 2,
    "communicationRanking": 1,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 5
  },
  {
    "id": 21,
    "name": "惡夜殺機（含擴）",
    "slug": "game-21",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 20,
    "changeRanking": 8,
    "uniqueRanking": 61,
    "communicationRanking": 39,
    "likeDegree": 3,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 4,
    "complexityDegree": 2
  },
  {
    "id": 22,
    "name": "狼人真言",
    "slug": "game-22",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 100,
    "changeRanking": 100,
    "uniqueRanking": 100,
    "communicationRanking": 100,
    "likeDegree": 3,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 1
  },
  {
    "id": 23,
    "name": "地主",
    "slug": "game-23",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 100,
    "changeRanking": 100,
    "uniqueRanking": 100,
    "communicationRanking": 100,
    "likeDegree": 3,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 3
  },
  {
    "id": 24,
    "name": "大西部開拓者阿根廷",
    "slug": "game-24",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 22,
    "changeRanking": 56,
    "uniqueRanking": 14,
    "communicationRanking": 63,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 5
  },
  {
    "id": 25,
    "name": "險惡疑航",
    "slug": "game-25",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
      10,
      11,
      8,
      9
    ],
    "recommendPlayers": [
      10,
      11,
      7,
      8,
      9
    ],
    "rankingEngine": 19,
    "classicGameRanking": 29,
    "playerImpactRanking": 45,
    "changeRanking": 37,
    "uniqueRanking": 35,
    "communicationRanking": 14,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 4,
    "uniqueDegree": 5,
    "complexityDegree": 2
  },
  {
    "id": 26,
    "name": "勇者無懼2200",
    "slug": "game-26",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 5,
    "changeRanking": 4,
    "uniqueRanking": 32,
    "communicationRanking": 45,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 3
  },
  {
    "id": 27,
    "name": "Spicy",
    "slug": "game-27",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/299169/spicy",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 74,
    "changeRanking": 71,
    "uniqueRanking": 84,
    "communicationRanking": 13,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 5,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 1
  },
  {
    "id": 28,
    "name": "水下都市（含擴）",
    "slug": "game-28",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 69,
    "changeRanking": 29,
    "uniqueRanking": 73,
    "communicationRanking": 86,
    "likeDegree": 4,
    "changeDegree": 5,
    "communicationDegree": 3,
    "playerImpactDegree": 4,
    "uniqueDegree": 3,
    "complexityDegree": 5
  },
  {
    "id": 29,
    "name": "解碼戰",
    "slug": "game-29",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 60,
    "changeRanking": 66,
    "uniqueRanking": 54,
    "communicationRanking": 36,
    "likeDegree": 3,
    "changeDegree": 4,
    "communicationDegree": 5,
    "playerImpactDegree": 4,
    "uniqueDegree": 4,
    "complexityDegree": 2
  },
  {
    "id": 30,
    "name": "加勒多尼亞(含擴）",
    "slug": "game-30",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 27,
    "changeRanking": 23,
    "uniqueRanking": 31,
    "communicationRanking": 56,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 5
  },
  {
    "id": 31,
    "name": "A Fake Artist Goes to New York",
    "slug": "game-31",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 100,
    "changeRanking": 100,
    "uniqueRanking": 100,
    "communicationRanking": 100,
    "likeDegree": 3,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 1
  },
  {
    "id": 32,
    "name": "Bohnanza",
    "slug": "game-32",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/11/bohnanza",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 54,
    "changeRanking": 86,
    "uniqueRanking": 80,
    "communicationRanking": 4,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 5,
    "playerImpactDegree": 4,
    "uniqueDegree": 3,
    "complexityDegree": 2
  },
  {
    "id": 33,
    "name": "Viking See Saw",
    "slug": "game-33",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/351810/viking-see-saw",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 64,
    "changeRanking": 89,
    "uniqueRanking": 87,
    "communicationRanking": 44,
    "likeDegree": 3,
    "changeDegree": 3,
    "communicationDegree": 4,
    "playerImpactDegree": 4,
    "uniqueDegree": 3,
    "complexityDegree": 1
  },
  {
    "id": 34,
    "name": "死亡筆記本",
    "slug": "game-34",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 59,
    "changeRanking": 75,
    "uniqueRanking": 67,
    "communicationRanking": 34,
    "likeDegree": 5,
    "changeDegree": 3,
    "communicationDegree": 5,
    "playerImpactDegree": 4,
    "uniqueDegree": 4,
    "complexityDegree": 1
  },
  {
    "id": 35,
    "name": "和諧之森",
    "slug": "game-35",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 77,
    "changeRanking": 68,
    "uniqueRanking": 44,
    "communicationRanking": 82,
    "likeDegree": 4,
    "changeDegree": 4,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 4,
    "complexityDegree": 2
  },
  {
    "id": 36,
    "name": "Scout",
    "slug": "game-36",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 73,
    "changeRanking": 78,
    "uniqueRanking": 71,
    "communicationRanking": 55,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 4,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 1
  },
  {
    "id": 37,
    "name": "墨敵賽",
    "slug": "game-37",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
    },
    "category": [
      "卡牌驅動",
      "成套蒐集",
      "派對"
    ],
    "bggScore": 0,
    "maxPlayers": 8,
    "minPlayers": 2,
    "bggTime": 60,
    "bggDifficulty": 0,
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
    "playerImpactRanking": 71,
    "changeRanking": 61,
    "uniqueRanking": 83,
    "communicationRanking": 15,
    "likeDegree": 3,
    "changeDegree": 4,
    "communicationDegree": 5,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 5
  },
  {
    "id": 38,
    "name": "腦洞量表",
    "slug": "game-38",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 100,
    "changeRanking": 100,
    "uniqueRanking": 100,
    "communicationRanking": 100,
    "likeDegree": 3,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 1
  },
  {
    "id": 39,
    "name": "冥海航跡(含擴)",
    "slug": "game-39",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 38,
    "changeRanking": 18,
    "uniqueRanking": 42,
    "communicationRanking": 43,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 4
  },
  {
    "id": 40,
    "name": "Dead Mans Draw",
    "slug": "game-40",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/149155/dead-mans-draw",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 86,
    "changeRanking": 69,
    "uniqueRanking": 52,
    "communicationRanking": 37,
    "likeDegree": 3,
    "changeDegree": 4,
    "communicationDegree": 5,
    "playerImpactDegree": 3,
    "uniqueDegree": 4,
    "complexityDegree": 1
  },
  {
    "id": 41,
    "name": "關原之戰",
    "slug": "game-41",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 15,
    "changeRanking": 62,
    "uniqueRanking": 43,
    "communicationRanking": 54,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 4,
    "complexityDegree": 3
  },
  {
    "id": 42,
    "name": "Betrayal At House On The Hill 3Rd Edition",
    "slug": "game-42",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/358504/betrayal-at-house-on-the-hill-3rd-edition",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 61,
    "changeRanking": 15,
    "uniqueRanking": 70,
    "communicationRanking": 32,
    "likeDegree": 4,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 4,
    "uniqueDegree": 4,
    "complexityDegree": 3
  },
  {
    "id": 43,
    "name": "878維京人入侵（含擴）",
    "slug": "game-43",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 9,
    "changeRanking": 33,
    "uniqueRanking": 46,
    "communicationRanking": 16,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 4,
    "complexityDegree": 3
  },
  {
    "id": 44,
    "name": "Startups",
    "slug": "game-44",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/223770/startups",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 36,
    "changeRanking": 80,
    "uniqueRanking": 36,
    "communicationRanking": 26,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 1
  },
  {
    "id": 45,
    "name": "慘劇輪迴（含擴）",
    "slug": "game-45",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 17,
    "changeRanking": 2,
    "uniqueRanking": 16,
    "communicationRanking": 38,
    "likeDegree": 4,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 5
  },
  {
    "id": 46,
    "name": "時空神探（含擴）",
    "slug": "game-46",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 89,
    "changeRanking": 7,
    "uniqueRanking": 20,
    "communicationRanking": 72,
    "likeDegree": 4,
    "changeDegree": 5,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 5,
    "complexityDegree": 3
  },
  {
    "id": 47,
    "name": "沙丘帝國：起義（含擴）",
    "slug": "game-47",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 48,
    "changeRanking": 22,
    "uniqueRanking": 58,
    "communicationRanking": 61,
    "likeDegree": 4,
    "changeDegree": 5,
    "communicationDegree": 4,
    "playerImpactDegree": 4,
    "uniqueDegree": 4,
    "complexityDegree": 5
  },
  {
    "id": 48,
    "name": "Magical athlete",
    "slug": "game-48",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 70,
    "changeRanking": 35,
    "uniqueRanking": 77,
    "communicationRanking": 17,
    "likeDegree": 3,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 4,
    "uniqueDegree": 3,
    "complexityDegree": 1
  },
  {
    "id": 49,
    "name": "Wandering Towers",
    "slug": "game-49",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/355483/wandering-towers",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 72,
    "changeRanking": 70,
    "uniqueRanking": 49,
    "communicationRanking": 21,
    "likeDegree": 3,
    "changeDegree": 4,
    "communicationDegree": 5,
    "playerImpactDegree": 3,
    "uniqueDegree": 4,
    "complexityDegree": 1
  },
  {
    "id": 50,
    "name": "掌握時刻",
    "slug": "game-50",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 55,
    "changeRanking": 13,
    "uniqueRanking": 30,
    "communicationRanking": 19,
    "likeDegree": 3,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 4,
    "uniqueDegree": 5,
    "complexityDegree": 2
  },
  {
    "id": 51,
    "name": "一智千金",
    "slug": "game-51",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 82,
    "changeRanking": 83,
    "uniqueRanking": 7,
    "communicationRanking": 9,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 5,
    "playerImpactDegree": 3,
    "uniqueDegree": 5,
    "complexityDegree": 1
  },
  {
    "id": 52,
    "name": "姬路城（含擴）",
    "slug": "game-52",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 43,
    "changeRanking": 39,
    "uniqueRanking": 72,
    "communicationRanking": 79,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 3,
    "playerImpactDegree": 4,
    "uniqueDegree": 3,
    "complexityDegree": 4
  },
  {
    "id": 53,
    "name": "Witchs Brew",
    "slug": "game-53",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/34084/witchs-brew",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 31,
    "changeRanking": 88,
    "uniqueRanking": 34,
    "communicationRanking": 11,
    "likeDegree": 3,
    "changeDegree": 3,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 2
  },
  {
    "id": 54,
    "name": "上洛",
    "slug": "game-54",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 26,
    "changeRanking": 72,
    "uniqueRanking": 21,
    "communicationRanking": 53,
    "likeDegree": 5,
    "changeDegree": 3,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 2
  },
  {
    "id": 55,
    "name": "Everdell Silverfrost",
    "slug": "game-55",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/436821/everdell-silverfrost",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 75,
    "changeRanking": 46,
    "uniqueRanking": 79,
    "communicationRanking": 84,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 4
  },
  {
    "id": 56,
    "name": "王都布拉格",
    "slug": "game-56",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 44,
    "changeRanking": 49,
    "uniqueRanking": 60,
    "communicationRanking": 68,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 4,
    "playerImpactDegree": 4,
    "uniqueDegree": 4,
    "complexityDegree": 5
  },
  {
    "id": 57,
    "name": "我與惡魔有個交易",
    "slug": "game-57",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 49,
    "changeRanking": 59,
    "uniqueRanking": 24,
    "communicationRanking": 46,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 4,
    "playerImpactDegree": 4,
    "uniqueDegree": 5,
    "complexityDegree": 5
  },
  {
    "id": 58,
    "name": "卓越的羅倫佐",
    "slug": "game-58",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 41,
    "changeRanking": 30,
    "uniqueRanking": 40,
    "communicationRanking": 77,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 3,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 4
  },
  {
    "id": 59,
    "name": "天際礦脈",
    "slug": "game-59",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 34,
    "changeRanking": 40,
    "uniqueRanking": 33,
    "communicationRanking": 62,
    "likeDegree": 4,
    "changeDegree": 5,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 5
  },
  {
    "id": 60,
    "name": "馬拉開波海盜（含擴）",
    "slug": "game-60",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 21,
    "changeRanking": 34,
    "uniqueRanking": 64,
    "communicationRanking": 58,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 4,
    "complexityDegree": 4
  },
  {
    "id": 61,
    "name": "Doodle Dash",
    "slug": "game-61",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/334379/doodle-dash",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 85,
    "changeRanking": 84,
    "uniqueRanking": 86,
    "communicationRanking": 6,
    "likeDegree": 5,
    "changeDegree": 3,
    "communicationDegree": 5,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 1
  },
  {
    "id": 62,
    "name": "月球南極基地",
    "slug": "game-62",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 28,
    "changeRanking": 14,
    "uniqueRanking": 45,
    "communicationRanking": 75,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 3,
    "playerImpactDegree": 5,
    "uniqueDegree": 4,
    "complexityDegree": 5
  },
  {
    "id": 63,
    "name": "馬拉喀什",
    "slug": "game-63",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 39,
    "changeRanking": 57,
    "uniqueRanking": 23,
    "communicationRanking": 83,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 3,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 5
  },
  {
    "id": 64,
    "name": "冷冷的她在醒來之前",
    "slug": "game-64",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 63,
    "changeRanking": 74,
    "uniqueRanking": 59,
    "communicationRanking": 35,
    "likeDegree": 5,
    "changeDegree": 3,
    "communicationDegree": 5,
    "playerImpactDegree": 4,
    "uniqueDegree": 4,
    "complexityDegree": 1
  },
  {
    "id": 65,
    "name": "新月戰記",
    "slug": "game-65",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 14,
    "changeRanking": 32,
    "uniqueRanking": 19,
    "communicationRanking": 25,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 5
  },
  {
    "id": 66,
    "name": "Lure",
    "slug": "game-66",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/415780/lure",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 84,
    "changeRanking": 82,
    "uniqueRanking": 76,
    "communicationRanking": 27,
    "likeDegree": 3,
    "changeDegree": 3,
    "communicationDegree": 5,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 1
  },
  {
    "id": 67,
    "name": "天堂與美酒大盒版",
    "slug": "game-67",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 24,
    "changeRanking": 60,
    "uniqueRanking": 38,
    "communicationRanking": 78,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 3,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 4
  },
  {
    "id": 68,
    "name": "onward(含擴)",
    "slug": "game-68",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 90.5,
    "changeRanking": 90.5,
    "uniqueRanking": 90.5,
    "communicationRanking": 90.5,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 4
  },
  {
    "id": 69,
    "name": "for the gods!",
    "slug": "game-69",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 90.5,
    "changeRanking": 90.5,
    "uniqueRanking": 90.5,
    "communicationRanking": 90.5,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 3
  },
  {
    "id": 70,
    "name": "留里克(含擴)",
    "slug": "game-70",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 10,
    "changeRanking": 47,
    "uniqueRanking": 22,
    "communicationRanking": 50,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 4
  },
  {
    "id": 71,
    "name": "北境之地（含擴）",
    "slug": "game-71",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 37,
    "changeRanking": 24,
    "uniqueRanking": 65,
    "communicationRanking": 47,
    "likeDegree": 4,
    "changeDegree": 5,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 4,
    "complexityDegree": 3
  },
  {
    "id": 72,
    "name": "戰場軍需官 WW2(含擴)",
    "slug": "game-72",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 30,
    "changeRanking": 20,
    "uniqueRanking": 29,
    "communicationRanking": 31,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 4
  },
  {
    "id": 73,
    "name": "The Rich And The Good",
    "slug": "game-73",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/38863/the-rich-and-the-good",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 23,
    "changeRanking": 81,
    "uniqueRanking": 56,
    "communicationRanking": 22,
    "likeDegree": 3,
    "changeDegree": 3,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 4,
    "complexityDegree": 2
  },
  {
    "id": 74,
    "name": "看版EV",
    "slug": "game-74",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 18,
    "changeRanking": 50,
    "uniqueRanking": 4,
    "communicationRanking": 74,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 3,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 5
  },
  {
    "id": 75,
    "name": "卡內基(含擴)",
    "slug": "game-75",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 4,
    "changeRanking": 36,
    "uniqueRanking": 8,
    "communicationRanking": 67,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 5
  },
  {
    "id": 76,
    "name": "Pulsar 2849",
    "slug": "game-76",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 42,
    "changeRanking": 41,
    "uniqueRanking": 66,
    "communicationRanking": 73,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 3,
    "playerImpactDegree": 5,
    "uniqueDegree": 4,
    "complexityDegree": 4
  },
  {
    "id": 77,
    "name": "財閥（含擴）",
    "slug": "game-77",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 90.5,
    "changeRanking": 90.5,
    "uniqueRanking": 90.5,
    "communicationRanking": 90.5,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 5
  },
  {
    "id": 78,
    "name": "Cuzco",
    "slug": "game-78",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 16,
    "changeRanking": 53,
    "uniqueRanking": 6,
    "communicationRanking": 66,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 5
  },
  {
    "id": 79,
    "name": "華倫斯坦大盒版",
    "slug": "game-79",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 35,
    "changeRanking": 51,
    "uniqueRanking": 57,
    "communicationRanking": 42,
    "likeDegree": 4,
    "changeDegree": 4,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 4,
    "complexityDegree": 5
  },
  {
    "id": 80,
    "name": "塞西亞掠奪者",
    "slug": "game-80",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 67,
    "changeRanking": 52,
    "uniqueRanking": 63,
    "communicationRanking": 65,
    "likeDegree": 4,
    "changeDegree": 4,
    "communicationDegree": 4,
    "playerImpactDegree": 4,
    "uniqueDegree": 4,
    "complexityDegree": 3
  },
  {
    "id": 81,
    "name": "Keyflower",
    "slug": "game-81",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/122515/keyflower",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 7,
    "changeRanking": 17,
    "uniqueRanking": 26,
    "communicationRanking": 49,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 4
  },
  {
    "id": 82,
    "name": "蓋亞計劃（含擴）",
    "slug": "game-82",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 52,
    "changeRanking": 10,
    "uniqueRanking": 17,
    "communicationRanking": 76,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 3,
    "playerImpactDegree": 4,
    "uniqueDegree": 5,
    "complexityDegree": 5
  },
  {
    "id": 83,
    "name": "奧丁的盛宴(含擴)",
    "slug": "game-83",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 66,
    "changeRanking": 21,
    "uniqueRanking": 13,
    "communicationRanking": 87,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 3,
    "playerImpactDegree": 4,
    "uniqueDegree": 5,
    "complexityDegree": 5
  },
  {
    "id": 84,
    "name": "Rock Swap Flip Flop",
    "slug": "game-84",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/448476/rock-swap-flip-flop",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 83,
    "changeRanking": 87,
    "uniqueRanking": 39,
    "communicationRanking": 10,
    "likeDegree": 3,
    "changeDegree": 3,
    "communicationDegree": 5,
    "playerImpactDegree": 3,
    "uniqueDegree": 5,
    "complexityDegree": 1
  },
  {
    "id": 85,
    "name": "葡萄酒莊園(含擴)",
    "slug": "game-85",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 47,
    "changeRanking": 26,
    "uniqueRanking": 68,
    "communicationRanking": 80,
    "likeDegree": 4,
    "changeDegree": 5,
    "communicationDegree": 3,
    "playerImpactDegree": 4,
    "uniqueDegree": 4,
    "complexityDegree": 4
  },
  {
    "id": 86,
    "name": "卓爾金歷（含擴）",
    "slug": "game-86",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 51,
    "changeRanking": 25,
    "uniqueRanking": 3,
    "communicationRanking": 81,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 3,
    "playerImpactDegree": 4,
    "uniqueDegree": 5,
    "complexityDegree": 5
  },
  {
    "id": 87,
    "name": "月海礦場",
    "slug": "game-87",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 53,
    "changeRanking": 67,
    "uniqueRanking": 55,
    "communicationRanking": 70,
    "likeDegree": 4,
    "changeDegree": 4,
    "communicationDegree": 4,
    "playerImpactDegree": 4,
    "uniqueDegree": 4,
    "complexityDegree": 5
  },
  {
    "id": 88,
    "name": "台灣夜市",
    "slug": "game-88",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 6,
    "changeRanking": 64,
    "uniqueRanking": 47,
    "communicationRanking": 41,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 4,
    "complexityDegree": 3
  },
  {
    "id": 89,
    "name": "太陽之子",
    "slug": "game-89",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 90.5,
    "changeRanking": 90.5,
    "uniqueRanking": 90.5,
    "communicationRanking": 90.5,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 4
  },
  {
    "id": 90,
    "name": "Xin Mu Ying Jiang Rudai Nijue Dou Wo Da Ren Setsut",
    "slug": "game-90",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgameexpansion/304043/xin-mu-ying-jiang-rudai-nijue-dou-wo-da-ren-setsut",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 90.5,
    "changeRanking": 90.5,
    "uniqueRanking": 90.5,
    "communicationRanking": 90.5,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 5
  },
  {
    "id": 91,
    "name": "7 Wonders Duel",
    "slug": "game-91",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/173346/7-wonders-duel",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 19,
    "changeRanking": 42,
    "uniqueRanking": 85,
    "communicationRanking": 57,
    "likeDegree": 4,
    "changeDegree": 5,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 3,
    "complexityDegree": 4
  },
  {
    "id": 92,
    "name": "太空議會",
    "slug": "game-92",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 29,
    "changeRanking": 54,
    "uniqueRanking": 51,
    "communicationRanking": 69,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 4,
    "playerImpactDegree": 5,
    "uniqueDegree": 4,
    "complexityDegree": 5
  },
  {
    "id": 93,
    "name": "達爾文之旅(含擴)",
    "slug": "game-93",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 50,
    "changeRanking": 19,
    "uniqueRanking": 41,
    "communicationRanking": 85,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 3,
    "playerImpactDegree": 4,
    "uniqueDegree": 5,
    "complexityDegree": 5
  },
  {
    "id": 94,
    "name": "Pax Pamir Second Edition",
    "slug": "game-94",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/256960/pax-pamir-second-edition",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 12,
    "changeRanking": 45,
    "uniqueRanking": 28,
    "communicationRanking": 24,
    "likeDegree": 4,
    "changeDegree": 4,
    "communicationDegree": 5,
    "playerImpactDegree": 5,
    "uniqueDegree": 5,
    "complexityDegree": 5
  },
  {
    "id": 95,
    "name": "A Game Of Thrones The Board Game Second Edition",
    "slug": "game-95",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/103343/a-game-of-thrones-the-board-game-second-edition",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 90.5,
    "changeRanking": 90.5,
    "uniqueRanking": 90.5,
    "communicationRanking": 90.5,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 5
  },
  {
    "id": 96,
    "name": "Detective City Of Angels",
    "slug": "game-96",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/218074/detective-city-of-angels",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 90.5,
    "changeRanking": 90.5,
    "uniqueRanking": 90.5,
    "communicationRanking": 90.5,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 3
  },
  {
    "id": 97,
    "name": "Alchemists",
    "slug": "game-97",
    "links": {
      "bgg": "https://boardgamegeek.com/boardgame/161970/alchemists/expansions",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 90.5,
    "changeRanking": 90.5,
    "uniqueRanking": 90.5,
    "communicationRanking": 90.5,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 5
  },
  {
    "id": 98,
    "name": "歡迎來到月球",
    "slug": "game-98",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 88,
    "changeRanking": 12,
    "uniqueRanking": 12,
    "communicationRanking": 89,
    "likeDegree": 5,
    "changeDegree": 5,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 5,
    "complexityDegree": 3
  },
  {
    "id": 99,
    "name": "美麗新世界（含擴）",
    "slug": "game-99",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 80,
    "changeRanking": 44,
    "uniqueRanking": 48,
    "communicationRanking": 88,
    "likeDegree": 4,
    "changeDegree": 4,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 4,
    "complexityDegree": 3
  },
  {
    "id": 100,
    "name": "水族祭",
    "slug": "game-100",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 76,
    "changeRanking": 85,
    "uniqueRanking": 89,
    "communicationRanking": 59,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 4,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 1
  },
  {
    "id": 101,
    "name": "蒂爾特之輝（含擴）",
    "slug": "game-101",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 90.5,
    "changeRanking": 90.5,
    "uniqueRanking": 90.5,
    "communicationRanking": 90.5,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 5
  },
  {
    "id": 102,
    "name": "血月秘寶",
    "slug": "game-102",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 90.5,
    "changeRanking": 90.5,
    "uniqueRanking": 90.5,
    "communicationRanking": 90.5,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 2
  },
  {
    "id": 103,
    "name": "啤酒先驅(含擴)",
    "slug": "game-103",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 90.5,
    "changeRanking": 90.5,
    "uniqueRanking": 90.5,
    "communicationRanking": 90.5,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 4
  },
  {
    "id": 104,
    "name": "激浪狂飆",
    "slug": "game-104",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 90.5,
    "changeRanking": 90.5,
    "uniqueRanking": 90.5,
    "communicationRanking": 90.5,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 1
  },
  {
    "id": 105,
    "name": "胡言築塔",
    "slug": "game-105",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 90.5,
    "changeRanking": 90.5,
    "uniqueRanking": 90.5,
    "communicationRanking": 90.5,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 2
  },
  {
    "id": 106,
    "name": "卡斯卡迪亞（含擴）",
    "slug": "game-106",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 68,
    "changeRanking": 48,
    "uniqueRanking": 50,
    "communicationRanking": 71,
    "likeDegree": 5,
    "changeDegree": 4,
    "communicationDegree": 3,
    "playerImpactDegree": 4,
    "uniqueDegree": 4,
    "complexityDegree": 3
  },
  {
    "id": 107,
    "name": "賽馬大亨",
    "slug": "game-107",
    "links": {
      "bgg": "",
      "rulebook": "",
      "tutorial": ""
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
    "playerImpactRanking": 90.5,
    "changeRanking": 90.5,
    "uniqueRanking": 90.5,
    "communicationRanking": 90.5,
    "likeDegree": 4,
    "changeDegree": 3,
    "communicationDegree": 3,
    "playerImpactDegree": 3,
    "uniqueDegree": 3,
    "complexityDegree": 1
  }
];
