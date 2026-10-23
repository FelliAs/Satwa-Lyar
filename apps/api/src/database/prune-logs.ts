import dotenv from 'dotenv';
import path from 'path';
import pool from '../config/database';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/api/.env') });

/**
 * Retensi log: menghapus baris logs_activity yang lebih lama dari N hari.
 *
 * Pemakaian:
 *   npm run db:prune-logs            -> hapus log lebih tua dari 90 hari
 *   npm run db:prune-logs -- 30      -> hapus log lebih tua dari 30 hari
 *   npm run db:prune-logs -- 30 dry  -> hanya menampilkan jumlah baris
 */
const runPrune = async (): Promise<void> => {
  const args = process.argv.slice(2);
  const days = Math.min(3650, Math.max(1, Number(args[0]) || 90));
  const dryRun = args.includes('dry');

  console.log('========================================');
  console.log('🧹 Retensi log aktivitas');
  console.log(`📆 Ambang: ${days} hari`);
  console.log(`🧪 Mode: ${dryRun ? 'dry-run (tidak menghapus)' : 'hapus'}`);
  console.log('========================================');

  try {
    const countResult = await pool.query(
      'SELECT COUNT(*) AS total FROM logs_activity WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
      [days]
    );

    const total = Number(countResult[0]?.total || 0);
    console.log(`📋 Baris yang akan dihapus: ${total}`);

    if (!dryRun && total > 0) {
      const deleteResult = await pool.query(
        'DELETE FROM logs_activity WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
        [days]
      );
      console.log(`✅ ${deleteResult.affectedRows} baris log dihapus.`);
    } else if (total === 0) {
      console.log('ℹ️  Tidak ada log yang perlu dibersihkan.');
    }
  } catch (err: any) {
    console.error('❌ Gagal membersihkan log:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

runPrune();
