import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL ?? 'http://localhost:4000/graphql',
})

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('sodalis_token')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

const client = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
})

export default client
