import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from './lib/supabase'
import { useSession } from './lib/useSession'
import { useAdminCheck } from './lib/useIsAdmin'

type Profile = { nickname: string; public_id: string }

export default function PlayerPanel() {
  const session = useSession()
  const { isAdmin, checked } = useAdminCheck()
  const userId = session?.user?.id ?? null

  const [profile, setProfile] = useState<Profile | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [nickname, setNickname] = useState('')
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!userId || !checked || isAdmin) {
      setProfile(null)
      return
    }

    let cancelled = false

    supabase
      .from('player_profiles')
      .select('nickname, public_id')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled || error) return
        setProfile(data as Profile | null)
        if (!data) setIsOpen(true) // 第一次登入，自動跳出設定暱稱
      })

    return () => {
      cancelled = true
    }
  }, [userId, checked, isAdmin])

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault()
    if (!userId) return

    const trimmed = nickname.trim()
    if (trimmed.length < 1 || trimmed.length > 20) {
      setMessage('暱稱需為 1～20 個字。')
      return
    }

    setMessage('')
    setIsSaving(true)

    const result = profile
      ? await supabase
          .from('player_profiles')
          .update({ nickname: trimmed })
          .eq('id', userId)
          .select('nickname, public_id')
          .single()
      : await supabase
          .from('player_profiles')
          .insert({ id: userId, nickname: trimmed })
          .select('nickname, public_id')
          .single()

    setIsSaving(false)

    if (result.error) {
      setMessage(
        result.error.code === '23505'
          ? '這個暱稱已經有人使用，請換一個。'
          : '儲存失敗：' + result.error.message,
      )
      return
    }

    setProfile(result.data as Profile)
    setIsOpen(false)
  }

  if (!session) {
    return (
      <button className="admin-link" type="button" onClick={handleGoogleLogin}>
        用 Google 登入
      </button>
    )
  }

  // 還在檢查身分，或是管理者（管理者由 AdminPanel 負責）
  if (!checked || isAdmin) return null

  return (
    <>
      <span className="admin-status">
        {profile ? profile.nickname : '已登入'}
        <button
          className="admin-link"
          type="button"
          onClick={() => {
            setNickname(profile?.nickname ?? '')
            setMessage('')
            setIsOpen(true)
          }}
        >
          {profile ? '改暱稱' : '設定暱稱'}
        </button>
        <button className="admin-link" type="button" onClick={handleLogout}>
          登出
        </button>
      </span>

      {isOpen && (
        <div className="modal-backdrop" onClick={() => setIsOpen(false)}>
          <form
            className="admin-modal"
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleSave}
          >
            <h2>{profile ? '修改暱稱' : '設定你的暱稱'}</h2>
            <p>暱稱會公開顯示（1～20 字）。不會公開你的 Email。</p>

            <label className="admin-field">
              <span>暱稱</span>
              <input
                type="text"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                maxLength={20}
                required
              />
            </label>

            {message && <p className="admin-error">{message}</p>}

            <button className="rule-button" type="submit" disabled={isSaving}>
              {isSaving ? '儲存中…' : '儲存'}
            </button>
            <button
              className="admin-cancel"
              type="button"
              onClick={() => setIsOpen(false)}
            >
              稍後再說
            </button>
          </form>
        </div>
      )}
    </>
  )
}