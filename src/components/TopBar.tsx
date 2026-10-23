import PlayerPanel from '../PlayerPanel'

export default function TopBar({
  myListCount,
  onOpenMyList,
}: {
  myListCount: number
  onOpenMyList: () => void
}) {
  return (
    <header className="topbar">
      <a className="brand" href="#" aria-label="桌遊規則助手首頁">
        <span className="brand-icon" aria-hidden="true">
          🎲
        </span>
        <span>桌遊規則助手</span>
      </a>
      <span className="topbar-label">BOARD GAME COMPANION</span>
      <div className="topbar-actions">
        <PlayerPanel />
        <button
          type="button"
          className="mylist-button"
          onClick={onOpenMyList}
        >
          我的清單
          {myListCount > 0 && (
            <span className="mylist-count">{myListCount}</span>
          )}
        </button>
      </div>
    </header>
  )
}
