// 瘋狂詭宅 第二版 怪物名詞長按看圖：名詞編號 → 圖片檔與出處。bggName：'Mansions of Madness: Second Edition'。
// 暫時沒有被任何元件引用；等「名詞長按」功能（`生成後.md` 3.1 ⑦，階段①唯讀試點）做好後再接上。
//
// 名詞編號 id 與 mansionsOfMadnessMonsters.ts 的 id 相同（`mom-*`），之後換成 `game_terms` 的名詞編號時只要照這張表轉。
// 圖片來源：怪物卡 MoM_Monster_Cards_v1.pdf（玩家整理的列印版，英文卡面）；用 200 dpi 把第 1～3 頁轉成圖，每隻怪物各裁一張卡片正面（含插圖、名稱、警覺度、恐怖等級、力量值、移動能力與氛圍文字），縮成寬 300 px 的 webp，共 40 張、約 1.1 MB。卡面插圖是 Fantasy Flight Games 的版權圖。
// 〔使用者決定，2026-11-27〕圖片不公開：只給 VIP／管理者看，放私有 Storage、用簽名網址；這些圖片不要放 public\ 資料夾，也不要 git add；放進私有 bucket 的位置與檔名規則由名詞長按那條主線決定，下面 file 欄位只是暫定（相對路徑）。
// 已核對：使用者 APP 中文版截圖的 Hunting Horror（追獵恐魔）插圖與這張卡相同，所以可以用卡面讓使用者辨認 APP 裡的怪物。
// 注意：卡面文字全是英文（沒有中文版卡面），中文名稱看 mansionsOfMadnessMonsters.ts 的 nameZh（目前只有深潛者與追獵恐魔）。
// 沒有圖的：Suppressed Memories、Recurring Nightmares 兩個擴充的怪物（沒有規則文件，也沒收進怪物圖鑑）；Hunting Horror 以外的怪物生命值（APP 才有，卡面沒有）。

export type MansionsTermImage = {
  file: string // 暫定相對路徑，例：mansions/hunting-horror.webp
  pdfPage: number // 怪物卡 PDF 的頁碼（PDF 頁數）
  cardName: string // 卡面上的英文名稱（拼法照卡面）
}

export const MANSIONS_TERM_IMAGES: Record<string, MansionsTermImage> = {
  'mom-ancient-basilisk': { file: 'mansions/ancient-basilisk.webp', pdfPage: 1, cardName: 'Ancient Basilisk' },
  'mom-byakhee': { file: 'mansions/byakhee.webp', pdfPage: 1, cardName: 'Byakhee' },
  'mom-child-of-dagon': { file: 'mansions/child-of-dagon.webp', pdfPage: 1, cardName: 'Child of Dagon' },
  'mom-child-of-the-goat': { file: 'mansions/child-of-the-goat.webp', pdfPage: 1, cardName: 'Child of The Goat' },
  'mom-crawling-one': { file: 'mansions/crawling-one.webp', pdfPage: 1, cardName: 'Crawling One' },
  'mom-cthonian': { file: 'mansions/cthonian.webp', pdfPage: 1, cardName: 'Cthonian' },
  'mom-cult-leader': { file: 'mansions/cult-leader.webp', pdfPage: 1, cardName: 'Cult Leader' },
  'mom-cultist': { file: 'mansions/cultist.webp', pdfPage: 1, cardName: 'Cultist' },
  'mom-dark-druid': { file: 'mansions/dark-druid.webp', pdfPage: 1, cardName: 'Dark Druid' },
  'mom-dark-young': { file: 'mansions/dark-young.webp', pdfPage: 1, cardName: 'Dark Young' },
  'mom-deep-one': { file: 'mansions/deep-one.webp', pdfPage: 1, cardName: 'Deep One' },
  'mom-deep-one-hybrid': { file: 'mansions/deep-one-hybrid.webp', pdfPage: 1, cardName: 'Deep One Hybrid' },
  'mom-dimensional-shambler': { file: 'mansions/dimensional-shambler.webp', pdfPage: 1, cardName: 'Dimensional Shambler' },
  'mom-dunwich-horror': { file: 'mansions/dunwich-horror.webp', pdfPage: 1, cardName: 'Dunwich Horror' },
  'mom-feathered-serpent': { file: 'mansions/feathered-serpent.webp', pdfPage: 1, cardName: 'Feathered Serpent' },
  'mom-formless-spawn': { file: 'mansions/formless-spawn.webp', pdfPage: 1, cardName: 'Formless Spawn' },
  'mom-ghost': { file: 'mansions/ghost.webp', pdfPage: 2, cardName: 'Ghost' },
  'mom-goat-spawn': { file: 'mansions/goat-spawn.webp', pdfPage: 2, cardName: 'Goat Spawn' },
  'mom-hired-gun': { file: 'mansions/hired-gun.webp', pdfPage: 2, cardName: 'Hired Gun' },
  'mom-hound-of-tindalos': { file: 'mansions/hound-of-tindalos.webp', pdfPage: 2, cardName: 'Hound of Tindalos' },
  'mom-hunting-deep-one': { file: 'mansions/hunting-deep-one.webp', pdfPage: 2, cardName: 'Hunting Deep One' },
  'mom-hunting-horror': { file: 'mansions/hunting-horror.webp', pdfPage: 2, cardName: 'Hunting Horror' },
  'mom-lloigor': { file: 'mansions/lloigor.webp', pdfPage: 2, cardName: 'Lloigor' },
  'mom-maniac': { file: 'mansions/maniac.webp', pdfPage: 2, cardName: 'Maniac' },
  'mom-mi-go': { file: 'mansions/mi-go.webp', pdfPage: 2, cardName: 'Mi-go' },
  'mom-nightgaunt': { file: 'mansions/nightgaunt.webp', pdfPage: 2, cardName: 'Nightgaunt' },
  'mom-priest-of-dagon': { file: 'mansions/priest-of-dagon.webp', pdfPage: 2, cardName: 'Priest of Dagon' },
  'mom-riot': { file: 'mansions/riot.webp', pdfPage: 2, cardName: 'Riot' },
  'mom-serpent-person': { file: 'mansions/serpent-person.webp', pdfPage: 2, cardName: 'Serpent Person' },
  'mom-shoggoth': { file: 'mansions/shoggoth.webp', pdfPage: 2, cardName: 'Shoggoth' },
  'mom-skeleton': { file: 'mansions/skeleton.webp', pdfPage: 2, cardName: 'Skeleton' },
  'mom-star-spawn': { file: 'mansions/star-spawn.webp', pdfPage: 2, cardName: 'Star Spawn' },
  'mom-star-vampire': { file: 'mansions/star-vampire.webp', pdfPage: 3, cardName: 'Star Vampire' },
  'mom-temple-guardian': { file: 'mansions/temple-guardian.webp', pdfPage: 3, cardName: 'Temple Guardian' },
  'mom-thrall': { file: 'mansions/thrall.webp', pdfPage: 3, cardName: 'Thrall' },
  'mom-warlock': { file: 'mansions/warlock.webp', pdfPage: 3, cardName: 'Warlock' },
  'mom-witch': { file: 'mansions/witch.webp', pdfPage: 3, cardName: 'Witch' },
  'mom-wizard': { file: 'mansions/wizard.webp', pdfPage: 3, cardName: 'Wizard' },
  'mom-wraith': { file: 'mansions/wraith.webp', pdfPage: 3, cardName: 'Wraith' },
  'mom-zombie': { file: 'mansions/zombie.webp', pdfPage: 3, cardName: 'Zombie' },
}
