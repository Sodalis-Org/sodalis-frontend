import { gql } from '@apollo/client'

export const GET_COLOC_DASHBOARD = gql`
  query GetColocDashboard($colocId: ID!) {
    getColocDashboard(colocId: $colocId) {
      users {
        id
        name
        email
        role
        harmony_score
        karma_score
      }
      tasks {
        id
        title
        status
        assignee_id
        due_at
      }
      open_complaints
    }
  }
`

export const GET_NOTIFICATIONS = gql`
  query GetNotifications($colocId: ID!, $page: Int, $limit: Int) {
    notifications(colocId: $colocId, page: $page, limit: $limit) {
      data {
        id
        type
        message
        created_at
      }
      pagination {
        page
        limit
        total
      }
    }
  }
`

export const GET_UNREAD_NOTIFICATIONS_COUNT = gql`
  query GetUnreadNotificationsCount($colocId: ID!) {
    unreadNotificationsCount(colocId: $colocId)
  }
`

export const MARK_NOTIFICATIONS_READ = gql`
  mutation MarkNotificationsRead($colocId: ID!) {
    markNotificationsRead(colocId: $colocId)
  }
`
