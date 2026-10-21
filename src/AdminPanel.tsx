import { useEffect, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'

export default function AdminPanel() {
  const [session, setSession] = useState<Session | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => setSession(newSession),
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleLogin(event: FormEvent) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    setIsSubmitting(false)

    if (error) {
      setErrorMessage('登入失敗，請檢查 email 與密碼。')
      return
    }

    setPassword('')
    setIsOpen(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  if (session) {
    return (
      <span className="admin-status">
        管理者模式
        <button className="admin-link" type="button" onClick={handleLogout}>
          登出
        </button>
      </span>
    )
  }

  return (
    <>
      <button
        className="admin-link"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        管理者登入
      </button>

      {isOpen && (
        <div className="modal-backdrop" onClick={() => setIsOpen(false)}>
          <form
            className="admin-modal"
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleLogin}
          >
            <h2>管理者登入</h2>

            <label className="admin-field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
              />
            </label>

            <label className="admin-field">
              <span>密碼</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>

            {errorMessage && <p className="admin-error">{errorMessage}</p>}

            <button
              className="rule-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? '登入中…' : '登入'}
            </button>
            <button
              className="admin-cancel"
              type="button"
              onClick={() => setIsOpen(false)}
            >
              取消
            </button>
          </form>
        </div>
      )}
    </>
  )
}