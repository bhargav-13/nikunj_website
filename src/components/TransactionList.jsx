import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { groupByDate, formatDayLabel } from '../lib/dateUtils'
import { categoryById } from '../lib/constants'
import { useModal } from '../context/ModalContext'

export default function TransactionList({ transactions, emptyMessage = 'No transactions yet.' }) {
  const { openEdit } = useModal()
  const groups = groupByDate(transactions)

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-1)] p-8 text-center">
        <p className="text-sm text-[var(--text-muted)]">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map(([date, txs]) => {
        const dayTotal = txs.reduce((sum, tx) => sum + (tx.type === 'income' ? tx.amount : -tx.amount), 0)
        return (
          <div key={date}>
            <div className="mb-1.5 flex items-center justify-between px-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {formatDayLabel(date)}
              </p>
              <p
                className="tabular-nums text-[11px] font-semibold"
                style={{ color: dayTotal >= 0 ? 'var(--good)' : 'var(--critical)' }}
              >
                {dayTotal >= 0 ? '+' : '-'}₹{Math.abs(dayTotal).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-1)]">
              {txs.map((tx, i) => {
                const cat = tx.type === 'expense' ? categoryById(tx.category) : null
                return (
                  <button
                    key={tx.id}
                    onClick={() => openEdit(tx)}
                    className={`flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-[var(--surface-2)] active:bg-[var(--surface-2)] sm:px-4 ${
                      i !== 0 ? 'border-t border-[var(--border)]' : ''
                    }`}
                  >
                    <div
                      className="flex h-8 w-8 flex-none items-center justify-center rounded-full sm:h-9 sm:w-9"
                      style={{
                        backgroundColor: tx.type === 'income' ? 'var(--good-bg)' : 'var(--critical-bg)',
                        color: tx.type === 'income' ? 'var(--good)' : 'var(--critical)',
                      }}
                    >
                      {tx.type === 'income' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                        {tx.note || (tx.type === 'income' ? 'Income' : cat?.label)}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {tx.type === 'expense' ? cat?.label : 'Income'}
                      </p>
                    </div>
                    <p
                      className="tabular-nums flex-none text-sm font-semibold"
                      style={{ color: tx.type === 'income' ? 'var(--good)' : 'var(--critical)' }}
                    >
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
