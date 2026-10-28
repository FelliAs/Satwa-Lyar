import dotenv from 'dotenv';
import path from 'path';
import mariadb from 'mariadb';
import { MIGRATIONS } from './migrations';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/api/.env') });

const dbName = process.env.DB_NAME || 'satwa_lyar';

/**
 * Menjalankan migration database yang belum pernah dieksekusi.
 * Setiap migration dicatat di tabel `schema_migrations` agar idempoten.
 */
const runMigrations = async (): Promise<void> => {
  console.log('========================================');
  console.log('🛠️  Menjalankan migration database...');
  console.log(`🗄️  Database: ${dbName}`);
  console.log('========================================');

  const conn = await mariadb.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: dbName,
    connectTimeout: 20000,
    ssl: process.env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: false },
  });

  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version    VARCHAR(100) NOT NULL,
        applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (version)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    const appliedRows = (await conn.query(
      'SELECT version FROM schema_migrations'
    )) as any[];
    const applied = new Set(appliedRows.map((row) => row.version));

    for (const migration of MIGRATIONS) {
      if (applied.has(migration.version)) {
        console.log(`⏭️  Lewati ${migration.version} (sudah diterapkan)`);
        continue;
      }

      console.log(`▶️  Menjalankan ${migration.version} - ${migration.description}`);
      await migration.up(conn);
      await conn.query('INSERT INTO schema_migrations (version) VALUES (?)', [
        migration.version,
      ]);
      console.log(`✅ ${migration.version} berhasil diterapkan.`);
    }

    const tables = await conn.query('SHOW TABLES');
    console.log('========================================');
    console.log('📋 Daftar tabel saat ini:');
    tables.forEach((row: any) => {
      console.log(`   - ${Object.values(row)[0]}`);
    });
    console.log('🎉 Migration selesai.');
    console.log('========================================');
  } catch (err: any) {
    console.error('❌ Migration gagal:', err.message);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
};

runMigrations();
