import { useState } from 'react'
import { ICONS, PRESET_GROUPS, type PresetItem } from '../lib/scoreSheet'
import IconView from './IconView'
import { HelpNote } from './HelpNote'
import '../styles/icon-picker.css'

// 共用面板：圖示選擇與「常用資源」合併成同一個地方（計分表編輯、遊戲桌編輯都用它）
// 兩種用法：
//   選圖示（改某一列）：顯示常用資源（有給 onPreset 才顯示）＋ 圖示格 ＋ 自己輸入。
//     點常用資源 → onPreset（呼叫端把名稱與圖示一起填進這一列）；點圖示 → onIcon。
//   加資源（新增列）：只顯示常用資源，附「整組加入」（onGroup）。
// 常用資源每一組平常收起來，點組名才展開（省空間）。

export default function IconPresetPicker({
  onIcon,
  onPreset,
  onGroup,
  isUsed,
  showIcons = true,
}: {
  onIcon?: (icon: string) => void
  onPreset?: (item: PresetItem) => void
  onGroup?: (items: PresetItem[]) => void
  isUsed?: (name: string) => boolean
  showIcons?: boolean
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [iconsOpen, setIconsOpen] = useState(false)

  // 有常用資源時，圖示格只列「沒出現在常用資源裡」的圖示，而且預設收起來，畫面上就不會看到兩份一樣的圖示
  const presetIcons = new Set(PRESET_GROUPS.flatMap((g) => g.items.map((it) => it.icon)))
  const hasPresets = onPreset !== undefined
  const iconList = hasPresets ? ICONS.filter((icon) => !presetIcons.has(icon)) : ICONS
  const iconsVisible = !hasPresets || iconsOpen

  return (
    <div className="ipk-root ipk-root">
      {onPreset && (
        <div className="ipk-block">
          <p className="ipk-title">常用資源</p>
          <HelpNote
            text={
              onGroup
                ? '點組名展開，點一個＝這一列改成它；「整組加入」會把這一組全部加成新的列。之後都可以再改名稱與圖示。'
                : '點組名展開，點一個常用資源，會自動填好名稱與圖示。'
            }
          />
          {PRESET_GROUPS.map((g) => {
            const isOpen = open[g.label] === true
            return (
              <div key={g.label} className="ipk-group">
                <div className="ipk-group-head">
                  <button
                    type="button"
                    className="ipk-fold"
                    aria-expanded={isOpen}
                    onClick={() => setOpen((cur) => ({ ...cur, [g.label]: !isOpen }))}
                  >
                    <span className="ipk-arrow" aria-hidden="true">
                      {isOpen ? '▾' : '▸'}
                    </span>
                    {g.label}
                    <span className="ipk-count">{g.items.length}</span>
                  </button>
                  {onGroup && (
                    <button type="button" className="ipk-link" onClick={() => onGroup(g.items)}>
                      整組加入
                    </button>
                  )}
                </div>
                {isOpen && (
                  <div className="ipk-chips">
                    {g.items.map((it) => (
                      <button
                        key={it.name}
                        type="button"
                        className="ipk-chip"
                        disabled={isUsed?.(it.name) ?? false}
                        onClick={() => onPreset(it)}
                      >
                        <IconView icon={it.icon} /> {it.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showIcons && onIcon && (
        <div className="ipk-block">
          {hasPresets ? (
            <button
              type="button"
              className="ipk-fold"
              aria-expanded={iconsOpen}
              onClick={() => setIconsOpen((v) => !v)}
            >
              <span className="ipk-arrow" aria-hidden="true">
                {iconsOpen ? '▾' : '▸'}
              </span>
              換其他圖示
            </button>
          ) : (
            <p className="ipk-title">選圖示</p>
          )}
          {iconsVisible && (
            <>
              <div className="ipk-grid">
                {iconList.map((icon) => (
                  <button key={icon} type="button" className="ipk-icon" onClick={() => onIcon(icon)}>
                    <IconView icon={icon} />
                  </button>
                ))}
              </div>
              <label className="ipk-custom">
                自己輸入
                <input
                  className="ipk-input"
                  value=""
                  placeholder="貼上表情符號"
                  onChange={(event) => {
                    const v = Array.from(event.target.value).slice(0, 2).join('')
                    if (v) onIcon(v)
                  }}
                />
              </label>
              <HelpNote text="自己輸入的表情符號如果太新，舊電腦會顯示成方框。" />
            </>
          )}
        </div>
      )}
    </div>
  )
}
