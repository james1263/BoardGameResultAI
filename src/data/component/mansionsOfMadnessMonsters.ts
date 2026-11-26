// 瘋狂詭宅 第二版（Mansions of Madness: Second Edition）怪物圖鑑（結構化，供聚會房間「這場出現過哪些怪物」使用；暫時沒有被任何元件引用）
// 用途：APP 生出怪物後，大家可以快速查這隻怪物的警覺度、恐怖等級、力量值與移動能力；之後可接「已出現」標記。
// 來源：直接取自本專案快速複習檔 mansionsOfMadness.ts 的「怪物數值表」區塊（原始來源＝怪物參考表 v6，含 Path of the Serpent；舊版怪物表只用來對照）。這個檔沒有再看過原始怪物參考表〔未驗證〕。
// 中文：中文新手冊只出現「深潛者」，其他怪物名稱都沒有中文資料，nameZh 留空、顯示時用英文，【待核對】。
// 數值順序＝警覺度（躲避檢定用）／恐怖等級（恐怖檢定用）／力量值（物理戰力，屏障等效果用）。
// 沒收：每隻怪物自己的特殊能力文字與簡介（寫在怪物指示物背面，快速複習檔沒有）、怪物屬於哪個擴充或劇本、怪物激活的移動與攻擊指令（由 APP 產生）。
// 還沒做：能力中文名稱（飛行、水棲、穿透、勢不可擋是依快速複習檔的用詞，【待核對】）；單隻怪物的特殊能力文字要等使用者提供來源。
// 來源不一致（取自快速複習檔）：Hound of Tindalos 力量，舊版表 5、v6 為 3，這裡採 v6；Nightgaunt 舊版表無能力、v6 標飛行（F），這裡採 v6。
// 沒收 Suppressed Memories、Recurring Nightmares 兩個擴充的怪物，因為沒有規則文件。

export type MonsterAbility = 'F' | 'A' | 'P' | 'U'

export type Monster = {
  id: string
  nameEn: string
  nameZh?: string // 官方中文有才填
  alert: number // 警覺度（躲避檢定）
  horror: number // 恐怖等級（恐怖檢定）
  might: number // 力量值
  abilities: MonsterAbility[] // 空陣列＝沒有移動特殊能力
  note?: string
  src: string
}

export const MONSTER_ABILITY: Record<MonsterAbility, { nameZh: string; effectZh: string }> = {
  F: { nameZh: '飛行', effectZh: '可穿過無法通過的邊界。' },
  A: { nameZh: '水棲', effectZh: '可穿過代表水的無法通過邊界。' },
  P: { nameZh: '穿透', effectZh: '可穿過無法通過的邊界與牆壁。' },
  U: { nameZh: '勢不可擋', effectZh: '破壞屏障時，把所有調查結果當成功結果。' },
}

