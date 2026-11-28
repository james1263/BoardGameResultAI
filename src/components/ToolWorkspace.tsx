import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import ScoreSheetTool, { PlayView } from './ScoreSheetTool'
import DiceTool, { clampInt, loadDice } from './DiceTool'
import DiceEditor from './DiceEditor'
import LadderTool, { LadderIcon } from './LadderTool'
import PlayersSetup from './PlayersSetup'
import { HelpBlock, HelpNote, HelpScope, type HelpApi } from './HelpNote'
import { clearResourceSnapshot, type SheetTemplate } from '../lib/scoreSheet'
import { diceSummaryText, faceTotal, newDiceGroup, type DiceGroup } from '../lib/gameTable'
import {
  WS_INFO,
  WS_KINDS,
  defaultNames,
  newToolId,
  type DiceConfig,
  type WsKind,
} from '../lib/toolWorkspace'
import '../styles/game-table.css'
import '../styles/tool-workspace.css'

// 小工具工作區：進來先設定工具、按「下一步」才進工作畫面；工作畫面用分頁放所有已加入的工具。
// 右上「＋」＝再加一個工具（先設定、按下一步才加進來，已有的數字不動）；每個工具都可以移除（按兩次確認）。
// 玩家名單共用：第一個需要玩家的工具設定一次，後面的工具沿用。

const MAX_DICE_COUNT = 10

type Tool = {
  id: string
  kind: WsKind
  tpl: SheetTemplate | null
  dice: DiceConfig | null
}

function ToolPlusIcon() {
  return (
    <svg
      width="1.2em"
      height="1.2em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  )
}

function KindIcon({ kind }: { kind: WsKind }) {
  return kind === 'ladder' ? <LadderIcon /> : <span aria-hidden="true">{WS_INFO[kind].icon}</span>
}

/* ───────────── 擲骰設定頁 ───────────── */

function DiceSetup({ onNext }: { onNext: (cfg: DiceConfig) => void }) {
  const saved = loadDice()
  const [count, setCount] = useState(saved.count)
  const [sides, setSides] = useState(saved.sides)
  const [needCustom, setNeedCustom] = useState(false)
  const [group, setGroup] = useState<DiceGroup | null>(null)
  const [editing, setEditing] = useState(false)
  const savedOnce = useRef(false)

  function toggleCustom(on: boolean) {
    setNeedCustom(on)
    if (on && !group) {
      setGroup(newDiceGroup())
      setEditing(true)
    } else if (!on) {
      setEditing(false)
    }
  }

  const ready = !needCustom || (group !== null && !editing)

  return (
    <div className="tw-setup-body">
      <HelpNote text="一般骰：選顆數與面數。勾選「需要自訂骰面」：用骰子編輯器設定每個面的符號或文字（可重複）。" />
      <label className="gt-check">
        <input type="checkbox" checked={needCustom} onChange={(event) => toggleCustom(event.target.checked)} />
        需要自訂骰面（例如圖案骰、特殊面骰）
      </label>

      {!needCustom && (
        <div className="gt-settings">
          <span className="gt-field">
            <span>顆數</span>
            <select
              className="gt-input"
              value={count}
              onChange={(event) => setCount(clampInt(Number(event.target.value), 1, MAX_DICE_COUNT, 2))}
            >
              {Array.from({ length: MAX_DICE_COUNT }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} 顆
                </option>
              ))}
            </select>
          </span>
          <span className="gt-field">
            <span>面數</span>
            <select
              className="gt-input"
              value={sides}
              onChange={(event) => setSides(Number(event.target.value))}
            >
              {Array.from({ length: 18 }, (_, i) => i + 3).map((n) => (
                <option key={n} value={n}>
                  d{n}
                </option>
              ))}
            </select>
          </span>
        </div>
      )}

      {needCustom && group && editing && (
        <div className="gtb-root gtb-root tw-dice-editor">
          <DiceEditor
            initial={group}
            onSave={(g) => {
              savedOnce.current = true
              setGroup(g)
              setEditing(false)
            }}
            onCancel={() => {
              // 還沒存過就取消自訂；已存過就維持原本的
              if (!savedOnce.current) {
                setGroup(null)
                setNeedCustom(false)
              }
              setEditing(false)
            }}
          />
        </div>
      )}

      {needCustom && group && !editing && (
        <div className="tw-note">
          <p>
            自訂骰：{group.name || '（未命名）'}，{group.count} 顆
          </p>
          <p className="gt-hint">骰面：{diceSummaryText(group)}</p>
          <button type="button" className="gt-secondary" onClick={() => setEditing(true)}>
            重新編輯骰面
          </button>
        </div>
      )}

      <div className="gt-actions">
        <button
          type="button"
          className="gt-primary"
          disabled={!ready}
          onClick={() =>
            onNext(
              needCustom && group
                ? { count: group.count, sides: faceTotal(group.faces), group }
                : { count, sides, group: null },
            )
          }
        >
          下一步
        </button>
      </div>
    </div>
  )
}

