// 蓋亞計畫（Gaia Project）卡表資料：18 個種族（基本盒 14＋遺失艦隊 4）、回合助推器 14 種、基礎科技 9 種、聯邦標記 10 種。
// 暫時沒有被任何元件引用；資料夾與格式比照 kemetCards.ts、risingSunCards.ts。bggName：'Gaia Project'。
//
// 用途：聚會時把「別人的種族能力、星際要塞、手上的助推器與科技」秀出來，不用一直問對方；之後給「持有」與一鍵加入使用。
// 這一款先只做卡表；資源預設值（gaiaProjectResources.ts）與終局計分（gaiaProjectScoring.ts）之後再做。
//
// 來源（頁碼是各檔自己的印刷頁）：
//   ①基本盒英文規則書 EN_Gaia_rulebook_lo.pdf：附錄 I 種族（第 20、21 頁）、附錄 IV 回合助推器（第 23 頁）、附錄 VI 科技板塊（第 24 頁）。
//   ②Gaia Project Faction Summary V3.0（玩家整理，只當補充）：各種族起始能量／資源／研究、收入差異（第 1 頁）。
//   ③Player Aid（英文＋德文）：9 種基礎科技與 6 種聯邦標記（第 2 頁）。
//   ④遺失艦隊（The Lost Fleet）英文規則 GP_Exp_Rule_EN_V1_Web.pdf：新種族（第 13 頁）、探索板調整（第 8、11 頁）、新助推器（第 14 頁）、新聯邦標記（第 15 頁）。
//   ⑤既有的 gaiaProject.ts（快速複習）：卡名、專有名詞、種族中文名一律沿用，不另創一套。
// 中文處理：種族中文名沿用快速複習（已用中文版規則書附錄 I 核對）；效果中文是自譯，一律【待核對】。
//   【待核對】熔炎族（Bal T’aks）名稱，快速複習已標該頁字跡太糊。遺失艦隊沒有中文版：4 個新種族 nameZh 留空，畫面顯示英文名。
// 不收：英文效果原文（只收自己翻的中文摘要）；高級科技板塊、遺失艦隊的基礎科技與神器（規則書附錄只有圖示，文字與圖對不起來，要看實物才收）；
//   Tinkeroids 的 6 個改造板塊效果（規則書只描述 1 個，其餘在實物板塊上）；4 個新種族的起始資源與收入（在實物種族面板上，上傳的檔案沒有）；
//   回合計分板塊、最終計分板塊（桌面上全程看得到，快速複習已有，之後放 Scoring 檔）；單人 Automa。
// 來源之間不一致：
//   Xenos 星際要塞的 1 QIC：規則書寫「收入」，摘要表圖例把這類欄位標成「一次性」；本檔 ability／pi 文字照規則書，
//   起始與收入欄位（start、income）照摘要表，兩邊不一致的地方 note 有標【待核對】。
//   收入欄位（income）整體讀自摘要表，沒有對照實物種族面板〔未驗證〕；只列和標準面板不同的地方。
// 圖示：本檔沒有 emoji；之後轉資源計數器範本時圖示限 Emoji 11（2018）以前。

export type GaiaSet = 'base' | 'lostFleet'

export type GaiaStart = {
  // 能量循環起始：區域 I、區域 II 各幾顆；利爪族另有智能石（brainstone）放區域 I
  power1: number
  power2: number
  brainstone?: boolean
  ore: number
  credit: number
  knowledge: number
  qic: number
  // 起始研究領域（開局推進 1 級）；沒有就不填
  research?: string
}

export type GaiaFaction = {
  id: string
  set: GaiaSet
  nameEn: string
  nameZh?: string
  // 母星類型（也是玩家顏色）；遺失艦隊新種族沒有母星，填起始星球類型
  home: string
  color: string
  start?: GaiaStart
  // 和標準面板不同的收入（標準見 GAIA_STANDARD）；沒有差異就是空陣列
  income: string[]
  ability: string
  pi: string
  // 搭配遺失艦隊時的調整（探索板、起始、收入）；沒有就不填
  lostFleet?: string
  note?: string
  src: string
}

