import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Receipt, Plus, Users, HardHat, RefreshCw, Loader2, AlertCircle, X } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useModal } from '../context/ModalContext'
import { personById } from '../lib/constants'
import TransactionForm from './TransactionForm'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: Receipt },
]

export default function AppShell({ children }) {
  const { personId, syncing, error, clearError, refresh, loading } = useData()
  const { openAdd } = useModal()
  const navigate = useNavigate()
  const person = personById(personId)

  return (
    <div className="min-h-screen bg-[var(--surface-2)]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-[var(--sidebar-bg)] md:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)] text-white">
            <HardHat size={20} />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-white">SiteLedger</p>
            <p className="text-[11px] leading-tight text-[var(--sidebar-text)]">Expense Manager</p>
          </div>
        </div>

        <nav className="mt-4 flex flex-col gap-1 px-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--sidebar-bg-hover)] text-[var(--sidebar-text-active)]'
                    : 'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-bg-hover)] hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-3">
          <button
            onClick={() => openAdd('expense')}
            className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--critical)] py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 active:scale-[0.97] transition-transform"
          >
            <Plus size={16} /> Add Expense
          </button>
          <button
            onClick={() => openAdd('income')}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--good)] py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 active:scale-[0.97] transition-transform"
          >
            <Plus size={16} /> Add Income
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex w-full items-center gap-3 rounded-lg border border-white/10 px-3 py-2.5 text-left hover:bg-[var(--sidebar-bg-hover)] transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white">
              {person?.name?.[0] ?? '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{person?.name}</p>
              <p className="text-[11px] text-[var(--sidebar-text)]">Switch person</p>
            </div>
            <Users size={14} className="text-[var(--sidebar-text)]" />
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-1)]/95 backdrop-blur-md px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-white">
            <HardHat size={16} />
          </div>
          <p className="text-sm font-bold text-[var(--text-primary)]">SiteLedger</p>
          {(syncing || loading) && (
            <Loader2 size={14} className="animate-spin text-[var(--accent)]" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="rounded-full p-2 text-[var(--text-muted)] hover:bg-[var(--surface-2)] active:scale-90 transition-transform"
            aria-label="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 rounded-full border border-[var(--border)] py-1 pl-1 pr-3 active:scale-95 transition-transform"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-bold text-white">
              {person?.name?.[0] ?? '?'}
            </div>
            <span className="text-xs font-medium text-[var(--text-primary)]">{person?.name}</span>
          </button>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="md:ml-60">
          <div className="mx-4 mt-3 flex items-center gap-2 rounded-lg bg-[var(--critical-bg)] border border-[var(--critical)]/20 px-4 py-2.5 md:mx-8 animate-fade-in">
            <AlertCircle size={16} className="flex-none text-[var(--critical)]" />
            <p className="flex-1 text-sm text-[var(--critical)]">{error}</p>
            <button onClick={clearError} className="rounded-full p-1 hover:bg-[var(--critical)]/10">
              <X size={14} className="text-[var(--critical)]" />
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="pb-20 md:ml-60 md:pb-8">
        <div className="mx-auto max-w-5xl px-4 py-4 md:px-8 md:py-8">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-[var(--border)] bg-[var(--surface-1)]/95 backdrop-blur-md px-2 pb-[env(safe-area-inset-bottom)] md:hidden">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
              isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
            }`
          }
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <button
          onClick={() => openAdd('expense')}
          className="-mt-5 flex h-13 w-13 flex-none items-center justify-center rounded-full bg-[var(--critical)] text-white shadow-[var(--shadow-lg)] active:scale-90 transition-transform"
          aria-label="Add expense"
        >
          <Plus size={26} />
        </button>

        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
              isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
            }`
          }
        >
          <Receipt size={20} />
          History
        </NavLink>
      </nav>

      <TransactionForm />
    </div>
  )
}
