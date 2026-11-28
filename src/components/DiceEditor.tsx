import { useEffect, useState } from 'react'
import {
  MAX_DICE,
  MAX_FACES,
  MAX_LABEL,
  diceTemplate,
  faceTotal,
  type DiceFace,
  type DiceGroup,
} from '../lib/gameTable'
import '../styles/dice-tray.css'

// 骰子組編輯器（遊戲桌與小工具工作區共用）
// 數字欄位可以整個清空再重新輸入（輸入中允許空白，離開欄位才補回合法值）
// 圖示一律用 Emoji 11（2018）以前的符號

const ICONS = ['🎲', '⚔️', '🕊️', '🛡️', '🏹', '💀', '🔥', '💎', '🍀', '❤️', '⚡', '🎯', '👑', '🐎', '🧪', '⭐']
const QUICK = [4, 6, 8, 10, 12, 20]

export function NumField({
  value,
  min,
  max,
  onCommit,
  label,
}: {
  value: number
  min: number
  max: number
  onCommit: (n: number) => void
  label: string
}) {
  const [txt, setTxt] = useState(String(value))
  useEffect(() => {
    setTxt(String(value))
  }, [value])
  return (
    <input
      className="de-num"
      type="text"
      inputMode="numeric"
      aria-label={label}
      value={txt}
      onFocus={(event) => event.target.select()}
      onChange={(event) => {
        const t = event.target.value.replace(/\D/g, '').slice(0, 3)
        setTxt(t)
        if (t !== '') onCommit(Math.max(min, Math.min(max, Number(t))))
      }}
      onBlur={() => setTxt(String(value))}
    />
  )
}

export default function DiceEditor({
  initial,
  onSave,
  onCancel,
  hideCount,
}: {
  initial: DiceGroup
  onSave: (g: DiceGroup) => void
  onCancel: () => void
  hideCount?: boolean
}) {
  const [name, setName] = useState(initial.name)
  const [icon, setIcon] = useState(initial.icon ?? '🎲')
  const [count, setCount] = useState(initial.count)
  const [faces, setFaces] = useState<DiceFace[]>(initial.faces)

  const total = faceTotal(faces)
  const emptyLabel = faces.some((f) => !f.label.trim())
  const canSave = faces.length > 0 && !emptyLabel && total <= MAX_FACES && total > 0

  function setFace(i: number, patch: Partial<DiceFace>) {
    setFaces((cur) => cur.map((f, k) => (k === i ? { ...f, ...patch } : f)))
  }

  function save() {
    if (!canSave) return
    onSave({
      ...initial,
      name: name.trim().slice(0, 12),
      icon,
      count,
      faces: faces.map((f) => ({ label: f.label.trim().slice(0, MAX_LABEL), qty: f.qty })),
      results: [],
    })
  }

  return (
    <div className="de-root">
      <label className="de-field">
        <span>名稱（例：戰鬥骰、和平骰）</span>
        <input
          className="de-text"
          type="text"
          maxLength={12}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="骰子名稱"
        />
      </label>

      <div className="de-field">
        <span>圖示（骰子庫裡用它代表這組骰子）</span>
        <div className="de-icons">
          {ICONS.map((ic) => (
            <button
              key={ic}
              type="button"
              className={`de-ic${ic === icon ? ' on' : ''}`}
              aria-pressed={ic === icon}
              aria-label={`圖示 ${ic}`}
              onClick={() => setIcon(ic)}
            >
              {ic}
            </button>
          ))}
        </div>
      </div>

      {!hideCount && (
        <div className="de-field">
          <span>顆數（1～{MAX_DICE}）</span>
          <NumField value={count} min={1} max={MAX_DICE} onCommit={setCount} label="顆數" />
        </div>
      )}

      <div className="de-field">
        <span>快速範本</span>
        <div className="de-quick">
          {QUICK.map((n) => (
            <button key={n} type="button" className="de-chip" onClick={() => setFaces(diceTemplate(n))}>
              d{n}
            </button>
          ))}
        </div>
      </div>

      <div className="de-field">
        <span>
          骰面（符號或文字，最多 {MAX_LABEL} 字；數量＝這個面有幾面；共 {total}／{MAX_FACES} 面）
        </span>
        <ul className="de-faces">
          {faces.map((f, i) => (
            <li key={i}>
              <input
                className="de-text de-face"
                type="text"
                maxLength={MAX_LABEL}
                value={f.label}
                aria-label={`第 ${i + 1} 個骰面`}
                onChange={(event) => setFace(i, { label: event.target.value })}
              />
              <span className="de-x">×</span>
              <NumField
                value={f.qty}
                min={1}
                max={Math.max(1, MAX_FACES - (total - f.qty))}
                onCommit={(n) => setFace(i, { qty: n })}
                label={`第 ${i + 1} 個骰面的數量`}
              />
              <button
                type="button"
                className="de-del"
                aria-label="刪除這個骰面"
                onClick={() => setFaces((cur) => cur.filter((_, k) => k !== i))}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="de-chip"
          disabled={total >= MAX_FACES}
          onClick={() => setFaces((cur) => [...cur, { label: '', qty: 1 }])}
        >
          ＋ 新增骰面
        </button>
      </div>

      {emptyLabel && <p className="de-warn">有骰面還沒填內容。</p>}
      {total > MAX_FACES && <p className="de-warn">骰面合計超過 {MAX_FACES} 面。</p>}

      <div className="de-btns">
        <button type="button" className="de-btn" onClick={onCancel}>
          取消
        </button>
        <button type="button" className="de-btn main" disabled={!canSave} onClick={save}>
          儲存
        </button>
      </div>
    </div>
  )
}
