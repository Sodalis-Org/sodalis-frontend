import { gql } from '@apollo/client'

export const GET_USERS_BY_COLOC = gql`
  query GetUsersByColoc($colocId: ID!) {
    usersByColoc(colocId: $colocId) {
      id
      name
      email
      role
      harmony_score
      karma_score
    }
  }
`
