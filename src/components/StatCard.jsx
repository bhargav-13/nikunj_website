export default function StatCard({ label, amount, sublabel, accent = 'var(--accent)', control }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-3 shadow-[var(--shadow-sm)] sm:p-4">
      <div className="mb-1.5 flex min-w-0 items-center justify-between gap-2 sm:mb-2">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="h-2 w-2 flex-none rounded-full" style={{ backgroundColor: accent }} />
          <p className="truncate text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)] sm:text-xs">{label}</p>
        </span>
        {control}
      </div>
      <p className="tabular-nums text-lg font-bold text-[var(--text-primary)] sm:text-2xl">
        ₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
      </p>
      {sublabel && <p className="mt-1 text-[10px] text-[var(--text-muted)] sm:text-xs">{sublabel}</p>}
    </div>
  )
}
