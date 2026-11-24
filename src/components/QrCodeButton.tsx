import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import QRCode from 'qrcode'
import { useBackClose } from '../lib/useBackClose'
import '../styles/qr-code-dialog.css'

// 管理者聚會頁：把聚會連結變成 QR Code，讓現場的人用相機掃（掃了等於點連結）。
// 純前端產生，不存任何資料；QR 內容只有連結本身。
export default function QrCodeButton({
  link,
  disabled,
}: {
  link: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [dataUrl, setDataUrl] = useState('')
  const [error, setError] = useState('')

  useBackClose(() => setOpen(false), open)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setDataUrl('')
    setError('')
    QRCode.toDataURL(link, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 1024,
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError('產生 QR Code 失敗：' + (e instanceof Error ? e.message : String(e)))
      })
    return () => {
      cancelled = true
    }
  }, [open, link])

  function download() {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'boardgame-gathering-qr.png'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  return (
    <>
      <button
        type="button"
        className="lga-outline"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        ▦ 顯示 QR Code
      </button>
      {open &&
        createPortal(
          <div className="qrd-backdrop" onClick={() => setOpen(false)}>
            <div
              className="qrd-box"
              role="dialog"
              aria-modal="true"
              aria-label="聚會 QR Code"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="qrd-close"
                aria-label="關閉"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
              <p className="qrd-title">掃描加入今天的聚會</p>
              <div className="qrd-img-wrap">
                {dataUrl && <img className="qrd-img" src={dataUrl} alt="聚會連結 QR Code" />}
                {!dataUrl && !error && <p className="qrd-note">產生中…</p>}
                {error && <p className="qrd-note">{error}</p>}
              </div>
              <p className="qrd-hint">
                用手機相機掃描，等於點開聚會連結。若管理者按了「重設連結」，舊的 QR Code 會立刻失效，請重新顯示新的。
              </p>
              <button type="button" className="qrd-btn" disabled={!dataUrl} onClick={download}>
                下載圖片
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
