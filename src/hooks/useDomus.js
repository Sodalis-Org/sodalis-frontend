import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { useAuthContext } from '../context/AuthContext'
import { GET_USERS_BY_COLOC } from '../graphql/users'
import {
  GET_MY_COLOC,
  REGENERATE_INVITE_CODE,
  KICK_MEMBER,
  TRANSFER_ADMIN,
} from '../graphql/auth'

export function useDomus() {
  const { user, loading: authLoading, refreshUser } = useAuthContext()
  const colocId = user?.coloc_id
  const isAdmin = user?.role === 'ADMIN'

  const [actionError, setActionError] = useState(null)

  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery(GET_USERS_BY_COLOC, {
    variables: { colocId },
    skip: !colocId,
  })

  const {
    data: myColocData,
    loading: myColocLoading,
    error: myColocError,
    refetch: refetchMyColoc,
  } = useQuery(GET_MY_COLOC, {
    skip: !colocId,
  })

  const [regenerateInviteMutation, { loading: regenerateLoading }] = useMutation(
    REGENERATE_INVITE_CODE,
  )
  const [kickMemberMutation, { loading: kickLoading }] = useMutation(KICK_MEMBER)
  const [transferAdminMutation, { loading: transferLoading }] = useMutation(TRANSFER_ADMIN)

  const members = usersData?.usersByColoc ?? []
  const coloc = myColocData?.myColoc ?? null
  const error = usersError || myColocError || null

  const refetch = async () => {
    await Promise.all([refetchUsers(), refetchMyColoc()])
  }

  const regenerateInvite = async () => {
    setActionError(null)
    try {
      const { data } = await regenerateInviteMutation()
      await refetchMyColoc()
      return data.regenerateInviteCode.coloc
    } catch (e) {
      setActionError(e.graphQLErrors?.[0]?.message ?? e.message)
      return null
    }
  }

  const kickMember = async (userId) => {
    setActionError(null)
    try {
      await kickMemberMutation({ variables: { userId } })
      await refetchUsers()
      return true
    } catch (e) {
      setActionError(e.graphQLErrors?.[0]?.message ?? e.message)
      return false
    }
  }

  const transferAdmin = async (userId) => {
    setActionError(null)
    try {
      await transferAdminMutation({ variables: { userId } })
      await refreshUser()
      await refetchUsers()
      return true
    } catch (e) {
      setActionError(e.graphQLErrors?.[0]?.message ?? e.message)
      return false
    }
  }

  return {
    loading: authLoading || usersLoading || myColocLoading,
    error,
    refetch,
    regenerateLoading,
    kickLoading,
    transferLoading,
    actionError,
    setActionError,
    coloc,
    members,
    isAdmin,
    currentUserId: user?.id,
    regenerateInvite,
    kickMember,
    transferAdmin,
  }
}
