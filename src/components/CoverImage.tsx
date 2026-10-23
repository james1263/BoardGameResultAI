import { useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'

const COVER_EXTENSIONS = ['webp', 'jpg', 'png']

function getCoverSources(slug: string, version: number): string[] {
  const baseUrl = supabase.storage
    .from('covers')
    .getPublicUrl(`${slug}.webp`).data.publicUrl
  const storageUrl = version > 0 ? `${baseUrl}?v=${version}` : baseUrl

  // 順序：Supabase 上傳的圖 → 舊的本機圖 webp／jpg／png
  return [
    storageUrl,
    ...COVER_EXTENSIONS.map((ext) => `/covers/${slug}.${ext}`),
  ]
}

export default function CoverImage({
  slug,
  alt,
  className,
  fallback,
  version = 0,
}: {
  slug: string
  alt: string
  className: string
  fallback: ReactNode
  version?: number
}) {
  const sources = getCoverSources(slug, version)
  const [srcIndex, setSrcIndex] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const failed = srcIndex >= sources.length

  return (
    <>
      {!loaded && fallback}
      {!failed && (
        <img
          className={className}
          src={sources[srcIndex]}
          alt={alt}
          style={{ display: loaded ? 'block' : 'none' }}
          onLoad={() => setLoaded(true)}
          onError={() => setSrcIndex((current) => current + 1)}
        />
      )}
    </>
  )
}
