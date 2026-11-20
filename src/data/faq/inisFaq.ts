// 翠嶼秘境（Inis）規則釐清・中文翻譯
// 來源：INIS Rules Clarifications（英文，標示 Approved by Christian Martinez，設計師核可），中文為自譯稿。
// 沒有中文版規則書可對照：卡牌與地形名稱暫用英文原名，中文用詞（部落、酋長、堡壘、優勢卡、史詩卡）【待核對】。
// 登記：官方 FAQ 要在 GameFaq.tsx 與 faqSearch.ts 兩處的 FAQ_BY_GAME 各加一行，key 是 'Inis: Legendary Edition'。

import type { GameFaqData } from './types'

export const INIS_FAQ: GameFaqData = {
  sub: '規則釐清・中文翻譯',
  note: '依 INIS Rules Clarifications（設計師 Christian Martinez 核可）翻譯；卡牌名稱暫用英文原名，中文用詞待核對。',
  groups: [
    {
      title: '一般原則',
      topics: [
        {
          name: '有疑問時',
          items: [
            { a: '規則有疑問時，採用最簡單的做法。' },
          ],
        },
        {
          name: '做不到全部效果的卡片',
          items: [
            {
              q: '手上的卡片沒辦法完整執行時，還能打出嗎？',
              a: '可以。你可以打出效果為零或只有一部分的卡片，仍算「已打出」。例如：Festival 沒有部落可放時，仍可在你有神廟的地方放節慶標記；The Stone of Fal 寫「放 2 個」，但你只剩 1 個或 0 個時仍可打出；Warlord 的第二個效果，沒有部落可放時仍可選擇由誰做下一個操作。你也可以拿一張做不到的卡來代替 PASS。',
            },
          ],
        },
        {
          name: '取代（Replace）與移除（Remove）',
          items: [
            {
              q: '「取代」包含「移除」嗎？',
              a: '不包含。這是刻意用的措辭，兩者是不同的事件。',
            },
          ],
        },
        {
          name: '首都與 Swamp',
          items: [
            {
              q: '首都可以放在 Swamp 嗎？',
              a: '不行。首都本身算堡壘，而 Swamp 上不能放堡壘。',
            },
          ],
        },
      ],
    },
    {
      title: '優勢卡',
      topics: [
        {
          name: 'Hills 與 Iron Mine',
          items: [
            {
              q: 'Hills 優勢卡可以抵銷 Iron Mine 優勢卡嗎？',
              a: '可以。',
            },
          ],
        },
        {
          name: 'Iron Mine',
          items: [
            {
              q: '對手沒有行動卡時，Iron Mine 會讓他損失兩個部落嗎？',
              a: '不會。對手沒有行動卡時，Iron Mine 沒有效果。',
            },
          ],
        },
        {
          name: 'Salt Mine 與 Cove',
          items: [
            {
              q: '兩張一起用時，一定要還給對手不同的卡嗎？',
              a: '不用。Salt Mine 是「從對手隨機拿 1 張行動卡，然後給該玩家你的 1 張行動卡」；Cove 是「把那張加入手牌，然後放一張手牌到一旁」。兩張搭配時，你可以把剛拿到的那張還回去，因為你已經取得過它，不必另外挑一張。',
            },
          ],
        },
      ],
    },
    {
      title: '史詩卡',
      topics: [
        {
          name: 'Tale of Cuchulain',
          items: [
            {
              q: '板塊上只有 1 個對手部落時，需要移除自己的部落湊數嗎？',
              a: '不需要。卡上寫「移除任意 2 個暴露部落」，法文原文的正確翻譯應為「最多 2 個」。',
            },
          ],
        },
        {
          name: 'Deirdre’s Beauty',
          items: [
            {
              q: '用 Deirdre’s Beauty 拿到的史詩卡可以馬上打出嗎？',
              a: '可以。卡上寫「把其中 1 張史詩卡加入手牌並棄掉其他，然後移除你 1 個部落」，加入手牌後那張卡就是你的手牌了。例如拿到 The Dagda’s Club（被迫移除部落時可免除），在 Deirdre’s Beauty 強迫你移除部落之前，你就可以打出它而不用移除。',
            },
          ],
        },
        {
          name: 'Master Craftsman',
          items: [
            {
              q: '手上沒有其他牌時還能打出 Master Craftsman 嗎？',
              a: '可以。卡上是「若能的話棄 1 張牌，然後抽 1 張史詩卡」；沒有牌可棄也仍可打出並抽史詩卡。',
            },
          ],
        },
      ],
    },
    {
      title: '行動卡',
      topics: [
        {
          name: 'New Alliance',
          items: [
            {
              q: '沒有部落可以「取代」對手的部落時，可以直接移除對手的部落嗎？',
              a: '不行。沒有部落可放上去，就不能做取代；不能只把對手的部落拿掉而不放東西。',
            },
          ],
        },
      ],
    },
  ],
}
