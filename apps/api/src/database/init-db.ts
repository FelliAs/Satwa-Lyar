import mariadb from 'mariadb';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/api/.env') });

const initDatabase = async () => {
  const host = process.env.DB_HOST;
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const dbName = process.env.DB_NAME || 'satwa_lyar';

  console.log('🔄 Memulai inisialisasi database MariaDB Cloud...');
  console.log(`📡 Host: ${host}:${port}`);
  console.log(`👤 User: ${user}`);
  console.log(`🗄️  Database Target: ${dbName}`);

  let rootConn;
  try {
    // 1. Hubungkan ke server MariaDB untuk membuat database jika belum ada
    rootConn = await mariadb.createConnection({
      host,
      port,
      user,
      password,
      connectTimeout: 20000,
      ssl: process.env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: false },
    });

    console.log('✅ Berhasil terhubung ke host MariaDB');

    // Buat database dengan backtick agar nama dengan dash aman
    await rootConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`✅ Database \`${dbName}\` berhasil dipastikan ada.`);
  } catch (err: any) {
    console.error('❌ Gagal memeriksa/membuat database:', err.message);
    process.exit(1);
  } finally {
    if (rootConn) await rootConn.end();
  }

  // 2. Hubungkan langsung ke database target dan jalankan schema
  let dbConn;
  try {
    dbConn = await mariadb.createConnection({
      host,
      port,
      user,
      password,
      database: dbName,
      multipleStatements: true,
      connectTimeout: 20000,
      ssl: process.env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: false },
    });

    console.log(`✅ Berhasil masuk ke database \`${dbName}\``);

    const schemaPath = path.resolve(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`File schema.sql tidak ditemukan di: ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Filter baris komentar dan pisahkan statement berdasarkan ';'
    // Bersihkan komentar multi-line atau baris yang diawali '--'
    const cleanedSql = schemaSql
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n')
      .filter((line) => !line.trim().startsWith('--'))
      .join('\n');

    // Pisahkan query berdasarkan ';'
    const statements = cleanedSql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log(`⏳ Menjalankan ${statements.length} perintah SQL dari schema.sql...`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await dbConn.query(stmt);
      } catch (sqlErr: any) {
        // Abaikan error jika duplikat data seed yang sudah ada
        if (sqlErr.errno === 1062) {
          console.log(`ℹ️  Peringatan (Data sudah ada): ${sqlErr.message}`);
        } else {
          console.error(`❌ Gagal pada statement ${i + 1}:\n${stmt}\nError: ${sqlErr.message}`);
          throw sqlErr;
        }
      }
    }

    // 3. Verifikasi tabel yang berhasil dibuat
    const tables = await dbConn.query('SHOW TABLES');
    console.log('========================================');
    console.log('🎉 Inisialisasi Database Selesai!');
    console.log('📋 Daftar Tabel yang terbentuk:');
    tables.forEach((row: any) => {
      const tableName = Object.values(row)[0];
      console.log(`   - ${tableName}`);
    });
    console.log('========================================');
  } catch (err: any) {
    console.error('❌ Gagal mengeksekusi schema:', err.message);
    process.exit(1);
  } finally {
    if (dbConn) await dbConn.end();
  }
};

initDatabase();
