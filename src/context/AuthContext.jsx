import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => localStorage.getItem('sodalis_token'))
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('sodalis_token')
    return t ? decodeToken(t) : null
  })

  const saveToken = useCallback((newToken) => {
    localStorage.setItem('sodalis_token', newToken)
    setTokenState(newToken)
    setUser(decodeToken(newToken))
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('sodalis_token')
    setTokenState(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, saveToken, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
}
