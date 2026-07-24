// Fusionne plaintes, sondages et remerciements de toute la coloc en un seul fil
// chronologique (plus récent en premier), pour l'affichage type "chat" du fil
// de la colocation.
export function buildFeed({ complaints, polls, thanks, members }) {
  const memberName = (id) => members.find((m) => m.id === id)?.name ?? 'un ancien colocataire'

  const complaintItems = complaints.map((complaint) => ({
    key: `complaint-${complaint.id}`,
    type: 'complaint',
    createdAt: complaint.createdAt,
    data: complaint,
  }))

  const pollItems = polls.map((poll) => ({
    key: `poll-${poll.id}`,
    type: 'poll',
    createdAt: poll.createdAt,
    data: poll,
  }))

  const thankItems = thanks.map((thank) => ({
    key: `thank-${thank.id}`,
    type: 'thank',
    createdAt: thank.createdAt,
    data: {
      fromName: memberName(thank.from_id),
      toName: memberName(thank.to_id),
    },
  }))

  return [...complaintItems, ...pollItems, ...thankItems]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
