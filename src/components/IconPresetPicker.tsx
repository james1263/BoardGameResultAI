import { ICONS, PRESET_GROUPS, type PresetItem } from '../lib/scoreSheet'
import '../styles/icon-picker.css'

// 共用面板：圖示選擇與「常用資源」合併成同一個地方（計分表編輯、遊戲桌編輯都用它）
// 兩種用法：
//   選圖示（改某一列）：顯示常用資源（有給 onPreset 才顯示）＋ 40 個圖示 ＋ 自己輸入。
//     點常用資源 → onPreset（呼叫端把名稱與圖示一起填進這一列）；點圖示 → onIcon。
//   加資源（新增列）：只顯示常用資源，附「整組加入」（onGroup）。

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
  return (
    <div className="ipk-root ipk-root">
      {onPreset && (
        <div className="ipk-block">
          <p className="ipk-title">常用資源（點一下自動填名稱與圖示）</p>
          {PRESET_GROUPS.map((g) => (
            <div key={g.label} className="ipk-group">
              <div className="ipk-group-head">
                <span>{g.label}</span>
                {onGroup && (
                  <button type="button" className="ipk-link" onClick={() => onGroup(g.items)}>
                    整組加入
                  </button>
                )}
              </div>
              <div className="ipk-chips">
                {g.items.map((it) => (
                  <button
                    key={it.name}
                    type="button"
                    className="ipk-chip"
                    disabled={isUsed?.(it.name) ?? false}
                    onClick={() => onPreset(it)}
                  >
                    {it.icon} {it.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showIcons && onIcon && (
        <div className="ipk-block">
          <p className="ipk-title">只換圖示</p>
          <div className="ipk-grid">
            {ICONS.map((icon) => (
              <button key={icon} type="button" className="ipk-icon" onClick={() => onIcon(icon)}>
                {icon}
              </button>
            ))}
          </div>
          <label className="ipk-custom">
            自己輸入（太新的圖示，舊電腦會變方框）
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
        </div>
      )}
    </div>
  )
}
