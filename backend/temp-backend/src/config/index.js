import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || 'development'
  },
  ai: {
    baseUrl: process.env.AI_BASE_URL || 'http://localhost:3002'
  },
  zoho: {
    url: process.env.ZOHOCREATOR_URL,
    apiKey: process.env.ZOHOCREATOR_API_KEY
  },
  database: {
    file: process.env.DATABASE_FILE || './src/database/tickets.db'
  }
};

export default config;