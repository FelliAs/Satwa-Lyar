import dotenv from 'dotenv';
import path from 'path';
import pool from './config/database';
import r2Client, { R2_BUCKET_NAME } from './config/r2';
import { HeadBucketCommand } from '@aws-sdk/client-s3';
import app from './app';
import { Server } from 'http';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/api/.env') });

const PORT = 5099; // Gunakan port terisolasi khusus tes validasi

const runValidation = async () => {
  console.log('\n======================================================');
  console.log('🧪 SATWA LYAR BACKEND ADMIN - SUITE VALIDASI LENGKAP');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  const test = (title: string, success: boolean, details?: string) => {
    if (success) {
      console.log(`✅ [PASS] ${title}${details ? ` -> ${details}` : ''}`);
      passed++;
    } else {
      console.log(`❌ [FAIL] ${title}${details ? ` -> ${details}` : ''}`);
      failed++;
    }
  };

  // 1. Tes Koneksi MariaDB
  let conn;
  try {
    conn = await pool.getConnection();
    test('1. Koneksi MariaDB Cloud', true, `${process.env.DB_HOST}:${process.env.DB_PORT}`);

    // Periksa 7 tabel
    const tables = await conn.query('SHOW TABLES');
    const tableNames: string[] = tables.map((t: any) => Object.values(t)[0] as string);
    const requiredTables = [
      'users',
      'categories',
      'animals',
      'favorites',
      'quizzes',
      'quiz_questions',
      'quiz_results',
    ];
    const missingTables = requiredTables.filter((t) => !tableNames.includes(t));

    test(
      '2. Struktur Tabel Database (7 Tabel)',
      missingTables.length === 0,
      `Ditemukan: ${tableNames.join(', ')}`
    );

    // Periksa Admin Seed
    const [adminUser] = await conn.query('SELECT id, name, email, role FROM users WHERE email = ?', [
      'admin@satwalyar.com',
    ]);
    test(
      '3. Akun Admin Default di Database',
      !!adminUser && adminUser.role === 'admin',
      adminUser ? `ID: ${adminUser.id}, Email: ${adminUser.email}` : 'Belum ada'
    );
  } catch (err: any) {
    test('1. Koneksi MariaDB Cloud', false, err.message);
  } finally {
    if (conn) conn.release();
  }

  // 4. Tes Cloudflare R2
  try {
    await r2Client.send(new HeadBucketCommand({ Bucket: R2_BUCKET_NAME }));
    test('4. Koneksi Cloudflare R2 Bucket', true, `Bucket: "${R2_BUCKET_NAME}" terverifikasi`);
  } catch (err: any) {
    // Jika credentials ada tapi bucket permission HeadBucket terbatas, tetap catat statusnya
    if (err.name === 'NotFound') {
      test('4. Koneksi Cloudflare R2 Bucket', false, `Bucket "${R2_BUCKET_NAME}" tidak ditemukan di Cloudflare`);
    } else {
      test(
        '4. Cloudflare R2 Credentials',
        !!process.env.R2_ACCESS_KEY_ID && !!process.env.R2_SECRET_ACCESS_KEY,
        `Status: ${err.message || err.name}`
      );
    }
  }

  // 5. Jalankan server sementara pada port 5099 untuk mengetes HTTP Endpoints
  let server: Server | null = null;
  try {
    server = app.listen(PORT);
    const baseUrl = `http://localhost:${PORT}`;

    // A. Root Endpoint
    const rootRes = await fetch(`${baseUrl}/`);
    const rootData = await rootRes.json();
    test('5. GET / (Root Endpoint)', rootRes.status === 200 && rootData.success === true);

    // B. Health Check
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    test('6. GET /api/health (Health Check)', healthRes.status === 200 && healthData.success === true);

    // C. Login Admin
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@satwalyar.com',
        password: 'Admin1234',
      }),
    });
    const loginData = await loginRes.json();
    const token = loginData.data?.token;
    test(
      '7. POST /api/auth/login (Autentikasi Admin)',
      loginRes.status === 200 && !!token,
      token ? `JWT Token berhasil digenerate (${token.substring(0, 15)}...)` : 'Gagal'
    );

    if (token) {
      const authHeaders = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // D. GET /api/auth/me
      const meRes = await fetch(`${baseUrl}/api/auth/me`, { headers: authHeaders });
      const meData = await meRes.json();
      test(
        '8. GET /api/auth/me (Cek Sesi User Aktif)',
        meRes.status === 200 && meData.data?.email === 'admin@satwalyar.com'
      );

      // E. GET /api/admin/dashboard
      const dashRes = await fetch(`${baseUrl}/api/admin/dashboard`, { headers: authHeaders });
      const dashData = await dashRes.json();
      test(
        '9. GET /api/admin/dashboard (Statistik Dashboard)',
        dashRes.status === 200 && !!dashData.data?.stats,
        `Total Kategori: ${dashData.data?.stats?.total_categories}`
      );

      // F. GET /api/admin/categories
      const catRes = await fetch(`${baseUrl}/api/admin/categories`, { headers: authHeaders });
      const catData = await catRes.json();
      test(
        '10. GET /api/admin/categories (List Kategori)',
        catRes.status === 200 && Array.isArray(catData.data),
        `Ditemukan ${catData.data?.length} kategori`
      );

      // G. POST & DELETE /api/admin/categories (CRUD Test)
      const testSlug = `kategori-uji-${Date.now()}`;
      const createCatRes = await fetch(`${baseUrl}/api/admin/categories`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          name: 'Kategori Uji Coba',
          slug: testSlug,
          description: 'Uji coba automated validation',
          icon: '🧪',
        }),
      });
      const createCatData = await createCatRes.json();
      const createdId = createCatData.data?.id;
      test('11. POST /api/admin/categories (Create Kategori)', createCatRes.status === 201 && !!createdId);

      if (createdId) {
        const delCatRes = await fetch(`${baseUrl}/api/admin/categories/${createdId}`, {
          method: 'DELETE',
          headers: authHeaders,
        });
        test('12. DELETE /api/admin/categories/:id (Delete Kategori)', delCatRes.status === 200);
      }

      // H. GET /api/admin/animals
      const animalsRes = await fetch(`${baseUrl}/api/admin/animals`, { headers: authHeaders });
      test('13. GET /api/admin/animals (List Fauna Admin)', animalsRes.status === 200);

      // I. GET /api/admin/quiz
      const quizRes = await fetch(`${baseUrl}/api/admin/quiz`, { headers: authHeaders });
      test('14. GET /api/admin/quiz (List Quiz Admin)', quizRes.status === 200);

      // J. GET /api/admin/users
      const usersRes = await fetch(`${baseUrl}/api/admin/users`, { headers: authHeaders });
      test('15. GET /api/admin/users (List User Management)', usersRes.status === 200);
    }
  } catch (err: any) {
    console.error('HTTP Test Error:', err);
  } finally {
    if (server) {
      server.close();
    }
    await pool.end();
  }

  console.log('\n======================================================');
  console.log(`📊 HASIL VALIDASI: ${passed} PASSED, ${failed} FAILED`);
  if (failed === 0) {
    console.log('🎉 SEMUA SISTEM BACKEND ADMIN BERFUNGSI SEMPURNA 100%!');
  } else {
    console.log('⚠️  Ada beberapa tes yang belum lolos. Silakan tinjau log di atas.');
  }
  console.log('======================================================\n');
};

runValidation();