/* ───────────── 工作區 ───────────── */

export default function ToolWorkspace({
  initialKind,
  onExitToGrid,
}: {
  initialKind: WsKind
  onExitToGrid: () => void
}) {
  const [tools, setTools] = useState<Tool[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [players, setPlayers] = useState<string[]>(() => defaultNames(4))
  const [playersConfirmed, setPlayersConfirmed] = useState(false)
  const [playersOpen, setPlayersOpen] = useState(false)
  // 設定中的工具（排隊）：第一個就是目前的設定頁；空的就是工作畫面
  const [queue, setQueue] = useState<WsKind[]>([initialKind])
  const [stepDone, setStepDone] = useState(0)
  const [stepTotal, setStepTotal] = useState(1)
  const [history, setHistory] = useState<string[]>([])
  const [plusMenu, setPlusMenu] = useState<{ left: number; top: number } | null>(null)
  const [confirm, setConfirm] = useState<'del' | 'exit' | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [helpOpen, setHelpOpen] = useState(false)
  const plusRef = useRef<HTMLButtonElement>(null)
  const confirmTimer = useRef<number | null>(null)

  // 說明文字：各元件用 <HelpNote> 登記，集中顯示在標題旁「！」
  const helpApi = useMemo<HelpApi>(
    () => ({
      set: (id, text) =>
        setNotes((cur) => {
          if (text === null) {
            if (!(id in cur)) return cur
            const next = { ...cur }
            delete next[id]
            return next
          }
          return cur[id] === text ? cur : { ...cur, [id]: text }
        }),
    }),
    [],
  )
  const noteList = Object.values(notes)

  const setup = queue.length > 0
  const kind = queue[0]

  useEffect(
    () => () => {
      if (confirmTimer.current !== null) window.clearTimeout(confirmTimer.current)
      clearResourceSnapshot()
    },
    [],
  )

  function armConfirm(what: 'del' | 'exit') {
    setConfirm(what)
    if (confirmTimer.current !== null) window.clearTimeout(confirmTimer.current)
    confirmTimer.current = window.setTimeout(() => setConfirm(null), 3000)
  }

  function record(text: string) {
    setHistory((cur) => [text, ...cur].slice(0, 5))
  }

  function finish(tool: Omit<Tool, 'id'>) {
    const id = newToolId()
    setTools((cur) => [...cur, { ...tool, id }])
    setActiveId(id)
    setQueue(queue.slice(1))
    if (queue.length <= 1) {
      setStepDone(0)
      setStepTotal(1)
    } else {
      setStepDone(stepDone + 1)
    }
  }

  function cancelSetup() {
    setQueue([])
    setStepDone(0)
    setStepTotal(1)
    if (tools.length === 0) onExitToGrid()
  }

  function removeTool(id: string) {
    const target = tools.find((t) => t.id === id)
    const rest = tools.filter((t) => t.id !== id)
    // 移除資源計數器：計分表連動的列會變成「資源已不存在」，改手動輸入
    if (target?.kind === 'resource') clearResourceSnapshot()
    setConfirm(null)
    if (rest.length === 0) {
      setTools([])
      onExitToGrid()
      return
    }
    setTools(rest)
    if (activeId === id) setActiveId(rest[0].id)
  }

  function handleX() {
    if (setup) {
      cancelSetup()
      return
    }
    if (tools.length === 0) {
      onExitToGrid()
      return
    }
    if (confirm === 'exit') {
      onExitToGrid()
      return
    }
    armConfirm('exit')
  }

  // 可以加的工具：還沒加過、也沒排隊的
  const addable = WS_KINDS.filter((k) => !tools.some((t) => t.kind === k) && !queue.includes(k))

  function togglePlusMenu() {
    if (plusMenu) {
      setPlusMenu(null)
      return
    }
    const rect = plusRef.current?.getBoundingClientRect()
    if (!rect) return
    const width = 168
    const left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8))
    setPlusMenu({ left, top: rect.bottom + 6 })
  }

  function addKind(k: WsKind) {
    setPlusMenu(null)
    setQueue((cur) => [...cur, k])
    if (setup) setStepTotal((n) => n + 1)
    else {
      setStepDone(0)
      setStepTotal(1)
    }
  }

  const title: ReactNode = setup ? (
    <>
      <KindIcon kind={kind} /> {WS_INFO[kind].name}
      {stepTotal > 1 ? `（第 ${stepDone + 1}／${stepTotal} 步）` : '（設定）'}
    </>
  ) : (
    '🧰 小工具'
  )

  const needsPlayersPage = setup && WS_INFO[kind].needsPlayers && (!playersConfirmed || kind === 'ladder')
  const hasPlayerTool = tools.some((t) => WS_INFO[t.kind].needsPlayers)
  // 連續設定時，最後一頁顯示「開始」
  const nextLabel = queue.length === 1 && stepTotal > 1 ? '開始' : '下一步'

  function renderSetup() {
    if (!setup) return null
    if (needsPlayersPage) {
      return (
        <div className="tw-setup-body">
          <HelpNote
            text={kind === 'ladder' ? '爬梯子用這份玩家名單。' : '先設定玩家，之後加入的工具都沿用這份名單。'}
          />
          <PlayersSetup names={players} onChange={setPlayers} />
          <div className="gt-actions">
            <button
              type="button"
              className="gt-primary"
              onClick={() => {
                setPlayersConfirmed(true)
                if (kind === 'ladder') finish({ kind, tpl: null, dice: null })
              }}
            >
              {nextLabel}
            </button>
          </div>
        </div>
      )
    }
    if (kind === 'resource' || kind === 'score') {
      return (
        <ScoreSheetTool
          key={kind}
          tool={kind}
          pickLabel={nextLabel}
          onPick={(tpl) => finish({ kind, tpl, dice: null })}
          onExit={cancelSetup}
        />
      )
    }
    if (kind === 'dice') {
      return <DiceSetup key="dice" onNext={(cfg) => finish({ kind, tpl: null, dice: cfg })} />
    }
    return null
  }

  const activeTool = tools.find((t) => t.id === activeId) ?? null

  return (
    <>
      <div className="gt-head">
        <span className="gt-title">
          {title}
          {noteList.length > 0 && (
            <button
              type="button"
              className={`tw-info${helpOpen ? ' on' : ''}`}
              aria-label="說明"
              aria-expanded={helpOpen}
              onClick={() => setHelpOpen((v) => !v)}
            >
              !
            </button>
          )}
        </span>
        <span className="gt-head-actions">
          {addable.length > 0 && (
            <button
              ref={plusRef}
              type="button"
              className="gt-plus"
              aria-label="加入其他工具"
              aria-expanded={plusMenu !== null}
              title="加入其他工具"
              onClick={togglePlusMenu}
            >
              <ToolPlusIcon />
            </button>
          )}
          <button
            type="button"
            className="gt-close"
            aria-label={setup ? '取消設定' : '回到小工具'}
            onClick={handleX}
          >
            ×
          </button>
        </span>
      </div>

      <div className="gt-body gt-body-sheet tw-body">
        <div className="tw-root">
          {helpOpen && noteList.length > 0 && (
            <div className="tw-help-panel" role="note">
              {noteList.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </div>
          )}
          {setup && (
            <HelpScope api={helpApi}>
              <div className="tw-setup">
                {tools.length > 0 && (
                  <div className="tw-setup-tip">
                    <HelpNote text="要先設定好這個工具，按「下一步」才會加進來；已經填好的數字不會變。" />
                    <button type="button" className="ss-link" onClick={cancelSetup}>
                      ‹ 取消，回到工作畫面
                    </button>
                  </div>
                )}
                {renderSetup()}
              </div>
            </HelpScope>
          )}

          {tools.length > 0 && (
            <div className="tw-work" style={setup ? { display: 'none' } : undefined}>
              <div className="tw-side" role="tablist" aria-orientation="vertical">
                {tools.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={t.id === activeId}
                    aria-label={WS_INFO[t.kind].name}
                    data-kind={t.kind}
                    className={`tw-tab${t.id === activeId ? ' on' : ''}`}
                    onClick={() => {
                      setActiveId(t.id)
                      setConfirm(null)
                    }}
                  >
                    <span className="tw-tab-ico">
                      <KindIcon kind={t.kind} />
                    </span>
                    <span className="tw-tab-name">{WS_INFO[t.kind].short}</span>
                  </button>
                ))}
                {hasPlayerTool && (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={playersOpen}
                    aria-label="玩家名單"
                    className={`tw-tab tw-tab-players${playersOpen ? ' on' : ''}`}
                    onClick={() => setPlayersOpen((v) => !v)}
                  >
                    <span className="tw-tab-ico" aria-hidden="true">
                      👥
                    </span>
                    <span className="tw-tab-name">玩家 {players.length}</span>
                  </button>
                )}
              </div>

              <div className="tw-main">
                {playersOpen && hasPlayerTool && (
                  <div className="tw-players-panel">
                    <HelpScope api={helpApi}>
                      <PlayersSetup names={players} onChange={setPlayers} />
                    </HelpScope>
                  </div>
                )}

                <div className="tw-panels">
                  {tools.map((t) => {
                    const show = !setup && t.id === activeId
                    const body = (
                      <>
                        {(t.kind === 'resource' || t.kind === 'score') && t.tpl && (
                          <PlayView tpl={t.tpl} names={players} onNames={setPlayers} active={show} />
                        )}
                        {t.kind === 'dice' && t.dice && (
                          <div className="tw-plain">
                            <DiceTool config={t.dice} history={history} onRecord={record} />
                          </div>
                        )}
                        {t.kind === 'ladder' && (
                          <div className="tw-plain">
                            <LadderTool key={players.length} names={players} />
                          </div>
                        )}
                      </>
                    )
                    return (
                      <div key={t.id} className="tw-panel" style={show ? undefined : { display: 'none' }}>
                        {show ? <HelpScope api={helpApi}>{body}</HelpScope> : <HelpBlock>{body}</HelpBlock>}
                      </div>
                    )
                  })}
                </div>

                {activeTool && (
                  <div className="tw-foot">
                    <button
                      type="button"
                      className={`ss-link tw-remove${confirm === 'del' ? ' danger' : ''}`}
                      onClick={() => (confirm === 'del' ? removeTool(activeTool.id) : armConfirm('del'))}
                    >
                      {confirm === 'del'
                        ? `再按一次移除「${WS_INFO[activeTool.kind].name}」`
                        : `移除「${WS_INFO[activeTool.kind].name}」`}
                    </button>
                    {confirm === 'exit' && <span className="gt-hint">再按一次 × 離開，會清掉這些工具的數字</span>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {plusMenu &&
        createPortal(
          <div className="gt-root gt-menu-backdrop gt-plus-backdrop" onClick={() => setPlusMenu(null)}>
            <div
              className="gt-menu"
              role="menu"
              style={{ left: plusMenu.left, top: plusMenu.top }}
              onClick={(event) => event.stopPropagation()}
            >
              {addable.map((k) => (
                <button key={k} type="button" role="menuitem" className="gt-menu-item" onClick={() => addKind(k)}>
                  <KindIcon kind={k} />
                  <span>{WS_INFO[k].name}</span>
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
