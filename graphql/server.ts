import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './typeDefs.js';
import { resolvers } from './resolvers.js';

export async function startApolloServer(app) {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });

    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });
    console.log(`GraphQL server ready at http://localhost:3000/graphql`);
}