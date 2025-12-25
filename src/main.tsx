import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './store/AuthContext/AuthContext.tsx'
import { CustomerProvider } from './store/MasterContext/CustomerContext.tsx'
import { TicketProvider } from './store/MasterContext/TicketContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CustomerProvider>
         <TicketProvider>
    <App />
    </TicketProvider>
    </CustomerProvider>
    </AuthProvider>
  </StrictMode>,
)
