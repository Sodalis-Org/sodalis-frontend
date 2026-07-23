import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import client from './lib/apolloClient'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import './index.css'
import App from './App'

if (import.meta.env.DEV) {
  // Instrumentation runtime axe-core, dev uniquement (éliminée au build de
  // production) : logue en continu les violations d'accessibilité rencontrées
  // en conditions réelles de rendu (CSS/layout, donc avec contraste réel,
  // contrairement aux tests jsdom de tests/a11y/). Complément manuel aux
  // audits chiffrés des tâches 5.1/5.4, pas une mesure automatisée.
  const React = await import('react')
  const ReactDOM = await import('react-dom')
  const axe = (await import('@axe-core/react')).default
  axe(React, ReactDOM, 1000)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <App />
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </ApolloProvider>
  </StrictMode>,
)
