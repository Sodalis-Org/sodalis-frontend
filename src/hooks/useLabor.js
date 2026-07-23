import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { useAuthContext } from '../context/AuthContext'
import { GET_TASKS_BY_COLOC, CREATE_TASK, UPDATE_TASK_STATUS } from '../graphql/tasks'
import { GET_USERS_BY_COLOC } from '../graphql/users'

export function useLabor() {
  const { user, loading: authLoading } = useAuthContext()
  const colocId = user?.coloc_id

  const [formError, setFormError] = useState(null)
  const [lastCompleted, setLastCompleted] = useState(null)

  const { data: tasksData, loading: tasksLoading } = useQuery(GET_TASKS_BY_COLOC, {
    variables: { colocId },
    skip: !colocId,
  })

  const { data: usersData, loading: usersLoading } = useQuery(GET_USERS_BY_COLOC, {
    variables: { colocId },
    skip: !colocId,
  })

  const [createTaskMutation, { loading: createLoading }] = useMutation(CREATE_TASK, {
    refetchQueries: [{ query: GET_TASKS_BY_COLOC, variables: { colocId } }],
  })

  const [updateStatusMutation] = useMutation(UPDATE_TASK_STATUS, {
    refetchQueries: [{ query: GET_TASKS_BY_COLOC, variables: { colocId } }],
  })

  const tasks   = tasksData?.tasksByColoc ?? []
  const members = usersData?.usersByColoc ?? []

  const grouped = {
    TODO:        tasks.filter((t) => t.status === 'TODO'),
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
    DONE:        tasks.filter((t) => t.status === 'DONE'),
  }

  const createTask = async ({ title, assignee_id, due_at }) => {
    setFormError(null)
    try {
      await createTaskMutation({
        variables: {
          title,
          assignee_id,
          coloc_id: colocId,
          due_at: due_at || undefined,
        },
      })
      return true
    } catch (e) {
      setFormError(e.graphQLErrors?.[0]?.message ?? e.message)
      return false
    }
  }

  const advanceStatus = async (task) => {
    const next = task.status === 'TODO' ? 'IN_PROGRESS' : 'DONE'
    try {
      await updateStatusMutation({ variables: { id: task.id, status: next } })
      if (next === 'DONE') {
        const isOnTime = task.due_at ? new Date() <= new Date(task.due_at) : false
        setLastCompleted({ title: task.title, points: isOnTime ? 10 : 2, isOnTime })
        setTimeout(() => setLastCompleted(null), 4000)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const revertStatus = async (task) => {
    const prev = task.status === 'IN_PROGRESS' ? 'TODO' : 'IN_PROGRESS'
    try {
      await updateStatusMutation({ variables: { id: task.id, status: prev } })
    } catch (e) {
      console.error(e)
    }
  }

  return {
    loading: authLoading || tasksLoading || usersLoading,
    createLoading,
    formError,
    setFormError,
    tasks,
    grouped,
    members,
    currentUserId: user?.id,
    createTask,
    advanceStatus,
    revertStatus,
    lastCompleted,
  }
}
