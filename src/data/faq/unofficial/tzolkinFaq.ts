// 卓爾金曆（Tzolk'in: The Mayan Calendar）非官方 FAQ：玩家整理，不是官方裁定
// 從 tzolkin.ts「常見錯誤與 FAQ 重點」搬出來的 2 則（原標示：玩家整理 FAQ，Campro，非官方）。
// 登記：只要在 unofficialRegistry.ts 加一行，key 是 "Tzolk'in: The Mayan Calendar"。
// 尚未核對原始連結；有連結後補到 sources 的 url。

import type { GameFaqData } from '../types'

export const TZOLKIN_UNOFFICIAL_FAQ: GameFaqData = {
  sub: '玩家整理・Campro',
  note: '以下是玩家整理的規則釐清，不是官方 FAQ；與規則書衝突時以規則書為準。',
  sources: [{ label: '玩家整理 FAQ（Campro）' }],
  groups: [
    {
      title: '規則釐清',
      topics: [
        {
          name: '農業科技 2 級',
          items: [
            {
              q: '玉米片被木頭蓋住，或玉米片已被拿完時，農業 2 級還能收玉米嗎？',
              a: '兩種情況都還能執行收玉米行動，只是拿不到收穫片。',
              src: '玩家整理 FAQ（Campro，非官方）',
            },
          ],
        },
        {
          name: '供給日扣分',
          items: [
            {
              q: '供給日餵不起工人扣分時，分數有 0 分下限嗎？',
              a: '沒有。分數本來就低時，總分可以變成負數。',
              src: '玩家整理 FAQ（Campro，非官方）',
            },
          ],
        },
      ],
    },
  ],
}
