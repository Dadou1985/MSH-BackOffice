import express from 'express';
import { PORT } from './config/env.js';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from './middleware/errorMiddelware.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { registerAppSocketHandlers, registerChatSocketHandlers } from './utils/sockets.js';
import { startApolloServer } from './graphql/server.js';
import helmet from 'helmet';
import cors from 'cors';
const app = express();
const allowedOrigins = [
    'https://mysweethotelpro.web.app', // ton front MSH-Pro en production
    'https://mysweethotel.eu', // ton front MSH en production
    'http://localhost:3000' // ton front en dev local
];
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
    },
});
registerAppSocketHandlers(io);
registerChatSocketHandlers(io); // Si vous avez besoin de gérer les sockets pour le chat, décommentez cette ligne
// Middleware pour gérer les requêtes JSON et les URL encodées
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(errorMiddleware);
app.use(helmet()); // Sécurise l'application en définissant des en-têtes HTTP appropriés
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.get('/', (_, res) => {
    res.send('🟢 MSH Back Office API is running');
});
await startApolloServer(app, io);
// app.use('/api/v1/hotel', hotelRoutes);
// app.use('/api/v1/chat', chatRoutes);
// app.use('/api/v1/checklist', checklistRoutes);
// app.use('/api/v1/generic', genericRoutes);
// app.use('/api/v1/support', supportRoutes);
// app.use('/api/v1/feedback', feedbackRoutes);
// app.use('/api/v1/business-users', businessUsersRoutes);
// app.use('/api/v1/guest-users', guestUsersRoutes);
// app.use('/api/v1/housekeeping', housekeepingRoutes);
httpServer.listen(PORT, async () => {
    // try {
    //     await mongoConnect();
    //     console.log('MongoDB connected', PORT);
    // } catch (error) {
    //     console.error('MongoDB connection error:', error);
    // }
    if (process.env.NODE_ENV === 'development') {
        console.log(`Server is running in development mode`);
    }
    else {
        console.log(`Server is running in production mode`);
    }
});
export { io };
export default app;
