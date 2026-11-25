// 沙丘：帝國—崛起（Dune: Imperium – Uprising）非官方 FAQ（BGG 討論）：玩家討論整理，不是官方裁定
// 來源：BoardGameGeek 規則討論區（Uprising 與 Bloodlines 兩個區）的討論串，用自己的話摘要，不整段貼原文。
// 範圍：基本遊戲、CHOAM 模組、血脈（Bloodlines）、6 人局。單人與 2 人對手（Rivals／House Hagal）依使用者決定不收。
// 標示「設計師回覆」的是討論串中有設計師頭銜的人所說；其餘是玩家共識或個人意見，與官方規則書／FAQ 衝突時以官方為準。
// 登記：在 unofficialRegistry.ts 加 import 與一行，key 是 'Dune: Imperium – Uprising'（中間是 en dash）。
// 討論串連結多數尚未補；有連結後補到 sources 的 url。

import type { GameFaqData } from '../types'

const BGG = 'BGG 討論（非官方）'

export const DUNE_IMPERIUM_UPRISING_UNOFFICIAL_FAQ: GameFaqData = {
  sub: '玩家整理・BGG 規則討論區',
  note: '以下是 BGG 討論串的玩家結論，不是官方 FAQ；有些只是多數人的看法、沒有官方裁定，會標「未定」。與規則書、官方 FAQ 衝突時以官方為準。',
  sources: [
    { label: 'BGG：Dune: Imperium – Uprising 規則討論區', url: 'https://boardgamegeek.com/boardgame/397598/dune-imperium-uprising/forums/66' },
    { label: 'BGG：Dune: Imperium – Bloodlines 規則討論區', url: 'https://boardgamegeek.com/boardgameexpansion/426129/dune-imperium-bloodlines/forums/66' },
  ],
  groups: [
    {
      title: '效果順序與時機',
      topics: [
        {
          name: '一般原則',
          items: [
            {
              q: '一個回合裡拿到的效果，可以自己決定結算順序嗎？',
              a: '多數討論認為可以：探員框、版圖空間、揭示框的效果都像放進一堆待辦，想先做哪個都行。例外是：進空間前一定要先付空間費用；「收集情報」要在放下探員後第一個決定；「付費→效果」這種組合不能被拆開。',
              src: `${BGG}：Technology tile acquire 時機串（2025 年 9 月）等`,
            },
            {
              q: '每一次抽牌是獨立的效果嗎？（例如研究站抽 2 張）',
              a: '是。兩次抽牌是兩個分開的效果，中間可以插入別的效果；數位版目前也是這樣處理。',
              src: `${BGG}：Research Stations 抽牌是否不可分割串（4 月）`,
            },
            {
              q: '取得科技板塊時的「取得效果」和板塊本身的能力，誰先？',
              a: '討論結論是取得效果也只是一般效果，放進待辦堆，由你決定何時結算；不存在「已取得但還沒生效」的空窗。例子：CHOAM Transports 取得時拿一張立即合約，完成合約後就可以抽牌。',
              src: `${BGG}：What is the timing of tech tile acquire effect 串（2025 年 9 月）`,
            },
            {
              q: '貨船（Freighter）收回時，獎勵要照順序拿嗎？',
              a: '不用，可以照自己想要的順序拿。有玩家引用天人合一規則書第 5 頁：收回貨船時獎勵順序任選。',
              src: `${BGG}：同上（2025 年 9 月）`,
            },
          ],
        },
        {
          name: '付費→效果不可拆開',
          items: [
            {
              q: '「付費→效果」的組合可以中途插入別的行動嗎？（例如 Spy Drones）',
              a: '設計師回覆：X→Y 這類效果一般不能被打斷。社群也引用了另一則設計師（Paul）的裁定，認為付費→效果是一體結算，並套用到科技、空間與牌。所以 Spy Drones 要先已經收回過間諜，再翻開它才拿得到銷毀；不能先翻開拿 1 索拉里、之後才去收回間諜再補銷毀。',
              src: `${BGG}：Spy Drones 串（4 月）；設計師回覆`,
            },
            {
              q: '翻開 Spy Drones 之前，可以先用它補 1 索拉里湊錢再進空間嗎？',
              a: '可以先翻它拿索拉里再進空間（科技與陰謀牌可在派探員前使用），但那樣當下還沒收回間諜，銷毀的部分就拿不到。',
              src: `${BGG}：Spy Drones 串（4 月）`,
            },
            {
              q: 'Staban Tuek 的印章戒指（Unseen Network）放間諜後，可以先打陰謀牌再付 1 香料換 3 索拉里嗎？',
              a: '多數人認為可以，放間諜與「若放在某處就…」的獎勵不是一體結算，獎勵進待辦堆。有玩家在數位版實測可行；仍有人認為整個能力是一體。沒有官方裁定，未定。',
              src: `${BGG}：Staban ring + Special Mission 串（6 月）`,
            },
          ],
        },
        {
          name: '單回合內的取得與部署',
          items: [
            {
              q: '探員派到戰鬥空間後，用陰謀牌、科技等其他來源拿到的部隊，可以一起部署嗎？',
              a: '可以。規則的意思是：本回合招募的所有單位都能部署，再加上最多 2 個駐軍區原有的單位，與招募時機和來源無關；規則書括號裡的「空間與牌」只是提醒文字，不是限制。',
              src: `${BGG}：Rapid Dropships 串（2 月）；陰謀牌招募串（5 月）`,
            },
            {
              q: 'Rapid Dropships 科技在已經是戰鬥空間時能用嗎？',
              a: '不能，已經是戰鬥空間時它不會有任何效果。',
              src: `${BGG}：rapid dropships tech tile 串（2025 年 11 月）`,
            },
            {
              q: 'Rapid Engineering 棄掉 Spacing Guild’s Favor 當費用，拿到的 2 香料可以立刻拿來付後面的費用嗎？',
              a: '可以，棄牌的效果立刻發生，所以可以用那 2 香料去取得科技。',
              src: `${BGG}：Rapid Engineering + Spacing Guild’s Favor 串（9 月）`,
            },
            {
              q: '同一回合內兩張牌加起來的劍（例如 Calculus of Power）要最後結算才拿得到最大值嗎？',
              a: '是。劍也是一般效果，可自選順序；讓 Calculus of Power 最後結算，就能先拿到其他兩張牌的劍。三張牌（Calculus、Sardaukar Coordination、Quash Rebellion）共 8 劍。',
              src: `${BGG}：Reveal: Calculus + Coordination + Quash Rebellion 串（5 月）`,
            },
          ],
        },
        {
          name: '回合結構與揭示',
          items: [
            {
              q: '「回合（turn）」和「輪（round）」有什麼不同？',
              a: '回合是一次探員回合或一次揭示回合；一輪是所有玩家輪流做完各自的回合再加上戰鬥階段。每輪每人有 1～4 個回合。規則書與 App 的用語容易混淆，討論串有設計師說明這點。',
              src: `${BGG}：Tracking troops acquired this turn? 串（3 月）；Leader in game 串（2025 年 10 月）；設計師回覆`,
            },
            {
              q: '探員回合可以只打牌、不派探員嗎？',
              a: '不行。探員回合一定是打 1 張牌並派 1 個探員，付費、處理間諜、再結算牌與空間效果；只有極少數牌或陰謀牌能讓你跳過探員回合。',
              src: `${BGG}：First playthrough questions 串（1 月）`,
            },
            {
              q: '可以把探員派到自己已經有探員的空間嗎？',
              a: '不行，只有別人的探員可以靠間諜滲透；自己的探員擋住自己。',
              src: `${BGG}：Leader in game 串（2025 年 10 月）`,
            },
            {
              q: '每個派到戰鬥空間的探員回合，都可以再部署 2 個駐軍區單位嗎？',
              a: '可以，是「每個回合、只要派到戰鬥空間」各一次，不是每輪一次。同一輪派三次探員到三個戰鬥空間，每次都能各部署最多 2 個駐軍區單位。也有陰謀牌能把所在空間變成戰鬥空間。',
              src: `${BGG}：Confusion about moving units from garrison into conflict 串（2025 年 11 月）`,
            },
            {
              q: '本回合新招募的單位和原本的駐軍區單位要怎麼區分？',
              a: '規則書沒有規定方式。玩家做法：把本回合新招募的放駐軍區靠衝突區的一邊，原本的放另一邊；部署可以放在回合最後才決定。實際玩起來很少出問題。',
              src: `${BGG}：Tracking troops acquired this turn? 串（3 月）`,
            },
            {
              q: '揭示回合一定要翻開全部手牌、效果一定要結算嗎？包括劍？',
              a: '是。所有手牌都要揭示，揭示效果（含劍）是強制的；你只有「要不要花說服力買牌」可以選。所以不能為了拿第二名獎勵而故意少算劍。',
              src: `${BGG}：Reveal turn strength optional? 串（2025 年 11 月）；New player questions 串（2025 年 12 月）`,
            },
            {
              q: '哪些效果是可以不做的？',
              a: '一般只有：銷毀圖示（選擇性）、付費→效果的「付費」、文字寫 may 的效果；其他牌上產生的效果都強制。箭頭組合（例如 Treacherous Maneuver）可選擇不付費、也就不拿效果。',
              src: `${BGG}：New player questions 串（2025 年 12 月）；Treacherous Maneuver 串（2025 年 11 月）`,
            },
            {
              q: '揭示回合抽到的牌，和揭示之後抽到的牌，處理方式一樣嗎？',
              a: '不一樣。依官方 FAQ：揭示回合中抽到的牌必須立刻揭示並使用；揭示之後（例如戰鬥獎勵）抽到的牌留在手上，下一輪再抽 5 張，所以會多於 5 張。例子：揭示時買到香料必須流動進棄牌堆、再用 Intelligence Report 抽到它，可以馬上揭示。',
              src: `${BGG}：Drawing an aquired card during reveal turn 串（2025 年 10 月，引用官方 FAQ）`,
            },
            {
              q: '打出（用來派探員）的牌，揭示框也會生效嗎？',
              a: '不會。探員回合打出的牌不會觸發揭示效果；但它們仍算「場上有這張牌」，所以勢力連動（如弗雷曼連動）可以算。',
              src: `${BGG}：Desert Power reveal 串（6 月）`,
            },
          ],
        },
      ],
    },
    {
      title: '間諜、收集情報與滲透',
      topics: [
        {
          name: '收集情報',
          items: [
            {
              q: '可以用 False Orders 這類陰謀牌，在派探員之後、收集情報之前插入嗎？',
              a: '討論偏向不行：規則寫派探員後要「立即」決定要不要收集情報，所以放下探員後第一件事就是這個；而那張陰謀牌本身也要放在派探員之後才有作用。也有玩家主張規則沒明說，但沒有官方裁定，未定。',
              src: `${BGG}：Edge case with gather intelligence and false orders 串（7 月）`,
            },
            {
              q: 'Gaius Helen Mohiam 想用同一個間諜去付陰謀牌費用，還是會被強迫收集情報嗎？',
              a: '她的能力是「只要可以收集情報就必須」。多數人說放下探員後必須先收集；少數玩家主張可以在派出前先打陰謀牌收回那個間諜，但這在討論串裡有激烈爭議，沒有官方裁定，未定。',
              src: `${BGG}：Gaius Helen Mohiam – Can I spend the spy for a plot card? 串（2 月～3 月）`,
            },
          ],
        },
        {
          name: '間諜圖示與滲透',
          items: [
            {
              q: '間諜探員圖示可以送探員到已被別人佔住的空間嗎？',
              a: '可以，但要收回間諜（滲透）；空間是空的時就不用收回。',
              src: `${BGG}：法語、義大利語串（6 月）`,
            },
            {
              q: '同一個空間最多可以有幾個探員？',
              a: '沒有限制：不同顏色的探員可以靠領袖能力、間諜滲透等方式一起放在同一個空間，四個也做得到（含血脈的深度潛伏間諜）。',
              src: `${BGG}：Possible three agents at a location 串（8 月）`,
            },
            {
              q: 'Holy War 的「移動間諜」是什麼意思？',
              a: '把間諜移到不同的觀察站；多個間諜要移時從先手開始依序處理。Staban 在被移走間諜的空間時，設計師猜測 Staban 會先拿到香料（規則沒明說）。',
              src: `${BGG}：Holy War – move spy? 串（2025 年 11 月）；設計師回覆（為推測）`,
            },
          ],
        },
        {
          name: '間諜補充',
          items: [
            {
              q: '「放置間諜」是強制的嗎？',
              a: '設計師回覆：是強制的；規則書用 may 是措辭失誤，後來 FAQ 才澄清。但如果你的間諜都已經在版圖上，先收回一個再放是「可以」不是「必須」，所以可以選擇不收回、也就不放（例如 Special Mission）。付費→效果的付費則永遠可以不付。',
              src: `${BGG}：Is the icon that allows you to place a spy mandatory? 串（2025 年 11 月）；設計師回覆`,
            },
            {
              q: '收回間諜有哪幾種？「若你本回合收回過間諜」要怎麼滿足？',
              a: '①派探員時的滲透或收集情報，必須是連到那個空間的間諜；②圖示上寫的「收回間諜」當費用，可以是版圖上任何位置的間諜；③「移動間諜」其實是先收回（不拿效果）再放，也算收回過。「若你收回過間諜」那句本身不讓你收回，要先用上面方式收回。例：Rebel Supplier 沒有收回圖示，必須從派去的空間收回間諜才有 2 部隊。',
              src: `${BGG}：Recalling a spy question 串（3 月）；Placing a spy from an Intrigue card 串（2025 年 11 月）`,
            },
            {
              q: '間諜探員圖示（眼睛）去已被佔住的空間，可以滲透嗎？',
              a: '可以。先看圖示是否允許去那個空間，再付費，付費之一就是收回間諜來滲透；多數人與設計師層級的資深玩家都這樣打，也有人質疑文字順序，但討論串結論一致是可行。單純用眼睛圖示去空位時不必收回間諜。',
              src: `${BGG}：[CLOSED] Spy Eye on occupied locations 串（2 月）；Can you Infiltrate while using the spy agent icon 串（2025 年 11 月）`,
            },
            {
              q: '有間諜探員圖示的牌（如 Public Spectacle）要怎麼收回間諜？',
              a: '它只是讓你能去有間諜連著的空間，不會自動收回。要靠滲透、收集情報、陰謀牌或其他效果收回。有玩家引用捷克語規則書寫「不能收回」是翻譯錯誤，英文是「不需要收回」。',
              src: `${BGG}：Public Spectacle card 串（3 月）`,
            },
            {
              q: '同一回合可以既滲透又收集情報嗎？',
              a: '同一個間諜不行。若同一個空間連著兩個你的間諜，可以各收回一個，一個滲透、一個收集情報（玩家舉例如 Spice Refinery、Research Station）。',
              src: `${BGG}：The Emperor influence track bonus that allows placing a spy 串（2025 年 11 月）`,
            },
            {
              q: '派探員後才放下的間諜，還能立刻收集情報嗎？',
              a: '不行：收集情報要在放下探員後「立刻」決定。能用的情形是：先用陰謀牌或影響力獎勵放好間諜，再打牌派探員去那個空間，滲透或收集情報照常。',
              src: `${BGG}：The Emperor influence track bonus that allows placing a spy 串（2025 年 11 月）`,
            },
            {
              q: '收回間諜後，同一個觀察站可以立刻放回去嗎？',
              a: '可以：收回發生在其他效果之前，觀察站已空出來。玩家把它當作「鎖住姐妹會觀察站」的策略。',
              src: `${BGG}：Can I place a spy in the same spot that I recalled from? 串（1 月）`,
            },
            {
              q: '兩個間諜可以在同一個觀察站嗎？',
              a: '可以，兩者並存；除非牌上寫明替換。Distraction 等牌只是讓你能放在已有對手間諜的地方，不會取代對方。血脈的深度潛伏間諜規則另寫：不能放在自己已有間諜的地方，玩家推測也適用其他類似效果。',
              src: `${BGG}：2 Spies in the same spot 串（3 月）；How does this card work? 串（3 月）`,
            },
          ],
        },
      ],
    },
    {
      title: '合約（CHOAM 模組）',
      topics: [
        {
          name: '完成合約的時機',
          items: [
            {
              q: '拿到合約的同一回合，可以立刻完成嗎？',
              a: '要看合約種類：寫了某個版圖空間的合約，要你「派探員去那個空間之前」就已經持有才算，所以在同一個空間拿到的合約不能同回合完成；立即合約、「取得任一聯盟」、「取得香料必須流動」這類有別的觸發條件的合約，可以在拿到後同回合完成，要注意結算順序。',
              src: `${BGG}：Accomplishing contracts key rules 串（4 月）；completing Spice Must Flow contract 串（4 月）`,
            },
            {
              q: '陰謀牌先給合約，再用卡牌派探員去那個空間，算完成嗎？',
              a: '算。只要在派探員之前已經拿到合約就可以。',
              src: `${BGG}：Accomplishing contracts key rules 串（7 月）`,
            },
            {
              q: '「取得香料必須流動」合約可以在同一回合內完成嗎？',
              a: '可以：探員回合拿到合約，揭示回合買到 The Spice Must Flow 就完成。也可以在同一個揭示回合用 Delivery Logistics 拿合約再買牌。',
              src: `${BGG}：completing Spice Must Flow contract in 1 turn 串（4 月）`,
            },
          ],
        },
        {
          name: 'CHOAM Demands',
          items: [
            {
              q: 'CHOAM Demands 完成合約時，會得到合約獎勵與空間獎勵嗎？',
              a: '該牌讓你不經空間就完成一張自己持有的合約，得到合約上的獎勵，但不會得到合約條件本身（例如收穫合約要求的香料）。派去的探員空間仍照常給該空間的效果。討論串內曾有人持不同說法，後續多數人採此看法，非官方裁定。',
              src: `${BGG}：CHOAM demands 串（5 月）`,
            },
            {
              q: 'CHOAM Demands 可以完成同回合剛拿到的合約，或香料必須流動合約嗎？',
              a: '可以，社群認為它不受一般完成條件限制，可以完成你任何未完成的合約，包括同回合剛拿的。',
              src: `${BGG}：completing SMF 串、Accomplishing contracts 串`,
            },
          ],
        },
        {
          name: '其他合約相關',
          items: [
            {
              q: '血脈的 Mercantile Affairs：同回合完成兩張合約，可以拿兩張陰謀牌嗎？',
              a: '只拿 1 張。牌上寫的是「若你本回合完成過合約」，不是「每完成一張」。',
              src: `${BGG}：Mercantile Affairs 串（6 月）`,
            },
            {
              q: '天人合一的綠背合約可以在沒有天人合一時使用嗎？',
              a: '不建議：其中幾張有指向 Ix 專屬空間，而且這批合約整體偏強（都會再給一張合約）。有玩家提了「起始合約」的自創玩法，屬房規。',
              src: `${BGG}：Ix CHOAM Contracts 串（2025 年 9 月）`,
            },
          ],
        },
        {
          name: '取得合約補充',
          items: [
            {
              q: '同一回合在原空間拿到指向該空間的合約，可以直接完成嗎？',
              a: '不行：你必須在派探員「當時」就已持有該合約。要等之後的回合再派到那個空間完成。設計師式的順序說明：打牌→付費→派探員→處理間諜→結算效果。',
              src: `${BGG}：Leader in game 串（2025 年 10 月）；New player questions 串（2025 年 12 月）`,
            },
            {
              q: 'Shaddam Corrino IV 擱置的合約怎麼用？',
              a: '他在設置時擱置 2 張只有自己能拿的合約；拿合約時，可以從版圖上 2 張或自己擱置的 2 張中選。',
              src: `${BGG}：New player questions 串（2025 年 12 月）`,
            },
            {
              q: '衝突第一名獎勵是合約，又有沙蟲加倍時，要怎麼拿？',
              a: '一次一張：拿一張，立刻從牌堆補一張翻開，再從版圖上的 2 張裡拿第二張。',
              src: `${BGG}：Doubling CHOAM Contract Reward From Conflict Card 串（2025 年 12 月）`,
            },
          ],
        },
      ],
    },
    {
      title: '沙蟲、造物鉤與戰鬥',
      topics: [
        {
          name: '沙蟲與造物鉤',
          items: [
            {
              q: '召喚沙蟲一定要有造物鉤嗎？造物鉤會用掉嗎？',
              a: '造物鉤不會用掉，拿到後整場保留。版圖空間與帝國牌的召喚都有「要有造物鉤」的條件；現有卡片裡只有陰謀牌 Unexpected Allies（付 2 水召喚）不需要。',
              src: `${BGG}：Help me understand sand worms 串（4 月）；Maker Hooks 串（6 月）`,
            },
            {
              q: '護盾牆還在的時候，哪些衝突不能召喚沙蟲？',
              a: '只有衝突卡右下角有「禁止沙蟲」圖示的（黃色卡、受護盾牆保護的地點）不能；其他衝突卡隨時可召喚。護盾牆一旦移除就不會再回來。',
              src: `${BGG}：Help me understand sand worms 串（4 月）`,
            },
            {
              q: '沙蟲加倍的獎勵，會連戰鬥圖示一起加倍嗎？',
              a: '不會，戰鬥圖示和控制權不加倍。（這點以規則書為準。）',
              src: '官方規則書（BGG 討論未爭議）',
            },
          ],
        },
        {
          name: '戰力與衝突卡',
          items: [
            {
              q: '目標卡（開局的 Objective）算已贏得的衝突卡嗎？',
              a: '算。卡面文字寫了「視為你已贏得的衝突卡」，所以像 Grasp Arrakis 的翻衝突卡、終局配對陰謀牌都可以用；有玩家指出德文版沒印這句，設計師在其他串確認過算。',
              src: `${BGG}：Intrigue: Grasp Arrakis 串（5 月）；a question about endgame intrigue 串（6 月）`,
            },
            {
              q: '終局的萬用戰鬥圖示（?）要先配對還是先用陰謀牌？',
              a: '自選順序，而且不用一定配對；規則書說可與供應區任一戰鬥圖示配對。',
              src: `${BGG}：a question about endgame intrigue 串（6 月）`,
            },
            {
              q: '一個勢力的 2 影響力 VP 與聯盟 VP 的差別？',
              a: '影響力到 2 以上，每個人都拿 1 VP，掉到 2 以下才失去；聯盟標記只有一個人能持有，拿到 +1 VP，被超過時失去並轉給對方。有人把兩者搞混玩錯。',
              src: `${BGG}：Victory points 串（5 月）`,
            },
            {
              q: '勝利獎勵的 VP 是不是只有第三階段衝突卡才有？',
              a: '討論中提到衝突卡上的 VP 圖示主要出現在第三階段的衝突卡；實際要看卡面。',
              src: `${BGG}：Victory points 串（4 月）`,
            },
          ],
        },
        {
          name: '沙蟲加倍與召喚',
          items: [
            {
              q: '沙蟲加倍的「任選兩個」獎勵（如勢力影響力）怎麼選？',
              a: '把獎勵結算兩次：每次各自選兩個，兩次可以選一樣的。所以可以是 2 個勢力各 +2、四個勢力各 +1，或 1／1／2；但單次結算內不能在同一個勢力拿超過 2。',
              src: `${BGG}：Winning Propaganda with worms 串（1 月）`,
            },
            {
              q: 'Unexpected Allies 一定要派到戰鬥空間才能用嗎？',
              a: '不用。召喚沙蟲的圖示本身就是「召喚並立即部署到衝突區」，沙蟲不能放駐軍區，所以揭示回合或沒有劍圖示的空間也能用。規則書第 10 頁、Desert Power 等牌也是同理。',
              src: `${BGG}：Unexpected allies – needs a sword icon or not? 串（3 月）`,
            },
          ],
        },
      ],
    },
    {
      title: '陰謀牌與各種卡牌',
      topics: [
        {
          name: '陰謀牌',
          items: [
            {
              q: 'Opportunism 的「失去 1 影響力」要放在兩個不同勢力嗎？',
              a: '不用，可以同一個勢力連失兩次，也可分兩個；那張牌寫的是失去 1 影響力、做兩次。想表達「同一個勢力 2 影響力」要看雙箭頭圖示。',
              src: `${BGG}：How does Opportunism Intrigue work 串（11 月）`,
            },
            {
              q: 'Unnatural（Twisted 陰謀牌）可以銷毀自己來抽新陰謀牌嗎？',
              a: '不行，費用是從手牌銷毀一張陰謀牌，而 Unnatural 打出後已經不在手牌。',
              src: `${BGG}：Unnatural twisted intrigue card 串（4 月）`,
            },
            {
              q: 'Controlled 要看牌堆頂，牌堆空了可以打嗎？',
              a: '不行。「看牌堆頂」的效果在牌堆空時無法使用（不會先重洗），類似規則書對 Poison Snooper 的說法。',
              src: `${BGG}：Controlled — can I play the Plot effect with an empty deck? 串（10 月）`,
            },
            {
              q: 'Withdrawal（Piter 的 Twisted 陰謀牌）或 Litany Against Fear 這類「回合開始時」的效果，前面還能先打別的陰謀牌嗎？',
              a: '一位玩家的看法是不行，因為先做別的事就不再是「回合開始」。其他人沒有進一步補充，未定。',
              src: `${BGG}：Pieter Devries 兩個釐清串（2025 年 8 月）`,
            },
            {
              q: 'Sonic Snoopers 把 Piter 的 Twisted 陰謀牌放牌堆底後，要從哪個牌堆抽？',
              a: '討論偏向從一般陰謀牌堆抽，因為科技是 Piter 出現前設計的；也有玩家選擇讓玩家自選牌堆，屬自行裁決。未定。',
              src: `${BGG}：Piter de Vries Twisted Intrigues and Sonic Snoopers 串（2025 年 11 月）`,
            },
          ],
        },
        {
          name: '圖示與標記',
          items: [
            {
              q: '「銷毀」圖示一定要執行嗎？',
              a: '不一定。規則書圖示說明寫銷毀圖示是選擇性的（除非是付費或銷毀自己）；牌面上以文字寫的「銷毀這張牌」才是強制。同樣的，「毀掉護盾牆」圖示也是選擇性的。',
              src: `${BGG}：Do EVERYTHING in Agent box? 串（7 月）`,
            },
            {
              q: '血脈的「指揮」（Command）效果是強制的嗎？',
              a: '是。例如 Bombast 揭示後說服力達 6 以上就一定拿 3 索拉里並銷毀自己；想另外銷毀它也可以用別的手段（如 Calculus of Power）。',
              src: `${BGG}：Bombast : command effect is mandatory? 串（2 月）`,
            },
            {
              q: '牌上「某影響力：效果」（如 Liet Kynes 的戒指）要怎麼讀？',
              a: '冒號左邊是條件，右邊是獎勵：條件成立才拿；例如到綠色空間且該回合你有皇帝 2 影響力，才得 1 水。圖示說明在規則書最後面。',
              src: `${BGG}：Liet Kynes – Ring effect 串（2025 年 9 月）`,
            },
          ],
        },
        {
          name: '看牌堆',
          items: [
            {
              q: '實體版可以隨時翻看自己的牌堆再洗牌嗎？',
              a: '官方沒有裁定。討論結論：玩家本來就能由「手牌＋棄牌＋已打出牌」推算牌堆內容，所以影響不大，但要小心有牌堆頂資訊時別趁機洗掉（Paul 或 Glowglobes 科技）；很多人當房規。數位版是因為不會改變牌序所以允許。',
              src: `${BGG}：Look Draw pile 串（11 月）`,
            },
          ],
        },
        {
          name: '牌與圖示補充',
          items: [
            {
              q: '買牌之後再銷毀提供說服力的牌，說服力還在嗎？',
              a: '還在。依官方 FAQ，說服力與劍都進「池」，即使提供它們的牌被銷毀也不會消失；所以可以先買牌、再銷毀（例如 Calculus of Power）。',
              src: `${BGG}：Buy first trash second on reveal? 串（2025 年 12 月，引用官方 FAQ）`,
            },
            {
              q: 'Guild Spy 買到兩張香料必須流動，影響力加兩次嗎？',
              a: '只加一次：牌上寫「若你這回合取得」，只是條件成立一次。',
              src: `${BGG}：Guild Spy when you gain two The Spice Must Flow 串（2 月）`,
            },
            {
              q: 'Guild Spy 的說服力和 Wheels Within Wheels、Smugglers Haven 一起用，順序有限制嗎？',
              a: '沒有，揭示效果自選順序；說服力進池後可分次花。例：先買香料必須流動（用到 Wheels 的說服力），再用 Guild Spy 加影響力，最後把間諜移到造物空間讓 Smugglers Haven 給 2 香料，合法。討論串中有人引用過玩家改版的卡面文字，結論請以印刷版為準。',
              src: `${BGG}：Guild Spy + Wheels + Smugglers Haven Reveal Interaction 串（2025 年 11 月）`,
            },
            {
              q: 'Chani 的 Tactical Genius：先部署到衝突再拿陰謀牌可以嗎？',
              a: '可以，部署與獲得的效果可自選順序；先部署到有 3 個單位再結算，就能拿陰謀牌；想避免拿牌也可以先結算。',
              src: `${BGG}：How it works Chani’s Tactical Genius 串（3 月）`,
            },
            {
              q: '「銷毀陰謀牌」圖示，牌要放回盒子還是丟進棄牌堆？',
              a: '規則書自相矛盾：圖示說明寫銷毀，帝國特權空間文字寫棄掉。實際上陰謀牌堆幾乎不會用完，兩種做法結果通常一樣，沒有官方裁定。',
              src: `${BGG}：Should we Trash or discard the Intrigue card? 串（2025 年 11 月）`,
            },
          ],
        },
      ],
    },
    {
      title: '領袖',
      topics: [
        {
          name: '血脈領袖',
          items: [
            {
              q: 'Gaius Helen Mohiam 的被動「你打出的牌具有間諜圖示」對沒有任何探員圖示的牌也有效嗎？',
              a: '有效，多數玩家認為所有牌都算有間諜圖示（類似基本遊戲用 Dispatch an Envoy 讓牌有圖示）。規則書「沒有探員圖示的牌不能打出」是在這能力出現前寫的。討論串中沒有官方回覆，只有玩家共識。',
              src: `${BGG}：Gaius Helen Mohiam passive 串（8 月）`,
            },
            {
              q: 'Esmar Tuek 用印章戒指在 Tuek’s Sietch 放額外香料，可以同回合拿走嗎？',
              a: '可以：先放 1 額外香料，再因派探員拿到 1 索拉里（被動）、1 香料或 1 牌、與所有額外香料（含剛放的）。若是在別人的探員已在那裡時放，對方不會拿到，香料留著等下一個進那空間的人。',
              src: `${BGG}：Esmar tuek 串（2025 年 8 月）；Esmar Tuek – Tueks Sietch 串（2025 年 9 月）；Esmar Tuek’s ring 串（4 月）`,
            },
            {
              q: 'Tuek’s Sietch 每回合會長香料嗎？',
              a: '會，它是造物空間，造物階段若沒有探員就加 1 額外香料；進該空間時給的是 1 香料或 1 牌，再加累積的額外香料。',
              src: `${BGG}：New spice on Tueks sietch 串（2025 年 8 月）；Tuek’s Sietch Spice Collection 串（3 月）`,
            },
            {
              q: 'Liet Kynes 的能力遇到兩隻沙蟲會觸發兩次嗎？',
              a: '會，英文卡面是「每一隻」沙蟲各算一次（有德文版翻譯不夠精確的說法）。',
              src: `${BGG}：Liet Kynes Bonus in Deep Dessert 串（2025 年 10 月）`,
            },
            {
              q: 'Steersman Y’rkoon 的導航牌用完 4 張之後，影響力再次達到 2 會怎樣？',
              a: '什麼都沒有。導航牌每次只在揭示時取得一次資源，不會每回合重複。',
              src: `${BGG}：Steersman Y’rkoon 兩串（3 月、2025 年 9 月）`,
            },
            {
              q: 'Steersman 被動「揭示回合抽牌」抽到的牌要怎麼處理？',
              a: '依 FAQ：揭示回合抽到的牌必須立刻揭示並使用；揭示後（例如戰鬥獎勵）抽到的牌留在手上。',
              src: `${BGG}：Steersman Passive ability during Reveal turn 串（2025 年 9 月，引用官方 FAQ 第 3 頁）`,
            },
            {
              q: 'Piter de Vries 的 Twisted 陰謀牌什麼時候拿？和 Suspensor Suits 有互動嗎？',
              a: '回合開始階段拿，Suspensor Suits 是在玩家回合階段觸發，所以沒有互動。',
              src: `${BGG}：Pieter Devries 兩個釐清串（2025 年 8 月）`,
            },
            {
              q: 'Duncan 派到衝突區的探員算幾點戰力？',
              a: '論壇回覆是 3：戰力在揭示回合設定時才計算，所以派出與取得劍術大師的順序不影響。',
              src: `${BGG}：got a question about duncan 串（2025 年 8 月）`,
            },
          ],
        },
        {
          name: '崛起領袖',
          items: [
            {
              q: 'Reverend Mother 的加倍效果會包含影響力軌上升嗎？',
              a: '不會，加倍的是版圖空間印好的獎勵，影響力上升是另外的效果。',
              src: `${BGG}：Rev. Mother Ability Doubling 串（10 月）`,
            },
            {
              q: 'Calculus of Power 可以銷毀自己來拿 3 劍嗎？',
              a: '不行：揭示時它說要銷毀「另一張」皇帝牌。設計師回覆：不能銷毀自己。兩張 Calculus 互相銷毀也不行，因為其中一張已被銷毀、沒法再使用能力。（一般情況下有銷毀圖示的牌在打出時可以銷毀自己，這是兩回事。）',
              src: `${BGG}：Can you trash Calculus of Power to trigger its own reveal condition? 串（4 月）；設計師回覆`,
            },
            {
              q: 'Eliminate Allies 可以選自己當銷毀目標嗎？',
              a: '可以，能銷毀你在場、手牌或棄牌中的牌，包括它自己，銷毀時的效果會正常觸發。',
              src: `${BGG}：Can Eliminate Allies target itself for trashing? 串（9 月）`,
            },
          ],
        },
        {
          name: '崛起領袖補充',
          items: [
            {
              q: 'Lady Margot Fenring 的「達到 2 影響力得 2 香料」可以重複嗎？',
              a: '可以，但只算「往上達到 2」：掉到 1 再升回 2 可再拿；從 3 掉到 2、或到 4、6 都不算。',
              src: `${BGG}：Lady Margot Fenring – Leader card question 串（3 月）`,
            },
            {
              q: 'Esmar Tuek 的「拿 1 額外香料」是什麼意思？',
              a: '設計師回覆：從任一會累積香料的空間偷走一個實體香料標記（額外香料是專有名詞，不是「多拿一點」）。',
              src: `${BGG}：Meaning of Esmar Tuek’s Signet Ring ability 串（3 月）；設計師回覆`,
            },
            {
              q: '同樣的領袖可以重複出現嗎？',
              a: '可以，規則書第 2 頁只是建議同家族領袖不要同時出現，屬主題考量，不是限制。',
              src: `${BGG}：Leader in game 串（2025 年 10 月）`,
            },
            {
              q: '6 人局穆阿迪布個人板上的影響力獎勵，會給盟友嗎？',
              a: '不會。放在個人板只增加自己的影響力；要幫盟友加影響力，要把探員派到共用版圖並啟動盟友。',
              src: `${BGG}：Could Muad’dip’s private board increase the influence of collaborators? 串（3 月）`,
            },
          ],
        },
      ],
    },
    {
      title: '薩督卡指揮官（血脈）',
      topics: [
        {
          name: '技能與撤退',
          items: [
            {
              q: '揭示回合把薩督卡指揮官撤退，還拿得到技能的獎勵嗎？',
              a: '設計師回覆：看技能文字有沒有「揭示回合」。有的（如 Desperate、Driven）撤退後仍保留已得到的；沒有的（Canny、Loyal、Fierce、皇帝 3 影響力給的劍等）要有指揮官留在衝突區才算戰力。早期有玩家給過相反答案，後來都被更正。',
              src: `${BGG}：retreat Sardaukar Commander on reveal turn 串（2025 年 11 月）；Sardaukar abilities clarifications 串（6 月）；設計師回覆`,
            },
            {
              q: 'Desperate 技能換成劍之後，指揮官撤退會失去這些劍嗎？',
              a: '設計師回覆：不會，Desperate 是揭示回合技能，不需要指揮官留在衝突區。',
              src: `${BGG}：retreat Sardaukar Commander 串（2025 年 11 月）；設計師回覆`,
            },
            {
              q: 'Fierce 技能：揭示後才有沙蟲加入衝突，戰力要追加嗎？',
              a: '有玩家主張要追加：戰力是持續計算，而規則書說結算戰鬥時重算。也有早期回覆說只看揭示當下。沒有官方明說，建議對照規則書第 12 頁，並以追蹤當前戰力的方式玩。未定。',
              src: `${BGG}：Sardaukar abilities clarifications 串（6 月）`,
            },
            {
              q: '同一個技能，衝突區有多個指揮官會加倍嗎？',
              a: '不會，每個技能每回合只作用一次。',
              src: `${BGG}：Sardaukar abilities clarifications 串（6 月）`,
            },
            {
              q: 'Hardy 技能放出的單位進衝突區還是駐軍區？',
              a: '放進駐軍區。',
              src: `${BGG}：Does the Hardy sardaukar commander skill… 串（9 月）`,
            },
          ],
        },
        {
          name: '招募與取得',
          items: [
            {
              q: '付 2 索拉里從供應區招募指揮官，要先去有部隊的空間嗎？',
              a: '不用，每回合（探員或揭示回合）可付 2 索拉里把供應區 1 個指揮官招募到駐軍區，與去哪個空間無關。若本回合派到戰鬥空間，部署時可算進「本回合招募的」，不佔駐軍區 2 個名額。',
              src: `${BGG}：Clarification on recruiting Sardaukar Commanders 串（6 月）`,
            },
            {
              q: '一個回合內可以招募多少指揮官？',
              a: '從供應區招募每回合最多 1 個；但從空間「取得並招募」、牌的效果送的不受這限制，可以疊加。規則書第 4 頁有範例：Brennen 付 2 索拉里招募空間上的指揮官並拿技能，再付 2 索拉里招供應區的 1 個，但不能一次付 4 索拉里招供應區的 2 個；從供應區招的不拿技能。',
              src: `${BGG}：Free Sardaukar with Honor Guard 串（3 月）；Sardaukar Standard 串（6 月）`,
            },
            {
              q: 'Sardaukar Standard 被銷毀時「取得並招募」要付 2 索拉里嗎？',
              a: '不用，牌上的效果取代了 2 索拉里的付費，但取得的技能要照常選。',
              src: `${BGG}：Question on Sardaukar Standard 串（6 月）；Outside Sardaukar Commander 串（2025 年 9 月）`,
            },
            {
              q: '同時有 Sardaukar High Command 科技與 Honor Guard 陰謀牌，指揮官可以免費招募嗎？',
              a: '兩個折扣各少 1 索拉里，疊加後從供應區招募 0 索拉里；玩家討論認為成立（規則書也說科技費用可以減到 0）。仍受每回合從供應區只能招 1 個的限制。',
              src: `${BGG}：Free Sardaukar with Honor Guard + Sardaukar High Command 串（3 月）`,
            },
            {
              q: '有 Conflict 圖示的位置，什麼時候才能部署指揮官？',
              a: '派到戰鬥空間時，可部署本回合招募的所有單位，加上最多 2 個駐軍區單位。在非戰鬥空間招募的指揮官只能佔駐軍區的 2 個名額。',
              src: `${BGG}：Clarification on recruiting Sardaukar Commanders 串（6 月）`,
            },
          ],
        },
        {
          name: '單位種類',
          items: [
            {
              q: '沙蟲算不算「部隊」？（例如 Chani 的損失部隊）',
              a: '不算。單位是總稱：部隊、沙蟲、血脈的薩督卡指揮官（當部隊用）、天人合一的無畏艦等；Chani 說的部隊只含部隊與指揮官，不含沙蟲。',
              src: `${BGG}：Sandworms and Chani 串（2025 年 9 月）`,
            },
          ],
        },
      ],
    },
    {
      title: '科技（血脈科技模組）',
      topics: [
        {
          name: '折扣與取得',
          items: [
            {
              q: '有最高議會席位時，Navigation Chamber 科技會不會再多少 1 香料？',
              a: '不會：Navigation Chamber 影響的是「版圖空間」的印刷費用，不是科技費用；最高議會折扣是科技費用。兩者獨立。',
              src: `${BGG}：Navigation chamber, high council and tech tiles 串（3 月）`,
            },
            {
              q: '血脈科技搭配天人合一，科技怎麼取？最高議會折扣還在嗎？',
              a: '依血脈規則書第 7 頁：用整個天人合一就不放 Ixian Embassy，科技疊放在 Ix 版圖，最高議會折扣不適用（可用科技談判折扣）；只用天人合一的科技板塊時，排除 Detonation Devices 與 Troop Transports，剩 16 個與血脈的混洗。',
              src: `${BGG}：Technology discounting and obtaining – Bloodlines + Iks 串（3 月）；規則書第 7 頁`,
            },
            {
              q: 'Ornithopter Fleet 科技會把萬用戰鬥圖示也當撲翼機嗎？',
              a: '會；萬用圖示本身是戰鬥圖示，贏得萬用圖示時如果已有一個撲翼機圖示，會立即配對拿 1 VP。',
              src: `${BGG}：Wild battle icon AND ornithopter fleet techs 串（2 月）`,
            },
          ],
        },
        {
          name: '與 6 人局相關',
          items: [
            {
              q: '司令官持有 Planetary Array 贏衝突時抽牌嗎？',
              a: '不會。6 人規則說明：司令官永遠不會贏得衝突，所有「贏得衝突時」的效果對他們無效，隊友贏也不算。',
              src: `${BGG}：Planetary array for commanders 串（2025 年 9 月，引用 6 人規則第 6 頁）`,
            },
          ],
        },
        {
          name: '空間費用與折扣',
          items: [
            {
              q: 'Navigation Chamber 可以讓 Spice Refinery 用 0 香料換 4 索拉里嗎？',
              a: '可以。空間左上角的問號是「費用」，Navigation Chamber 讓每個空間費用少 1，所以選 1 香料那一項、折成 0，仍算付過，拿 4 索拉里；同理 Espionage 可 0 香料、Gather Support 可少付 1 索拉里。有玩家說已寄信給 Dire Wolf 並得到「可以」的回覆（轉述，非官方公開文件）。最低折到 0，不能因折扣反得資源。',
              src: `${BGG}：Does Navigation Chamber affect Spice Refinery? 串（3 月）`,
            },
            {
              q: '用領袖印章戒指拿到的香料，可以拿來付同一回合進空間的費用嗎？',
              a: '不行。進空間的費用要在處理任何牌或空間效果之前先付；例如 Kota 回合 1 要去 Spice Refinery 換 4 索拉里，必須事先就有 1 香料。',
              src: `${BGG}：Kota + Signet turn 1 串（2 月）`,
            },
          ],
        },
      ],
    },
    {
      title: '6 人局（兩隊各 3 人）',
      topics: [
        {
          name: '單位與空間',
          items: [
            {
              q: '6 人局，穆阿迪布隊可以招募薩督卡指揮官嗎？皇帝隊可以召喚沙蟲嗎？',
              a: '穆阿迪布隊不能取得或招募薩督卡指揮官（規則在血脈規則書後面的 6 人部分）；皇帝隊沒有造物鉤標記，只能靠 Unexpected Allies 召喚沙蟲，造物鉤限制印在司令官個人板上，不在規則書內。',
              src: `${BGG}：6 player: can fremen players recruit sardaukar… 串（9 月～10 月）`,
            },
            {
              q: '6 人局的領袖探員標記可以去被別人佔住的空間嗎？',
              a: '不行，跟一般探員一樣，要靠間諜滲透；探員標記上多了箭頭是用來決定啟動哪位隊友，不是特殊能力。',
              src: `${BGG}：6v6 token agent 串（8 月）`,
            },
            {
              q: '6 人局隊伍平衡有問題嗎？有沒有玩家的房規？',
              a: '有玩家提議讓皇帝隊也能召喚沙蟲、拿掉 Shaddam 的帝國列保留能力；多位有經驗的玩家回覆說各自有強力非對稱能力，實際勝率差不多（皇帝隊的薩督卡與大量劍可以補償沒有沙蟲），血脈加入後更平衡。屬意見討論，沒有官方平衡資料。',
              src: `${BGG}：Balance Issues in 6-Player Team Mode 串（11 月）`,
            },
          ],
        },
      ],
    },
    {
      title: '其他',
      topics: [
        {
          name: '伴侶 App 的 Blitz 模式',
          items: [
            {
              q: 'Blitz 的 Shadow Backer 加分如果讓別人追平原本的贏家，算新贏家嗎？',
              a: '沒有共識：規則寫「超越」才成為新贏家，有人認為平手不算、有人認為要照一般規則比平手規則。這是 Dire Wolf 伴侶 App 的模式，不在實體規則書裡；建議遊戲前先和同桌說好。',
              src: `${BGG}：Blitz rules! How is the game settle with shadow backers causing ties? 串（10 月）`,
            },
          ],
        },
        {
          name: '市場列與元件',
          items: [
            {
              q: '帝國市場列卡住（沒人想買）怎麼辦？',
              a: '規則沒變，只有買走補牌才會換；多數人認為 Uprising 的牌整體較好，所以較少卡住。玩家常採用 Immortality 擴充裡的 Family Atomics（每人每場一次把整列重發），數位版也內建；沒有該擴充時可用硬幣當標記。',
              src: `${BGG}：Imperium row (cards to buy) is never cleared? 串（2025 年 11 月）`,
            },
            {
              q: '原版《沙丘：帝國》的元件可以用在 Uprising 嗎？',
              a: '部分可以：8 位原版領袖可以用，但平衡未知；香料必須流動與 Prepare the Way（取代 Arrakis Liaison）在 Uprising 已有新版；原版的單人（Hagal）牌不能用，Uprising 附有自己的。',
              src: `${BGG}：Components 串（2025 年 10 月）`,
            },
            {
              q: '盒內牌堆 A、B 的標記有什麼意思？',
              a: '只是印刷廠的分堆記號，與遊戲無關；全部拿出，去掉起始牌堆與單人牌後一起洗。',
              src: `${BGG}：When Do I have to use Deck A or Deck B 串（2025 年 11 月）`,
            },
          ],
        },
      ],
    },
  ],
}