export const GAIA_STANDARD: { start: GaiaStart; income: string } = {
  start: { power1: 2, power2: 4, ore: 4, credit: 15, knowledge: 3, qic: 1 },
  income:
    '基本收入 +1 知識、+1 礦石；礦產基地每座 +1 礦石（第 3 座起不再給）；貿易中心 +3／+4／+4／+5 信用點；星際要塞 +4 補充能量並得 1 個能量標記；科技實驗室 +1 知識；大學院一座 +2 知識、另一座有「得 1 QIC」行動格。',
}

export const GAIA_FACTIONS: GaiaFaction[] = [
  {
    id: 'terrans',
    set: 'base',
    nameEn: 'Terrans',
    nameZh: '人類',
    home: '陸地',
    color: '藍',
    start: { power1: 4, power2: 4, ore: 4, credit: 15, knowledge: 3, qic: 1, research: '蓋亞技術' },
    income: [],
    ability: '蓋亞階段把蓋亞區的能量移到區域 II（不是區域 I）。',
    pi: '蓋亞階段把蓋亞區能量移到區域 II 時，可以視為支付了這些能量，以快速行動一般獲得資源（例：移 4 能量可換 1 礦石＋1 信用點）。',
    src: '規則書 第 20 頁；摘要表 V3.0 第 1 頁',
  },
  {
    id: 'lantids',
    set: 'base',
    nameEn: 'Lantids',
    nameZh: '亞特蘭斯星人',
    home: '陸地',
    color: '藍',
    start: { power1: 4, power2: 0, ore: 4, credit: 13, knowledge: 3, qic: 1 },
    income: ['星際要塞：+4 補充能量，沒有標準面板的 1 個能量標記'],
    ability:
      '建造礦產基地時，可以建在對手已登陸的星球（含失落星球），放在對手建築旁邊；不用付改造，但要付礦產基地費。這座礦產基地不能升級，也不計入星球類型數與蓋亞星球數的任何效果。',
    pi: '每次在對手已登陸的星球建造礦產基地，得 2 知識。',
    lostFleet: '搭配遺失艦隊：收入多 1 個能量標記放區域 I。少於 4 人時要用調整版星際要塞板塊蓋住原效果：單人／2 人版——在對手已登陸的星球加蓋礦產基地，以及在自己母星類型建造礦產基地，都得 2 知識（即使沒用種族能力）；3 人版——在對手已登陸的星球加蓋礦產基地時，額外補充 1 能量。',
    note: '起始 4／0 能量、13 信用點是摘要表寫法；調整版星際要塞板塊的內容讀自擴充規則第 8 頁，只看文字、沒看板塊實物【待核對】。',
    src: '規則書 第 20 頁；摘要表 V3.0 第 1 頁；遺失艦隊規則 第 8 頁',
  },
  {
    id: 'xenos',
    set: 'base',
    nameEn: 'Xenos',
    nameZh: '異空族',
    home: '沙漠',
    color: '黃',
    start: { power1: 2, power2: 4, ore: 4, credit: 15, knowledge: 3, qic: 1, research: '人工智能' },
    income: ['星際要塞：+4 補充能量、1 QIC（取代標準的 1 個能量標記）'],
    ability: '第 3 座初始礦產基地在所有人都放完初始礦產基地後才放。',
    pi: '聯邦只需要能量值 6（不是 7）；收入的 1 個能量標記改成 1 QIC。',
    lostFleet: '搭配遺失艦隊：快速行動，花 1 礦石換 1 能量（放區域 III）。',
    note: '規則書寫 QIC 是「收入」，摘要表圖例標成一次性，以規則書為準【待核對】。',
    src: '規則書 第 20 頁；摘要表 V3.0 第 1 頁；遺失艦隊規則 第 11 頁',
  },
  {
    id: 'gleens',
    set: 'base',
    nameEn: 'Gleens',
    nameZh: '格倫星人',
    home: '沙漠',
    color: '黃',
    start: { power1: 2, power2: 4, ore: 4, credit: 15, knowledge: 3, qic: 0, research: '航行' },
    income: ['星際要塞：+4 補充能量、1 礦石（取代標準的 1 個能量標記）'],
    ability:
      '獲得 QIC 時改成獲得同數量的礦石（升級到指定大學院後不再適用）；讓蓋亞星球宜居改付 1 礦石；在蓋亞星球建造礦產基地額外 +2 分。',
    pi: '升級成星際要塞時，立刻拿格倫星人的聯邦標記（資源照拿），算建立聯邦；星際要塞本身仍可參與場上的其他聯邦。（聯邦標記：1 礦石、1 知識、2 信用點）',
    lostFleet: '搭配遺失艦隊：探索板有特殊行動（每回合一次，不能與別的行動合併）：做「建造礦產基地」「開始蓋亞計劃」或「探索遺失艦隊船艦」其中一個，基本航行距離 +2。',
    src: '規則書 第 20 頁；摘要表 V3.0 第 1 頁；遺失艦隊規則 第 11 頁',
  },
  {
    id: 'taklons',
    set: 'base',
    nameEn: 'Taklons',
    nameZh: '利爪族',
    home: '沼澤',
    color: '棕',
    start: { power1: 2, power2: 4, brainstone: true, ore: 4, credit: 15, knowledge: 3, qic: 1 },
    income: [],
    ability: '智能石算 1 個能量標記（開蓋亞計劃、蓋衛星等），但支付時可當 3 能量。',
    pi: '每次被動補充能量時，多得 1 個能量標記，可選擇在補充能量前或後拿。',
    lostFleet: '搭配遺失艦隊：探索船艦時，除了 5 分，還要把智能石移到蓋亞區。',
    note: '沒有選擇補充能量（沒花分數）就不會多得（官方 FAQ v1.0）。',
    src: '規則書 第 20 頁；摘要表 V3.0 第 1 頁；FAQ v1.0 第 1 頁；遺失艦隊規則 第 9 頁',
  },
  {
    id: 'ambas',
    set: 'base',
    nameEn: 'Ambas',
    nameZh: '大使星人',
    home: '沼澤',
    color: '棕',
    start: { power1: 2, power2: 4, ore: 4, credit: 15, knowledge: 3, qic: 1, research: '航行' },
    income: ['基本收入 +1 知識、+2 礦石', '星際要塞：+4 補充能量、2 個能量標記（標準 1 個）'],
    ability: '沒有種族能力。',
    pi: '每回合一次，作為行動，把星際要塞與你場上的一座礦產基地對調（可幫助組新聯邦）。不算建造或升級，不得分數與能量，不影響既有聯邦（即使能量值掉到 7 以下）。',
    src: '規則書 第 20 頁；摘要表 V3.0 第 1 頁',
  },
  {
    id: 'hadsch-hallas',
    set: 'base',
    nameEn: 'Hadsch Hallas',
    nameZh: '聖禽族',
    home: '氧化',
    color: '紅',
    start: { power1: 2, power2: 4, ore: 4, credit: 15, knowledge: 3, qic: 1, research: '經濟' },
    income: ['基本收入 +1 知識、+1 礦石、+3 信用點'],
    ability: '沒有種族能力。',
    pi: '可以用信用點取代能量，來執行「獲得資源」的快速行動（例：3 信用點換 1 礦石）。',
    src: '規則書 第 20 頁；摘要表 V3.0 第 1 頁',
  },
  {
    id: 'ivits',
    set: 'base',
    nameEn: 'Ivits',
    nameZh: '蜂人',
    home: '氧化',
    color: '紅',
    start: { power1: 2, power2: 4, ore: 4, credit: 15, knowledge: 3, qic: 1 },
    income: ['基本收入 +1 知識、+1 礦石、+1 QIC'],
    ability:
      '起始不放礦產基地；等所有人（含異空族第 3 座）放完後，把星際要塞放在任一紅色星球。整場只能有一個聯邦，之後靠「擴大」它來拿新標記：新增的星球要讓總能量值達 7×（持有標記數＋1，不含改造 5 級那枚）；蓋衛星改花 1 QIC（不是銷毀能量）。',
    pi: '特殊行動：在航行距離內、沒有星球或空間站的空格放 1 個空間站。空間站不是建築（不給對手補充能量）、能量值 1、可用衛星連接、不算已登陸星球，但可當航行距離的起點；對手可在有空間站的格子放衛星。',
    lostFleet: '搭配遺失艦隊：起始能量只有區域 I 2 顆、區域 II 2 顆（標準是 2／4）。',
    note: '空間站與衛星可以共存一格（官方 FAQ v1.0）。',
    src: '規則書 第 20 頁；摘要表 V3.0 第 1 頁；FAQ v1.0 第 1 頁；遺失艦隊規則 第 8 頁',
  },
  {
    id: 'geodens',
    set: 'base',
    nameEn: 'Geodens',
    nameZh: '晶礦星人',
    home: '熔岩',
    color: '橘',
    start: { power1: 2, power2: 4, ore: 4, credit: 15, knowledge: 3, qic: 1, research: '環境改造' },
    income: [],
    ability: '沒有種族能力。',
    pi: '每種星球類型第一次建造礦產基地時，得 3 知識（升級星際要塞之前已登陸的類型不算）。',
    src: '規則書 第 21 頁；摘要表 V3.0 第 1 頁',
  },
  {
    id: 'bal-taks',
    set: 'base',
    nameEn: 'Bal T’aks',
    nameZh: '熔炎族',
    home: '熔岩',
    color: '橘',
    start: { power1: 2, power2: 2, ore: 4, credit: 15, knowledge: 3, qic: 0, research: '蓋亞技術' },
    income: ['大學院「行動格」：得 4 信用點（標準是得 1 QIC）'],
    ability:
      '不能推進航行研究（拿到航行下方的科技板塊也不推進）。快速行動：把 1 個蓋亞改造機從種族面板移到蓋亞區，得 1 QIC；蓋亞區的改造機要到下個蓋亞階段才回到種族面板。',
    pi: '之後可以推進航行研究。',
    lostFleet: '搭配遺失艦隊：探索船艦要付 7 分（標準 5 分）。',
    note: '【待核對】熔炎族中文名（快速複習已標）。',
    src: '規則書 第 21 頁；摘要表 V3.0 第 1 頁；遺失艦隊規則 第 9 頁',
  },
  {
    id: 'firaks',
    set: 'base',
    nameEn: 'Firaks',
    nameZh: '章魚人',
    home: '鈦金',
    color: '灰',
    start: { power1: 2, power2: 4, ore: 4, credit: 15, knowledge: 2, qic: 1 },
    income: ['基本收入 +2 知識、+1 礦石'],
    ability: '沒有種族能力。',
    pi: '行動：把一座科技實驗室「降級」成貿易中心，並立刻推進 1 級自選研究（算「升級成貿易中心」）。之後可以照一般規則再升回科技實驗室（並再拿科技板塊）。',
    src: '規則書 第 21 頁；摘要表 V3.0 第 1 頁',
  },
  {
    id: 'bescods',
    set: 'base',
    nameEn: 'Bescods',
    nameZh: '瘋狂機器',
    home: '鈦金',
    color: '灰',
    start: { power1: 2, power2: 4, ore: 4, credit: 15, knowledge: 1, qic: 1 },
    income: [
      '基本收入只有 +1 礦石',
      '貿易中心每座 +1 知識',
      '科技實驗室 +3／+4／+5 信用點',
      '星際要塞：+4 補充能量、2 個能量標記',
    ],
    ability:
      '星際要塞與大學院在種族面板上的位置對調，貿易中心與科技實驗室的收入也對調（升級大學院或科技實驗室仍可拿科技板塊）。每回合一次，作為行動，免知識推進你最低等級的研究領域 1 級（同級任選；到 5 級仍要翻聯邦標記）。',
    pi: '灰色星球（你的母星類型）上你的建築能量值 +1（與其他加成疊加）。',
    lostFleet: '搭配遺失艦隊：起始知識為 3（基本盒是 1）。',
    src: '規則書 第 21 頁；摘要表 V3.0 第 1 頁；遺失艦隊規則 第 8 頁',
  },
  {
    id: 'nevlas',
    set: 'base',
    nameEn: 'Nevlas',
    nameZh: '超星人',
    home: '冰雪',
    color: '白',
    start: { power1: 2, power2: 4, ore: 4, credit: 15, knowledge: 2, qic: 1, research: '科學' },
    income: ['科技實驗室：+2 補充能量（標準是 +1 知識）'],
    ability: '快速行動：把 1 個區域 III 的能量標記移到蓋亞區，得 1 知識（不算支付能量）。',
    pi: '區域 III 的能量標記，支付時可當 2 能量；其他用途（開蓋亞計劃、蓋衛星）仍算 1 個。付奇數費用時，多的會浪費。',
    lostFleet: '搭配遺失艦隊：探索船艦時，除了 5 分，還要銷毀 1 能量。',
    note: '1 個區域 III 標記可同時付兩個奇數費用的快速行動（官方 FAQ v1.0）。',
    src: '規則書 第 21 頁；摘要表 V3.0 第 1 頁；FAQ v1.0 第 1 頁；遺失艦隊規則 第 9 頁',
  },
  {
    id: 'itars',
    set: 'base',
    nameEn: 'Itars',
    nameZh: '伊塔星人',
    home: '冰雪',
    color: '白',
    start: { power1: 4, power2: 4, ore: 5, credit: 15, knowledge: 3, qic: 1 },
    income: ['基本收入 +1 知識、+1 礦石、+1 個能量標記（放區域 I）', '大學院（給知識那座）：+3 知識（標準 +2）'],
    ability: '每次從區域 II 銷毀 1 個能量標記、好讓另一個移進區域 III 時，被銷毀的標記改放蓋亞區。',
    pi: '蓋亞階段可以銷毀 4 個蓋亞區的能量標記，立刻拿 1 個科技板塊（標準或高級），可做多次。',
    lostFleet: '搭配遺失艦隊：探索船艦時，除了 5 分，還要銷毀 1 能量。',
    note: '蓋亞階段順序：先伊塔星人用星際要塞，再人類（官方 FAQ v1.0）。',
    src: '規則書 第 21 頁；摘要表 V3.0 第 1 頁；FAQ v1.0 第 1 頁；遺失艦隊規則 第 9 頁',
  },
  // ───────────── 遺失艦隊新種族（沒有中文版；nameZh 留空，畫面顯示英文名；起始資源與收入未收） ─────────────
  {
    id: 'tinkeroids',
    set: 'lostFleet',
    nameEn: 'Tinkeroids',
    home: '小行星（粉紅）',
    color: '粉紅',
    income: [],
    ability:
      '起始用星際要塞取代 2 座礦產基地，在第二階段（擴充種族依序）放置。改造基本盒星球時：3 種基本盒星球類型要 3 步，其餘只要 1 步（開局依「選種族」步驟決定）。讓蓋亞星球宜居要 2 QIC。有 6 個改造板塊：3 個用在第 1～3 回合、其餘 3 個用在第 4～6 回合；每回合開始選 1 個對應回合的放在種族面板，回合結束移除（每個只用一次）。',
    pi: '每回合一次，可以把目前改造板塊上的行動當成一個行動使用。',
    note: '改造板塊效果只收到規則書舉的一個例子（第 1～3 回合用：做 1 次「建造礦產基地」並附 1 步免費改造），其餘 5 個要看實物板塊；起始資源與收入未收。',
    src: '遺失艦隊規則 第 7、8、13 頁',
  },
  {
    id: 'darkanians',
    set: 'lostFleet',
    nameEn: 'Darkanians',
    home: '小行星（粉紅）',
    color: '粉紅',
    income: [],
    ability:
      '起始只放 1 座礦產基地（不是 2 座），在第二階段放置。讓基本盒星球宜居只要 1 步改造；讓蓋亞星球宜居要 2 QIC。',
    pi: '第一次登陸某個星域或深空星域的星球時，一定得 2 信用點＋1 知識（星域之間的 Interspace 板塊不算星域）。',
    note: '起始資源與收入未收。',
    src: '遺失艦隊規則 第 7、8、13 頁',
  },
  {
    id: 'moweyds',
    set: 'lostFleet',
    nameEn: 'Moweyds',
    home: '原行星（青綠）',
    color: '青綠',
    income: [],
    ability:
      '起始只放 1 座礦產基地，在第二階段放置；開局就有 1 個探索穿梭機在 T F Mars 船上。改造基本盒星球時：3 種基本盒星球類型要 3 步，其餘只要 1 步（與 Tinkeroids 同一套決定方式）。',
    pi: '每回合一次，作為行動，把 1 個能量環放在「有你建築、且還沒有能量環」的星球（先抬起建築、放環、再放回建築）；該星球上你的建築能量值 +2。',
    note: '起始資源與收入未收。',
    src: '遺失艦隊規則 第 7、8、13 頁',
  },
  {
    id: 'space-giants',
    set: 'lostFleet',
    nameEn: 'Space Giants',
    home: '原行星（青綠）',
    color: '青綠',
    income: [],
    ability:
      '起始只放 1 座礦產基地（不是 2 座），在第二階段放置。改造基本盒星球要 2 步。探索板上有 1 個特殊行動（每回合一次，不能與別的行動合併）：做 1 次「建造礦產基地」，附剛好 2 步免費改造，需要時可再付礦石補第 3 步。讓蓋亞星球宜居要 2 QIC。',
    pi: '立刻拿 1 個科技板塊（規則同「升級現有建築」），只能這樣做一次。',
    note: '起始資源與收入未收。',
    src: '遺失艦隊規則 第 7、11、13 頁',
  },
]

