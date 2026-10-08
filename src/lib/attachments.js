import { supabase } from './supabase'

const BUCKET = 'attachments'

// Each owner kind stores its attachment rows in its own table, keyed by a foreign key column.
const OWNERS = {
  transaction: { table: 'transaction_attachments', fk: 'transaction_id', prefix: '' },
  material: { table: 'material_attachments', fk: 'material_log_id', prefix: 'materials/' },
}

function ownerConfig(kind) {
  const config = OWNERS[kind]
  if (!config) throw new Error(`Unknown attachment owner: ${kind}`)
  return config
}

function toLocal(row, fk) {
  return {
    id: row.id,
    ownerId: row[fk],
    path: row.path,
    fileName: row.file_name,
    fileType: row.file_type,
    createdAt: row.created_at,
    url: supabase.storage.from(BUCKET).getPublicUrl(row.path).data.publicUrl,
  }
}

export function isImage(fileType) {
  return fileType.startsWith('image/')
}

export async function listAttachments(ownerId, kind = 'transaction') {
  const { table, fk } = ownerConfig(kind)
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq(fk, ownerId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data.map((row) => toLocal(row, fk))
}

export async function uploadAttachment(ownerId, file, kind = 'transaction') {
  const { table, fk, prefix } = ownerConfig(kind)
  const ext = file.name.includes('.') ? file.name.split('.').pop() : ''
  const path = `${prefix}${ownerId}/${crypto.randomUUID()}${ext ? `.${ext}` : ''}`

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  })
  if (uploadError) throw uploadError

  const { data, error: insertError } = await supabase
    .from(table)
    .insert({
      [fk]: ownerId,
      path,
      file_name: file.name,
      file_type: file.type,
    })
    .select()
    .single()

  if (insertError) {
    await supabase.storage.from(BUCKET).remove([path])
    throw insertError
  }

  return toLocal(data, fk)
}

export async function deleteAttachment(attachment, kind = 'transaction') {
  const { table } = ownerConfig(kind)
  await supabase.storage.from(BUCKET).remove([attachment.path])
  const { error } = await supabase.from(table).delete().eq('id', attachment.id)
  if (error) throw error
}
