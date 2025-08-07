import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './typeDefs.js';
import { resolvers } from './resolvers.js';
import { mongoConnect } from '../utils/database.js';
import jwt from 'jsonwebtoken';
import { resetGuestUsers } from '../utils/database.js';
import cron from 'node-cron';
export async function startApolloServer(app, io) {
    await mongoConnect(); // ⬅️ Connect to MongoDB before Apollo Server starts
    cron.schedule('56 * * * *', () => {
        console.log('⏰ Running resetGuestUsers task...');
        resetGuestUsers();
    });
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: async ({ req }) => {
            const authHeader = req.headers.authorization || '';
            const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
            let user = null;
            if (token) {
                try {
                    const redis = await import('../utils/redisClient.js').then(mod => mod.default);
                    const isBlacklisted = await redis.get(`blacklist:${token}`);
                    if (isBlacklisted) {
                        throw new Error('Token is blacklisted');
                    }
                    user = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret');
                }
                catch (err) {
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
