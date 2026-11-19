// 仙境幽谷：銀霜國度（Everdell Silverfrost）非官方 FAQ（中文自譯）
// 來源：Silverfrost_FAQs.docx（英文，分「General／Specific Rules／Specific Cards」三塊），使用者確認不是官方，出處不明；用自己的話翻譯整理。
// 與規則書衝突時，以規則書為準。卡牌與巨型生物名稱保留英文；用詞比照 everdellSilverfrost.ts。
// 登記：只在 unofficialRegistry.ts 登記一處，key 是 'Everdell Silverfrost'（不要登記到 GameFaq.tsx、faqSearch.ts）。

import type { GameFaqData } from '../types'

export const EVERDELL_SILVERFROST_UNOFFICIAL_FAQ: GameFaqData = {
  sub: '非官方・FAQ 中文自譯（出處不明）',
  note: '整理自英文 FAQ 檔（非官方，出處不明），不是官方 FAQ；與規則書不同時以規則書為準。卡牌名稱保留英文。',
  groups: [
    {
      title: '一般規則',
      topics: [
        {
          name: '工人行動',
          items: [
            { src: '非官方 FAQ 檔', a: '玩家的回合只能做三件事之一：放工人、打出卡牌、準備下一季。' },
          ],
        },
        {
          name: '遊俠工人',
          items: [
            { src: '非官方 FAQ 檔', a: '遊俠有特殊能力：可以去已被佔用的位置，或單獨去沒人的位置時拿 1 火焰（包括共用位置，以及自己或別人城市裡的紅色目的地卡）。專屬位置上的遊俠，會擋住其他遊俠使用該位置。拿到的火焰可以拿來付遊俠放在那裡的費用。' },
          ],
        },
        {
          name: '積雪機制',
          items: [
            { src: '非官方 FAQ 檔', a: '棋盤上的位置可能被積雪擋住，要先付 1 火焰清掉才能放工人。城市裡的卡也會有積雪，影響終局計分（卡的基本分與紫色繁榮卡的額外分都不計）。可以付 1 火焰（冬日狂怒之後 2 火焰）清自己城市中 1 張卡的積雪，每回合一次（準備季節時除外）。' },
          ],
        },
        {
          name: '計分',
          items: [
            { src: '非官方 FAQ 檔', a: '分數來自城市裡的卡、完成的任務、分數標記、清掉的積雪等。' },
          ],
        },
        {
          name: '城市與手牌',
          items: [
            { src: '非官方 FAQ 檔', a: '城市只有 15 格。手牌上限嚴格是 8 張，不能抽超過。' },
          ],
        },
        {
          name: '山谷',
          items: [
            { src: '非官方 FAQ 檔', a: '重複的牌疊在同一格；山谷的牌在回合結束時補上。' },
          ],
        },
        {
          name: '基本位置',
          items: [
            { src: '非官方 FAQ 檔', a: '指棋盤上沒有名字的位置。' },
          ],
        },
        {
          name: '任務',
          items: [
            { src: '非官方 FAQ 檔', a: '需要資源的任務，只要「有」就行，不用花掉資源。Achieve 與 Fulfill 意思相同（棋盤寫 Fulfill、卡上寫 Achieve）。' },
          ],
        },
        {
          name: '打出卡牌',
          items: [
            { src: '非官方 FAQ 檔', a: '打牌時只能用 1 個「打牌能力」，例如不能同時用 Smithy、Floe Ferry、Carpenter 疊折扣。' },
          ],
        },
      ],
    },
    {
      title: '特殊規則',
      topics: [
        {
          name: '城市',
          items: [
            { src: '非官方 FAQ 檔', a: '不佔城市格子的卡，在所有計算上仍然算（例如準備季節時算「每張卡」的火焰）。' },
          ],
        },
        {
          name: '積雪',
          items: [
            { src: '非官方 FAQ 檔', a: '有積雪的山谷卡不能使用或棄掉，如果不清掉會一直佔著山谷的位置。' },
            { src: '非官方 FAQ 檔', a: 'Stormwatch 可以清山谷與棋盤位置的積雪；Chipdigger 可以清自己城市的積雪。' },
            { src: '非官方 FAQ 檔', a: '用其他機制（例如巨型生物或目的地卡）啟動基本位置是不可能的，也不能付火焰清積雪來硬啟動。' },
            { src: '非官方 FAQ 檔', a: '放工人到紅色卡位置時，可以順便清掉該位置的積雪；加上一般的「清城市 1 張卡」規則，同一回合最多清自己城市 2 個積雪。這也是唯一能清對手城市積雪的方法（只限有社群位置的紅色生物卡），清的玩家保留這個積雪。' },
            { src: '非官方 FAQ 檔', a: '山谷補牌時，如果已有同一張牌且上面有積雪，仍然疊起來，最上面那張有積雪；要用或拿，必須先清積雪。' },
          ],
        },
        {
          name: '信標',
          items: [
            { src: '非官方 FAQ 檔', a: '同一回合啟動超過 1 張巨型生物時，不要先棄掉第一張。例如用 Whisper 重新啟動先前放在別的信標的工人，因而啟動第二張巨型生物，就不能先棄掉 Whisper。' },
          ],
        },
        {
          name: '啟動工人',
          items: [
            { src: '非官方 FAQ 檔', a: '在社群位置啟動工人，會讓卡片擁有者再得 1 分。' },
          ],
        },
        {
          name: '巨型生物牌庫',
          items: [
            { src: '非官方 FAQ 檔', a: '牌庫幾乎不可能用完；萬一用完，把棄牌堆洗回去繼續用。' },
          ],
        },
      ],
    },
    {
      title: '個別卡牌',
      topics: [
        {
          name: 'Alms Keeper',
          items: [
            { src: '非官方 FAQ 檔', a: '城市裡有多張時，每張的資源都各自計分。例：6 個沒用的資源與 2 張 Alms Keeper，共得 12 分。' },
          ],
        },
        {
          name: 'Artist',
          items: [
            { src: '非官方 FAQ 檔', a: '分數按「顏色」計，不是按卡片數，最多 5 色×3 分＝15 分。' },
          ],
        },
        {
          name: 'Beacon',
          items: [
            { src: '非官方 FAQ 檔', a: '不會拿到被啟動的巨型生物那格上標示的分數。【待核對：與規則書第 8 頁「信標位置會拿分數標記」不同，可能指 Beacon 這張卡】' },
          ],
        },
        {
          name: 'Blacksmith',
          items: [
            { src: '非官方 FAQ 檔', a: '這張卡上的火焰不算進任務或其他能力。' },
          ],
        },
        {
          name: 'Bravehorn（巨型生物）',
          items: [
            { src: '非官方 FAQ 檔', a: '沒有牌的話不用棄牌。' },
          ],
        },
        {
          name: 'Bricklayer',
          items: [
            { src: '非官方 FAQ 檔', a: '要移除煙囪的那張卡如果有積雪，不能移除，要先清積雪。' },
          ],
        },
        {
          name: 'Chimney Sweep',
          items: [
            { src: '非官方 FAQ 檔', a: '要移除煙囪的那張卡如果有積雪，不能移除，要先清積雪。' },
          ],
        },
        {
          name: 'Feasting Hall',
          items: [
            { src: '非官方 FAQ 檔', a: '能力不適用於清除這張卡自己的積雪。' },
          ],
        },
        {
          name: 'Floe Ferry',
          items: [
            { src: '非官方 FAQ 檔', a: '放在它底下的卡不再算城市的一部分，所以 Mountaineer 和 Camp 不能放在它底下。' },
          ],
        },
        {
          name: 'Guide',
          items: [
            { src: '非官方 FAQ 檔', a: '可以連續啟動多次。例：你有 0 張牌，抽 2 張後仍少於 3 張，就可以再抽 2 張。' },
          ],
        },
        {
          name: 'Investor',
          items: [
            { src: '非官方 FAQ 檔', a: '牌和分數都是最多拿 3 張／3 分。' },
          ],
        },
        {
          name: 'King Rhun（巨型生物）',
          items: [
            { src: '非官方 FAQ 檔', a: '可以依序完成任務：完成第一張任務後，它可以計入第二張任務的條件（例：Powerful Princess 要求任務數不少於左邊玩家，第一張任務可以算進去）。是「最多 2 張」。' },
          ],
        },
        {
          name: 'Mist Ranger（啟動對手已放的工人）',
          items: [
            { src: '非官方 FAQ 檔', a: '位置要火焰就必須付（例：啟動別人放在信標的工人）。' },
            { src: '非官方 FAQ 檔', a: '可以用在已經結束遊戲的玩家的工人。' },
            { src: '非官方 FAQ 檔', a: '用在遊俠身上不會拿到火焰。' },
            { src: '非官方 FAQ 檔', a: '如果工人放下後才出現積雪，就不能啟動那個位置。' },
            { src: '非官方 FAQ 檔', a: '可啟動的位置包括任何紅色目的地卡（專屬或社群位置）。' },
            { src: '非官方 FAQ 檔', a: '不能用在旅程位置。' },
          ],
        },
        {
          name: 'Postal Pigeon',
          items: [
            { src: '非官方 FAQ 檔', a: '打出抽到的其中 1 張後，其餘的牌留著。' },
          ],
        },
        {
          name: 'Royal Rescue（任務）',
          items: [
            { src: '非官方 FAQ 檔', a: '遊俠牌包括 Leaf Ranger、Fire Ranger、Mist Ranger 等。' },
          ],
        },
        {
          name: 'Sky Ranger',
          items: [
            { src: '非官方 FAQ 檔', a: '有積雪時，手牌上限回到 8 張；積雪放上去時如果玩家手牌超過 8 張，必須立刻棄到 8 張。' },
          ],
        },
        {
          name: 'Stubblehoof（巨型生物）',
          items: [
            { src: '非官方 FAQ 檔', a: '目的地卡的擁有者不得分。用它啟動 Inn 時，不能同時把那張 Inn 打進你的城市。' },
          ],
        },
        {
          name: 'Thistle（巨型生物）',
          items: [
            { src: '非官方 FAQ 檔', a: '要移除煙囪的那張卡如果有積雪，不能移除，要先清積雪。' },
          ],
        },
        {
          name: 'Truffle（巨型生物）',
          items: [
            { src: '非官方 FAQ 檔', a: '不能啟動 Trail Blazer 再把同一張棄掉拿苔蘚（疊在下面的 Trail Blazer 也一樣）。' },
          ],
        },
        {
          name: 'Whisper（巨型生物）',
          items: [
            { src: '非官方 FAQ 檔', a: '用它重新啟動先前放在別的信標的工人、因而啟動第二張巨型生物時，不要先棄掉 Whisper；也不能用來重新啟動剛放下的那個工人。' },
          ],
        },
        {
          name: 'Windbreak wall（任務）',
          items: [
            { src: '非官方 FAQ 檔', a: '範例：3 張紫色與 3 張藍色卡即可完成任務。' },
          ],
        },
      ],
    },
  ],
}
