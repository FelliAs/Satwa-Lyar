import { Connection } from 'mariadb';
import { formatAdminPublicId } from '../../utils/public-id';
import {
  checkConstraintExists,
  columnExists,
  indexExists,
  tableExists,
} from './helpers';

const CREATE_USERS = `
CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id   VARCHAR(32) NOT NULL COMMENT 'ID yang ditampilkan ke aplikasi: gst_xxxx atau adm_0001',
  name        VARCHAR(255) NULL,
  email       VARCHAR(255) NULL,
  password    VARCHAR(255) NULL COMMENT 'Hash bcrypt, hanya untuk admin',
  is_admin    TINYINT(1) NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_public_id (public_id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_is_admin (is_admin),
  CONSTRAINT chk_users_identity_fields CHECK (
    (
      is_admin = 1
      AND name IS NOT NULL
      AND TRIM(name) <> ''
      AND email IS NOT NULL
      AND TRIM(email) <> ''
      AND password IS NOT NULL
      AND password <> ''
    )
    OR
    (
      is_admin = 0
      AND name IS NULL
      AND email IS NULL
      AND password IS NULL
    )
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

const CREATE_ADMIN_COUNTERS = `
CREATE TABLE IF NOT EXISTS admin_counters (
  name       VARCHAR(32) NOT NULL,
  value      INT UNSIGNED NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

const CHECK_CONSTRAINT = `
ALTER TABLE users
  ADD CONSTRAINT chk_users_identity_fields CHECK (
    (
      is_admin = 1
      AND name IS NOT NULL
      AND TRIM(name) <> ''
      AND email IS NOT NULL
      AND TRIM(email) <> ''
      AND password IS NOT NULL
      AND password <> ''
    )
    OR
    (
      is_admin = 0
      AND name IS NULL
      AND email IS NULL
      AND password IS NULL
    )
  )
`;

/**
 * Migration 001 - Menyusun ulang tabel `users`:
 *  - menambah `public_id` (gst_ / adm_) dan `is_admin`
 *  - menghapus kolom `role`
 *  - mengubah name/email/password menjadi NULL-able untuk Guest
 *  - menambahkan CHECK constraint identitas
 *
 * Aman dijalankan pada database lama maupun database yang sudah baru.
 */
export const up = async (conn: Connection): Promise<void> => {
  await conn.query(CREATE_ADMIN_COUNTERS);

  const usersExists = await tableExists(conn, 'users');

  if (!usersExists) {
    await conn.query(CREATE_USERS);
    await conn.query(`INSERT IGNORE INTO admin_counters (name, value) VALUES ('admin', 0)`);
    return;
  }

  const hasLegacyRole = await columnExists(conn, 'users', 'role');

  if (hasLegacyRole) {
    // 1. Tambah kolom baru
    if (!(await columnExists(conn, 'users', 'is_admin'))) {
      await conn.query(
        'ALTER TABLE users ADD COLUMN is_admin TINYINT(1) NOT NULL DEFAULT 0 AFTER password'
      );
    }

    if (!(await columnExists(conn, 'users', 'public_id'))) {
      await conn.query(
        'ALTER TABLE users ADD COLUMN public_id VARCHAR(32) NULL AFTER id'
      );
    }

    // 2. Tandai admin lama
    await conn.query(`UPDATE users SET is_admin = 1 WHERE role = 'admin'`);

    // 3. Nomor public_id untuk admin lama, berurutan berdasarkan id
    const admins = (await conn.query(
      'SELECT id FROM users WHERE is_admin = 1 ORDER BY id ASC'
    )) as any[];

    for (let i = 0; i < admins.length; i++) {
      await conn.query('UPDATE users SET public_id = ? WHERE id = ?', [
        formatAdminPublicId(i + 1),
        admins[i].id,
      ]);
    }

    // 4. Public ID untuk identitas lama non-admin -> menjadi Guest
    await conn.query(
      `UPDATE users
       SET public_id = CONCAT('gst_m', LPAD(id, 12, '0'))
       WHERE is_admin = 0 AND (public_id IS NULL OR public_id = '')`
    );

    // 5. Guest tidak boleh memiliki nama/email/password
    await conn.query(
      `UPDATE users
       SET name = NULL, email = NULL, password = NULL
       WHERE is_admin = 0`
    );

    // 6. Kolom profil menjadi NULL-able dan public_id wajib
    await conn.query(
      `ALTER TABLE users
       MODIFY name VARCHAR(255) NULL,
       MODIFY email VARCHAR(255) NULL,
       MODIFY password VARCHAR(255) NULL,
       MODIFY public_id VARCHAR(32) NOT NULL`
    );

    // 7. Hapus kolom role lama
    await conn.query('ALTER TABLE users DROP COLUMN role');

    // 8. Sinkronkan penghitung nomor admin
    await conn.query(`INSERT IGNORE INTO admin_counters (name, value) VALUES ('admin', 0)`);
    await conn.query(
      `UPDATE admin_counters SET value = ? WHERE name = 'admin'`,
      [Math.max(admins.length, 0)]
    );
  }

  // 9. Pastikan indeks pendukung
  if (!(await indexExists(conn, 'users', 'uq_users_public_id'))) {
    await conn.query('ALTER TABLE users ADD UNIQUE KEY uq_users_public_id (public_id)');
  }

  if (!(await indexExists(conn, 'users', 'idx_users_is_admin'))) {
    await conn.query('ALTER TABLE users ADD KEY idx_users_is_admin (is_admin)');
  }

  // 10. Pastikan CHECK constraint identitas
  if (!(await checkConstraintExists(conn, 'users', 'chk_users_identity_fields'))) {
    await conn.query(CHECK_CONSTRAINT);
  }
};
