// 開桌前快速複習：維京蹺蹺板（Viking See-Saw；資料庫名稱 Viking See-Saw）
// 版面比照 lure.ts／inis.ts：先看主要區塊，設置與常見錯誤預設收起。
// 內容來源：Viking See-Saw 官方英文規則書（itten 出版，Reiner Knizia 設計，單張四欄；版次標示 VS-01(LS)-2021.11）。
// 中文用詞（貨物、船艙、甲板、箱子、倉庫、傾斜、護航）為自譯，全部標【待核對】；沒有取得官方中文版規則書。
// 沒有擴充、沒有 FAQ。規則書沒寫清楚的地方標【未驗證】，不自行補規則。

import type { ReviewSection } from './risingSun'

const OFFICIAL = 'Viking See-Saw 官方英文規則書'

export const VIKING_SEE_SAW_REVIEW: { bggName: string; draftNote: string; sections: ReviewSection[] } = {
  bggName: 'Viking See-Saw',
  draftNote: '',
  sections: [
    {
      title: '遊戲目標',
      items: [
        {
          text: '2～4 人，約 10 分鐘，8 歲以上。這是疊貨物的平衡遊戲：每人輪流把貨物放上會左右傾斜的船，搶先把自己倉庫裡的貨物全放完的人獲勝。',
          src: `${OFFICIAL} 標題列與 Overview；中文用詞【待核對】`,
        },
        {
          label: '核心',
          text: '放貨物時不能讓船的傾斜方向改變；改變了就要從船艙拿一個箱子當懲罰，放進自己的倉庫。',
          src: `${OFFICIAL} Overview`,
        },
      ],
    },
    {
      title: '你的回合',
      items: [
        {
          text: '從自己的倉庫拿 1 個貨物，放在船「翹起來那一側」的甲板上。船的傾斜沒有改變就成功，回合結束，換順時針下一位。',
          src: `${OFFICIAL} How to Play 第 2 點`,
        },
        {
          label: '一定要放翹起那側',
          text: '永遠只能放在傾斜朝上的那一側甲板，不能放到下沉的那側或船艙。',
          src: `${OFFICIAL} Ship’s Tilt Changes（Deck tilted upwards）`,
        },
        {
          label: '起始玩家',
          text: '先選一位起始玩家，之後順時針進行。',
          src: `${OFFICIAL} How to Play 第 1 點`,
        },
      ],
    },
    {
      title: '船的傾斜改變（失敗）',
      items: [
        {
          text: '貨物留在你放的位置不動，但你要從船艙拿 1 個箱子放進自己的倉庫當懲罰。接著換下一位。',
          src: `${OFFICIAL} Ship’s Tilt Changes`,
        },
        {
          label: '船艙箱子越拿越少',
          text: '船艙的箱子被拿光時遊戲會結束（見「遊戲結束」），所以失敗太多次也會讓遊戲提前結束。',
          src: `${OFFICIAL} End of Game`,
        },
      ],
    },
    {
      title: '貨物掉下船',
      items: [
        {
          text: '放貨物時，如果船上原本已有的貨物掉下去，把掉下去的全部撿起來放進你的倉庫。',
          src: `${OFFICIAL} Spilling the Ship’s Cargo`,
        },
        {
          text: '如果你正在放的那個貨物也掉了，撿起來重新放。之後如果又有貨物掉下去，一樣撿起來（放進倉庫）再重放。重複到成功放上船為止。',
          src: `${OFFICIAL} Spilling the Ship’s Cargo`,
        },
        {
          label: '過程中傾斜改變',
          text: '重放的過程中如果船的傾斜改變，一樣拿 1 個船艙箱子當懲罰。',
          src: `${OFFICIAL} Spilling the Ship’s Cargo`,
        },
      ],
    },
    {
      title: '貨物滑進船艙',
      items: [
        {
          text: '放貨物時如果有貨物滑進船艙，直接把它移回原本的位置。移回的過程中如果傾斜改變，拿 1 個箱子當懲罰。',
          src: `${OFFICIAL} Cargo Moves Into Cabin`,
        },
        {
          text: '移回的過程中如果不小心碰掉東西，直接放回船上原本的位置，不算貨物掉落。',
          src: `${OFFICIAL} Cargo Moves Into Cabin`,
        },
      ],
    },
    {
      title: '遊戲結束與勝負',
      items: [
        {
          label: '情況 A：倉庫清空',
          text: '某位玩家的回合結束時，他的倉庫已沒有貨物，遊戲立刻結束，他就是贏家。',
          src: `${OFFICIAL} End of Game`,
        },
        {
          label: '情況 B：拿走最後的箱子',
          text: '某位玩家的回合結束時，他拿走了船艙最後一個箱子，遊戲立刻結束。倉庫裡東西（pieces）最少的人獲勝。',
          src: `${OFFICIAL} End of Game`,
        },
        {
          label: '平手',
          text: '情況 B 平手時，平手的玩家比貨物重量（用船來比），負擔最輕的獲勝。',
          src: `${OFFICIAL} End of Game`,
        },
        {
          label: '箱子算不算 pieces',
          text: '規則書只寫「倉庫裡最少的東西」，沒有明說箱子算不算。因為箱子是放進倉庫，實際上一般會一起數，但規則書沒寫明。【未驗證】',
          src: `${OFFICIAL} End of Game；此條為推測，需核對`,
        },
      ],
    },
    {
      title: '設置（開局才用）',
      fold: true,
      items: [
        {
          text: '船放桌子中間，旗子插在船的正中央。6 個箱子放進船艙，最後 1 個箱子放在船的某一端甲板上。',
          src: `${OFFICIAL} Setup 第 1 點`,
        },
        {
          label: '3～4 人每人',
          text: '1 個倉庫盤，加上：金 2、銀 2、鐵 1、玻璃 1、寶石 1、維京人 1。',
          src: `${OFFICIAL} Setup 第 2 點；零件名稱中文【待核對】`,
        },
        {
          label: '2 人每人',
          text: '1 個倉庫盤，加上：金 4、銀 4、鐵 2、玻璃 2、寶石 2、維京人 2。',
          src: `${OFFICIAL} Setup 第 2 點`,
        },
        {
          text: '所有分到的貨物放進自己的倉庫盤。',
          src: `${OFFICIAL} Setup 第 3 點`,
        },
        {
          label: '全部零件',
          text: '箱子 7、旗子 1、船 1；貨物：金 8、銀 8、鐵 4、玻璃 4、寶石 4、維京人 4；倉庫盤 4。',
          src: `${OFFICIAL} Contents`,
        },
      ],
    },
    {
      title: '常見錯誤與沒寫清楚的地方',
      fold: true,
      items: [
        {
          text: '只能放在「翹起來那一側」的甲板，不是任意位置。',
          src: `${OFFICIAL} Ship’s Tilt Changes`,
        },
        {
          text: '失敗（傾斜改變）時，貨物不收回，留在船上；懲罰是拿船艙的箱子，不是把自己放的貨物拿回。',
          src: `${OFFICIAL} Ship’s Tilt Changes`,
        },
        {
          text: '貨物掉下船時，掉下去的「所有」貨物都歸你的倉庫，包含別人先前放的。',
          src: `${OFFICIAL} Spilling the Ship’s Cargo`,
        },
        {
          text: '同一回合內如果同時有多種失敗（例如掉貨物又傾斜改變），是否每次都各拿 1 個箱子，規則書沒有明說。【未驗證】',
          src: `${OFFICIAL} 沒有明寫；需核對`,
        },
        {
          text: '貨物掉到桌上或船外的重放，規則書只寫「撿起來再試」，沒有限制次數。',
          src: `${OFFICIAL} Spilling the Ship’s Cargo`,
        },
      ],
    },
  ],
}
