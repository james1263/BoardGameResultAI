// 評分項目的簡短說明（改字只改這裡）
export const RATING_HINTS_BY_KEY: Record<string, string> = {
  like: '你自己玩起來有多喜歡這款遊戲。',
  playerImpact: '你的決定與行動，有多少會被別人影響，甚至要去思考別人的下一步。',
  communication: '玩的時候聊天、談判、嘴砲的程度。',
  change: '每次玩起來的差異大不大，重玩價值高不高。',
  unique: '跟其他遊戲比起來有多特別。',
  keep: '這款值得留在架上的程度。分數太低，之後可能會出現在二手板。',
}

// 畫面上用名稱顯示的地方（例如概覽的小圓點）
export const RATING_HINTS_BY_LABEL: Record<string, string> = {
  喜歡度: RATING_HINTS_BY_KEY.like,
  影響度: RATING_HINTS_BY_KEY.playerImpact,
  溝通度: RATING_HINTS_BY_KEY.communication,
  變化度: RATING_HINTS_BY_KEY.change,
  獨特性: RATING_HINTS_BY_KEY.unique,
  適合留下來: RATING_HINTS_BY_KEY.keep,
  適合留下來程度: RATING_HINTS_BY_KEY.keep,
    快速性: '依 BGG 標示的遊玩時間分級，點數越多代表越快玩完。',
  複雜度: '依 BGG 的難度分數分級，點數越多代表規則與決策越複雜。',
}