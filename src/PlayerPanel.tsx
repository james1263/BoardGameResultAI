import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from './lib/supabase'
import { useSession } from './lib/useSession'
import { PROFILE_SAVED_EVENT, signInWithGoogle } from './lib/googleLogin'
import { useAdminCheck } from './lib/useIsAdmin'
import { useBackClose } from './lib/useBackClose'

type Profile = { nickname: string; public_id: string }

export default function PlayerPanel() {
  const session = useSession()
  const { isAdmin, checked } = useAdminCheck()
  const userId = session?.user?.id ?? null

  const [profile, setProfile] = useState<Profile | null>(null)
  const [contact, setContact] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [nickname, setNickname] = useState('')
  const [contactInput, setContactInput] = useState('')
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // 手機返回鍵／右滑：暱稱視窗或帳號選單開著時，先關它，不要離開網站
  useBackClose(() => {
    setIsOpen(false)
    setIsMenuOpen(false)
  }, isOpen || isMenuOpen)

  useEffect(() => {
    if (!userId || !checked) {
      setProfile(null)
      setContact('')
      return
    }

    let cancelled = false

    Promise.all([
      supabase
        .from('player_profiles')
        .select('nickname, public_id')
        .eq('id', userId)
        .maybeSingle(),
      supabase
        .from('player_contacts')
        .select('contact_name')
        .eq('user_id', userId)
        .maybeSingle(),
    ]).then(([p, c]) => {
      if (cancelled || p.error) return

      const found = p.data as Profile | null
      const contactName = c.error
        ? ''
        : ((c.data as { contact_name: string } | null)?.contact_name ?? '')

      setProfile(found)
      setContact(contactName)

      // 第一次登入，或還沒填聯絡方式：自動跳出設定視窗（可以按「稍後再說」）
      // 讀取聯絡方式失敗時（例如資料表還沒建立）不打擾玩家
      // 管理者不強制跳窗（想設定時從頂端暱稱選單進去）
      if (!isAdmin && (!found || (!c.error && !contactName))) {
        setNickname(found?.nickname ?? '')
        setContactInput(contactName)
        setIsOpen(true)
      }
    })

    return () => {
      cancelled = true
    }
  }, [userId, checked, isAdmin])

  const [hideInLists, setHideInLists] = useState(false)

  useEffect(() => {
    if (!userId || !checked) return
    let cancelled = false
    supabase.rpc('get_hide_in_lists').then(({ data, error }) => {
      if (!cancelled && !error) setHideInLists(data === true)
    })
    return () => {
      cancelled = true
    }
  }, [userId, checked, isAdmin])

  async function toggleHideInLists() {
    const next = !hideInLists
    setHideInLists(next)
    const { error } = await supabase.rpc('set_hide_in_lists', { p_hide: next })
    if (error) setHideInLists(!next)
  }

  async function handleGoogleLogin() {
    await signInWithGoogle()
  }

  async function handleLogout() {
    setIsMenuOpen(false)
    setIsOpen(false)
    await supabase.auth.signOut()
  }

  function openDialog() {
    setIsMenuOpen(false)
    setNickname(profile?.nickname ?? '')
    setContactInput(contact)
    setMessage('')
    setIsOpen(true)
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault()
    if (!userId) return

    const trimmedNickname = nickname.trim()
    const trimmedContact = contactInput.trim()

    if (trimmedNickname.length < 1 || trimmedNickname.length > 20) {
      setMessage('暱稱需為 1～20 個字。')
      return
    }
    if (trimmedContact.length < 1 || trimmedContact.length > 40) {
      setMessage('請填入你的 LINE 或 FB 名字（1～40 字），讓管理者知道你是誰。')
      return
    }

    setMessage('')
    setIsSaving(true)

    const profileResult = profile
      ? await supabase
        .from('player_profiles')
        .update({ nickname: trimmedNickname })
        .eq('id', userId)
        .select('nickname, public_id')
        .single()
      : await supabase
        .from('player_profiles')
        .insert({ id: userId, nickname: trimmedNickname })
        .select('nickname, public_id')
        .single()

    if (profileResult.error) {
      setIsSaving(false)
      setMessage(
        profileResult.error.code === '23505'
          ? '這個暱稱已經有人使用，請換一個。'
          : '儲存失敗：' + profileResult.error.message,
      )
      return
    }

    const contactResult = await supabase.from('player_contacts').upsert({
      user_id: userId,
      contact_name: trimmedContact,
      updated_at: new Date().toISOString(),
    })

    setIsSaving(false)

    // 暱稱已經存好了，所以先更新畫面；聯絡方式失敗就留在視窗讓玩家重試
    setProfile(profileResult.data as Profile)

    if (contactResult.error) {
      setMessage('暱稱已儲存，但聯絡方式儲存失敗：' + contactResult.error.message)
      return
    }

    setContact(trimmedContact)
    setIsOpen(false)
    // 如果玩家是為了報到才來填資料，通知報到視窗自動接著報到
    window.dispatchEvent(new Event(PROFILE_SAVED_EVENT))
  }

  if (!session) {
    return (
      <button className="admin-link" type="button" onClick={handleGoogleLogin}>
        用 Google 登入
      </button>
    )
  }

  // 還在檢查身分
  if (!checked) return null

  return (
    <>
      <div className="account-menu">
        <button
          className="player-chip"
          type="button"
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {profile ? profile.nickname : '設定暱稱'} ▾
        </button>

        {isMenuOpen && (
          <>
            <div
              className="account-backdrop"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="account-popover" role="menu">
              <button
                type="button"
                role="menuitem"
                onClick={() => void toggleHideInLists()}
              >
                {hideInLists ? '☐' : '☑'} 在 VIP 名單顯示我的暱稱
              </button>
              <button type="button" role="menuitem" onClick={openDialog}>
                {profile ? '修改暱稱與聯絡方式' : '設定暱稱'}
              </button>
              <button type="button" role="menuitem" onClick={handleLogout}>
                登出
              </button>
            </div>
          </>
        )}
      </div>

      {isOpen &&
        createPortal(
          <div className="modal-backdrop" onClick={() => setIsOpen(false)}>
            <form
              className="admin-modal player-dialog"
              onClick={(event) => event.stopPropagation()}
              onSubmit={handleSave}
            >
              <h2>{profile ? '暱稱與聯絡方式' : '設定你的暱稱'}</h2>

              <label className="pd-field">
                <span className="pd-label">暱稱（會公開顯示）</span>
                <input
                  type="text"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  maxLength={20}
                  placeholder="1～20 字"
                  autoComplete="off"
                  required
                />
                <span className="pd-hint">不會公開你的 Email。</span>
              </label>

              <label className="pd-field">
                <span className="pd-label">LINE／FB 名字（只有管理者看得到）</span>
                <input
                  type="text"
                  value={contactInput}
                  onChange={(event) => setContactInput(event.target.value)}
                  maxLength={40}
                  placeholder="例如：LINE 名稱「小明」"
                  autoComplete="off"
                  required
                />
                <span className="pd-hint">
                  讓管理者知道你是誰，不會公開給其他玩家。
                </span>
              </label>

              {message && <p className="pd-error">{message}</p>}

              <button className="pd-save" type="submit" disabled={isSaving}>
                {isSaving ? '儲存中…' : '儲存'}
              </button>
              <div className="pd-secondary">
                <button type="button" onClick={() => setIsOpen(false)}>
                  稍後再說
                </button>
                <button type="button" onClick={handleLogout}>
                  登出
                </button>
              </div>
            </form>
          </div>,
          document.body,
        )}
    </>
  )
}
