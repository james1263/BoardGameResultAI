import '../styles/display-control.css'

export type FilterTag = {
  key: string
  label: string
  onRemove: () => void
}

export default function FilterTags({ tags }: { tags: FilterTag[] }) {
  if (tags.length === 0) return null
  return (
    <div className="filter-tags" aria-label="已套用的篩選">
      {tags.map((tag) => (
        <span key={tag.key} className="filter-tag">
          {tag.label}
          <button
            type="button"
            aria-label={`移除篩選：${tag.label}`}
            onClick={tag.onRemove}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  )
}
