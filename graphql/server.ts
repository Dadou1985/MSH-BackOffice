import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './typeDefs.ts';
import { resolvers } from './resolvers.ts';

export async function startApolloServer(app: any, io: any) {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req }: any) => ({
          req,
          io // ⬅️ injecte l'instance de Socket.IO dans le contexte
        })
      });

    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });
    console.log(`GraphQL server ready at http://localhost:3000/graphql`);
}