import express from 'express';
import { PORT } from './config/env.js';
import { mongoConnect } from './utils/database.js';

const app = express();
// const mongoFunctions = require('./utils/database');

// mongoFunctions.mongoConnect().then(() => {
//     // mongoFunctions.largeMigration();
// }).catch(err => {e});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.listen(PORT, async () => {
    try {
        await mongoConnect();
        console.log('MongoDB connected');
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