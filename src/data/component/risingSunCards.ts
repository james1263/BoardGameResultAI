// 旭日戰魂（Rising Sun）季節卡資料（結構化，供聚會房間「持有物」使用；暫時沒有被任何元件引用）
// 來源：兩份英文季節卡總表（玩家整理，未標出處）：① RISING_SUN_-_SEASON_CARD_REF_GRAPHIC_v2_0（v2，有塔組、怪物包與大名盒，含圖面底色）
//       ② Rising_Sun_Seasons_Cards_v3（v3，沒有塔組，明列每種卡的張數）。兩份逐張對照過，只有下面「來源不一致」那幾處不同。
// 另有第三份 RISING_SUN_LIST_OF_MONSTERS_LUCKY_GODS_KAMI_CARDS（Chas 整理，odt）：怪物與福神的費用、效果與 v2／v3 一致（除下列不一致），並提供七位神靈（Kami）的神殿效果與神靈效果。
// 費用與張數：v3 每列寫「卡名（費用）張數」；v2 寫「卡名（張數）」再下一行寫費用。（v2 沒標張數的卡＝1 張。）
// 中文：卡名只有官方 FAQ 2.0 出現過的才填 nameZh（其餘留空、顯示時用英文）；效果 effectZh 是依英文總表的自譯摘要，全部【待核對】，請對照實體卡。
// 圖面判讀：v2 的 PDF 文字層欄位順序是亂的，船組 Dignity／Salamander／Pacifist 的效果是看圖面與 v3 對出來的。
// 來源不一致：①拱門組 Path of the Samurai 費用（v2＝1、v3＝2，這裡採 v3 的 2）；②地龍與火龍屬於怪物包還是大名盒；③塔組只有 v2；④Sunakake-Baba 費用 1 vs 0；⑤River Dragon 所屬組別。
// 還沒做：怪物包與大名盒各卡的基礎戰力不在這裡（見快速複習）；各卡與 FAQ 的對應連結（FAQ 2.0 與 BGG 討論串）。

export type SeasonKey = 's' | 'm' | 'a' // 春、夏、秋
export type SeasonCardKind = 'virtue' | 'enhancement' | 'warUpgrade' | 'winterUpgrade' | 'monster'

export type SeasonCard = {
  id: string
  set: string // SEASON_CARD_SETS 的 key
  season: SeasonKey
  kind: SeasonCardKind
  nameEn: string
  nameZh?: string // 官方 FAQ 2.0 有的才填
  cost: number
  copies: number // 同一組牌裡有幾張
  timing?: string // 例如「戰爭階段開始時」「遊戲結束時」「大名升級」
  effectEn: string
  effectZh: string // 自譯摘要，【待核對】
  note?: string
  src: string
}

export const SEASON_LABEL: Record<SeasonKey, string> = { s: '春', m: '夏', a: '秋' }

export const KIND_LABEL: Record<SeasonCardKind, string> = {
  virtue: '美德',
  enhancement: '加強',
  warUpgrade: '戰爭升級',
  winterUpgrade: '冬季升級',
  monster: '怪物',
}

export const SEASON_CARD_SETS: Record<string, string> = {
  core: '核心盒',
  kickstarter: '怪物包／大名盒（Kickstarter）',
  lucky: '福神（王朝入侵）',
  archway: '拱門組',
  horseman: '騎手組',
  teapot: '茶壺組',
  mountain: '山組（神靈降世）',
  ship: '船組（王朝入侵）',
  tower: '塔組（Dice Tower 贈品）',
}

