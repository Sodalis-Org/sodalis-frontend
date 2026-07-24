import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { useAuthContext } from '../context/AuthContext'
import { GET_USERS_BY_COLOC } from '../graphql/users'
import {
  GET_COMPLAINTS, CREATE_COMPLAINT, RESOLVE_COMPLAINT, DELETE_COMPLAINT,
  GET_POLLS, CREATE_POLL, VOTE_POLL, CLOSE_POLL,
  GET_MY_RECENT_THANKS, THANK_USER,
} from '../graphql/concordia'

export function useConcordia() {
  const { user, loading: authLoading } = useAuthContext()
  const colocId = user?.coloc_id
  const currentUserId = user?.id
  const isAdmin = user?.role === 'ADMIN'

  const [complaintError, setComplaintError] = useState(null)
  const [pollError, setPollError] = useState(null)
  const [karmaFeedback, setKarmaFeedback] = useState(null)
  const [karmaError, setKarmaError] = useState(null)

  // ── Queries ──────────────────────────────────────────────────────────────────

  const { data: usersData, error: usersError, refetch: refetchUsers } = useQuery(GET_USERS_BY_COLOC, {
    variables: { colocId },
    skip: !colocId,
  })

  const { data: complaintsData, loading: complaintsLoading, error: complaintsError, refetch: refetchComplaints } = useQuery(GET_COMPLAINTS, {
    variables: { colocId },
    skip: !colocId,
  })

  const { data: pollsData, loading: pollsLoading, error: pollsError, refetch: refetchPolls } = useQuery(GET_POLLS, {
    variables: { colocId },
    skip: !colocId,
  })

  const { data: thanksData, refetch: refetchThanks } = useQuery(GET_MY_RECENT_THANKS, {
    variables: { colocId },
    skip: !colocId,
  })

  // ── Complaint mutations ───────────────────────────────────────────────────────

  const [createComplaintMutation, { loading: createComplaintLoading }] = useMutation(CREATE_COMPLAINT, {
    refetchQueries: [{ query: GET_COMPLAINTS, variables: { colocId } }],
  })

  const [resolveComplaintMutation] = useMutation(RESOLVE_COMPLAINT, {
    refetchQueries: [{ query: GET_COMPLAINTS, variables: { colocId } }],
  })

  const [deleteComplaintMutation] = useMutation(DELETE_COMPLAINT, {
    refetchQueries: [{ query: GET_COMPLAINTS, variables: { colocId } }],
  })

  // ── Poll mutations ────────────────────────────────────────────────────────────

  const [createPollMutation, { loading: createPollLoading }] = useMutation(CREATE_POLL, {
    refetchQueries: [{ query: GET_POLLS, variables: { colocId } }],
  })

  const [votePollMutation] = useMutation(VOTE_POLL, {
    refetchQueries: [{ query: GET_POLLS, variables: { colocId } }],
  })

  const [closePollMutation] = useMutation(CLOSE_POLL, {
    refetchQueries: [{ query: GET_POLLS, variables: { colocId } }],
  })

  // ── Karma mutation ────────────────────────────────────────────────────────────

  const [thankUserMutation] = useMutation(THANK_USER, {
    refetchQueries: [
      { query: GET_USERS_BY_COLOC, variables: { colocId } },
      { query: GET_MY_RECENT_THANKS, variables: { colocId } },
    ],
  })

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const createComplaint = async ({ message, target_id, is_anonymous }) => {
    setComplaintError(null)
    try {
      await createComplaintMutation({
        variables: {
          coloc_id: colocId,
          message,
          target_id: target_id || undefined,
          is_anonymous: is_anonymous || false,
        },
      })
      return true
    } catch (e) {
      setComplaintError(e.graphQLErrors?.[0]?.message ?? e.message)
      return false
    }
  }

  const resolveComplaint = async (id) => {
    try {
      await resolveComplaintMutation({ variables: { id } })
    } catch (e) {
      console.error(e)
    }
  }

  const deleteComplaint = async (id) => {
    try {
      await deleteComplaintMutation({ variables: { id } })
    } catch (e) {
      console.error(e)
    }
  }

  const createPoll = async ({ question, options }) => {
    setPollError(null)
    const filtered = options.filter((o) => o.trim().length > 0)
    if (filtered.length < 2) {
      setPollError('Au moins 2 options sont requises.')
      return false
    }
    try {
      await createPollMutation({ variables: { coloc_id: colocId, question, options: filtered } })
      return true
    } catch (e) {
      setPollError(e.graphQLErrors?.[0]?.message ?? e.message)
      return false
    }
  }

  const votePoll = async (poll_id, option_id) => {
    try {
      await votePollMutation({ variables: { poll_id, option_id } })
    } catch (e) {
      console.error(e)
    }
  }

  const closePoll = async (id) => {
    try {
      await closePollMutation({ variables: { id } })
    } catch (e) {
      console.error(e)
    }
  }

  const thankUser = async (target_id, targetName) => {
    setKarmaError(null)
    try {
      const { data } = await thankUserMutation({ variables: { target_id } })
      setKarmaFeedback({ name: targetName, score: data.thankUser.score })
      setTimeout(() => setKarmaFeedback(null), 3500)
    } catch (e) {
      setKarmaError(e.graphQLErrors?.[0]?.message ?? e.message)
    }
  }

  const members    = usersData?.usersByColoc ?? []
  const complaints = complaintsData?.complaints ?? []
  const polls      = pollsData?.polls ?? []
  const recentThanks = thanksData?.myRecentThanks ?? []

  return {
    loading: authLoading || complaintsLoading || pollsLoading,
    error: usersError || complaintsError || pollsError || null,
    refetch: async () => {
      await Promise.all([refetchUsers(), refetchComplaints(), refetchPolls(), refetchThanks()])
    },
    createComplaintLoading,
    createPollLoading,
    complaintError,
    setComplaintError,
    pollError,
    setPollError,
    karmaFeedback,
    karmaError,
    members,
    complaints,
    polls,
    recentThanks,
    currentUserId,
    isAdmin,
    createComplaint,
    resolveComplaint,
    deleteComplaint,
    createPoll,
    votePoll,
    closePoll,
    thankUser,
    refetchComplaints,
    refetchPolls,
  }
}
