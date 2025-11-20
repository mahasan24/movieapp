import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Support both DATABASE_URL (local) and individual variables (Azure)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  ssl: process.env.NODE_ENV === 'production'  
    ? { rejectUnauthorized: false } 
    : false
});

export default pool;