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
import { GET_MY_COLOC } from '../graphql/auth'

export function useDomus() {
  const { user } = useAuthContext()
  const colocId = user?.coloc_id
  const isAdmin = user?.role === 'ADMIN'

  const [formError, setFormError] = useState(null)

  const { data: usersData, loading: usersLoading } = useQuery(GET_USERS_BY_COLOC, {
    variables: { colocId },
    skip: !colocId,
  })

  const {
    data: ticketsData,
    loading: ticketsLoading,
    refetch: refetchTickets,
  } = useQuery(GET_MAINTENANCE_TICKETS, {
    variables: { colocId },
    skip: !colocId,
  })

  const { data: myColocData, loading: myColocLoading } = useQuery(GET_MY_COLOC, {
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

  const members = usersData?.usersByColoc ?? []
  const tickets = ticketsData?.maintenanceTickets ?? []
  const coloc = myColocData?.myColoc ?? null

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

  return {
    loading: usersLoading || ticketsLoading || myColocLoading,
    createLoading,
    formError,
    setFormError,
    coloc,
    members,
    tickets,
    isAdmin,
    currentUserId: user?.id,
    createTicket,
    updateStatus,
    assignTicket,
    refetchTickets,
  }
}
