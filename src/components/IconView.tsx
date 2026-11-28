import '../styles/icon-picker.css'

// 顯示一個圖示：dot:顏色 用 CSS 畫成彩色圓球（舊系統也不會變方框），其他照原樣當文字顯示。
export const DOT_NAMES = ['white', 'black', 'red', 'blue', 'green', 'yellow', 'orange', 'purple']

export function isDotIcon(icon: string): boolean {
  return icon.startsWith('dot:') && DOT_NAMES.includes(icon.slice(4))
}

export default function IconView({ icon }: { icon: string }) {
  if (isDotIcon(icon)) {
    return <span className="ic-dot" data-dot={icon.slice(4)} aria-hidden="true" />
  }
  return <>{icon}</>
}
