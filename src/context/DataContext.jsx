import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { loadLastPerson, saveLastPerson } from '../lib/storage'
import { todayKey } from '../lib/dateUtils'

const DataContext = createContext(null)

function toLocal(row) {
  return {
    id: row.id,
    personId: row.person_id,
    type: row.type,
    amount: Number(row.amount),
    date: row.date,
    category: row.category,
    note: row.note || '',
    createdAt: row.created_at,
  }
}

export function DataProvider({ children }) {
  const [transactions, setTransactions] = useState([])
  const [personId, setPersonIdState] = useState(() => loadLastPerson())
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState(null)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    setTransactions(data.map(toLocal))
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  function setPersonId(id) {
    setPersonIdState(id)
    saveLastPerson(id)
  }

  async function addTransaction({ type, amount, date, category, note }) {
    setSyncing(true)
    setError(null)
    const row = {
      person_id: personId,
      type,
      amount: Number(amount),
      date: date || todayKey(),
      category: type === 'expense' ? (category || 'other') : null,
      note: note?.trim() || '',
    }
    const { data, error: err } = await supabase
      .from('transactions')
      .insert(row)
      .select()
      .single()
    if (err) {
      setError(err.message)
      setSyncing(false)
      return null
    }
    setTransactions((prev) => [toLocal(data), ...prev])
    setSyncing(false)
    return toLocal(data)
  }

  async function updateTransaction(id, updates) {
    setSyncing(true)
    setError(null)
    const row = {}
    if (updates.type !== undefined) row.type = updates.type
    if (updates.amount !== undefined) row.amount = Number(updates.amount)
    if (updates.date !== undefined) row.date = updates.date
    if (updates.category !== undefined) row.category = updates.category
    if (updates.note !== undefined) row.note = updates.note?.trim() || ''
    const { data, error: err } = await supabase
      .from('transactions')
      .update(row)
      .eq('id', id)
      .select()
      .single()
    if (err) {
      setError(err.message)
      setSyncing(false)
      return false
    }
    setTransactions((prev) => prev.map((tx) => (tx.id === id ? toLocal(data) : tx)))
    setSyncing(false)
    return true
  }

  async function deleteTransaction(id) {
    setSyncing(true)
    setError(null)
    const { error: err } = await supabase.from('transactions').delete().eq('id', id)
    if (err) {
      setError(err.message)
      setSyncing(false)
      return false
    }
    setTransactions((prev) => prev.filter((tx) => tx.id !== id))
    setSyncing(false)
    return true
  }

  const personTransactions = useMemo(
    () => transactions.filter((tx) => tx.personId === personId),
    [transactions, personId],
  )

  const balance = useMemo(
    () =>
      personTransactions.reduce(
        (sum, tx) => sum + (tx.type === 'income' ? tx.amount : -tx.amount),
        0,
      ),
    [personTransactions],
  )

  const value = {
    personId,
    setPersonId,
    transactions: personTransactions,
    allTransactions: transactions,
    allTransactionsCount: transactions.length,
    balance,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    loading,
    syncing,
    error,
    clearError: () => setError(null),
    refresh: fetchTransactions,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
