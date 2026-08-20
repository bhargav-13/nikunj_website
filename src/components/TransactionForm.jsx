import { useEffect, useRef, useState } from 'react'
import { X, Trash2, Loader2, Clock } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useModal } from '../context/ModalContext'
import { EXPENSE_CATEGORIES } from '../lib/constants'
import { todayKey, formatCreatedAt } from '../lib/dateUtils'
import { listAttachments } from '../lib/attachments'
import AttachmentPicker from './AttachmentPicker'

export default function TransactionForm() {
  const { formState, close } = useModal()
  const { addTransaction, updateTransaction, deleteTransaction, syncing } = useData()
  const isOpen = Boolean(formState)
  const isEdit = formState?.mode === 'edit'
  const tx = formState?.transaction

  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayKey())
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].id)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [savedTx, setSavedTx] = useState(null)
  const [attachments, setAttachments] = useState([])
  const amountRef = useRef(null)

  useEffect(() => {
    if (!formState) return
    setType(formState.type)
    setAmount(tx ? String(tx.amount) : '')
    setDate(tx ? tx.date : todayKey())
    setCategory(tx?.category || EXPENSE_CATEGORIES[0].id)
    setNote(tx?.note || '')
    setError('')
    setSubmitting(false)
    setSavedTx(tx || null)
    setAttachments([])
    if (tx) {
      listAttachments(tx.id).then(setAttachments).catch(() => {})
    }
    const t = setTimeout(() => amountRef.current?.focus(), 100)
    return () => clearTimeout(t)
  }, [formState, tx])

  if (!isOpen) return null

  async function handleSubmit(e) {
    e.preventDefault()
    const numAmount = Number(amount)
    if (!amount || Number.isNaN(numAmount) || numAmount <= 0) {
      setError('Enter a valid amount')
      return
    }
    if (!date) {
      setError('Pick a date')
      return
    }

    setSubmitting(true)
    const payload = { type, amount: numAmount, date, category: type === 'expense' ? category : null, note }

    if (isEdit) {
      const success = await updateTransaction(tx.id, payload)
      setSubmitting(false)
      if (success) close()
      else setError('Failed to save. Check your connection.')
      return
    }

    const created = await addTransaction(payload)
    setSubmitting(false)
    if (created) setSavedTx(created)
    else setError('Failed to save. Check your connection.')
  }

  async function handleDelete() {
    if (tx && confirm('Delete this entry?')) {
      setSubmitting(true)
      const success = await deleteTransaction(tx.id)
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
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {isEdit ? 'Edit Entry' : type === 'income' ? 'Add Income' : 'Add Expense'}
          </h2>
          <button
            type="button"
            onClick={close}
            className="rounded-full p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] active:scale-90 transition-transform"
          >
            <X size={20} />
          </button>
        </div>

        {/* Audit info when editing */}
        {isEdit && tx?.createdAt && (
          <div className="mb-4 flex items-center gap-1.5 rounded-lg bg-[var(--surface-2)] px-3 py-2 text-[11px] text-[var(--text-muted)]">
            <Clock size={11} className="flex-none opacity-60" />
            Created {formatCreatedAt(tx.createdAt)}
          </div>
        )}

        {/* Type toggle */}
        {!isEdit && (
          <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-[var(--surface-2)] p-1">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`rounded-lg py-2.5 text-sm font-medium transition-all ${
                type === 'expense'
                  ? 'bg-[var(--critical)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`rounded-lg py-2.5 text-sm font-medium transition-all ${
                type === 'income'
                  ? 'bg-[var(--good)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              Income
            </button>
          </div>
        )}

        {/* Amount */}
        <label className="mb-3 block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
            Amount (₹)
          </span>
          <input
            ref={amountRef}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-3)] px-4 py-3.5 text-2xl font-bold tabular-nums text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
          />
        </label>

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

        {/* Category grid */}
        {type === 'expense' && (
          <label className="mb-3 block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
              Category
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {EXPENSE_CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`rounded-lg border px-1.5 py-2 text-[11px] font-medium transition-all active:scale-95 ${
                    category === c.id
                      ? 'border-transparent text-white shadow-sm'
                      : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                  }`}
                  style={category === c.id ? { backgroundColor: c.color } : undefined}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </label>
        )}

        {/* Note */}
        <label className="mb-4 block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
            Note {type === 'income' ? '(source)' : '(optional)'}
          </span>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={type === 'income' ? 'e.g. Client advance' : 'e.g. Cement bags'}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-3)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
          />
        </label>

        {/* Attachments — available once the entry exists (after first save, or when editing) */}
        {savedTx && (
          <AttachmentPicker
            transactionId={savedTx.id}
            attachments={attachments}
            onChange={setAttachments}
            disabled={submitting}
          />
        )}

        {error && <p className="mb-3 text-sm font-medium text-[var(--critical)]">{error}</p>}

        {/* Actions */}
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
          {!isEdit && savedTx ? (
            <button
              type="button"
              onClick={close}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.97]"
              style={{ backgroundColor: type === 'income' ? 'var(--good)' : 'var(--critical)' }}
            >
              Done
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-70"
              style={{ backgroundColor: type === 'income' ? 'var(--good)' : 'var(--critical)' }}
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {isEdit ? 'Save Changes' : type === 'income' ? 'Add Income' : 'Add Expense'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
