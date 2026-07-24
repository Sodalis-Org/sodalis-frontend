import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { useAuthContext } from '../context/AuthContext'
import { GET_TASKS_BY_COLOC, CREATE_TASK, UPDATE_TASK_STATUS } from '../graphql/tasks'
import {
  GET_MAINTENANCE_TICKETS,
  CREATE_MAINTENANCE_TICKET,
  UPDATE_TICKET_STATUS,
  ASSIGN_TICKET,
} from '../graphql/maintenance'
import { GET_USERS_BY_COLOC } from '../graphql/users'

// Corvées (Labor) and tickets de maintenance (Domus) run on different status
// enums. They're mapped onto the same three buckets so both kinds can share
// one filter bar and one list.
const TASK_BUCKET = { TODO: 'TODO', IN_PROGRESS: 'IN_PROGRESS', DONE: 'DONE' }
const TICKET_BUCKET = { OPEN: 'TODO', IN_PROGRESS: 'IN_PROGRESS', RESOLVED: 'DONE', CANCELLED: 'DONE' }

function normalizeTask(task) {
  return {
    key: `task-${task.id}`,
    kind: 'task',
    id: task.id,
    title: task.title,
    status: task.status,
    bucket: TASK_BUCKET[task.status],
    assigneeId: task.assignee_id,
    dueAt: task.due_at,
    raw: task,
  }
}

function normalizeTicket(ticket) {
  return {
    key: `ticket-${ticket.id}`,
    kind: 'ticket',
    id: ticket.id,
    title: ticket.title,
    status: ticket.status,
    bucket: TICKET_BUCKET[ticket.status],
    assigneeId: ticket.assigned_to,
    category: ticket.category,
    priority: ticket.priority,
    description: ticket.description,
    raw: ticket,
  }
}

export function useChores() {
  const { user, loading: authLoading } = useAuthContext()
  const colocId = user?.coloc_id

  const [formError, setFormError] = useState(null)
  const [lastCompleted, setLastCompleted] = useState(null)

  const {
    data: tasksData,
    loading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useQuery(GET_TASKS_BY_COLOC, { variables: { colocId }, skip: !colocId })

  const {
    data: ticketsData,
    loading: ticketsLoading,
    error: ticketsError,
    refetch: refetchTickets,
  } = useQuery(GET_MAINTENANCE_TICKETS, { variables: { colocId }, skip: !colocId })

  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery(GET_USERS_BY_COLOC, { variables: { colocId }, skip: !colocId })

  const [createTaskMutation, { loading: createTaskLoading }] = useMutation(CREATE_TASK, {
    refetchQueries: [{ query: GET_TASKS_BY_COLOC, variables: { colocId } }],
  })
  const [createTicketMutation, { loading: createTicketLoading }] = useMutation(CREATE_MAINTENANCE_TICKET, {
    refetchQueries: [{ query: GET_MAINTENANCE_TICKETS, variables: { colocId } }],
  })
  const [updateTaskStatusMutation] = useMutation(UPDATE_TASK_STATUS, {
    refetchQueries: [{ query: GET_TASKS_BY_COLOC, variables: { colocId } }],
  })
  const [updateTicketStatusMutation] = useMutation(UPDATE_TICKET_STATUS, {
    refetchQueries: [{ query: GET_MAINTENANCE_TICKETS, variables: { colocId } }],
  })
  const [assignTicketMutation] = useMutation(ASSIGN_TICKET, {
    refetchQueries: [{ query: GET_MAINTENANCE_TICKETS, variables: { colocId } }],
  })

  const members = usersData?.usersByColoc ?? []
  const items = [
    ...(tasksData?.tasksByColoc ?? []).map(normalizeTask),
    ...(ticketsData?.maintenanceTickets ?? []).map(normalizeTicket),
  ]
  const urgentItems = items.filter(
    (i) => i.kind === 'ticket' && i.priority === 'URGENT' && i.bucket !== 'DONE',
  )

  const createTask = async ({ title, assignee_id, due_at }) => {
    setFormError(null)
    try {
      await createTaskMutation({
        variables: { title, assignee_id, coloc_id: colocId, due_at: due_at || undefined },
      })
      return true
    } catch (e) {
      setFormError(e.graphQLErrors?.[0]?.message ?? e.message)
      return false
    }
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

  const setTaskStatus = async (task, status) => {
    try {
      await updateTaskStatusMutation({ variables: { id: task.id, status } })
      if (status === 'DONE') {
        const isOnTime = task.due_at ? new Date() <= new Date(task.due_at) : false
        setLastCompleted({ title: task.title, points: isOnTime ? 10 : 2, isOnTime })
        setTimeout(() => setLastCompleted(null), 4000)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const setTicketStatus = async (ticket, status) => {
    try {
      await updateTicketStatusMutation({ variables: { id: String(ticket.id), status } })
    } catch (e) {
      console.error(e)
    }
  }

  // Explicit status change — used by the detail modal, which offers every
  // transition (including revert and cancel).
  const setItemStatus = (item, status) =>
    item.kind === 'task' ? setTaskStatus(item.raw, status) : setTicketStatus(item.raw, status)

  // One-tap "next step" — used by the row's checkbox for the common path.
  const advanceItem = (item) =>
    item.kind === 'task'
      ? setTaskStatus(item.raw, item.status === 'TODO' ? 'IN_PROGRESS' : 'DONE')
      : setTicketStatus(item.raw, item.status === 'OPEN' ? 'IN_PROGRESS' : 'RESOLVED')

  const assignTicket = async (ticketId, assigneeId) => {
    try {
      await assignTicketMutation({ variables: { id: String(ticketId), assigned_to: assigneeId } })
    } catch (e) {
      console.error(e)
    }
  }

  return {
    loading: authLoading || tasksLoading || ticketsLoading || usersLoading,
    error: tasksError || ticketsError || usersError || null,
    refetch: async () => {
      await Promise.all([refetchTasks(), refetchTickets(), refetchUsers()])
    },
    createLoading: createTaskLoading || createTicketLoading,
    formError,
    setFormError,
    items,
    urgentItems,
    members,
    currentUserId: user?.id,
    isAdmin: user?.role === 'ADMIN',
    createTask,
    createTicket,
    advanceItem,
    setItemStatus,
    assignTicket,
    lastCompleted,
  }
}
