import { gql } from '@apollo/client'

export const GET_TASKS_BY_COLOC = gql`
  query GetTasksByColoc($colocId: ID!) {
    tasksByColoc(colocId: $colocId) {
      id
      title
      status
      assignee_id
      coloc_id
      created_at
      due_at
    }
  }
`

export const CREATE_TASK = gql`
  mutation CreateTask($title: String!, $assignee_id: ID!, $coloc_id: ID!, $due_at: String) {
    createTask(title: $title, assignee_id: $assignee_id, coloc_id: $coloc_id, due_at: $due_at) {
      id
      title
      status
      assignee_id
      coloc_id
      created_at
      due_at
    }
  }
`

export const UPDATE_TASK_STATUS = gql`
  mutation UpdateTaskStatus($id: ID!, $status: String!) {
    updateTaskStatus(id: $id, status: $status) {
      id
      status
    }
  }
`
