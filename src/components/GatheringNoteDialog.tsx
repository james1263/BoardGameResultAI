import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useBackClose } from '../lib/useBackClose'
import { saveGatheringNote, type MyNote } from '../lib/useGatheringNotes'

const MAX = 200

export default function GatheringNoteDialog({
  gatheringId,
  bggName,
  gameName,
  gatheringTitle,
  initial,
  onSaved,
  onClose,
}: {
  gatheringId: string
  bggName: string
  gameName: string
  gatheringTitle: string
  initial: MyNote | null
  onSaved: () => void
  onClose: () => void
}) {
  const [priv, setPriv] = useState(initial?.privateNote ?? '')
  const [pub, setPub] = useState(initial?.publicNote ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useBackClose(onClose, true)

  const dirty =
    priv !== (initial?.privateNote ?? '') || pub !== (initial?.publicNote ?? '')
  const privHas = priv.trim() !== ''
  const pubHas = pub.trim() !== ''
  const bothEmpty = !privHas && !pubHas
  // 只有一欄有字才能複製到另一欄，避免不小心蓋掉另一欄
  const canCopy = privHas !== pubHas
  const wasHidden =
    initial?.publicStatus === 'hidden' && (initial?.publicNote ?? '') !== ''

  function handleCopy() {
    if (privHas && !pubHas) setPub(priv)
    else if (pubHas && !privHas) setPriv(pub)
  }

  function handleCancel() {
    if (saving) return
    if (dirty && !window.confirm('還沒儲存，確定要關閉嗎？')) return
    onClose()
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    const result = await saveGatheringNote(gatheringId, bggName, priv, pub)
    setSaving(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    onSaved()
  }

  return createPortal(
    <div className="gn-backdrop">
      <div className="gn-dialog" role="dialog" aria-label="本場遊戲心得">
        <h2 className="gn-title">本場遊戲心得</h2>
        <p className="gn-sub">
          {gameName} · {gatheringTitle}
        </p>

        <h3 className="gn-section-title">🔒 私人留言</h3>
        <p className="gn-hint">只有你與有權限的管理者能看到。</p>
        <textarea
          className="gn-textarea"
          aria-label="私人留言"
          maxLength={MAX}
          rows={3}
          placeholder="記錄這場的策略、玩家表現或下次想調整的地方……"
          value={priv}
          onChange={(event) => setPriv(event.target.value)}
        />
        <p className="gn-count">
          {priv.length} / {MAX} 字
        </p>

        <button
          type="button"
          className="gn-copy"
          disabled={!canCopy || saving}
          onClick={handleCopy}
        >
          ⇅ 複製內容到另一欄
        </button>
        {privHas && pubHas && (
          <p className="gn-hint gn-center">兩欄都有內容，請手動編輯。</p>
        )}

        <h3 className="gn-section-title">👥 公開留言</h3>
        <p className="gn-hint">VIP 可以閱讀；依你的暱稱設定顯示名稱。</p>
        <textarea
          className="gn-textarea"
          aria-label="公開留言"
          maxLength={MAX}
          rows={3}
          placeholder="分享給其他玩家的心得……"
          value={pub}
          onChange={(event) => setPub(event.target.value)}
        />
        <p className="gn-count">
          {pub.length} / {MAX} 字
        </p>
        <p className="gn-hint">
          清空公開欄再儲存，就會撤回公開留言（私人留言會保留）。
          公開留言的閱讀頁面還在準備中，之後會在遊戲視窗與首頁開放。
        </p>
        {wasHidden && (
          <p className="gn-warn">
            你的公開留言已被管理者隱藏，其他人看不到。修改內容不會自動恢復公開；清空公開欄並儲存可以撤回。
          </p>
        )}

        {error && <p className="gn-error">{error}</p>}

        <div className="gn-actions">
          <button
            type="button"
            className="gn-cancel"
            disabled={saving}
            onClick={handleCancel}
          >
            取消
          </button>
          <button
            type="button"
            className="gn-save"
            disabled={saving || (bothEmpty && !initial)}
            onClick={() => void handleSave()}
          >
            {saving ? '儲存中…' : bothEmpty && initial ? '刪除這則心得' : '儲存心得'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
