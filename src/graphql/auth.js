import { gql } from '@apollo/client'

export const ME = gql`
  query Me {
    me {
      id
      name
      email
      role
      coloc_id
    }
  }
`

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user {
        id
        name
        email
        role
        coloc_id
      }
    }
  }
`

export const REGISTER = gql`
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      id
      name
      email
      role
    }
  }
`

export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`

export const CREATE_COLOC = gql`
  mutation CreateColoc($name: String!) {
    createColoc(name: $name) {
      coloc {
        id
        name
        invite_code
      }
    }
  }
`

export const JOIN_COLOC = gql`
  mutation JoinColoc($invite_code: String!) {
    joinColoc(invite_code: $invite_code) {
      coloc {
        id
        name
      }
    }
  }
`

export const GET_MY_COLOC = gql`
  query GetMyColoc {
    myColoc {
      id
      name
      invite_code
    }
  }
`

export const LEAVE_COLOC = gql`
  mutation LeaveColoc {
    leaveColoc {
      ok
    }
  }
`

export const REGENERATE_INVITE_CODE = gql`
  mutation RegenerateInviteCode {
    regenerateInviteCode {
      coloc {
        id
        name
        invite_code
      }
    }
  }
`

export const KICK_MEMBER = gql`
  mutation KickMember($userId: ID!) {
    kickMember(userId: $userId) {
      ok
    }
  }
`

export const TRANSFER_ADMIN = gql`
  mutation TransferAdmin($userId: ID!) {
    transferAdmin(userId: $userId) {
      ok
    }
  }
`
