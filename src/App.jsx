import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DataProvider, useData } from './context/DataContext'
import { ModalProvider } from './context/ModalContext'
import AppShell from './components/AppShell'
import PersonSelect from './pages/PersonSelect'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'

function RequirePerson({ children }) {
  const { personId } = useData()
  if (!personId) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PersonSelect />} />
      <Route
        path="/dashboard"
        element={
          <RequirePerson>
            <ModalProvider>
              <AppShell>
                <Dashboard />
              </AppShell>
            </ModalProvider>
          </RequirePerson>
        }
      />
      <Route
        path="/transactions"
        element={
          <RequirePerson>
            <ModalProvider>
              <AppShell>
                <Transactions />
              </AppShell>
            </ModalProvider>
          </RequirePerson>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </DataProvider>
  )
}
