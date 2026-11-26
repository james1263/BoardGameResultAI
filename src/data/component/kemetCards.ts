// 聖域（Kemet: Blood and Sand）神力板塊與眾神資料（結構化，供聚會房間「持有物」使用；暫時沒有被任何元件引用）
// 格式比照旭日的 risingSunCards.ts：每張板塊一筆，欄位有顏色、等級、類型、張數、效果；用 id 當持有物的鍵。
// 來源：Kemet 玩家輔助 Kemet_player_aid_2024_v50_EN.pdf（KBS-Aid_EN_rev50_2024-06-02，英文，PDF 頁碼：2 紅寶石、3 藍寶石、4 鑽石、5 黑瑪瑙、6 紫水晶、7 琥珀、8 綠寶石、9 神祇板塊、11 埃及眾神）。
// 中文：官方沒有取得繁中規則書，卡名全部用英文（沒有 nameZh）；效果 zh 是依玩家輔助英文自譯的摘要，用詞沿用 kemet.ts（PP 祈禱點數、FP 名聲點數、LP 生命點數、神諭卡、部隊、單位、城區、夥伴），全部【待核對】。
// 英文效果原文不收（規則書不公開，也不在介面上顯示英文）；要核對請對照玩家輔助。
// 費用：cost＝等級（依板塊左上角 PP 圖示數判讀，1～4 級各 1～4 PP；〔未驗證〕，有疑問以實物為準）。
// 張數 copies：1 級板塊每種 2 張（Onyx 1 級的 Sword／Spear 傭兵各 1 張、Recrutement Local 2 張，是依玩家輔助圖面判讀〔待核對〕）；其餘 1 張。
// 更新板塊（renewal）：Game Up 附的板塊，設置時只能取代同顏色的 3 級 Domination；gameUp 欄是 BGG 玩家整理的對照（非官方，見 kemetUnofficial.ts），21 張分組已與 v50 玩家輔助逐張對過，一致。
// 板塊名稱裡有幾個法文是玩家輔助原樣印的（Recrutement Local、Culte Sombre、Retour de l'Au-delà、Sombres Serviteurs、Barque Solaire、Rituel des Morts、Construction Funéraire、Renfort Surnaturel、Renfort、Volonté Divine），照印。
// 沒收：神諭卡（DI）與戰鬥卡（是手牌、不是持有的板塊，已在 kemet.ts「神諭卡一覽」「戰鬥卡一覽」）；眾神的 LP 格數（玩家輔助圖面看不清楚）。
// 還沒做：與 FAQ 的對應連結（kemetUnofficial.ts 各條）；各板塊的實際 PP 費用若有例外。

export type KemetColor = 'ruby' | 'sapphire' | 'diamond' | 'onyx' | 'amethyst' | 'amber' | 'emerald'
export type KemetTileKind = 'normal' | 'renewal' | 'divinity'
export type KemetTileSet = 'core' | 'gameup' | 'dead'
export type KemetCompanion = 'creature' | 'servant' | 'divinity'

export type KemetEffect = {
  timing: string // 例如「戰鬥」「移動行動」「夜晚・覺醒步驟」「取得時」
  zh: string // 自譯摘要，【待核對】
  tied?: boolean // true＝綁定部隊的夥伴效果（生物、僕從、神祇綁在哪支部隊，哪支部隊才有）
}

export type KemetPowerTile = {
  id: string
  color: KemetColor
  level: 1 | 2 | 3 | 4
  kind: KemetTileKind
  set: KemetTileSet
  nameEn: string
  altNameEn?: string // 埃及眾神換成 Great Old Ones 公仔時的名字（板塊效果相同）
  nameZh?: string // 目前沒有官方中文名，全部留空
  cost: number
  copies: number
  companion?: KemetCompanion
  gameUp?: string // 更新板塊所屬的 Game Up（BGG 玩家整理，非官方）
  effects: KemetEffect[]
  note?: string
  src: string
}

export const KEMET_COLOR_LABEL: Record<KemetColor, string> = {
  ruby: '紅寶石',
  sapphire: '藍寶石',
  diamond: '鑽石（白）',
  onyx: '黑瑪瑙（黑）',
  amethyst: '紫水晶（紫）',
  amber: '琥珀（橘）',
  emerald: '綠寶石（綠）',
}

export const KEMET_COLOR_ORDER: KemetColor[] = ['ruby', 'sapphire', 'diamond', 'onyx', 'amethyst', 'amber', 'emerald']

export const KEMET_KIND_LABEL: Record<KemetTileKind, string> = {
  normal: '一般',
  renewal: '更新板塊',
  divinity: '神祇板塊',
}

export const KEMET_TILE_SETS: Record<KemetTileSet, string> = {
  core: '本體（Rise of the Gods）',
  gameup: 'Game Up 更新板塊',
  dead: '死者之書（綠寶石 4 級神祇）',
}

export const KEMET_COMPANION_LABEL: Record<KemetCompanion, string> = {
  creature: '生物',
  servant: '僕從',
  divinity: '神祇',
}

