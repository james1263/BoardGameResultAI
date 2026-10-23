import type { PersonalApi } from '../lib/personalApi'

export default function PersonalToast({ personal }: { personal: PersonalApi }) {
  return (
    <div className="personal-toast" role="alert">
      <span>{personal.errorMessage}</span>
      {personal.status === 'error' && (
        <button type="button" onClick={personal.reload}>
          重試
        </button>
      )}
      <button type="button" onClick={personal.clearError}>
        關閉
      </button>
    </div>
  )
}
