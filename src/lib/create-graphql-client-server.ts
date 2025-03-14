import { GraphQLClient } from 'graphql-request'


export const client = new GraphQLClient(process.env.NEXT_PUBLIC_SALEOR_API_URL!, {
  headers: {
    Authorization: `Bearer ${process.env.SALEOR_API_KEY}`,
  },
});
