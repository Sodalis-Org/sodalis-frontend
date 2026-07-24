import { useState } from 'react'
import { useMutation, useApolloClient } from '@apollo/client'
import { useNavigate } from 'react-router-dom'
import {
  LOGIN,
  REGISTER,
  CREATE_COLOC,
  JOIN_COLOC,
  LEAVE_COLOC,
  REGENERATE_INVITE_CODE,
} from '../graphql/auth'
import { useAuthContext } from '../context/AuthContext'

export function useAuth() {
  const client = useApolloClient()
  const { user, refreshUser, logout } = useAuthContext()
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN)
  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER)
  const [createColocMutation, { loading: createColocLoading }] = useMutation(CREATE_COLOC)
  const [joinColocMutation, { loading: joinColocLoading }] = useMutation(JOIN_COLOC)
  const [leaveColocMutation, { loading: leaveColocLoading }] = useMutation(LEAVE_COLOC)
  const [regenerateInviteMutation, { loading: regenerateLoading }] = useMutation(
    REGENERATE_INVITE_CODE,
    { refetchQueries: ['GetMyColoc'] },
  )

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

  // Ne pas writeQuery(ME) ici : ça déclencherait le garde Onboarding
  // (user.coloc_id && !createdColoc) avant flushSync(setCreatedColoc).
  const createColoc = async (name) => {
    setError(null)
    try {
      const { data } = await createColocMutation({ variables: { name } })
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

  const leaveColoc = async () => {
    setError(null)
    try {
      await leaveColocMutation()
      // cache.modify contourne le typePolicy qui ignore null→existant (défense Apollo).
      if (user?.id) {
        const cacheId = client.cache.identify({ __typename: 'User', id: user.id })
        if (cacheId) {
          client.cache.modify({
            id: cacheId,
            fields: {
              coloc_id: () => null,
            },
          })
        }
      }
      await refreshUser()
      navigate('/onboarding/coloc')
      return true
    } catch (e) {
      setError(e.graphQLErrors?.[0]?.message ?? e.message)
      return false
    }
  }

  const regenerateInviteCode = async () => {
    setError(null)
    try {
      const { data } = await regenerateInviteMutation()
      return data.regenerateInviteCode.coloc
    } catch (e) {
      setError(e.graphQLErrors?.[0]?.message ?? e.message)
      return null
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
    leaveColoc,
    regenerateInviteCode,
    logout: handleLogout,
    error,
    setError,
    loading:
      loginLoading ||
      registerLoading ||
      createColocLoading ||
      joinColocLoading ||
      leaveColocLoading ||
      regenerateLoading,
  }
}
