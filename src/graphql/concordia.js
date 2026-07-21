import { gql } from '@apollo/client'

// ─── Complaints ───────────────────────────────────────────────────────────────

export const GET_COMPLAINTS = gql`
  query GetComplaints($colocId: ID!) {
    complaints(colocId: $colocId) {
      id
      creator_id
      target_id
      message
      is_anonymous
      status
      createdAt
    }
  }
`

export const CREATE_COMPLAINT = gql`
  mutation CreateComplaint(
    $coloc_id: ID!
    $message: String!
    $target_id: ID
    $is_anonymous: Boolean
  ) {
    createComplaint(
      coloc_id: $coloc_id
      message: $message
      target_id: $target_id
      is_anonymous: $is_anonymous
    ) {
      id
      creator_id
      target_id
      message
      is_anonymous
      status
      createdAt
    }
  }
`

export const RESOLVE_COMPLAINT = gql`
  mutation ResolveComplaint($id: ID!) {
    resolveComplaint(id: $id) {
      id
      status
      createdAt
    }
  }
`

export const DELETE_COMPLAINT = gql`
  mutation DeleteComplaint($id: ID!) {
    deleteComplaint(id: $id)
  }
`

// ─── Polls ────────────────────────────────────────────────────────────────────

export const GET_POLLS = gql`
  query GetPolls($colocId: ID!) {
    polls(colocId: $colocId) {
      id
      creator_id
      question
      options {
        option_id
        text
        voters
      }
      status
      createdAt
    }
  }
`

export const CREATE_POLL = gql`
  mutation CreatePoll($coloc_id: ID!, $question: String!, $options: [String!]!) {
    createPoll(coloc_id: $coloc_id, question: $question, options: $options) {
      id
      question
      options {
        option_id
        text
        voters
      }
      status
      createdAt
    }
  }
`

export const VOTE_POLL = gql`
  mutation VotePoll($poll_id: ID!, $option_id: ID!) {
    votePoll(poll_id: $poll_id, option_id: $option_id) {
      id
      options {
        option_id
        text
        voters
      }
    }
  }
`

// ─── Karma ────────────────────────────────────────────────────────────────────

export const THANK_USER = gql`
  mutation ThankUser($target_id: ID!) {
    thankUser(target_id: $target_id) {
      user_id
      coloc_id
      score
    }
  }
`
