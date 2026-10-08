import { supabase } from './supabase'

function toLocal(row) {
  return {
    id: row.id,
    title: row.title || '',
    body: row.body || '',
    pinned: Boolean(row.pinned),
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    attachmentCount: row.note_attachments?.[0]?.count ?? 0,
  }
}

export async function listNotes() {
  const { data, error } = await supabase
    .from('notes')
    .select('*, note_attachments(count)')
    .order('pinned', { ascending: false })
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data.map(toLocal)
}

export async function createNote({ title, body, pinned }, personId) {
  const { data, error } = await supabase
    .from('notes')
    .insert({ title: title.trim(), body: body.trim(), pinned, created_by: personId, updated_by: personId })
    .select()
    .single()
  if (error) throw error
  return toLocal(data)
}

export async function updateNote(id, { title, body, pinned }, personId) {
  const { data, error } = await supabase
    .from('notes')
    .update({
      title: title.trim(),
      body: body.trim(),
      pinned,
      updated_by: personId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return toLocal(data)
}

export async function setNotePinned(id, pinned) {
  const { error } = await supabase.from('notes').update({ pinned }).eq('id', id)
  if (error) throw error
}

export async function deleteNote(id) {
  const { error } = await supabase.from('notes').delete().eq('id', id)
  if (error) throw error
}
