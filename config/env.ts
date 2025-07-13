import {config} from 'dotenv';

const envPath = `.env.${process.env.NODE_ENV || 'production'}.local`;
config({ path: envPath });

export const PORT = process.env.PORT || 5500;
export const NODE_ENV = process.env.NODE_ENV || 'production';