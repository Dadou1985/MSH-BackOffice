import {config} from 'dotenv';

const envPath = `.env.${process.env.NODE_ENV || 'development'}.local`;
config({ path: envPath });

export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';