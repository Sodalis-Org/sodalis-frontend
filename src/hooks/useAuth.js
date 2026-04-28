import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useNavigate } from 'react-router-dom'
import { LOGIN, REGISTER, CREATE_COLOC, JOIN_COLOC } from '../graphql/auth'
import { useAuthContext } from '../context/AuthContext'

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export function useAuth() {
  const { saveToken, logout } = useAuthContext()
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
      const { token } = data.login
      saveToken(token)
      const payload = decodeToken(token)
      navigate(payload?.coloc_id ? '/' : '/onboarding/coloc')
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
      saveToken(data.createColoc.token)
      return data.createColoc.coloc
    } catch (e) {
      setError(e.graphQLErrors?.[0]?.message ?? e.message)
      return null
    }
  }

  const joinColoc = async (invite_code) => {
    setError(null)
    try {
      const { data } = await joinColocMutation({ variables: { invite_code } })
      saveToken(data.joinColoc.token)
      navigate('/')
    } catch (e) {
      setError(e.graphQLErrors?.[0]?.message ?? e.message)
    }
  }

  const handleLogout = () => {
    logout()
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
