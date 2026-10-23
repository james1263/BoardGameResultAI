import { useState } from 'react'

export default function PersonalNote({
  value,
  disabled,
  onSave,
}: {
  value: string
  disabled: boolean
  onSave: (text: string) => void
}) {
  const [text, setText] = useState(value)

  return (
    <label className="personal-note">
      <span className="note-label">
        我的備註<small>（只有你看得到）</small>
      </span>
      <textarea
        value={text}
        maxLength={500}
        disabled={disabled}
        placeholder="記錄遊玩心得、策略或下次想嘗試的玩法……"
        onChange={(event) => setText(event.target.value)}
        onBlur={() => {
          if (text !== value) onSave(text)
        }}
      />
    </label>
  )
}
