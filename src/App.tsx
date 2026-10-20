
import { useState } from 'react'
import './App.css'
import { boardGames, type BoardGame } from './data/boardGames'

function rankingToEmojiCount(
  ranking: number | undefined,
  firstLimit: number,
  secondLimit: number,
): number | null {
  if (ranking === undefined || ranking === null) {
    return null
  }

  if (ranking <= firstLimit) return 5
  if (ranking <= secondLimit) return 4
  return 3
}

function complexityToEmojiCount(difficulty: number): number {
  if (difficulty <= 1.6) return 1
  if (difficulty <= 2.2) return 2
  if (difficulty <= 2.8) return 3
  if (difficulty <= 3.4) return 4
  return 5
}

function formatPlayers(players: number[]): string {
  if (players.length === 0) {
    return '未提供'
  }

  // 單一人數，例如 [4] → 4 人
  if (players.length === 1) {
    return `${players[0]} 人`
  }

  // 檢查數字是否連續，例如 [6, 5, 4, 3]
  const sortedPlayers = [...players].sort((a, b) => b - a)

  const isContinuous = sortedPlayers.every(
    (player, index) =>
      index === 0 || sortedPlayers[index - 1] - player === 1,
  )

  if (isContinuous) {
    return `${sortedPlayers[sortedPlayers.length - 1]}–${sortedPlayers[0]} 人`
  }

  // 不連續，例如 [6, 4, 2] → 6、4、2 人
  return `${players.join('、')} 人`
}


function App() {
  const [searchText, setSearchText] = useState('')
  const [selectedGame, setSelectedGame] = useState<BoardGame | null>(null)

  const filteredGames = boardGames.filter((game) =>
    game.name.toLowerCase().includes(searchText.toLowerCase()),
  )

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#" aria-label="桌遊規則助手首頁">
          <span className="brand-bggScore"></span>
          <span>桌遊規則助手</span>
        </a>
        <span className="topbar-label">BOARD GAME COMPANION</span>
      </header>

      <main>
        <section className="hero">
          <p className="eyebrow">YOUR BOARD GAME LIBRARY</p>
          <h1>
            規則不用翻半天，
            <br />
            <span>讓遊戲繼續精彩。</span>
          </h1>
          <p className="hero-bggScore">
            收藏你的桌遊，快速找到遊戲規則。
            <br />
            未來也能直接詢問 AI，不再為規則爭論不休。
          </p>

          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="搜尋桌遊名稱，例如：璀璨寶石"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              aria-label="搜尋桌遊名稱"
            />
            <span className="search-hint">搜尋</span>
          </label>
        </section>

        <section className="library">
          <div className="section-heading">
            <div>
              <p className="eyebrow">MY COLLECTION</p>
              <h2>我的桌遊收藏</h2>
            </div>
            <span className="game-count">
              {filteredGames.length} 款桌遊
            </span>
          </div>

          {filteredGames.length > 0 ? (
            <div className="game-grid">
              {filteredGames.map((game) => (
                <article className="game-card" key={game.id}>
                  <div className={`game-art game-art-${game.id}`}>
                    <span className="game-emoji">🎲</span>
                    <span className="game-category">
                      {game.category.join('、')}
                    </span>
                  </div>

                  <div className="game-info">
                    <h3>{game.name}</h3>

                    <p className="game-bggScore">
                      Ranking：#{game.rankingEngine}
                    </p>

                    <div className="game-meta">
                      <span>最佳人數：{formatPlayers(game.bestPlayers)}</span>
                      <span>推薦人數：{formatPlayers(game.recommendPlayers)}</span>
                      <span>◷ {game.bggTime} 分鐘</span>
                      <span>📊 BGG 難度：{game.bggDifficulty}</span>
                    </div>

                    <button
                      className="rule-button"
                      type="button"
                      onClick={() => setSelectedGame(game)}
                    >
                      查看規則 <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span>🔎</span>
              <h3>找不到這款桌遊</h3>
              <p>試試其他名稱，看看收藏中是否有這款遊戲。</p>
            </div>
          )}
        </section>

        <section className="assistant-banner">
          <div className="assistant-bggScore">✦</div>
          <div>
            <p className="eyebrow">COMING NEXT</p>
            <h2>你的桌遊規則 AI 助手</h2>
            <p>未來可以上傳規則書 PDF，直接用中文詢問遊戲規則。</p>
          </div>
          <span className="coming-soon">開發中</span>
        </section>
      </main>

      <footer className="footer">
        <span>桌遊規則助手</span>
        <span>讓每一場遊戲，都玩得更盡興。</span>
      </footer>

      {selectedGame && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedGame(null)}
        >
          <section
            className="game-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              aria-label="關閉"
              onClick={() => setSelectedGame(null)}
            >
              ×
            </button>
            <div className="modal-game-bggScore">
              {selectedGame.bggScore}
            </div>

            <p className="eyebrow">BGG SCORE</p>
            <h2 id="modal-title">{selectedGame.name}</h2>

            <div className="rating-list">
              <div className="rating-item">
                <span className="rating-label">喜歡度</span>
                <span>
                  {'❤️'.repeat(
                    rankingToEmojiCount(selectedGame.rankingEngine, 50, 75) ?? 0,
                  )}
                </span>
              </div>

              <div className="rating-item">
                <span className="rating-label">變化度</span>
                <span>
                  {'🎆'.repeat(
                    rankingToEmojiCount(selectedGame.changeRanking, 42, 70) ?? 0,
                  )}
                </span>
              </div>

              <div className="rating-item">
                <span className="rating-label">溝通度</span>
                <span>
                  {'🗣️'.repeat(
                    rankingToEmojiCount(selectedGame.communicationRanking, 42, 70) ?? 0,
                  )}
                </span>
              </div>

              <div className="rating-item">
                <span className="rating-label">影響度</span>
                <span>
                  {'🔥'.repeat(
                    rankingToEmojiCount(selectedGame.playerImpactRanking, 42, 70) ?? 0,
                  )}
                </span>
              </div>

              <div className="rating-item">
                <span className="rating-label">獨特性</span>
                <span>
                  {'🐶'.repeat(
                    rankingToEmojiCount(selectedGame.uniqueRanking, 42, 70) ?? 0,
                  )}
                </span>
              </div>

              <div className="rating-item">
                <span className="rating-label">複雜度</span>
                <span>
                  {'🧠'.repeat(
                    complexityToEmojiCount(selectedGame.bggDifficulty),
                  )}
                </span>
              </div>
            </div>

            <div className="notice">
              <strong>規則查詢功能開發中</strong>
              <p>
                目前這是介面展示。下一階段我們會加入規則書匯入與搜尋，
                讓你能查到實際規則和對應頁碼。
              </p>
            </div>
            <button
              className="rule-button"
              type="button"
              onClick={() => setSelectedGame(null)}
            >
              知道了
            </button>
          </section>
        </div>
      )}
    </div>
  )
}
export default App
