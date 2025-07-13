import express from 'express';
import { PORT } from './config/env.ts';
import { mongoConnect } from './utils/database.ts';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from './middleware/errorMiddelware.ts';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { registerAppSocketHandlers, registerChatSocketHandlers } from './utils/sockets.ts';
import { startApolloServer } from './graphql/server.ts';
import helmet from 'helmet';
import cors from 'cors';

// Import des routes
import hotelRoutes from './routes/hotel/hotel.routes.ts';
import chatRoutes from './routes/hotel/second-level/chat.routes.ts';
import checklistRoutes from './routes/hotel/second-level/checklist.routes.ts';
import genericRoutes from './routes/hotel/first-level/generic.routes.ts';
import supportRoutes from './routes/support.routes.ts';
import feedbackRoutes from './routes/feedbacks.routes.ts';
import businessUsersRoutes from './routes/user/businessUsers.routes.ts';
import guestUsersRoutes from './routes/user/guestUsers.routes.ts';
import housekeepingRoutes from './routes/hotel/second-level/housekeeping.routes.ts';

const app = express();
const allowedOrigins = [
    'https://mysweethotelpro.web.app', // ton front MSH-Pro en production
    'https://mysweethotel.eu', // ton front MSH en production
    'http://localhost:3000'           // ton front en dev local
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
    try {
        await mongoConnect();
        console.log('MongoDB connected', PORT);

    } catch (error) {
        console.error('MongoDB connection error:', error);
    }

    if (process.env.NODE_ENV === 'development') {
        console.log(`Server is running in development mode`);
    } else {
        console.log(`Server is running in production mode`);
    }
});

export { io };
export default app;