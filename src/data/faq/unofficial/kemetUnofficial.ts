// 聖域（Kemet: Blood and Sand）BGG 討論・非官方 FAQ（玩家整理＋BGG 討論串）
// 來源 A：BGG 規則討論區的「Kemet: Blood and Sand FAQ Compilation Thread」（玩家 Glyde／the_abiogenist 整理，作者說仍在補充），以及串內玩家往來。
// 來源 B（本次新增）：BGG「Kemet: Rise of the Gods」規則討論區的多個討論串。其中帶有 BGG「Designer」標記的回覆（Guillaume Montiage、BARIOT Jacques）在 src 標「設計師回覆」，其餘是玩家討論，不是官方。
// 設計師回覆也只是論壇回覆，不是正式勘誤；與規則書、玩家輔助衝突時，以官方文件為準，衝突處標【待核對】。
// 已用自己的話摘要；網址取自頁面上實際出現的連結，沒有網址的討論串只寫標題。
// 本次修正舊條目：Hypnotic Cobra 對 Seth（依設計師回覆改寫）、Loot（設計師已確認要贏）、Heka-Ib（同一個移動行動內不行）、Urban Combat（設計師確認所有城市）、Vulture（補爭議）。
// 2026-11 更新：對照 Kemet 玩家輔助 v50（KBS-Aid_EN_rev50_2024-06-02，英文，12 頁）。v50 已把 Sobek's Wrath 印成 +4；Loot、Urban Combat、Ouadjet、Horus 的 v50 文字與先前討論不同，已在各條註明並標【待核對】；更新板塊 21 張分組與 v50 一致；Organized Movement、Divine Extra、Restful Night 在 v50 也沒有。2026-11-26 第二次更新：依使用者貼來的 BGG 討論串內容，補入第一優先 9 組（取得規則、Perfect Architecture、Loot、Wrryt Storm／Shetyw Barrier、設計師 Bariot 澄清、新舊規則書、Bastet、Ouadjet 與眾神）；網頁截圖有被截斷的引文，已標明【待核對】，沒有補抓整串。BGG 的「Designer」標記只有 Jacques Bariot、Guillaume Montiage 是聖域設計師，其他帶該標記的帳號（例如另一款遊戲的設計師）不當設計師回覆。
// 登記：只在 unofficialRegistry.ts 登記一次，key 是 'Kemet: Blood and Sand'（已登記，不用再動）。
// 沒收：整理串中標示「To be added」的空白分類。

import type { GameFaqData } from '../types'

