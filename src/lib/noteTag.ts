// 留言上的場次標籤：「11/11 聚會名稱」；沒標聚會的留言回傳空字串
export function formatNoteTag(date?: string | null, title?: string | null): string {
  const name = (title ?? '').trim()
  let day = ''
  if (date) {
    const [year, month, dayOfMonth] = date.split('-')
    const thisYear = String(new Date().getFullYear())
    day = month && dayOfMonth ? (year === thisYear ? `${month}/${dayOfMonth}` : `${year}/${month}/${dayOfMonth}`) : date
  }
  return [day, name].filter(Boolean).join(' ')
}
