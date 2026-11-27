import type { DiceGroup } from './gameTable'

// 小工具工作區：工具註冊表與共用玩家
// 每個工具登記：名稱、圖示、要不要玩家。之後新增工具，只要在 WS_INFO 加一筆、在 ToolWorkspace 補它的設定頁與工作畫面。

export type WsKind = 'resource' | 'score' | 'dice' | 'ladder'

export const WS_INFO: Record<WsKind, { name: string; icon: string; needsPlayers: boolean }> = {
  resource: { name: '資源計數器', icon: '📦', needsPlayers: true },
  score: { name: '計分表', icon: '🧮', needsPlayers: true },
  dice: { name: '擲骰', icon: '🎲', needsPlayers: false },
  ladder: { name: '爬梯子', icon: '', needsPlayers: true },
}

export const WS_KINDS: WsKind[] = ['resource', 'score', 'dice', 'ladder']

export const WS_MIN_PLAYERS = 2
export const WS_MAX_PLAYERS = 12
export const WS_MAX_NAME = 12

// 九格的工具編號對應到工作區的工具種類（挑三款不在工作區）
export function kindOfView(view: string): WsKind | null {
  if (view === 'sheet') return 'score'
  if (view === 'counter') return 'resource'
  if (view === 'dice') return 'dice'
  if (view === 'ladder') return 'ladder'
  return null
}

export function defaultNames(n: number): string[] {
  const count = Math.max(WS_MIN_PLAYERS, Math.min(WS_MAX_PLAYERS, n))
  return Array.from({ length: count }, (_, i) => `玩家${i + 1}`)
}

export function resizeNames(names: string[], n: number): string[] {
  const target = Math.max(WS_MIN_PLAYERS, Math.min(WS_MAX_PLAYERS, n))
  if (target <= names.length) return names.slice(0, target)
  const next = [...names]
  while (next.length < target) next.push(`玩家${next.length + 1}`)
  return next
}

export type DiceConfig = {
  count: number
  sides: number
  // 有值＝自訂骰面（沿用遊戲桌的骰子編輯器）；null＝一般數字骰
  group: DiceGroup | null
}

let seq = 0
export function newToolId(): string {
  seq += 1
  return `t${Date.now().toString(36)}${seq}`
}
