import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/api/.env') });

import app from './app';
import { testConnection } from './config/database';

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

startServer().catch((err) => {
  console.error('❌ Gagal menjalankan server:', err);
  process.exit(1);
});
