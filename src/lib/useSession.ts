import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

// 全站共用一份 session：新元件掛載時直接拿到目前值，不會先變成 null 再變回來
let cached: Session | null = null
let started = false
const listeners = new Set<(s: Session | null) => void>()

function publish(s: Session | null) {
  cached = s
  listeners.forEach((fn) => fn(s))
}

function start() {
  if (started) return
  started = true
  supabase.auth.getSession().then(({ data }) => publish(data.session))
  supabase.auth.onAuthStateChange((event, newSession) => {
    // 只有明確登出才接受 null；其他事件帶 null 一律忽略，避免回到頁面時誤判成訪客
    if (!newSession && event !== 'SIGNED_OUT') return
    publish(newSession)
  })
}

export function useSession(): Session | null {
  const [session, setSession] = useState<Session | null>(cached)

  useEffect(() => {
    start()
    listeners.add(setSession)
    setSession(cached)
    return () => {
      listeners.delete(setSession)
    }
  }, [])

  return session
}
