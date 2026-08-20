import { useRef, useState } from 'react'
import { Paperclip, FileText, X, Loader2, Expand } from 'lucide-react'
import { isImage, uploadAttachment, deleteAttachment } from '../lib/attachments'

const ACCEPT = 'image/*,application/pdf'

export default function AttachmentPicker({ transactionId, attachments, onChange, disabled }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [lightbox, setLightbox] = useState(null)
  const inputRef = useRef(null)

  async function handleFiles(e) {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (files.length === 0) return

    setUploading(true)
    setError('')
    try {
      for (const file of files) {
        const uploaded = await uploadAttachment(transactionId, file)
        onChange((prev) => [...prev, uploaded])
      }
    } catch {
      setError('Upload failed. Check your connection.')
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove(attachment) {
    if (!confirm('Remove this document?')) return
    try {
      await deleteAttachment(attachment)
      onChange((prev) => prev.filter((a) => a.id !== attachment.id))
    } catch {
      setError('Failed to remove. Check your connection.')
    }
  }

  return (
    <div className="mb-4">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
        Documents (optional)
      </span>

      {attachments.length > 0 && (
        <div className="mb-2 grid grid-cols-4 gap-2">
          {attachments.map((a) => (
            <div key={a.id} className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-3)]">
              {isImage(a.fileType) ? (
                <button
                  type="button"
                  onClick={() => setLightbox(a)}
                  className="flex h-full w-full items-center justify-center"
                >
                  <img src={a.url} alt={a.fileName} className="h-full w-full object-cover" />
                  <span className="absolute bottom-1 right-1 rounded-full bg-black/50 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <Expand size={11} />
                  </span>
                </button>
              ) : (
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full w-full flex-col items-center justify-center gap-1 p-1 text-center"
                >
                  <FileText size={20} className="text-[var(--text-muted)]" />
                  <span className="line-clamp-2 break-all text-[9px] text-[var(--text-muted)]">{a.fileName}</span>
                </a>
              )}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(a)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 active:scale-90 transition-all"
                  aria-label="Remove document"
                >
                  <X size={11} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading || disabled}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border-strong)] py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-2)] active:scale-[0.98] transition-all disabled:opacity-60"
      >
        {uploading ? <Loader2 size={15} className="animate-spin" /> : <Paperclip size={15} />}
        {uploading ? 'Uploading...' : 'Attach photo or PDF'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      {error && <p className="mt-2 text-xs font-medium text-[var(--critical)]">{error}</p>}

      {lightbox && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 animate-fade-in"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close preview"
          >
            <X size={20} />
          </button>
          <img
            src={lightbox.url}
            alt={lightbox.fileName}
            className="max-h-full max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
