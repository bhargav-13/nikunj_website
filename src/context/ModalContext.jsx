import { createContext, useContext, useState } from 'react'

const ModalContext = createContext(null)

export function ModalProvider({ children }) {
  const [formState, setFormState] = useState(null) // { mode: 'add'|'edit', type, transaction }

  function openAdd(type = 'expense') {
    setFormState({ mode: 'add', type, transaction: null })
  }

  function openEdit(transaction) {
    setFormState({ mode: 'edit', type: transaction.type, transaction })
  }

  function close() {
    setFormState(null)
  }

  return (
    <ModalContext.Provider value={{ formState, openAdd, openEdit, close }}>
      {children}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModal must be used within ModalProvider')
  return ctx
}
