import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import { EXPENSE_CATEGORIES } from '../lib/constants'
import TransactionList from '../components/TransactionList'
import { Filter, X, Loader2 } from 'lucide-react'

const TYPE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'expense', label: 'Expenses' },
  { id: 'income', label: 'Income' },
]

export default function Transactions() {
  const { transactions, loading } = useData()
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const hasFilters = typeFilter !== 'all' || categoryFilter !== 'all' || from || to

  function clearFilters() {
    setTypeFilter('all')
    setCategoryFilter('all')
    setFrom('')
    setTo('')
  }

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false
      if (categoryFilter !== 'all' && (tx.category || 'other') !== categoryFilter) return false
      if (from && tx.date < from) return false
      if (to && tx.date > to) return false
      return true
    })
  }, [transactions, typeFilter, categoryFilter, from, to])

  const totals = filtered.reduce(
    (acc, tx) => {
      if (tx.type === 'income') acc.income += tx.amount
      else acc.expense += tx.amount
      return acc
    },
    { income: 0, expense: 0 },
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
        <p className="text-sm text-[var(--text-muted)]">Loading transactions...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] sm:text-2xl">Transactions</h1>
          <p className="text-xs text-[var(--text-muted)] sm:text-sm">{filtered.length} entries</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors sm:hidden ${
            hasFilters
              ? 'border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--accent)]'
              : 'border-[var(--border)] text-[var(--text-secondary)]'
          }`}
        >
          <Filter size={14} />
          Filter{hasFilters ? 's on' : ''}
        </button>
      </div>

      {/* Filters — always visible on desktop, toggle on mobile */}
      <div className={`rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-3 shadow-[var(--shadow-sm)] sm:p-4 ${!showFilters ? 'hidden sm:block' : 'animate-fade-in'}`}>
        {/* Type toggle */}
        <div className="mb-3 flex gap-1 rounded-lg bg-[var(--surface-2)] p-1">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setTypeFilter(f.id)}
              className={`flex-1 rounded-md py-2 text-xs font-medium transition-colors sm:text-sm ${
                typeFilter === f.id
                  ? 'bg-[var(--surface-1)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-[var(--text-muted)]">Category</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-3)] px-2.5 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            >
              <option value="all">All categories</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-[var(--text-muted)]">From</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-3)] px-2.5 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-[var(--text-muted)]">To</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-3)] px-2.5 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
          </label>
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="mt-2.5 flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:underline"
          >
            <X size={12} /> Clear all filters
          </button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-3 text-center">
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Income</p>
          <p className="tabular-nums text-lg font-bold" style={{ color: 'var(--good)' }}>
            ₹{totals.income.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-3 text-center">
          <p className="text-[11px] font-medium text-[var(--text-muted)]">Expense</p>
          <p className="tabular-nums text-lg font-bold" style={{ color: 'var(--critical)' }}>
            ₹{totals.expense.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <TransactionList transactions={filtered} emptyMessage="No transactions match these filters." />
    </div>
  )
}
