import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './typeDefs.js';
import { resolvers } from './resolvers.js';
import { mongoConnect } from '../utils/database.js';
import jwt from 'jsonwebtoken';

export async function startApolloServer(app: any, io: any) {
    await mongoConnect(); // ⬅️ Connect to MongoDB before Apollo Server starts

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: async ({ req }: any) => {
          const token = req.headers.authorization?.split(' ')[1];
          let user = null;

          if (token) {
            const isBlacklisted = await import('../utils/redisClient.js').then(mod => mod.default.get(`blacklist:${token}`));
            if (isBlacklisted) {
              throw new Error('Token is blacklisted');
            }

            try {
              user = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret');
            } catch (err) {
              console.error('JWT verification error:', err);
            }
          }

          return { req, io, user };
        }
      });

    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });
    console.log(`GraphQL server ready at http://localhost:3000/graphql`);
}