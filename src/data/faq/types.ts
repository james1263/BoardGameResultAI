// FAQ 的資料格式：一款遊戲一份檔案
//   官方 FAQ：放在 src\data\faq\，到 GameFaq.tsx 與 faqSearch.ts 的 FAQ_BY_GAME 登記（兩邊都要）。
//   BGG 討論・非官方 FAQ：放在 src\data\faq\unofficial\，只要到 unofficialRegistry.ts 登記一次（網頁與規則助手共用）。
// 之後新增別款遊戲的 FAQ，照 risingSunFaq.ts 的格式新增檔案即可。

export type FaqItem = {
  // 有 q 的是問答；沒有 q 的是單純的規則說明
  q?: string
  a: string
  // 這則的來源小標籤（選填），例如「設計師 BGG 回覆」「BGG 討論串」。非官方 FAQ 建議填寫
  src?: string
}

export type FaqTopic = {
  // 主題名稱，例如「放置（Place）」「忠誠（LOYALTY）」
  name: string
  items: FaqItem[]
}

export type FaqGroup = {
  // 分組名稱，例如「規則釐清」「核心盒」「神明降臨擴充」
  title: string
  topics: FaqTopic[]
}

// 來源連結（非官方 FAQ 用）：顯示在彈窗最上方，讓玩家能回原處查證
export type FaqSource = {
  label: string
  url?: string
}

export type GameFaqData = {
  // 入口卡片與彈窗標題下方的小字，例如「FAQ 2.0・中文翻譯」
  sub: string
  // 彈窗頂端的小字說明
  note: string
  groups: FaqGroup[]
  // 非官方 FAQ 的來源清單（選填）
  sources?: FaqSource[]
}
