import { Connection } from 'mariadb';
import { formatAdminPublicId } from '../../utils/public-id';

/**
 * Mengalokasikan public_id admin berikutnya (adm_0001, adm_0002, ...).
 *
 * Penomoran dilakukan di dalam transaksi yang sama dengan pembuatan akun
 * sehingga nomor admin tetap berurutan meskipun banyak guest masuk bersamaan.
 */
export const allocateAdminPublicId = async (conn: Connection): Promise<string> => {
  await conn.query(
    `INSERT INTO admin_counters (name, value) VALUES ('admin', 1)
     ON DUPLICATE KEY UPDATE value = value + 1`
  );

  const rows = (await conn.query(
    `SELECT value FROM admin_counters WHERE name = 'admin' FOR UPDATE`
  )) as any[];

  let sequence = Number(rows[0]?.value || 1);

  // Pastikan nomor benar-benar belum dipakai (mis. admin dibuat manual).
  for (let attempt = 0; attempt < 100; attempt++) {
    const candidate = formatAdminPublicId(sequence);
    const existing = (await conn.query(
      'SELECT id FROM users WHERE public_id = ?',
      [candidate]
    )) as any[];

    if (!existing[0]) {
      await conn.query(
        `UPDATE admin_counters SET value = ? WHERE name = 'admin'`,
        [sequence]
      );
      return candidate;
    }

    sequence += 1;
  }

  throw new Error('Gagal mengalokasikan public_id admin.');
};
