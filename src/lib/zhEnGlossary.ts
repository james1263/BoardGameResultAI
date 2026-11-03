// 中英對照：中文問題裡出現左邊任一詞，就建議右邊的英文關鍵字
// 比對順序＝陣列順序，命中後該詞會從問題裡剔除：「較長、較專門」的詞一定要放在「較短、較通用」的詞前面
// 遊戲專有名詞放在最上面（旭日戰魂錄、卓越的羅倫佐）；之後會改成每款遊戲各自的詞庫
const ENTRIES: { zh: string[]; en: string[] }[] = [
  // ── 旭日戰魂錄 ──
  { zh: ['福祿壽', '福壽祿'], en: ['Fukurokuju'] },
  { zh: ['生兵'], en: ['recruit', 'summon'] },
  { zh: ['招募'], en: ['recruit'] },
  { zh: ['城堡', '堡壘'], en: ['stronghold'] },
  { zh: ['結盟', '盟友'], en: ['alliance', 'ally'] },
  { zh: ['背叛'], en: ['betray'] },
  { zh: ['大名'], en: ['daimyo'] },
  { zh: ['浪人'], en: ['ronin'] },
  { zh: ['切腹'], en: ['seppuku'] },
  { zh: ['人質'], en: ['hostage'] },
  { zh: ['戰爭優勢'], en: ['war advantage'] },
  { zh: ['榮耀', '榮譽'], en: ['honor'] },
  { zh: ['天照'], en: ['Amaterasu'] },
  { zh: ['下凡'], en: ['Kami Unbound', 'kami'] },
  { zh: ['神明'], en: ['kami'] },
  { zh: ['神殿'], en: ['shrine'] },
  { zh: ['信徒'], en: ['shinto'] },
  { zh: ['武士'], en: ['bushi'] },
  { zh: ['魔物'], en: ['monster'] },
  { zh: ['政策行動', '政策'], en: ['mandate'] },
  { zh: ['調度'], en: ['marshal'] },
  { zh: ['採收'], en: ['harvest'] },
  { zh: ['訓練'], en: ['train'] },
  { zh: ['季節卡'], en: ['season card'] },
  { zh: ['茶會'], en: ['tea ceremony'] },
  // ── 卓越的羅倫佐 ──
  { zh: ['家族成員'], en: ['family member'] },
  { zh: ['無色', '中立'], en: ['non-coloured', 'neutral'] },
  { zh: ['有色'], en: ['coloured'] },
  { zh: ['僕人'], en: ['servant'] },
  { zh: ['議會'], en: ['council palace'] },
  { zh: ['市場'], en: ['market'] },
  { zh: ['收穫'], en: ['harvest'] },
  { zh: ['生產'], en: ['production'] },
  { zh: ['行動格', '行動空間', '格子', '空格'], en: ['action space'] },
  { zh: ['行動點數'], en: ['value'] },
  { zh: ['發展卡'], en: ['development card'] },
  { zh: ['領袖'], en: ['leader'] },
  { zh: ['梵蒂岡'], en: ['vatican'] },
  { zh: ['信仰'], en: ['faith'] },
  { zh: ['逐出教會', '驅逐'], en: ['excommunication'] },
  { zh: ['軍事'], en: ['military'] },
  { zh: ['放置', '站'], en: ['place'] },
  { zh: ['塔'], en: ['tower'] },
  // ── 通用 ──
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