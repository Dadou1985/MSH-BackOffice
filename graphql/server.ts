import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './typeDefs.js';
import { resolvers } from './resolvers.js';
import { mongoConnect } from '../utils/database.js';

export async function startApolloServer(app: any, io: any) {
    await mongoConnect(); // ⬅️ Connect to MongoDB before Apollo Server starts

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