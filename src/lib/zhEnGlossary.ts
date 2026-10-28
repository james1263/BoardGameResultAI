// 通用桌遊中英對照：中文問題裡出現左邊任一詞，就建議右邊的英文關鍵字
// 遊戲專有名詞之後可以再加（最後一筆是旭日戰魂錄的例子）
const ENTRIES: { zh: string[]; en: string[] }[] = [
  { zh: ['每回合限一次', '每回合一次', '限一次'], en: ['once per turn', 'limit'] },
  { zh: ['回合結束', '回合末'], en: ['end of turn', 'cleanup'] },
  { zh: ['遊戲結束', '結束條件'], en: ['game end', 'end of game'] },
  { zh: ['起始玩家', '先手'], en: ['start player', 'first player'] },
  { zh: ['行動順序', '玩家順序', '順序'], en: ['turn order'] },
  { zh: ['勝利點', '勝利分'], en: ['victory points'] },
  { zh: ['勝利', '獲勝', '誰贏'], en: ['win', 'victory'] },
  { zh: ['計分', '得分', '分數'], en: ['scoring', 'score'] },
  { zh: ['手牌上限', '手牌'], en: ['hand limit', 'hand'] },
  { zh: ['回合', '輪到'], en: ['turn'] },
  { zh: ['階段'], en: ['phase'] },
  { zh: ['行動'], en: ['action'] },
  { zh: ['交易'], en: ['trade', 'trading'] },
  { zh: ['拍賣', '競標'], en: ['auction', 'bid'] },
  { zh: ['上限', '最多'], en: ['limit', 'maximum'] },
  { zh: ['抽牌'], en: ['draw', 'draw cards'] },
  { zh: ['棄牌'], en: ['discard'] },
  { zh: ['卡牌', '卡片', '牌'], en: ['card'] },
  { zh: ['資源'], en: ['resource'] },
  { zh: ['金錢', '金幣', '錢'], en: ['coin', 'money', 'gold'] },
  { zh: ['費用', '花費', '成本', '支付'], en: ['cost', 'pay'] },
  { zh: ['移動'], en: ['move', 'movement'] },
  { zh: ['攻擊', '戰鬥'], en: ['attack', 'combat', 'battle'] },
  { zh: ['建造', '建築'], en: ['build', 'construct'] },
  { zh: ['獲得', '拿取', '取得'], en: ['gain', 'receive', 'take'] },
  { zh: ['失去', '移除'], en: ['lose', 'remove'] },
  { zh: ['設置', '準備', '初始', '開局'], en: ['setup', 'set up'] },
  { zh: ['平手', '同分'], en: ['tie', 'tiebreaker'] },
  { zh: ['例外', '特殊'], en: ['exception', 'special'] },
  { zh: ['區域', '地區'], en: ['region', 'area'] },
  { zh: ['單位', '棋子', '標記'], en: ['unit', 'piece', 'token'] },
  { zh: ['骰子', '擲骰'], en: ['dice', 'roll'] },
  { zh: ['陣營'], en: ['faction'] },
  { zh: ['能力', '技能'], en: ['ability', 'power'] },
  { zh: ['事件'], en: ['event'] },
  { zh: ['結算'], en: ['resolve', 'resolution', 'end of round'] },
  { zh: ['人數'], en: ['number of players', 'player count'] },
  { zh: ['同時'], en: ['simultaneous'] },
  { zh: ['隱藏', '秘密'], en: ['hidden', 'secret'] },
  { zh: ['公開', '亮出'], en: ['reveal', 'public'] },
  { zh: ['擴充'], en: ['expansion'] },
  // 旭日戰魂錄
  { zh: ['茶會'], en: ['tea ceremony'] },
]

export function hasChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text)
}

export function suggestKeywords(text: string, max = 10): string[] {
  const result: string[] = []
  let rest = text
  for (const entry of ENTRIES) {
    const hit = entry.zh.find((word) => rest.includes(word))
    if (!hit) continue
    // 較長的詞命中後就不再讓較短的詞重複命中（例如「每回合限一次」之後不再配「回合」）
    rest = rest.split(hit).join(' ')
    for (const word of entry.en) {
      if (!result.includes(word)) result.push(word)
    }
  }
  return result.slice(0, max)
}