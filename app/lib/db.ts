import { Pool } from 'pg';

declare global {
    var pgPool: Pool | undefined
}

if (!global.pgPool) {
  global.pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
}

const pool = global.pgPool;

type QueryValue = string | number | boolean | Date | null | undefined;

const db = {
  query: (text: string, params?: QueryValue[]) => pool.query(text, params),
};

export default db;