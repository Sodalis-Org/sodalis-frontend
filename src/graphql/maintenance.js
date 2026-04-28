import { gql } from '@apollo/client'

export const GET_MAINTENANCE_TICKETS = gql`
  query GetMaintenanceTickets($colocId: ID!) {
    maintenanceTickets(colocId: $colocId) {
      id
      title
      description
      category
      priority
      status
      created_by
      assigned_to
      coloc_id
      created_at
      updated_at
    }
  }
`

export const CREATE_MAINTENANCE_TICKET = gql`
  mutation CreateMaintenanceTicket(
    $title: String!
    $description: String
    $category: String!
    $priority: String!
    $coloc_id: ID!
  ) {
    createMaintenanceTicket(
      title: $title
      description: $description
      category: $category
      priority: $priority
      coloc_id: $coloc_id
    ) {
      id
      title
      category
      priority
      status
      created_by
      assigned_to
      created_at
      updated_at
    }
  }
`

export const UPDATE_TICKET_STATUS = gql`
  mutation UpdateTicketStatus($id: ID!, $status: String!) {
    updateTicketStatus(id: $id, status: $status) {
      id
      status
      updated_at
    }
  }
`

export const ASSIGN_TICKET = gql`
  mutation AssignTicket($id: ID!, $assigned_to: ID!) {
    assignTicket(id: $id, assigned_to: $assigned_to) {
      id
      assigned_to
      updated_at
    }
  }
`
