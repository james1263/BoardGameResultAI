// 瘋狂詭宅 第二版（Mansions of Madness: Second Edition）怪物圖鑑（結構化，供聚會房間「這場出現過哪些怪物」使用；暫時沒有被任何元件引用）
// 用途：APP 生出怪物後，大家可以快速查這隻怪物的警覺度、恐怖等級、力量值與移動能力；之後可接「已出現」標記與怪物圖片（見 `卡表與資源資料蒐集清單.md` 第 9 節）。
// 來源（2026-11-26 更新）：怪物卡 PDF `MoM_Monster_Cards_v1.pdf`（玩家整理的列印版，共 40 張）逐張對照，40 隻的警覺度／恐怖等級／力量值／移動能力全部與先前快速複習檔的怪物數值表一致；《Rules Reference》第 16～17 頁確認怪物數值的位置（警覺度＝標記正面右上綠色、恐怖等級＝正面右下藍色、力量值＝背面右下紅色）。
// 中文：目前只有「深潛者」（快速複習檔，中文新手冊）與「追獵恐魔」＝Hunting Horror（使用者 2026-11-26 的 APP 中文版截圖，同時確認 APP 怪物插圖與怪物卡 PDF 的插圖相同、APP 生命值 6）有中文名，其他 38 隻 nameZh 留空、顯示時用英文，【待核對】。要補中文名，請使用者拍中文版怪物指示物正面（印有名稱與數值），或再截 APP 怪物選單。
// 怪物卡 PDF 的卡面有：怪物名稱（英文）、能力名稱（Flying／Aquatic／Phasing／Unstoppable，見 MONSTER_ABILITY.nameEn）、一小段氛圍文字（沒收，只是卡面敘述）、左下角擴充圖示（下面 set）。
// set 欄位：依怪物卡左下角圖示判讀，對照 `Mansions_of_Madness_Narrative_Scenario_Order.pdf` 的圖例（鑰匙＝第一版、葉形＝第二版本體、月牙＝Call of the Wild、爪＝Beyond the Threshold、圓環人像＝Streets of Arkham、V 形盾＝Sanctum of Twilight、火車＝Horrific Journeys、蛇鉤＝Path of the Serpent）〔依圖示肉眼判讀，未驗證〕；Byakhee 與 Crawling One 的圖示是燒瓶，圖例沒有，set 標 'unknown'。第一版（'first'）與 Call of the Wild（'cotw'）不在快速複習檔收錄的擴充範圍，這些怪物是否要在使用者的 APP 出現〔未驗證〕。
// 沒收：每隻怪物自己的氛圍文字、怪物激活的移動與攻擊指令（由 APP 產生）。生命值（health）顯示在 APP 怪物選單左上、卡面沒有，目前只有 Hunting Horror 知道（6），其他未填。
// 還沒做：能力中文名稱（飛行、水棲、穿透、勢不可擋是依快速複習檔的用詞，【待核對】；官方英文 Flying／Aquatic／Phasing／Unstoppable）；中文名稱；怪物圖片（見第 9 節，只給 VIP／管理者看的規劃〔未決定〕）。
// 來源不一致已結案：Hound of Tindalos 力量 3、Nightgaunt 有飛行（F），卡面確認採 v6。卡面拼法與先前不同的有 Mi-go（先前寫 Mi-Go）、Child of The Goat（先前寫 of the），這裡改採卡面拼法。
// 沒收 Suppressed Memories、Recurring Nightmares 兩個擴充的怪物，因為沒有規則文件。

export type MonsterAbility = 'F' | 'A' | 'P' | 'U'

export type MonsterSet = 'base' | 'first' | 'cotw' | 'btt' | 'soa' | 'sot' | 'hj' | 'pots' | 'unknown'

