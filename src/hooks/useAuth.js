import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useNavigate } from 'react-router-dom'
import { LOGIN, REGISTER, CREATE_COLOC, JOIN_COLOC } from '../graphql/auth'
import { useAuthContext } from '../context/AuthContext'

export function useAuth() {
  const { refreshUser, logout } = useAuthContext()
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN)
  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER)
  const [createColocMutation, { loading: createColocLoading }] = useMutation(CREATE_COLOC)
  const [joinColocMutation, { loading: joinColocLoading }] = useMutation(JOIN_COLOC)

  const login = async (email, password) => {
    setError(null)
    try {
      const { data } = await loginMutation({ variables: { email, password } })
      await refreshUser()
      navigate(data.login.user.coloc_id ? '/' : '/onboarding/coloc')
    } catch (e) {
      setError(e.graphQLErrors?.[0]?.message ?? e.message)
    }
  }

  const register = async (name, email, password) => {
    setError(null)
    try {
      await registerMutation({ variables: { name, email, password } })
      await login(email, password)
    } catch (e) {
      setError(e.graphQLErrors?.[0]?.message ?? e.message)
    }
  }

  const createColoc = async (name) => {
    setError(null)
    try {
      const { data } = await createColocMutation({ variables: { name } })
      await refreshUser()
      return data.createColoc.coloc
    } catch (e) {
      setError(e.graphQLErrors?.[0]?.message ?? e.message)
      return null
    }
  }

  const joinColoc = async (invite_code) => {
    setError(null)
    try {
      await joinColocMutation({ variables: { invite_code } })
      await refreshUser()
      navigate('/')
    } catch (e) {
      setError(e.graphQLErrors?.[0]?.message ?? e.message)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/onboarding')
  }

  return {
    login,
    register,
    createColoc,
    joinColoc,
    logout: handleLogout,
    error,
    setError,
    loading: loginLoading || registerLoading || createColocLoading || joinColocLoading,
  }
}
