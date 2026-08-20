import { supabase } from './supabase'

const BUCKET = 'attachments'

export function isImage(fileType) {
  return fileType.startsWith('image/')
}

export async function listAttachments(transactionId) {
  const { data, error } = await supabase
    .from('transaction_attachments')
    .select('*')
    .eq('transaction_id', transactionId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data.map((row) => ({
    id: row.id,
    transactionId: row.transaction_id,
    path: row.path,
    fileName: row.file_name,
    fileType: row.file_type,
    createdAt: row.created_at,
    url: supabase.storage.from(BUCKET).getPublicUrl(row.path).data.publicUrl,
  }))
}

export async function uploadAttachment(transactionId, file) {
  const ext = file.name.includes('.') ? file.name.split('.').pop() : ''
  const path = `${transactionId}/${crypto.randomUUID()}${ext ? `.${ext}` : ''}`

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  })
  if (uploadError) throw uploadError

  const { data, error: insertError } = await supabase
    .from('transaction_attachments')
    .insert({
      transaction_id: transactionId,
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

  return {
    id: data.id,
    transactionId: data.transaction_id,
    path: data.path,
    fileName: data.file_name,
    fileType: data.file_type,
    createdAt: data.created_at,
    url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl,
  }
}

export async function deleteAttachment(attachment) {
  await supabase.storage.from(BUCKET).remove([attachment.path])
  const { error } = await supabase.from('transaction_attachments').delete().eq('id', attachment.id)
  if (error) throw error
}
