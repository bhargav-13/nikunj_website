import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { groupByDate, formatDayLabel } from '../lib/dateUtils'
import { materialById } from '../lib/materials'
import { useMaterialModal } from '../context/MaterialModalContext'

export default function MaterialList({ logs, emptyMessage = 'No material logs yet.' }) {
  const { openEdit } = useMaterialModal()
  const groups = groupByDate(logs)

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-1)] p-8 text-center">
        <p className="text-sm text-[var(--text-muted)]">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map(([date, entries]) => (
        <div key={date}>
          <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            {formatDayLabel(date)}
          </p>
          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-1)]">
            {entries.map((log, i) => {
              const material = materialById(log.materialId)
              return (
                <button
                  key={log.id}
                  onClick={() => openEdit(log)}
                  className={`flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-[var(--surface-2)] active:bg-[var(--surface-2)] sm:px-4 ${
                    i !== 0 ? 'border-t border-[var(--border)]' : ''
                  }`}
                >
                  <div
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-full sm:h-9 sm:w-9"
                    style={{
                      backgroundColor: log.direction === 'in' ? 'var(--good-bg)' : 'var(--critical-bg)',
                      color: log.direction === 'in' ? 'var(--good)' : 'var(--critical)',
                    }}
                  >
                    {log.direction === 'in' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                      {material?.label ?? log.materialId}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                      <span>{log.direction === 'in' ? 'Received' : 'Used'}</span>
                      {log.note && (
                        <>
                          <span className="text-[var(--border-strong)]">·</span>
                          <span className="truncate">{log.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <p
                    className="tabular-nums flex-none text-sm font-semibold"
                    style={{ color: log.direction === 'in' ? 'var(--good)' : 'var(--critical)' }}
                  >
                    {log.direction === 'in' ? '+' : '-'}
                    {log.quantity.toLocaleString('en-IN')} {log.unit}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
