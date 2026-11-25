// 開桌前快速複習：沙丘：帝國—崛起（Dune: Imperium – Uprising）
// 範圍：基本遊戲（3～4 人；6 人另有收起區塊）＋ CHOAM 模組。單人與 2 人對手（Rivals／House Hagal）一律不收。
// 擴充（預設收起）：天人合一 Rise of Ix、不朽 Immortality、血脈 Bloodlines（含薩督卡指揮官與科技模組）、與原版混用、6 人遊戲。
// 來源：英文官方規則書（Dire Wolf，Uprising，19 頁）、官方 Board Space Guide、官方 Rivals／Six-Player 補充（只取 6 人部分）、
// 官方 Bloodlines 規則書（11 頁）、Universal Head（EOG）規則摘要 v1.1（玩家整理，非官方）、Condensed Rules（玩家整理，非官方）。
// 第二版新增：BGG 規則討論區（Uprising 與 Bloodlines）的討論串結論，標「BGG 討論（玩家整理，非官方）」；
// 其中設計師（Sean McCarthy 等）的回覆標「設計師回覆」，引用官方 FAQ 的標「官方 FAQ（BGG 討論引用）」——FAQ 原文本檔沒有直接看過，請對照原件。
// 沒有中文規則書：中文用詞全部自譯，標【待核對】。官方與玩家整理衝突時以官方為準；BGG 討論只補官方沒寫的空隙。
// 卡牌（領袖、帝國牌、陰謀牌、衝突卡、合約、科技板塊）的個別效果沒有收錄；使用者另傳的 Card Inventory xlsx 沒有用於本檔。
// 圖板與圖示上的數字（影響力軌獎勵、聯盟 VP、衝突卡獎勵）沒有逐項收錄，需看實物。
// 逐則的非官方問答另放 faq/unofficial/duneImperiumUprisingUnofficial.ts；本檔只收「開桌前一定要知道」的幾點，避免重複。

import type { ReviewSection } from './risingSun'

const RB = '英文規則書'
const BSG = '官方 Board Space Guide'
const BGG = 'BGG 討論（玩家整理，非官方）'
const BGGD = 'BGG 討論，設計師回覆'
const FAQ = '官方 FAQ（BGG 討論引用）'

