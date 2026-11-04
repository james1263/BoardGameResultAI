// 只用在「顯示」：把 OCR 中文規則書裡明顯的亂碼雜訊濾掉。
// 這是啟發式處理，不會修正錯字；原文以原頁面為準。
const KEEP_ASCII = new Set(['C', 'SP', 'CO', 'VP', 'RE', 'AI'])
const CJK = /[\u3400-\u9fff]/g

export function looksChinese(text: string): boolean {
  const body = text.replace(/\s+/g, '')
  if (body.length === 0) return false
  const cjk = (body.match(CJK) ?? []).length
  return cjk / body.length >= 0.2
}

export function cleanOcrText(text: string): string {
  if (!looksChinese(text)) return text
  let t = text
    // 私有區字元、替換字元
    .replace(/[\uE000-\uF8FF\uFFFD]/g, '')
    // 連續符號雜訊（例如 ~_!、<>、|\）
    .replace(/[_~|\\^<>=*#@`\[\]{}]{1,}/g, ' ')
    // 純英文雜訊：沒有數字、也不在保留清單的英文字串
    .replace(/[A-Za-z]+(?:[-'][A-Za-z]+)*/g, (word) =>
      KEEP_ASCII.has(word) ? word : ' ',
    )
    // 中文與中文之間多出來的空白
    .replace(/([\u3400-\u9fff，。、；：！？）」』])\s+(?=[\u3400-\u9fff（「『])/g, '$1')
    // 重複的空白、孤立的標點
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/(?:\s*[!?.:;,'"“”‘’]\s*){3,}/g, ' ')
    .trim()
  return t
}
