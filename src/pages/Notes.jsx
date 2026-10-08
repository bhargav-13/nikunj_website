import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Plus, Search, Pin, Paperclip, X } from 'lucide-react'
import { listNotes, setNotePinned } from '../lib/notes'
import { personById } from '../lib/constants'
import { formatCreatedAt } from '../lib/dateUtils'
import NoteForm from '../components/NoteForm'

function sortNotes(list) {
  return [...list].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt))
}

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [formState, setFormState] = useState(null)

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setNotes(await listNotes())
    } catch {
      setError('Could not load notes. Check your connection.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return notes
    return notes.filter((n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q))
  }, [notes, query])

  function handleSaved(saved) {
    setNotes((prev) => sortNotes([saved, ...prev.filter((n) => n.id !== saved.id)]))
  }

  function handleDeleted(id) {
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  async function togglePin(note) {
    const pinned = !note.pinned
    setNotes((prev) => sortNotes(prev.map((n) => (n.id === note.id ? { ...n, pinned } : n))))
    try {
      await setNotePinned(note.id, pinned)
    } catch {
      setNotes((prev) => sortNotes(prev.map((n) => (n.id === note.id ? { ...n, pinned: note.pinned } : n))))
      setError('Failed to update pin. Check your connection.')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] sm:text-2xl">Notes</h1>
          <p className="text-xs text-[var(--text-muted)] sm:text-sm">Site notes, contacts, reminders</p>
        </div>
        <button
          onClick={() => setFormState({ note: null })}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 active:scale-[0.97] transition-transform"
        >
          <Plus size={16} /> New
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-1)] py-2.5 pl-9 pr-9 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {error && <p className="text-sm font-medium text-[var(--critical)]">{error}</p>}

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
          <p className="text-sm text-[var(--text-muted)]">Loading notes...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-1)] p-8 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            {query ? 'No notes match your search.' : 'No notes yet. Tap New to write one.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {filtered.map((note) => {
            const author = personById(note.updatedBy || note.createdBy)?.name
            return (
              <div
                key={note.id}
                className={`relative rounded-xl border bg-[var(--surface-1)] transition-colors hover:border-[var(--border-strong)] ${
                  note.pinned ? 'border-[var(--accent)]/40' : 'border-[var(--border)]'
                }`}
              >
                <button onClick={() => setFormState({ note })} className="block w-full p-3 pr-10 text-left">
                  {note.title && (
                    <p className="mb-0.5 truncate text-sm font-semibold text-[var(--text-primary)]">{note.title}</p>
                  )}
                  {note.body && (
                    <p className="line-clamp-4 whitespace-pre-wrap text-sm text-[var(--text-secondary)]">{note.body}</p>
                  )}
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                    <span>{formatCreatedAt(note.updatedAt)}</span>
                    {author && (
                      <>
                        <span className="text-[var(--border-strong)]">·</span>
                        <span>{author}</span>
                      </>
                    )}
                    {note.attachmentCount > 0 && (
                      <span className="ml-auto flex items-center gap-0.5">
                        <Paperclip size={11} /> {note.attachmentCount}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => togglePin(note)}
                  className={`absolute right-2 top-2 rounded-full p-1.5 transition-colors active:scale-90 ${
                    note.pinned ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
                  }`}
                  aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
                >
                  <Pin size={14} className={note.pinned ? 'fill-current' : ''} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <NoteForm
        formState={formState}
        onClose={() => setFormState(null)}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </div>
  )
}
