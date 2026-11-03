export function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}

export function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}

export function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M4 4l16 16" />}
    </svg>
  )
}

// 一個人（推薦人數）
export function PersonIcon() {
  return (
    <svg
      className="fact-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21c0-4.2 3.4-7 7.5-7s7.5 2.8 7.5 7" />
    </svg>
  )
}

// 大腦（BGG 難度）
export function BrainIcon() {
  return (
    <svg
      className="fact-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5.5A3 3 0 0 0 6.6 4.3 3.2 3.2 0 0 0 4 8.2a3.2 3.2 0 0 0 .6 5.2A3.3 3.3 0 0 0 8 18.6a3 3 0 0 0 4 .9z" />
      <path d="M12 5.5a3 3 0 0 1 5.4-1.2A3.2 3.2 0 0 1 20 8.2a3.2 3.2 0 0 1-.6 5.2 3.3 3.3 0 0 1-3.4 5.2 3 3 0 0 1-4 .9z" />
      <path d="M12 5.5v14M8.5 10c1 0 2 .6 2.5 1.5M15.5 10c-1 0-2 .6-2.5 1.5M8.5 14.5c1 0 2-.4 2.5-1M15.5 14.5c-1 0-2-.4-2.5-1" />
    </svg>
  )
}
