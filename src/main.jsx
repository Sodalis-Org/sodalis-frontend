import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import client from './lib/apolloClient'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import './index.css'
import App from './App'

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
