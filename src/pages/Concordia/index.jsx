import { useState } from 'react'
import { useConcordia } from '../../hooks/useConcordia'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import QueryErrorState from '../../components/QueryErrorState'
import ConcordiaHeader from './components/ConcordiaHeader'
import KarmaToast from './components/KarmaToast'
import KarmaSheet from './components/KarmaSheet'
import Feed from './components/Feed'
import Composer from './components/Composer'
import CreateComplaintModal from './components/CreateComplaintModal'
import CreatePollModal from './components/CreatePollModal'

function LoadingState() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-3 px-4 pt-4">
      <span className="sr-only">Chargement en cours</span>
      {[1, 2, 3].map((i) => <div key={i} aria-hidden="true" className="h-20 rounded-2xl bg-muted animate-pulse" />)}
    </div>
  )
}

export default function Concordia() {
  useDocumentTitle('Chez nous')
  const [modal, setModal] = useState(null) // 'complaint' | 'poll' | 'karma' | null

  const {
    loading,
    error,
    refetch,
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
    colocThanks,
    currentUserId,
    isAdmin,
    createComplaint,
    resolveComplaint,
    deleteComplaint,
    createPoll,
    votePoll,
    closePoll,
    thankUser,
  } = useConcordia()

  const closeModal = () => setModal(null)

  if (loading) return <LoadingState />
  if (error) return <QueryErrorState onRetry={() => refetch()} />

  return (
    <>
      <KarmaToast feedback={karmaFeedback} />

      {modal === 'complaint' && (
        <CreateComplaintModal
          onClose={() => { closeModal(); setComplaintError(null) }}
          onCreate={createComplaint}
          loading={createComplaintLoading}
          error={complaintError}
          members={members}
          currentUserId={currentUserId}
        />
      )}
      {modal === 'poll' && (
        <CreatePollModal
          onClose={() => { closeModal(); setPollError(null) }}
          onCreate={createPoll}
          loading={createPollLoading}
          error={pollError}
        />
      )}
      {modal === 'karma' && (
        <KarmaSheet
          members={members}
          currentUserId={currentUserId}
          recentThanks={recentThanks}
          onThank={thankUser}
          karmaError={karmaError}
          onClose={closeModal}
        />
      )}

      <div className="flex flex-col min-h-screen bg-background">
        <ConcordiaHeader onOpenKarma={() => setModal('karma')} />

        <div className="flex-1 px-4 pt-4 pb-36">
          <Feed
            complaints={complaints}
            polls={polls}
            thanks={colocThanks}
            members={members}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            onResolveComplaint={resolveComplaint}
            onDeleteComplaint={deleteComplaint}
            onVotePoll={votePoll}
            onClosePoll={closePoll}
          />
        </div>

        <Composer
          onOpenComplaint={() => setModal('complaint')}
          onOpenPoll={() => setModal('poll')}
          onOpenKarma={() => setModal('karma')}
        />
      </div>
    </>
  )
}
