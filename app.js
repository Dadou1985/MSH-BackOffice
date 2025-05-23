import express from 'express';
import { PORT } from './config/env.js';
import { mongoConnect } from './utils/database.js';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from './middleware/errorMiddelware.js';

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/v1/hotel', hotelRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/checklist', checklistRoutes);
app.use('/api/v1/generic', genericRoutes);
app.use('/api/v1/support', supportRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/business-users', businessUsersRoutes);
app.use('/api/v1/guest-users', guestUsersRoutes);
app.use('/api/v1/housekeeping', housekeepingRoutes);

app.use(errorMiddleware);

app.listen(PORT, async () => {
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

export default app;