// 官方 FAQ 的資料格式：一款遊戲一份檔案，放在 src\data\faq\
// 之後新增別款遊戲的 FAQ，照 risingSunFaq.ts 的格式新增檔案，再到 GameFaq.tsx 的 FAQ_BY_GAME 登記即可。

export type FaqItem = {
  // 有 q 的是問答；沒有 q 的是單純的規則說明
  q?: string
  a: string
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

export type GameFaqData = {
  // 入口卡片與彈窗標題下方的小字，例如「FAQ 2.0・中文翻譯」
  sub: string
  // 彈窗頂端的小字說明
  note: string
  groups: FaqGroup[]
}
