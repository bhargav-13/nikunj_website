import { useEffect, useRef, useState } from 'react'
import { X, Trash2, Loader2 } from 'lucide-react'
import { useMaterials } from '../context/MaterialsContext'
import { useMaterialModal } from '../context/MaterialModalContext'
import { useData } from '../context/DataContext'
import { MATERIAL_TYPES, defaultUnitFor } from '../lib/materials'
import { todayKey } from '../lib/dateUtils'

export default function MaterialForm() {
  const { formState, close } = useMaterialModal()
  const { addLog, updateLog, deleteLog, syncing } = useMaterials()
  const { personId } = useData()
  const isOpen = Boolean(formState)
  const isEdit = formState?.mode === 'edit'
  const log = formState?.log

  const [materialId, setMaterialId] = useState(MATERIAL_TYPES[0].id)
  const [direction, setDirection] = useState('in')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState(defaultUnitFor(MATERIAL_TYPES[0].id))
  const [date, setDate] = useState(todayKey())
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const qtyRef = useRef(null)

  const material = MATERIAL_TYPES.find((m) => m.id === materialId) ?? MATERIAL_TYPES[0]

  useEffect(() => {
    if (!formState) return
    setMaterialId(log?.materialId || MATERIAL_TYPES[0].id)
    setDirection(log?.direction || 'in')
    setQuantity(log ? String(log.quantity) : '')
    setUnit(log?.unit || defaultUnitFor(MATERIAL_TYPES[0].id))
    setDate(log?.date || todayKey())
    setNote(log?.note || '')
    setError('')
    setSubmitting(false)
    const t = setTimeout(() => qtyRef.current?.focus(), 100)
    return () => clearTimeout(t)
  }, [formState, log])

  if (!isOpen) return null

  function handleMaterialChange(id) {
    setMaterialId(id)
    setUnit(defaultUnitFor(id))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const numQty = Number(quantity)
    if (!quantity || Number.isNaN(numQty) || numQty <= 0) {
      setError('Enter a valid quantity')
      return
    }
    if (!date) {
      setError('Pick a date')
      return
    }

    setSubmitting(true)
    const payload = { personId, materialId, direction, quantity: numQty, unit, date, note }

    const success = isEdit ? await updateLog(log.id, payload) : await addLog(payload)
    setSubmitting(false)
    if (success) close()
    else setError('Failed to save. Check your connection.')
  }

  async function handleDelete() {
    if (log && confirm('Delete this entry?')) {
      setSubmitting(true)
      const success = await deleteLog(log.id)
      setSubmitting(false)
      if (success) close()
      else setError('Failed to delete. Check your connection.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center animate-fade-in"
      onClick={close}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-t-2xl bg-[var(--surface-1)] p-5 shadow-[var(--shadow-lg)] sm:rounded-2xl animate-slide-up"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {isEdit ? 'Edit Material Log' : 'Add Material Log'}
          </h2>
          <button
            type="button"
            onClick={close}
            className="rounded-full p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] active:scale-90 transition-transform"
          >
            <X size={20} />
          </button>
        </div>

        {/* In / Out toggle */}
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-[var(--surface-2)] p-1">
          <button
            type="button"
            onClick={() => setDirection('in')}
            className={`rounded-lg py-2.5 text-sm font-medium transition-all ${
              direction === 'in' ? 'bg-[var(--good)] text-white shadow-sm' : 'text-[var(--text-secondary)]'
            }`}
          >
            Received (In)
          </button>
          <button
            type="button"
            onClick={() => setDirection('out')}
            className={`rounded-lg py-2.5 text-sm font-medium transition-all ${
              direction === 'out' ? 'bg-[var(--critical)] text-white shadow-sm' : 'text-[var(--text-secondary)]'
            }`}
          >
            Used (Out)
          </button>
        </div>

        {/* Material grid */}
        <label className="mb-3 block">
          <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
            Material
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {MATERIAL_TYPES.map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => handleMaterialChange(m.id)}
                className={`rounded-lg border px-2 py-2.5 text-xs font-medium transition-all active:scale-95 ${
                  materialId === m.id
                    ? 'border-transparent bg-[var(--accent)] text-white shadow-sm'
                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </label>

        {/* Quantity + Unit */}
        <div className="mb-3 grid grid-cols-3 gap-2">
          <label className="col-span-2 block">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
              Quantity
            </span>
            <input
              ref={qtyRef}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-3)] px-4 py-3.5 text-2xl font-bold tabular-nums text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
              Unit
            </span>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-3)] px-2 py-3.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
            >
              {material.units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Date */}
        <label className="mb-3 block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
            Date
          </span>
          <input
            type="date"
            value={date}
            max={todayKey()}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-3)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
          />
        </label>

        {/* Note */}
        <label className="mb-4 block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
            Note (optional)
          </span>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. From ABC Supplier"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-3)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
          />
        </label>

        {error && <p className="mb-3 text-sm font-medium text-[var(--critical)]">{error}</p>}

        <div className="flex items-center gap-2">
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              className="flex items-center justify-center rounded-xl border border-[var(--critical)] p-3.5 text-[var(--critical)] hover:bg-[var(--critical-bg)] active:scale-95 transition-all disabled:opacity-50"
              aria-label="Delete"
            >
              <Trash2 size={18} />
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-70"
            style={{ backgroundColor: direction === 'in' ? 'var(--good)' : 'var(--critical)' }}
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {isEdit ? 'Save Changes' : 'Add Entry'}
          </button>
        </div>
      </form>
    </div>
  )
}