export const KEMET_POWER_TILES: KemetPowerTile[] = [
  { id: 'ruby-1-charge', color: 'ruby', level: 1, kind: 'normal', set: 'core', nameEn: 'Charge', cost: 1, copies: 2, effects: [{ timing: '戰鬥・攻擊', zh: '你的部隊 +1 力量。' }], src: '玩家輔助 v50 第 2 頁' },
  { id: 'ruby-1-priest-of-mafdet', color: 'ruby', level: 1, kind: 'normal', set: 'core', nameEn: 'Priest of Mafdet', cost: 1, copies: 2, effects: [{ timing: '移動行動', zh: '你的部隊 +1 陸地移動。' }], src: '玩家輔助 v50 第 2 頁' },
  { id: 'ruby-2-carnage', color: 'ruby', level: 2, kind: 'normal', set: 'core', nameEn: 'Carnage', cost: 2, copies: 1, effects: [{ timing: '戰鬥', zh: '你的部隊 +1 傷害。' }], src: '玩家輔助 v50 第 2 頁' },
  { id: 'ruby-2-wrryt-storm', color: 'ruby', level: 2, kind: 'normal', set: 'core', nameEn: 'Wrryt Storm', cost: 2, copies: 1, effects: [{ timing: '取得時', zh: '收回手上所有戰鬥卡，再從遊戲中移除 1 張（保密），換成特殊戰鬥卡「Wrryt Storm」。' }], src: '玩家輔助 v50 第 2 頁' },
  { id: 'ruby-2-phoenix', color: 'ruby', level: 2, kind: 'normal', set: 'core', nameEn: 'Phoenix', cost: 2, copies: 1, companion: 'creature', effects: [{ timing: '移動行動', zh: '+1 陸地移動；此部隊可進入 1 個對手城區，不必從相鄰區域出發。', tied: true }, { timing: '戰鬥', zh: '+1 力量。', tied: true }], src: '玩家輔助 v50 第 2 頁' },
  { id: 'ruby-2-dimensional-portal', color: 'ruby', level: 2, kind: 'normal', set: 'core', nameEn: 'Dimensional Portal', cost: 2, copies: 1, effects: [{ timing: '移動行動', zh: '你的傳送費用 −1 PP（最低 0），且可從方尖碑區域出發傳送。' }], src: '玩家輔助 v50 第 2 頁' },
  { id: 'ruby-3-royal-scarab', color: 'ruby', level: 3, kind: 'normal', set: 'core', nameEn: 'Royal Scarab', cost: 3, copies: 1, companion: 'creature', effects: [{ timing: '移動行動', zh: '+2 陸地移動。', tied: true }, { timing: '戰鬥', zh: '+2 力量。', tied: true }], src: '玩家輔助 v50 第 2 頁' },
  { id: 'ruby-3-blade-of-neith', color: 'ruby', level: 3, kind: 'normal', set: 'core', nameEn: 'Blade of Neith', cost: 3, copies: 1, effects: [{ timing: '戰鬥', zh: '你的部隊 +1 力量。' }], src: '玩家輔助 v50 第 2 頁' },
  { id: 'ruby-3-divine-wound', color: 'ruby', level: 3, kind: 'normal', set: 'core', nameEn: 'Divine Wound', cost: 3, copies: 1, effects: [{ timing: '戰鬥・對峙步驟結束時', zh: '可從手牌棄掉神諭卡；每棄 1 張，你的部隊 +1 力量。' }], src: '玩家輔助 v50 第 2 頁' },
  { id: 'ruby-3-domination', color: 'ruby', level: 3, kind: 'normal', set: 'core', nameEn: 'Domination', cost: 3, copies: 1, effects: [{ timing: '取得時', zh: '獲得 1 神明 FP。' }], src: '玩家輔助 v50 第 2 頁' },
  { id: 'ruby-3-omniscience', color: 'ruby', level: 3, kind: 'renewal', set: 'gameup', nameEn: 'Omniscience', cost: 3, copies: 1, gameUp: 'Sand Worm', effects: [{ timing: '戰鬥・戰爭議會步驟', zh: '對手要在你選戰鬥卡與神諭卡之前，先向你展示他打出的神諭卡（不含戰鬥卡）。' }], src: '玩家輔助 v50 第 2 頁' },
  { id: 'ruby-3-sacred-bull', color: 'ruby', level: 3, kind: 'renewal', set: 'gameup', nameEn: 'Sacred Bull', cost: 3, copies: 1, companion: 'creature', gameUp: 'Sacred Bull', effects: [{ timing: '取得／招募行動', zh: '用取得或招募行動把 Sacred Bull 放進部隊時，該行動結束後可免費對這支部隊進行 1 次移動行動。' }, { timing: '移動行動', zh: '+2 陸地移動。', tied: true }, { timing: '戰鬥', zh: '+2 力量。', tied: true }], src: '玩家輔助 v50 第 2 頁' },
  { id: 'ruby-3-tactical-adaptation', color: 'ruby', level: 3, kind: 'renewal', set: 'gameup', nameEn: 'Tactical Adaptation', cost: 3, copies: 1, gameUp: 'Hippo', effects: [{ timing: '戰鬥・攻擊', zh: '你的部隊 +1 傷害。' }, { timing: '戰鬥・防守', zh: '你的部隊 +1 護盾。' }], src: '玩家輔助 v50 第 2 頁' },
  { id: 'ruby-4-giant-scorpion', color: 'ruby', level: 4, kind: 'normal', set: 'core', nameEn: 'Giant Scorpion', cost: 4, copies: 1, companion: 'creature', effects: [{ timing: '移動行動', zh: '+1 陸地移動。', tied: true }, { timing: '戰鬥', zh: '+2 力量、+2 傷害。', tied: true }], src: '玩家輔助 v50 第 2 頁' },
  { id: 'ruby-4-initiative', color: 'ruby', level: 4, kind: 'normal', set: 'core', nameEn: 'Initiative', cost: 4, copies: 1, effects: [{ timing: '戰鬥・攻擊', zh: '你的部隊 +1 力量、+1 傷害、+1 無法阻擋傷害。' }, { timing: '戰鬥・防守', zh: '你的部隊 +1 傷害、+1 無法阻擋傷害。' }], src: '玩家輔助 v50 第 2 頁' },
  { id: 'ruby-4-surprise-attack', color: 'ruby', level: 4, kind: 'normal', set: 'core', nameEn: 'Surprise Attack', cost: 4, copies: 1, effects: [{ timing: '金色行動', zh: '進行 1 次移動行動，期間你的部隊可進入 1 個對手城區，不必從相鄰區域出發。' }], src: '玩家輔助 v50 第 2 頁' },
  { id: 'ruby-4-act-of-god', color: 'ruby', level: 4, kind: 'normal', set: 'core', nameEn: 'Act of God', cost: 4, copies: 1, effects: [{ timing: '取得時', zh: '獲得 1 個銀色行動標記。' }], src: '玩家輔助 v50 第 2 頁' },
  { id: 'sapphire-1-recruiting-scribe', color: 'sapphire', level: 1, kind: 'normal', set: 'core', nameEn: 'Recruiting Scribe', cost: 1, copies: 2, effects: [{ timing: '招募行動', zh: '免費增加至多 3 個單位。' }], src: '玩家輔助 v50 第 3 頁' },
  { id: 'sapphire-1-defense', color: 'sapphire', level: 1, kind: 'normal', set: 'core', nameEn: 'Defense!', cost: 1, copies: 2, effects: [{ timing: '戰鬥・防守', zh: '你的部隊 +1 力量。' }], src: '玩家輔助 v50 第 3 頁' },
  { id: 'sapphire-2-reinforcement-prayer', color: 'sapphire', level: 2, kind: 'normal', set: 'core', nameEn: 'Reinforcement Prayer', cost: 2, copies: 1, effects: [{ timing: '祈禱行動', zh: '可免費在你的城區中共增加至多 2 個單位；之後可能觸發戰鬥，比照招募行動處理。' }], src: '玩家輔助 v50 第 3 頁' },
  { id: 'sapphire-2-ancestral-elephant', color: 'sapphire', level: 2, kind: 'normal', set: 'core', nameEn: 'Ancestral Elephant', cost: 2, copies: 1, companion: 'creature', effects: [{ timing: '移動行動', zh: '+1 陸地移動。', tied: true }, { timing: '戰鬥', zh: '+1 力量、+1 護盾。', tied: true }], src: '玩家輔助 v50 第 3 頁' },
  { id: 'sapphire-2-shetyw-barrier', color: 'sapphire', level: 2, kind: 'normal', set: 'core', nameEn: 'Shetyw Barrier', cost: 2, copies: 1, effects: [{ timing: '取得時', zh: '收回手上所有戰鬥卡，再從遊戲中移除 1 張（保密），換成特殊戰鬥卡「Shetyw Barrier」。（戰鬥卡一覽把這張叫 Shetyw Defense）' }], src: '玩家輔助 v50 第 3 頁' },
  { id: 'sapphire-2-shield-of-neith', color: 'sapphire', level: 2, kind: 'normal', set: 'core', nameEn: 'Shield of Neith', cost: 2, copies: 1, effects: [{ timing: '戰鬥', zh: '你的部隊 +1 護盾。' }], src: '玩家輔助 v50 第 3 頁' },
  { id: 'sapphire-3-legion', color: 'sapphire', level: 3, kind: 'normal', set: 'core', nameEn: 'Legion', cost: 3, copies: 1, effects: [{ timing: '持續', zh: '你的部隊上限變成 7 個單位（原本 5）；不適用於混合部隊。' }], src: '玩家輔助 v50 第 3 頁' },
  { id: 'sapphire-3-defensive-victory', color: 'sapphire', level: 3, kind: 'normal', set: 'core', nameEn: 'Defensive Victory', cost: 3, copies: 1, effects: [{ timing: '戰鬥・防守・獎勵步驟', zh: '你若為勝者，且在戰鬥發生的區域仍有部隊，獲得 1 戰鬥 FP。' }], src: '玩家輔助 v50 第 3 頁' },
  { id: 'sapphire-3-spy', color: 'sapphire', level: 3, kind: 'normal', set: 'core', nameEn: 'Spy', cost: 3, copies: 1, effects: [{ timing: '戰鬥・戰爭議會步驟', zh: '對手要在你選戰鬥卡與神諭卡之前，先向你展示他打出的戰鬥卡（不含神諭卡）。' }], src: '玩家輔助 v50 第 3 頁' },
  { id: 'sapphire-3-domination', color: 'sapphire', level: 3, kind: 'normal', set: 'core', nameEn: 'Domination', cost: 3, copies: 1, effects: [{ timing: '取得時', zh: '獲得 1 神明 FP。' }], src: '玩家輔助 v50 第 3 頁' },
  { id: 'sapphire-3-perfect-architecture', color: 'sapphire', level: 3, kind: 'renewal', set: 'gameup', nameEn: 'Perfect Architecture', cost: 3, copies: 1, gameUp: 'Sacred Bull', effects: [{ timing: '持續', zh: '你自己城區內每有 1 座 3 級或 4 級金字塔，獲得 1 金字塔 FP（每座最多 1 FP）。控制你 3 級金字塔的對手不會獲得相關的金字塔 FP，你也沒有；你控制別人的 3 級金字塔也不會得 FP（設計師 2020 年回覆）。' }], note: '設計師 Jacques Bariot 2020 年回覆見 kemetUnofficial.ts。', src: '玩家輔助 v50 第 3 頁' },
  { id: 'sapphire-3-sandworm', color: 'sapphire', level: 3, kind: 'renewal', set: 'gameup', nameEn: 'Sandworm', cost: 3, copies: 1, companion: 'creature', gameUp: 'Sand Worm', effects: [{ timing: '取得時', zh: '把 Sandworm 放進你的供應區。' }, { timing: '招募行動', zh: '可這樣放它上場：在非城區的空區域免費增加至多 2 個單位，並把 Sandworm 放在那裡；之後可付 PP 在該區域增加單位。Sandworm 不能待在城區，城區也不是它所綁部隊的可撤退區域。' }, { timing: '移動行動', zh: '+1 陸地移動。', tied: true }, { timing: '戰鬥', zh: '+2 力量。', tied: true }], src: '玩家輔助 v50 第 3 頁' },
  { id: 'sapphire-3-urban-combat', color: 'sapphire', level: 3, kind: 'renewal', set: 'gameup', nameEn: 'Urban Combat', cost: 3, copies: 1, gameUp: 'Baboon', effects: [{ timing: '戰鬥', zh: '你的部隊在你的城市中 +1 力量。' }, { timing: '移動行動', zh: '你的部隊可進入 1 個對手城區，不必從相鄰區域出發。' }], src: '玩家輔助 v50 第 3 頁' },
  { id: 'sapphire-4-renfort', color: 'sapphire', level: 4, kind: 'normal', set: 'core', nameEn: 'Renfort', cost: 4, copies: 1, effects: [{ timing: '招募行動', zh: '免費增加任意數量的單位。' }], src: '玩家輔助 v50 第 3 頁' },
  { id: 'sapphire-4-sphinx', color: 'sapphire', level: 4, kind: 'normal', set: 'core', nameEn: 'Sphinx', cost: 4, copies: 1, companion: 'creature', effects: [{ timing: '取得時', zh: '獲得 1 神明 FP。' }, { timing: '移動行動', zh: '+1 陸地移動。', tied: true }, { timing: '戰鬥', zh: '+2 力量。', tied: true }], src: '玩家輔助 v50 第 3 頁' },
  { id: 'sapphire-4-volonte-divine', color: 'sapphire', level: 4, kind: 'normal', set: 'core', nameEn: 'Volonté Divine', cost: 4, copies: 1, effects: [{ timing: '金色行動', zh: '進行 1 次移動行動或 1 次招募行動。' }], src: '玩家輔助 v50 第 3 頁' },
  { id: 'sapphire-4-act-of-god', color: 'sapphire', level: 4, kind: 'normal', set: 'core', nameEn: 'Act of God', cost: 4, copies: 1, effects: [{ timing: '取得時', zh: '獲得 1 個銀色行動標記。' }], src: '玩家輔助 v50 第 3 頁' },
  { id: 'diamond-1-priest', color: 'diamond', level: 1, kind: 'normal', set: 'core', nameEn: 'Priest', cost: 1, copies: 2, effects: [{ timing: '祈禱行動', zh: '獲得 +1 PP。' }], src: '玩家輔助 v50 第 4 頁' },
  { id: 'diamond-1-priestess', color: 'diamond', level: 1, kind: 'normal', set: 'core', nameEn: 'Priestess', cost: 1, copies: 2, effects: [{ timing: '取得行動', zh: '每張神力板塊的費用 −1 PP（最低 0）。' }], src: '玩家輔助 v50 第 4 頁' },
  { id: 'diamond-2-magical-support', color: 'diamond', level: 2, kind: 'normal', set: 'core', nameEn: 'Magical Support', cost: 2, copies: 1, effects: [{ timing: '建造行動', zh: '每一層的費用 −1 PP（最低 0），即使同一次建造行動加多層也每層都減。' }], src: '玩家輔助 v50 第 4 頁' },
  { id: 'diamond-2-deep-desert-snake', color: 'diamond', level: 2, kind: 'normal', set: 'core', nameEn: 'Deep Desert Snake', cost: 2, copies: 1, companion: 'creature', effects: [{ timing: '移動行動', zh: '+1 陸地移動。', tied: true }, { timing: '戰鬥', zh: '此部隊無視對手部隊所綁生物的效果與加成。', tied: true }], src: '玩家輔助 v50 第 4 頁' },
  { id: 'diamond-2-vision', color: 'diamond', level: 2, kind: 'normal', set: 'core', nameEn: 'Vision', cost: 2, copies: 1, effects: [{ timing: '夜晚・神諭步驟', zh: '額外抽 4 張神諭卡加入手牌，然後棄掉 4 張神諭卡。' }], src: '玩家輔助 v50 第 4 頁' },
  { id: 'diamond-2-divine-boon', color: 'diamond', level: 2, kind: 'normal', set: 'core', nameEn: 'Divine Boon', cost: 2, copies: 1, effects: [{ timing: '夜晚・神諭步驟', zh: '額外抽 1 張神諭卡。' }], src: '玩家輔助 v50 第 4 頁' },
  { id: 'diamond-3-hand-of-god', color: 'diamond', level: 3, kind: 'normal', set: 'core', nameEn: 'Hand of God', cost: 3, copies: 1, effects: [{ timing: '夜晚・覺醒步驟', zh: '可進行 1 次建造行動，免費為你的 1 座金字塔加 1 層。' }], src: '玩家輔助 v50 第 4 頁' },
  { id: 'diamond-3-divine-hunger', color: 'diamond', level: 3, kind: 'normal', set: 'core', nameEn: 'Divine Hunger', cost: 3, copies: 1, effects: [{ timing: '戰鬥・傷亡步驟結束時', zh: '你的傷害每移除 1 個對手單位，獲得 2 PP；這些 PP 算單一效果。' }], src: '玩家輔助 v50 第 4 頁' },
  { id: 'diamond-3-priest-of-thoeris', color: 'diamond', level: 3, kind: 'normal', set: 'core', nameEn: 'Priest of Thoeris', cost: 3, copies: 1, effects: [{ timing: '戰鬥・攻擊・戰爭議會步驟開始時', zh: '抽 1 張神諭卡。' }], src: '玩家輔助 v50 第 4 頁' },
  { id: 'diamond-3-domination', color: 'diamond', level: 3, kind: 'normal', set: 'core', nameEn: 'Domination', cost: 3, copies: 1, effects: [{ timing: '取得時', zh: '獲得 1 神明 FP。' }], src: '玩家輔助 v50 第 4 頁' },
  { id: 'diamond-3-strategic-hold', color: 'diamond', level: 3, kind: 'renewal', set: 'gameup', nameEn: 'Strategic Hold', cost: 3, copies: 1, gameUp: 'Sacred Bull', effects: [{ timing: '戰鬥・戰鬥結束步驟', zh: '若你的部隊至少有 1 個單位，該部隊每有 1 個單位獲得 1 PP；這些 PP 算單一效果。' }], src: '玩家輔助 v50 第 4 頁' },
  { id: 'diamond-3-night-ceremony', color: 'diamond', level: 3, kind: 'renewal', set: 'gameup', nameEn: 'Night Ceremony', cost: 3, copies: 1, gameUp: 'Sand Worm', effects: [{ timing: '夜晚・神諭步驟', zh: '棄 X 張神諭卡，獲得 X PP 並抽 X＋1 張神諭卡；這些 PP 算單一效果。' }], src: '玩家輔助 v50 第 4 頁' },
  { id: 'diamond-3-horde', color: 'diamond', level: 3, kind: 'renewal', set: 'gameup', nameEn: 'Horde', cost: 3, copies: 1, gameUp: 'Shield of Onyx', effects: [{ timing: '持續', zh: '你的部隊上限變成 6 個單位（原本 5）；不適用於混合部隊。' }, { timing: '戰鬥', zh: '你的部隊 +1 護盾。' }], src: '玩家輔助 v50 第 4 頁' },
  { id: 'diamond-4-priest-of-ra', color: 'diamond', level: 4, kind: 'normal', set: 'core', nameEn: 'Priest of Ra', cost: 4, copies: 1, effects: [{ timing: '持續', zh: '每次你為同一個效果花至少 1 PP 時，該費用 −1 PP（最低 0）。' }], src: '玩家輔助 v50 第 4 頁' },
  { id: 'diamond-4-priest-of-amon', color: 'diamond', level: 4, kind: 'normal', set: 'core', nameEn: 'Priest of Amon', cost: 4, copies: 1, effects: [{ timing: '夜晚・祈禱步驟', zh: '獲得 +7 PP。' }], src: '玩家輔助 v50 第 4 頁' },
  { id: 'diamond-4-the-mummy', color: 'diamond', level: 4, kind: 'normal', set: 'core', nameEn: 'The Mummy', cost: 4, copies: 1, companion: 'creature', effects: [{ timing: '移動行動', zh: '+1 陸地移動。', tied: true }, { timing: '戰鬥', zh: '+2 力量。', tied: true }, { timing: '夜晚・神諭步驟', zh: '額外抽 1 張神諭卡。', tied: true }], src: '玩家輔助 v50 第 4 頁' },
  { id: 'diamond-4-act-of-god', color: 'diamond', level: 4, kind: 'normal', set: 'core', nameEn: 'Act of God', cost: 4, copies: 1, effects: [{ timing: '取得時', zh: '獲得 1 個銀色行動標記。' }], src: '玩家輔助 v50 第 4 頁' },
  { id: 'onyx-1-sword-clan-mercenaries', color: 'onyx', level: 1, kind: 'normal', set: 'core', nameEn: 'Sword Clan Mercenaries', cost: 1, copies: 1, effects: [{ timing: '取得時', zh: '3 個 Sword Clan 傭兵視為你的勢力顏色，加入你的城區；之後可能觸發戰鬥，比照招募行動處理。' }], src: '玩家輔助 v50 第 5 頁' },
  { id: 'onyx-1-spear-clan-mercenaries', color: 'onyx', level: 1, kind: 'normal', set: 'core', nameEn: 'Spear Clan Mercenaries', cost: 1, copies: 1, effects: [{ timing: '取得時', zh: '3 個 Spear Clan 傭兵視為你的勢力顏色，加入你的城區；之後可能觸發戰鬥，比照招募行動處理。' }], src: '玩家輔助 v50 第 5 頁' },
  { id: 'onyx-1-recrutement-local', color: 'onyx', level: 1, kind: 'normal', set: 'core', nameEn: 'Recrutement Local', cost: 1, copies: 2, effects: [{ timing: '招募行動', zh: '免費增加 1 個單位，可放進你的城區和／或部隊。' }], src: '玩家輔助 v50 第 5 頁' },
  { id: 'onyx-2-honor-in-battle', color: 'onyx', level: 2, kind: 'normal', set: 'core', nameEn: 'Honor in Battle', cost: 2, copies: 1, effects: [{ timing: '戰鬥・傷亡步驟結束時', zh: '你每有 1 個單位被對手的傷害移除，獲得 1 PP；這些 PP 算單一效果。' }], src: '玩家輔助 v50 第 5 頁' },
  { id: 'onyx-2-dedication-to-battle', color: 'onyx', level: 2, kind: 'normal', set: 'core', nameEn: 'Dedication to Battle', cost: 2, copies: 1, effects: [{ timing: '戰鬥・攻擊・戰爭議會步驟開始時', zh: '獲得 2 PP。' }], src: '玩家輔助 v50 第 5 頁' },
  { id: 'onyx-2-khnums-sphinx', color: 'onyx', level: 2, kind: 'normal', set: 'core', nameEn: 'Khnum\'s Sphinx', cost: 2, copies: 1, companion: 'creature', effects: [{ timing: '移動行動（不利效果）', zh: '部隊進入 Khnum\'s Sphinx 所控制的區域時，必須多付 1 PP。' }, { timing: '移動行動', zh: '+1 陸地移動。', tied: true }, { timing: '戰鬥', zh: '+1 力量。', tied: true }], src: '玩家輔助 v50 第 5 頁' },
  { id: 'onyx-2-twin-ceremony', color: 'onyx', level: 2, kind: 'normal', set: 'core', nameEn: 'Twin Ceremony', cost: 2, copies: 1, effects: [{ timing: '金色行動', zh: '進行 1 次取得行動，多付 1 PP，且可選擇本回合已取得過的顏色。' }], src: '玩家輔助 v50 第 5 頁' },
  { id: 'onyx-3-griffin-sphinx', color: 'onyx', level: 3, kind: 'normal', set: 'core', nameEn: 'Griffin Sphinx', cost: 3, copies: 1, companion: 'creature', effects: [{ timing: '移動行動', zh: '若 Griffin Sphinx 與所綁部隊一起傳送，該次傳送免費，且可從方尖碑區域出發。', tied: true }, { timing: '戰鬥', zh: '+2 力量。', tied: true }], src: '玩家輔助 v50 第 5 頁' },
  { id: 'onyx-3-forced-march', color: 'onyx', level: 3, kind: 'normal', set: 'core', nameEn: 'Forced March', cost: 3, copies: 1, effects: [{ timing: '金色行動', zh: '進行 1 次移動行動，期間不能使用任何傳送。' }], src: '玩家輔助 v50 第 5 頁' },
  { id: 'onyx-3-deadly-trap', color: 'onyx', level: 3, kind: 'normal', set: 'core', nameEn: 'Deadly Trap', cost: 3, copies: 1, effects: [{ timing: '戰鬥・防守', zh: '你的部隊 +1 力量、+1 無法阻擋傷害。' }], src: '玩家輔助 v50 第 5 頁' },
  { id: 'onyx-3-domination', color: 'onyx', level: 3, kind: 'normal', set: 'core', nameEn: 'Domination', cost: 3, copies: 1, effects: [{ timing: '取得時', zh: '獲得 1 神明 FP。' }], src: '玩家輔助 v50 第 5 頁' },
  { id: 'onyx-3-divine-support', color: 'onyx', level: 3, kind: 'renewal', set: 'gameup', nameEn: 'Divine Support', cost: 3, copies: 1, gameUp: 'Sacred Bull', effects: [{ timing: '戰鬥・戰鬥結束步驟', zh: '若你的部隊至少有 1 個單位，抽 1 張神諭卡。' }], src: '玩家輔助 v50 第 5 頁' },
  { id: 'onyx-3-tactical-reinforcement', color: 'onyx', level: 3, kind: 'renewal', set: 'gameup', nameEn: 'Tactical Reinforcement', cost: 3, copies: 1, gameUp: 'Sand Worm', effects: [{ timing: '戰鬥・戰鬥結束步驟', zh: '若你的部隊至少有 1 個單位，可花 X PP 在其中增加 X 個單位，至部隊上限。' }], src: '玩家輔助 v50 第 5 頁' },
  { id: 'onyx-3-shield-of-onyx', color: 'onyx', level: 3, kind: 'renewal', set: 'gameup', nameEn: 'Shield of Onyx', cost: 3, copies: 1, gameUp: 'Shield of Onyx', effects: [{ timing: '取得時', zh: '收回手上所有戰鬥卡，再從遊戲中移除 1 張（保密），換成特殊戰鬥卡「Shield of Onyx」。' }], src: '玩家輔助 v50 第 5 頁' },
  { id: 'onyx-4-amout-the-soul-devourer', color: 'onyx', level: 4, kind: 'normal', set: 'core', nameEn: 'Amout, the Soul Devourer', cost: 4, copies: 1, companion: 'creature', effects: [{ timing: '移動行動', zh: '+1 陸地移動。', tied: true }, { timing: '戰鬥', zh: '+2 力量。', tied: true }, { timing: '戰鬥・獎勵步驟', zh: '若你獲勝，且用你的傷害移除至少 2 個對手單位，除其他 FP 外再獲得 1 戰鬥 FP。', tied: true }], src: '玩家輔助 v50 第 5 頁' },
  { id: 'onyx-4-bestial-fury', color: 'onyx', level: 4, kind: 'normal', set: 'core', nameEn: 'Bestial Fury', cost: 4, copies: 1, effects: [{ timing: '移動行動', zh: '你的部隊 +1 陸地移動。' }, { timing: '戰鬥', zh: '你的部隊 +1 力量、+1 傷害。' }], src: '玩家輔助 v50 第 5 頁' },
  { id: 'onyx-4-divine-might', color: 'onyx', level: 4, kind: 'normal', set: 'core', nameEn: 'Divine Might', cost: 4, copies: 1, effects: [{ timing: '白天階段', zh: '每次其他效果使你獲得至少 1 PP，再獲得 +2 PP。' }, { timing: '夜晚階段', zh: '每次其他效果使你獲得至少 1 PP，再獲得 +2 PP。' }], src: '玩家輔助 v50 第 5 頁' },
  { id: 'onyx-4-act-of-god', color: 'onyx', level: 4, kind: 'normal', set: 'core', nameEn: 'Act of God', cost: 4, copies: 1, effects: [{ timing: '取得時', zh: '獲得 1 個銀色行動標記。' }], src: '玩家輔助 v50 第 5 頁' },
  { id: 'amethyst-1-energy-gain', color: 'amethyst', level: 1, kind: 'normal', set: 'core', nameEn: 'Energy Gain', cost: 1, copies: 2, effects: [{ timing: '持續', zh: '你打出神諭卡後把它棄掉時，獲得 1 PP；這些 PP 算單一效果。' }], src: '玩家輔助 v50 第 6 頁' },
  { id: 'amethyst-1-bestial-attack', color: 'amethyst', level: 1, kind: 'normal', set: 'core', nameEn: 'Bestial Attack', cost: 1, copies: 2, effects: [{ timing: '戰鬥・攻擊', zh: '你的生物 +1 力量。' }], src: '玩家輔助 v50 第 6 頁' },
  { id: 'amethyst-2-hypnotic-cobra', color: 'amethyst', level: 2, kind: 'normal', set: 'core', nameEn: 'Hypnotic Cobra', cost: 2, copies: 1, companion: 'creature', effects: [{ timing: '移動行動', zh: '+1 陸地移動。', tied: true }, { timing: '戰鬥', zh: '+1 力量；對手不能打出任何神諭卡。', tied: true }], src: '玩家輔助 v50 第 6 頁' },
  { id: 'amethyst-2-spontaneous-ceremony', color: 'amethyst', level: 2, kind: 'normal', set: 'core', nameEn: 'Spontaneous Ceremony', cost: 2, copies: 1, effects: [{ timing: '金色行動', zh: '選你控制的 1 座神殿，獲得該神殿的 PP（三角洲神殿則從部隊移除 1 個單位）；這些 PP 算單一效果。' }], src: '玩家輔助 v50 第 6 頁' },
  { id: 'amethyst-2-nocturnal-advantage', color: 'amethyst', level: 2, kind: 'normal', set: 'core', nameEn: 'Nocturnal Advantage', cost: 2, copies: 1, effects: [{ timing: '夜晚・祈禱步驟', zh: '你每控制 1 座神殿，獲得 1 個老兵標記。' }, { timing: '夜晚・神諭步驟', zh: '你每控制 1 座神殿，抽 1 張神諭卡。' }], src: '玩家輔助 v50 第 6 頁' },
  { id: 'amethyst-2-tactical-maneuver', color: 'amethyst', level: 2, kind: 'normal', set: 'core', nameEn: 'Tactical Maneuver', cost: 2, copies: 1, effects: [{ timing: '戰鬥・戰爭議會步驟', zh: '可改為棄 3 張戰鬥卡（而不是 1 張）來獲得 1 個老兵標記。' }], src: '玩家輔助 v50 第 6 頁' },
  { id: 'amethyst-3-giant-crocodile', color: 'amethyst', level: 3, kind: 'normal', set: 'core', nameEn: 'Giant Crocodile', cost: 3, copies: 1, companion: 'creature', effects: [{ timing: '移動行動', zh: '+1 陸地移動。', tied: true }, { timing: '戰鬥', zh: '+2 力量。', tied: true }, { timing: '戰鬥・攻擊', zh: '+1 無法阻擋傷害。', tied: true }], src: '玩家輔助 v50 第 6 頁' },
  { id: 'amethyst-3-late-fame', color: 'amethyst', level: 3, kind: 'normal', set: 'core', nameEn: 'Late Fame', cost: 3, copies: 1, effects: [{ timing: '夜晚・覺醒步驟', zh: '不棄掉你的老兵標記；可花 5 個老兵標記獲得 1 戰鬥 FP。' }], src: '玩家輔助 v50 第 6 頁' },
  { id: 'amethyst-3-adaptable-strategy', color: 'amethyst', level: 3, kind: 'normal', set: 'core', nameEn: 'Adaptable Strategy', cost: 3, copies: 1, effects: [{ timing: '取得時', zh: '收回手上所有戰鬥卡，再從遊戲中移除 1 張（保密），換成特殊戰鬥卡「Adaptable strategy」。' }], src: '玩家輔助 v50 第 6 頁' },
  { id: 'amethyst-3-domination', color: 'amethyst', level: 3, kind: 'normal', set: 'core', nameEn: 'Domination', cost: 3, copies: 1, effects: [{ timing: '取得時', zh: '獲得 1 神明 FP。' }], src: '玩家輔助 v50 第 6 頁' },
  { id: 'amethyst-3-pitfall', color: 'amethyst', level: 3, kind: 'renewal', set: 'gameup', nameEn: 'Pitfall', cost: 3, copies: 1, gameUp: 'Hippo', effects: [{ timing: '戰鬥・對峙步驟結束時', zh: '可把你揭示的戰鬥卡，與你棄牌堆最上面的那張交換。' }], src: '玩家輔助 v50 第 6 頁' },
  { id: 'amethyst-3-baboon', color: 'amethyst', level: 3, kind: 'renewal', set: 'gameup', nameEn: 'Baboon', cost: 3, copies: 1, companion: 'creature', gameUp: 'Baboon', effects: [{ timing: '移動行動', zh: '+1 陸地移動。', tied: true }, { timing: '戰鬥', zh: '+2 力量。', tied: true }, { timing: '戰鬥・獎勵步驟', zh: '多獲得 1 個老兵標記。', tied: true }], src: '玩家輔助 v50 第 6 頁' },
  { id: 'amethyst-3-shield-of-amethyst', color: 'amethyst', level: 3, kind: 'renewal', set: 'gameup', nameEn: 'Shield of Amethyst', cost: 3, copies: 1, gameUp: 'Shield of Onyx', effects: [{ timing: '戰鬥・攻擊', zh: '你的部隊 +3 護盾。' }], src: '玩家輔助 v50 第 6 頁' },
  { id: 'amethyst-4-outpost', color: 'amethyst', level: 4, kind: 'normal', set: 'core', nameEn: 'Outpost', cost: 4, copies: 1, effects: [{ timing: '金色行動', zh: '進行 1 次招募行動，從供應區免費增加至多 4 個單位，放在你的 1 個城區或 1 個空的沙漠區域（可用此方式加入夥伴）。' }], src: '玩家輔助 v50 第 6 頁' },
  { id: 'amethyst-4-vulture', color: 'amethyst', level: 4, kind: 'normal', set: 'core', nameEn: 'Vulture', cost: 4, copies: 1, companion: 'creature', effects: [{ timing: '移動行動', zh: '+1 陸地移動。', tied: true }, { timing: '戰鬥', zh: '+2 力量。', tied: true }, { timing: '戰鬥・獎勵步驟', zh: '若至少 4 個單位被移除（算上你與對手雙方被移除的），獲得 1 神明 FP。', tied: true }], src: '玩家輔助 v50 第 6 頁' },
  { id: 'amethyst-4-night-purchase', color: 'amethyst', level: 4, kind: 'normal', set: 'core', nameEn: 'Night Purchase', cost: 4, copies: 1, effects: [{ timing: '夜晚・覺醒步驟結束時', zh: '免費取得 1 張可取得的 1 級或 2 級神力板塊（即使你不控制對應的金字塔）。' }], src: '玩家輔助 v50 第 6 頁' },
  { id: 'amethyst-4-act-of-god', color: 'amethyst', level: 4, kind: 'normal', set: 'core', nameEn: 'Act of God', cost: 4, copies: 1, effects: [{ timing: '取得時', zh: '獲得 1 個銀色行動標記。' }], src: '玩家輔助 v50 第 6 頁' },
  { id: 'amber-1-pinedjem-servant', color: 'amber', level: 1, kind: 'normal', set: 'core', nameEn: 'Pinedjem Servant', cost: 1, copies: 2, companion: 'servant', effects: [{ timing: '移動行動', zh: '+1 陸地移動；此部隊可進入軍事港。', tied: true }], src: '玩家輔助 v50 第 7 頁' },
  { id: 'amber-1-masaharta-servant', color: 'amber', level: 1, kind: 'normal', set: 'core', nameEn: 'Masaharta Servant', cost: 1, copies: 2, companion: 'servant', effects: [{ timing: '戰鬥', zh: '+1 護盾。', tied: true }, { timing: '戰鬥・敗者後續步驟', zh: '若你撤退，可把你的單位放進你的城區（該城區須沒有對手單位）。', tied: true }], src: '玩家輔助 v50 第 7 頁' },
  { id: 'amber-2-jackal', color: 'amber', level: 2, kind: 'normal', set: 'core', nameEn: 'Jackal', cost: 2, copies: 1, companion: 'creature', effects: [{ timing: '移動行動', zh: '+1 陸地移動。', tied: true }, { timing: '戰鬥', zh: '+1 力量。', tied: true }, { timing: '戰鬥・獎勵步驟', zh: '你的傷害每移除 2 個對手單位，抽 1 張神諭卡。', tied: true }], src: '玩家輔助 v50 第 7 頁' },
  { id: 'amber-2-heka-ib-servant', color: 'amber', level: 2, kind: 'normal', set: 'core', nameEn: 'Heka-Ib Servant', cost: 2, copies: 1, companion: 'servant', effects: [{ timing: '移動行動／戰鬥', zh: '當你取得某座神殿的控制權時，可獲得該神殿的 PP（三角洲神殿則從部隊移除 1 個單位）。', tied: true }], src: '玩家輔助 v50 第 7 頁' },
  { id: 'amber-2-bakhtan-servant', color: 'amber', level: 2, kind: 'normal', set: 'core', nameEn: 'Bakhtan Servant', cost: 2, copies: 1, companion: 'servant', effects: [{ timing: '戰鬥・傷亡步驟開始時', zh: '可把你打出的戰鬥卡上的 X 個護盾圖示，改成同樣數量的傷害圖示。', tied: true }], src: '玩家輔助 v50 第 7 頁' },
  { id: 'amber-2-forced-recall', color: 'amber', level: 2, kind: 'normal', set: 'core', nameEn: 'Forced Recall', cost: 2, copies: 1, effects: [{ timing: '戰鬥・勝者後續／敗者後續步驟', zh: '若你召回部隊，獲得 +2 PP。' }], src: '玩家輔助 v50 第 7 頁' },
  { id: 'amber-3-siege-resistance', color: 'amber', level: 3, kind: 'normal', set: 'core', nameEn: 'Siege Resistance', cost: 3, copies: 1, effects: [{ timing: '戰鬥・勝者後續／敗者後續步驟', zh: '若你不召回部隊，收回手上所有戰鬥卡，且可從供應區加 1 個單位到該部隊。' }], src: '玩家輔助 v50 第 7 頁' },
  { id: 'amber-3-loot', color: 'amber', level: 3, kind: 'normal', set: 'core', nameEn: 'Loot', cost: 3, copies: 1, effects: [{ timing: '戰鬥・戰鬥結束步驟', zh: '若你贏得戰鬥（板塊圖示有勝者符號，v50 文字沒寫），可拿對手本場打出的 1 張神諭卡加入手牌，或抽 2 張神諭卡。v50 原文把前提寫成「對手至少打出 1 張神諭卡」【待核對】。' }], note: 'BGG 玩家討論（2025～2026）一致讀成要贏才能用，見 kemetUnofficial.ts。', src: '玩家輔助 v50 第 7 頁' },
  { id: 'amber-3-ptahmose-servant', color: 'amber', level: 3, kind: 'normal', set: 'core', nameEn: 'Ptahmose Servant', cost: 3, copies: 1, companion: 'servant', effects: [{ timing: '夜晚・供奉步驟與三角洲神殿控制步驟', zh: '不必移除任何單位就能觸發對應神殿／聖所的效果。', tied: true }, { timing: '移動行動', zh: '此部隊往返三角洲區域的傳送費用 −1 PP（最低 0）。', tied: true }, { timing: '戰鬥', zh: '若此部隊在三角洲區域，+1 力量。', tied: true }], src: '玩家輔助 v50 第 7 頁' },
  { id: 'amber-3-domination', color: 'amber', level: 3, kind: 'normal', set: 'core', nameEn: 'Domination', cost: 3, copies: 1, effects: [{ timing: '取得時', zh: '獲得 1 神明 FP。' }], src: '玩家輔助 v50 第 7 頁' },
  { id: 'amber-3-supremacy', color: 'amber', level: 3, kind: 'renewal', set: 'gameup', nameEn: 'Supremacy', cost: 3, copies: 1, gameUp: 'Shield of Onyx', effects: [{ timing: '夜晚・祈禱步驟', zh: '額外獲得 1 PP。' }, { timing: '夜晚・命運步驟', zh: '你先選順位軌上的位置。' }], src: '玩家輔助 v50 第 7 頁' },
  { id: 'amber-3-hippopotamus', color: 'amber', level: 3, kind: 'renewal', set: 'gameup', nameEn: 'Hippopotamus', cost: 3, copies: 1, companion: 'creature', gameUp: 'Hippo', effects: [{ timing: '移動行動', zh: '+1 陸地移動。', tied: true }, { timing: '戰鬥', zh: '+1 力量、+1 無法阻擋傷害、+1 護盾。', tied: true }], src: '玩家輔助 v50 第 7 頁' },
  { id: 'amber-3-architectural-adjustment', color: 'amber', level: 3, kind: 'renewal', set: 'gameup', nameEn: 'Architectural Adjustment', cost: 3, copies: 1, gameUp: 'Baboon', effects: [{ timing: '金色行動', zh: '把你其中 1 座金字塔的頂部，與供應區中另一個頂部，或你另一座金字塔的頂部交換（限本局選用的顏色）。' }], src: '玩家輔助 v50 第 7 頁' },
  { id: 'amber-4-meryptah-servant', color: 'amber', level: 4, kind: 'normal', set: 'core', nameEn: 'Meryptah Servant', cost: 4, copies: 1, companion: 'servant', effects: [{ timing: '持續', zh: '這個僕從可綁在已綁了另一個僕從的部隊上。' }, { timing: '戰鬥', zh: '+2 力量。', tied: true }], src: '玩家輔助 v50 第 7 頁' },
  { id: 'amber-4-cat', color: 'amber', level: 4, kind: 'normal', set: 'core', nameEn: 'Cat', cost: 4, copies: 1, companion: 'creature', effects: [{ timing: '移動行動', zh: '+1 陸地移動。', tied: true }, { timing: '戰鬥', zh: '+2 力量、+1 護盾。', tied: true }, { timing: '戰鬥・獎勵步驟', zh: '若你獲勝且你沒有任何單位被移除，額外獲得 1 戰鬥 FP。', tied: true }], src: '玩家輔助 v50 第 7 頁' },
  { id: 'amber-4-warrior-pilgrimage', color: 'amber', level: 4, kind: 'normal', set: 'core', nameEn: 'Warrior Pilgrimage', cost: 4, copies: 1, effects: [{ timing: '金色行動', zh: '進行至多 1 次招募行動與 1 次移動行動。招募：可在你的城區加單位並同時加 1 個僕從，也可對已綁僕從的部隊加單位；移動：該部隊必須綁有僕從。' }], note: '玩家轉述開發者：招募需有僕從（準備放進城區，或已在部隊中），見 kemetUnofficial.ts【待核對】。', src: '玩家輔助 v50 第 7 頁' },
  { id: 'amber-4-act-of-god', color: 'amber', level: 4, kind: 'normal', set: 'core', nameEn: 'Act of God', cost: 4, copies: 1, effects: [{ timing: '取得時', zh: '獲得 1 個銀色行動標記。' }], src: '玩家輔助 v50 第 7 頁' },
  { id: 'emerald-1-culte-sombre', color: 'emerald', level: 1, kind: 'normal', set: 'core', nameEn: 'Culte Sombre', cost: 1, copies: 2, effects: [{ timing: '金色行動', zh: '犧牲 1 個單位，進行 1 次祈禱行動。' }], src: '玩家輔助 v50 第 8 頁' },
  { id: 'emerald-1-retour-de-lau-dela', color: 'emerald', level: 1, kind: 'normal', set: 'core', nameEn: 'Retour de l\'Au-delà', cost: 1, copies: 2, effects: [{ timing: '夜晚・覺醒步驟', zh: '二選一：免費把冥界板上最多 2 個已犧牲單位送回你的供應區，或獲得 1 榮譽點。' }], src: '玩家輔助 v50 第 8 頁' },
  { id: 'emerald-2-strength-drain', color: 'emerald', level: 2, kind: 'normal', set: 'core', nameEn: 'Strength Drain', cost: 2, copies: 1, effects: [{ timing: '戰鬥・結算步驟', zh: '若你的力量比對手高，可犧牲 1 個單位；你超出對手的每 1 點力量，獲得 1 PP（算單一效果）。' }], src: '玩家輔助 v50 第 8 頁' },
  { id: 'emerald-2-sombres-serviteurs', color: 'emerald', level: 2, kind: 'normal', set: 'core', nameEn: 'Sombres Serviteurs', cost: 2, copies: 1, effects: [{ timing: '招募行動', zh: '依你目前的腐敗等級，每 1 級免費增加至多 3 個單位。' }], src: '玩家輔助 v50 第 8 頁' },
  { id: 'emerald-2-barque-solaire', color: 'emerald', level: 2, kind: 'normal', set: 'core', nameEn: 'Barque Solaire', cost: 2, copies: 1, effects: [{ timing: '移動行動', zh: '你的部隊 +1 陸地移動；可犧牲 1 個單位並花 1 點陸地移動，把部隊從一個沿尼羅河區域移到另一個沿尼羅河區域。' }], src: '玩家輔助 v50 第 8 頁' },
  { id: 'emerald-2-sphinx-avili', color: 'emerald', level: 2, kind: 'normal', set: 'core', nameEn: 'Sphinx Avili', cost: 2, copies: 1, companion: 'creature', effects: [{ timing: '移動行動', zh: '+1 陸地移動。', tied: true }, { timing: '戰鬥', zh: '+1 力量。', tied: true }, { timing: '戰鬥・對峙步驟結束時', zh: '可犧牲 1 個單位，增加等同你目前腐敗等級的傷害。', tied: true }], src: '玩家輔助 v50 第 8 頁' },
  { id: 'emerald-3-rituel-des-morts', color: 'emerald', level: 3, kind: 'normal', set: 'core', nameEn: 'Rituel des Morts', cost: 3, copies: 1, effects: [{ timing: '戰鬥・對峙步驟結束時', zh: '可犧牲 1 個單位，並獲得下列其中一項：+1 力量／+1 護盾／+1 傷害。' }], src: '玩家輔助 v50 第 8 頁' },
  { id: 'emerald-3-construction-funeraire', color: 'emerald', level: 3, kind: 'normal', set: 'core', nameEn: 'Construction Funéraire', cost: 3, copies: 1, effects: [{ timing: '夜晚・覺醒步驟', zh: '可犧牲 1 個單位，進行至多 2 次建造行動，各對不同的金字塔加 1 層；每次建造費用 −1 PP（最低 0）。' }], src: '玩家輔助 v50 第 8 頁' },
  { id: 'emerald-3-renfort-surnaturel', color: 'emerald', level: 3, kind: 'normal', set: 'core', nameEn: 'Renfort Surnaturel', cost: 3, copies: 1, effects: [{ timing: '戰鬥・攻擊・戰爭議會步驟開始時', zh: '可免費為你的部隊增加 1 個單位（可以是已犧牲單位）；此戰鬥中可超過部隊上限。' }], src: '玩家輔助 v50 第 8 頁' },
  { id: 'emerald-3-domination', color: 'emerald', level: 3, kind: 'normal', set: 'core', nameEn: 'Domination', cost: 3, copies: 1, effects: [{ timing: '取得時', zh: '獲得 1 神明 FP。' }], src: '玩家輔助 v50 第 8 頁' },
  { id: 'emerald-3-macabre-aspiration', color: 'emerald', level: 3, kind: 'renewal', set: 'gameup', nameEn: 'Macabre Aspiration', cost: 3, copies: 1, gameUp: 'Sacred Bull', effects: [{ timing: '戰鬥・戰鬥結束步驟', zh: '若對手本場至少打出 1 張神諭卡，把其中 1 張加入你的手牌；否則抽 1 張神諭卡。' }], src: '玩家輔助 v50 第 8 頁' },
  { id: 'emerald-3-dark-knowledge', color: 'emerald', level: 3, kind: 'renewal', set: 'gameup', nameEn: 'Dark Knowledge', cost: 3, copies: 1, gameUp: 'Sand Worm', effects: [{ timing: '取得行動', zh: '非綠寶石的神力板塊費用 −2 PP（最低 0）。' }], src: '玩家輔助 v50 第 8 頁' },
  { id: 'emerald-3-unilateral-choice', color: 'emerald', level: 3, kind: 'renewal', set: 'gameup', nameEn: 'Unilateral Choice', cost: 3, copies: 1, gameUp: 'Shield of Onyx', effects: [{ timing: '夜晚・神諭步驟', zh: '額外抽 1 張神諭卡。該步驟結束時，每位玩家（含你）從該步驟抽到的牌中，選 1 張面朝下放在自己面前；然後收走這些牌，由你決定各給每位玩家 1 張。（玩家輔助英文有筆誤，這句是依字面自譯）' }], src: '玩家輔助 v50 第 8 頁' },
  { id: 'emerald-4-putrid-power', color: 'emerald', level: 4, kind: 'normal', set: 'core', nameEn: 'Putrid Power', cost: 4, copies: 1, effects: [{ timing: '戰鬥・攻擊・結算步驟', zh: '你的部隊獲得等同你目前腐敗等級的力量。' }], src: '玩家輔助 v50 第 8 頁' },
  { id: 'emerald-4-act-of-god', color: 'emerald', level: 4, kind: 'normal', set: 'core', nameEn: 'Act of God', cost: 4, copies: 1, effects: [{ timing: '取得時', zh: '獲得 1 個銀色行動標記。' }], src: '玩家輔助 v50 第 8 頁' },
  { id: 'emerald-4-thot', color: 'emerald', level: 4, kind: 'divinity', set: 'dead', nameEn: 'Thot', altNameEn: 'Nyarlathotep', cost: 4, copies: 1, companion: 'divinity', effects: [{ timing: '取得時', zh: '把 Thot 放進你的供應區。' }, { timing: '金色行動', zh: '召喚：把 Thot 放在空的沙漠區域，並免費在該區域加入等同你目前腐敗等級數量的單位（可以是已犧牲單位）。' }, { timing: '移動行動', zh: '+1 陸地移動。', tied: true }, { timing: '戰鬥', zh: '+4 力量。', tied: true }, { timing: '戰鬥・戰爭議會步驟開始時', zh: '指名 1 張戰鬥卡（說出它的數值與效果）；對手不能打出那張卡。', tied: true }], src: '玩家輔助 v50 第 9 頁' },
  { id: 'emerald-4-apophis', color: 'emerald', level: 4, kind: 'divinity', set: 'dead', nameEn: 'Apophis', altNameEn: 'Cthulhu', cost: 4, copies: 1, companion: 'divinity', effects: [{ timing: '取得時', zh: '把 Apophis 放進你的供應區。' }, { timing: '金色行動', zh: '召喚：把 Apophis 放在空的沿尼羅河區域，並免費在該區域加入等同你目前腐敗等級數量的單位（可以是已犧牲單位）。' }, { timing: '移動行動', zh: 'Apophis 不能傳送也不能陸地移動；移動行動開始時，把它與其全部或部分崇拜者放到任一沿尼羅河區域，然後該行動結束。', tied: true }, { timing: '戰鬥', zh: '+5 力量。', tied: true }], src: '玩家輔助 v50 第 9 頁' },
]

