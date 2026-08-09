import { EXPENSE_CATEGORIES } from '../lib/constants'

export default function CategoryBreakdown({ transactions }) {
  const totals = EXPENSE_CATEGORIES.map((cat) => ({
    ...cat,
    total: transactions
      .filter((tx) => tx.type === 'expense' && (tx.category || 'other') === cat.id)
      .reduce((sum, tx) => sum + tx.amount, 0),
  })).filter((c) => c.total > 0)

  const grandTotal = totals.reduce((sum, c) => sum + c.total, 0)
  const rows = totals.sort((a, b) => b.total - a.total)

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-sm)]">
        <h3 className="mb-1 text-sm font-semibold text-[var(--text-primary)]">Spend by category (this month)</h3>
        <p className="mt-3 text-sm text-[var(--text-muted)]">No expenses recorded this month yet.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-sm)]">
      <h3 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">Spend by category (this month)</h3>
      <div className="flex flex-col gap-3">
        {rows.map((c) => {
          const pct = grandTotal > 0 ? (c.total / grandTotal) * 100 : 0
          return (
            <div key={c.id}>
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-[var(--text-secondary)]">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.label}
                </span>
                <span className="tabular-nums text-[var(--text-primary)]">
                  ₹{c.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: c.color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
