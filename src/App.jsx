import { useState, useCallback } from 'react'
import AppHeader from './components/AppHeader'
import TicketForm from './components/TicketForm'
import Dashboard from './components/Dashboard'
import Toast from './components/Toast'

function App() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [toast, setToast] = useState({ message: '', type: 'success' })

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    // auto-dismiss after 3s
    setTimeout(() => setToast({ message: '', type }), 3000)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <AppHeader />
      <main className="py-8 space-y-10">
        <TicketForm
          showToast={showToast}
          onCreated={() => setRefreshKey((k) => k + 1)}
        />
        <Dashboard refreshKey={refreshKey} />
      </main>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  )
}

export default App
