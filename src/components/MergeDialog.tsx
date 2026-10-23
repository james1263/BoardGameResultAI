import type { PersonalApi } from '../lib/personalApi'

export default function MergeDialog({ personal }: { personal: PersonalApi }) {
  return (
    <div className="modal-backdrop">
      <section className="admin-modal" role="dialog" aria-modal="true">
        <h2>要把這台電腦的紀錄加進你的帳號嗎？</h2>
        <p>
          這個瀏覽器有 {personal.localCount} 筆訪客紀錄（想玩／已玩／備註）。
          加入後會和你帳號裡的紀錄合併，不會取消你已經勾選的項目。
        </p>
        <p>如果這是共用電腦，這些紀錄可能不是你的，請選「不加入」。</p>

        {personal.errorMessage && (
          <p className="admin-error">{personal.errorMessage}</p>
        )}

        <button
          className="rule-button"
          type="button"
          disabled={personal.mergeStatus === 'merging'}
          onClick={() => void personal.mergeLocalIntoCloud()}
        >
          {personal.mergeStatus === 'merging'
            ? '同步中…'
            : personal.mergeStatus === 'error'
              ? '重試'
              : '加入我的帳號'}
        </button>
        <button
          className="admin-cancel"
          type="button"
          disabled={personal.mergeStatus === 'merging'}
          onClick={personal.declineMerge}
        >
          不加入
        </button>
      </section>
    </div>
  )
}
