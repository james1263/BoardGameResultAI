import { useState } from 'react'
import { createPortal } from 'react-dom'
import MemberAdmin from './MemberAdmin'
import LoyaltyAdmin from '../LoyaltyAdmin'
import { OPEN_CSV_IMPORT_EVENT } from '../lib/adminEvents'

type Tab = 'members' | 'gatherings' | 'data'

const TABS: { key: Tab; icon: string; label: string }[] = [
  { key: 'members', icon: '👥', label: '成員與 VIP' },
  { key: 'gatherings', icon: '🎴', label: '聚會與集點' },
  { key: 'data', icon: '📦', label: '資料匯入' },
]

export default function AdminCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('members')

  function openCsvImport() {
    setIsOpen(false)
    window.dispatchEvent(new Event(OPEN_CSV_IMPORT_EVENT))
  }

  return (
    <>
      <button type="button" className="sb-item" onClick={() => setIsOpen(true)}>
        <span className="sb-ico" aria-hidden="true">
          ⚙
        </span>
        <span>管理</span>
      </button>

      {isOpen &&
        createPortal(
          <div className="ma-backdrop" onClick={() => setIsOpen(false)}>
            <div className="ac-modal" onClick={(event) => event.stopPropagation()}>
              <div className="ac-head">
                <h2>管理中心</h2>
                <span className="vip-tag">管理者</span>
                <button
                  type="button"
                  className="ma-close"
                  aria-label="關閉"
                  onClick={() => setIsOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className="ac-tabs" role="tablist">
                {TABS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    role="tab"
                    aria-selected={tab === item.key}
                    className={`ac-tab ${tab === item.key ? 'active' : ''}`}
                    onClick={() => setTab(item.key)}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>

              {tab === 'members' && <MemberAdmin />}
              {tab === 'gatherings' && <LoyaltyAdmin />}
              {tab === 'data' && (
                <div className="ac-data">
                  <h3>匯入 CSV（Notion 匯出）</h3>
                  <p>
                    更新 107 款桌遊的資料與封面。CSV 裡沒有的遊戲會移到垃圾桶，不會直接刪除。
                  </p>
                  <button type="button" className="ma-btn" onClick={openCsvImport}>
                    開始匯入 CSV
                  </button>

                  <h3>其他資料操作在哪裡</h3>
                  <ul>
                    <li>上傳或更換封面、編輯簡介、移到垃圾桶：打開那款遊戲的「詳細資料」。</li>
                    <li>還原、編輯原因、永久刪除：頁面最下方的垃圾桶區。</li>
                    <li>規則書與 FAQ 連結：遊戲詳細視窗的「規則」分頁。</li>
                  </ul>
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}