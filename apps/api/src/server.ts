import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/api/.env') });

import app from './app';
import { testConnection } from './config/database';

const requiredEnv = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'R2_PUBLIC_URL',
] as const;

const missingEnv = requiredEnv.filter((key) => !process.env[key]?.trim());
if (missingEnv.length > 0) {
  throw new Error(`Environment wajib belum diisi: ${missingEnv.join(', ')}`);
}

if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET!.length < 32) {
  throw new Error('JWT_SECRET production minimal 32 karakter.');
}

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Test koneksi ke MariaDB sebelum server start
  await testConnection();

  app.listen(PORT, () => {
    console.log('========================================');
    console.log(`🦎 SATWA LYAR API`);
    console.log(`🚀 Server berjalan di port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`📡 URL: http://localhost:${PORT}/api`);
    console.log('========================================');
  });
};

// Jalankan standalone server jika bukan di environment Vercel Serverless Function
if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('❌ Gagal menjalankan server:', err);
    process.exit(1);
  });
}

export default app;
