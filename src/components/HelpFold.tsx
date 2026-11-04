import type { ReactNode } from 'react'
import '../styles/help-fold.css'

// 說明文字收合：只有一個靠左的三角形，點開才看到內容（預設收起）
export default function HelpFold({
  children,
  label = '說明',
}: {
  children: ReactNode
  label?: string
}) {
  return (
    <details className="hf">
      <summary aria-label={label} title={label} />
      <div className="hf-body">{children}</div>
    </details>
  )
}
