import { useState } from 'react'
import { Plus, TrendingDown, TrendingUp, RefreshCw, Loader2 } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useModal } from '../context/ModalContext'
import { sumByPeriod, sumLastNDays, getPeriodRanges } from '../lib/dateUtils'
import { isWithinInterval, parseISO, startOfDay } from 'date-fns'
import StatCard from '../components/StatCard'
import CategoryBreakdown from '../components/CategoryBreakdown'
import TransactionList from '../components/TransactionList'
import { personById } from '../lib/constants'

const DAY_OPTIONS = [3, 5, 7, 10, 15, 20, 30, 45, 60, 90]

export default function Dashboard() {
  const { personId, transactions, balance, loading, syncing, refresh } = useData()
  const { openAdd } = useModal()
  const person = personById(personId)
  const [customDays, setCustomDays] = useState(10)

  const expenseTotals = sumByPeriod(transactions, 'expense')
  const incomeTotals = sumByPeriod(transactions, 'income')
  const customExpenseTotal = sumLastNDays(transactions, 'expense', customDays)

  const ranges = getPeriodRanges()
  const monthTransactions = transactions.filter((tx) =>
    isWithinInterval(startOfDay(parseISO(tx.date)), ranges.month),
  )

  const recent = [...transactions]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt.localeCompare(a.createdAt)))
    .slice(0, 8)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
        <p className="text-sm text-[var(--text-muted)]">Loading your data...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--text-muted)]">Welcome back,</p>
          <h1 className="text-xl font-bold text-[var(--text-primary)] sm:text-2xl">{person?.name}</h1>
        </div>
        <button
          onClick={refresh}
          disabled={syncing}
          className="hidden md:flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-1)] transition-colors disabled:opacity-50"
        >
          {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Sync
        </button>
      </div>

      {/* Balance hero */}
      <div className="rounded-2xl bg-[var(--sidebar-bg)] p-5 text-white shadow-[var(--shadow-md)] sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--sidebar-text)]">Current Balance</p>
        <p className="mt-1 text-3xl font-bold tabular-nums sm:text-4xl">
          ₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </p>
        <div className="mt-3 flex flex-col gap-1.5 text-sm sm:mt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-1.5">
          <span className="flex min-w-0 items-center gap-1.5 text-[var(--sidebar-text)]">
            <TrendingUp size={15} className="flex-none text-[#5fd15f]" />
            <span className="truncate">
              Income ₹{incomeTotals.month.toLocaleString('en-IN')} this month
            </span>
          </span>
          <span className="flex min-w-0 items-center gap-1.5 text-[var(--sidebar-text)]">
            <TrendingDown size={15} className="flex-none text-[#f28b8b]" />
            <span className="truncate">
              Spent ₹{expenseTotals.month.toLocaleString('en-IN')} this month
            </span>
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5">
          <button
            onClick={() => openAdd('expense')}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-white/10 py-3 text-sm font-semibold backdrop-blur hover:bg-white/20 active:scale-[0.97] transition-transform"
          >
            <Plus size={16} /> Expense
          </button>
          <button
            onClick={() => openAdd('income')}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-white/10 py-3 text-sm font-semibold backdrop-blur hover:bg-white/20 active:scale-[0.97] transition-transform"
          >
            <Plus size={16} /> Income
          </button>
        </div>
      </div>

      {/* Expense summary stat cards */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Expense Summary</h2>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4">
          <StatCard label="Today" amount={expenseTotals.today} accent="var(--critical)" />
          <StatCard label="This Week" amount={expenseTotals.week} accent="var(--critical)" />
          <StatCard
            label="Last"
            amount={customExpenseTotal}
            accent="var(--critical)"
            control={
              <select
                value={customDays}
                onChange={(e) => setCustomDays(Number(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                className="flex-none rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--text-secondary)] outline-none focus:border-[var(--accent)]"
              >
                {DAY_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}d
                  </option>
                ))}
              </select>
            }
          />
          <StatCard label="This Month" amount={expenseTotals.month} accent="var(--critical)" />
        </div>
      </div>

      <CategoryBreakdown transactions={monthTransactions} />

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Recent Activity</h2>
        </div>
        <TransactionList
          transactions={recent}
          emptyMessage="No entries yet. Tap 'Add Expense' or 'Add Income' to get started."
        />
      </div>
    </div>
  )
}
