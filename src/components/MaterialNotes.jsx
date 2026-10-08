import { useEffect, useRef, useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useMaterials } from '../context/MaterialsContext'
import { useData } from '../context/DataContext'
import { materialById } from '../lib/materials'
import { personById } from '../lib/constants'
import { formatCreatedAt } from '../lib/dateUtils'

export default function MaterialNotes({ materialId, onClose }) {
  const { notes, saveNote } = useMaterials()
  const { personId } = useData()
  const current = materialId ? notes[materialId] : null
  const material = materialById(materialId)

  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const textRef = useRef(null)

  useEffect(() => {
    if (!materialId) return
    setText(current?.note || '')
    setError('')
    setSubmitting(false)
    const t = setTimeout(() => textRef.current?.focus(), 100)
    return () => clearTimeout(t)
    // Only reset when a different material is opened, not when notes refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialId])

  if (!materialId) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    const success = await saveNote(materialId, text, personId)
    setSubmitting(false)
    if (success) onClose()
    else setError('Failed to save. Check your connection.')
  }

  const updatedBy = personById(current?.updatedBy)?.name

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center animate-fade-in"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-[var(--surface-1)] p-5 shadow-[var(--shadow-lg)] sm:rounded-2xl animate-slide-up"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{material?.label ?? materialId} Notes</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] active:scale-90 transition-transform"
          >
            <X size={20} />
          </button>
        </div>

        <textarea
          ref={textRef}
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'e.g. Supplier: ABC Traders\nPhone: 98765 43210\nRate: ₹380 / bag'}
          className="mb-2 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-3)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
        />

        {current?.updatedAt && (
          <p className="mb-3 text-[11px] text-[var(--text-muted)]">
            Last updated {formatCreatedAt(current.updatedAt)}
            {updatedBy && ` by ${updatedBy}`}
          </p>
        )}

        {error && <p className="mb-3 text-sm font-medium text-[var(--critical)]">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-3.5 font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-70"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          Save Notes
        </button>
      </form>
    </div>
  )
}
