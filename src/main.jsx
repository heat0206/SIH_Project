import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

import ErrorBoundary from './components/ErrorBoundary.jsx'

const updateSW = registerSW({
  onNeedRefresh() {
    console.log('New content available, auto-updating...')
    updateSW(true)
  },
  onOfflineReady() {
    console.log('App is ready for offline use.')
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
