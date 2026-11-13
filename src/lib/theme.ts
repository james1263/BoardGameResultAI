// 外觀偏好：深色／淺色／跟隨系統。
// 只有使用者手動選過才寫入 localStorage（boardgame-theme）；沒有這個鍵就用預設值。
// 預設值只寫在 index.html 的 DEF（<html data-theme-default>），這裡讀它，避免兩處不一致。
export type ThemePref = 'dark' | 'light' | 'system'

export const THEME_KEY = 'boardgame-theme'

const ORDER: ThemePref[] = ['dark', 'light', 'system']

export const THEME_LABELS: Record<ThemePref, string> = {
  dark: '深色',
  light: '淺色',
  system: '跟隨系統',
}

function isPref(value: unknown): value is ThemePref {
  return value === 'dark' || value === 'light' || value === 'system'
}

export function defaultThemePref(): ThemePref {
  const value = document.documentElement.getAttribute('data-theme-default')
  return isPref(value) ? value : 'light'
}

export function loadThemePref(): ThemePref {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (isPref(saved)) return saved
  } catch {
    // 讀不到就用預設
  }
  return defaultThemePref()
}

export function resolveTheme(pref: ThemePref): 'dark' | 'light' {
  if (pref === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return pref
}

export function applyTheme(pref: ThemePref) {
  const theme = resolveTheme(pref)
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  root.style.colorScheme = theme
}

// 使用者手動選擇：才記錄偏好
export function saveThemePref(pref: ThemePref) {
  try {
    localStorage.setItem(THEME_KEY, pref)
  } catch {
    // 存不了就只套用這一次
  }
  applyTheme(pref)
}

export function nextThemePref(pref: ThemePref): ThemePref {
  return ORDER[(ORDER.indexOf(pref) + 1) % ORDER.length]
}
