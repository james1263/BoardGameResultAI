// 聖域（Kemet: Blood and Sand）BGG 討論・非官方 FAQ（玩家整理）
// 來源：BGG 規則討論區的「Kemet: Blood and Sand FAQ Compilation Thread」（玩家 Glyde／the_abiogenist 於 8 月 7 日發起整理，作者自己說仍在補充與清打字），以及串內玩家 Jason（VaultBoy）、Spieler Gott（kackarschen）的往來。
// 這串是玩家整理，不是官方；整理者說是參考設計師在 BGG 其他討論串的回覆，但每則是否真的出自設計師，從這份文字看不出來〔未驗證〕。已用自己的話摘要。
// 與規則書、玩家輔助（Rise of the Gods）衝突時，以官方為準。
// 原串連結只有部分討論串編號可還原（截圖文字被截斷），網址是由編號還原，〔未驗證〕。
// 登記：只在 unofficialRegistry.ts 登記一次，key 是 'Kemet: Blood and Sand'。
// 沒收：整理串中標示「To be added」的空白分類（一般規則、金色、埃及眾神）；Loot 的答案與玩家輔助不同，已放在「與玩家輔助不一致」。

import type { GameFaqData } from '../types'

export const KEMET_UNOFFICIAL_FAQ: GameFaqData = {
  sub: '玩家整理・神力板塊互動（BGG 討論串）',
  note: '整理自 BGG 規則討論區的玩家 FAQ 整理串（非官方）。板塊與生物名稱用英文原名，中文用詞為自譯，待核對。與規則書或玩家輔助不同時，以官方為準。',
  sources: [
    { label: 'Kemet: Blood and Sand FAQ Compilation Thread（BGG，玩家整理）' },
    { label: 'BGG 討論串 3543807（Urban Combat）', url: 'https://boardgamegeek.com/thread/3543807' },
    { label: 'BGG 討論串 3531121（Energy Gain）', url: 'https://boardgamegeek.com/thread/3531121' },
    { label: 'BGG 討論串 3524226（Hypnotic Cobra 與 Seth）', url: 'https://boardgamegeek.com/thread/3524226' },
    { label: 'BGG 討論串 3628111（Late Fame）', url: 'https://boardgamegeek.com/thread/3628111' },
    { label: 'BGG 討論串 3523950（Ptahmose Servant）', url: 'https://boardgamegeek.com/thread/3523950' },
  ],
  groups: [
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
              q: 'Urban Combat 3 級在對手的城區裡戰鬥也有效嗎？',
              a: '有效，不一定要是自己的城區。你圍攻對手的城區、裡面有對手部隊，就能得到加成；如果你已經控制了對手的城區，而對手在那裡招募觸發戰鬥，你一樣有加成。',
              src: 'BGG 討論串 3543807（玩家整理）',
            },
          ],
        },
        {
          name: 'Reinforcement Prayer（藍）',
          items: [
            {
              q: '可以用 Reinforcement Prayer 多付 PP 增加超過 2 個單位嗎？',
              a: '不行。這張板塊是在「祈禱」行動時觸發，只能免費加至多 2 個單位，板塊上沒有給你招募行動，也沒有寫可以付費增加更多。提問的人說自己以前都這樣玩，並提出疑慮：它和 Recruiting Scribe 一樣寫著「免費加至多 X 個單位」，會不會能多付費加更多；回答者認為不能。',
              src: 'BGG 整理串中玩家 Jason 的回覆（玩家整理）',
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
              a: '不行。Deep Desert Snake 只在戰鬥中無效化對手生物的效果；Khnum’s Sphinx 的效果發生在移動時，不是戰鬥。',
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
              a: '不行。不論圖示男女，這兩張板塊你只能買其中一張。',
              src: 'BGG 整理串（玩家整理）',
            },
          ],
        },
        {
          name: 'Local Recruitment',
          items: [
            {
              q: '能用 Local Recruitment 把生物綁在剛招募的單位上，再把這個單位送去城區外的部隊嗎？',
              a: '不行。只有招募的單位會被送去城區外的部隊，生物仍留在你的城區或供應區。',
              src: 'BGG 整理串（玩家整理）',
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
              a: '不會。Divine Might 不在戰鬥觸發，只在白天階段與夜晚階段的效果觸發（板塊上寫的）。',
              src: 'BGG 整理串（玩家整理）；玩家輔助 第 5 頁',
            },
            {
              q: 'Divine Might 在夜晚階段怎麼觸發？',
              a: '夜晚階段 9 步中有 3 步可能給 PP（三角洲神殿控制、朝拜、祈禱），每一步有給 PP 就觸發一次；條件都滿足時最多 +6 PP。那一步沒有拿到 PP，就沒有加成。',
              src: 'BGG 整理串（玩家整理）；規則書 第 11 頁',
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
              a: '3 PP。Energy Gain 是每棄掉 1 張打出的神諭卡就得 1 PP。',
              src: 'BGG 討論串 3531121（玩家整理）',
            },
            {
              q: '我有 Energy Gain 和紅色 Divine Wound 3 級，用 Divine Wound 棄牌還能得到 PP 嗎？',
              a: '不能。Energy Gain 需要你「打出」那張牌、之後被棄掉；Divine Wound 不是打出，而是直接棄掉換加力量。',
              src: 'BGG 整理串（玩家整理）',
            },
            {
              q: '有 Energy Gain 又有黑 4 級 Divine Might，打 2 張神諭卡被棄掉，是共 6 PP 還是 4 PP？',
              a: '回答是 4 PP：Energy Gain 2 次共 +2，Divine Might 在這個白天階段只觸發一次（+2）。這個答案與 Divine Might「每次其他效果獲得 PP 就 +2」的字面讀法不太一樣【待核對】。',
              src: 'BGG 整理串（玩家整理）；玩家輔助 第 5、6 頁',
            },
          ],
        },
        {
          name: 'Hypnotic Cobra 對 Seth（眾神）',
          items: [
            {
              q: '我有 Hypnotic Cobra 的部隊攻擊賽特（Seth），賽特的抽神諭卡效果會被完全擋掉嗎？',
              a: '不會。Hypnotic Cobra 只防止對手打戰鬥神諭卡；賽特仍可抽牌，但抽到有戰鬥符號的牌必須棄掉。',
              src: 'BGG 討論串 3524226（玩家整理）；玩家輔助 第 11 頁',
            },
          ],
        },
        {
          name: 'Late Fame（紫 3 級）',
          items: [
            {
              q: '如果我在夜晚階段用 5 個老兵標記換，可以得 1 戰鬥 FP（板塊效果）嗎？一次可以多換嗎？',
              a: '不能多換：每個夜晚只能花 5 個老兵標記換 1 個戰鬥 FP；就算你存了 10 個，也不能一晚換 2 FP。',
              src: 'BGG 討論串 3628111（玩家整理）；玩家輔助 第 6 頁',
            },
          ],
        },
        {
          name: 'Outpost（紫 4 級）',
          items: [
            {
              q: 'Outpost 到底怎麼運作？',
              a: '用金色行動執行 1 次招募行動，從供應區免費加至多 4 個單位，可放在你的 1 個城區或 1 個空的沙漠區域，也可以一起放夥伴。因為是招募行動，想加超過 4 個要另外付 PP。',
              src: 'BGG 整理串（玩家整理）；玩家輔助 第 6 頁',
            },
          ],
        },
        {
          name: 'Vulture（紫 4 級）',
          items: [
            {
              q: 'Vulture 多得 1 FP 的條件是什麼？',
              a: '本場戰鬥雙方合計至少 4 個單位被移除（含自傷，例如「+5 力量／−2 無法阻擋傷害」戰鬥卡，或 Apophis 的自傷）。不需要贏得戰鬥：即使輸了，只要合計 4 個單位被移除，仍得 1 FP。',
              src: 'BGG 整理串（玩家整理）；玩家輔助 第 6 頁',
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
              a: '不行。被移除的單位必須是你的傷害造成的，不能是對手自傷。',
              src: 'BGG 整理串（玩家整理）；玩家輔助 第 7 頁',
            },
          ],
        },
        {
          name: 'Heka-Ib Servant',
          items: [
            {
              q: '我的 Heka-Ib 僕從已在神殿，我用移動行動離開神殿再回到同一座神殿，會再次觸發效果嗎？',
              a: '會。',
              src: 'BGG 整理串（玩家整理）；玩家輔助 第 7 頁',
            },
          ],
        },
        {
          name: 'Ptahmose Servant',
          items: [
            {
              q: 'Ptahmose Servant 的效果只對綁定的部隊有效，還是取得後全域永久有效？',
              a: '只對綁定的部隊有效。',
              src: 'BGG 討論串 3523950（玩家整理）；玩家輔助 第 7 頁',
            },
          ],
        },
      ],
    },
    {
      title: '與玩家輔助不一致（以官方為準）',
      topics: [
        {
          name: 'Loot（琥珀 3 級）',
          items: [
            {
              q: 'Loot 到底怎麼運作？要先贏得戰鬥嗎？',
              a: 'BGG 整理串的答案：Rise of the Gods 的玩家輔助印刷有誤；正確是必須贏得戰鬥，然後可以選擇拿走對手在這場戰鬥打出的 1 張神諭卡，不想拿就抽 2 張神諭卡。玩家輔助（Aide de Jeu v5.3）上的文字則沒有「贏得戰鬥」這個條件：「戰鬥結束步驟，如果對手本場至少打出 1 張神諭卡，把其中 1 張加入手牌，或抽 2 張神諭卡」。以玩家輔助與官方規則為準，整理串說法是玩家說法【待核對，看實物與官方勘誤】。',
              src: 'BGG 整理串（玩家整理）；玩家輔助 第 7 頁',
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
              a: '不行。板塊寫明需要使用一個移動行動，所以要花 1 個行動標記或 1 個銀色行動標記放在移動行動上，才能使用 Organized Movement 的金色行動。這張板塊在手上的玩家輔助裡沒有找到【待核對】。',
              src: 'BGG 整理串（玩家整理）',
            },
            {
              q: '有 Divine Extra 和白色 Priest of Ra 4 級，打一張要 2 PP 的戰鬥神諭卡（Protected Attack）要付多少？是先減再加倍，還是先加倍再減？',
              a: '付 3 PP。Priest of Ra 的減免只對牌「第一次」的費用生效；如果決定再用一次效果，要額外多付 2 PP。Divine Extra 這張板塊在手上的玩家輔助裡沒有找到【待核對】。',
              src: 'BGG 整理串（玩家整理）',
            },
            {
              q: 'Late Fame 搭配金色 Restful Night 2 級，夜晚階段用 5 個老兵標記換，是不是可以拿 2 FP？',
              a: '整理串答「是，得 2 FP」，出處是 Gamefound 的 Kolossal 專案頁（網址被截斷，無法還原）。Restful Night 這張板塊在手上的玩家輔助裡沒有找到【待核對】。',
              src: 'BGG 整理串（玩家整理）',
            },
          ],
        },
      ],
    },
  ],
}