export const SEASON_CARDS: SeasonCard[] = [
  { id: 'core-s-path-of-the-lion', set: 'core', season: 's', kind: 'enhancement', nameEn: 'Path of the Lion', cost: 0, copies: 1, timing: '大名升級', effectEn: 'Your Daimyo has +1 Force.', effectZh: '你的大名 +1 戰力。', src: '總表 v2＋v3' },
  { id: 'core-s-komainu', set: 'core', season: 's', kind: 'monster', nameEn: 'Komainu', nameZh: '狛犬', cost: 2, copies: 1, effectEn: 'Counts as a Shinto.', effectZh: '算作信徒。', src: '總表 v2＋v3' },
  { id: 'core-s-oni-of-skulls', set: 'core', season: 's', kind: 'monster', nameEn: 'Oni of Skulls', cost: 2, copies: 1, effectEn: '3 Force in any Province where you have the lowest Honor.', effectZh: '在你榮耀最低的任一地區算 3 戰力。', src: '總表 v2＋v3' },
  { id: 'core-s-righteousness', set: 'core', season: 's', kind: 'virtue', nameEn: 'Righteousness', nameZh: '正義', cost: 2, copies: 2, effectEn: 'For each of your figures that is killed you gain 1 VP.', effectZh: '你的每個單位被殺死時，你得 1 VP。', src: '總表 v2＋v3' },
  { id: 'core-s-way-of-the-shogun', set: 'core', season: 's', kind: 'warUpgrade', nameEn: 'Way of the Shogun', cost: 2, copies: 2, timing: '戰爭階段開始時', effectEn: 'Gain 3 Coin.', effectZh: '獲得 3 錢幣。', src: '總表 v2＋v3' },
  { id: 'core-m-path-of-the-serpent', set: 'core', season: 'm', kind: 'enhancement', nameEn: 'Path of the Serpent', nameZh: '大蛇之道', cost: 2, copies: 1, timing: '航線升級', effectEn: 'You may charge other players 1 Coin to cross each different Shipping Route with their figures.', effectZh: '其他玩家的單位每跨越一條不同航線，你可向他收 1 錢幣。', src: '總表 v2＋v3' },
  { id: 'core-m-yurei', set: 'core', season: 'm', kind: 'monster', nameEn: 'Yurei', cost: 3, copies: 1, effectEn: 'Counts as a Daimyo with 2 Force.', effectZh: '算作戰力 2 的大名。', src: '總表 v2＋v3' },
  { id: 'core-m-respect', set: 'core', season: 'm', kind: 'virtue', nameEn: 'Respect', nameZh: '尊重', cost: 0, copies: 2, effectEn: 'You may take an additional hostage whenever you Take Hostage in Battle.', effectZh: '戰鬥中綁架人質時，可多綁架 1 名。', src: '總表 v2＋v3' },
  { id: 'core-m-way-of-bushido', set: 'core', season: 'm', kind: 'warUpgrade', nameEn: 'Way of Bushido', cost: 3, copies: 1, timing: '戰爭階段開始時', effectEn: 'Gain 2 Coin and 2 VP per different Virtue you have.', effectZh: '你每有 1 種不同美德，獲得 2 錢幣與 2 VP。', src: '總表 v2＋v3' },
  { id: 'core-m-way-of-the-ronin', set: 'core', season: 'm', kind: 'warUpgrade', nameEn: 'Way of the Ronin', cost: 1, copies: 2, timing: '戰爭階段開始時', effectEn: 'Gain 2 Ronin.', effectZh: '獲得 2 個浪人。', src: '總表 v2＋v3' },
  { id: 'core-a-path-of-the-dragon', set: 'core', season: 'a', kind: 'enhancement', nameEn: 'Path of the Dragon', cost: 3, copies: 1, timing: '大名升級', effectEn: 'Your Daimyo has +3 Force.', effectZh: '你的大名 +3 戰力。', src: '總表 v2＋v3' },
  { id: 'core-a-river-dragon', set: 'core', season: 'a', kind: 'monster', nameEn: 'River Dragon', cost: 3, copies: 1, effectEn: 'Counts as 5 Force.', effectZh: '算 5 戰力。', note: '第三份來源（Chas 清單）把它列在拱門組，v2、v3 都列在核心盒秋季，這裡採核心盒。', src: '總表 v2＋v3' },
  { id: 'core-a-way-of-the-moneylender', set: 'core', season: 'a', kind: 'warUpgrade', nameEn: 'Way of the Moneylender', cost: 0, copies: 1, timing: '戰爭階段開始時', effectEn: 'Gain 5 Coin.', effectZh: '獲得 5 錢幣。', src: '總表 v2＋v3' },
  { id: 'core-a-form-of-the-kitsune', set: 'core', season: 'a', kind: 'winterUpgrade', nameEn: 'Form of the Kitsune', nameZh: '妖狐形態', cost: 4, copies: 2, timing: '遊戲結束時', effectEn: 'Gain 3 VP for each Stronghold you have.', effectZh: '你每有 1 座堡壘（需在地圖上）得 3 VP。', src: '總表 v2＋v3' },
  { id: 'core-a-form-of-the-phoenix', set: 'core', season: 'a', kind: 'winterUpgrade', nameEn: 'Form of the Phoenix', cost: 3, copies: 2, timing: '遊戲結束時', effectEn: 'Gain 3 VP for each different Virtue you have.', effectZh: '你每有 1 種不同美德得 3 VP。', src: '總表 v2＋v3' },
  { id: 'kickstarter-s-earth-dragon', set: 'kickstarter', season: 's', kind: 'monster', nameEn: 'Earth Dragon', nameZh: '地龍', cost: 3, copies: 1, effectEn: 'Counts as 3 Force. At start of Battle, you may Move 1 figure from each other player out of this Province.', effectZh: '算 3 戰力。戰鬥開始時，可把每位其他玩家的 1 個單位移出此地區。', note: '屬於怪物包還是大名盒不一致：v3 標為怪物包、v2 灰底沒標、官方 FAQ 2.0 把它放在大名盒。', src: '總表 v2＋v3' },
  { id: 'kickstarter-s-jinmenju', set: 'kickstarter', season: 's', kind: 'monster', nameEn: 'Jinmenju', cost: 2, copies: 1, effectEn: 'During a Recruit Mandate, you may Summon a figure in this Province and lose Honor.', effectZh: '徵募令期間，可在此地區召喚 1 個單位並失去榮耀。', note: '兩份總表都標為怪物包。', src: '總表 v2＋v3' },
  { id: 'kickstarter-s-jorogumo', set: 'kickstarter', season: 's', kind: 'monster', nameEn: 'Jorogumo', nameZh: '絡新婦', cost: 3, copies: 1, effectEn: 'At the start of this Battle, take control of 1 local Bushi or Shinto until the end of the Battle.', effectZh: '此地區戰鬥開始時，控制 1 個當地的武士或信徒，直到戰鬥結束。', note: '兩份總表都標為怪物包。', src: '總表 v2＋v3' },
  { id: 'kickstarter-s-kotahi', set: 'kickstarter', season: 's', kind: 'monster', nameEn: 'Kotahi', cost: 1, copies: 1, effectEn: 'You win this Province\'s Harvest Reward if you have the most Force here, no matter who played the Harvest Mandate.', effectZh: '只要你在此地區戰力最多，不論誰打出收穫令，你都贏得此地區的收穫獎勵。', src: '總表 v2＋v3' },
  { id: 'kickstarter-s-phoenix', set: 'kickstarter', season: 's', kind: 'monster', nameEn: 'Phoenix', nameZh: '鳳凰', cost: 1, copies: 1, effectEn: 'If this is killed, gain 1 VP and return it to the same Province immediately.', effectZh: '被殺死時，你得 1 VP，並立刻回到同一地區。', src: '總表 v2＋v3' },
  { id: 'kickstarter-m-fire-dragon', set: 'kickstarter', season: 'm', kind: 'monster', nameEn: 'Fire Dragon', cost: 3, copies: 1, effectEn: 'Counts as 3 Force. At the start of this Battle, kill another local figure from each player (including you).', effectZh: '算 3 戰力。此地區戰鬥開始時，每位玩家（含你）在此地區各被殺死另 1 個單位。', note: '屬於怪物包還是大名盒不一致：v2 灰底標為怪物包、v3 沒標。', src: '總表 v2＋v3' },
  { id: 'kickstarter-m-jikininki', set: 'kickstarter', season: 'm', kind: 'monster', nameEn: 'Jikininki', nameZh: '食人鬼', cost: 2, copies: 1, effectEn: 'Each time another figure is killed in this Province, gain 1 VP and lose Honor.', effectZh: '此地區每有另 1 個單位被殺死，你得 1 VP 並失去榮耀。', src: '總表 v2＋v3' },
  { id: 'kickstarter-m-koneko', set: 'kickstarter', season: 'm', kind: 'monster', nameEn: 'Koneko', cost: 0, copies: 1, effectEn: 'If this is killed, gain 2 Coin and 2 Ronin. Other players in this Province lose 2 Coin and 2 Ronin.', effectZh: '被殺死時，你得 2 錢幣與 2 浪人；此地區的其他玩家各失去 2 錢幣與 2 浪人。', src: '總表 v2＋v3' },
  { id: 'kickstarter-m-nure-onna', set: 'kickstarter', season: 'm', kind: 'monster', nameEn: 'Nure-Onna', nameZh: '濡女', cost: 2, copies: 1, effectEn: 'Counts as 2 Force. Before resolving War in a Province, this may cross a Shipping Route to join that Battle.', effectZh: '算 2 戰力。結算某地區戰爭前，可跨越航線加入該場戰鬥。', src: '總表 v2＋v3' },
  { id: 'kickstarter-m-sunakake-baba', set: 'kickstarter', season: 'm', kind: 'monster', nameEn: 'Sunakake-Baba', nameZh: '撒砂婆婆', cost: 1, copies: 1, timing: '戰爭階段開始時', effectEn: 'You may take hostage a Bushi or Shinto from this Province.', effectZh: '可綁架此地區的 1 個武士或信徒。', note: '費用不一致：v2、v3 寫 1，第三份來源（Chas 整理的怪物與神靈清單）寫 0，這裡先採 1，請看實體卡。', src: '總表 v2＋v3' },
  { id: 'kickstarter-a-daikaiju', set: 'kickstarter', season: 'a', kind: 'monster', nameEn: 'Daikaiju', nameZh: '大怪獸', cost: 5, copies: 1, effectEn: 'Counts as 5 Force. Summon this in the ocean. At the start of the War Phase, place this in any Province and destroy all enemy Strongholds there.', effectZh: '算 5 戰力。召喚在海中；戰爭階段開始時放到任一地區，並摧毀該地區所有敵方堡壘。', src: '總表 v2＋v3' },
  { id: 'kickstarter-a-kitsune', set: 'kickstarter', season: 'a', kind: 'monster', nameEn: 'Kitsune', cost: 0, copies: 1, effectEn: 'Whoever wins this War Province token gains 6 VP.', effectZh: '贏得此地區戰爭地區標記的玩家得 6 VP。', src: '總表 v2＋v3' },
  { id: 'kickstarter-a-oni-of-plagues', set: 'kickstarter', season: 'a', kind: 'monster', nameEn: 'Oni of Plagues', nameZh: '瘟疫之鬼', cost: 1, copies: 1, effectEn: 'Players with higher Honor than you cannot Move figures into this Province.', effectZh: '榮耀比你高的玩家不能把單位移入此地區。', note: '兩份總表都標為怪物包。', src: '總表 v2＋v3' },
  { id: 'kickstarter-a-sacred-warrior', set: 'kickstarter', season: 'a', kind: 'monster', nameEn: 'Sacred Warrior', cost: 0, copies: 1, effectEn: 'Has +1 Force for each Virtue card you have.', effectZh: '你每有 1 張美德卡，+1 戰力。', src: '總表 v2＋v3' },
  { id: 'lucky-s-daikokuten', set: 'lucky', season: 's', kind: 'monster', nameEn: 'Daikokuten', cost: 1, copies: 1, effectEn: 'Counts as 8 Force during a Harvest Mandate.', effectZh: '收穫令期間算 8 戰力。', src: '總表 v2＋v3' },
  { id: 'lucky-s-fukurokuju', set: 'lucky', season: 's', kind: 'monster', nameEn: 'Fukurokuju', nameZh: '福祿壽', cost: 3, copies: 1, effectEn: 'Counts as a Daimyo and as a Stronghold.', effectZh: '算作大名與堡壘。', src: '總表 v2＋v3' },
  { id: 'lucky-s-jurojin', set: 'lucky', season: 's', kind: 'monster', nameEn: 'Jurojin', cost: 1, copies: 1, effectEn: 'Counts as a Virtue card. Gain 3 Coin after you acquire another Virtue card.', effectZh: '算作美德卡；你取得另一張美德卡後，得 3 錢幣。', src: '總表 v2＋v3' },
  { id: 'lucky-m-bishamon', set: 'lucky', season: 'm', kind: 'monster', nameEn: 'Bishamon', cost: 2, copies: 1, effectEn: 'Counts as 4 Force while there is an opposing Monster in the same Province.', effectZh: '同地區有敵方怪物時，算 4 戰力。', src: '總表 v2＋v3' },
  { id: 'lucky-m-hotei', set: 'lucky', season: 'm', kind: 'monster', nameEn: 'Hotei', cost: 2, copies: 1, effectEn: 'Counts as a Shinto. May replace any Shinto when sent to Worship.', effectZh: '算作信徒；派去祭拜時，可取代任一信徒。', src: '總表 v2＋v3' },
  { id: 'lucky-a-benten', set: 'lucky', season: 'a', kind: 'monster', nameEn: 'Benten', nameZh: '辯才天', cost: 2, copies: 1, effectEn: 'When this enters a Province (for any reason), you may force a player to Move 1 of their Monsters out of there.', effectZh: '進入地區時（不論原因），可迫使 1 位玩家把他的 1 隻怪物移出該地區。', src: '總表 v2＋v3' },
  { id: 'lucky-a-ebisu', set: 'lucky', season: 'a', kind: 'monster', nameEn: 'Ebisu', cost: 0, copies: 1, effectEn: 'If this is killed, you gain 8 Coin.', effectZh: '被殺死時，你得 8 錢幣。', src: '總表 v2＋v3' },
  { id: 'archway-s-path-of-the-kenin', set: 'archway', season: 's', kind: 'enhancement', nameEn: 'Path of the Kenin', cost: 2, copies: 2, timing: '武士升級', effectEn: 'After you Summon, you may place an extra Bushi in any of your Strongholds.', effectZh: '召喚後，可在你任一堡壘多放 1 個武士。', src: '總表 v2＋v3' },
  { id: 'archway-s-path-of-the-light', set: 'archway', season: 's', kind: 'enhancement', nameEn: 'Path of the Light', cost: 1, copies: 1, timing: '信徒升級', effectEn: 'At the end of a Recruit Mandate, you may place an extra Shinto on a Shrine.', effectZh: '徵募令結束時，可在神殿多放 1 個信徒。', src: '總表 v2＋v3' },
  { id: 'archway-s-benevolence', set: 'archway', season: 's', kind: 'virtue', nameEn: 'Benevolence', nameZh: '仁慈', cost: 1, copies: 2, effectEn: 'When you spend any Coin, you may give 1 spent Coin to another player. If you do, gain Honor and 2 VP.', effectZh: '花費錢幣時，可把其中 1 枚給另一位玩家；這樣做的話，你獲得榮耀與 2 VP。', src: '總表 v2＋v3' },
  { id: 'archway-m-path-of-the-samurai', set: 'archway', season: 'm', kind: 'enhancement', nameEn: 'Path of the Samurai', cost: 2, copies: 1, timing: '武士升級', effectEn: 'At the end of a Recruit Mandate, you may place an extra Bushi in any Province.', effectZh: '徵募令結束時，可在任一地區多放 1 個武士。', note: '費用兩份總表不一致：v2 寫 1、v3 寫 2，這裡先採 v3 的 2，請看實體卡。', src: '總表 v2＋v3' },
  { id: 'archway-m-oni-of-blood', set: 'archway', season: 'm', kind: 'monster', nameEn: 'Oni of Blood', cost: 3, copies: 1, effectEn: 'Counts as 2 Force, OR 4 Force in any Province where you have the lowest Honor.', effectZh: '在你榮耀最低的任一地區算 4 戰力，其他地區算 2 戰力。', src: '總表 v2＋v3' },
  { id: 'archway-m-oni-of-souls', set: 'archway', season: 'm', kind: 'monster', nameEn: 'Oni of Souls', nameZh: '靈魂之鬼', cost: 2, copies: 1, effectEn: 'If you win a War Province token with this Monster, gain 2 VP for each Oni you have.', effectZh: '以這隻怪物贏得戰爭地區標記時，你每擁有 1 隻鬼得 2 VP。', src: '總表 v2＋v3' },
  { id: 'archway-m-justice', set: 'archway', season: 'm', kind: 'virtue', nameEn: 'Justice', cost: 1, copies: 2, effectEn: 'Gain 3 VP whenever you kill 1 or more figures from a player with lower Honor than you.', effectZh: '每次殺死榮耀比你低的玩家的 1 個以上單位時，得 3 VP。', src: '總表 v2＋v3' },
  { id: 'archway-a-oni-of-hate', set: 'archway', season: 'a', kind: 'monster', nameEn: 'Oni of Hate', cost: 3, copies: 1, effectEn: 'When this enters a Province (for any reason), kill a local Bushi or Shinto from each player with higher Honor than you.', effectZh: '這隻怪物進入地區時（不論原因），從每位榮耀比你高的玩家在該地區的武士或信徒中殺死 1 個。', src: '總表 v2＋v3' },
  { id: 'archway-a-oni-of-spite', set: 'archway', season: 'a', kind: 'monster', nameEn: 'Oni of Spite', cost: 3, copies: 1, effectEn: 'When this enters a Province (for any reason), steal 2 VP from each higher Honor player with any Force there.', effectZh: '這隻怪物進入地區時（不論原因），從每位榮耀比你高、且在該地區有戰力的玩家身上偷 2 VP。', src: '總表 v2＋v3' },
  { id: 'archway-a-way-of-the-katana', set: 'archway', season: 'a', kind: 'warUpgrade', nameEn: 'Way of the Katana', cost: 3, copies: 1, timing: '戰爭階段中', effectEn: 'All your Bushi are 2 Force.', effectZh: '你所有的武士都算 2 戰力。', src: '總表 v2＋v3' },
  { id: 'archway-a-form-of-the-beast', set: 'archway', season: 'a', kind: 'winterUpgrade', nameEn: 'Form of the Beast', nameZh: '野獸形態', cost: 4, copies: 2, timing: '遊戲結束時', effectEn: 'Gain 3 VP for each Monster you have.', effectZh: '你每擁有 1 隻怪物得 3 VP（不必在地圖上）。', src: '總表 v2＋v3' },
  { id: 'horseman-s-path-of-the-ninja', set: 'horseman', season: 's', kind: 'enhancement', nameEn: 'Path of the Ninja', cost: 2, copies: 1, timing: '不榮譽升級', effectEn: 'After you Summon, you may kill any 1 Bushi on the Map and lose Honor.', effectZh: '召喚後，可殺死地圖上任 1 個武士並失去榮耀。', src: '總表 v2＋v3' },
  { id: 'horseman-s-courage', set: 'horseman', season: 's', kind: 'virtue', nameEn: 'Courage', cost: 3, copies: 2, effectEn: 'Gain 2 VP each time you win a War Province token.', effectZh: '每次贏得戰爭地區標記，得 2 VP。', src: '總表 v2＋v3' },
  { id: 'horseman-s-way-of-the-righteous', set: 'horseman', season: 's', kind: 'warUpgrade', nameEn: 'Way of the Righteous', cost: 2, copies: 2, timing: '戰爭階段開始時', effectEn: 'Take 1 Coin from each player with lower Honor than you.', effectZh: '從每位榮耀比你低的玩家拿 1 錢幣。', src: '總表 v2＋v3' },
  { id: 'horseman-m-path-of-the-monkey', set: 'horseman', season: 'm', kind: 'enhancement', nameEn: 'Path of the Monkey', nameZh: '猴子之道', cost: 0, copies: 2, timing: '不榮譽升級', effectEn: 'After you Summon, you may take 1 Coin from the richest opponent(s) and lose Honor.', effectZh: '召喚後，可從最富有的對手拿 1 錢幣並失去榮耀。', src: '總表 v2＋v3' },
  { id: 'horseman-m-oni-of-blood', set: 'horseman', season: 'm', kind: 'monster', nameEn: 'Oni of Blood', cost: 3, copies: 1, effectEn: 'Counts as 2 Force, OR 4 Force in any Province where you have the lowest Honor.', effectZh: '在你榮耀最低的任一地區算 4 戰力，其他地區算 2 戰力。', src: '總表 v2＋v3' },
  { id: 'horseman-m-mercy', set: 'horseman', season: 'm', kind: 'virtue', nameEn: 'Mercy', cost: 1, copies: 2, effectEn: 'When you would kill 1 or more of your opponent\'s figures, you may let them all live and gain 2 VP.', effectZh: '要殺死對手的單位時，可讓他們全部活下來並得 2 VP。', src: '總表 v2＋v3' },
  { id: 'horseman-a-path-of-the-spirit', set: 'horseman', season: 'a', kind: 'enhancement', nameEn: 'Path of the Spirit', cost: 2, copies: 1, effectEn: 'After you Summon, gain 2 Coin and 2 VP if you have the highest Honor.', effectZh: '召喚後，若你榮耀最高，得 2 錢幣與 2 VP。', src: '總表 v2＋v3' },
  { id: 'horseman-a-oni-of-hate', set: 'horseman', season: 'a', kind: 'monster', nameEn: 'Oni of Hate', cost: 3, copies: 1, effectEn: 'When this enters a Province (for any reason), kill a local Bushi or Shinto from each player with higher Honor than you.', effectZh: '這隻怪物進入地區時（不論原因），從每位榮耀比你高的玩家在該地區的武士或信徒中殺死 1 個。', src: '總表 v2＋v3' },
  { id: 'horseman-a-oni-of-spite', set: 'horseman', season: 'a', kind: 'monster', nameEn: 'Oni of Spite', cost: 3, copies: 1, effectEn: 'When this enters a Province (for any reason), steal 2 VP from each higher Honor player with any Force there.', effectZh: '這隻怪物進入地區時（不論原因），從每位榮耀比你高、且在該地區有戰力的玩家身上偷 2 VP。', src: '總表 v2＋v3' },
  { id: 'horseman-a-form-of-the-demon', set: 'horseman', season: 'a', kind: 'winterUpgrade', nameEn: 'Form of the Demon', nameZh: '惡魔形態', cost: 3, copies: 2, timing: '遊戲結束時', effectEn: 'Gain 3 VP for each Oni you have.', effectZh: '你每擁有 1 隻鬼得 3 VP。', src: '總表 v2＋v3' },
  { id: 'teapot-s-path-of-the-patron', set: 'teapot', season: 's', kind: 'enhancement', nameEn: 'Path of the Patron', cost: 2, copies: 1, effectEn: 'After you Summon, gain 2 Coin if you have higher Honor than at least 2 players.', effectZh: '召喚後，若你榮耀高於至少 2 位玩家，得 2 錢幣。', src: '總表 v2＋v3' },
  { id: 'teapot-s-path-of-the-warlord', set: 'teapot', season: 's', kind: 'enhancement', nameEn: 'Path of the Warlord', cost: 1, copies: 2, effectEn: 'After you Summon, gain 1 Coin.', effectZh: '召喚後得 1 錢幣。', src: '總表 v2＋v3' },
  { id: 'teapot-s-honesty', set: 'teapot', season: 's', kind: 'virtue', nameEn: 'Honesty', cost: 0, copies: 2, effectEn: 'While you have an Ally, gain 2 VP each time you select a non-Betray Mandate.', effectZh: '有盟友時，每次選擇非背叛的政策行動，得 2 VP。', src: '總表 v2＋v3' },
  { id: 'teapot-m-way-of-the-merchant', set: 'teapot', season: 'm', kind: 'enhancement', nameEn: 'Way of the Merchant', nameZh: '商人之道', cost: 2, copies: 2, effectEn: 'Whenever a richer player gains any Coins from the common pile, you also gain 1 Coin.', effectZh: '比你富有的玩家從共用堆拿到錢幣時，你也得 1 錢幣。', src: '總表 v2＋v3' },
  { id: 'teapot-m-oni-of-souls', set: 'teapot', season: 'm', kind: 'monster', nameEn: 'Oni of Souls', nameZh: '靈魂之鬼', cost: 2, copies: 1, effectEn: 'If you win a War Province token with this Monster, gain 2 VP for each Oni you have.', effectZh: '以這隻怪物贏得戰爭地區標記時，你每擁有 1 隻鬼得 2 VP。', src: '總表 v2＋v3' },
  { id: 'teapot-m-loyalty', set: 'teapot', season: 'm', kind: 'virtue', nameEn: 'Loyalty', nameZh: '忠誠', cost: 1, copies: 2, effectEn: 'If you have an Ally, whenever you gain 1 or more VP, you gain an extra VP.', effectZh: '有盟友時，每次獲得 1 VP 以上，多得 1 VP。', src: '總表 v2＋v3' },
  { id: 'teapot-a-path-of-the-unrighteous', set: 'teapot', season: 'a', kind: 'enhancement', nameEn: 'Path of the Unrighteous', cost: 0, copies: 2, timing: '不榮譽升級', effectEn: 'Whenever you Betray, you may replace 1 additional figure of any player (even worshiping Shinto).', effectZh: '背叛時，可多替換任一玩家的 1 個單位（含祭拜中的信徒）。', src: '總表 v2＋v3' },
  { id: 'teapot-a-oni-of-hate', set: 'teapot', season: 'a', kind: 'monster', nameEn: 'Oni of Hate', cost: 3, copies: 1, effectEn: 'When this enters a Province (for any reason), kill a local Bushi or Shinto from each player with higher Honor than you.', effectZh: '這隻怪物進入地區時（不論原因），從每位榮耀比你高的玩家在該地區的武士或信徒中殺死 1 個。', src: '總表 v2＋v3' },
  { id: 'teapot-a-form-of-the-kindred', set: 'teapot', season: 'a', kind: 'winterUpgrade', nameEn: 'Form of the Kindred', nameZh: '同族形態', cost: 3, copies: 2, timing: '遊戲結束時', effectEn: 'Gain 3 VP for each Season you had an Ally.', effectZh: '你每有 1 個季節曾有盟友，得 3 VP。', src: '總表 v2＋v3' },
  { id: 'mountain-s-path-of-the-builder', set: 'mountain', season: 's', kind: 'enhancement', nameEn: 'Path of the Builder', nameZh: '建築師之道', cost: 0, copies: 1, effectEn: 'When any player plays a Marshal Mandate, you may build a Stronghold (paying its cost).', effectZh: '任一玩家打出行軍令時，你可以建造堡壘（付費用）。', src: '總表 v2＋v3' },
  { id: 'mountain-s-path-of-the-kannushi', set: 'mountain', season: 's', kind: 'enhancement', nameEn: 'Path of the Kannushi', cost: 2, copies: 2, effectEn: 'During a Marshal Mandate, you may move 1 of your Shinto to a different Shrine.', effectZh: '行軍令期間，可把你的 1 個信徒移到不同神殿。', src: '總表 v2＋v3' },
  { id: 'mountain-s-piety', set: 'mountain', season: 's', kind: 'virtue', nameEn: 'Piety', cost: 1, copies: 2, effectEn: 'If you win a War Province token with a Shinto, gain Honor and 3 VP.', effectZh: '以信徒贏得戰爭地區標記時，獲得榮耀與 3 VP。', src: '總表 v2＋v3' },
  { id: 'mountain-m-path-of-sengoku', set: 'mountain', season: 'm', kind: 'enhancement', nameEn: 'Path of Sengoku', cost: 1, copies: 1, timing: '大名升級', effectEn: 'At the end of any Harvest Mandate, gain the Reward of your Daimyo\'s Province (if you haven\'t already).', effectZh: '任一收穫令結束時，若尚未取得，可獲得你大名所在地區的獎勵。', src: '總表 v2＋v3' },
  { id: 'mountain-m-path-of-the-favored', set: 'mountain', season: 'm', kind: 'enhancement', nameEn: 'Path of the Favored', cost: 1, copies: 1, timing: '信徒升級', effectEn: 'Your Shinto count as 3 Force in Provinces where you have the highest Honor.', effectZh: '在你榮耀最高的地區，你的信徒算 3 戰力。', src: '總表 v2＋v3' },
  { id: 'mountain-m-oni-of-blood', set: 'mountain', season: 'm', kind: 'monster', nameEn: 'Oni of Blood', cost: 3, copies: 1, effectEn: 'Counts as 2 Force, OR 4 Force in any Province where you have the lowest Honor.', effectZh: '在你榮耀最低的任一地區算 4 戰力，其他地區算 2 戰力。', src: '總表 v2＋v3' },
  { id: 'mountain-m-sincerity', set: 'mountain', season: 'm', kind: 'virtue', nameEn: 'Sincerity', cost: 1, copies: 2, effectEn: 'Gain Honor and an additional VP whenever you take a Hostage.', effectZh: '每次綁架人質時，獲得榮耀與額外 1 VP。', src: '總表 v2＋v3' },
  { id: 'mountain-a-oni-of-hate', set: 'mountain', season: 'a', kind: 'monster', nameEn: 'Oni of Hate', cost: 3, copies: 1, effectEn: 'When this enters a Province (for any reason), kill a local Bushi or Shinto from each player with higher Honor than you.', effectZh: '這隻怪物進入地區時（不論原因），從每位榮耀比你高的玩家在該地區的武士或信徒中殺死 1 個。', src: '總表 v2＋v3' },
  { id: 'mountain-a-oni-of-spite', set: 'mountain', season: 'a', kind: 'monster', nameEn: 'Oni of Spite', cost: 3, copies: 1, effectEn: 'When this enters a Province (for any reason), steal 2 VP from each higher Honor player with any Force there.', effectZh: '這隻怪物進入地區時（不論原因），從每位榮耀比你高、且在該地區有戰力的玩家身上偷 2 VP。', src: '總表 v2＋v3' },
  { id: 'mountain-a-way-of-the-keiri', set: 'mountain', season: 'a', kind: 'warUpgrade', nameEn: 'Way of the Keiri', nameZh: '經理之道', cost: 0, copies: 1, timing: '戰爭階段開始時', effectEn: 'Kill up to 2 opposing Bushi or Shinto in your Daimyo\'s Province; gain 3 VP for each.', effectZh: '在你大名所在地區殺死最多 2 個敵方武士或信徒，每個得 3 VP。', src: '總表 v2＋v3' },
  { id: 'mountain-a-form-of-the-tanuki', set: 'mountain', season: 'a', kind: 'winterUpgrade', nameEn: 'Form of the Tanuki', cost: 2, copies: 2, timing: '遊戲結束時', effectEn: 'Gain 2 VP for each different type of Season card you have.', effectZh: '你每有 1 種不同類型的季節卡得 2 VP。', src: '總表 v2＋v3' },
  { id: 'ship-s-path-of-the-pacifist', set: 'ship', season: 's', kind: 'enhancement', nameEn: 'Path of the Pacifist', nameZh: '和平主義者之道', cost: 1, copies: 1, effectEn: 'At the start of Summer and Autumn, gain 4 VP if you don\'t have the most War Province tokens.', effectZh: '夏季與秋季開始時，若你的戰爭地區標記不是最多，得 4 VP。', src: '總表 v2＋v3' },
  { id: 'ship-s-path-of-the-salamander', set: 'ship', season: 's', kind: 'enhancement', nameEn: 'Path of the Salamander', cost: 1, copies: 2, effectEn: 'At the start of Summer and Autumn, gain 3 Coin and lose Honor.', effectZh: '夏季與秋季開始時，得 3 錢幣並失去榮耀。', src: '總表 v2＋v3' },
  { id: 'ship-s-dignity', set: 'ship', season: 's', kind: 'virtue', nameEn: 'Dignity', cost: 1, copies: 2, effectEn: 'Whenever you Summon a Monster, gain 2 VP.', effectZh: '每次召喚怪物時得 2 VP。', src: '總表 v2＋v3' },
  { id: 'ship-m-oni-of-blood', set: 'ship', season: 'm', kind: 'monster', nameEn: 'Oni of Blood', cost: 3, copies: 1, effectEn: 'Counts as 2 Force, OR 4 Force in any Province where you have the lowest Honor.', effectZh: '在你榮耀最低的任一地區算 4 戰力，其他地區算 2 戰力。', src: '總表 v2＋v3' },
  { id: 'ship-m-oni-of-souls', set: 'ship', season: 'm', kind: 'monster', nameEn: 'Oni of Souls', nameZh: '靈魂之鬼', cost: 2, copies: 1, effectEn: 'If you win a War Province token with this Monster, gain 2 VP for each Oni you have.', effectZh: '以這隻怪物贏得戰爭地區標記時，你每擁有 1 隻鬼得 2 VP。', src: '總表 v2＋v3' },
  { id: 'ship-m-patience', set: 'ship', season: 'm', kind: 'virtue', nameEn: 'Patience', cost: 1, copies: 2, effectEn: 'At the end of each Kami Turn, if you don\'t have the most VP, gain 1 VP.', effectZh: '每次神明回合結束時，若你的 VP 不是最多，得 1 VP。', src: '總表 v2＋v3' },
  { id: 'ship-m-way-of-the-ashigaru', set: 'ship', season: 'm', kind: 'warUpgrade', nameEn: 'Way of the Ashigaru', cost: 2, copies: 1, timing: '戰爭階段開始時', effectEn: 'Choose a Province where you have exactly 1 figure and Summon 2 Bushi there.', effectZh: '選擇一個你恰好有 1 個單位的地區，在該處召喚 2 個武士。', src: '總表 v2＋v3' },
  { id: 'ship-a-way-of-the-snake', set: 'ship', season: 'a', kind: 'enhancement', nameEn: 'Way of the Snake', cost: 3, copies: 1, effectEn: 'After each Kami Turn is resolved, you may perform a Betray Mandate.', effectZh: '每次神明回合結算後，可進行一次背叛令。', src: '總表 v2＋v3' },
  { id: 'ship-a-oni-of-hate', set: 'ship', season: 'a', kind: 'monster', nameEn: 'Oni of Hate', cost: 3, copies: 1, effectEn: 'When this enters a Province (for any reason), kill a local Bushi or Shinto from each player with higher Honor than you.', effectZh: '這隻怪物進入地區時（不論原因），從每位榮耀比你高的玩家在該地區的武士或信徒中殺死 1 個。', src: '總表 v2＋v3' },
  { id: 'ship-a-oni-of-spite', set: 'ship', season: 'a', kind: 'monster', nameEn: 'Oni of Spite', cost: 3, copies: 1, effectEn: 'When this enters a Province (for any reason), steal 2 VP from each higher Honor player with any Force there.', effectZh: '這隻怪物進入地區時（不論原因），從每位榮耀比你高、且在該地區有戰力的玩家身上偷 2 VP。', src: '總表 v2＋v3' },
  { id: 'ship-a-form-of-the-dragon', set: 'ship', season: 'a', kind: 'winterUpgrade', nameEn: 'Form of the Dragon', cost: 1, copies: 2, timing: '遊戲結束時', effectEn: 'Gain 1 VP for each War Province Token you have.', effectZh: '你每有 1 個戰爭地區標記得 1 VP。', src: '總表 v2＋v3' },
  { id: 'tower-s-generosity', set: 'tower', season: 's', kind: 'virtue', nameEn: 'Generosity', cost: 0, copies: 2, effectEn: 'After you play a Mandate, you may offer 1 Coin to any player. If they accept, gain Honor.', effectZh: '打出政策行動後，可向任一玩家提供 1 錢幣；對方接受的話，你獲得榮耀。', src: '總表 v2（v3 沒有塔組）' },
  { id: 'tower-s-path-of-the-vassal', set: 'tower', season: 's', kind: 'enhancement', nameEn: 'Path of the Vassal', cost: 0, copies: 2, effectEn: 'After using a Kami\'s shrine ability, you may pay 2 Coins to gain 2 VP.', effectZh: '使用神明的神殿能力後，可付 2 錢幣得 2 VP。', src: '總表 v2（v3 沒有塔組）' },
  { id: 'tower-s-oni-of-souls', set: 'tower', season: 's', kind: 'monster', nameEn: 'Oni of Souls', nameZh: '靈魂之鬼', cost: 2, copies: 1, effectEn: 'If you win a War Province token with this Monster, gain 2 VP for each Oni you have.', effectZh: '以這隻怪物贏得戰爭地區標記時，你每擁有 1 隻鬼得 2 VP。', src: '總表 v2（v3 沒有塔組）' },
  { id: 'tower-m-path-of-might', set: 'tower', season: 'm', kind: 'enhancement', nameEn: 'Path of Might', cost: 1, copies: 2, effectEn: 'Your Bushi in a Province with any Oni have +1 Force.', effectZh: '在有任何鬼的地區，你的武士 +1 戰力。', note: '只有 v2 有塔組，效果文字未對照第二份來源。', src: '總表 v2（v3 沒有塔組）' },
  { id: 'tower-m-path-of-shadow', set: 'tower', season: 'm', kind: 'enhancement', nameEn: 'Path of Shadow', cost: 1, copies: 1, effectEn: 'After you play a Betray Mandate, gain 3 Coins.', effectZh: '打出背叛令後，得 3 錢幣。', src: '總表 v2（v3 沒有塔組）' },
  { id: 'tower-m-way-of-naginata', set: 'tower', season: 'm', kind: 'warUpgrade', nameEn: 'Way of Naginata', cost: 1, copies: 1, timing: '戰爭階段開始時', effectEn: 'Move one of your Bushi to any Province.', effectZh: '把你的 1 個武士移到任一地區。', src: '總表 v2（v3 沒有塔組）' },
  { id: 'tower-m-oni-of-blood', set: 'tower', season: 'm', kind: 'monster', nameEn: 'Oni of Blood', cost: 3, copies: 1, effectEn: 'Counts as 2 Force, OR 4 Force in any Province where you have the lowest Honor.', effectZh: '在你榮耀最低的任一地區算 4 戰力，其他地區算 2 戰力。', src: '總表 v2（v3 沒有塔組）' },
  { id: 'tower-a-form-of-the-fox', set: 'tower', season: 'a', kind: 'winterUpgrade', nameEn: 'Form of the Fox', cost: 3, copies: 2, timing: '遊戲結束時', effectEn: 'Gain 3 VP for each Province where you have exactly 1 figure.', effectZh: '每個你恰好有 1 個單位的地區，得 3 VP。', src: '總表 v2（v3 沒有塔組）' },
  { id: 'tower-a-boldness', set: 'tower', season: 'a', kind: 'virtue', nameEn: 'Boldness', cost: 1, copies: 1, effectEn: 'Gain 4 VP whenever you kill an enemy Oni in a Battle.', effectZh: '在戰鬥中殺死敵方鬼時得 4 VP。', src: '總表 v2（v3 沒有塔組）' },
  { id: 'tower-a-way-of-naginata', set: 'tower', season: 'a', kind: 'warUpgrade', nameEn: 'Way of Naginata', cost: 1, copies: 1, timing: '戰爭階段開始時', effectEn: 'Move one of your Bushi to any Province.', effectZh: '把你的 1 個武士移到任一地區。', src: '總表 v2（v3 沒有塔組）' },
  { id: 'tower-a-oni-of-spite', set: 'tower', season: 'a', kind: 'monster', nameEn: 'Oni of Spite', cost: 3, copies: 1, effectEn: 'When this enters a Province (for any reason), steal 2 VP from each higher Honor player with any Force there.', effectZh: '這隻怪物進入地區時（不論原因），從每位榮耀比你高、且在該地區有戰力的玩家身上偷 2 VP。', src: '總表 v2（v3 沒有塔組）' },
]