// ───────────── 回合助推器 ─────────────
// 基本盒 10 種（每局用「玩家人數＋3」張）；遺失艦隊再加 4 種（洗進基本盒的助推器）。

export type GaiaBooster = {
  id: string
  set: GaiaSet
  // 板塊編號（規則書附錄的排列順序；實物上沒有印編號，只用來對照）
  no: number
  nameEn: string
  income: string
  // 放棄（Pass）時結算
  onPass?: string
  // 特殊行動（橘色八角格，每回合一次）
  action?: string
  note?: string
  src: string
}

export const GAIA_BOOSTERS: GaiaBooster[] = [
  { id: 'booster-1', set: 'base', no: 1, nameEn: 'Round Booster 1', income: '1 礦石＋1 知識', src: '規則書 第 23 頁' },
  { id: 'booster-2', set: 'base', no: 2, nameEn: 'Round Booster 2', income: '2 信用點＋1 QIC', src: '規則書 第 23 頁' },
  { id: 'booster-3', set: 'base', no: 3, nameEn: 'Round Booster 3', income: '2 個能量標記＋1 礦石', src: '規則書 第 23 頁' },
  {
    id: 'booster-4',
    set: 'base',
    no: 4,
    nameEn: 'Round Booster 4',
    income: '2 信用點',
    action: '做 1 次「建造礦產基地」，附 1 步免費改造（不夠可再花礦石；不能與其他行動合併）。',
    src: '規則書 第 23 頁',
  },
  {
    id: 'booster-5',
    set: 'base',
    no: 5,
    nameEn: 'Round Booster 5',
    income: '補充 2 能量',
    action: '做 1 次「建造礦產基地」或「開始蓋亞計劃」，基本航行距離 +3（不能與其他行動合併）。',
    src: '規則書 第 23 頁',
  },
  { id: 'booster-6', set: 'base', no: 6, nameEn: 'Round Booster 6', income: '1 礦石', onPass: '每座你的礦產基地得 1 分（含失落星球）。', src: '規則書 第 23 頁' },
  { id: 'booster-7', set: 'base', no: 7, nameEn: 'Round Booster 7', income: '1 知識', onPass: '每座你的科技實驗室得 3 分。', src: '規則書 第 23 頁' },
  { id: 'booster-8', set: 'base', no: 8, nameEn: 'Round Booster 8', income: '1 礦石', onPass: '每座你的貿易中心得 2 分。', src: '規則書 第 23 頁' },
  {
    id: 'booster-9',
    set: 'base',
    no: 9,
    nameEn: 'Round Booster 9',
    income: '補充 4 能量',
    onPass: '每座你的星際要塞與大學院得 4 分。',
    src: '規則書 第 23 頁',
  },
  {
    id: 'booster-10',
    set: 'base',
    no: 10,
    nameEn: 'Round Booster 10',
    income: '4 信用點',
    onPass: '每顆你登陸的蓋亞星球得 1 分（蓋亞改造機不算）。',
    src: '規則書 第 23 頁',
  },
  {
    id: 'lf-booster-1',
    set: 'lostFleet',
    no: 1,
    nameEn: 'Lost Fleet Round Booster 1',
    income: '1 礦石',
    onPass: '每個你的蓋亞改造機得 3 分（在種族面板上或已部署都算；已用來登陸小行星的不算）。',
    note: '收入讀自規則書第 14 頁的圖示；擴充助推器沒有中文版。',
    src: '遺失艦隊規則 第 14 頁',
  },
  {
    id: 'lf-booster-2',
    set: 'lostFleet',
    no: 2,
    nameEn: 'Lost Fleet Round Booster 2',
    income: '1 礦石',
    onPass: '每種你已登陸的星球類型得 1 分。',
    src: '遺失艦隊規則 第 14 頁',
  },
  {
    id: 'lf-booster-3',
    set: 'lostFleet',
    no: 3,
    nameEn: 'Lost Fleet Round Booster 3',
    income: '3 信用點',
    onPass: '每個你至少登陸 1 顆星球的深空星域得 2 分。',
    src: '遺失艦隊規則 第 14 頁',
  },
  {
    id: 'lf-booster-4',
    set: 'lostFleet',
    no: 4,
    nameEn: 'Lost Fleet Round Booster 4',
    income: '補充 2 能量',
    action:
      '做 1 次「開始蓋亞計劃」，不用把能量移進蓋亞區，並立刻把超維星球變成蓋亞星球（本回合之後可在它上面建造礦產基地，再次使用改造機）。超維星球要在航行距離內，可花 QIC 增加距離。',
    src: '遺失艦隊規則 第 14 頁',
  },
]

