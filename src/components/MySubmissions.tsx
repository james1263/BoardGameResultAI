import { useEffect, useMemo, useState } from 'react'
import { askConfirm } from '../lib/askConfirm'
import {
  deleteMySubmission,
  submitRuleSubmission,
  SUB_LIMITS,
  useMySubmissions,
  type MySubmission,
  type SubKind,
  type SubStatus,
} from '../lib/useRuleSubmissions'
import GameErrata from './GameErrata'
import '../styles/errata.css'
import '../styles/my-submissions-dark.css'

type Tab = 'errata' | 'link' | 'glossary' | 'ai'
type GameLite = { name: string; bggName: string; referenceOnly?: boolean }

const STATUS_TEXT: Record<SubStatus, string> = {
  pending: '審核中',
  approved: '已核准',
  rejected: '已退回',
}

function GamePick({
  games,
  value,
  onChange,
}: {
  games: GameLite[]
  value: string
  onChange: (bggName: string) => void
}) {
  const [text, setText] = useState('')
  const picked = games.find((g) => g.bggName === value)
  const candidates = useMemo(() => {
    const t = text.trim().toLocaleLowerCase()
    if (!t) return []
    return games
      .filter((g) => !g.referenceOnly)
      .filter((g) => g.name.toLocaleLowerCase().includes(t) || g.bggName.toLocaleLowerCase().includes(t))
      .slice(0, 6)
  }, [games, text])
  return (
    <div>
      {picked ? (
        <p className="er-note">
          遊戲：《{picked.name}》
          <button type="button" className="admin-link" style={{ marginLeft: 10 }} onClick={() => onChange('')}>
            換一款
          </button>
        </p>
      ) : (
        <>
          <input
            className="ra-search"
            type="search"
            placeholder="搜尋遊戲名稱"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {candidates.length > 0 && (
            <ul className="ra-game-list">
              {candidates.map((g) => (
                <li key={g.bggName}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(g.bggName)
                      setText('')
                    }}
                  >
                    {g.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}

// 依影片標題猜遊戲：標題含遊戲中文名或英文名（取最長的一個；同長度有兩款以上就不猜）
function guessGameFromTitle(title: string, games: GameLite[]): GameLite | null {
  const norm = (t: string) => t.toLocaleLowerCase().replace(/[\s\p{P}\p{S}]/gu, '')
  const hay = norm(title)
  let best: GameLite | null = null
  let bestLen = 0
  let tie = false
  for (const g of games) {
    if (g.referenceOnly) continue
    for (const raw of [g.name, g.bggName]) {
      const n = norm(raw || '')
      const ascii = /^[\x00-\x7f]*$/.test(n)
      if (n.length < (ascii ? 4 : 2) || !hay.includes(n)) continue
      if (n.length > bestLen) {
        best = g
        bestLen = n.length
        tie = false
      } else if (n.length === bestLen && best && best.bggName !== g.bggName) {
        tie = true
      }
    }
  }
  return tie ? null : best
}

function SubPanel({
  kind,
  games,
  rows,
  onChanged,
}: {
  kind: SubKind
  games: GameLite[]
  rows: MySubmission[]
  onChanged: () => void
}) {
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [bgg, setBgg] = useState('')
  const [title, setTitle] = useState('')
  const [value, setValue] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const isLink = kind === 'link'
  const mine = rows.filter((r) => r.kind === kind)
  const [titleHint, setTitleHint] = useState('')

  // 規則連結：標題（自動帶入或自己打）含遊戲名稱時，自動選遊戲（已經選了就不動）
  useEffect(() => {
    if (!isLink || !open || bgg) return
    const guessed = guessGameFromTitle(title, games)
    if (guessed) setBgg(guessed.bggName)
    // 只在標題變動時判斷；按「換一款」之後不會又被自動選回來
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title])

  // 規則連結：貼 YouTube 網址時自動帶入影片標題（只在標題還是空的時候帶入）
  useEffect(() => {
    if (!isLink || !open) {
      setTitleHint('')
      return
    }
    const url = value.trim()
    if (/bilibili\.com|b23\.tv/i.test(url)) {
      setTitleHint('Bilibili 不開放自動抓標題，請自己填。')
      return
    }
    if (!/^https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//i.test(url) || title.trim() !== '') {
      setTitleHint('')
      return
    }
    let cancelled = false
    setTitleHint('讀取影片標題中…')
    const timer = window.setTimeout(() => {
      fetch('https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent(url))
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          if (cancelled) return
          const name = typeof j?.title === 'string' ? j.title.trim() : ''
          if (name) {
            setTitle((cur) => (cur.trim() === '' ? name.slice(0, SUB_LIMITS.linkTitle) : cur))
            // 還沒選遊戲才自動選；已經選了就不動
            const guessed = guessGameFromTitle(name, games)
            if (guessed) setBgg((cur) => (cur ? cur : guessed.bggName))
            setTitleHint(
              guessed
                ? `已自動帶入影片標題，並選擇遊戲《${guessed.name}》，不對請按「換一款」。`
                : '已自動帶入影片標題，可修改。請自己選擇遊戲。',
            )
          } else {
            setTitleHint('抓不到標題，請自己填。')
          }
        })
        .catch(() => {
          if (!cancelled) setTitleHint('抓不到標題，請自己填。')
        })
    }, 500)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
    // 只在網址或開關變動時判斷；標題由使用者自己改不會重抓
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLink, open, value])

  function reset() {
    setEditId(null)
    setBgg('')
    setTitle('')
    setValue('')
    setNote('')
    setError('')
  }

  function startEdit(r: MySubmission) {
    setEditId(r.id)
    setBgg(r.bgg_name)
    setTitle(r.title)
    setValue(r.value)
    setNote(r.note)
    setError('')
    setMessage('')
    setOpen(true)
  }

  async function send() {
    setError('')
    if (!bgg) {
      setError('請先選擇遊戲。')
      return
    }
    setBusy(true)
    const result = await submitRuleSubmission({
      id: editId,
      kind,
      bggName: bgg,
      title: title.trim(),
      value: value.trim(),
      note: note.trim(),
    })
    setBusy(false)
    if (result) {
      setError(result)
      return
    }
    setMessage('已送出，管理者審核通過後才會採用。')
    reset()
    setOpen(false)
    onChanged()
  }

  async function remove(r: MySubmission) {
    if (!(await askConfirm('確定要刪除這筆投稿嗎？無法復原。'))) return
    const result = await deleteMySubmission(r.id)
    setMessage(result ?? '已刪除。')
    onChanged()
  }

  return (
    <div className="er-board">
      <p className="er-note">
        {isLink
          ? '分享對這款遊戲有幫助的規則網頁、教學影片。管理者審核通過才會出現在遊戲的規則連結裡，公開時不顯示你的名字。'
          : '協助整理規則書用語：例如「福祿壽」對應「Fukurokuju」，或規則書用的中文同義詞。審核通過後會加進搜尋詞庫。'}
      </p>
      {message && <p className="er-note">{message}</p>}
      {!open && (
        <button
          type="button"
          className="ma-btn"
          style={{ width: '100%', padding: '12px', margin: '4px 0 12px' }}
          onClick={() => {
            reset()
            setMessage('')
            setOpen(true)
          }}
        >
          {isLink ? '＋ 投稿規則連結／影片' : '＋ 投稿詞庫'}
        </button>
      )}
      {open && (
        <div className="er-form">
          {(() => {
            const gameBlock = <GamePick games={games} value={bgg} onChange={setBgg} />
            const titleBlock = (
              <label className="admin-field">
                <span>
                  {isLink ? '影片標題' : '中文詞'}（{title.length}/{isLink ? SUB_LIMITS.linkTitle : SUB_LIMITS.zh}）
                </span>
                <input
                  type="text"
                  value={title}
                  maxLength={isLink ? SUB_LIMITS.linkTitle : SUB_LIMITS.zh}
                  placeholder={isLink ? '貼上 YouTube 網址會自動帶入；也可以自己填' : '例如：福祿壽'}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
            )
            const urlBlock = (
              <label className="admin-field">
                <span>
                  {isLink ? '網址' : '對應詞（英文，或規則書用的中文同義詞）'}（{value.length}/
                  {isLink ? SUB_LIMITS.url : SUB_LIMITS.en}）
                </span>
                <input
                  type="text"
                  value={value}
                  maxLength={isLink ? SUB_LIMITS.url : SUB_LIMITS.en}
                  placeholder={isLink ? 'https://…' : '例如：Fukurokuju'}
                  onChange={(e) => setValue(e.target.value)}
                />
              </label>
            )
            // 規則連結：網址 → 影片標題 → 遊戲（貼網址後標題與遊戲會自動帶入）；詞庫維持原順序
            return isLink ? (
              <>
                {urlBlock}
                {titleHint && <p className="er-note">{titleHint}</p>}
                {titleBlock}
                {gameBlock}
              </>
            ) : (
              <>
                {gameBlock}
                {titleBlock}
                {urlBlock}
              </>
            )
          })()}
          <label className="admin-field">
            <span>備註（選填，{note.length}/{SUB_LIMITS.note}）</span>
            <input type="text" value={note} maxLength={SUB_LIMITS.note} onChange={(e) => setNote(e.target.value)} />
          </label>
          {error && <p className="admin-error">{error}</p>}
          <div className="rb-actions">
            <button type="button" className="ma-btn" disabled={busy} onClick={() => void send()}>
              {busy ? '送出中…' : editId ? '送出修改' : '送出投稿'}
            </button>
            <button
              type="button"
              className="admin-link"
              onClick={() => {
                reset()
                setOpen(false)
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}

      <h4 className="er-list-title">我的投稿（{mine.length}）</h4>
      {mine.length === 0 && <p className="er-note">還沒有投稿。</p>}
      <ul className="er-list">
        {mine.map((r) => (
          <li key={r.id}>
            <div className="er-title">
              《{r.game_name}》{isLink ? r.title : `${r.title} → ${r.value}`}
              <small className="er-src"> ・{STATUS_TEXT[r.status]}</small>
            </div>
            {isLink && <p className="er-body">{r.value}</p>}
            {r.status === 'rejected' && r.reject_reason && (
              <small className="er-src">退回原因：{r.reject_reason}</small>
            )}
            {r.status !== 'approved' && (
              <div className="rb-actions">
                <button type="button" className="admin-link" onClick={() => startEdit(r)}>
                  {r.status === 'rejected' ? '修改後重新送審' : '修改'}
                </button>
                <button type="button" className="admin-link" onClick={() => void remove(r)}>
                  刪除
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

// 俱樂部「我的投稿」：玩錯紀錄、規則連結／影片、詞庫；AI 回答投稿導到規則助手
export default function MySubmissions({
  boardGames,
  onBack,
  onClose,
  onOpenRules,
}: {
  boardGames: GameLite[]
  onBack: () => void
  onClose: () => void
  onOpenRules?: () => void
}) {
  const [tab, setTab] = useState<Tab>('errata')
  const [errataGame, setErrataGame] = useState('')
  const [errataOpen, setErrataOpen] = useState(false)
  // 按了「投稿」或點進某筆已投稿的遊戲，就進入選遊戲／填寫畫面
  const showErrataForm = errataOpen || errataGame !== ''
  const { subs, errata, loading, error, reload } = useMySubmissions(true)
  const pendingOf = (kind: SubKind) => subs.filter((s) => s.kind === kind && s.status === 'pending').length
  const pendingErrata = errata.filter((e) => e.status === 'pending').length

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: 'errata', label: '玩錯紀錄', badge: pendingErrata },
    { key: 'link', label: '規則連結', badge: pendingOf('link') },
    { key: 'glossary', label: '詞庫', badge: pendingOf('glossary') },
    { key: 'ai', label: 'AI 回答' },
  ]

  return (
    <>
      <div className="mylist-backdrop" onClick={onClose} />
      <aside className="mylist-drawer" role="dialog" aria-label="我的投稿">
        <div className="mylist-header">
          <h2>我的投稿</h2>
          <button className="mylist-close" type="button" aria-label="關閉" onClick={onBack}>
            ×
          </button>
        </div>
        <div className="lb-tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`lb-tab ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {t.badge ? `（${t.badge}）` : ''}
            </button>
          ))}
        </div>
        <div className="mylist-body">
          {loading && <p className="er-note">載入中…</p>}
          {error && <p className="admin-error">{error}</p>}

          {tab === 'errata' && (
            <div className="er-board">
              <p className="er-note">
                投稿經管理者審核才會公開（在「規則助手」可以看到），公開時不顯示你的名字。
              </p>
              {!showErrataForm && (
                <button
                  type="button"
                  className="ma-btn"
                  style={{ width: '100%', padding: '12px', margin: '4px 0 12px' }}
                  onClick={() => setErrataOpen(true)}
                >
                  ＋ 投稿玩錯紀錄
                </button>
              )}
              {showErrataForm && <GamePick games={boardGames} value={errataGame} onChange={setErrataGame} />}
              {errataGame && <GameErrata key={errataGame} bggName={errataGame} isAdmin={false} defaultOpen bigSubmit />}
              {!showErrataForm && (
                <>
                  <h4 className="er-list-title">我的玩錯紀錄投稿（{errata.length}）</h4>
                  {errata.length === 0 && <p className="er-note">還沒有投稿。</p>}
                  <ul className="er-list">
                    {errata.map((e) => (
                      <li key={e.id}>
                        <div className="er-title">
                          《
                          <button type="button" className="admin-link" onClick={() => setErrataGame(e.bgg_name)}>
                            {e.game_name}
                          </button>
                          》{e.title}
                          <small className="er-src"> ・{STATUS_TEXT[e.status]}</small>
                        </div>
                        {e.status === 'rejected' && e.reject_reason && (
                          <small className="er-src">退回原因：{e.reject_reason}（點遊戲名稱可修改）</small>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {showErrataForm && (
                <button
                  type="button"
                  className="admin-link"
                  onClick={() => {
                    setErrataGame('')
                    setErrataOpen(false)
                    void reload()
                  }}
                >
                  ← 回我的投稿清單
                </button>
              )}
            </div>
          )}

          {tab === 'link' && <SubPanel kind="link" games={boardGames} rows={subs} onChanged={() => void reload()} />}
          {tab === 'glossary' && (
            <SubPanel kind="glossary" games={boardGames} rows={subs} onChanged={() => void reload()} />
          )}

          {tab === 'ai' && (
            <div className="er-board">
              <h4 className="er-list-title">讓好的 AI 回答，成為大家都能參考的知識</h4>
              <p className="er-note">
                AI 回答投稿由「規則助手」統一處理，因為要先在那裡提問、取得規則書片段。
              </p>
              <ol className="er-note" style={{ paddingLeft: 20 }}>
                <li>到規則助手搜尋遊戲並提問，按「複製給我的 AI」。</li>
                <li>把內容貼給你自己的 AI，覺得回答正確、有參考價值。</li>
                <li>把 AI 回覆最後的「回饋區塊」貼回規則助手，送出。</li>
                <li>管理者回規則書核對後才會公開，標示為玩家整理的 AI 回答。</li>
              </ol>
              {onOpenRules && (
                <button
                  type="button"
                  className="ma-btn"
                  style={{ width: '100%', padding: '12px' }}
                  onClick={onOpenRules}
                >
                  前往規則助手
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