export const MONSTERS: Monster[] = [
  { id: 'mom-ancient-basilisk', nameEn: 'Ancient Basilisk', alert: 6, horror: 5, might: 5, abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-child-of-dagon', nameEn: 'Child of Dagon', alert: 4, horror: 3, might: 2, abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-child-of-the-goat', nameEn: 'Child of the Goat', alert: 3, horror: 1, might: 2, abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-crawling-one', nameEn: 'Crawling One', alert: 2, horror: 4, might: 4, abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-cthonian', nameEn: 'Cthonian', alert: 4, horror: 7, might: 5, abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-cult-leader', nameEn: 'Cult Leader', alert: 4, horror: 3, might: 2, abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-cultist', nameEn: 'Cultist', alert: 3, horror: 1, might: 2, abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-dark-druid', nameEn: 'Dark Druid', alert: 3, horror: 2, might: 2, abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-dark-young', nameEn: 'Dark Young', alert: 4, horror: 7, might: 5, abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-deep-one-hybrid', nameEn: 'Deep One Hybrid', alert: 3, horror: 1, might: 2, abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-dunwich-horror', nameEn: 'Dunwich Horror', alert: 7, horror: 9, might: 5, abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-formless-spawn', nameEn: 'Formless Spawn', alert: 4, horror: 6, might: 4, abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-goat-spawn', nameEn: 'Goat Spawn', alert: 4, horror: 3, might: 2, abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-hired-gun', nameEn: 'Hired Gun', alert: 2, horror: 1, might: 2, abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-lloigor', nameEn: 'Lloigor', alert: 7, horror: 9, might: 5, abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-priest-of-dagon', nameEn: 'Priest of Dagon', alert: 4, horror: 3, might: 2, abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-riot', nameEn: 'Riot', alert: 7, horror: 4, might: 4, abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-serpent-person', nameEn: 'Serpent Person', alert: 4, horror: 3, might: 3, abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-shoggoth', nameEn: 'Shoggoth', alert: 3, horror: 6, might: 4, abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-thrall', nameEn: 'Thrall', alert: 3, horror: 4, might: 2, abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-witch', nameEn: 'Witch', alert: 3, horror: 2, might: 2, abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-wizard', nameEn: 'Wizard', alert: 4, horror: 3, might: 2, abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-warlock', nameEn: 'Warlock', alert: 3, horror: 3, might: 2, abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-zombie', nameEn: 'Zombie', alert: 2, horror: 4, might: 2, abilities: [], src: '怪物參考表 v6' },
  { id: 'mom-byakhee', nameEn: 'Byakhee', alert: 4, horror: 3, might: 2, abilities: ['F'], src: '怪物參考表 v6' },
  { id: 'mom-feathered-serpent', nameEn: 'Feathered Serpent', alert: 3, horror: 2, might: 2, abilities: ['F'], src: '怪物參考表 v6' },
  { id: 'mom-hunting-horror', nameEn: 'Hunting Horror', alert: 5, horror: 6, might: 3, abilities: ['F'], src: '怪物參考表 v6' },
  { id: 'mom-mi-go', nameEn: 'Mi-Go', alert: 6, horror: 4, might: 3, abilities: ['F'], src: '怪物參考表 v6' },
  { id: 'mom-nightgaunt', nameEn: 'Nightgaunt', alert: 6, horror: 5, might: 3, abilities: ['F'], src: '怪物參考表 v6' },
  { id: 'mom-star-spawn', nameEn: 'Star Spawn', alert: 5, horror: 8, might: 5, abilities: ['F'], src: '怪物參考表 v6' },
  { id: 'mom-deep-one', nameEn: 'Deep One', nameZh: '深潛者', alert: 3, horror: 4, might: 2, abilities: ['A'], src: '怪物參考表 v6' },
  { id: 'mom-hunting-deep-one', nameEn: 'Hunting Deep One', alert: 4, horror: 5, might: 4, abilities: ['A'], src: '怪物參考表 v6' },
  { id: 'mom-skeleton', nameEn: 'Skeleton', alert: 2, horror: 4, might: 2, abilities: ['A'], src: '怪物參考表 v6' },
  { id: 'mom-dimensional-shambler', nameEn: 'Dimensional Shambler', alert: 4, horror: 5, might: 2, abilities: ['P'], src: '怪物參考表 v6' },
  { id: 'mom-ghost', nameEn: 'Ghost', alert: 2, horror: 5, might: 1, abilities: ['P'], src: '怪物參考表 v6' },
  { id: 'mom-hound-of-tindalos', nameEn: 'Hound of Tindalos', alert: 6, horror: 5, might: 3, abilities: ['P'], src: '怪物參考表 v6' },
  { id: 'mom-star-vampire', nameEn: 'Star Vampire', alert: 4, horror: 6, might: 3, abilities: ['P'], src: '怪物參考表 v6' },
  { id: 'mom-wraith', nameEn: 'Wraith', alert: 2, horror: 6, might: 1, abilities: ['P'], src: '怪物參考表 v6' },
  { id: 'mom-maniac', nameEn: 'Maniac', alert: 5, horror: 1, might: 2, abilities: ['U'], src: '怪物參考表 v6' },
  { id: 'mom-temple-guardian', nameEn: 'Temple Guardian', alert: 4, horror: 4, might: 5, abilities: ['U'], src: '怪物參考表 v6' },
]

export const MONSTER_BY_ID: Record<string, Monster> = Object.fromEntries(MONSTERS.map((m) => [m.id, m]))
