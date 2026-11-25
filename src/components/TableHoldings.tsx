import { useMemo, useState } from 'react'
import {
  KAMI_CARDS,
  KIND_LABEL,
  SEASON_CARDS,
  SEASON_CARD_SETS,
  SEASON_LABEL,
  type SeasonCardKind,
  type SeasonKey,
} from '../data/component/risingSunCards'
import { type GameTableData } from '../lib/gameTable'
import '../styles/table-holdings.css'

// 旭日「持有」分頁（4a：只存這支手機；資料在 table.holdings＝{玩家id:{卡id:張數}}、table.holdSets＝這桌用到的組別）
// 同桌所有人都看得到彼此持有的卡，點卡名看中文效果（效果為自譯、待核對）。

type Kind = SeasonCardKind | 'kami'
type Item = {
  id: string
  set: string
  kind: Kind
  season: SeasonKey | null
  name: string
  cost: number | null
  max: number
  lines: string[]
}

const KIND_TEXT: Record<Kind, string> = { ...KIND_LABEL, kami: '神靈' }
const KIND_ORDER: Kind[] = ['virtue', 'enhancement', 'warUpgrade', 'winterUpgrade', 'monster', 'kami']

const ALL_ITEMS: Item[] = [
  ...SEASON_CARDS.map((c): Item => ({
    id: c.id,
    set: c.set,
    kind: c.kind,
    season: c.season,
    name: c.nameZh || c.nameEn,
    cost: c.cost,
    max: Math.max(1, c.copies),
    lines: [c.timing ? `時機：${c.timing}` : '', c.effectZh].filter(Boolean),
  })),
  ...KAMI_CARDS.map((k): Item => ({
    id: k.id,
    set: 'mountain',
    kind: 'kami',
    season: null,
    name: k.nameZh || k.nameEn,
    cost: null,
    max: 1,
    lines: [k.title, `神殿：${k.shrineZh}`, `神靈：${k.kamiZh}`],
  })),
]
const ITEM_BY_ID = new Map(ALL_ITEMS.map((i) => [i.id, i]))
const SET_KEYS = Object.keys(SEASON_CARD_SETS)

type Update = (fn: (t: GameTableData) => GameTableData) => void

