import mariadb from 'mariadb';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/api/.env') });

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  acquireTimeout: 30000,
  connectTimeout: 15000,
  ssl: process.env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: false },
  // Mengaktifkan konversi BigInt ke Number agar kompatibel dengan JSON
  bigIntAsNumber: true,
  // Sama untuk insertId, supaya tidak ada BigInt yang gagal di-serialize JSON
  insertIdAsNumber: true,
});

export const testConnection = async (): Promise<void> => {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('✅ MariaDB Cloud terhubung');
  } catch (err) {
    console.error('❌ Gagal terhubung ke MariaDB:', err);
    process.exit(1);
  } finally {
    if (conn) conn.release();
  }
};

export default pool;