export const MONSTER_SET_LABEL: Record<MonsterSet, string> = {
  base: '第二版本體',
  first: '第一版',
  cotw: 'Call of the Wild',
  btt: 'Beyond the Threshold',
  soa: 'Streets of Arkham',
  sot: 'Sanctum of Twilight',
  hj: 'Horrific Journeys',
  pots: 'Path of the Serpent',
  unknown: '未確認（燒瓶圖示）',
}

export type Monster = {
  id: string
  nameEn: string
  nameZh?: string // 官方中文有才填
  health?: number // APP 怪物選單左上角顯示的生命值（卡面沒有，知道才填）
  alert: number // 警覺度（躲避檢定）
  horror: number // 恐怖等級（恐怖檢定）
  might: number // 力量值
  set: MonsterSet // 依卡面左下圖示判讀，未驗證
  abilities: MonsterAbility[] // 空陣列＝沒有移動特殊能力
  note?: string
  src: string
}

export const MONSTER_ABILITY: Record<MonsterAbility, { nameEn: string; nameZh: string; effectZh: string }> = {
  F: { nameEn: 'Flying', nameZh: '飛行', effectZh: '可穿過無法通過的邊界。' },
  A: { nameEn: 'Aquatic', nameZh: '水棲', effectZh: '可穿過代表水的無法通過邊界。' },
  P: { nameEn: 'Phasing', nameZh: '穿透', effectZh: '可穿過無法通過的邊界與牆壁。' },
  U: { nameEn: 'Unstoppable', nameZh: '勢不可擋', effectZh: '試圖破壞屏障時，把所有調查結果當成功結果。' },
}

