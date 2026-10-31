import { createRoot } from 'react-dom/client'

// 取代 window.confirm / window.alert。
// Google App、LINE 等內建瀏覽器常常不會顯示原生視窗（直接當成「取消」），
// 所以改成頁面內的確認視窗。用法：if (!(await askConfirm('確定嗎？'))) return

type Options = { confirmText?: string; cancelText?: string; danger?: boolean }

function Dialog({
  message,
  confirmText,
  cancelText,
  danger,
  onDone,
}: {
  message: string
  confirmText: string
  cancelText: string | null
  danger: boolean
  onDone: (ok: boolean) => void
}) {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      onClick={() => onDone(false)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(30, 40, 34, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 340,
          background: '#fbf7ec',
          color: '#34463c',
          borderRadius: 16,
          padding: '20px 18px 16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
        }}
      >
        <p style={{ margin: '0 0 16px', fontSize: 16, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          {cancelText !== null && (
            <button
              type="button"
              onClick={() => onDone(false)}
              style={{
                padding: '9px 16px',
                fontSize: 15,
                borderRadius: 999,
                border: '1px solid #b78a5a',
                background: '#fff',
                color: '#34463c',
              }}
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            autoFocus
            onClick={() => onDone(true)}
            style={{
              padding: '9px 18px',
              fontSize: 15,
              borderRadius: 999,
              border: 'none',
              background: danger ? '#a8452f' : '#456b50',
              color: '#fff',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

function open(message: string, confirmText: string, cancelText: string | null, danger: boolean) {
  return new Promise<boolean>((resolve) => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)
    const finish = (ok: boolean) => {
      resolve(ok)
      window.setTimeout(() => {
        root.unmount()
        host.remove()
      }, 0)
    }
    root.render(
      <Dialog
        message={message}
        confirmText={confirmText}
        cancelText={cancelText}
        danger={danger}
        onDone={finish}
      />,
    )
  })
}

export function askConfirm(message: string, options: Options = {}): Promise<boolean> {
  return open(
    message,
    options.confirmText ?? '確定',
    options.cancelText ?? '取消',
    options.danger ?? /刪除|隱藏|捨棄|移除|覆蓋/.test(message),
  )
}

export async function showNotice(message: string): Promise<void> {
  await open(message, '好', null, false)
}
