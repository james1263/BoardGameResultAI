import { useMemo } from 'react'
import { useMyGameNotes } from '../lib/useGatheringNotes'
import { useMyGatherings } from '../lib/useMyGatherings'
import InfoHint from './InfoHint'

// 遊戲詳細視窗「我的紀錄」：這款遊戲在各場聚會留下的私人心得（只讀）
export default function GameGatheringNotes({ bggName }: { bggName: string }) {
  const mine = useMyGameNotes(bggName)
  const gatherings = useMyGatherings()

  const items = useMemo(() => {
    const byId = new Map(gatherings.rows.map((row) => [row.id, row]))
    return mine.notes
      .map((note) => {
        const gathering = byId.get(note.gatheringId)
        return {
          ...note,
          date: gathering?.gatheredOn ?? '',
          title: gathering?.title ?? '聚會',
        }
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [mine.notes, gatherings.rows])

  // 沒有任何場次心得時整塊不顯示
  if (mine.loading || gatherings.loading || items.length === 0) return null

  return (
    <details className="gn-mine">
      <summary>
        各場次的私人心得（{items.length}）
        <InfoHint text="只有你看得到。要修改或刪除，請到「俱樂部」→「我的場次」該場聚會裡。" />
      </summary>
      <ul className="gn-mine-list">
        {items.map((item) => (
          <li key={item.gatheringId}>
            <div className="gn-mine-head">
              <b>{item.date ? item.date.replace(/-/g, '/') : ''}</b>
              <span>{item.title}</span>
            </div>
            <p>{item.privateNote}</p>
          </li>
        ))}
      </ul>
    </details>
  )
}