export const MONSTERS: Monster[] = [
  { id: 'mom-ancient-basilisk', nameEn: 'Ancient Basilisk', alert: 6, horror: 5, might: 5, set: 'pots', abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-child-of-dagon', nameEn: 'Child of Dagon', alert: 4, horror: 3, might: 2, set: 'base', abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-child-of-the-goat', nameEn: 'Child of The Goat', alert: 3, horror: 1, might: 2, set: 'cotw', abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-crawling-one', nameEn: 'Crawling One', alert: 2, horror: 4, might: 4, set: 'unknown', abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-cthonian', nameEn: 'Cthonian', alert: 4, horror: 7, might: 5, set: 'first', abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-cult-leader', nameEn: 'Cult Leader', alert: 4, horror: 3, might: 2, set: 'first', abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-cultist', nameEn: 'Cultist', alert: 3, horror: 1, might: 2, set: 'base', abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-dark-druid', nameEn: 'Dark Druid', alert: 3, horror: 2, might: 2, set: 'cotw', abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-dark-young', nameEn: 'Dark Young', alert: 4, horror: 7, might: 5, set: 'cotw', abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-deep-one-hybrid', nameEn: 'Deep One Hybrid', alert: 3, horror: 1, might: 2, set: 'base', abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-dunwich-horror', nameEn: 'Dunwich Horror', alert: 7, horror: 9, might: 5, set: 'cotw', abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-formless-spawn', nameEn: 'Formless Spawn', alert: 4, horror: 6, might: 4, set: 'hj', abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-goat-spawn', nameEn: 'Goat Spawn', alert: 4, horror: 3, might: 2, set: 'cotw', abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-hired-gun', nameEn: 'Hired Gun', alert: 2, horror: 1, might: 2, set: 'soa', abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-lloigor', nameEn: 'Lloigor', alert: 7, horror: 9, might: 5, set: 'soa', abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-priest-of-dagon', nameEn: 'Priest of Dagon', alert: 4, horror: 3, might: 2, set: 'base', abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-riot', nameEn: 'Riot', alert: 7, horror: 4, might: 4, set: 'base', abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-serpent-person', nameEn: 'Serpent Person', alert: 4, horror: 3, might: 3, set: 'pots', abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-shoggoth', nameEn: 'Shoggoth', alert: 3, horror: 6, might: 4, set: 'first', abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-thrall', nameEn: 'Thrall', alert: 3, horror: 4, might: 2, set: 'btt', abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-witch', nameEn: 'Witch', alert: 3, horror: 2, might: 2, set: 'first', abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-wizard', nameEn: 'Wizard', alert: 4, horror: 3, might: 2, set: 'cotw', abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-warlock', nameEn: 'Warlock', alert: 3, horror: 3, might: 2, set: 'hj', abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-zombie', nameEn: 'Zombie', alert: 2, horror: 4, might: 2, set: 'first', abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-byakhee', nameEn: 'Byakhee', alert: 4, horror: 3, might: 2, set: 'unknown', abilities: ['F'], src: '怪物參考表 v6' },
  { id: 'mom-feathered-serpent', nameEn: 'Feathered Serpent', alert: 3, horror: 2, might: 2, set: 'pots', abilities: ['F'], src: '怪物參考表 v6' },
  { id: 'mom-hunting-horror', nameEn: 'Hunting Horror', nameZh: '追獵恐魔', health: 6, note: 'nameZh 與 health 取自使用者 APP 中文版截圖（2026-11-26），APP 插圖與怪物卡相同', alert: 5, horror: 6, might: 3, set: 'base', abilities: ['F'], src: '怪物參考表 v6' },
  { id: 'mom-mi-go', nameEn: 'Mi-go', alert: 6, horror: 4, might: 3, set: 'first', abilities: ['F'], src: '怪物參考表 v6' },
  { id: 'mom-nightgaunt', nameEn: 'Nightgaunt', alert: 6, horror: 5, might: 3, set: 'cotw', abilities: ['F'], src: '怪物參考表 v6' },
  { id: 'mom-star-spawn', nameEn: 'Star Spawn', alert: 5, horror: 8, might: 5, set: 'base', abilities: ['F'], src: '怪物參考表 v6' },
  { id: 'mom-deep-one', nameEn: 'Deep One', nameZh: '深潛者', alert: 3, horror: 4, might: 2, set: 'base', abilities: ['A'], src: '怪物參考表 v6' },
  { id: 'mom-hunting-deep-one', nameEn: 'Hunting Deep One', alert: 4, horror: 5, might: 4, set: 'hj', abilities: ['A'], src: '怪物參考表 v6' },
  { id: 'mom-skeleton', nameEn: 'Skeleton', alert: 2, horror: 4, might: 2, set: 'soa', abilities: ['A'], src: '怪物參考表 v6' },
  { id: 'mom-dimensional-shambler', nameEn: 'Dimensional Shambler', alert: 4, horror: 5, might: 2, set: 'hj', abilities: ['P'], src: '怪物參考表 v6' },
  { id: 'mom-ghost', nameEn: 'Ghost', alert: 2, horror: 5, might: 1, set: 'base', abilities: ['P'], src: '怪物參考表 v6' },
  { id: 'mom-hound-of-tindalos', nameEn: 'Hound of Tindalos', alert: 6, horror: 5, might: 3, set: 'first', abilities: ['P'], src: '怪物參考表 v6' },
  { id: 'mom-star-vampire', nameEn: 'Star Vampire', alert: 4, horror: 6, might: 3, set: 'soa', abilities: ['P'], src: '怪物參考表 v6' },
  { id: 'mom-wraith', nameEn: 'Wraith', alert: 2, horror: 6, might: 1, set: 'sot', abilities: ['P'], src: '怪物參考表 v6' },
  { id: 'mom-maniac', nameEn: 'Maniac', alert: 5, horror: 1, might: 2, set: 'first', abilities: ['U'], src: '怪物參考表 v6' },
  { id: 'mom-temple-guardian', nameEn: 'Temple Guardian', alert: 4, horror: 4, might: 5, set: 'pots', abilities: ['U'], src: '怪物參考表 v6' },
]

export const MONSTER_BY_ID: Record<string, Monster> = Object.fromEntries(MONSTERS.map((m) => [m.id, m]))
