import { useState } from 'react'
import { MAX_DICE, MAX_FACES, MAX_LABEL, diceTemplate, faceTotal, type DiceGroup } from '../lib/gameTable'

// 骰子組編輯器（遊戲桌與之後的小工具工作區共用）
// 樣式用 gtb-*，要放在有 .gtb-root 的容器裡（見 game-table.css）。

export default function DiceEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: DiceGroup
  onSave: (g: DiceGroup) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial.name)
  const [count, setCount] = useState(initial.count)
  const [faces, setFaces] = useState(initial.faces)
  const [msg, setMsg] = useState('')
  const total = faceTotal(faces)

  function patchFace(index: number, p: Partial<{ label: string; qty: number }>) {
    setFaces(faces.map((f, i) => (i === index ? { ...f, ...p } : f)))
  }

  function save() {
    const clean = faces.map((f) => ({ label: f.label.trim(), qty: f.qty }))
    if (clean.some((f) => !f.label)) return setMsg('每個骰面都要填文字或符號。')
    if (clean.some((f) => f.qty < 1)) return setMsg('每個骰面至少 1 面。')
    if (faceTotal(clean) < 2) return setMsg('骰子至少要有 2 面。')
    if (faceTotal(clean) > MAX_FACES) return setMsg(`骰面總數最多 ${MAX_FACES} 面。`)
    onSave({ ...initial, name: name.trim(), count, faces: clean, results: [] })
  }

  return (
    <div className="gtb-card">
      <div className="gtb-line">
        <input className="gtb-in gtb-grow" value={name} maxLength={12} placeholder="骰子組名稱（選填，例：戰鬥骰）" onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="gtb-line gtb-wrap">
        <label className="gtb-lab">
          顆數
          <input
            className="gtb-in gtb-num"
            type="number"
            min={1}
            max={MAX_DICE}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(MAX_DICE, Math.round(Number(e.target.value) || 1))))}
          />
        </label>
        <span className="gtb-muted">骰面共 {total}／{MAX_FACES} 面</span>
      </div>
      <p className="gtb-sub">快速模板（會取代下面的骰面）</p>
      <div className="gtb-chips">
        {[3, 4, 6, 8, 10, 12, 20].map((n) => (
          <button key={n} type="button" onClick={() => setFaces(diceTemplate(n))}>
            d{n}
          </button>
        ))}
      </div>
      <p className="gtb-sub">骰面：符號或文字 × 面數（例：「3點」×3、「必中」×1）</p>
      <ul className="gtb-list">
        {faces.map((f, index) => (
          <li key={index} className="gtb-line">
            <input
              className="gtb-in gtb-grow"
              value={f.label}
              maxLength={MAX_LABEL}
              placeholder="文字或符號"
              onChange={(e) => patchFace(index, { label: e.target.value })}
            />
            <span className="gtb-x">×</span>
            <input
              className="gtb-in gtb-num"
              type="number"
              min={1}
              value={f.qty}
              onChange={(e) => patchFace(index, { qty: Math.max(1, Math.round(Number(e.target.value) || 1)) })}
            />
            <button type="button" className="gtb-sq" aria-label="刪除這個骰面" disabled={faces.length <= 1} onClick={() => setFaces(faces.filter((_, i) => i !== index))}>
              ✕
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="gtb-btn" disabled={total >= MAX_FACES} onClick={() => setFaces([...faces, { label: '', qty: 1 }])}>
        ＋ 新增骰面
      </button>
      {msg && <p className="gtb-error">{msg}</p>}
      <div className="gtb-btnrow">
        <button type="button" className="gtb-btn" onClick={onCancel}>
          取消
        </button>
        <button type="button" className="gtb-btn main" onClick={save}>
          完成
        </button>
      </div>
    </div>
  )
}
