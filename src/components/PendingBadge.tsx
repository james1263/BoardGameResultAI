// 小紅點數字（0 不顯示）。樣式寫在元件裡，不依賴 CSS 檔
export default function PendingBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span
      aria-label={`${count} 筆待審核`}
      style={{
        display: 'inline-block',
        marginLeft: 6,
        minWidth: 16,
        padding: '0 5px',
        borderRadius: 999,
        background: '#c0392b',
        color: '#fff',
        fontSize: 11,
        fontWeight: 700,
        lineHeight: '16px',
        textAlign: 'center',
        verticalAlign: 'middle',
      }}
    >
      {count}
    </span>
  )
}