export const KEMET_TILE_BY_ID: Record<string, KemetPowerTile> = Object.fromEntries(
  KEMET_POWER_TILES.map((t) => [t.id, t]),
)

// ===== 埃及眾神模組（Gods of Egypt）六位神祇：每位玩家一位，自己的神祇卡；效果依玩家輔助 v50 第 11 頁自譯，【待核對】 =====
export type KemetGod = {
  id: string
  nameEn: string
  effects: KemetEffect[]
  note?: string
  src: string
}

export const KEMET_GODS: KemetGod[] = [
  { id: 'god-anubis', nameEn: 'Anubis', effects: [
    { timing: '移動行動', zh: '+1 陸地移動。' },
    { timing: '戰鬥', zh: '+7 力量、+1 傷害。' },
    { timing: '戰鬥・戰鬥結束步驟', zh: '免費在你控制的城區和／或部隊中增加單位，數量上限＝Anubis 損失的 LP 加上本場被移除的對手單位數。' },
    { timing: '你的部隊（戰鬥）', zh: '若戰鬥發生在你的城區，+1 力量。' },
  ], src: '玩家輔助 v50 第 11 頁' },
  { id: 'god-sobek', nameEn: 'Sobek', effects: [
    { timing: '取得時', zh: '收回你棄掉的戰鬥卡；秘密選 1 張從遊戲中移除，換成 Sobek 的特殊戰鬥卡「Sobek\'s Wrath」（移除的那張保密）。這張卡在 Sobek 不在場的戰鬥也能用。' },
    { timing: '移動行動', zh: '+1 陸地移動。' },
    { timing: '戰鬥', zh: '+7 力量。' },
  ], note: '玩家輔助 v50 把 Sobek\'s Wrath 印成 +4 力量，戰鬥結束時收回所有戰鬥卡。', src: '玩家輔助 v50 第 10、11 頁' },
  { id: 'god-seth', nameEn: 'Seth', effects: [
    { timing: '移動行動', zh: '+1 陸地移動。' },
    { timing: '戰鬥', zh: '+7 力量。' },
    { timing: '戰鬥・對峙步驟結束時', zh: '抽 2 張神諭卡並展示：若至少 1 張是戰鬥神諭卡，選 1 張免費打出並套用在本場戰鬥，棄掉另一張；若都不是戰鬥神諭卡，選 1 張加入手牌，棄掉另一張。' },
  ], src: '玩家輔助 v50 第 11 頁' },
  { id: 'god-ouadjet', nameEn: 'Ouadjet', effects: [
    { timing: '每個白天階段一次', zh: '可把 1 個綠色行動標記，放在你玩家板上已有綠色行動標記的、已被佔用的行動格上（遵守均衡規則），並立刻結算該行動的效果。' },
    { timing: '移動行動', zh: '+1 陸地移動。' },
    { timing: '戰鬥', zh: '+7 力量。' },
  ], note: 'BGG 討論串對 Ouadjet 有「同回合買第二張同色板塊」的說法，與這段 v50 文字不同，見 kemetUnofficial.ts【待核對】。', src: '玩家輔助 v50 第 11 頁' },
  { id: 'god-bastet', nameEn: 'Bastet', effects: [
    { timing: '移動行動', zh: '+1 陸地移動。' },
    { timing: '戰鬥', zh: '+7 力量、+1 護盾。' },
    { timing: '夜晚・神殿控制步驟', zh: '若你控制有 Bastet 的神殿，獲得 1 神明 FP；這個步驟最多只能獲得 1 神明 FP。' },
  ], src: '玩家輔助 v50 第 11 頁' },
  { id: 'god-horus', nameEn: 'Horus', effects: [
    { timing: '移動行動', zh: 'Horus 可免費傳送到你選擇的任何區域，但不能是對手的城區。' },
    { timing: '戰鬥', zh: '+7 力量。' },
    { timing: '戰鬥・戰鬥結束步驟', zh: '把 Horus 的 LP 標記移到 LP 格 3。' },
  ], src: '玩家輔助 v50 第 11 頁' },
]

export const KEMET_GOD_BY_ID: Record<string, KemetGod> = Object.fromEntries(
  KEMET_GODS.map((g) => [g.id, g]),
)
