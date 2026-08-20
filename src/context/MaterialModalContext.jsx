import { createContext, useContext, useState } from 'react'

const MaterialModalContext = createContext(null)

export function MaterialModalProvider({ children }) {
  const [formState, setFormState] = useState(null) // { mode: 'add'|'edit', log }

  function openAdd() {
    setFormState({ mode: 'add', log: null })
  }

  function openEdit(log) {
    setFormState({ mode: 'edit', log })
  }

  function close() {
    setFormState(null)
  }

  return (
    <MaterialModalContext.Provider value={{ formState, openAdd, openEdit, close }}>
      {children}
    </MaterialModalContext.Provider>
  )
}

export function useMaterialModal() {
  const ctx = useContext(MaterialModalContext)
  if (!ctx) throw new Error('useMaterialModal must be used within MaterialModalProvider')
  return ctx
}
