// 開桌前快速複習：Quartermaster General WW2: 2nd Edition（戰場軍需官：二戰風雲 第二版）
// 版面比照 risingSun.ts：先看「主要區塊」，較少用的（設置、擴充、牌組自選、常見錯誤）預設收起。
// 內容來源：①Teaching Script（英文教學稿，基本版規則）②全面戰爭英文整理檔（.odt）③法文《Guerre totale》規則（全面戰爭，官方規則的法文版）
//          ④sohu 簡體中文評測（只用於中文牌型名稱與各國特色）⑤使用者的匈牙利文翻譯筆記（只用於「卡文讀法」）⑥Insight of Play 實戰紀錄（只用前 6 頁）。
// 沒有繁體中文規則書、沒有官方 FAQ：用詞取自簡體中文評測並轉成繁體，其餘為自譯，一律標【待核對】。
// 英文整理檔與法文規則有出入時，以法文規則為準，並在條目註明。

import type { ReviewSection } from './risingSun'

export const QMG_WW2_REVIEW: { bggName: string; draftNote: string; sections: ReviewSection[] } = {
  bggName: 'Quartermaster General WW2: 2nd Edition',
  draftNote: '草稿：沒有中文規則書與官方 FAQ，牌型名稱取自簡體中文評測、其餘為自譯，核對前請當參考。',
  sections: [
    {
      title: '遊戲目標',
      items: [
        {
          text: '兩個陣營：軸心（德國、義大利、日本）對同盟（英國、蘇聯、美國）。每人扮演一個國家，同陣營共用勝負與分數。2～6 人。',
          src: 'sohu 評測 第 6～8 頁；Teaching Script 第 1 頁【待核對：少於 6 人時如何分配國家，資料未提】',
        },
        {
          text: '靠占領地圖上有星號的補給區來得分，最多打 20 回合。20 回合結束時分數高的陣營獲勝，同分由軸心獲勝。',
          src: 'Teaching Script 第 2 頁',
        },
        {
          text: '每回合結束時，若某陣營領先對方 30 分以上，立刻獲勝。',
          src: 'Teaching Script 第 2 頁',
        },
        {
          text: '每回合由德國先走，美國最後走；一回合＝每個國家各走一次。實戰紀錄中的順序是德→英→日→蘇→義→美。',
          src: 'Teaching Script 第 1 頁；Insight of Play 第 4 頁【順序待對照版圖上的回合軌】',
        },
      ],
    },
    {
      title: '每個玩家回合（基本版 5 步）',
      items: [
        {
          label: '① 出牌',
          text: '打出 1 張手牌並執行；也可以不執行，改成直接棄 1 張牌。',
          src: 'Teaching Script 第 1、2 頁',
        },
        {
          label: '② 補給',
          text: '移除你所有沒有補給的單位。',
          src: 'Teaching Script 第 1 頁',
        },
        {
          label: '③ 計分',
          text: '單獨占領 1 個星號補給區得 2 VP；與盟友同占 1 個得 1 VP。本土被敵軍占領時跳過這一步。',
          src: 'Teaching Script 第 1、2 頁',
        },
        {
          label: '④ 棄牌',
          text: '想棄幾張都可以（可以不棄）。',
          src: 'Teaching Script 第 2 頁',
        },
        {
          label: '⑤ 抽牌',
          text: '從自己的牌庫抽到手牌 7 張。',
          src: 'Teaching Script 第 2 頁',
        },
        {
          label: '全面戰爭',
          text: '出牌後多一個「空軍階段」（可選），共 6 步。棄牌改成至少棄 1 張，否則 −1 VP。放在面前的局勢與對策不算在 7 張手牌內。',
          src: '法文 Guerre totale「Séquence de jeu」；全面戰爭英文整理檔',
        },
      ],
    },
    {
      title: '出牌階段：牌型',
      items: [
        {
          label: '組建陸軍（Build Army）',
          text: '把 1 支陸軍放到與你「已補給」單位相鄰的陸地區域。每國每區最多 1 個單位；同陣營不同國家可以在同一區；不同陣營的單位永遠不能同區。本土區只要沒有敵方單位，不受補給與相鄰限制，隨時可以在本土組建。',
          src: 'Teaching Script 第 1 頁【待核對中文名稱】',
        },
        {
          label: '組建海軍（Build Navy）',
          text: '同組建陸軍，另外：海軍必須與一個「己方陣營陸軍所在的陸地區域」相鄰（那支陸軍不必已補給）。',
          src: 'Teaching Script 第 1 頁',
        },
        {
          label: '陸地攻擊（Land Battle）',
          text: '選一個與你已補給的陸軍或海軍相鄰的陸地區域，移除該區 1 個單位。可以故意選沒有單位的區域，用來觸發卡牌效果。',
          src: 'Teaching Script 第 1、2 頁',
        },
        {
          label: '海洋攻擊（Sea Battle）',
          text: '同陸地攻擊，但選海洋區域。',
          src: 'Teaching Script 第 1 頁',
        },
        {
          label: '局勢（Status）',
          text: '面朝上放在面前，之後整場都能用。',
          src: 'Teaching Script 第 1 頁',
        },
        {
          label: '對策（Response）',
          text: '面朝下放在面前；條件成立時翻開、執行效果，然後棄掉。',
          src: 'Teaching Script 第 1 頁',
        },
        {
          label: '事件（Event）',
          text: '照牌上文字執行，然後棄掉。',
          src: 'Teaching Script 第 1 頁',
        },
        {
          label: '經濟打擊（Economic Warfare）',
          text: '像事件：照牌執行後棄掉，通常是逼對手棄牌。被要求從牌庫棄牌但牌庫已空時，每少棄 1 張就 −1 VP。',
          src: 'Teaching Script 第 1 頁',
        },
        {
          label: '空軍作戰（Air Power）',
          text: '全面戰爭新增。不能當作「出牌階段」打出的那張牌，只用於空軍階段（部署空軍或爭奪制空權）；用掉就是棄掉，不算打出。',
          src: '法文 Guerre totale「Nouveaux types de cartes」；Insight of Play 第 1 頁',
        },
        {
          label: '援助（Bolster）',
          text: '全面戰爭新增。直接從手牌在牌上寫的觸發時機打出，不用先放到桌上；使用一律是可選的，用完棄掉。同樣不能當出牌階段的那張牌（但可以拿來棄）。',
          src: '法文 Guerre totale「Soutien !」【待核對中文名稱】',
        },
      ],
    },
    {
      title: '補給',
      items: [
        {
          text: '陸軍「已補給」＝能沿著自己這個國家的單位，連回一個星號補給區。不能借用盟友的單位當補給線。',
          src: 'Teaching Script 第 1 頁；sohu 評測 第 11 頁',
        },
        {
          text: '海軍同樣要連回星號補給區，另外還要與一個己方陣營陸軍所在的陸地區域相鄰。',
          src: 'Teaching Script 第 1 頁',
        },
        {
          text: '補給階段結算：沒有補給的單位直接被移除。',
          src: 'Teaching Script 第 1 頁',
        },
        {
          label: '海峽',
          text: '有紅色箭頭的錨點是海峽。預設全部屬於同盟；軸心占領控制該海峽的陸地區域，才擁有它。你的陣營擁有海峽時，兩側的海洋區域視為相鄰：可跨海峽海洋攻擊，也能形成補給線。',
          src: 'Teaching Script 第 2 頁；sohu 評測 第 12 頁',
        },
        {
          label: '相鄰例外',
          text: '巴爾幹與中東不相鄰；黑海與地中海不相鄰。',
          src: 'Teaching Script 第 2 頁',
        },
      ],
    },
    {
      title: '計分、棄牌與資源重整',
      items: [
        {
          label: '計分',
          text: '每個你單獨占領的星號補給區 2 VP，與盟友共同占領的 1 VP。本土被敵軍占領時，整個計分階段跳過：不得補給區分數，也不得在計分階段觸發的卡牌分數。',
          src: 'Teaching Script 第 1、2 頁',
        },
        {
          label: '無牌可棄',
          text: '要棄手牌但手牌是空的，改棄牌庫頂的牌。牌庫抽完後不再抽牌，其餘照常進行；牌庫與手牌都空了，仍要檢查補給並計分。',
          src: 'Teaching Script 第 2 頁',
        },
        {
          label: '資源重整',
          text: '回合開始時，可以棄 4 張手牌（全面戰爭只要 3 張），從牌庫找 1 張組建陸軍、組建海軍、陸地攻擊或海洋攻擊加入手牌，並公開給所有人看。全面戰爭中這是標準規則。',
          src: 'Teaching Script 第 2 頁；法文 Guerre totale「Redistribution des ressources」',
        },
        {
          label: '溝通',
          text: '不能私下和隊友講話，也不能說出手牌上的確切內容。',
          src: 'Teaching Script 第 2 頁',
        },
      ],
    },
    {
      title: '各國特色（個人評測，僅供參考）',
      items: [
        {
          text: '德國：局勢牌多，疊得夠多後爆發力強，但要看對手給不給時間。日本：對策牌最多，海軍最強，擅長偷襲。義大利：輔助德國得分，牌最少，不要隨便棄牌。',
          src: 'sohu 評測 第 6、7 頁【非官方，作者個人看法】',
        },
        {
          text: '英國：戰力不突出但分散各地、各方面均衡。蘇聯：開局難混、莫斯科容易被打掉，後期陸軍最強。美國：綜合實力最強，但開局要先保英國、救蘇聯。',
          src: 'sohu 評測 第 7 頁【非官方，作者個人看法】',
        },
      ],
    },
    {
      title: '其他規則',
      items: [
        {
          label: '對策同時觸發',
          text: '雙方陣營都想打出對策時，「不是當前回合的那一方」先打；之後雙方來回，直到所有對策都處理完。',
          src: 'Teaching Script 第 2 頁',
        },
        {
          label: '棄牌保密',
          text: '從牌庫、手牌或面朝下的對策棄牌時可以保密：放到自己棄牌堆的最底部。',
          src: 'Teaching Script 第 2 頁',
        },
        {
          label: '招募 vs 組建',
          text: '「招募」把單位直接放到指定區域，不管補給；但放下後仍可能在補給階段被移除。「組建」才要受補給與相鄰限制。',
          src: 'Teaching Script 第 2 頁',
        },
        {
          label: '攻擊 vs 消滅',
          text: '「消滅」單位不需要有己方單位與目標相鄰。',
          src: 'Teaching Script 第 2 頁',
        },
        {
          label: '自行移除',
          text: '你可以在任何時候（包括對手的回合）把自己的單位從版圖上拿掉。',
          src: 'Teaching Script 第 2 頁',
        },
        {
          label: '經濟打擊',
          text: '即使對手沒有占領「其」本土，也能使用。',
          src: 'Teaching Script 第 2 頁【待核對：英文 their 指誰不明確】',
        },
      ],
    },
    {
      title: '設置（開局才用）',
      fold: true,
      items: [
        {
          text: '兩個陣營的分數標記放在分數軌 0；回合標記放第 1 回合。每人選一個國家，拿該國牌組、陸軍與海軍；每國在本土區放 1 支陸軍。各自洗牌。',
          src: 'Teaching Script 第 1 頁',
        },
        {
          label: '基本版',
          text: '每人抽 10 張，棄 3 張，留 7 張手牌。',
          src: 'Teaching Script 第 1 頁',
        },
        {
          label: '全面戰爭',
          text: '每人抽 12 張，棄 5 張，留 7 張。另外在西歐放 1 支法國陸軍與法國總部標記，在中國放 1 支中國陸軍與中國總部標記。',
          src: '法文 Guerre totale「Mise en place」；全面戰爭英文整理檔',
        },
        {
          label: '單位數量',
          text: '全面戰爭牌組自選表上的單位總數（陸軍／海軍／空軍）：德 7/3/2、義 4/3/1、日 5/5/2、蘇 7/1/1、英 5/5/2、美 5/6/3、法 3/2/1、中 2/0/1。',
          src: '法文 Guerre totale 單位表【待核對：是否含基本版與擴充合計】',
        },
      ],
    },
    {
      title: '擴充：全面戰爭（Total War）',
      fold: true,
      items: [
        {
          text: '加入空軍、法國與中國單位、援助牌，以及「如果當初…」的另類歷史牌（例如海獅作戰）。取代第 1 版的「空軍元帥」與「另類歷史」兩個擴充。需要二戰第 2 版本體才能使用。',
          src: '法文 Guerre totale 開頭簡介；sohu 評測 第 15 頁【待核對中文名稱：全面戰爭】',
        },
        {
          label: '替換卡',
          text: '擴充附 5 張標有「替換」字樣的牌，取代同名的基本版牌後洗進各自牌組：荷屬東印度（英）、自由法國（英局勢）、自由法國軍（改放美國牌組）、第十航空軍（美局勢）、滇緬公路（改放英國牌組）。名稱為法文譯回，英文原名待核對。',
          src: '法文 Guerre totale「Incorporer les nouvelles cartes」【待核對】',
        },
        {
          label: '法國與中國',
          text: '沒有玩家、沒有牌組，單位由卡牌指示行動。各自有補給線、各自計分：法國由英國在英國回合計分與檢查補給，中國由美國處理。法國總部是西歐，中國總部是中國。',
          src: '法文 Guerre totale「France et Chine」',
        },
        {
          label: '卡牌指稱',
          text: '牌上只寫「你的單位」而沒指名國家時，只指自己的單位，不含法國或中國單位。例：美國局勢「Wartime Production」不能用來組建中國陸軍，也不能在中國組建陸軍時觸發。',
          src: '法文 Guerre totale「France et Chine」',
        },
        {
          label: '法國計分',
          text: '英國總部被占領時，法國仍可在英國回合計分；西歐被軸心占領但英國沒被占領時，法國不得分（只有「流亡政府」例外），英國照常得分。',
          src: '法文 Guerre totale「France et Chine」',
        },
        {
          label: '空軍單位',
          text: '每國每個區域最多 1 支空軍；有陸軍或海軍的國家才能在該區放空軍。空軍必須與「同國的已補給陸軍或海軍」同區才算已補給。',
          src: '法文 Guerre totale「Unités aériennes」',
        },
        {
          label: '重新安置',
          text: '任何時候，你的空軍所在區域沒有同國陸軍或海軍，必須立刻移到相鄰的、有你已補給陸軍或海軍的區域；沒有這樣的區域就移除。不能移進已有你空軍的區域。',
          src: '法文 Guerre totale「Repositionnement」',
        },
        {
          label: '空軍階段',
          text: '出牌後可以做以下三選一：①部署：打出空軍作戰，把空軍放到有你已補給陸軍或海軍的區域。②重新調度：棄任意 1 張手牌，把場上 1 支空軍移到任何有你已補給陸軍或海軍的區域（可原地不動以觸發反應）。③爭奪制空權：打出空軍作戰，移除一支位於你已補給空軍相鄰區域的敵方空軍（也可選沒有敵空軍的區域來觸發反應）。',
          src: '法文 Guerre totale「La Phase aérienne」；全面戰爭英文整理檔',
        },
        {
          label: '英美代管',
          text: '空軍階段，英國可再棄 1 張手牌來重新調度法國空軍，美國同理處理中國空軍（在自己的空軍動作之外額外做）。',
          src: '法文 Guerre totale「France」「Chine」',
        },
        {
          label: '空防',
          text: '你的陸軍或海軍因「攻擊」要被移除時，可改為移除同區、同國的 1 支空軍。若選擇不用，而空軍之後單獨留在無補給單位的區域，就要重新安置或移除。單位是被「消滅」而不是被攻擊時，不能這麼做。',
          src: '法文 Guerre totale「Défense」；全面戰爭英文整理檔',
        },
        {
          label: '空襲',
          text: '對手使用空防後，你可以移除自己一支與戰鬥區域相鄰的空軍，改為移除原本攻擊的陸軍或海軍。英文整理檔寫的是「已補給」的空軍，法文規則沒有這個限制【待核對】。',
          src: '法文 Guerre totale「Attaque」；全面戰爭英文整理檔',
        },
        {
          label: '援助細節',
          text: '用過援助後，下回合開始時手牌可能不足 7 張。援助要求「棄某類型的牌」時，只公開該牌的類型，牌名與文字保密。援助要求的棄牌，除非文字另有說明，是在援助牌本身之外另棄。',
          src: '法文 Guerre totale「Soutien !」',
        },
      ],
    },
    {
      title: '擴充：開戰序幕（Prelude）',
      fold: true,
      items: [
        {
          text: '在正式開打前多一個序幕階段，大國之間先綏靖、偷偷發展軍備。序幕牌有兩種：戰備（類似對策，面朝下扣著，發動時要消耗手牌，但用得好開局優勢大）與歷史（打出直接結算，可能提前布置一些軍隊）。',
          src: 'sohu 評測 第 16、17 頁【待核對中文名稱：開戰序幕、戰備、歷史；本檔案沒有該擴充規則書，細節未收】',
        },
      ],
    },
    {
      title: '全面戰爭：牌組自選（實驗規則）',
      fold: true,
      items: [
        {
          text: '不用整副牌，改成祕密選牌組。各國牌數：德 50、義 38、日 43、蘇 42、英 47、美 50。沒選的牌不使用。可選入 5 張替換卡，但不能選被替換掉的基本版牌。',
          src: '法文 Guerre totale「Règles de construction de paquet」',
        },
        {
          text: '使用此規則時，棄牌階段不用 −1 VP（回到基本版規則），資源重整改成棄 4 張。',
          src: '法文 Guerre totale「Règles de construction de paquet」',
        },
      ],
    },
    {
      title: '常見錯誤與卡文讀法',
      fold: true,
      items: [
        {
          text: '基本版與全面戰爭的數字不同：開局抽 10 棄 3（全面戰爭 12 棄 5）；資源重整棄 4（全面戰爭 3）；全面戰爭棄牌階段不棄牌會 −1 VP。混用時先講清楚用哪一版。',
          src: 'Teaching Script 第 1、2 頁；法文 Guerre totale',
        },
        {
          text: '計分階段在棄牌階段之前，所以不棄牌的 −1 VP 是在得分之後才扣；網路對戰紀錄為了方便，會把這兩步合併後一起記錄。',
          src: 'Insight of Play 第 1 頁',
        },
        {
          text: '卡文裡的「棄牌換效果」：先完成前置（例如先棄牌），才拿得到後面的好處；不想付代價就不要打這張牌。',
          src: '使用者的匈牙利文翻譯筆記（以 Stavka 為例）【非官方，使用者自譯讀法，未驗證】',
        },
        {
          text: '卡文裡的「then」：按第 1 版 FAQ 的讀法，視為「若前一句成立」，不是各自獨立。例：Mackenzie King 要先有英國海軍在北大西洋得 1 VP，之後才檢查加拿大有沒有英國陸軍。第 2 版沒有 FAQ，此讀法為沿用。',
          src: '使用者的匈牙利文翻譯筆記（引用第 1 版 FAQ）【非官方，第 2 版未驗證】',
        },
        {
          text: '被「消滅」的單位與被「攻擊」的單位不同：空防只能用在攻擊，且消滅不需要相鄰單位。',
          src: 'Teaching Script 第 2 頁；法文 Guerre totale「Défense」',
        },
      ],
    },
  ],
}
