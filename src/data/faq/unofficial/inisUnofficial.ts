// 翠嶼秘境（Inis）BGG 討論・非官方 FAQ（玩家彙整）
// 來源：Inis Errata and FAQs v1.1（BGG 玩家彙整；作者表示 99% 的條目已由設計師或 Matagot 工作人員確認）。
// 這不是官方 FAQ；已用自己的話摘要。與官方 Rules Clarifications、規則書衝突時以官方為準。
// 與官方 Rules Clarifications 重複的條目（Iron Mine 無行動卡、Deirdre's Beauty、Salt Mine/Cove、Tale of Cuchulain、
// Master Craftsman 無牌、New Alliance、首都與 Swamp、Hills 抵銷 Iron Mine 等）已放在官方 FAQ，這裡只收補充與更詳細的部分。
// 登記：只在 unofficialRegistry.ts 登記一次，key 是 'Inis: Legendary Edition'。
// 卡牌與地形名稱暫用英文原名，中文用詞【待核對】。

import type { GameFaqData } from '../types'

const SRC = 'Errata and FAQs v1.1（BGG 玩家彙整）'

export const INIS_UNOFFICIAL_FAQ: GameFaqData = {
  sub: 'BGG 玩家彙整・Errata and FAQs v1.1',
  note: '整理自 BGG 玩家彙整的勘誤與 FAQ（非官方），中文為自譯，用詞待核對。與官方規則書、官方釐清衝突時以官方為準。',
  sources: [{ label: 'Inis Errata and FAQs v1.1（BGG 玩家彙整，Matagot／設計師確認）' }],
  groups: [
    {
      title: '一般規則補充',
      topics: [
        {
          name: '設置與選牌',
          items: [
            {
              q: '4 人時，板塊最多可以相鄰幾塊？',
              a: '每塊至少要與另外兩塊相鄰，但也可以相鄰三塊。',
              src: SRC,
            },
            {
              q: '2 人遊戲的兩次選牌可以互相交換嗎？',
              a: '不行。兩次選牌完全獨立；第一次選好的三張放到一旁，第二次選牌時不能拿來交換。',
              src: SRC,
            },
            {
              q: '設置完成後第一回合，優勢卡怎麼發？',
              a: '設置完成後先把優勢卡發給各板塊的酋長，再開始遊戲。',
              src: SRC,
            },
          ],
        },
        {
          name: '布倫、偽王與建築',
          items: [
            {
              q: '布倫在一回合最開始可以 PASS 嗎？',
              a: '不行。布倫第一次行動一定要打出季節卡，由布倫帶頭。',
              src: SRC,
            },
            {
              q: '可以多拿偽王標記來擋住別人嗎？',
              a: '不行。一個回合內一位玩家不能拿超過一枚偽王標記，不能用囤標記來卡別人。',
              src: SRC,
            },
            {
              q: '神廟或堡壘用完了怎麼辦？',
              a: '它們數量有限；全部都已經在場上時，就不能再放。',
              src: SRC,
            },
          ],
        },
        {
          name: '功績標記',
          items: [
            {
              q: '功績標記什麼時候會失去？',
              a: '功績每回合都保留，只有你場上的部落被減到零時才會失去。檢查勝利時功績可以自由分配，但一枚功績不能同時完成多個勝利條件。',
              src: SRC,
            },
          ],
        },
        {
          name: '渡鴉標記與 The Morrigan',
          items: [
            {
              q: '集合階段與 The Morrigan 的渡鴉標記有什麼不同？',
              a: '集合階段要像丟硬幣一樣拋；The Morrigan 則是直接翻到另一面，不用拋。',
              src: SRC,
            },
          ],
        },
        {
          name: '史詩卡堆用完',
          items: [
            {
              q: '史詩卡抽牌堆空了，而某位玩家手上還有 The Dagda 怎麼辦？',
              a: '把棄牌堆洗成新的抽牌堆。',
              src: SRC,
            },
          ],
        },
      ],
    },
    {
      title: '用語與衝突',
      topics: [
        {
          name: '發起者與策動者',
          items: [
            {
              q: '「發起衝突的人（Initiator）」和「策動者（Instigator）」一樣嗎？',
              a: '不一定一樣。Festival 說的是發起者；用 Highlands 改了策動者，失去部落的仍然是原本發起衝突的人。',
              src: SRC,
            },
          ],
        },
        {
          name: '衝突中的攻擊對象',
          items: [
            {
              q: '3～4 人的衝突是大家打策動者嗎？',
              a: '不是。是各打各的（1v1v1v1），不是「1 打全部」；你可以攻擊不是策動者的對手。',
              src: SRC,
            },
          ],
        },
        {
          name: '同時打出聖環卡',
          items: [
            {
              q: '多位玩家同時用不同聖環卡回應同一件事，誰先？',
              a: '先結算主動玩家的卡；衝突中主動玩家是正在做操作的人。之後依回合順序（渡鴉標記方向）結算。',
              src: SRC,
            },
          ],
        },
        {
          name: '取代不是移除',
          items: [
            {
              q: '被「取代」的部落算被移除嗎？',
              a: '不算。被取代的部落不算被移除，指定「移除」的卡不能用來回應取代，反之亦然。',
              src: SRC,
            },
          ],
        },
        {
          name: 'Festival（節慶）',
          items: [
            {
              q: '發起衝突的玩家一定會損失一個部落嗎？',
              a: '會。就算大家最後決議和平，部落也是在討論和平之前就失去了。',
              src: SRC,
            },
            {
              q: '發起人只有一個部落、被節慶拿掉後，衝突怎麼辦？',
              a: '衝突照常繼續，由剩下的玩家處理。',
              src: SRC,
            },
          ],
        },
      ],
    },
    {
      title: '優勢卡',
      topics: [
        {
          name: 'Iron Mine',
          items: [
            {
              q: '被攻擊的玩家可以多棄一張行動卡來代替失去部落嗎？',
              a: '不行。Iron Mine 要求同時移除 1 個暴露部落「且」棄 1 張行動卡，不能用多棄一張卡代替。',
              src: SRC,
            },
          ],
        },
        {
          name: 'Lost Vale',
          items: [
            {
              q: 'Lost Vale 可以移動對手的部落嗎？',
              a: '可以，友方或對手的部落都能移。',
              src: SRC,
            },
          ],
        },
        {
          name: 'Misty Lands 與 Meadows',
          items: [
            {
              q: '兩張優勢卡一起用時，抽幾張、留幾張？',
              a: 'Meadows 多抽 1 張史詩卡可供選擇，但 Misty Lands 仍然只能留下 1 張。',
              src: SRC,
            },
          ],
        },
        {
          name: 'Stone Circle',
          items: [
            {
              q: '付費移除的部落可以是別人的嗎？',
              a: '不行，必須是你自己的部落。',
              src: SRC,
            },
            {
              q: '打出 The Dagda 時，Stone Circle 收回的史詩卡會進棄牌堆嗎？',
              a: '不會。Stone Circle 是把史詩卡收回手上而不是棄掉，所以即使被 The Dagda 取消，也不會進棄牌堆。',
              src: SRC,
            },
          ],
        },
        {
          name: 'Swamp',
          items: [
            {
              q: 'Swamp 的效果被取消（例如被 The Dagda）還算打出嗎？',
              a: '還是算已打出，所以取消它其實沒有實際影響。',
              src: SRC,
            },
          ],
        },
      ],
    },
    {
      title: '史詩卡',
      topics: [
        {
          name: 'The Champion’s Share 與 Cove',
          items: [
            {
              q: '兩張牌的先後順序有差嗎？',
              a: '有。若 The Champion’s Share 比 Cove 早打出，Cove 的效果就落空（仍算已打出）；若 Cove 先打出，The Champion’s Share 會拿到剛放到一旁的那張。',
              src: SRC,
            },
          ],
        },
        {
          name: 'Dagda’s Cauldron',
          items: [
            {
              q: '卡上的「前一個位置」指哪裡？',
              a: '指剛剛發生衝突的那塊板塊。',
              src: SRC,
            },
          ],
        },
        {
          name: 'Lug Samildanach',
          items: [
            {
              q: '可以用來保住被 Geis 取消的卡嗎？',
              a: '可以，能把剛被取消效果的那張行動卡收回手牌。',
              src: SRC,
            },
          ],
        },
        {
          name: 'Master Craftsman',
          items: [
            {
              q: '可以棄優勢卡或史詩卡嗎？',
              a: '可以，黃色優勢卡與紅色史詩卡都可以當作棄牌。',
              src: SRC,
            },
            {
              q: '和 Lug’s Spear 有什麼搭配？',
              a: '可以在 Lug’s Spear 之後打出 Master Craftsman 來取得功績標記。',
              src: SRC,
            },
          ],
        },
        {
          name: 'The Morrigan',
          items: [
            {
              q: '可以在沒有自己部落的板塊發起衝突嗎？',
              a: '可以，Morrigan 能在你沒有部落的板塊發起衝突。',
              src: SRC,
            },
            {
              q: '會觸發 Tír na nóg 嗎？',
              a: '如果出牌順序因此改變，可以觸發。這是依照法文原版規則；設計師建議玩英文版時忽略這點。',
              src: SRC,
            },
          ],
        },
        {
          name: 'The Battle of Moytura',
          items: [
            {
              q: '部落是從哪裡來的？',
              a: '部落是移動或新增到發生衝突的板塊；移動的部落來自相鄰板塊。',
              src: SRC,
            },
          ],
        },
      ],
    },
    {
      title: '行動卡',
      topics: [
        {
          name: 'Citadel',
          items: [
            {
              q: '可以拿哪些優勢卡？',
              a: '可以拿桌上面朝上的優勢卡，也可以拿另一位玩家手上的優勢卡。',
              src: SRC,
            },
          ],
        },
        {
          name: 'Exploration',
          items: [
            {
              q: '新板塊由誰決定位置與方向？',
              a: '布倫決定新板塊的位置；探索者決定朝向並放 1 個自己的部落。',
              src: SRC,
            },
          ],
        },
        {
          name: 'Geis',
          items: [
            {
              q: 'Geis 可以阻止對手棄牌嗎？',
              a: '不行。Geis 只取消對手卡片的效果文字；那張卡仍算「已打出」「已結算」，只是沒有效果。例如它擋不住「棄置一張卡」。',
              src: SRC,
            },
          ],
        },
        {
          name: 'Warlord',
          items: [
            {
              q: '聖環效果用掉後，出牌順序怎麼走？',
              a: '例：4 位玩家，玩家 1 在玩家 2 做完操作後用 Warlord 的聖環效果，選自己做下一個操作，則玩家 3、4 被略過，接著輪到玩家 2。順序變成 1、2、1、2、3、4…。',
              src: SRC,
            },
            {
              q: '板塊上沒有對手時能用 Warlord 發起衝突嗎？',
              a: '可以。例如拿來「撤退」：把部落移到相鄰、你是酋長的板塊，而不引發另一場衝突。',
              src: SRC,
            },
          ],
        },
      ],
    },
  ],
}
