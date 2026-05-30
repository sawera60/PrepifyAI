import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import contextApi from './context/contextApi.jsx'
import { ContextProvider } from './context/contextApi.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ContextProvider>
      <App />
    </ContextProvider>

  </StrictMode>,
)
