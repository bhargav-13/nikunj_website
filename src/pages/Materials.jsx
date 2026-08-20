import { useMemo, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { useMaterials } from '../context/MaterialsContext'
import { useMaterialModal } from '../context/MaterialModalContext'
import { MATERIAL_TYPES } from '../lib/materials'
import MaterialList from '../components/MaterialList'
import MaterialForm from '../components/MaterialForm'

export default function Materials() {
  const { logs, stockByMaterial, loading } = useMaterials()
  const { openAdd } = useMaterialModal()
  const [materialFilter, setMaterialFilter] = useState('all')

  const filtered = useMemo(
    () => (materialFilter === 'all' ? logs : logs.filter((l) => l.materialId === materialFilter)),
    [logs, materialFilter],
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
        <p className="text-sm text-[var(--text-muted)]">Loading material logs...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] sm:text-2xl">Materials</h1>
          <p className="text-xs text-[var(--text-muted)] sm:text-sm">Track cement, reti, kapachi, lokhand, eet</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 active:scale-[0.97] transition-transform"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Stock summary */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
        {MATERIAL_TYPES.map((m) => {
          const stock = stockByMaterial[m.id] || {}
          const entries = Object.entries(stock).filter(([, qty]) => qty !== 0)
          return (
            <button
              key={m.id}
              onClick={() => setMaterialFilter(materialFilter === m.id ? 'all' : m.id)}
              className={`rounded-xl border p-3 text-left transition-colors ${
                materialFilter === m.id
                  ? 'border-[var(--accent)] bg-[var(--accent-bg)]'
                  : 'border-[var(--border)] bg-[var(--surface-1)] hover:border-[var(--border-strong)]'
              }`}
            >
              <p className="text-[11px] font-medium text-[var(--text-muted)]">{m.label}</p>
              {entries.length === 0 ? (
                <p className="tabular-nums text-lg font-bold text-[var(--text-primary)]">0</p>
              ) : (
                entries.map(([unit, qty]) => (
                  <p key={unit} className="tabular-nums text-lg font-bold text-[var(--text-primary)]">
                    {qty.toLocaleString('en-IN')} <span className="text-xs font-medium">{unit}</span>
                  </p>
                ))
              )}
            </button>
          )
        })}
      </div>

      {materialFilter !== 'all' && (
        <button
          onClick={() => setMaterialFilter('all')}
          className="self-start text-xs font-medium text-[var(--accent)] hover:underline"
        >
          Clear filter — showing all materials
        </button>
      )}

      <MaterialList logs={filtered} emptyMessage="No material logs match this filter." />

      <MaterialForm />
    </div>
  )
}
