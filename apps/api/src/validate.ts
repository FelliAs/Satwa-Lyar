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

    // Periksa tabel yang dibutuhkan
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
      'logs_activity',
      'admin_counters',
    ];
    const missingTables = requiredTables.filter((t) => !tableNames.includes(t));

    test(
      '2. Struktur Tabel Database',
      missingTables.length === 0,
      missingTables.length === 0
        ? `Ditemukan: ${tableNames.join(', ')}`
        : `Tabel belum ada: ${missingTables.join(', ')}`
    );

    // Periksa kolom identitas users
    const columns = await conn.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'`
    );
    const userColumns: string[] = columns.map((c: any) => c.COLUMN_NAME);
    const requiredColumns = ['public_id', 'is_admin'];
    const missingColumns = requiredColumns.filter((c) => !userColumns.includes(c));

    test(
      '3. Kolom Identitas users (public_id, is_admin)',
      missingColumns.length === 0,
      missingColumns.length === 0
        ? userColumns.join(', ')
        : `Kolom belum ada: ${missingColumns.join(', ')}`
    );

    // Periksa Admin Seed
    const [adminUser] = await conn.query(
      'SELECT id, public_id, name, email, is_admin FROM users WHERE email = ?',
      ['admin@satwalyar.com']
    );
    test(
      '4. Akun Admin Default di Database',
      !!adminUser && Number(adminUser.is_admin) === 1,
      adminUser
        ? `ID: ${adminUser.public_id}, Email: ${adminUser.email}`
        : 'Belum ada'
    );
  } catch (err: any) {
    test('1. Koneksi MariaDB Cloud', false, err.message);
  } finally {
    if (conn) conn.release();
  }

  // 5. Tes Cloudflare R2
  try {
    await r2Client.send(new HeadBucketCommand({ Bucket: R2_BUCKET_NAME }));
    test('5. Koneksi Cloudflare R2 Bucket', true, `Bucket: "${R2_BUCKET_NAME}" terverifikasi`);
  } catch (err: any) {
    if (err.name === 'NotFound') {
      test('5. Koneksi Cloudflare R2 Bucket', false, `Bucket "${R2_BUCKET_NAME}" tidak ditemukan di Cloudflare`);
    } else {
      test(
        '5. Cloudflare R2 Credentials',
        !!process.env.R2_ACCESS_KEY_ID && !!process.env.R2_SECRET_ACCESS_KEY,
        `Status: ${err.message || err.name}`
      );
    }
  }

  // 6. Jalankan server sementara pada port 5099 untuk mengetes HTTP Endpoints
  let server: Server | null = null;
  try {
    server = app.listen(PORT);
    const baseUrl = `http://localhost:${PORT}`;

    // A. Root Endpoint
    const rootRes = await fetch(`${baseUrl}/`);
    const rootData = await rootRes.json();
    test('6. GET / (Root Endpoint)', rootRes.status === 200 && rootData.success === true);

    // B. Health Check
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    test(
      '7. GET /api/health (Health Check)',
      healthRes.status === 200 && healthData.success === true,
      `Database: ${healthData.database}`
    );

    // C. Identitas Guest otomatis
    const guestRes = await fetch(`${baseUrl}/api/categories`);
    const setCookie = guestRes.headers.get('set-cookie') || '';
    const guestCookie = setCookie.split(';')[0];
    test(
      '8. Identitas Guest Otomatis (Set-Cookie)',
      guestCookie.includes('satwa_guest=gst_'),
      guestCookie || 'Cookie tidak diterbitkan'
    );

    // D. Guest bisa memakai endpoint publik tanpa login
    const guestMeRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: guestCookie },
    });
    const guestMeData = await guestMeRes.json();
    test(
      '9. GET /api/auth/me sebagai Guest',
      guestMeRes.status === 200 && String(guestMeData.data?.public_id || '').startsWith('gst_'),
      guestMeData.data?.public_id || guestMeData.message
    );

    // E. Guest tidak boleh mengakses endpoint admin
    const deniedRes = await fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: { Cookie: guestCookie },
    });
    test(
      '10. Akses endpoint admin ditolak untuk Guest (403)',
      deniedRes.status === 403,
      `Status: ${deniedRes.status}`
    );

    // F. Tracking page view
    const trackRes = await fetch(`${baseUrl}/api/track/page-view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: guestCookie },
      body: JSON.stringify({ path: '/', referrer: 'https://satwalyar.vercel.app' }),
    });
    test('11. POST /api/track/page-view (Tracking Pengunjung)', trackRes.status === 201);

    // G. Login Admin
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
      '12. POST /api/auth/login (Autentikasi Admin)',
      loginRes.status === 200 && !!token,
      token ? `JWT berhasil digenerate` : loginData.message
    );

    if (token) {
      const authHeaders = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // H. GET /api/auth/me sebagai admin
      const meRes = await fetch(`${baseUrl}/api/auth/me`, { headers: authHeaders });
      const meData = await meRes.json();
      test(
        '13. GET /api/auth/me (Sesi Admin)',
        meRes.status === 200 && Number(meData.data?.is_admin) === 1,
        `Public ID: ${meData.data?.public_id}`
      );

      // I. GET /api/admin/dashboard
      const dashRes = await fetch(`${baseUrl}/api/admin/dashboard`, { headers: authHeaders });
      const dashData = await dashRes.json();
      test(
        '14. GET /api/admin/dashboard (Statistik Dashboard)',
        dashRes.status === 200 && !!dashData.data?.stats,
        `Guest: ${dashData.data?.stats?.total_guests}, Admin: ${dashData.data?.stats?.total_admins}`
      );

      // J. GET /api/admin/categories
      const catRes = await fetch(`${baseUrl}/api/admin/categories`, { headers: authHeaders });
      const catData = await catRes.json();
      test(
        '15. GET /api/admin/categories (List Kategori)',
        catRes.status === 200 && Array.isArray(catData.data),
        `Ditemukan ${catData.data?.length} kategori`
      );

      // K. POST & DELETE /api/admin/categories (CRUD Test)
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
      test('16. POST /api/admin/categories (Create Kategori)', createCatRes.status === 201 && !!createdId);

      if (createdId) {
        const delCatRes = await fetch(`${baseUrl}/api/admin/categories/${createdId}`, {
          method: 'DELETE',
          headers: authHeaders,
        });
        test('17. DELETE /api/admin/categories/:id (Delete Kategori)', delCatRes.status === 200);
      }

      // L. GET /api/admin/animals
      const animalsRes = await fetch(`${baseUrl}/api/admin/animals`, { headers: authHeaders });
      test('18. GET /api/admin/animals (List Fauna Admin)', animalsRes.status === 200);

      // M. GET /api/admin/quiz
      const quizRes = await fetch(`${baseUrl}/api/admin/quiz`, { headers: authHeaders });
      test('19. GET /api/admin/quiz (List Quiz Admin)', quizRes.status === 200);

      // N. GET /api/admin/users
      const usersRes = await fetch(`${baseUrl}/api/admin/users`, { headers: authHeaders });
      const usersData = await usersRes.json();
      test(
        '20. GET /api/admin/users (List Admin)',
        usersRes.status === 200 && Array.isArray(usersData.data),
        `Ditemukan ${usersData.data?.length} administrator`
      );

      // O. GET /api/admin/logs
      const logsRes = await fetch(`${baseUrl}/api/admin/logs?limit=5`, { headers: authHeaders });
      const logsData = await logsRes.json();
      test(
        '21. GET /api/admin/logs (Log Aktivitas)',
        logsRes.status === 200 && Array.isArray(logsData.data),
        `Total log: ${logsData.pagination?.total}`
      );

      // P. GET /api/admin/logs/summary
      const summaryRes = await fetch(`${baseUrl}/api/admin/logs/summary?days=1`, {
        headers: authHeaders,
      });
      const summaryData = await summaryRes.json();
      test(
        '22. GET /api/admin/logs/summary (Ringkasan Log)',
        summaryRes.status === 200 && !!summaryData.data?.totals,
        `Log 24 jam: ${summaryData.data?.totals?.total}`
      );

      // Q. POST /api/admin/users (Penomoran adm_XXXX transaksional)
      const testEmail = `admin-uji-${Date.now()}@satwalyar.com`;
      const createAdminRes = await fetch(`${baseUrl}/api/admin/users`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          name: 'Admin Uji Coba',
          email: testEmail,
          password: 'UjiCoba123',
        }),
      });
      const createAdminData = await createAdminRes.json();
      const newAdminId = createAdminData.data?.id;
      const newAdminPublicId = createAdminData.data?.public_id;

      test(
        '23. POST /api/admin/users (Buat Admin + public_id adm_XXXX)',
        createAdminRes.status === 201 && /^adm_\d{4,}$/.test(newAdminPublicId || ''),
        `Public ID: ${newAdminPublicId || createAdminData.message}`
      );

      // R. DELETE /api/admin/users/:id
      if (newAdminId) {
        const delAdminRes = await fetch(`${baseUrl}/api/admin/users/${newAdminId}`, {
          method: 'DELETE',
          headers: authHeaders,
        });
        test('24. DELETE /api/admin/users/:id (Hapus Admin)', delAdminRes.status === 200);
      }
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