export const DUNE_IMPERIUM_UPRISING_REVIEW: { bggName: string; draftNote: string; sections: ReviewSection[] } = {
  bggName: 'Dune: Imperium – Uprising',
  draftNote: '草稿：只有英文資料，中文用詞為自譯【待核對】；單人與 2 人對手模式沒有收錄；新增的 BGG 討論補充已標「玩家整理」，與官方衝突時以官方為準。',
  sections: [
    {
      title: '遊戲目標',
      items: [
        {
          text: '這是牌組構築＋工人放置遊戲。靠戰鬥、政治影響力與四大勢力聯盟拿勝利點（VP）。',
          src: `${RB} 第 6 頁`,
        },
        {
          text: '回合結束時（回收階段），只要有人達到 10 VP 或衝突牌堆用完，遊戲結束；VP 最多者獲勝。',
          src: `${RB} 第 6、15 頁`,
        },
        {
          text: '平手依序比：香料、索拉里（Solari）、水、駐軍區裡的部隊數。',
          src: `${RB} 第 15 頁`,
        },
        {
          text: '終局時可先打出並結算所有「終局」陰謀牌，再比 VP。',
          src: `${RB} 第 15 頁`,
        },
        {
          label: '回合（turn）與輪（round）',
          text: '「回合」是一次探員回合或一次揭示回合；「輪」是所有玩家輪流做完回合、再加上戰鬥階段。每輪每人有 1～4 個回合。這兩個詞很容易混淆。',
          src: `${BGG}：Tracking troops acquired this turn? 串；設計師回覆`,
        },
      ],
    },
    {
      title: '每回合五個階段',
      items: [
        {
          label: '① 回合開始',
          text: '翻開一張新的衝突卡（疊在前幾回合的衝突卡上面）；每位玩家從自己的牌堆抽 5 張牌當手牌。',
          src: `${RB} 第 8 頁`,
        },
        {
          label: '② 玩家回合',
          text: '從先手玩家開始順時針，一次一個回合：探員回合或揭示回合。通常先用完探員，再進行揭示回合。揭示後本階段就不能再行動；全部玩家都揭示後階段結束。',
          src: `${RB} 第 8 頁`,
        },
        {
          label: '③ 戰鬥',
          text: '先打出戰鬥陰謀牌，再結算衝突獎勵。',
          src: `${RB} 第 14 頁`,
        },
        {
          label: '④ 造物者（Makers）',
          text: '檢查有造物圖示的版圖空間（深沙漠、哈加盆地、帝國盆地）；沒有探員的空間放 1 個香料到「額外香料」位置，與之前累積的加在一起。',
          src: `${RB} 第 15 頁`,
        },
        {
          label: '⑤ 回收',
          text: '檢查終局（10 VP 或衝突牌堆空）；沒結束就收回所有探員，先手標記順時針傳給下一位，開始新的一回合。',
          src: `${RB} 第 15 頁`,
        },
        {
          text: '你可以在自己的探員回合或揭示回合的任何時間打出「計謀（Plot）」陰謀牌。',
          src: `${RB} 第 8 頁`,
        },
      ],
    },
    {
      title: '探員回合',
      items: [
        {
          text: '打出 1 張手牌（面朝上放在面前），派 1 個探員到「空著的」版圖空間；該空間左上角的圖示要和牌上的某一個探員圖示相同。一張牌只能選一個圖示，不能派多個探員。',
          src: `${RB} 第 9 頁`,
        },
        {
          text: '空間上有探員就不能派（間諜是例外）。沒有任何探員圖示的牌不能在探員回合打出，只能在揭示回合翻開。',
          src: `${RB} 第 9 頁`,
        },
        {
          text: '空間的費用與需求要「立即」付得起（在結算空間或牌的任何效果之前），付不起就不能派。',
          src: `${RB} 第 9 頁`,
        },
        {
          text: '可以依任意順序結算：①牌上「探員框」的效果、②版圖空間的效果、③如果是勢力空間，你的方塊在該勢力影響力軌上升 1 格。揭示框在探員回合要忽略。',
          src: `${RB} 第 9 頁`,
        },
        {
          label: '箭頭',
          text: '箭頭左邊（或上方）是費用、右邊（或下方）是效果。你不是被迫付費，不付就拿不到效果；同一個回合同一個箭頭最多付一次（沙蟲加倍獎勵例外）。',
          src: `${RB} 第 9、20 頁`,
        },
        {
          label: '付費→效果是一體結算',
          text: '【玩家整理】「付費→效果」的組合一般不能被中途插入別的行動；社群也引用設計師的說法，把它套用到科技、空間與牌。例：Spy Drones 要先已經收回過間諜再翻開，才拿得到銷毀；不能先拿 1 索拉里、之後才收回間諜再補銷毀。',
          src: `${BGGD}：Spy Drones 串`,
        },
        {
          label: '八種探員圖示',
          text: '皇帝、宇航公會、姐妹會、弗雷曼人、蘭茲拉特議會（綠色五邊形）、城市、香料貿易、間諜。',
          src: `${RB} 第 9 頁`,
        },
        {
          label: '影響力需求',
          text: '帝國特權（Imperial Privilege）需要皇帝影響力 2 以上；運輸（Shipping）需要宇航公會 2 以上；錫埃奇塔布（Sietch Tabr）需要弗雷曼 2 以上。',
          src: `${RB} 第 9 頁；${BSG}`,
        },
        {
          label: '先打牌再派探員',
          text: '在這個遊戲裡探員和牌緊密相連：不先打出一張允許的牌，就不能派探員。探員回合一定是「打牌＋派探員」，不能只打牌不派。',
          src: `${RB} 第 6 頁；${BGG}：First playthrough questions 串`,
        },
        {
          label: '不能派到自己已有探員的空間',
          text: '只有「別人的」探員可以靠間諜滲透；自己的探員會擋住自己。',
          src: `${BGG}：Leader in game 串`,
        },
      ],
    },
    {
      title: '部隊、戰鬥空間與沙蟲',
      items: [
        {
          label: '招募部隊',
          text: '看到方塊圖示就招募 1 個部隊：從自己的供應區拿到版圖上自己的駐軍區（garrison）。供應區沒有部隊就不能再招募。',
          src: `${RB} 第 10 頁`,
        },
        {
          label: '部署',
          text: '派探員到「戰鬥空間」（沙漠圖案加交叉劍）時，可以把本回合招募的任何或全部部隊（包含空間與你打的牌所招募的）部署到衝突區，再加上最多 2 個駐軍區原有的部隊。沒部署的留在駐軍區。',
          src: `${RB} 第 10 頁`,
        },
        {
          label: '部署每個回合都可以再來一次',
          text: '【玩家整理】「最多 2 個駐軍區部隊」是每個「派到戰鬥空間的探員回合」各一次，不是每輪一次。本回合招募的單位不論來源（陰謀牌、科技、空間、牌）都能部署，與招募時機無關；部署也可以放到回合最後才決定。實務上把新招募的放駐軍區靠衝突區的一邊、原有的放另一邊即可區分。',
          src: `${BGG}：Confusion about moving units from garrison into conflict 串（2025 年 11 月）；Tracking troops acquired this turn? 串（3 月）`,
        },
        {
          label: '戰鬥空間清單（共 10 個）',
          text: '阿拉基恩、香料精煉廠、帝國盆地、研究站、錫埃奇塔布、哈加盆地、深沙漠，加上勢力區的 3 個：宇航公會巨型船（Heighliner）、沙漠戰術（Desert Tactics）、弗雷曼裝備（Fremkit）。',
          src: `${BSG}；${RB} 第 10 頁`,
        },
        {
          label: '沙蟲',
          text: '看到沙蟲圖示就召喚並「立即」部署 1 隻沙蟲到衝突區（沙蟲永遠不能放在駐軍區）。通常需要駐軍區上有「造物鉤（Maker Hooks）」標記（在錫埃奇塔布取得，拿到後整場遊戲保留）。沙蟲只在該回合衝突中，戰後回銀行。',
          src: `${RB} 第 10 頁；${RB} 第 20 頁`,
        },
        {
          label: '召喚沙蟲不需要先派到戰鬥空間',
          text: '【玩家整理】沙蟲圖示本身就是「召喚並立即部署到衝突區」，所以揭示回合的牌或陰謀牌（如 Unexpected Allies，付 2 水召喚、不需要造物鉤）也能直接把沙蟲放進衝突。現有卡片中，只有這張陰謀牌不需要造物鉤。',
          src: `${BGG}：Unexpected allies – needs a sword icon or not? 串；Help me understand sand worms 串`,
        },
        {
          label: '護盾牆',
          text: '護盾牆還在時，不能在受保護的三個地點（阿拉基恩、香料精煉廠、帝國盆地）的衝突中召喚沙蟲。看到護盾牆爆破圖示時，你可以把護盾牆標記移出遊戲，之後任何衝突都能召喚沙蟲。',
          src: `${RB} 第 10 頁`,
        },
      ],
    },
    {
      title: '揭示回合',
      items: [
        {
          label: '① 揭示手牌',
          text: '把手牌全部翻開放在面前（與之前探員回合打的牌分開放）。揭示效果（包含劍）是強制的；你唯一可以選擇的是要不要花說服力買牌。',
          src: `${RB} 第 12 頁；${BGG}：Reveal turn strength optional? 串`,
        },
        {
          label: '② 結算揭示效果',
          text: '結算剛翻開的牌的揭示框效果（不含探員回合已打出的牌）；順序自由。可以在揭示效果之前、之間、之後用說服力（Persuasion）購買新牌。',
          src: `${RB} 第 12 頁`,
        },
        {
          label: '說服力與劍進「池」',
          text: '【玩家整理】依官方 FAQ，說服力與劍進一個池，即使提供它們的牌之後被銷毀也不會消失，所以可以先買牌再銷毀（例如 Calculus of Power）。',
          src: `${FAQ}：Buy first trash second on reveal? 串（FAQ 第 2 頁）`,
        },
        {
          label: '購買卡牌',
          text: '可買帝國市場列的 5 張牌，或保留區的「準備道路（Prepare the Way）」與「香料必須流動（The Spice Must Flow）」。費用在牌右上角。說服力可以多來源合併支付買一張牌，也可以把單一來源拆開付給不同的牌；沒用掉的說服力會消失。買到的牌放進自己的棄牌堆。市場列少於 5 張就從帝國牌堆補，所以買完一張可以接著買補上來的牌。',
          src: `${RB} 第 12、13 頁`,
        },
        {
          label: '揭示回合抽到的牌',
          text: '依官方 FAQ：揭示回合中抽到牌（例如 Poison Snooper、Refocus）必須立刻揭示並使用；揭示之後（例如戰鬥獎勵、取得科技）抽到的牌留在手上，下一輪再抽 5 張，手牌就會比 5 張多。',
          src: `${FAQ}：Steersman Passive ability during Reveal turn 串；Drawing an aquired card during reveal turn 串`,
        },
        {
          label: '設定戰力',
          text: '揭示後、收尾前（或在結算揭示效果時隨時更新）計算戰力：衝突區的每個部隊 2、每隻沙蟲 3、揭示的每把劍 1。你必須在衝突區至少有 1 個單位才有戰力；最後一個單位被移除時戰力變 0，且任何方式都無法增加。把戰鬥標記移到戰鬥軌對應格；超過 20 就翻到 +20 面從頭再算。',
          src: `${RB} 第 12、13 頁`,
        },
        {
          label: '③ 收尾',
          text: '把面前所有牌（探員與揭示回合的）放進棄牌堆。牌堆抽空時，把棄牌堆洗成新牌堆再繼續抽。',
          src: `${RB} 第 6、12 頁`,
        },
      ],
    },
    {
      title: '戰鬥階段',
      items: [
        {
          label: '戰鬥陰謀牌',
          text: '從先手玩家開始順時針，衝突區至少有 1 個單位的玩家可打任意張戰鬥陰謀牌或 pass；先前 pass 過之後輪到時仍可再打。所有參與者連續 pass 後才結算。戰力有變動要調整戰鬥標記。',
          src: `${RB} 第 14 頁`,
        },
        {
          label: '結算',
          text: '戰力最高者贏得衝突、拿第一獎勵；第二高拿第二獎勵；4（或 6）人時第三高拿第三獎勵（3 人以下第三獎勵只在二名平手時使用）。戰力 0 沒有獎勵。贏家把衝突卡面朝上放在自己供應區，並檢查戰鬥圖示配對。',
          src: `${RB} 第 14 頁`,
        },
        {
          label: '平手',
          text: '第一名平手：各自拿第二獎勵，沒有人贏得衝突也不拿衝突卡；3 人以下不給其他獎勵。4（或 6）人時，3 人以上平手第一就不給其他獎勵；剛好 2 人平手第一，其餘玩家爭第三獎勵。第二名平手：各自拿第三獎勵；贏家照拿自己的獎勵與衝突卡，不再給其他獎勵。第三名平手：沒有獎勵。',
          src: `${RB} 第 14 頁`,
        },
        {
          label: '戰後整理',
          text: '各玩家把衝突區的部隊放回自己的「供應區」（不是駐軍區）；沙蟲回銀行；所有戰鬥標記歸 0。',
          src: `${RB} 第 14 頁`,
        },
        {
          label: '沙蟲加倍獎勵',
          text: '你在衝突中有至少 1 隻沙蟲，領取獎勵時加倍。取得地點控制權不能加倍，衝突卡贏得的戰鬥圖示也不能加倍。若獎勵是「付費換效果」，可以再付一次費用再拿一次效果。',
          src: `${RB} 第 14 頁`,
        },
        {
          label: '加倍時「任選」獎勵怎麼選',
          text: '【玩家整理】把獎勵結算兩次：每次各自選，兩次可以選一樣的；單次結算內不能在同一勢力拿超過獎勵上限（例：「任選兩個勢力各 +1」加倍後，可以是 2 個勢力各 +2、4 個勢力各 +1 或 1／1／2）。若獎勵是合約：拿一張、補一張、再拿第二張。',
          src: `${BGG}：Winning Propaganda with worms 串；Doubling CHOAM Contract Reward 串`,
        },
        {
          label: '戰鬥圖示',
          text: '有三種：水晶刀（Crysknife）、沙漠鼠（Desert Mouse）、撲翼機（Ornithopter）。贏得衝突把那張卡放進供應區時，如果你已有另一張面朝上的衝突卡或目標卡有相同圖示，必須把這一對翻成面朝下並得 1 VP。',
          src: `${RB} 第 14 頁`,
        },
        {
          label: '目標卡算已贏得的衝突卡',
          text: '【玩家整理】開局的目標卡卡面寫「視為你已贏得的衝突卡」，所以可用來配對戰鬥圖示，也可算進 Grasp Arrakis 等陰謀牌的「翻衝突卡」；有玩家指出德文版沒印這句。',
          src: `${BGG}：Intrigue: Grasp Arrakis 串；a question about endgame intrigue 串`,
        },
        {
          label: '萬用戰鬥圖示',
          text: '終局時可把萬用戰鬥圖示與供應區裡任何另一個戰鬥圖示配對，翻成面朝下並得 1 VP。',
          src: `${RB} 第 20 頁`,
        },
      ],
    },
    {
      title: '勢力與影響力',
      items: [
        {
          text: '派探員到某勢力的空間，你的方塊在該勢力的影響力軌上升 1 格；其他效果也可能上升或下降。',
          src: `${RB} 第 7 頁`,
        },
        {
          label: '影響力 2',
          text: '到達 2 影響力得 1 VP；掉到 2 以下就失去那 1 VP。每個人都能拿到，不是只有一個人。',
          src: `${RB} 第 7 頁；${BGG}：Victory points 串（補充）`,
        },
        {
          label: '影響力 4',
          text: '到達 4 影響力拿該格的獎勵；掉回 4 以下不用還，再上升可以再拿一次。',
          src: `${RB} 第 7 頁`,
        },
        {
          label: '聯盟',
          text: '第一個到達 4 影響力的玩家拿該勢力的聯盟標記並得標記上的 VP。之後若有對手升到比你「更高」的格，必須把聯盟標記給對方，你失去該 VP、對方得到。',
          src: `${RB} 第 7 頁`,
        },
        {
          label: '得 1、得 2、失去 1 影響力',
          text: '選四個勢力之一；得 2 影響力時不能分給兩個不同勢力。',
          src: `${RB} 第 20 頁`,
        },
        {
          label: '影響力需求圖示',
          text: '效果前面標著「N 影響力：」表示你在該勢力至少要有 N 影響力才能用；「聯盟：」表示你要擁有該勢力的聯盟標記才能用。',
          src: `${RB} 第 20 頁`,
        },
      ],
    },
    {
      title: '關鍵地點與控制權',
      items: [
        {
          text: '有些衝突卡的獎勵包含控制阿拉基恩、香料精煉廠或帝國盆地。贏了就從供應區拿控制標記放在該空間下方的旗子上（取代對手的標記）。',
          src: `${RB} 第 10 頁；${RB} 第 20 頁`,
        },
        {
          text: '控制標記在場時，任何玩家（包含自己）派探員到該空間，你都拿到加成：阿拉基恩與香料精煉廠是 1 索拉里，帝國盆地是 1 香料。',
          src: `${RB} 第 10 頁`,
        },
        {
          text: '翻出你已控制地點的衝突卡時，你有防守加成：可以從供應區部署 1 個部隊到衝突區。',
          src: `${RB} 第 10 頁`,
        },
      ],
    },
    {
      title: '間諜',
      items: [
        {
          label: '放置間諜',
          text: '看到間諜圖示可從供應區放 1 個間諜到空的觀察站。供應區沒間諜時，可先收回自己 1 個間諜（沒有效果）再放。有些效果限定要連到某種探員圖示的觀察站，不符合就不能放。',
          src: `${RB} 第 11 頁`,
        },
        {
          label: '放置間諜是強制，但先收回是可選',
          text: '設計師回覆：規則書寫 may 是措辭失誤，放置間諜其實是強制的（官方 FAQ 後來澄清）。但「供應區沒間諜時先收回一個」是可以不做的：全部間諜都在版圖上、又不想移動時，不收回就不放。付費→效果的「付費」仍可以不付。',
          src: `${BGGD}：Is the icon that allows you to place a spy mandatory? 串`,
        },
        {
          label: '收回間諜',
          text: '看到收回間諜圖示，可把觀察站上的自己 1 個間諜放回供應區（通常是強力效果的費用）。',
          src: `${RB} 第 11 頁`,
        },
        {
          label: '收回間諜的幾種方式',
          text: '【玩家整理】①滲透或收集情報：必須是連到你派去那個空間的間諜；②當費用的收回圖示：版圖上任何位置的間諜都行；③「移動間諜」其實是先收回（沒效果）再放，也算收回過。「若你本回合收回過間諜」這種條件本身不讓你收回，要先用上面的方式。',
          src: `${BGG}：Recalling a spy question 串；Placing a spy from an Intrigue card 串`,
        },
        {
          label: '滲透（Infiltrate）',
          text: '要派探員到被別人探員佔住的空間時，可收回自己在連到該空間的觀察站上的間諜，忽略對方探員，派到同一空間。',
          src: `${RB} 第 11 頁`,
        },
        {
          label: '收集情報（Gather Intelligence）',
          text: '派探員到某空間後，可收回自己連到該空間的觀察站上的間諜來抽 1 張牌；必須在放下探員後「立即」決定（在拿任何空間或牌的效果之前）。同一個間諜不能同時用於滲透與收集情報；有些空間（如研究站）可以用兩個不同間諜各做一件。',
          src: `${RB} 第 11 頁`,
        },
        {
          label: '收集情報要在最前面',
          text: '【玩家整理】收集情報要是放下探員後的第一件事；放下探員之後才放好的間諜、或先打陰謀牌，都不能再補收集情報。可行的做法：先用陰謀牌或影響力獎勵把間諜放好，再打牌派探員到那個空間。',
          src: `${BGG}：The Emperor influence track bonus that allows placing a spy 串；Edge case with gather intelligence 串`,
        },
        {
          label: '間諜探員圖示',
          text: '可派探員到連著「你有間諜」的觀察站的空間，不需要收回間諜。圖示只決定「能去哪個空間」；到了之後仍可照常用那個間諜滲透或收集情報，不用滲透時也不必收回。',
          src: `${RB} 第 11 頁；${BGG}：Spy Eye on occupied locations 串`,
        },
        {
          label: '同一個觀察站可有兩個間諜',
          text: '【玩家整理】兩人的間諜可並存，除非牌上寫明替換；Distraction 這類牌只是讓你能放在已有對手間諜的地方，不會取代對方。',
          src: `${BGG}：2 Spies in the same spot 串；How does this card work? 串`,
        },
      ],
    },
    {
      title: '陰謀牌、領袖、牌組',
      items: [
        {
          label: '陰謀牌',
          text: '主要從版圖空間（如祕密、薩督卡、議會大廳）拿到，面朝下放自己面前（不放進牌組），自己隨時可看。三種：計謀（Plot）任何探員或揭示回合、戰鬥（Combat）只在戰鬥階段、終局（Endgame）只在遊戲結束時。打出結算後面朝上放進陰謀棄牌堆。',
          src: `${RB} 第 7 頁`,
        },
        {
          label: '領袖',
          text: '每位領袖有兩種能力：左邊的在遊戲中依文字使用；右邊（有印章戒指圖示）在你於探員回合打出「印章戒指（Signet Ring）」牌時啟動。領袖名字後面的圖示越多越複雜；第一次遊戲建議選 1 個圖示的領袖。皇帝薩達姆四世（Shaddam Corrino IV）只能在使用 CHOAM 模組時選。',
          src: `${RB} 第 4、6 頁`,
        },
        {
          label: '牌組構築',
          text: '開局每人 10 張起始牌。新取得的帝國牌或保留牌先放進棄牌堆。有些效果可以「銷毀」牌，把它退出遊戲（保留牌退回保留區），讓牌組更精簡。',
          src: `${RB} 第 6 頁`,
        },
        {
          label: '銷毀圖示是選擇性的',
          text: '【玩家整理】牌上的「銷毀」圖示一般可以不做（除非是付費的一部分或銷毀自己）；用文字寫的「銷毀這張牌」才是強制。護盾牆爆破圖示也是選擇性的。',
          src: `${BGG}：Do EVERYTHING in Agent box? 串；Treacherous Maneuver 串`,
        },
        {
          label: '第三個探員',
          text: '起始只有 2 個探員；到「劍術大師」空間可取得第三個探員（開局放在版圖旁的那個）。沒有 Mentat 探員。',
          src: `${RB} 第 6 頁；${BSG}`,
        },
      ],
    },
    {
      title: '版圖空間：皇帝、宇航公會',
      items: [
        {
          label: '薩督卡（Sardaukar）',
          text: '皇帝圖示。費用：4 香料（6 人局 3 香料）。得 1 皇帝影響力、抽 1 張陰謀牌、招募 4 個部隊。',
          src: BSG,
        },
        {
          label: '盡責服務（Dutiful Service）',
          text: '皇帝圖示。得 1 皇帝影響力。使用 CHOAM 模組：拿 1 張合約；沒有合約可拿或不使用模組：改得 2 索拉里。',
          src: BSG,
        },
        {
          label: '宇航公會巨型船（Heighliner）',
          text: '宇航公會圖示，戰鬥空間。費用：5 香料。得 1 宇航公會影響力、招募 5 個部隊。',
          src: BSG,
        },
        {
          label: '運送補給（Deliver Supplies）',
          text: '宇航公會圖示。得 1 宇航公會影響力、得 1 水。',
          src: BSG,
        },
      ],
    },
    {
      title: '版圖空間：姐妹會、弗雷曼',
      items: [
        {
          label: '間諜活動（Espionage）',
          text: '姐妹會圖示。費用：1 香料。得 1 姐妹會影響力、抽 1 張牌並放 1 個間諜。',
          src: BSG,
        },
        {
          label: '祕密（Secrets）',
          text: '姐妹會圖示。得 1 姐妹會影響力、抽 1 張陰謀牌；每位有 4 張以上陰謀牌的對手必須給你 1 張（隨機）。',
          src: BSG,
        },
        {
          label: '沙漠戰術（Desert Tactics）',
          text: '弗雷曼圖示，戰鬥空間。費用：1 水。得 1 弗雷曼影響力、招募 1 個部隊並銷毀 1 張牌。',
          src: BSG,
        },
        {
          label: '弗雷曼裝備（Fremkit）',
          text: '弗雷曼圖示，戰鬥空間。得 1 弗雷曼影響力、抽 1 張牌。',
          src: BSG,
        },
      ],
    },
    {
      title: '版圖空間：蘭茲拉特議會、CHOAM',
      items: [
        {
          label: '議會大廳（Assembly Hall）',
          text: '蘭茲拉特圖示。抽 1 張陰謀牌。你的揭示回合若有探員在此，得 1 說服力。',
          src: BSG,
        },
        {
          label: '召集支持（Gather Support）',
          text: '蘭茲拉特圖示。費用：選 0 或 2 索拉里。招募 2 個部隊；若付了 2 索拉里，另得 1 水。',
          src: BSG,
        },
        {
          label: '最高議會（High Council）',
          text: '蘭茲拉特圖示。費用：5 索拉里。第一次派探員來：把你的議員標記放在空的議會席位，之後每次你的揭示回合得 2 說服力。之後每次再派探員來：得 2 香料、抽 1 張陰謀牌、招募 3 個部隊。',
          src: BSG,
        },
        {
          label: '帝國特權（Imperial Privilege）',
          text: '蘭茲拉特圖示。需求：皇帝影響力 2 以上。費用：3 索拉里。你可以「棄掉」1 張陰謀牌來抽 1 張陰謀牌；收回你另一個在版圖上的探員，並抽 1 張牌。',
          src: BSG,
        },
        {
          label: '劍術大師（Swordmaster）',
          text: '蘭茲拉特圖示。費用：沒有任何玩家有劍術大師時 8 索拉里，之後 6 索拉里。每人每場只能派一次探員到此。取得第三個探員，放到領袖上，整場（含本回合）有 3 個探員。',
          src: BSG,
        },
        {
          label: '接受合約（Accept Contract）',
          text: '香料貿易圖示。抽 1 張牌。使用 CHOAM 模組：拿 1 張合約；沒有合約可拿或不使用模組：改得 2 索拉里。',
          src: BSG,
        },
        {
          label: '運輸（Shipping）',
          text: '香料貿易圖示。需求：宇航公會影響力 2 以上。費用：3 香料。得 5 索拉里，並得 1 個任選勢力的影響力。',
          src: BSG,
        },
      ],
    },
    {
      title: '版圖空間：城市與沙漠',
      items: [
        {
          label: '阿拉基恩（Arrakeen）',
          text: '城市圖示，戰鬥空間。招募 1 個部隊並抽 1 張牌。控制者得 1 索拉里。',
          src: BSG,
        },
        {
          label: '研究站（Research Station）',
          text: '城市圖示，戰鬥空間。費用：2 水。招募 2 個部隊並抽 2 張牌。',
          src: BSG,
        },
        {
          label: '香料精煉廠（Spice Refinery）',
          text: '城市圖示，戰鬥空間。費用：選 0 或 1 香料。得 2 索拉里；若付 1 香料則得 4 索拉里。控制者得 1 索拉里。',
          src: BSG,
        },
        {
          label: '錫埃奇塔布（Sietch Tabr）',
          text: '城市圖示，戰鬥空間。需求：弗雷曼影響力 2 以上。二選一：①拿造物鉤標記（若還沒有）、招募 1 個部隊、得 1 水；②得 1 水，並且你「可以」移除護盾牆標記。',
          src: BSG,
        },
        {
          label: '帝國盆地（Imperial Basin）',
          text: '香料貿易圖示，戰鬥空間，有造物圖示。得 1 香料，加上該空間累積的額外香料。控制者得 1 香料。',
          src: BSG,
        },
        {
          label: '哈加盆地（Hagga Basin）',
          text: '香料貿易圖示，戰鬥空間，有造物圖示。費用：1 水。得該空間累積的額外香料；並二選一：得 2 香料，或（有造物鉤時）召喚 1 隻沙蟲。',
          src: BSG,
        },
        {
          label: '深沙漠（Deep Desert）',
          text: '香料貿易圖示，戰鬥空間，有造物圖示。費用：3 水。得該空間累積的額外香料；並二選一：得 4 香料，或（有造物鉤時）召喚 2 隻沙蟲。',
          src: BSG,
        },
        {
          label: '問號費用也是費用',
          text: '【玩家整理】空間左上角的「？」是費用：你要先選一項、付掉費用、再拿對應的獎勵，付費發生在任何牌或空間效果之前。所以不能用同回合的其他效果拿到的香料去付（例如 Kota 回合 1 戒指拿到的香料，要先有 1 香料才能選「付 1 香料換 4 索拉里」）。',
          src: `${BGG}：Does Navigation Chamber affect Spice Refinery? 串；Kota + Signet turn 1 串`,
        },
      ],
    },
    {
      title: '準備設置',
      fold: true,
      items: [
        {
          text: '放遊戲板；護盾牆標記放在香料精煉廠下方標示處；四個聯盟標記放在各勢力影響力軌的標示處。',
          src: `${RB} 第 4 頁`,
        },
        {
          text: '衝突牌堆：依背面分成 I、II、III；4 張 III 面朝下放在版面標示處，再把 5 張 II 面朝下疊上去，再把 1 張 I 面朝下疊上去，共 10 張。剩下的衝突卡不看就放回盒子。',
          src: `${RB} 第 4 頁`,
        },
        {
          text: '洗陰謀牌堆與帝國牌堆；帝國牌堆翻 5 張面朝上成市場列；保留牌（準備道路、香料必須流動）各一疊放旁邊。不使用 CHOAM 模組就把有 CHOAM 標記的牌與領袖放回盒子。',
          src: `${RB} 第 4 頁`,
        },
        {
          text: '每位玩家選領袖；拿 10 張起始牌洗好放在領袖左邊；拿 1 水。銀行放索拉里、香料、水、沙蟲與 4 個造物鉤標記（都不限量，不夠可用替代物）。',
          src: `${RB} 第 4、5 頁`,
        },
        {
          text: '玩家顏色：2 個探員放在領袖上、第三個（劍術大師）放版圖旁；1 個圓片放分數軌（4 人局放 1，其他放 0）；戰鬥標記（劍面朝上）放戰鬥軌 0；4 個方塊各放在四個勢力影響力軌最底格；其餘 12 個方塊是部隊，其中 3 個放在自己最近的圓形駐軍區。',
          src: `${RB} 第 5 頁`,
        },
        {
          text: '目標卡：洗牌後（不符合人數的放回盒子）每人隨機抽 1 張面朝上放在供應區；目標卡上有先手標記的玩家拿先手標記。',
          src: `${RB} 第 5 頁`,
        },
        {
          label: '同一位領袖／同家族領袖',
          text: '【玩家整理】規則書第 2 頁建議不要讓同家族領袖同場，只是主題上的建議，不是限制。盒內牌堆 A、B 的標記只是印刷分堆，與遊戲無關。',
          src: `${BGG}：Leader in game 串；When Do I have to use Deck A or Deck B 串`,
        },
      ],
    },
    {
      title: 'CHOAM 模組（基本盒內，建議熟悉後再加）',
      fold: true,
      items: [
        {
          label: '設置',
          text: '洗 20 張合約面朝下，翻 2 張面朝上放在議會下方的標示處，其餘 18 張面朝下放銀行；另加入 4 張陰謀牌、4 張帝國牌；薩達姆四世可作為領袖。',
          src: `${RB} 第 16 頁`,
        },
        {
          label: '取得合約',
          text: '看到合約圖示：拿 1 張面朝上合約放在供應區，再從銀行補 1 張面朝上；沒有合約可拿時改得 2 索拉里。不用模組時合約圖示一律是 2 索拉里。',
          src: `${RB} 第 16 頁`,
        },
        {
          label: '完成合約',
          text: '多數合約要派探員到指定空間完成。「收穫（Harvest）」合約：派探員到造物空間，且「該回合」總共拿到合約上的香料數（包含空間以外來源）。「立即」合約：一拿到就完成。「購買香料必須流動」合約：下次買到那張牌時完成。完成時宣布、拿獎勵，把合約翻成面朝下並留在供應區（有些牌會看已完成的合約）。',
          src: `${RB} 第 16 頁`,
        },
        {
          label: '時機',
          text: '如果你拿合約的空間就是你本回合已派探員的空間，必須等之後的回合才能完成（你必須在派探員「當時」就已經有那張合約）。',
          src: `${RB} 第 16 頁`,
        },
        {
          label: '哪些合約可以同回合完成',
          text: '【玩家整理】寫了版圖空間名稱的合約，要在派探員「之前」就持有才算；有別的觸發條件的合約（立即、取得任一聯盟、取得香料必須流動）可在拿到後同回合完成，要注意結算順序。例：先拿「取得聯盟」合約，再結算勢力上升，才可能同回合完成；香料必須流動合約可在探員回合拿到、同一輪揭示回合買牌時完成。',
          src: `${BGG}：Accomplishing contracts key rules 串；completing Spice Must Flow contract in 1 turn 串`,
        },
        {
          label: '陰謀牌先給合約',
          text: '【玩家整理】若在打牌派探員「之前」先用陰謀牌拿到合約，再派到合約指定的空間，就可以完成。',
          src: `${BGG}：Accomplishing contracts key rules 串（7 月）`,
        },
        {
          label: 'CHOAM Demands',
          text: '【玩家整理】這張牌讓你不經空間就完成一張自己持有的合約（包括同回合剛拿的），得到合約獎勵，但不會得到合約條件本身（例：收穫合約要求的香料）；派去的探員空間照常給效果。有人持不同說法，多數人採此看法。',
          src: `${BGG}：CHOAM demands 串；completing Spice Must Flow contract in 1 turn 串`,
        },
        {
          label: 'Shaddam 擱置的合約',
          text: '【玩家整理】Shaddam 設置時擱置 2 張只有他能拿的合約；他取得合約時，可從版圖上 2 張或自己擱置的 2 張中選。',
          src: `${BGG}：New player questions 串`,
        },
      ],
    },
    {
      title: '擴充：天人合一（Rise of Ix）',
      fold: true,
      items: [
        {
          label: '設置',
          text: '把 CHOAM 板塊覆蓋折成一半，蓋在遊戲板右上角（蓋住議會大廳與召集支持）；Ix 版圖放旁邊。視為 CHOAM 覆蓋上有 1 個觀察站（連到星際運輸與走私）、Ix 版圖上有 1 個（連到科技談判與無畏艦）。18 張科技板塊洗好分 3 疊各 6 張放在 Ix 版圖，每疊翻開最上面一張。加入新陰謀牌、帝國牌與 6 位新領袖；不建議加入新衝突卡。每人拿 2 艘無畏艦放供應區，圓片當貨船放在運輸軌最底。',
          src: `${RB} 第 18 頁；官方 Rise of Ix 說明（Universal Head 摘要 第 8 頁）`,
        },
        {
          label: '單位（unit）',
          text: '指部隊或無畏艦。基本盒中寫「部隊」的牌不影響無畏艦。',
          src: 'Universal Head 摘要 第 8 頁',
        },
        {
          label: '取得科技',
          text: '看到取得科技圖示時，可從 Ix 版圖三疊最上方的面朝上板塊選 1 個，付香料費用，放在自己供應區（公開），再翻開該疊下一張。科技數量沒有限制。折扣：圖示角落的 -1／-2 香料只對那一次購買，不同圖示的折扣不能疊；科技談判：把供應區 1 個部隊放到 Ix 版圖當談判者，之後取得科技時可退回任意數量談判者，每個減 1 香料，可與折扣併用；費用最低 0。',
          src: 'Universal Head 摘要 第 7、8 頁',
        },
        {
          label: '每回合一次',
          text: '有此圖示的科技在自己的探員回合使用，每回合一次；用了翻成面朝下，下回合開始（回合開始階段）翻回來。',
          src: `${RB} 第 20 頁；Universal Head 摘要 第 7 頁`,
        },
        {
          label: '科技的「取得效果」與貨船獎勵順序',
          text: '【玩家整理】科技的取得效果只是一般效果，放進待辦堆，由你決定何時結算；收回貨船時獎勵順序也可自選（天人合一規則書第 5 頁）。',
          src: `${BGG}：What is the timing of tech tile acquire effect 串（2025 年 9 月）`,
        },
        {
          label: '貨船與運輸軌',
          text: '看到貨船圖示可二選一：①貨船在運輸軌上升 1 格（已在最上格不能選）；②收回貨船到最底格，並收集貨船目前格與其下每一格的運輸獎勵。獎勵：上格＝可取得科技（折 2 香料）；中格＝招募 2 個部隊並得 2 個任選勢力影響力；下格＝得 5 索拉里且每位對手得 1 索拉里，或得 2 香料。',
          src: 'Universal Head 摘要 第 7、8 頁',
        },
        {
          label: '無畏艦',
          text: '看到無畏艦圖示可委任 1 艘：從供應區放到駐軍區；若是派探員到戰鬥空間時委任，可部署到衝突區。每人同時最多 2 艘。每艘無畏艦在衝突中戰力 3（即使沒有部隊，你的戰力也不會變 0，劍仍然算，也可打戰鬥陰謀牌）。戰後無畏艦不回供應區；沒贏就放回駐軍區。',
          src: 'Universal Head 摘要 第 7、8 頁',
        },
        {
          label: '無畏艦控制地點',
          text: '無畏艦可控制阿拉基恩、卡爾薩格（Carthag）或帝國盆地。贏得衝突時，你在場上有至少 1 艘無畏艦，必須選一個「沒有無畏艦的」地點，把無畏艦放在該空間旗子上（蓋住原有控制標記）；第二艘若也在衝突中則回駐軍區。控制到下一次戰鬥階段結束，之後無畏艦回駐軍區、控制權還給原標記主人。加成與控制標記相同。',
          src: 'Universal Head 摘要 第 8 頁',
        },
        {
          label: '滲透圖示',
          text: '半個探員側影的探員圖示：敵方探員（即使多個）不擋你放在有相同圖示的空間；但不能對自己已放的空間用，也不能忽略「聲音（The Voice）」牌的效果；用陰謀牌「Dispatch an Envoy」加上的圖示不能用滲透。',
          src: `Universal Head 摘要 第 7、8 頁`,
        },
        {
          label: '卸載（Unload）',
          text: '揭示框上有卸載圖示的牌，除了正常揭示外，在你「棄掉」或「銷毀」這張牌時也能獲得效果；牌本身不提供棄掉或銷毀的方式，需另外手段。',
          src: 'Universal Head 摘要 第 7、8 頁',
        },
        {
          label: '分紅（Dividends）',
          text: '你得 5 索拉里，每位對手得 1 索拉里。',
          src: 'Universal Head 摘要 第 7 頁',
        },
        {
          label: '搭配 CHOAM 模組',
          text: 'Rise of Ix 會取代 Uprising 版圖上一處取得合約的地方；Uprising 附 10 張特別合約（背面不同）：洗好每人發 2 張，各自同時選 1 張當起始合約面朝上放供應區，沒選的放回盒子。',
          src: `${RB} 第 16、18 頁`,
        },
        {
          label: '史詩模式（Epic Game Mode）',
          text: '玩到 12 VP。不用衝突 I；用 5 張隨機衝突 II 疊在 5 張衝突 III 上（加入 Economic Supremacy 這張 II，共 10 張）。每人從起始牌堆拿掉 1 張「Dune, the Desert Planet」換成 1 張「Control the Spice」；每人抽 1 張陰謀牌；每人起始駐軍區 5 個部隊（不是 3 個）。',
          src: 'Universal Head 摘要 第 8 頁；官方 Rise of Ix 說明',
        },
        {
          label: '搭配其他',
          text: '使用 Ilesa Ecaz 需要原版帝國的 Foldspace 牌（只允許 Ilesa Ecaz 取得）。Uprising 與 Rise of Ix 的 Tech 搭配血脈科技模組見「血脈」區塊。',
          src: `${RB} 第 18 頁`,
        },
      ],
    },
    {
      title: '擴充：不朽（Immortality）',
      fold: true,
      items: [
        {
          label: '設置',
          text: '30 張帝國牌洗進帝國牌堆（形成市場列之前）；泰雷克斯版圖放在市場列與保留牌上方；在泰雷克斯軌第 4 格放 2 香料；每人拿 2 個新圓片，1 個當泰雷克斯標記放在泰雷克斯軌最左、1 個當研究標記放在研究軌最左；泰雷克斯列：洗泰雷克斯牌堆，翻 2 張面朝上放在 Reclaimed Forces 牌旁；研究站覆蓋放在原研究站空間上（即使 Uprising 的研究站不同也要蓋）；每人拿 1 個家族核彈標記；每人把起始牌堆的 2 張「Dune, the Desert Planet」換成 2 張「Experimentation」；15 張陰謀牌洗進陰謀牌堆。',
          src: 'Universal Head 摘要 第 9 頁',
        },
        {
          label: '研究',
          text: '看到研究圖示，研究標記在研究軌向右移 1 格（可能有兩個往右的方向可選，不能直上、直下或往左）；移到新格立即拿該格獎勵。基因標記：第一個基因標記後，整場遊戲你取得的泰雷克斯牌可以放在牌堆頂；到研究軌終點的第二個基因標記後，研究圖示不再前進標記，改成抽 1 張牌。',
          src: 'Universal Head 摘要 第 7、9 頁',
        },
        {
          label: '泰雷克斯軌',
          text: '每獲得一個泰雷克斯圖示，泰雷克斯標記在泰雷克斯軌前進 1 格，到有獎勵的格立即拿。第一個到達中央 VP 格的玩家得 1 VP，並拿設置時放在那裡的 2 香料額外獎勵；之後到達的玩家得 1 VP。',
          src: 'Universal Head 摘要 第 9 頁',
        },
        {
          label: '標本與泰雷克斯牌',
          text: '看到標本圖示，產生 1 個標本：把供應區 1 個部隊放到泰雷克斯版圖的蠑螈槽。用標本購買泰雷克斯列的牌（費用在右上角）或支付你牌上的標本費用；花掉的標本放回供應區；你可隨時把標本放回供應區。泰雷克斯列要有 2 張牌加 Reclaimed Forces；缺了從泰雷克斯牌堆補。Reclaimed Forces 不會被拿走：「取得」時二選一（招募 2 個部隊，或泰雷克斯標記前進 1 格），牌留在原位。不能用「取得帝國市場列牌」的效果取得泰雷克斯牌；因為不用說服力，也不能用修改說服力費用的效果。',
          src: 'Universal Head 摘要 第 9 頁',
        },
        {
          label: '嫁接（Graft）',
          text: '有 GRAFT 字樣的牌，探員回合不能單獨打：一定要打 2 張（只能 2 張），可以是 2 張都有 GRAFT，或 1 張有 GRAFT、1 張沒有。可用任一張牌的探員圖示派探員（兩張都視為「派出」探員）；你得到兩張牌的效果加上空間效果，順序自由。揭示時照常揭示。兩張牌視為「嫁接在一起」，有些牌有「若嫁接」的額外效果；牌上說「另一張被嫁接的牌」指與它嫁接的那張。',
          src: 'Universal Head 摘要 第 9 頁',
        },
        {
          label: '家族核彈（Family Atomics）',
          text: '每人每場一次：在你的回合把標記退回盒子，移除帝國市場列全部牌，再從牌堆頂重發新的市場列。【玩家整理】沒有這個擴充的玩家也常把它當房規使用（數位版內建），用硬幣當標記；若市場列卡住沒人想買，這是常見的解法。',
          src: `Universal Head 摘要 第 7、9 頁；${BGG}：Imperium row (cards to buy) is never cleared? 串`,
        },
        {
          label: '變體',
          text: '加入史詩模式時：不要把 10 張起始牌換成 Control the Spice，改成每人把 Control the Spice 放進棄牌堆。「Go to 11」：玩到 11 VP（4 人局從 0 開始，玩到 10）。',
          src: 'Universal Head 摘要 第 9 頁',
        },
        {
          label: '個別牌／領袖釐清',
          text: 'Clandestine Meeting：探員回合打出時必須想辦法加上至少 1 個探員圖示（例如嫁接）。Dispatch an Envoy：打 2 張嫁接牌派探員時，由你選哪張得到探員圖示。Ghola：與 Power Play 嫁接到勢力空間只得 2 影響力；它複製所嫁接牌的整個探員框（包含「銷毀這張牌」）；嫁接到姐妹會牌時，Ghola 的效果會把那張姐妹會牌算入場上，但 Ghola 本身不算姐妹會牌；與 Weirding Way 嫁接可以連續 2 個額外回合。Ilesa Ecaz：不論派到哪個允許空間，只要嫁接到你擱置的那張牌，就依擱置牌的圖示得 1 香料或 1 索拉里。Kwisatz Haderach：它的探員效果取代一般派探員規則，嫁接另一張牌仍只派 1 個探員（連 Ghola 也不能多派）。Spaceport：即使研究標記尚未到第一個基因標記，也可以把取得的泰雷克斯牌放牌堆頂。Usurp：可以嫁接到你手上另一張牌（不必是市場列的）；市場列上被嫁接的牌不算「在場」；銷毀 Usurp 會觸發 Replacement Eyes 與卸載牌。',
          src: 'Universal Head 摘要 第 9 頁',
        },
      ],
    },
    {
      title: '擴充：血脈（Bloodlines）薩督卡指揮官',
      fold: true,
      items: [
        {
          label: '設置',
          text: '拿 7 個薩督卡指揮官（木製或塑膠擇一，不要混用）；5 個分別放在薩督卡、盡責服務、運送補給、最高議會、召集支持空間；4 人局第六個放議會大廳（其他人數放回盒子）；最後 1 個放銀行（給帝國牌「Sardaukar Standard」用）。洗 14 張指揮官技能面朝下，翻 4 張面朝上。把新衝突卡加入衝突卡（仍照一般方式做 10 張牌堆）；15 張新陰謀牌洗入陰謀牌堆；25 張新帝國牌洗入帝國牌堆（形成市場列之前）；8 位新領袖可與舊領袖任意搭配。',
          src: '官方 Bloodlines 規則書 第 2、3 頁；Universal Head 摘要 第 10 頁',
        },
        {
          label: '取得並招募',
          text: '派探員到有薩督卡指揮官的空間時，可付 2 索拉里「取得」並立即招募該指揮官（可與空間與牌效果任意排序）。每次「取得」指揮官，就從面朝上的技能中選 1 張放自己供應區（公開），不能選自己已有的同名技能，再補 1 張。',
          src: '官方 Bloodlines 規則書 第 4 頁',
        },
        {
          label: '指揮官的行為',
          text: '招募後可放駐軍區，或若本回合派探員到戰鬥空間可部署到衝突區；之後在駐軍區時可算入「最多 2 個」的駐軍區部署名額。指揮官是戰力 2 的「部隊」，戰鬥結算後回供應區。',
          src: '官方 Bloodlines 規則書 第 4 頁',
        },
        {
          label: '從供應區再招募',
          text: '不能用一般方式從供應區招募指揮官。每個回合（探員或揭示）一次，可付 2 索拉里把供應區 1 個指揮官招募到駐軍區（或若本回合派探員到戰鬥空間則到衝突區）；這時不拿新的技能（因為不是「取得」）。同一回合從供應區最多招 1 個。',
          src: '官方 Bloodlines 規則書 第 4 頁',
        },
        {
          label: '官方範例：空間取得＋供應區各一',
          text: '規則書範例：Brennen 派探員到 Deliver Supplies，付 2 索拉里招募空間上的指揮官並拿技能；他供應區另有兩個指揮官，再付 2 索拉里招 1 個，不拿技能。不能一次付 4 索拉里招供應區的 2 個。因此同回合可以「空間取得 1 個＋供應區招 1 個」。',
          src: '官方 Bloodlines 規則書 第 4 頁（範例；BGG 討論引用）',
        },
        {
          label: '指揮官技能',
          text: '只要你衝突區有任意數量的指揮官，你全部的指揮官技能都有效；每個技能提供揭示回合的獎勵，或戰鬥結算時的額外戰力；每個技能每回合只作用一次，即使衝突區有多個指揮官。',
          src: '官方 Bloodlines 規則書 第 4 頁',
        },
        {
          label: '技能要不要留指揮官在衝突區',
          text: '設計師回覆：看技能文字有沒有「Reveal turn」。有「Reveal turn」的（如 Desperate、Driven）在揭示回合已拿到的資源或劍，之後即使撤退指揮官也保留；沒有的（Canny、Loyal、Fierce 等，以及皇帝 3 影響力給的劍）要結算戰鬥時衝突區還有指揮官才算戰力。早期討論中有玩家給過相反答案，後來都被更正。',
          src: `${BGGD}：retreat Sardaukar Commander on reveal turn 串；Sardaukar abilities clarifications 串`,
        },
        {
          label: '新圖示',
          text: '「戰鬥（Combat）」圖示：視為派到戰鬥空間，可部署本回合招募的單位加最多 2 個駐軍區單位；即使有多個此圖示，駐軍區部署仍最多 2 個。「指揮（Command）」：揭示回合該回合說服力達到 6 以上才使用後面的效果。「深度潛伏間諜（Spy with Deep Cover）」：放間諜時可忽略對手的間諜（不能放在自己已有間諜的地方）。「萬用戰鬥圖示」：血脈有更多張，可與任何其他戰鬥圖示（含另一個萬用圖示）配對，翻面得 1 VP。',
          src: '官方 Bloodlines 規則書 第 5 頁',
        },
        {
          label: '搭配 CHOAM 模組',
          text: '5 張帝國牌洗進帝國牌堆、「Coercive Negotiation」洗進陰謀牌堆、8 張合約洗進原合約。「Earn any Alliance」合約：下次你取得「還沒有的」新聯盟標記時完成。新的「Immediate」合約：沒有陰謀牌可銷毀就不能拿。',
          src: '官方 Bloodlines 規則書 第 2 頁',
        },
        {
          label: '領袖釐清',
          text: 'Chani：設置時把戰術標記放在領袖卡軌道上對應人數的格子；到最右格就重置回起始格；損失或撤退的部隊多到超過軌道末端，仍只重置、不為多出的部隊前進。Count Hasimir Fenring：銷毀陰謀牌不得索拉里。Esmar Tuek：設置時把 Tuek’s Sietch 空間放版圖旁，它是造物空間會累積香料；用印章戒指可在 Tuek’s Sietch 放 1 額外香料，並用你派到那裡的探員在同一回合拿走。Steersman Y’rkoon：你可隨時看自己面朝下的導航牌；失去再取得影響力，可能對同一勢力多次達到 2 影響力，每次打 1 張導航牌。',
          src: '官方 Bloodlines 規則書 第 12 頁',
        },
        {
          label: 'Esmar Tuek 的「額外香料」',
          text: '設計師回覆：「Take 1 bonus spice from a Maker board space」指從任一會累積香料的空間拿走 1 個實體香料標記；「額外香料」是專有名詞，不是「多拿一點」。若放在已有別人探員的 Tuek’s Sietch，香料留在那裡，探員的獎勵只在派探員的那個回合拿。',
          src: `${BGGD}：Meaning of Esmar Tuek’s Signet Ring ability 串；${BGG}：Esmar Tuek 兩串`,
        },
        {
          label: '尚無定論：Gaius Helen Mohiam',
          text: '被動「你打出的牌具有間諜圖示」多數玩家認為所有牌都算；「只要可以收回間諜收集情報就必須」在放下探員後要先收集。她同時想用該間諜付陰謀牌費用能不能辦到，討論串爭議很大、沒有官方裁定，請先和同桌約定。',
          src: `${BGG}：Gaius Helen Mohiam 兩串（未定）`,
        },
      ],
    },
    {
      title: '擴充：血脈科技模組（Tech Module）',
      fold: true,
      items: [
        {
          label: '設置',
          text: '放 Ixian Embassy 版圖；18 張科技板塊洗好分 3 疊各 6 張放在版圖，每疊翻開最上面一張。不使用 CHOAM 模組時要先拿掉 CHOAM Transports。與原版帝國（不是 Uprising）搭配時要先拿掉 Advanced Data Analysis、Forbidden Weapons、Ornithopter Fleet、Panopticon、Spy Drones。另洗入 2 張陰謀牌與 2 張帝國牌；可選 Kota Odax of Ix 當領袖（只能和科技模組一起用）。',
          src: '官方 Bloodlines 規則書 第 6 頁',
        },
        {
          label: '取得科技',
          text: '主要方式：你派探員到有綠色五邊形（蘭茲拉特）圖示的版圖空間那一回合，可取得 1 個科技板塊。選 3 疊最上方面朝上的 1 個，付香料費用，放在供應區，再翻開該疊下一張。疊空了之後選擇就變少。',
          src: '官方 Bloodlines 規則書 第 7 頁',
        },
        {
          label: '折扣',
          text: 'Ixian Embassy 版圖：你有最高議會席位時，每個科技少 1 香料。-1 折扣圖示：只對一次取得有效，可與最高議會折扣併用，但不同圖示的折扣不能疊。費用最低 0。',
          src: '官方 Bloodlines 規則書 第 7 頁',
        },
        {
          label: '使用',
          text: '有「每回合一次」圖示的板塊在自己的回合使用，翻成面朝下；下回合開始階段翻回來。其他板塊有的在揭示回合、贏得衝突時、終局時等不同時機生效，依板塊文字。',
          src: '官方 Bloodlines 規則書 第 7 頁',
        },
        {
          label: '搭配 Rise of Ix',
          text: '只加 Rise of Ix 的科技板塊：排除 Detonation Devices 與 Troop Transports，剩下 16 個與血脈的混洗，平均分成 3 疊。使用整個 Rise of Ix：不使用 Ixian Embassy 版圖，改把科技疊放在 Ix 版圖上（沒有最高議會折扣）；CHOAM 覆蓋會蓋住 2 個指揮官空間，改把 1 個指揮官放在無畏艦空間，4 人局另 1 個放在科技談判空間。',
          src: '官方 Bloodlines 規則書 第 7 頁；Universal Head 摘要 第 10 頁',
        },
        {
          label: '科技釐清',
          text: 'Forbidden Weapons：選擇給 3 戰力的選項時，必須在你至少有 1 影響力的勢力失去 1 影響力（若可以）。Ornithopter Fleet：你所有戰鬥圖示（含萬用）都視為撲翼機，取得時可能立即配對；擁有它時，水晶刀與沙漠鼠陰謀牌不能用來得 VP。',
          src: '官方 Bloodlines 規則書 第 12 頁',
        },
        {
          label: 'Navigation Chamber',
          text: '【玩家整理】它讓「版圖空間」的印刷費用少 1（最低 0），不影響科技費用，與最高議會折扣互不相關。「？」費用也算費用：選 1 香料那一項再折成 0，Spice Refinery 仍可拿 4 索拉里。有玩家說已寫信給 Dire Wolf 並得到「可以」的回覆（轉述，非公開文件）。',
          src: `${BGG}：Does Navigation Chamber affect Spice Refinery? 串；Navigation chamber, high council and tech tiles 串`,
        },
        {
          label: 'Spy Drones',
          text: '【玩家整理】它的「付費→效果」是一體結算：要在已經收回過間諜之後才翻開，才拿得到銷毀；不能先翻開拿索拉里、之後才補收回間諜。',
          src: `${BGGD}：Spy Drones 串`,
        },
      ],
    },
    {
      title: '搭配原版《沙丘：帝國》',
      fold: true,
      items: [
        {
          text: '建議不要加入原版的衝突卡（加了也行，但戰鬥圖示更難配對）。',
          src: `${RB} 第 18 頁`,
        },
        {
          text: 'Uprising 沒有 Mentat：要拿掉陰謀牌「Calculated Hire」（若用了原版衝突卡，也拿掉衝突卡「Sort Through the Chaos」）。其他原版陰謀牌與帝國牌可任意與 Uprising 混洗，或自選混搭。',
          src: `${RB} 第 18 頁`,
        },
        {
          text: '血脈搭配原版帝國：5 個指揮官改放在 Conspire、Wealth、Foldspace、High Council、Rally Troops（4 人局第六個放 Hall of Oratory）；拿掉 2 張「Fierce」指揮官技能；不加新衝突卡；拿掉全部 CHOAM 組件，另外還要拿掉 5 張陰謀牌（False Orders、Grasp Arrakis、Insider Information、Ripples in the Sand、Sleeper Unit）、7 張帝國牌（Arrakis Observer、Eliminate Allies、Holy War、Intelligence Training ×2、Pointing the Way、Shrouded Counsel）、3 位領袖（Count Hasimir Fenring、Gaius Helen Mohiam、Liet Kynes）；用 Steersman Y’rkoon 時拿掉放置或收回間諜的那張導航牌。',
          src: '官方 Bloodlines 規則書 第 3 頁',
        },
        {
          text: '【玩家整理】原版 8 位領袖可以用在 Uprising，平衡未知；香料必須流動與 Prepare the Way（取代 Arrakis Liaison）在 Uprising 已有新版；原版的單人（Hagal）牌不能用。',
          src: `${BGG}：Components 串`,
        },
      ],
    },
    {
      title: '6 人遊戲（兩隊各 3 人）',
      fold: true,
      items: [
        {
          text: '兩隊各由一位司令官（穆阿迪布 Muad’Dib 或薩達姆四世）領導，另有 4 位盟友領袖分兩隊。使用遊戲板反面（皇帝與弗雷曼被「大家族」與「邊緣世界」取代）；必須使用 CHOAM 模組；衝突牌堆只用 5 張衝突 II 疊在 4 張衝突 III 上（最多 9 回合）；只有盟友抽目標卡。隊伍分數是全隊每人分數相加。',
          src: '官方 Six-Player 補充 第 1、2 頁',
        },
        {
          text: '司令官沒有部隊、戰鬥標記、控制標記，也不能贏衝突獎勵；每個回合啟動 1 位盟友，由該盟友代替司令官處理影響力、招募部署與劍的戰力。每位盟友各自戰鬥，不合併戰力。',
          src: '官方 Six-Player 補充 第 3 頁',
        },
        {
          text: '司令官的個人板有兩個只有自己能派探員的空間；影響力軌的獎勵全隊都拿。另有「增援（Reinforce）」與「交易（Trade）」圖示可幫隊友。劍術大師只能用一次，但會給劍術大師獎勵標記，之後每次你的揭示回合 +2 戰力。',
          src: '官方 Six-Player 補充 第 3、4、5 頁',
        },
        {
          text: '建議與限制：不建議在 6 人局使用 Liet Kynes（沙蟲互動特殊）。6 人局的特殊空間（如卡爾薩格、哈比亞沙丘 Habbanya Erg、軍事支援等）見補充的 Six-Player Board Space Guide，本檔未收。',
          src: '官方 Six-Player 補充 第 2、8 頁',
        },
        {
          label: '6 人局的薩督卡與沙蟲',
          text: '穆阿迪布隊不能取得或招募薩督卡指揮官（規則在血脈規則書後面的 6 人部分）；皇帝隊沒有造物鉤，只能靠 Unexpected Allies 召喚沙蟲（造物鉤限制印在司令官個人板上，不在規則書內）。「贏得衝突時」的效果對司令官無效，因為司令官永遠不會贏得衝突（6 人規則第 6 頁側欄，BGG 討論引用）。',
          src: `血脈規則書 6 人部分；${BGG}：6 player: can fremen players recruit sardaukar… 串；Planetary array for commanders 串`,
        },
        {
          label: '6 人局領袖探員標記',
          text: '【玩家整理】領袖探員標記就是一般探員，也要靠間諜才能去被佔住的空間；箭頭只用來決定啟動哪位隊友。',
          src: `${BGG}：6v6 token agent 串`,
        },
      ],
    },
    {
      title: '領袖與牌的個別釐清（基本盒）',
      fold: true,
      items: [
        {
          label: 'Feyd-Rautha Harkonnen',
          text: '設置時把 Feyd 標記放在領袖卡上訓練軌最左格；到最右格後整場遊戲留在那裡。',
          src: `${RB} 第 17 頁`,
        },
        {
          label: 'Lady Jessica',
          text: '開局用這一面（不是 Reverend Mother Jessica）。',
          src: `${RB} 第 17 頁`,
        },
        {
          label: 'Lady Margot Fenring／Princess Irulan',
          text: '一次獲得多個影響力而越過 2 時，仍算「達到」2 影響力；失去後再升回來可再達到一次，但只有往上升才算達到。',
          src: `${RB} 第 17 頁`,
        },
        {
          label: 'Shaddam Corrino IV',
          text: '用印章戒指派探員到版圖空間時，「全宇宙皇帝」限制部署單位到衝突的效果立即生效。',
          src: `${RB} 第 17 頁`,
        },
        {
          label: 'Spacing Guild’s Favor',
          text: '在收尾時把這張牌從「在場」移到棄牌堆，不會觸發棄牌能力；只有從手牌棄掉才會。',
          src: `${RB} 第 17 頁`,
        },
        {
          label: '戰力設定不再是單獨步驟',
          text: '揭示回合中隨時可設定並更新戰力，讓像 Gurney Halleck 這種領袖能在揭示回合參考戰力。',
          src: `${RB} 第 13 頁`,
        },
        {
          label: 'Reverend Mother 類加倍能力',
          text: '【玩家整理】加倍的是空間印好的獎勵，影響力軌上升是另外的效果，不會一起加倍。',
          src: `${BGG}：Rev. Mother Ability Doubling 串`,
        },
        {
          label: 'Calculus of Power',
          text: '設計師回覆：揭示時它要銷毀的是「另一張」皇帝牌，不能銷毀自己；兩張 Calculus 也不能互相銷毀（其中一張已被銷毀，無法再使用能力）。',
          src: `${BGGD}：Can you trash Calculus of Power to trigger its own reveal condition? 串`,
        },
      ],
    },
    {
      title: '用詞對照（中文全為自譯）',
      fold: true,
      items: [
        {
          text: '【待核對】探員 Agent、揭示回合 Reveal turn、說服力 Persuasion、帝國市場列 Imperium Row、陰謀牌 Intrigue、衝突 Conflict、駐軍區 Garrison、索拉里 Solari、香料 Spice、造物鉤 Maker Hooks、沙蟲 Sandworm、護盾牆 Shield Wall、觀察站 Observation post、間諜 Spy、蘭茲拉特議會 Landsraad、宇航公會 Spacing Guild、姐妹會 Bene Gesserit、弗雷曼 Fremen、皇帝 Emperor、劍術大師 Swordmaster、聯盟 Alliance、影響力 Influence、合約 Contract、科技板塊 Tech tile、無畏艦 Dreadnought、貨船 Freighter、泰雷克斯 Tleilaxu、嫁接 Graft、指揮 Command、薩督卡指揮官 Sardaukar Commander、滲透 Infiltrate、收集情報 Gather Intelligence。',
          src: '自譯，無中文來源',
        },
      ],
    },
    {
      title: '來源不一致與待確認',
      fold: true,
      items: [
        {
          text: '帝國特權：Universal Head 摘要寫「銷毀（trash）1 張陰謀牌來抽 1 張」，官方 Board Space Guide 與 Uprising 規則寫「棄掉（discard）」。內文採官方（棄掉）。BGG 討論指出規則書圖示說明寫「銷毀陰謀牌」、空間文字寫「棄掉」，本身自相矛盾；陰謀牌堆很少會用完，實際影響很小，沒有官方裁定。',
          src: `${BSG}；Universal Head 摘要 第 4 頁；${BGG}：Should we Trash or discard the Intrigue card? 串`,
        },
        {
          text: '「每回合一次」科技：Condensed Rules 寫「once per turn」，官方規則書與 Bloodlines 規則書寫「once per round（每回合一次）」。內文採官方。',
          src: `${RB} 第 20 頁；Condensed Rules`,
        },
        {
          text: '間諜活動（Espionage）：Universal Head 摘要標為戰鬥空間，官方 Board Space Guide 沒有標、規則書第 10 頁也說勢力區的戰鬥空間只有 Heighliner、Desert Tactics、Fremkit。內文採官方（不是戰鬥空間）；可看實物板面確認有沒有沙漠插圖加交叉劍。',
          src: `${BSG}；${RB} 第 10 頁；Universal Head 摘要 第 4 頁`,
        },
        {
          text: '放置間諜「may」：規則書用 may、官方 FAQ 寫強制；設計師在 BGG 說是措辭失誤，內文採強制（供應區沒有間諜時先收回則可不做）。',
          src: `${RB} 第 11 頁；${BGGD}：Is the icon that allows you to place a spy mandatory? 串`,
        },
        {
          text: '收集情報與陰謀牌：規則書要求放下探員後「立即」決定，但陰謀牌又寫「任何時間」。BGG 討論偏向「立即」優先（不能插入陰謀牌），也有人持相反意見，沒有官方裁定。Gaius Helen Mohiam 的相關問題同此，請見血脈區塊。',
          src: `${BGG}：Edge case with gather intelligence and false orders 串；Gaius Helen Mohiam 串（未定）`,
        },
        {
          text: 'Staban 的印章戒指（Unseen Network）放間諜後能不能先打陰謀牌再付費：多數人認為可以（數位版實測可行），也有人認為一體結算；沒有官方裁定，不收進正文。',
          src: `${BGG}：Staban ring + Special Mission 串（未定）`,
        },
        {
          text: '沒收錄：領袖個別能力、帝國牌／陰謀牌／衝突卡／合約／科技板塊的效果、影響力軌各格獎勵、聯盟 VP、目標卡配對、牌上圖示的逐一解讀；單人與 2 人對手（Rivals／House Hagal）依使用者決定不收。BGG 討論的逐則問答放在非官方 FAQ 檔。',
          src: '範圍說明',
        },
        {
          text: '使用者另傳的 Card Inventory xlsx 與「All expansions」彙整 PDF 未用於內容；彙整 PDF 的內容與官方規則一致，但屬玩家整理，只用來交叉核對。',
          src: '範圍說明',
        },
      ],
    },
  ],
}