// ───────────── 基礎科技板塊（9 種，每種 4 個）；不能重複拿同一種，即使被高級科技蓋住 ─────────────

export type GaiaTech = {
  id: string
  set: GaiaSet
  nameEn: string
  // 效果時機：income＝每個收入階段；once＝拿的時候一次；action＝特殊行動；trigger＝每次符合條件；aura＝持續效果
  timing: 'income' | 'once' | 'action' | 'trigger' | 'aura'
  effect: string
  copies: number
  note?: string
  src: string
}

export const GAIA_TECHS: GaiaTech[] = [
  { id: 'tech-income-credit4', set: 'base', nameEn: 'Standard Tech: 4 credits income', timing: 'income', effect: '每個收入階段得 4 信用點。', copies: 4, src: 'Player Aid 第 2 頁' },
  {
    id: 'tech-income-know-credit',
    set: 'base',
    nameEn: 'Standard Tech: knowledge and credit income',
    timing: 'income',
    effect: '每個收入階段得 1 知識＋1 信用點。',
    copies: 4,
    src: 'Player Aid 第 2 頁',
  },
  {
    id: 'tech-once-know-per-type',
    set: 'base',
    nameEn: 'Standard Tech: knowledge per planet type',
    timing: 'once',
    effect: '拿到時，每種你已登陸的星球類型得 1 知識（含蓋亞星球與失落星球）。',
    copies: 4,
    src: 'Player Aid 第 2 頁；規則書 第 24 頁',
  },
  {
    id: 'tech-income-ore-power',
    set: 'base',
    nameEn: 'Standard Tech: ore and power income',
    timing: 'income',
    effect: '每個收入階段得 1 礦石並補充 1 能量。',
    copies: 4,
    src: 'Player Aid 第 2 頁',
  },
  {
    id: 'tech-once-ore-qic',
    set: 'base',
    nameEn: 'Standard Tech: ore and QIC',
    timing: 'once',
    effect: '拿到時，立刻得 1 礦石＋1 QIC。',
    copies: 4,
    src: 'Player Aid 第 2 頁',
  },
  {
    id: 'tech-action-charge4',
    set: 'base',
    nameEn: 'Standard Tech: special action charge 4 power',
    timing: 'action',
    effect: '特殊行動（每回合一次）：補充 4 能量。',
    copies: 4,
    src: 'Player Aid 第 2 頁',
  },
  {
    id: 'tech-trigger-gaia-mine',
    set: 'base',
    nameEn: 'Standard Tech: Gaia planet mine bonus',
    timing: 'trigger',
    effect: '每次在蓋亞星球建造礦產基地，額外 +3 分。',
    copies: 4,
    src: 'Player Aid 第 2 頁',
  },
  { id: 'tech-once-vp7', set: 'base', nameEn: 'Standard Tech: 7 VP', timing: 'once', effect: '拿到時，立刻得 7 分。', copies: 4, src: 'Player Aid 第 2 頁' },
  {
    id: 'tech-aura-power4',
    set: 'base',
    nameEn: 'Standard Tech: power value 4',
    timing: 'aura',
    effect: '星際要塞與大學院的能量值變成 4。被高級科技蓋住時回到 3；已建立的聯邦不受影響。',
    copies: 4,
    src: 'Player Aid 第 2 頁；規則書 第 24 頁',
  },
]

