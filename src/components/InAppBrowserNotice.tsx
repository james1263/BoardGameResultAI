import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { IN_APP_EVENT, currentShareLink } from '../lib/googleLogin'

export default function InAppBrowserNotice() {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    function handle() {
      setCopied(false)
      setIsOpen(true)
    }
    window.addEventListener(IN_APP_EVENT, handle)
    return () => window.removeEventListener(IN_APP_EVENT, handle)
  }, [])

  async function copyLink() {
    const link = currentShareLink()
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
    } catch {
      window.prompt('請複製這個網址，貼到 Chrome 或 Safari：', link)
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div
      className="modal-backdrop inapp-backdrop"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="admin-modal player-dialog"
        role="dialog"
        aria-label="請用瀏覽器開啟"
        onClick={(event) => event.stopPropagation()}
      >
        <h2>請改用瀏覽器開啟</h2>
        <p className="pd-text">
          你現在是在 LINE、Facebook、Instagram 等 App 裡面的內建瀏覽器，Google
          不允許在這裡登入。請改用手機的 Chrome 或 Safari 開啟，再登入一次：
        </p>
        <ol className="pd-steps">
          <li>點畫面角落的「⋯」或分享圖示</li>
          <li>選「用預設瀏覽器開啟」或「在 Safari 開啟」</li>
          <li>在新開的頁面，再按一次「用 Google 登入」</li>
        </ol>
        <p className="pd-hint">
          找不到選項的話，按下面的按鈕複製網址，再貼到 Chrome 或 Safari 的網址列。
        </p>
        <button className="pd-save" type="button" onClick={copyLink}>
          {copied ? '✓ 已複製網址' : '複製網址'}
        </button>
        <div className="pd-secondary">
          <button type="button" onClick={() => setIsOpen(false)}>
            關閉
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