export const KEMET_UNOFFICIAL_FAQ: GameFaqData = {
  sub: '玩家整理與設計師論壇回覆（BGG 討論串）',
  note: '整理自 BGG 規則討論區的玩家 FAQ 整理串，以及 Rise of the Gods 規則討論區的多個討論串（含設計師在論壇的回覆）。都不是正式勘誤。板塊與生物名稱用英文原名，中文用詞為自譯，待核對。與規則書或玩家輔助不同時，以官方為準。2026-11 已對照 Kemet 玩家輔助 v50（2024-06-02）更新。',
  sources: [
    { label: 'Kemet: Blood and Sand FAQ Compilation Thread（BGG，玩家整理）' },
    { label: 'BGG 討論串 3543807（Urban Combat）', url: 'https://boardgamegeek.com/thread/3543807' },
    { label: 'BGG 討論串 3531121（Energy Gain 與紫色板塊）', url: 'https://boardgamegeek.com/thread/3531121' },
    { label: 'BGG 討論串 3524226（Hypnotic Cobra 與 Seth）', url: 'https://boardgamegeek.com/thread/3524226' },
    { label: 'BGG 討論串 3628111（Late Fame）', url: 'https://boardgamegeek.com/thread/3628111' },
    { label: 'BGG 討論串 3523950（Ptahmose Servant）', url: 'https://boardgamegeek.com/thread/3523950' },
    { label: 'BGG 討論串 3535606（Loot）', url: 'https://boardgamegeek.com/thread/3535606' },
    { label: 'BGG 討論串 3535096（行動中加夥伴）', url: 'https://boardgamegeek.com/thread/3535096' },
    { label: 'BGG 討論串 3526001 與 3517195（Impenetrable Shield）', url: 'https://boardgamegeek.com/thread/3526001' },
    { label: 'BGG 討論串 3525416（Heka-Ib）', url: 'https://boardgamegeek.com/thread/3525416' },
    { label: 'BGG 討論串 3521466（眾神問題）', url: 'https://boardgamegeek.com/thread/3521466' },
    { label: 'BGG 討論串 3520143（新板塊釐清）', url: 'https://boardgamegeek.com/thread/3520143' },
    { label: 'BGG 討論串 3749093（Vulture 雙方 5／−2）', url: 'https://boardgamegeek.com/thread/3749093' },
    { label: 'BGG 討論串 3559080（團隊模式神殿 PP）', url: 'https://boardgamegeek.com/thread/3559080' },
    { label: 'BGG 討論串 3721164（團隊模式勝利條件）', url: 'https://boardgamegeek.com/thread/3721164' },
    { label: 'BGG 討論串 3616097（部隊上限）', url: 'https://boardgamegeek.com/thread/3616097' },
    { label: 'BGG 討論串 3490734（What does Wadjet do?）', url: 'https://boardgamegeek.com/thread/3490734' },
    { label: 'BGG 討論串 3673278（Is the description of Loot wrong ?）', url: 'https://boardgamegeek.com/thread/3673278' },
    { label: 'BGG 討論串 3549692（Loot 與 Macabre Aspiration）', url: 'https://boardgamegeek.com/thread/3549692' },
    { label: 'BGG 討論串 3706368（Warrior Pilgrimage、Outpost、Loot）', url: 'https://boardgamegeek.com/thread/3706368' },
    { label: 'BGG 討論串 3333106（新舊版本差異）', url: 'https://boardgamegeek.com/thread/3333106' },
    { label: 'BGG 討論串 3346526（新舊規則書）', url: 'https://boardgamegeek.com/thread/3346526' },
    { label: 'BGG 討論串 3794288（Bastet）', url: 'https://boardgamegeek.com/thread/3794288' },
    { label: 'BGG 討論串 3681380（Ptahmose Servant 第一個效果）', url: 'https://boardgamegeek.com/thread/3681380' },
    { label: 'BGG 討論串 2439404（Perfect Architecture: rules question，2020，含設計師回覆）', url: 'https://boardgamegeek.com/thread/2439404' },
    { label: 'BGG 社群勘誤頁 kemet_bs_errata（玩家維護，非官方）', url: 'https://boardgamegeek.com/wiki/page/kemet_bs_errata' },
  ],
  groups: [
    {
      title: '勝利、FP 與夜晚',
      topics: [
        {
          name: '勝利條件',
          items: [
            {
              q: '一定要「在自己回合開頭領先所有人」才贏嗎？很多局拖了好幾輪。',
              a: '不是。條件是：在你回合開頭，你至少有 9 FP，而且沒有任何人比你多。和別人同分也算贏；只有別人分數更高才不行。玩家經驗是通常達標後再多一個回合就分出勝負。',
              src: 'BGG Rise of the Gods 規則區〈Endgame (home) rules for eternal games?〉（玩家討論）；規則書 3.2 勝利條件',
            },
          ],
        },
        {
          name: '戰鬥 FP 與神明 FP',
          items: [
            {
              q: '為什麼有的板塊給戰鬥 FP、有的給神明 FP？',
              a: '玩家回覆說，初版聖域用戰鬥 FP 當平手判定；這個區分留給之後的擴充，或想用舊規則的人。現在兩種都算 FP。',
              src: 'BGG 討論串 3708561（玩家討論）',
            },
          ],
        },
        {
          name: '老兵標記',
          items: [
            {
              q: '一晚可以用 10 個老兵標記換 2 戰鬥 FP（Late Fame）嗎？可以囤老兵標記嗎？',
              a: '不行。Late Fame 每個夜晚只能用 5 個老兵標記換 1 戰鬥 FP。而且夜晚覺醒步驟會棄掉所有剩下的老兵標記，所以無法囤到下一輪。',
              src: 'BGG 討論串 3708559（玩家討論；其中一位玩家轉述設計師說法，未驗證）',
            },
          ],
        },
        {
          name: '神殿朝拜',
          items: [
            {
              q: '我同時控制給 2 PP 和 3 PP 的兩座神殿，朝拜步驟拿 5 PP 還是 3 PP？',
              a: '5 PP。規則書說的「單一效果」是指在與別的板塊互動時只觸發一次，不是只能拿一座神殿。',
              src: 'BGG 討論串 3702165（玩家討論）',
            },
          ],
        },
        {
          name: '控制神殿拿 FP',
          items: [
            {
              q: '控制至少 2 座神殿拿 1 FP，控制 4 座神殿可以拿 2 FP 嗎？',
              a: '不行，是控制至少 2 座神殿拿 1 個神明 FP，不會依座數倍增。許多玩家原本以為每 2 座 1 FP，翻規則書第 11 頁 3.6.3 才發現。',
              src: 'BGG Rise of the Gods 規則區〈Team mode〉（玩家討論；設計師同樣說 4 座神殿也只得 1 FP）',
            },
          ],
        },
      ],
    },
    {
      title: '取得板塊（Acquire）與新舊規則書',
      topics: [
        {
          name: '同一顏色一天能取得幾張',
          items: [
            {
              q: '一個白天階段可以取得兩張同顏色的神力板塊嗎？',
              a: '不行，一個白天階段同一顏色只能取得一張。2024 年 8 月，設計師 Guillaume Montiage 說他們在更新規則書：取得前要滿足的條件包括「不能已擁有圖案或圖示相同的板塊（不論顏色）」、「這個白天階段還沒取得過該顏色的板塊」、「付得起等於板塊等級的 PP（有效果可調整這個費用）」等；他並說玩家引用的新版措辭是對的、先前版本有誤植會更正。另有玩家推論「一天只能拿一張同色板塊」，設計師回覆「Yes, that…」，句子被截斷，看起來是同意【待核對】。Rise of the Gods 新舊版本差異串也有玩家說，這一點已獲官方答覆仍是一天一張。唯一的例外是 Ouadjet，見「神祇」分類。',
              src: 'BGG B&S 規則區〈Acquire multiple tiles of the same colour in a turn〉（設計師回覆，2024-08，引文被截斷）；BGG 討論串 3333106（玩家轉述）',
            },
            {
              q: '我同時控制自己的黑色金字塔和搶來的另一座黑色金字塔，一天可以買兩張黑色板塊嗎？',
              a: '不行，還是一天一張。2021 年有玩家這樣回答（句子被截斷），2024 年設計師的取得條件也是以「顏色」限制，不是以金字塔數量。',
              src: 'BGG〈Buy more than one power tile on a round〉（玩家回答，2021，引文被截斷）',
            },
            {
              q: '取得條件裡那句「else in another color or without any Acquire token」是什麼意思？',
              a: '玩家說明：這是處理你搶到別人的金字塔、而那個顏色你自己沒有的情況；要取得那個顏色的板塊，你需要有地方放取得標記。後半句的細節在截圖被截斷【待核對】。',
              src: 'BGG〈Acquire multiple tiles of the same colour in a turn〉（玩家討論；設計師只確認措辭修正）',
            },
          ],
        },
        {
          name: '取得費用與 Priestess',
          items: [
            {
              q: '我有 Priestess（費用 −1），只有 3 PP，可以買 4 級板塊嗎？',
              a: '玩家多數說可以：規則優先順序是神力板塊高於基本規則，所以 Priestess 降低的是取得費用。但取得條件字面寫「付得起等於等級的 PP（有效果可調整）」，有玩家（zephseven）認為字面上兩者講的不是同一件事；另一位玩家說設計意圖是可以。沒有設計師回覆【待核對】。',
              src: 'BGG〈3.4.3 Acquire, requirement to be able to spend as many PP…〉（玩家討論，2022）',
            },
          ],
        },
        {
          name: '新舊規則書差異',
          items: [
            {
              q: 'Rise of the Gods 的新規則書和舊版有哪些被問到的差異？',
              a: '2024 年 7 月玩家 DrZaat 逐項整理疑問；已有答覆的一項是「同一天同一顏色仍只能取得一張板塊」，其餘當時還在等。另一串指出敗者後續步驟的措辭不同：舊版寫「勝者在該區已沒有部隊時，敗者不能撤退」，新版改寫成「敗者選擇撤退或召回」（後半句被截斷），見「戰鬥結算」的「戰敗後」。WIP 版與正式版的戰鬥卡、神諭卡、板塊有沒有差異，提問沒有人回答【待核對】。',
              src: 'BGG 討論串 3333106、3346526、〈Question about differences between wip and final versions?〉（玩家討論，無設計師回覆）',
            },
          ],
        },
      ],
    },
    {
      title: '夥伴（生物與僕從）',
      topics: [
        {
          name: '在自己城區整理夥伴',
          items: [
            {
              q: '打出行動標記之前，我可以把夥伴自由移動、拿回供應區、再放回城區嗎？',
              a: '可以。設計師說，這條規則的用意是讓你自由管理城區裡的夥伴：打行動標記前可以把夥伴從城區移回供應區、在城區部隊之間互換、或從供應區放進城區部隊。但每支部隊最多 1 個生物、1 個僕從。',
              src: 'BGG〈Compagnons placement et retrait〉等（設計師回覆）；〈Exchanging Companions in my districts〉（玩家討論）',
            },
            {
              q: '舊的討論說不能單獨把夥伴拿回供應區，現在怎麼算？',
              a: '論壇早期有玩家主張只能「同類型互換」、不能單獨拿走；設計師 2025 年 9 月回覆後，以設計師的「自由管理」為準。',
              src: 'BGG〈Exchanging Companions in my districts〉（玩家討論＋設計師回覆）',
            },
          ],
        },
        {
          name: '行動中途加夥伴',
          items: [
            {
              q: '我移動到有金字塔的區域後，可以在同一個移動行動中途幫部隊加生物和僕從再繼續傳送嗎？',
              a: '不行。夥伴只能在「打出行動標記之前」整理，行動進行到一半不能增加。',
              src: 'BGG 討論串 3535096（設計師回覆）',
            },
          ],
        },
        {
          name: '移動時留下夥伴',
          items: [
            {
              q: '移動時可以把夥伴單獨留在原地，讓它被移除嗎？',
              a: '玩家共識是不行：夥伴必須一直綁定在至少有 1 個單位的部隊上，也不能因為騰空間而移除。規則書新版寫「不能為了容納移動而把單位或夥伴從版圖上移除」。討論中有人引用設計師與開發者的舊回覆支持此說。',
              src: 'BGG〈Leaving companions behind?〉（玩家討論；設計師回覆為轉述，未驗證）',
            },
          ],
        },
        {
          name: '取得與放置',
          items: [
            {
              q: '取得生物時，一定要放在同顏色的區域嗎？',
              a: '不用，可放在你任何城區（金字塔顏色只決定能不能買）。',
              src: 'BGG〈Acquiring〉（玩家討論）',
            },
            {
              q: '兩個一模一樣的僕從公仔（Amber 板塊）怎麼分辨各自的能力？',
              a: '設置時讓公仔造型對應板塊上的圖案即可，兩個公仔外形不同。',
              src: 'BGG〈Amber tile servants〉（玩家討論）',
            },
            {
              q: '傭兵（Sword Clan／Spear Clan Mercenaries）算單位嗎？可以讓部隊超過 5 個單位再加 3 個傭兵嗎？',
              a: '傭兵跟你其他單位一樣，視為你的顏色，所以受部隊上限限制，不能額外疊加。用法之一是把 12 個單位補到 15 個。',
              src: 'BGG〈Amber tile servants〉（玩家討論）',
            },
          ],
        },
        {
          name: '部隊上限',
          items: [
            {
              q: '用金色行動招募或神諭卡加單位，可以先超過部隊上限再移動嗎？',
              a: '不行。招募與加單位都要遵守部隊上限；只有「移動」過程可以暫時超過，但行動結束時（遇敵或移動用完）要符合上限。',
              src: 'BGG 討論串 3616097（玩家討論）',
            },
          ],
        },
      ],
    },
    {
      title: '神祇（埃及眾神模組）',
      topics: [
        {
          name: '神祇算不算部隊',
          items: [
            {
              q: '神祇算部隊嗎？部隊用的板塊（如 Charge）對神祇有效嗎？',
              a: '算。神祇視為部隊，影響部隊的板塊對神祇有效（綁定部隊的夥伴板塊除外）。',
              src: 'BGG 討論串 3519749、3537754、3526000（設計師回覆）',
            },
            {
              q: '神祇的 LP（生命點數）會影響戰鬥力量嗎？',
              a: '不會。LP 只決定神祇能承受多少損失。',
              src: 'BGG 討論串 3526000（設計師回覆）',
            },
          ],
        },
        {
          name: '招募與取得',
          items: [
            {
              q: '神祇被殺後，重新招募要再付 4 PP 嗎？',
              a: '不用。4 PP 只在第一次取得（買神祇板塊）時付一次，之後要放回版圖只需執行招募行動，免費。',
              src: 'BGG 討論串 3522200（設計師回覆）；〈God recruitment〉（玩家討論）',
            },
            {
              q: '同一個招募行動可以同時放神祇和招募一般單位嗎？',
              a: '可以。「放神祇」是加在招募行動上的選項。',
              src: 'BGG 討論串 3522200（設計師回覆）',
            },
            {
              q: '可以用神力板塊或神諭卡給的招募來放神祇嗎？',
              a: '只要是真正的「招募行動」（含板塊給你一次招募行動）、而且你滿足板塊的條件就可以；單純加單位的神諭卡不是招募行動。但如果板塊要求「移動時必須綁僕從」，神祇進場後也不能移動。',
              src: 'BGG〈God recruitment〉（設計師與玩家回覆）',
            },
            {
              q: '「This District cannot Units from you or your Teammates」是什麼意思？',
              a: '缺了一個字，意思是該城區不能「有」你或隊友的單位。神祇進場要放在沒有你或隊友單位的城區。',
              src: 'BGG 討論串 3666309（玩家討論）',
            },
            {
              q: '神祇可以和單位、夥伴同區嗎？',
              a: '不行，神祇永遠獨自在一個區域，不能與任何單位或夥伴共處（規則書第 18 頁）。',
              src: 'BGG 討論串 3578342（玩家討論）',
            },
          ],
        },
        {
          name: '生命點數',
          items: [
            {
              q: '神祇可以用招募效果補血嗎？',
              a: '一般不行，規則沒寫招募能治療；死了再招募才是滿血。荷魯斯有自己的回復效果。2026 年 5 月玩家（dcpepp）同意：神祇被殺後，下一回合可以免費以滿血重新放回，但原本佔著的神殿不會保留。',
              src: 'BGG 討論串 3694026（玩家討論）',
            },
            {
              q: 'Anubis 損失 LP 算失去單位嗎（Anubis 的加兵效果）？',
              a: '算。神祇每失去 1 LP 都視為失去 1 個單位。',
              src: 'BGG〈Questions about gods mode〉（玩家討論）',
            },
            {
              q: '荷魯斯的 LP 會到 0 嗎？戰鬥結束後還會回到 3 嗎？',
              a: 'v50 玩家輔助寫荷魯斯在「戰鬥結束步驟」把 LP 標記移到 LP 格 3，也就是每場戰鬥結束時（若還在場）回到 3 LP。LP 軌第一格是 0；LP 歸 0 就被殺、放回供應區，之後要重新招募，不會回復。先前玩家說「最大 LP 是 3、不存在再降到 3」，要和 v50 這段文字一起看，LP 歸 0 的當場戰鬥結束時會不會又被拉回 3 沒有人回答【待核對】。',
              src: 'BGG〈Questions about gods mode〉（設計師與玩家回覆）',
            },
            {
              q: '在神域聖所可以用 2 點神祇 LP 換 FP 嗎？',
              a: '可以，規則書有明寫。',
              src: 'BGG〈Questions about gods mode〉（玩家回覆）',
            },
          ],
        },
        {
          name: '各神祇',
          items: [
            {
              q: '荷魯斯傳送要從哪裡出發、不能去哪裡？',
              a: '可以從任何區域出發，只是不能傳送到對手的城區（也就是對手的城市）。荷魯斯不被限制在你自己的城區。',
              src: 'BGG〈Horus Teleport〉（設計師回覆）',
            },
            {
              q: '荷魯斯很強嗎？',
              a: '玩家看法不一：有人兩局都是他贏，也有人覺得他最弱，因為只有 3 LP、容易被打死。目前沒有官方說法。',
              src: 'BGG〈Horus Teleport〉（玩家討論）',
            },
            {
              q: 'Sobek 的特殊戰鬥卡 Sobek’s Wrath 是「力量 +4」還是「把力量設為 4」？',
              a: 'v50 玩家輔助已印成「+4 力量」，並寫戰鬥結束時收回你所有的戰鬥卡；先前玩家依草稿判斷的 +4 與它一致（卡面少了加號是印刷筆誤）。取得 Sobek 時，這張卡進你的手牌（設計師），而且只在眾神模組中使用。',
              src: 'BGG 討論串 3731077、3522210（玩家討論＋設計師回覆）',
            },
            {
              q: 'Ouadjet 可以讓我同一回合買兩張同顏色的神力板塊嗎？',
              a: '可以。設計師表示你可以買第二張同色板塊；她的移動與戰鬥效果只套用在她自己身上。有玩家質疑這違反取得規則，設計師回覆時間較晚，以設計師為準。注意：v50 玩家輔助的 Ouadjet 文字是「每個白天階段一次，可把 1 個綠色行動標記放在你玩家板上已有綠色行動標記的已佔用行動格，並立刻結算該行動」，沒有提到買第二張同色板塊；這條是依較早的討論，兩邊可能是不同版本或不同讀法【待核對】。2026 年 5 月〈God powers clarification〉的新討論：有玩家（dcpepp）認為重做同一個行動，包括再做一次同色取得，是可行的，因為買板塊本來就受行動標記限制；另一位玩家（sNOOByTH）主張「重做行動」和「重做購買」不是同一回事；兩邊都沒有設計師回覆。〈What does Wadjet do?〉（玩家討論，2025）也有人說她適合搭配取得行動，用在只有兩座金字塔時能省 PP、一天拿兩張同色板塊。',
              src: 'BGG 討論串 3521466、3703036、3490734、〈God powers clarification〉（設計師回覆＋玩家爭論）',
            },
            {
              q: 'Ouadjet 被殺、在供應區時，她的效果還有效嗎？',
              a: '還沒有明確答案。玩家傾向沒有（神祇不在版圖上就是不在場），尚無設計師回覆【待核對】。',
              src: 'BGG 討論串 3521466（玩家提問，無定論）',
            },
            {
              q: 'Bastet 讓我控制的神殿多給 1 FP，再加我的其他神殿，會得 2 FP 嗎？',
              a: '不會。神殿控制步驟最多只能得 1 個神明 FP，即使 Bastet 與其他神殿都控制。2026 年 11 月的新串（3794288）玩家補充：只要 Bastet 所在的神殿你有控制，每個夜晚都會得這 1 FP，但不會和「控制至少 2 座神殿得 1 FP」疊加。',
              src: 'BGG 討論串 3531010（設計師回覆）；BGG 討論串 3794288（玩家回答）',
            },
          ],
        },
        {
          name: '板塊與神祇互動',
          items: [
            {
              q: 'Hypnotic Cobra 對上 Seth，Seth 抽到戰鬥神諭卡怎麼辦？',
              a: '設計師說明三種情況：Seth 抽到 2 張都是戰鬥神諭卡，兩張都棄掉；抽到 1 張戰鬥加 1 張非戰鬥，兩張都棄掉；抽到 2 張都不是戰鬥，才能留 1 張棄 1 張。Hypnotic Cobra 不阻止抽牌，阻止的是打出戰鬥神諭卡。',
              src: 'BGG 討論串 3524226（設計師回覆）；玩家輔助 第 11 頁',
            },
            {
              q: '板塊與神祇規則衝突時誰優先？',
              a: '規則書第 6 頁優先順序：神諭卡 → 神力板塊 → 擴充規則 → 模組規則 → 基本規則，所以神力板塊（如 Hypnotic Cobra）高過模組中的神祇能力。',
              src: 'BGG 討論串 3524226（玩家引用規則書 第 6 頁）',
            },
          ],
        },
      ],
    },
    {
      title: '戰鬥結算',
      topics: [
        {
          name: 'Impenetrable Shield（無法穿透護盾）',
          items: [
            {
              q: '5 個單位，傷害 1、護盾 1、無法穿透護盾 1，對手傷害 2、無法阻擋傷害 1，最後剩幾個單位？',
              a: '設計師確認這個例子是剩 3 個單位：先把 1 個單位保護起來，再結算無法阻擋傷害，再結算普通傷害減護盾，最後把保護的單位放回。',
              src: 'BGG 討論串 3526001（設計師回覆）',
            },
            {
              q: '只有 1 個無法穿透護盾，對手只有 1 傷害，我是剩 4 還是 5 個？護盾到底能擋普通傷害嗎？',
              a: '還沒定論。設計師用了「抵銷」一詞，有人讀成它同時能擋 1 點普通傷害（剩 5 個），也有人依規則書字面，只能保護 1 個單位（剩 4 個）。玩家分析認為無法穿透護盾主要用於「確保部隊不被殲滅」以便拿勝利獎勵。請以之後官方勘誤為準【待核對】。',
              src: 'BGG 討論串 3526001、3517195（玩家討論，設計師回覆語意不清）',
            },
          ],
        },
        {
          name: '同時結算與先後',
          items: [
            {
              q: '我有 Omniscience（看對手神諭卡）、對手有 Spy（看我的戰鬥卡），誰先看？',
              a: '依規則書 3.5：同時結算的效果，先攻擊方、後防守方。可能讓防守方效果被削弱，但規則如此。',
              src: 'BGG〈Omniscience vs Spy power tiles〉（玩家引用規則書）',
            },
          ],
        },
        {
          name: '戰敗後',
          items: [
            {
              q: '輸家一定要撤退或召回嗎？可以留在原區嗎？',
              a: '一定要二選一，即使勝者在該區已沒有部隊。舊版規則與舊設計師回覆說過可以留下，現行規則書（含 Blood and Sand 新版）沒有這個選項。2024 年的新舊規則書比較串（3346526）也提到：舊版規則書寫「勝者在該區已沒有部隊時，敗者不能撤退」，新版改寫成「敗者選擇撤退或召回」（後半句被截斷）。',
              src: 'BGG〈Loser’s Aftermath still unclear〉（玩家討論）',
            },
          ],
        },
        {
          name: 'Tactical Support 與 Outpost',
          items: [
            {
              q: 'Tactical Support 神諭卡會立刻觸發戰鬥嗎？能打兩張湊 4 個單位再開打嗎？',
              a: '會立刻觸發戰鬥，不能打兩張湊 4 個。',
              src: 'BGG 討論串 3531121（設計師回覆）',
            },
            {
              q: 'Outpost（紫 4 級）能招募超過 4 個單位嗎？',
              a: '可以，但只有前 4 個免費，超過的要照招募規則付 PP。',
              src: 'BGG 討論串 3531121（設計師回覆）',
            },
          ],
        },
      ],
    },
    {
      title: '紅寶石與藍寶石',
      topics: [
        {
          name: 'Divine Wound 與虛晃牌',
          items: [
            {
              q: '可以用 Divine Wound（紅 3 級）棄掉 Diversion（虛晃牌）來加力量嗎？',
              a: '不行。Diversion 只能拿來虛張聲勢，沒有任何效果。',
              src: 'BGG 整理串（玩家整理）；規則書 神諭卡「Diversion」說明',
            },
          ],
        },
        {
          name: 'Urban Combat（藍）',
          items: [
            {
              q: 'Urban Combat 3 級要在自己的城區才有效嗎？',
              a: '不用。設計師說這張板塊在所有城市的任何城區都有效，不只你自己的；你圍攻對手城區也可以。玩家輔助 v50 仍寫「你的城市」（your Cities），還沒更新；v50 另寫這張板塊有移動行動效果：你的部隊可進入 1 個對手城區，不必從相鄰區域出發【待核對】。',
              src: 'BGG 討論串 3543807（設計師回覆）',
            },
          ],
        },
        {
          name: 'Reinforcement Prayer（藍）',
          items: [
            {
              q: '可以用 Reinforcement Prayer 多付 PP 增加超過 2 個單位嗎？',
              a: '不行。這張板塊是在「祈禱」行動時觸發，只能免費在你的城區加共至多 2 個單位（v50：in your Districts，之後可能觸發戰鬥，比照招募），板塊上沒有給你招募行動，也沒有寫可以付費增加更多。',
              src: 'BGG 整理串中玩家 Jason 的回覆（玩家整理）',
            },
          ],
        },
        {
          name: 'Perfect Architecture（藍，更新板塊）',
          items: [
            {
              q: '對手控制了我的 3 級金字塔所在城區，FP 怎麼算？我控制別人的 3 級金字塔會得 FP 嗎？',
              a: '設計師 Jacques Bariot 在 2020 年回覆：只有擁有這張板塊的人有這個能力，而且只對你自己城區內的金字塔有效。對手控制你的 3 級金字塔，他得不到 FP，你也沒有（臨時 FP 放回供應區）；你控制別人的 3 級金字塔，也不會因為這張板塊得 FP。v50 玩家輔助的文字與這個說法一致。',
              src: 'BGG 討論串 2439404〈Perfect Architecture: rules question〉（設計師回覆，2020-06）；玩家輔助 v50 第 3 頁',
            },
            {
              q: '4 級金字塔可以因為這張板塊得 2 FP 嗎？',
              a: '不行。FP 是「每座金字塔」最多 1 點，不是每一層；這張板塊只是把拿到金字塔 FP 的門檻從 4 級降到 3 級。玩家回答，沒有設計師針對這點另外回覆。',
              src: 'BGG〈Perfect Architecture〉（玩家討論，2021）',
            },
          ],
        },
        {
          name: 'Wrryt Storm／Shetyw Barrier（取得特殊戰鬥卡）',
          items: [
            {
              q: '取得 Wrryt Storm 或 Shetyw Barrier 之後，那張特殊戰鬥卡怎麼用？',
              a: '板塊效果只在「取得時」發生一次：收回手上戰鬥卡，再從遊戲中移除 1 張換成特殊戰鬥卡。之後它和一般戰鬥卡一樣：打出就進棄牌堆，要等手上戰鬥卡都打完收回，或你取得另一張同樣會收回戰鬥卡的板塊時才回到手上。玩家回答，沒有設計師回覆；玩家另說兩張特殊卡的卡面圖和板塊圖不同【待核對】。',
              src: 'BGG〈Wrryt Storm & Shetyw Barrier〉（玩家討論，2022）',
            },
          ],
        },
      ],
    },
    {
      title: '鑽石（White）',
      topics: [
        {
          name: 'Deep Desert Snake',
          items: [
            {
              q: 'Deep Desert Snake 能抵銷黑色生物 Khnum’s Sphinx（2 級）「敵人進入該區多付 1 PP」的效果嗎？',
              a: '不行。Deep Desert Snake 只在戰鬥中無效化對手生物的效果；Khnum’s Sphinx 的效果發生在移動時，不是戰鬥。另有玩家轉貼並翻譯設計師 Jacques Bariot 的法文答覆（2021 年轉貼，答案開頭是「只有實際的戰鬥能力…」，後半被截斷）；那段原文把例子寫成 Griffin Sphinx，玩家指出應該是 Khnum’s Sphinx，並已改在社群勘誤頁。玩家 Rainbow Snake 也列舉 Phoenix 飛進你的城區同樣擋不掉。以上是轉貼，不是設計師直接發在 BGG【待核對】。',
              src: 'BGG 整理串（玩家整理）',
            },
            {
              q: 'Deep Desert Snake 能無效化 Rise of the Gods 的僕從或眾神嗎？',
              a: '不行，它只無效化生物的效果。',
              src: 'BGG 整理串（玩家整理）',
            },
          ],
        },
        {
          name: 'Priest of Ra',
          items: [
            {
              q: 'Priest of Ra 對生物效果的 PP 費用有效嗎（例如 Khnum’s Sphinx 的額外 PP 或 Serpopard 4 級的 PP 加力量）？',
              a: '有效。板塊上是無限符號，只要是需要付 PP 的效果都能套用。',
              src: 'BGG 整理串（玩家整理）',
            },
            {
              q: '我打 2 張各自要付 PP 的神諭卡，Priest of Ra 是共省 2 PP 還是只省 1 PP？',
              a: '共省 2 PP。Priest of Ra 不是單一效果，在你的回合中凡是付 PP 的效果都能各自減 1，包括生物效果或其他 PP 增減效果。',
              src: 'BGG 整理串（玩家整理）；玩家輔助 第 4 頁（Priest of Ra 文字）',
            },
          ],
        },
        {
          name: 'The Mummy',
          items: [
            {
              q: 'The Mummy 在供應區、不在版圖上時，夜晚階段還能多抽 1 張神諭卡嗎？',
              a: '能。只要你買了這張板塊就有這個加成。',
              src: 'BGG 整理串（玩家整理）；玩家輔助 第 4 頁',
            },
          ],
        },
      ],
    },
    {
      title: '黑瑪瑙（Black）',
      topics: [
        {
          name: 'Sword Clan／Spear Clan Mercenaries',
          items: [
            {
              q: '兩張傭兵板塊的圖示一個是女性、一個是男性，這代表我可以兩張都買嗎？',
              a: '不行。兩張基本上是同一張板塊，只是公仔分男女，方便區分不同玩家的傭兵；你只能買其中一張。',
              src: 'BGG 整理串（玩家整理）；BGG 討論串 3726345（玩家討論）',
            },
          ],
        },
        {
          name: 'Local Recruitment',
          items: [
            {
              q: '能用 Local Recruitment 把生物綁在剛招募的單位上，再把這個單位送去城區外的部隊嗎？',
              a: '不行。這張板塊只能把招募的單位直接放到城區外的部隊，不能把夥伴一起放進去。',
              src: 'BGG 整理串（玩家整理）；BGG〈Compagnons placement et retrait〉（設計師回覆，指出此板塊目的是強化已在場的部隊）',
            },
          ],
        },
        {
          name: 'Amout, the Soul Devourer',
          items: [
            {
              q: '對手打出「+5 力量／−2 無法阻擋傷害」的戰鬥卡，我的攻擊部隊有 Amout 並贏了，這 2 個被自傷移除的單位算進 Amout 的效果嗎？',
              a: '不算。要多得 1 FP，必須你贏得戰鬥，而且是用你自己的傷害移除了至少 2 個對手單位；兩個條件缺一個就沒有。',
              src: 'BGG 整理串（玩家整理）；玩家輔助 第 5 頁（Amout 文字）',
            },
          ],
        },
        {
          name: 'Divine Might（黑 4 級）',
          items: [
            {
              q: '我有 Divine Might 4 級和白色 Divine Hunger，戰鬥中移除了 1 個對手單位，Divine Might 會觸發、我總共得 4 PP 嗎？',
              a: '不會。Divine Might 不在戰鬥觸發，只在白天階段與夜晚階段的效果觸發（設計師也說戰鬥中不作用）。',
              src: 'BGG 整理串（玩家整理）；BGG 討論串 3531121（設計師回覆）；玩家輔助 第 5 頁',
            },
            {
              q: 'Divine Might 在夜晚階段怎麼觸發？',
              a: '夜晚階段 9 步中有 3 步可能給 PP（三角洲神殿控制、朝拜、祈禱），每一步有給 PP 就觸發一次；條件都滿足時最多 +6 PP。那一步沒有拿到 PP，就沒有加成。',
              src: 'BGG 整理串（玩家整理）；BGG〈Amethyst Power tile Energy Gain Questions〉（玩家討論）；規則書 第 11 頁',
            },
            {
              q: 'Divine Might 在白天階段是每個回合只觸發一次，還是每次 PP 效果都觸發？',
              a: '玩家說法是白天階段一個回合只觸發一次（因為同時有「單一效果」的字句，但玩家輔助漏印），玩家輔助字面（含 v50）卻寫「每次」。討論裡有人指出這與 Energy Gain 每張牌得 1 PP 的裁定看起來矛盾，沒有設計師回覆【待核對】。',
              src: 'BGG〈Amethyst Power tile Energy Gain Questions〉（玩家討論）',
            },
          ],
        },
      ],
    },
    {
      title: '紫水晶（Purple）',
      topics: [
        {
          name: 'Energy Gain',
          items: [
            {
              q: '我在戰鬥中打出 Diversion，有 Energy Gain 的話可以得 1 PP 嗎？',
              a: '不行。Diversion 是虛晃牌，沒有特殊效果，也不能被任何效果棄掉。',
              src: 'BGG 整理串（玩家整理）',
            },
            {
              q: '我有 Energy Gain，一個回合打 3 張神諭卡，是得 3 PP 還是整體 1 PP？',
              a: '3 PP。每打出 1 張神諭卡（Diversion 除外）就得 1 PP。',
              src: 'BGG 討論串 3531121（設計師回覆）',
            },
            {
              q: '我有 Energy Gain 和紅色 Divine Wound 3 級，用 Divine Wound 棄牌還能得到 PP 嗎？',
              a: '不能。設計師確認：Divine Wound 是棄掉神諭卡而不是「打出」，所以不會觸發 Energy Gain。',
              src: 'BGG〈Amethyst Power tile Energy Gain Questions〉（設計師回覆）',
            },
            {
              q: '有 Energy Gain 又有黑 4 級 Divine Might，打 2 張神諭卡被棄掉，是共 6 PP 還是 4 PP？',
              a: '玩家回答是 4 PP：Energy Gain 2 次共 +2，Divine Might 在這個白天階段只觸發一次（+2）。這個答案與 Divine Might「每次其他效果獲得 PP 就 +2」的字面讀法不太一樣【待核對】。',
              src: 'BGG 整理串（玩家整理）；玩家輔助 第 5、6 頁',
            },
          ],
        },
        {
          name: 'Hypnotic Cobra 對 Seth（眾神）',
          items: [
            {
              q: '我有 Hypnotic Cobra 的部隊攻擊賽特（Seth），賽特的抽神諭卡效果會被完全擋掉嗎？',
              a: '不會被完全擋掉，但如果 Seth 抽的 2 張牌中有任何一張是戰鬥神諭卡，兩張都棄掉；只有 2 張都不是戰鬥神諭卡，才能留 1 張棄 1 張。細節見「神祇」分類。',
              src: 'BGG 討論串 3524226（設計師回覆）；玩家輔助 第 11 頁',
            },
          ],
        },
        {
          name: 'Late Fame（紫 3 級）',
          items: [
            {
              q: '如果我在夜晚階段用 5 個老兵標記換，可以得 1 戰鬥 FP（板塊效果）嗎？一次可以多換嗎？',
              a: '不能多換：每個夜晚只能花 5 個老兵標記換 1 個戰鬥 FP；就算你存了 10 個，也不能一晚換 2 FP。',
              src: 'BGG 討論串 3628111、3708559（玩家討論）；玩家輔助 第 6 頁',
            },
          ],
        },
        {
          name: 'Outpost（紫 4 級）',
          items: [
            {
              q: 'Outpost 到底怎麼運作？',
              a: '用金色行動執行 1 次招募行動，從供應區免費加至多 4 個單位，可放在你的 1 個城區或 1 個空的沙漠區域，也可以一起放夥伴。因為是招募行動，想加超過 4 個要另外付 PP。',
              src: 'BGG 整理串（玩家整理）；BGG 討論串 3531121（設計師回覆：前 4 個免費）；玩家輔助 第 6 頁',
            },
          ],
        },
        {
          name: 'Pitfall（紫更新板塊）',
          items: [
            {
              q: 'Pitfall 說可以「換掉頂端的棄牌」，戰鬥卡有兩個棄牌（面朝上與面朝下）到底是哪一個？',
              a: '設計師說明：戰鬥時你手上有 2 張，一張蓋著棄掉、一張留著要打；揭示後你知道對手打了哪張，這張板塊讓你互換你自己的這兩張。',
              src: 'BGG 討論串 3533173（設計師回覆）',
            },
          ],
        },
        {
          name: 'Vulture（紫 4 級）',
          items: [
            {
              q: 'Vulture 多得 1 FP 的條件是什麼？',
              a: '本場戰鬥雙方合計至少 4 個單位被移除就得 1 神明 FP，不論是攻擊方或防守方的單位。設計師只確認「不論哪一方損失單位」，但沒有說明是否可以把雙方損失加總；多數玩家讀成加總，自傷（例如「+5 力量／−2 無法阻擋傷害」戰鬥卡）也算，不需要贏得戰鬥。',
              src: 'BGG 整理串（玩家整理）；BGG 討論串 3520143（設計師回覆）；玩家輔助 第 6 頁',
            },
            {
              q: '雙方都打出 5／−2 戰鬥卡，Vulture 會拿到 FP 嗎？',
              a: '玩家回答會（算單位被移除）。有玩家認為這樣太強、盼望官方 FAQ；目前沒有設計師正式回覆【待核對】。',
              src: 'BGG 討論串 3749093（玩家討論）',
            },
          ],
        },
      ],
    },
    {
      title: '琥珀（Amber）',
      topics: [
        {
          name: 'Pinedjem Servant',
          items: [
            {
              q: 'Pinedjem Servant 能讓綁定的部隊不用傳送就進入三角洲神殿或聖所嗎？',
              a: '可以，這正是取得這個僕從的主要用途（它讓綁定部隊把軍事港當貿易港用）。',
              src: 'BGG 整理串（玩家整理）；玩家輔助 第 7 頁',
            },
          ],
        },
        {
          name: 'Jackal',
          items: [
            {
              q: '我的 Jackal 部隊戰鬥時，對手打「+5 力量／−2 無法阻擋傷害」神諭卡，我可以得到 Jackal 的額外神諭卡嗎？',
              a: '不行。設計師說 Jackal 只在移除 2 個對手單位時觸發，而 5／−2 影響的是你自己的單位。',
              src: 'BGG 整理串（玩家整理）；BGG 討論串 3520143（設計師回覆）；玩家輔助 第 7 頁',
            },
          ],
        },
        {
          name: 'Heka-Ib Servant',
          items: [
            {
              q: '我的 Heka-Ib 僕從已在神殿，我先離開再回到同一座神殿，會再次觸發效果嗎？',
              a: '在同一個移動行動內離開再回來不行，因為「取得控制」只看行動開始時你沒有控制、行動結束時有控制。要分成兩個不同的移動行動（例如銀色或金色行動標記）才能再次觸發。',
              src: 'BGG 討論串 3525416（玩家討論，引用規則書第 9 頁）；玩家輔助 第 7 頁',
            },
            {
              q: 'Heka-Ib 帶著只有 1 個單位進三角洲神殿，能犧牲單位拿 5 PP 嗎？',
              a: '玩家看法有分歧：有人說不行（行動前後都沒控制變化），也有人說可以，因為它是在「取得控制」時反應，而取得控制發生在移動行動結束。這條沒有官方回覆【待核對】。',
              src: 'BGG 討論串 3525416（玩家討論，無定論）',
            },
          ],
        },
        {
          name: 'Ptahmose Servant',
          items: [
            {
              q: 'Ptahmose Servant 的效果只對綁定的部隊有效，還是取得後全域永久有效？',
              a: '只對綁定的部隊有效，所有效果都屬於「tied troop」。實際上只和三角洲（神殿與聖所）有關，因為那裡才需要犧牲單位。它也不會讓部隊多一個傳送選項，只是降低傳送費用。不過 2026 年 3 月的新串（3681380）仍有玩家說第一個效果的歸屬要等設計師確認（認為文字印在綁定部隊欄位、且玩家輔助有筆誤），沒有設計師新回覆【待核對】。',
              src: 'BGG 討論串 3523950（設計師回覆）；BGG 討論串 3520143（設計師回覆）；玩家輔助 第 7 頁',
            },
          ],
        },
        {
          name: 'Loot（琥珀 3 級）',
          items: [
            {
              q: 'Loot 要先贏得戰鬥嗎？',
              a: '要。設計師確認必須是勝者（板塊圖示有勝者符號，法文版文字也寫了），並說之後會更新英文玩家輔助。最新的玩家輔助草稿寫：戰鬥結束步驟，如果你贏了，可以拿對手本場打出的 1 張神諭卡，或抽 2 張神諭卡（所以對手沒打神諭卡也能抽 2 張）。但 v50 玩家輔助（2024-06-02）的 Loot 文字是「若對手本場至少打出 1 張神諭卡，把其中 1 張加入手牌，或抽 2 張神諭卡」，沒有寫「贏」這個條件，和設計師回覆不一致；先依設計師與板塊圖示的勝者符號，等官方更新玩家輔助【待核對】。2025～2026 年的新討論串（3535606、3673278、3549692）玩家一致讀成「要贏」：板塊上有勝者（月桂冠）圖示、法文版文字有寫；有玩家引用較新的 WIP 玩家輔助，寫的是「If you win the battle…」；對手沒打神諭卡時，玩家讀成仍可抽 2 張，並說它和綠寶石 Macabre Aspiration 不同（Macabre 沒有勝者圖示）。這些新串裡沒有看到設計師的新回覆。',
              src: 'BGG 討論串 3535606、3535211、3549692、3673278（設計師與玩家回覆）；玩家輔助 第 7 頁',
            },
          ],
        },
        {
          name: 'Baboon（琥珀）',
          items: [
            {
              q: 'Baboon 的「多拿 1 個老兵標記」是每次戰鬥都有嗎？贏了拿 FP 時也有嗎？',
              a: '有。設計師確認：不論戰鬥結果，Baboon 都會多拿 1 個老兵標記，加在戰鬥本來的獎勵之上。',
              src: 'BGG〈Does Baboon always gain an additional veteran token?〉（設計師回覆）',
            },
          ],
        },
        {
          name: 'Troop（用詞）',
          items: [
            {
              q: '「一部隊」的效果，我只有 1 個單位時算部隊嗎？',
              a: '算。設計師說 1 個單位就是 1 個單位的部隊。',
              src: 'BGG 討論串 3548051（設計師回覆）',
            },
          ],
        },
        {
          name: 'Warrior Pilgrimage（琥珀 4 級）',
          items: [
            {
              q: 'Warrior Pilgrimage 一定要加僕從才能招募嗎？',
              a: '玩家（the_abiogenist，2026 年 5 月）的讀法：看你的部隊本來有沒有綁僕從。有，就可以對城區外的部隊做招募行動；沒有，就照一般招募放進城區。另一位玩家（sNOOByTH，2026 年 7 月）說他向開發者確認，這張板塊「圍繞僕從」：招募要滿足 (1) 有僕從準備放進城區，或 (2) 有僕從在部隊裡（城內城外都可以），你把單位招募進那支部隊；後面的條件在截圖被截斷。這是玩家轉述，不是官方回覆【待核對】。移動行動那一半，板塊寫明部隊必須綁有僕從。',
              src: 'BGG 討論串 3706368（玩家討論，含玩家轉述開發者；引文被截斷）；玩家輔助 v50 第 7 頁',
            },
          ],
        },
      ],
    },
    {
      title: '團隊模式',
      topics: [
        {
          name: '分數與神殿',
          items: [
            {
              q: '團隊模式的分數怎麼記？',
              a: '每隊在分數軌上只有一個記號，隊伍 FP 加總。把隊伍當成單一「玩家」來算 FP 與 PP。',
              src: 'BGG〈Team mode questions〉；BGG 討論串 3559080（玩家討論，引用規則書）',
            },
            {
              q: '兩位隊友各自控制一座神殿（不是混合部隊），夜晚階段隊伍拿 FP 嗎？',
              a: '拿。設計師說隊伍獲得該神明 FP；但控制 4 座神殿也只算 1 FP。',
              src: 'BGG〈Team mode〉（設計師回覆）',
            },
            {
              q: '神殿給的 PP，混合部隊會讓每位隊友都拿一份嗎？',
              a: '不會。控制神殿的是「隊伍」，隊伍只拿該神殿的 PP 一份；PP 與老兵標記可以在隊友之間任意分配。',
              src: 'BGG 討論串 3559080、〈Team mode questions〉（玩家討論，引用規則書）',
            },
          ],
        },
        {
          name: '取得與移動',
          items: [
            {
              q: '隊友的城牆會擋住我嗎？',
              a: '不會擋。團隊移動規則寫「隊友的港口與城牆視為屬於各隊友」。',
              src: 'BGG〈Team mode questions〉（玩家討論，引用規則書）',
            },
            {
              q: '我的部隊佔著隊友的金字塔城區，可以買該顏色的神力板塊嗎？',
              a: '可以，只要你有至少 1 個單位在佔據該金字塔的部隊中（混合部隊也算）。這很強，團隊要事先商量金字塔顏色。',
              src: 'BGG〈Team mode; access to acquire tiles via teammate pyramids〉（玩家討論，引用規則書）',
            },
          ],
        },
        {
          name: '勝利',
          items: [
            {
              q: '團隊模式只能在某位隊友的回合開頭判勝利嗎？對手隊伍也有機會回應嗎？',
              a: '依規則是在隊友任一位的回合開頭、打出行動標記前判定。提問者覺得不公平，沒有人回覆有官方調整【待核對】。',
              src: 'BGG 討論串 3721164（玩家提問，無定論）',
            },
          ],
        },
      ],
    },
    {
      title: '元件與擴充內容',
      topics: [
        {
          name: '多出來的元件',
          items: [
            {
              q: '盒中多出 4 色各 5 個 Acquire 標記是什麼？',
              a: '是 Blood and Sand 舊設計的取得標記（原遊戲 5 人），Rise of the Gods 改了圖案，舊的可當備品或丟棄。多餘的金字塔零件也是備品；只要每位玩家（含第 6 位）有 3 組金字塔就夠。',
              src: 'BGG〈There are 20 extra acquire tiles ?〉（玩家討論）',
            },
          ],
        },
        {
          name: 'Game Up 與更新板塊對照',
          items: [
            {
              q: '更新（Renewal）板塊是怎麼用的？',
              a: '設置時，每個所選顏色把 3 級的 Domination 板塊與該顏色的更新板塊混洗，隨機抽 1 張放在 Domination 原本的位置。抽到 Domination 就照用；不想用更新板塊，也可以全部忽略、保留 Domination。更新板塊只能取代 Domination，不能取代其他板塊。',
              src: 'BGG 討論串 3549336（玩家討論，引用規則書設置說明）',
            },
            {
              q: '各 Game Up 各帶哪些更新板塊？（玩家整理對照表）',
              a: 'Sacred Bull：Sacred Bull（紅，附公仔）、Perfect Architecture（藍）、Strategic Hold（鑽石）、Divine Support（黑瑪瑙）、Macabre Aspiration（綠寶石）。Sand Worm：Omniscience（紅）、Sandworm（藍，附公仔）、Night Ceremony（鑽石）、Tactical Reinforcement（黑瑪瑙）、Dark Knowledge（綠寶石）。Shield of Onyx：Horde（鑽石）、Shield of Onyx（黑瑪瑙）、Shield of Amethyst（紫水晶）、Supremacy（琥珀）、Unilateral Choice（綠寶石）。Hippo：Tactical Adaptation（紅）、Pitfall（紫水晶）、Hippopotamus（琥珀，附公仔）。Baboon：Urban Combat（藍）、Baboon（紫水晶，附公仔）、Architectural Adjustment（琥珀）。依這個對照，七種顏色各有 3 張更新板塊。2026-11 已用 v50 玩家輔助逐張對過：21 張更新板塊的顏色與分組一致。',
              src: 'BGG〈Component Identification and Clarification〉（玩家 keysersaucy 整理，非官方；未逐張對照實物）',
            },
            {
              q: '各 Game Up 另外帶了哪些神諭卡與特殊戰鬥卡？',
              a: 'Obelisks：神諭卡 8 張（Deadly Wound ×2、Military Ceremony ×2、Bloody Attack ×2、Defensive Strike ×2），元件表寫 4 張。Shield of Onyx：神諭卡 3 張（Unexpected Reinforcements ×2、Protected Attack ×1），元件表寫 4 張，另有特殊戰鬥卡 Shield of Onyx（和黑瑪瑙更新板塊配對）。Amethyst 金字塔：特殊戰鬥卡 Adaptable Strategy（和紫水晶 3 級板塊配對），元件表沒列。本體：特殊戰鬥卡 Wrryt Storm（紅 2 級）與 Shetyw Defense（藍 2 級，卡面圖與板塊略有不同）。Rise of the Gods 盒內另有元件表沒列的神諭卡 5 張（Ultimate Shield ×1、Planned Attack ×2、Unhoped Assistance ×2），玩家表示混入一般神諭牌堆使用。',
              src: 'BGG〈Component Identification and Clarification〉（玩家整理，非官方）；BGG 回覆（玩家確認 5 張混入牌堆）',
            },
            {
              q: '這些卡的數量和玩家輔助的 49 張神諭卡、元件表的 38 張對得上嗎？',
              a: '玩家輔助牌面張數加總是 49 張（不含 Diversion 與 Assemble）。扣掉 Obelisks 的 8 張與 Shield of Onyx 的 3 張，剛好是 38 張，與元件表相符，推測元件表只算本體盒；但玩家整理另說有 5 張元件表沒列的神諭卡，兩種算法並存，無法確定，請看實物【推算，待核對】。',
              src: '玩家輔助 第 12 頁加總；規則書元件表；BGG 玩家整理（推算由本專案整理者加）',
            },
            {
              q: '盒中多出來的兩組各 3 個金字塔是做什麼的？',
              a: '提問玩家的盒子有三組，其中一組給第 6 位玩家，其餘兩組用途不明，只當作備品（金字塔零件偶有翹曲，可替換）。有人說自己盒內沒有多出零件，只要每位玩家都有 3 組完整金字塔就夠了。',
              src: 'BGG〈Component Identification and Clarification〉、〈There are 20 extra acquire tiles ?〉（玩家討論）',
            },
          ],
        },
        {
          name: '特殊戰鬥卡的名稱',
          items: [
            {
              q: '藍寶石 2 級板塊寫 Shetyw Barrier，但戰鬥卡一覽的特殊戰鬥卡叫 Shetyw Defense，是同一張嗎？',
              a: '應該是同一張：v50 玩家輔助的板塊文字寫「換成特殊戰鬥卡 Shetyw Barrier」，戰鬥卡一覽裡對應的卡（+3 力量、+3 護盾）叫 Shetyw Defense，是玩家輔助用字不一致，不是兩張不同的卡【推論，待核對】。',
              src: '玩家輔助 v50 第 3、10 頁（本專案整理者比對）',
            },
          ],
        },
      ],
    },
    {
      title: '本專案資料裡沒有對應板塊的條目',
      topics: [
        {
          name: '其他板塊（不在 Rise of the Gods 玩家輔助）',
          items: [
            {
              q: 'Organized Movement（銀色行動）能搭配非移動行動使用嗎？',
              a: '不行。板塊寫明需要使用一個移動行動，所以要花 1 個行動標記或 1 個銀色行動標記放在移動行動上，才能使用 Organized Movement 的金色行動。這張板塊在手上的玩家輔助（含 v50）裡都沒有找到【待核對】。',
              src: 'BGG 整理串（玩家整理）',
            },
            {
              q: '有 Divine Extra 和白色 Priest of Ra 4 級，打一張要 2 PP 的戰鬥神諭卡（Protected Attack）要付多少？是先減再加倍，還是先加倍再減？',
              a: '付 3 PP。Priest of Ra 的減免只對牌「第一次」的費用生效；如果決定再用一次效果，要額外多付 2 PP。Divine Extra 這張板塊在手上的玩家輔助（含 v50）裡都沒有找到【待核對】。',
              src: 'BGG 整理串（玩家整理）',
            },
            {
              q: 'Late Fame 搭配金色 Restful Night 2 級，夜晚階段用 5 個老兵標記換，是不是可以拿 2 FP？',
              a: '整理串答「是，得 2 FP」，出處是 Gamefound 的 Kolossal 專案頁（網址被截斷，無法還原）。Restful Night 這張板塊在手上的玩家輔助（含 v50）裡都沒有找到【待核對】。',
              src: 'BGG 整理串（玩家整理）',
            },
          ],
        },
      ],
    },
  ],
}
