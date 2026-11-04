import { PUBLIC_NOTE_HINT } from '../lib/publicNoteNotice'
import '../styles/help-fold.css'

// 公開留言輸入框下方的固定小字
export default function PublicNoteHint() {
  return <p className="pn-hint">{PUBLIC_NOTE_HINT}</p>
}