export default function TableHoldings({ table, update }: { table: GameTableData; update: Update }) {
  const [view, setView] = useState<'edit' | 'stats'>('edit')
  const [pid, setPid] = useState<string>(table.players[0]?.id ?? '')
  const [showSets, setShowSets] = useState(false)
  const [seasonF, setSeasonF] = useState<'all' | SeasonKey>('all')
  const [kindF, setKindF] = useState<'all' | Kind>('all')
  const [openId, setOpenId] = useState<string | null>(null)

  const sets = table.holdSets.length > 0 ? table.holdSets : ['core']
  const holdings = table.holdings

  const visible = useMemo(
    () =>
      ALL_ITEMS.filter(
        (i) =>
          sets.includes(i.set) &&
          (seasonF === 'all' || i.season === seasonF) &&
          (kindF === 'all' || i.kind === kindF),
      ),
    [sets, seasonF, kindF],
  )

  const player = table.players.find((p) => p.id === pid) ?? table.players[0]

  function toggleSet(key: string) {
    if (key === 'core') return
    update((t) => {
      const cur = t.holdSets.length > 0 ? t.holdSets : ['core']
      return { ...t, holdSets: cur.includes(key) ? cur.filter((x) => x !== key) : [...cur, key] }
    })
  }

  function setCount(playerId: string, item: Item, n: number) {
    const v = Math.max(0, Math.min(item.max, Math.round(n)))
    update((t) => {
      const mine = { ...(t.holdings[playerId] ?? {}) }
      if (v === 0) delete mine[item.id]
      else mine[item.id] = v
      return { ...t, holdings: { ...t.holdings, [playerId]: mine } }
    })
  }

  function countOf(playerId: string, id: string): number {
    return holdings[playerId]?.[id] ?? 0
  }

  function Detail({ item }: { item: Item }) {
    return (
      <div className="gth-detail">
        {item.lines.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
        {item.kind !== 'kami' && <small>中文效果是自譯摘要，【待核對】，請以實體卡為準。</small>}
      </div>
    )
  }

  function meta(item: Item): string {
    const parts: string[] = [KIND_TEXT[item.kind]]
    if (item.season) parts.push(SEASON_LABEL[item.season])
    if (item.cost !== null) parts.push(`費用 ${item.cost}`)
    return parts.join('・')
  }

  const kindsPresent = KIND_ORDER.filter((k) => ALL_ITEMS.some((i) => sets.includes(i.set) && i.kind === k))

  return (
    <div className="gth">
      <div className="gtb-chips">
        <button type="button" className={view === 'edit' ? 'on' : ''} onClick={() => setView('edit')}>
          記錄持有
        </button>
        <button type="button" className={view === 'stats' ? 'on' : ''} onClick={() => setView('stats')}>
          全桌統計
        </button>
        <button type="button" className={showSets ? 'on' : ''} onClick={() => setShowSets((v) => !v)}>
          這局用的組別
        </button>
      </div>

      {showSets && (
        <div className="gtb-card">
          <p className="gtb-sub">勾選這局有用到的牌組（核心盒必選；神靈在「山組」）</p>
          <div className="gtb-chips">
            {SET_KEYS.map((k) => (
              <button
                key={k}
                type="button"
                className={sets.includes(k) ? 'on' : ''}
                disabled={k === 'core'}
                onClick={() => toggleSet(k)}
              >
                {sets.includes(k) ? '✓ ' : ''}
                {SEASON_CARD_SETS[k]}
              </button>
            ))}
          </div>
        </div>
      )}

      {view === 'edit' && (
        <>
          <p className="gtb-sub">選擇玩家</p>
          <div className="gtb-chips">
            {table.players.map((p) => {
              const total = Object.values(holdings[p.id] ?? {}).reduce((s, n) => s + n, 0)
              return (
                <button key={p.id} type="button" className={p.id === player?.id ? 'on' : ''} onClick={() => setPid(p.id)}>
                  {p.name}（{total}）
                </button>
              )
            })}
          </div>

          <p className="gtb-sub">篩選</p>
          <div className="gtb-chips">
            {(['all', 's', 'm', 'a'] as const).map((s) => (
              <button key={s} type="button" className={seasonF === s ? 'on' : ''} onClick={() => setSeasonF(s)}>
                {s === 'all' ? '全部季節' : SEASON_LABEL[s]}
              </button>
            ))}
          </div>
          <div className="gtb-chips">
            <button type="button" className={kindF === 'all' ? 'on' : ''} onClick={() => setKindF('all')}>
              全部類型
            </button>
            {kindsPresent.map((k) => (
              <button key={k} type="button" className={kindF === k ? 'on' : ''} onClick={() => setKindF(k)}>
                {KIND_TEXT[k]}
              </button>
            ))}
          </div>

          {player && (
            <ul className="gth-list">
              {visible.length === 0 && <li className="gtb-muted">這個篩選沒有卡。</li>}
              {visible.map((item) => {
                const n = countOf(player.id, item.id)
                const open = openId === item.id
                return (
                  <li key={item.id} className={n > 0 ? 'has' : ''}>
                    <div className="gth-row">
                      <button type="button" className="gth-name" aria-expanded={open} onClick={() => setOpenId(open ? null : item.id)}>
                        <b>{item.name}</b>
                        <small>
                          {meta(item)}
                          {item.set !== 'core' && item.kind !== 'kami' ? `・${SEASON_CARD_SETS[item.set]}` : ''}
                        </small>
                      </button>
                      <button type="button" className="gtb-sq" aria-label={`${item.name} 減 1`} disabled={n <= 0} onClick={() => setCount(player.id, item, n - 1)}>
                        －
                      </button>
                      <span className="gth-n">{n}</span>
                      <button type="button" className="gtb-sq" aria-label={`${item.name} 加 1`} disabled={n >= item.max} onClick={() => setCount(player.id, item, n + 1)}>
                        ＋
                      </button>
                    </div>
                    {open && <Detail item={item} />}
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}

      {view === 'stats' && (
        <>
          <p className="gtb-sub">每位玩家持有（點卡名看效果）</p>
          {table.players.map((p) => {
            const mine = Object.entries(holdings[p.id] ?? {})
              .map(([id, n]) => ({ item: ITEM_BY_ID.get(id), n }))
              .filter((x): x is { item: Item; n: number } => !!x.item && x.n > 0)
              .sort((a, b) => KIND_ORDER.indexOf(a.item.kind) - KIND_ORDER.indexOf(b.item.kind))
            const sum = KIND_ORDER.map((k) => ({
              k,
              n: mine.filter((x) => x.item.kind === k).reduce((s, x) => s + x.n, 0),
            })).filter((x) => x.n > 0)
            return (
              <div key={p.id} className="gtb-card">
                <b>{p.name}</b>
                {mine.length === 0 ? (
                  <p className="gtb-muted">還沒有記錄任何卡。</p>
                ) : (
                  <>
                    <p className="gth-sum">{sum.map((x) => `${KIND_TEXT[x.k]} ${x.n}`).join('・')}</p>
                    <div className="gtb-chips">
                      {mine.map(({ item, n }) => (
                        <button key={item.id} type="button" className={openId === item.id ? 'on' : ''} onClick={() => setOpenId(openId === item.id ? null : item.id)}>
                          {item.name}
                          {n > 1 ? `×${n}` : ''}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          })}
          {openId && ITEM_BY_ID.get(openId) && (
            <div className="gtb-card">
              <b>{ITEM_BY_ID.get(openId)!.name}</b>
              <Detail item={ITEM_BY_ID.get(openId)!} />
            </div>
          )}

          <p className="gtb-sub">每張卡由誰持有</p>
          <ul className="gth-list">
            {ALL_ITEMS.filter((i) =>
              table.players.some((p) => countOf(p.id, i.id) > 0),
            ).map((item) => (
              <li key={item.id} className="has">
                <div className="gth-row">
                  <div className="gth-name">
                    <b>{item.name}</b>
                    <small>
                      {table.players
                        .filter((p) => countOf(p.id, item.id) > 0)
                        .map((p) => `${p.name}${countOf(p.id, item.id) > 1 ? `×${countOf(p.id, item.id)}` : ''}`)
                        .join('、')}
                    </small>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
