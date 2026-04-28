import { gql } from '@apollo/client'

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        role
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

export const CREATE_COLOC = gql`
  mutation CreateColoc($name: String!) {
    createColoc(name: $name) {
      coloc {
        id
        name
        invite_code
      }
      token
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
      token
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
