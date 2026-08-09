import { useNavigate } from 'react-router-dom'
import { HardHat, ChevronRight, Cloud, Loader2 } from 'lucide-react'
import { useData } from '../context/DataContext'
import { PERSONS } from '../lib/constants'

export default function PersonSelect() {
  const { setPersonId, allTransactionsCount, loading } = useData()
  const navigate = useNavigate()

  function choose(id) {
    setPersonId(id)
    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--surface-2)] px-4">
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent)] text-white shadow-[var(--shadow-md)]">
          <HardHat size={32} />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">SiteLedger</h1>
          <p className="text-sm text-[var(--text-muted)]">Site expense & income tracker</p>
        </div>
      </div>

      <div className="w-full max-w-sm">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Who is entering today?
        </p>
        <div className="flex flex-col gap-3">
          {PERSONS.map((p) => (
            <button
              key={p.id}
              onClick={() => choose(p.id)}
              className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-left shadow-[var(--shadow-sm)] transition-all hover:border-[var(--accent)] hover:shadow-[var(--shadow-md)] active:scale-[0.98]"
            >
              <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-[var(--accent)] text-lg font-bold text-white">
                {p.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-[var(--text-primary)]">{p.name}</p>
                <p className="text-xs text-[var(--text-muted)]">View dashboard & entries</p>
              </div>
              <ChevronRight size={18} className="flex-none text-[var(--text-muted)]" />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2 text-xs text-[var(--text-muted)]">
        {loading ? (
          <>
            <Loader2 size={12} className="animate-spin" />
            <span>Connecting to cloud...</span>
          </>
        ) : (
          <>
            <Cloud size={12} className="text-[var(--good)]" />
            <span>{allTransactionsCount} entries synced to cloud</span>
          </>
        )}
      </div>
    </div>
  )
}
