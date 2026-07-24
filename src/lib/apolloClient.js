import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL ?? 'http://localhost:4000/graphql',
  credentials: 'include',
})

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      User: {
        fields: {
          // Évite qu'une query User incomplète (ex. usersByColoc sans coloc_id
          // côté API) écrase me.coloc_id avec null et déclenche PrivateRoute.
          coloc_id: {
            merge(existing, incoming) {
              if (incoming == null && existing != null) return existing
              return incoming
            },
          },
        },
      },
    },
  }),
})

export default client
