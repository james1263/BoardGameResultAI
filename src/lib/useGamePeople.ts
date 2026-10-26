import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

export type Person = { n: string; c: string | null }
export type GamePeople = { want: Person[]; played: Person[] }
export type RatingPerson = Person & {
  o: number | null
  l: number | null
  pi: number | null
  cm: number | null
  ch: number | null
  u: number | null
  k: number | null
}

type Status = 'idle' | 'loading' | 'ready' | 'error'

const EMPTY_PEOPLE: GamePeople = { want: [], played: [] }
const EMPTY_RATINGS: RatingPerson[] = []

// 名單顯示的格式：管理者看「暱稱（LINE／FB 名字）」，VIP 只有暱稱
export function personLabel(person: Person, showContact: boolean): string {
  return showContact && person.c ? `${person.n}（${person.c}）` : person.n
}

// VIP 與管理者：每款遊戲的想玩／已玩名單
export function useGamePeople(enabled: boolean) {
  const [map, setMap] = useState<Record<string, GamePeople>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!enabled) {
      setMap({})
      setStatus('idle')
      return
    }
    let cancelled = false
    setStatus('loading')
    supabase.rpc('get_game_people').then(({ data, error }) => {
      if (cancelled) return
      if (error) {
        console.error('讀取名單失敗：', error)
        setStatus('error')
        return
      }
      const next: Record<string, GamePeople> = {}
      for (const row of (data ?? []) as {
        bgg_name: string
        want: Person[] | null
        played: Person[] | null
      }[]) {
        next[row.bgg_name] = { want: row.want ?? [], played: row.played ?? [] }
      }
      setMap(next)
      setStatus('ready')
    })
    return () => {
      cancelled = true
    }
  }, [enabled, reloadKey])

  const get = useCallback(
    (bggName: string): GamePeople => map[bggName] ?? EMPTY_PEOPLE,
    [map],
  )
  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { status, get, reload }
}

// 只有管理者：每款遊戲是誰評了幾分
export function useAdminRatings(enabled: boolean) {
  const [map, setMap] = useState<Record<string, RatingPerson[]>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!enabled) {
      setMap({})
      setStatus('idle')
      return
    }
    let cancelled = false
    setStatus('loading')
    supabase.rpc('admin_get_all_ratings').then(({ data, error }) => {
      if (cancelled) return
      if (error) {
        console.error('讀取評分名單失敗：', error)
        setStatus('error')
        return
      }
      const next: Record<string, RatingPerson[]> = {}
      for (const row of (data ?? []) as {
        bgg_name: string
        people: RatingPerson[] | null
      }[]) {
        next[row.bgg_name] = row.people ?? []
      }
      setMap(next)
      setStatus('ready')
    })
    return () => {
      cancelled = true
    }
  }, [enabled, reloadKey])

  const get = useCallback(
    (bggName: string): RatingPerson[] => map[bggName] ?? EMPTY_RATINGS,
    [map],
  )
  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { status, get, reload }
}

export type PeopleApi = ReturnType<typeof useGamePeople>
export type AdminRatingsApi = ReturnType<typeof useAdminRatings>