import { useEffect, useRef, useState } from 'react'
import { X, Trash2, Loader2, Pin } from 'lucide-react'
import { useData } from '../context/DataContext'
import { createNote, updateNote, deleteNote } from '../lib/notes'
import { listAttachments, uploadPending, deleteAllAttachments } from '../lib/attachments'
import { personById } from '../lib/constants'
import { formatCreatedAt } from '../lib/dateUtils'
import AttachmentPicker from './AttachmentPicker'

// formState: null (closed) | { note: null } (add) | { note } (edit)
export default function NoteForm({ formState, onClose, onSaved, onDeleted }) {
  const { personId } = useData()
  const isOpen = Boolean(formState)
  const note = formState?.note

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [pinned, setPinned] = useState(false)
  const [savedNote, setSavedNote] = useState(null)
  const [attachments, setAttachments] = useState([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const titleRef = useRef(null)

  useEffect(() => {
    if (!formState) return
    setTitle(note?.title || '')
    setBody(note?.body || '')
    setPinned(note?.pinned || false)
    setSavedNote(note || null)
    setAttachments([])
    setError('')
    setSubmitting(false)
    if (note) {
      listAttachments(note.id, 'note').then(setAttachments).catch(() => {})
    }
    const t = setTimeout(() => titleRef.current?.focus(), 100)
    return () => clearTimeout(t)
  }, [formState, note])

  if (!isOpen) return null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() && !body.trim() && attachments.length === 0) {
      setError('Write something first')
      return
    }

    setSubmitting(true)
    setError('')
    let saved
    try {
      const fields = { title, body, pinned }
      saved = savedNote ? await updateNote(savedNote.id, fields, personId) : await createNote(fields, personId)
    } catch {
      setSubmitting(false)
      setError('Failed to save. Check your connection.')
      return
    }

    // Upload files picked before the note existed.
    try {
      await uploadPending(saved.id, attachments, 'note')
    } catch (err) {
      // Note is saved; keep the sheet open so the remaining files can be retried.
      const kept = attachments.filter((a) => !a.pending).concat(err.uploaded ?? [])
      setSavedNote(saved)
      setAttachments(kept)
      setSubmitting(false)
      onSaved({ ...saved, attachmentCount: kept.length })
      setError('Note saved, but some files failed to upload. Try attaching them again.')
      return
    }

    setSubmitting(false)
    onSaved({ ...saved, attachmentCount: attachments.length })
    onClose()
  }

  async function handleDelete() {
    if (!savedNote || !confirm('Delete this note?')) return
    setSubmitting(true)
    try {
      await deleteAllAttachments(savedNote.id, 'note').catch(() => {})
      await deleteNote(savedNote.id)
    } catch {
      setSubmitting(false)
      setError('Failed to delete. Check your connection.')
      return
    }
    setSubmitting(false)
    onDeleted(savedNote.id)
    onClose()
  }

  const author = personById(note?.updatedBy || note?.createdBy)?.name

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
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{note ? 'Edit Note' : 'New Note'}</h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPinned((p) => !p)}
              className={`rounded-full p-1.5 transition-colors active:scale-90 ${
                pinned ? 'bg-[var(--accent-bg)] text-[var(--accent)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
              }`}
              aria-label={pinned ? 'Unpin note' : 'Pin note'}
              aria-pressed={pinned}
            >
              <Pin size={18} className={pinned ? 'fill-current' : ''} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] active:scale-90 transition-transform"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="mb-3 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-3)] px-4 py-3 text-base font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
        />

        <textarea
          rows={8}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your note..."
          className="mb-3 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-3)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
        />

        <AttachmentPicker
          ownerId={savedNote?.id}
          kind="note"
          attachments={attachments}
          onChange={setAttachments}
          disabled={submitting}
        />

        {note?.updatedAt && (
          <p className="mb-3 text-[11px] text-[var(--text-muted)]">
            Last updated {formatCreatedAt(note.updatedAt)}
            {author && ` by ${author}`}
          </p>
        )}

        {error && <p className="mb-3 text-sm font-medium text-[var(--critical)]">{error}</p>}

        <div className="flex items-center gap-2">
          {savedNote && (
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
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-3.5 font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-70"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {note ? 'Save Changes' : 'Save Note'}
          </button>
        </div>
      </form>
    </div>
  )
}