// ───────────── 聯邦標記（基本盒 6 種＋遺失艦隊 4 種）；建立聯邦時拿，綠面朝上 ─────────────

export type GaiaFederation = {
  id: string
  set: GaiaSet
  nameEn: string
  effect: string
  // 這個標記沒有綠面（不能拿來拿高級科技或進研究 5 級）
  noGreenSide?: boolean
  // 張數：基本盒各種的張數規則書沒寫，遺失艦隊 8 個標記對應 4 種各幾張也未確認，所以不填
  note?: string
  src: string
}

export const GAIA_FEDERATIONS: GaiaFederation[] = [
  { id: 'fed-6vp-2k', set: 'base', nameEn: 'Federation: 6 VP + 2 knowledge', effect: '立刻得 6 分＋2 知識。', src: 'Player Aid 第 2 頁' },
  { id: 'fed-7vp-6c', set: 'base', nameEn: 'Federation: 7 VP + 6 credits', effect: '立刻得 7 分＋6 信用點。', src: 'Player Aid 第 2 頁' },
  { id: 'fed-7vp-2r', set: 'base', nameEn: 'Federation: 7 VP + 2 ore', effect: '立刻得 7 分＋2 礦石。', src: 'Player Aid 第 2 頁' },
  { id: 'fed-8vp-1q', set: 'base', nameEn: 'Federation: 8 VP + 1 QIC', effect: '立刻得 8 分＋1 QIC。', src: 'Player Aid 第 2 頁' },
  {
    id: 'fed-8vp-2p',
    set: 'base',
    nameEn: 'Federation: 8 VP + 2 power tokens',
    effect: '立刻得 8 分＋2 個能量標記（放區域 I）。',
    src: 'Player Aid 第 2 頁',
  },
  {
    id: 'fed-12vp',
    set: 'base',
    nameEn: 'Federation: 12 VP',
    effect: '立刻得 12 分。這個標記兩面都是灰色，不能用來拿高級科技或推進研究 5 級。',
    noGreenSide: true,
    src: 'Player Aid 第 2 頁',
  },
  {
    id: 'lf-fed-12vp',
    set: 'lostFleet',
    nameEn: 'Lost Fleet Federation: 12 VP',
    effect: '立刻得 12 分。和基本盒的 12 分標記不同，這個標記有綠面，可以用來拿高級科技或推進到研究最高等級。',
    src: '遺失艦隊規則 第 15 頁',
  },
  {
    id: 'lf-fed-tech',
    set: 'lostFleet',
    nameEn: 'Lost Fleet Federation: tech tile',
    effect: '立刻拿 1 個科技板塊（規則同「升級現有建築」）。',
    src: '遺失艦隊規則 第 15 頁',
  },
  {
    id: 'lf-fed-mine-unlimited',
    set: 'lostFleet',
    nameEn: 'Lost Fleet Federation: mine, unlimited range',
    effect: '立刻做 1 次「建造礦產基地」：航行距離無限、不用付礦產基地費；改造步驟仍要付礦石；蓋亞星球要付規定的 QIC。',
    src: '遺失艦隊規則 第 15 頁',
  },
  {
    id: 'lf-fed-mine-3steps',
    set: 'lostFleet',
    nameEn: 'Lost Fleet Federation: mine, 3 free steps',
    effect: '立刻做 1 次「建造礦產基地」：最多 3 步免費改造、不用付礦產基地費；可花 QIC 增加航行距離。',
    src: '遺失艦隊規則 第 15 頁',
  },
]
