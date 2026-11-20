// 馬拉開波海盜（Pirates of Maracaibo）BGG 討論・非官方 FAQ
// 來源：BGG 討論串「Does this fix the problem I have with Maracaibo?」中，設計師 Alexander Pfister 的回覆。
// 目前只有這一則：BGG 擋掉了機器讀取整串，只取得搜尋結果摘要，其餘討論未收。
// 用自己的話摘要，不整段貼原文。中文用詞為自譯，待核對。
// 與官方規則書衝突時，以官方為準；這則與基本規則書（海灣必須停下）一致。
// 登記：只在 unofficialRegistry.ts 登記一次，key 是 'Pirates of Maracaibo'。

import type { GameFaqData } from '../types'

export const PIRATES_OF_MARACAIBO_UNOFFICIAL_FAQ: GameFaqData = {
  sub: '設計師回覆・衝刺到馬拉開波',
  note: '整理自 BGG 討論串中設計師 Alexander Pfister 的回覆（非官方）。目前只有一則。中文用詞為自譯，待核對。',
  sources: [
    {
      label: 'BGG：Does this fix the problem I have with Maracaibo?（設計師回覆）',
      url: 'https://boardgamegeek.com/thread/3347695/does-this-fix-the-problem-i-have-with-maracaibo',
    },
  ],
  groups: [
    {
      title: '衝刺與海灣',
      topics: [
        {
          name: '一路移動 3 格衝到馬拉開波',
          items: [
            {
              q: '有人每回合都走滿 3 格直衝馬拉開波，其他人是不是只能被送回起點、沒機會追上？',
              a: '設計師的回答重點是：海灣一定要停，不能跳過。整張圖是 9 欄地點卡，再加海灣和馬拉開波，所以衝刺的人要用「3＋3＋3＋1（海灣）＋1（馬拉開波）」。你可以用 2＋2＋3＋3（到海灣）或 2＋3＋2＋3（到海灣）這類走法趕到海灣，甚至有一次只走 1 格，也還來得及到海灣。',
              src: '設計師 Alexander Pfister 的 BGG 回覆',
            },
            {
              q: '那直接衝到馬拉開波划算嗎？',
              a: '設計師說，馬拉開波的行動大約比一般行動弱兩成左右（這是他的設計看法，不是規則）。另外，移動 3 欄時你可以在 2～4 張地點、裝備或宅邸卡之間選，所以不一定要貼著衝刺的人走。',
              src: '設計師 Alexander Pfister 的 BGG 回覆',
            },
          ],
        },
      ],
    },
  ],
}
