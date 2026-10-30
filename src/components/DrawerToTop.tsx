import { useEffect, useState, type RefObject } from 'react'
import '../styles/drawer-top.css'

// 抽屜專用「回到最上面」：監看抽屜自己的捲動區，捲超過 300px 才出現
export default function DrawerToTop({ targetRef }: { targetRef: RefObject<HTMLElement | null> }) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const el = targetRef.current
        if (!el) return
        const onScroll = () => setVisible(el.scrollTop > 300)
        onScroll()
        el.addEventListener('scroll', onScroll, { passive: true })
        return () => el.removeEventListener('scroll', onScroll)
    }, [targetRef])

    if (!visible) return null

    return (
        <button
            type="button"
            className="drawer-totop"
            aria-label="回到最上面"
            onClick={() => targetRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
        >
            ↑
        </button>
    )
}
