import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { useAuthContext } from '../context/AuthContext'
import { GET_USERS_BY_COLOC } from '../graphql/users'
import {
  GET_MAINTENANCE_TICKETS,
  CREATE_MAINTENANCE_TICKET,
  UPDATE_TICKET_STATUS,
  ASSIGN_TICKET,
} from '../graphql/maintenance'
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

  const [formError, setFormError] = useState(null)
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
    data: ticketsData,
    loading: ticketsLoading,
    error: ticketsError,
    refetch: refetchTickets,
  } = useQuery(GET_MAINTENANCE_TICKETS, {
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

  const [createTicketMutation, { loading: createLoading }] = useMutation(CREATE_MAINTENANCE_TICKET, {
    refetchQueries: [{ query: GET_MAINTENANCE_TICKETS, variables: { colocId } }],
  })

  const [updateStatusMutation] = useMutation(UPDATE_TICKET_STATUS, {
    refetchQueries: [{ query: GET_MAINTENANCE_TICKETS, variables: { colocId } }],
  })

  const [assignTicketMutation] = useMutation(ASSIGN_TICKET, {
    refetchQueries: [{ query: GET_MAINTENANCE_TICKETS, variables: { colocId } }],
  })

  const [regenerateInviteMutation, { loading: regenerateLoading }] = useMutation(
    REGENERATE_INVITE_CODE,
  )
  const [kickMemberMutation, { loading: kickLoading }] = useMutation(KICK_MEMBER)
  const [transferAdminMutation, { loading: transferLoading }] = useMutation(TRANSFER_ADMIN)

  const members = usersData?.usersByColoc ?? []
  const tickets = ticketsData?.maintenanceTickets ?? []
  const coloc = myColocData?.myColoc ?? null
  const error = usersError || ticketsError || myColocError || null

  const refetch = async () => {
    await Promise.all([refetchUsers(), refetchTickets(), refetchMyColoc()])
  }

  const createTicket = async ({ title, description, category, priority }) => {
    setFormError(null)
    try {
      await createTicketMutation({
        variables: { title, description: description || undefined, category, priority, coloc_id: colocId },
      })
      return true
    } catch (e) {
      setFormError(e.graphQLErrors?.[0]?.message ?? e.message)
      return false
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await updateStatusMutation({ variables: { id: String(id), status } })
    } catch (e) {
      console.error(e)
    }
  }

  const assignTicket = async (id, assigned_to) => {
    try {
      await assignTicketMutation({ variables: { id: String(id), assigned_to } })
    } catch (e) {
      console.error(e)
    }
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
    loading: authLoading || usersLoading || ticketsLoading || myColocLoading,
    error,
    refetch,
    createLoading,
    regenerateLoading,
    kickLoading,
    transferLoading,
    formError,
    setFormError,
    actionError,
    setActionError,
    coloc,
    members,
    tickets,
    isAdmin,
    currentUserId: user?.id,
    createTicket,
    updateStatus,
    assignTicket,
    regenerateInvite,
    kickMember,
    transferAdmin,
    refetchTickets,
  }
}
