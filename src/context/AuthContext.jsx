import { createContext, useContext, useCallback } from 'react'
import { useQuery, useMutation, useApolloClient } from '@apollo/client'
import { ME, LOGOUT } from '../graphql/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const client = useApolloClient()
  // Le jeton vit dans un cookie httpOnly, invisible en JS : on ne peut savoir qui
  // est connecté qu'en le demandant au serveur (utile au premier rendu / après reload).
  const { data, loading, refetch } = useQuery(ME, { fetchPolicy: 'network-only' })
  const [logoutMutation] = useMutation(LOGOUT)

  const refreshUser = useCallback(() => refetch(), [refetch])

  const logout = useCallback(async () => {
    try {
      await logoutMutation()
    } finally {
      await client.clearStore()
      await refetch()
    }
  }, [logoutMutation, client, refetch])

  return (
    <AuthContext.Provider value={{ user: data?.me ?? null, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
}