export const SEASON_CARD_BY_ID: Record<string, SeasonCard> = Object.fromEntries(
  SEASON_CARDS.map((c) => [c.id, c]),
)


// ===== 神靈降世（Kami Unbound）七位神明：神殿效果（神明回合結算）與神靈效果（神靈單位在地圖上時）=====
// 通則（Chas 清單）：神明回合若被崇拜就登場；算控制者（神殿戰力最高者）的 1 戰力單位；像大名一樣不受背叛、綁架等影響；不能被殺；季末清理時從地圖拿回神殿。
// 中文：雷神、須佐之男為官方 FAQ 2.0 用詞；其餘取自快速複習（risingSun.ts，標待核對）。效果中文為自譯摘要，全部【待核對】。
export type KamiCard = {
  id: string
  nameEn: string
  nameZh: string
  title: string // 神明稱號
  shrineEn: string
  shrineZh: string
  kamiEn: string
  kamiZh: string
  note?: string
}

export const KAMI_RULE_ZH =
  '神明回合若被崇拜才登場；算控制者的 1 戰力單位（控制者是該神殿戰力最高的玩家）；像大名一樣不受背叛、綁架等影響，不能被殺；季末清理時從地圖拿回神殿。'

export const KAMI_CARDS: KamiCard[] = [
  { id: 'kami-amaterasu', nameEn: 'Amaterasu', nameZh: '天照', title: 'Goddess of the Sun', shrineEn: 'Top worshiper moves to the top of the Honor Track.', shrineZh: '神殿最高崇拜者的榮耀標記移到榮耀軌最上方。', kamiEn: 'The figures of the player with the highest Honor in this Province can\'t be killed by other players.', kamiZh: '在這個地區中榮耀最高的玩家，其單位不會被其他玩家殺死。' },
  { id: 'kami-tsukuyomi', nameEn: 'Tsukuyomi', nameZh: '月讀命', title: 'God of the Moon', shrineEn: 'Gain 2 Coin.', shrineZh: '獲得 2 錢幣。', kamiEn: 'Before resolving War in this Province, all players with Force in it gain 4 Coin.', kamiZh: '處理這個地區的戰爭前，所有在此有戰力的玩家各得 4 錢幣。', note: '來源拼成 Tsokuyomi，BGG 討論串另拼 tsukuyomi，這裡統一為 Tsukuyomi。' },
  { id: 'kami-susanoo', nameEn: 'Susanoo', nameZh: '須佐之男', title: 'God of Storms', shrineEn: 'Gain 1 VP per Stronghold.', shrineZh: '你每有 1 座堡壘得 1 VP。', kamiEn: 'Non-Kami figures can\'t move out of this Province.', kamiZh: '非神靈的單位不能離開這個地區。' },
  { id: 'kami-raijin', nameEn: 'Raijin', nameZh: '雷神', title: 'God of Thunder', shrineEn: 'Summon 1 Bushi to any Province.', shrineZh: '在任一地區召喚 1 個武士。', kamiEn: 'Only Bushi and Kami figures count their Force in this Province.', kamiZh: '這個地區只有武士與神靈計算戰力。' },
  { id: 'kami-fujin', nameEn: 'Fujin', nameZh: '風神', title: 'God of the Wind', shrineEn: 'Perform 2 moves (or 1 figure moves 2).', shrineZh: '進行 2 次移動（或 1 個單位移動 2 次）。', kamiEn: 'Double the Harvest rewards in this Province. Winning this War Province token also grants its Harvest reward.', kamiZh: '這個地區的收穫獎勵加倍；贏得這個地區的戰爭地區標記時，也獲得它的收穫獎勵。' },
  { id: 'kami-ryujin', nameEn: 'Ryujin', nameZh: '龍神', title: 'God of the Sea', shrineEn: 'Acquire a Season Card by paying its cost.', shrineZh: '付費用買 1 張季節卡。', kamiEn: 'Ryujin counts as 1 Force for each different type of Season card his controller has.', kamiZh: '龍神的戰力＝控制者擁有的季節卡「不同類型」數。' },
  { id: 'kami-hachiman', nameEn: 'Hachiman', nameZh: '八幡', title: 'God of War and Warriors', shrineEn: 'Gain 2 Ronin.', shrineZh: '獲得 2 個浪人。', kamiEn: 'In this Province, Ronin tokens count as 2 Force each.', kamiZh: '在這個地區，每個浪人標記算 2 戰力。', note: '快速複習寫「贏得雇用浪人時，每個浪人標記算 2 戰力」，比這份來源多了條件，請對照 Kami Unbound 說明紙。' },
]
