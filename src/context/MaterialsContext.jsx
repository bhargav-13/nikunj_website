import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { todayKey } from '../lib/dateUtils'

const MaterialsContext = createContext(null)

function toLocal(row) {
  return {
    id: row.id,
    personId: row.person_id,
    materialId: row.material_id,
    direction: row.direction,
    quantity: Number(row.quantity),
    unit: row.unit,
    date: row.date,
    note: row.note || '',
    createdAt: row.created_at,
  }
}

export function MaterialsProvider({ children }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState(null)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('material_logs')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    setLogs(data.map(toLocal))
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  async function addLog({ personId, materialId, direction, quantity, unit, date, note }) {
    setSyncing(true)
    setError(null)
    const row = {
      person_id: personId,
      material_id: materialId,
      direction,
      quantity: Number(quantity),
      unit,
      date: date || todayKey(),
      note: note?.trim() || '',
    }
    const { data, error: err } = await supabase.from('material_logs').insert(row).select().single()
    if (err) {
      setError(err.message)
      setSyncing(false)
      return null
    }
    setLogs((prev) => [toLocal(data), ...prev])
    setSyncing(false)
    return toLocal(data)
  }

  async function updateLog(id, updates) {
    setSyncing(true)
    setError(null)
    const row = {}
    if (updates.materialId !== undefined) row.material_id = updates.materialId
    if (updates.direction !== undefined) row.direction = updates.direction
    if (updates.quantity !== undefined) row.quantity = Number(updates.quantity)
    if (updates.unit !== undefined) row.unit = updates.unit
    if (updates.date !== undefined) row.date = updates.date
    if (updates.note !== undefined) row.note = updates.note?.trim() || ''
    const { data, error: err } = await supabase
      .from('material_logs')
      .update(row)
      .eq('id', id)
      .select()
      .single()
    if (err) {
      setError(err.message)
      setSyncing(false)
      return false
    }
    setLogs((prev) => prev.map((l) => (l.id === id ? toLocal(data) : l)))
    setSyncing(false)
    return true
  }

  async function deleteLog(id) {
    setSyncing(true)
    setError(null)
    const { error: err } = await supabase.from('material_logs').delete().eq('id', id)
    if (err) {
      setError(err.message)
      setSyncing(false)
      return false
    }
    setLogs((prev) => prev.filter((l) => l.id !== id))
    setSyncing(false)
    return true
  }

  const stockByMaterial = useMemo(() => {
    const stock = {}
    for (const log of logs) {
      if (!stock[log.materialId]) stock[log.materialId] = {}
      const bucket = stock[log.materialId]
      const delta = log.direction === 'in' ? log.quantity : -log.quantity
      bucket[log.unit] = (bucket[log.unit] || 0) + delta
    }
    return stock
  }, [logs])

  const value = {
    logs,
    stockByMaterial,
    addLog,
    updateLog,
    deleteLog,
    loading,
    syncing,
    error,
    clearError: () => setError(null),
    refresh: fetchLogs,
  }

  return <MaterialsContext.Provider value={value}>{children}</MaterialsContext.Provider>
}

export function useMaterials() {
  const ctx = useContext(MaterialsContext)
  if (!ctx) throw new Error('useMaterials must be used within MaterialsProvider')
  return ctx
}
