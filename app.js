import express from 'express';
import mongoose from 'mongoose';
import { PORT } from './config/env.js';

const app = express();
// const mongoFunctions = require('./utils/database');

// mongoFunctions.mongoConnect().then(() => {
//     // mongoFunctions.largeMigration();
// }).catch(err => {e});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    }
);

export default app;