import { useGameErrata } from '../lib/useGameErrata'
import '../styles/errata.css'

// 遊戲詳細資料概覽：可收合的「玩錯紀錄（N）」，只有 VIP／管理者會掛這個元件
export default function GameErrata({
  bggName,
  isAdmin,
}: {
  bggName: string
  isAdmin: boolean
}) {
  const { items, loading, error } = useGameErrata(bggName, true)

  // 沒有紀錄時，VIP 不顯示這一區；管理者仍顯示，提醒可以去新增
  if (!loading && !error && items.length === 0 && !isAdmin) return null

  return (
    <details className="ov-fold er-fold">
      <summary>玩錯紀錄（{items.length}）</summary>
      <div className="ov-fold-body">
        <p className="er-note">
          管理者記錄的玩錯經驗，不是官方規則；與規則書衝突時，以規則書為準。
        </p>
        {loading && <p className="er-note">載入中…</p>}
        {error && <p className="er-note">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="er-note">
            還沒有紀錄。到管理中心「規則書」→「＋ 玩錯紀錄」新增。
          </p>
        )}
        <ul className="er-list">
          {items.map((item) => (
            <li key={item.id}>
              <div className="er-title">{item.title}</div>
              <p className="er-body">{item.content}</p>
              {item.source_note && (
                <small className="er-src">來源：{item.source_note}</small>
              )}
            </li>
          ))}
        </ul>
      </div>
    </details>
  )
}
